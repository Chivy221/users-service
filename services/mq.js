const EventEmitter = require('events');
const emitter = new EventEmitter();

async function connectMQ() {
  console.log('ℹ️ Using in-memory queue');
}

function sendToQueue(message) {
  emitter.emit('message', message);
}

function onMessage(listener) {
  emitter.on('message', listener);
}

module.exports = { connectMQ, sendToQueue, onMessage };
