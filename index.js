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

app.use(express.static('public'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Uh oh, looks like something broke!');
});

app.listen(8080, () => {
    console.log('myFlix is listening on port 8080.');
});

