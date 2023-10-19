const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

let users = [
    {
        id: 1,
        name: 'Bob',
        favoriteMovies: []
    },
    {
        id: 2,
        name: 'Kim',
        favoriteMovies: ['Spaceballs']
    }
];

let movies = [
    {
        title: 'Star Wars: The Phantom Menace',
        year: 1999,
        director: 'George Lucas',
        genre: 'science-fiction'
    },
    {
        title: 'Star Wars: The Clone Wars',
        year: 2002,
        director: 'George Lucas',
        genre: 'science-fiction'
    },
    {
        title: 'Star Wars: Revenge of the Sith',
        year: 2005,
        director: 'George Lucas',
        genre: 'science-fiction'
    },
    {
        title: 'Star Wars: A New Hope',
        year: 1977,
        director: 'George Lucas',
        genre: 'science-fiction'
    },
    {
        title: 'Star Wars: The Empire Strikes Back',
        year: 1980,
        director: 'Irvin Kershner',
        genre: 'science-fiction'
    },
    {
        title: 'Star Wars: Return of the Jedi',
        year: 1983,
        director: 'Richard Marquand',
        genre: 'science-fiction'
    },
    {
        title: 'Star Wars: The Force Awakens',
        year: 2015,
        director: 'J.J. Abrams',
        genre: 'science-fiction'
    },
    {
        title: 'Star Wars: The Last Jedi',
        year: 2017,
        director: 'Rian Johnson',
        genre: 'science-fiction'
    },
    {
        title: 'Star Wars: The Rise of Skywalker',
        year: 2019,
        director: 'J.J. Abrams',
        genre: 'science-fiction'
    },
    {
        title: 'Spaceballs',
        year: 1987,
        director: 'Mel Brooks',
        genre: 'comedy'
    }
];

//Return a list of all movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
})

//Return data for a movie by title
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movie => movie.title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('No such movie');
    }
});

//Return data about a genre by name/title
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.genre === genreName).genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('No such genre');
    }
});

//Return data about a director by name
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.director === directorName).director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('No such director');
    }
});

//     res.send('Welcome to myFlix! It\'s like IMDB, but worse!');
// });

// app.get('/movies', (req, res) => {
//     res.json(topMovies);
// });

// app.use(express.static('public'));

// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send('Uh oh, looks like something broke!');
// });


// Array used for ex 2.4
// let topMovies = [
//     {
//         title: 'Star Wars: The Phantom Menace',
//         year: 1999,
//         director: 'George Lucas'
//     },
//     {
//         title: 'Star Wars: The Clone Wars',
//         year: 2002,
//         director: 'George Lucas'
//     },
//     {
//         title: 'Star Wars: Revenge of the Sith',
//         year: 2005,
//         director: 'George Lucas'
//     },
//     {
//         title: 'Star Wars: A New Hope',
//         year: 1977,
//         director: 'George Lucas'
//     },
//     {
//         title: 'Star Wars: The Empire Strikes Back',
//         year: 1980,
//         director: 'Irvin Kershner'
//     },
//     {
//         title: 'Star Wars: Return of the Jedi',
//         year: 1983,
//         director: 'Richard Marquand'
//     },
//     {
//         title: 'Star Wars: The Force Awakens',
//         year: 2015,
//         director: 'J.J. Abrams'
//     },
//     {
//         title: 'Star Wars: The Last Jedi',
//         year: 2017,
//         director: 'Rian Johnson'
//     },
//     {
//         title: 'Star Wars: The Rise of Skywalker',
//         year: 2019,
//         director: 'J.J. Abrams'
//     },
//     {
//         title: 'Spaceballs',
//         year: 1987,
//         director: 'Mel Brooks'
//     }
// ];