const config = require('config')

const sequelize = require('./utils/db/connection')
const { User } = require('./utils/db/models')
const amqp = require('./utils/amqp')
const s3 = require('./utils/s3')

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

    if (!user) {
      console.log('invalid id received')
      return
    }
    console.log(user.id + '_' + user.image1)
    console.log(user.id + '_' + user.image2)

    const images = await Promise.all([
      s3.getObject({ key: user.id + '_' + user.image1 }).then(res => res.Body.transformToByteArray()),
      s3.getObject({ key: user.id + '_' + user.image2 }).then(res => res.Body.transformToByteArray()),
    ])
    console.log(images)

    amqp.channel.ack(msg)
  })
})
