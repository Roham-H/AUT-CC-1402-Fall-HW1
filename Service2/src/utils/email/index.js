const config = require('config')
const formData = require('form-data')
const Mailgun = require('mailgun.js')

const mailgun = new Mailgun(formData)

const mg = mailgun.client({
  username: config.MAILGUN.USER,
  key: config.MAILGUN.KEY,
})

module.exports = { send }

async function send({ from, to, subject, text }) {
  const mail = await mg.messages
    .create(config.MAILGUN.DOMAIN, {
      from: `Mailgun Sandbox <postmaster@${config.MAILGUN.DOMAIN}>`,
      to: [to],
      subject,
      text,
    })

  if (mail.status !== 200) throw new Error(mail.message)
  console.log('Email sent successfully to', to)
}
