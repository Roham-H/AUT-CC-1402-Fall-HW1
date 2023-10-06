const config = require('config')
const amqp = require('amqplib')

let channel

const queue = 'tasks';
async function connect() {
  const conn = await amqp.connect(config.AMQP.URI)
  channel = await conn.createChannel()
  await channel.assertQueue(queue)
}

Object.defineProperty(module.exports, 'channel', { get() { return channel } })
module.exports.connect = connect
module.exports.queue = queue
