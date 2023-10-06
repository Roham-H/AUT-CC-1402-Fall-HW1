const config = require('config')
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')

const { BUCKET } = config.S3

module.exports = {
  getObject,
  putObject,
}

const s3 = new S3Client({
  region: 'default',
  endpoint: config.S3.ENDPOINT,
  credentials: {
      accessKeyId: config.S3.KEY,
      secretAccessKey: config.S3.SECRET,
  },
})

async function putObject(object) {
  const res = await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: object.key,
      Body: object.buffer
    })
  )
  return res
}

async function getObject(object) {
  const res = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: object.key,
    })
  )
  return res
}
