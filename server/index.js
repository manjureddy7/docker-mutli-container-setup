const keys = require('./keys');

// Express App setup

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());


// Postgres Client setup

const { Pool } = require('pg');

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  password: keys.pgPassword,
  port: keys.pgPort,
  database: keys.pgDatabase
});

pgClient.on('error', () => console.log("PG Connection lost"));

// Create a table called values and store number in it
pgClient.query('CREATE TABLE IF NOT EXISTS values(number INT)')
  .catch(err => console.log(`Error while creating table in pgres ${err}`));


// REDIS CLIENT SETUP

const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();


// EXPRESS ROUTE HANDLERS

app.get('/', (req, res) => {
  res.send("Hi")
});

// Get all the values submitted
app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values');
  res.send(values.rows)
});

// Get all the previous submitted number and their values
app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  })
});

// Getting index from frontend
app.post('/values', async (req, res) => {

  const index = req.body.index;

  if (parseInt(index) > 40) {
    res.status(422).send('Sorry the number is too high! Try number less than 40')
  }

  redisClient.hset('values', index, 'Nothing Yet');

  //Publish event insert so that our worker will woke up
  redisPublisher.publish('insert', index);

  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({ working: true });

});


app.listen(5000, () => console.log("Backend is wokeup"))



