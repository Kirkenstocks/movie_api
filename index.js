const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(morgan('common'));

app.get('/', (req, res) => {
    res.send('Welcome to myFlix! It\'s like IMDB, but worse!');
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

