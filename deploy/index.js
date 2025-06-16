const express = require('express');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT;

app.get('/', (req, res)=> {
    res.send('Hello, World! This is the deploy service.');
})

app.get('/twitter', (req, res) => {
    res.send("This is the Twitter deploy service.");
})

app.get('/login', (req, res) => {
    res.send("<h1>Login Page</h1><p>Please login at here</p>");
})

app.listen(port, () => {
    console.log(`Deploy service is running at http://localhost:${port}`);
});