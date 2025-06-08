const amqp = require('amqplib');

let channel;

async function connectMQ() {
try {
const connection = await amqp.connect(process.env.RABBITMQ_URL);
channel = await connection.createChannel();
await channel.assertQueue(process.env.RABBITMQ_QUEUE, { durable: true });
console.log('✅ Connected to RabbitMQ');
} catch (err) {
console.error('❌ MQ connection failed:', err.message);
}
}

function sendToQueue(message) {
if (!channel) {
console.error('❌ Cannot send, channel not initialized');
return;
}
channel.sendToQueue(process.env.RABBITMQ_QUEUE, Buffer.from(JSON.stringify(message)), {
persistent: true
});
}

module.exports = { connectMQ, sendToQueue };
