const config = require('config')
const crypto = require('crypto')
const assert = require('http-assert')

const express = require('express')
const router = express.Router()

const { User } = require('../utils/db/models')
const s3 = require('../utils/s3')
const amqp = require('../utils/amqp')

router.post('/register', register)

module.exports = router

async function register(req, res, next) {
  const { email, name, nid, img1, img2 } = req.body

  assert(email, 400, 'invalid email')
  assert(name, 400, 'invalid name')
  assert(nid, 400, 'invalid nid')
  assert(img1, 400, 'invalid img1')
  assert(img2, 400, 'invalid img2')

  const ip = req.ip
  const nidDigest = crypto.createHash('SHA1').update(nid).digest()

  const prevUser = await User.findOne({
    where: {
      nid: nidDigest.toString('hex'),
      registration_state: 'processing'
    }
  })
  assert(!prevUser, 400, 'شما درخواست احراز هویت بررسی نشده دارید')

  const user = await User.create({
    email,
    name,
    nid: nidDigest.toString('hex'),
    ip,
    image1: 'img1',
    image2: 'img2',
    registration_state: 'processing'
  })

  const img1Obj = {
    key: `${user.id}_img1`,
    buffer: Buffer.from(img1, 'base64')
  }
  const img2Obj = {
    key: `${user.id}_img2`,
    buffer: Buffer.from(img2, 'base64')
  }

  await Promise.all([
    s3.putObject(img1Obj),
    s3.putObject(img2Obj),
  ])

  const enqueueResult = await amqp.enqueue({ data: Buffer.from(user.id) })

  res.json({ message: 'درخواست احراز هویت شما ثبت شد' })
}
