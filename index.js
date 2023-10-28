//Importing modules
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://127.0.0.1:27017/myFlixDB', {useNewUrlParser: true, useUnifiedTopology: true});

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

//Welcome message
app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

//Return a list of all movies
app.get('/movies', async (req, res) => {
    await Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Return a list of all users
app.get('/users', async (req, res) => {
    await Users.find()
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Return data about a genre by name/title
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.genre === genreName).genre;
//Return data for a movie by title
app.get('/movies/:title', async (req, res) => {
    await Movies.findOne({Title: req.params.title})
        .then ((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

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

//Register new users
app.post('/users', async (req, res) => {
    await Users.findOne({Username: req.body.Username})
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + ' already exists');
            } else {
                Users.create({
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                })
                .then((user) => {res.status(201).json(user)})
                .catch((error) => {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// Allow users to update their data by username
app.put('/users/:Username', async (req, res) => {
    await Users.findOneAndUpdate({Username: req.params.Username}, {$set:
    {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
    }
},
{new: true})
    .then ((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    })
});

// Allow users to add a movie to their list of favorites
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
    await Users.findOneAndUpdate ({Username: req.params.Username}, {
        $push: {FavoriteMovies: req.params.MovieID}
    },
    {new: true})
        .then ((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Allow users to remove a movie from their list of favorites
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if (user && user.favoriteMovies.includes(movieTitle)) {
        user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s list of favorite movies.`);
    } else {
        res.status(400).send(`${movieTitle} could not be removed from user ${id}'s list of favorite movies.`);
    }
});

// Allow users to deregister
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        users = users.filter(user => user.id != id);
        res.status(200).send(`User ${id} has been deleted`);
    } else {
        res.status(400).send('No such user');
    }
});

// Server port setup
app.listen(8080, () => {
    console.log('myFlix is listening on port 8080.');
});

// Previously used code
// app.get('/', (req, res) => {
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