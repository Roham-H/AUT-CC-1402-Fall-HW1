const config = require('config')

const got = require('got')
const FormData = require('form-data')

const baseURL = config.IMAGGA.ENDPOINT

module.exports = {
  getFaces,
  checkFacesSimilarity,
}

async function getFaces(image) {
  const body = new FormData()
  body.append('image', Buffer.from(image))
  body.append('return_face_id', 1)
  const response = await got.post(baseURL + '/faces/detections',
    {
      body,
      username: config.IMAGGA.KEY,
      password: config.IMAGGA.SECRET,
    }
  ).json()
    .catch(e => {
      console.error(e.response?.body || e)
      throw e.response?.body || e
    })
  console.log('Get faces API result:')
  console.log(response)
  return response.result?.faces
}

async function checkFacesSimilarity(faceId1, faceId2) {
  const url = baseURL + `/faces/similarity?face_id=${faceId1}&second_face_id=${faceId2}`
  const response = await got(url, { username: config.IMAGGA.KEY, password: config.IMAGGA.SECRET })
    .json()
    .catch (e => {
      console.error(e.response.body)
      throw e.response?.body || e
    })
  console.log('Check similarity API result:')
  console.log(response)
  return response.result
}
