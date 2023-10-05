const crypto = require('crypto')
const assert = require('http-assert')

const express = require('express')
const router = express.Router()

const { User } = require('../utils/db/models')

router.get('/registration-inquiry', registrationInquiry)

module.exports = router

async function registrationInquiry(req, res, next) {
  const { nid } = req.body
  assert(nid, 400, 'invalid nid')

  const nidDigest = crypto.createHash('SHA1').update(nid).digest()
  const ip = req.ip

  const user = await User.findOne({
    where: {
      nid: nidDigest.toString('hex'),
    },
    order: [['createdAt', 'DESC']]
  })

  assert(user.ip === req.ip, 401)

  switch (user.registration_state) {
    case 'processing':
      return res.json({ message: 'در حال بررسی' })
    case 'accepted':
      return res.json({ message: `احراز هویت با موفقیت انجام شد، نام کاربری شما ${user.id} است` })
    case 'rejected':
      return res.json({ message: 'درخواست احراز هویت شما رد شده است، لطفا کمی بعد مجدد ا تلاش کنید' })
    default:
      res.status(500)
  }
}
