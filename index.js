const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

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

let topMovies = [
    {
        title: 'Star Wars: The Phantom Menace',
        year: 1999,
        director: 'George Lucas'
    },
    {
        title: 'Star Wars: The Clone Wars',
        year: 2002,
        director: 'George Lucas'
    },
    {
        title: 'Star Wars: Revenge of the Sith',
        year: 2005,
        director: 'George Lucas'
    },
    {
        title: 'Star Wars: A New Hope',
        year: 1977,
        director: 'George Lucas'
    },
    {
        title: 'Star Wars: The Empire Strikes Back',
        year: 1980,
        director: 'Irvin Kershner'
    },
    {
        title: 'Star Wars: Return of the Jedi',
        year: 1983,
        director: 'Richard Marquand'
    },
    {
        title: 'Star Wars: The Force Awakens',
        year: 2015,
        director: 'J.J. Abrams'
    },
    {
        title: 'Star Wars: The Last Jedi',
        year: 2017,
        director: 'Rian Johnson'
    },
    {
        title: 'Star Wars: The Rise of Skywalker',
        year: 2019,
        director: 'J.J. Abrams'
    },
    {
        title: 'Spaceballs',
        year: 1987,
        director: 'Mel Brooks'
    }
];