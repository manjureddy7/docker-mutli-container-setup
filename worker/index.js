const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  // Retry redis for every second if disconnects
  retry_strategy: () => 1000
});

const sub = redisClient.duplicate();

function fib(index) {

  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2)
}

// Check whenever redis recieves numbers
sub.on('message', (channel, message) => {
  // Create a hashset called values whose key is message and value is fib(message)
  redisClient.hset('values', message, fib(parseInt(message)))
});

// Subscribe to any insert event
sub.subscribe('insert');