const config = require('config')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const { BUCKET } = config.S3

module.exports = {
  putObject
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
}
