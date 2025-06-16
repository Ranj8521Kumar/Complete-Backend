import express from 'express';

const app = express();

const port =  process.env.PORT||3000;

app.use(express.static('dist'));//serve static files from the 'dist' directory


// app.get('/', (req, res) => {
//   res.send('Hello, World!');
// });

// get a list of five jokes

app.get('/api/jokes', (req, res) => {
  const jokes = [{
    "id": 1,
    "joke": "Why did the chicken cross the road? To get to the other side!"
  },
  {
    "id": 2,
    "joke": "Why don't scientists trust atoms? Because they make up everything!"
  },
  {
    "id": 3,
    "joke": "Why did the scarecrow win an award? Because he was outstanding in his field!"
  },
  {
    "id": 4,
    "joke": "What do you call fake spaghetti? An impasta!"
  },
  {
    "id": 5,
    "joke": "Why did the bicycle fall over? Because it was two-tired!"
  },
  {
    "id": 6,
    "joke": "What do you call cheese that isn't yours? Nacho cheese!"
  }];

  res.json(jokes);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});