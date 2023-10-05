const config = require('config')
const amqp = require('amqplib')

let senderChannel

const defaultQueue = 'tasks';
(async () => {
  const conn = await amqp.connect(config.AMQP.URI)
  senderChannel = await conn.createChannel()
})()

async function enqueue({ queue = defaultQueue, data }) {
  return senderChannel.sendToQueue(queue, data)
}

Object.defineProperty(module.exports, 'senderChannel', { get() { return senderChannel } })
module.exports.enqueue = enqueue
