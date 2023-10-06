const config = require('config')

const s3 = require('./utils/s3')
const amqp = require('./utils/amqp')
const faceMatcher = require('./utils/face-matcher')

const { User } = require('./utils/db/models')

amqp.connect().then(function processMessages(){
  console.log('AMQP connection successful')
  amqp.channel.consume(amqp.queue, async msg => {
    if (msg == null) {
      console.log('Consumer cancelled by server')
      return
    }

    const id = msg.content.toString()
    console.log('Recieved:', id)

    const user = await User.findOne({
      where: { id },
      order: [['createdAt', 'DESC']]
    })

    if (!user || user.registration_state !== 'processing') {
      console.log('invalid id received')
      return
    }

    const images = await Promise.all([
      s3.getObject({ key: user.id + '_' + user.image1 })
        .then(res => res.Body.transformToByteArray()),
      s3.getObject({ key: user.id + '_' + user.image2 })
        .then(res => res.Body.transformToByteArray()),
    ])

    let imagesFaces
    try {
      imagesFaces = await Promise.all([
        faceMatcher.getFaces(images[0]),
        faceMatcher.getFaces(images[1])
      ])
    } catch (e) {
      console.log(e)
      return
    }

    const imagesHaveFace =
      imagesFaces
      .every(imageFaces => imageFaces
        ?.some(face => face.confidence > 80)
      )

    if (!imagesHaveFace) {
      // await User.update({ registration_state: 'rejected' }, { where: { id } })
      user.registration_state = 'rejected'
      user.registration_description = 'رد به دلیل عدم وجود چهره'
      await user.save()
      return amqp.channel.ack(msg)
    }

    const { score } = await faceMatcher.checkFacesSimilarity(
      imagesFaces[0]?.[0]?.face_id,
      imagesFaces[1]?.[0]?.face_id
    )

    if (score < 80) {
      user.registration_state = 'rejected'
      user.registration_description = 'رد به دلیل عدم شباهت'
    } else user.registration_state = 'accepted'

    await user.save()
    amqp.channel.ack(msg)
  })
})
