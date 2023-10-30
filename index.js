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

// Return data about a genre by genre name
app.get('/movies/genre/:genreName', async (req, res) => {
    await Movies.findOne({'Genre.Name': req.params.genreName})
        .then((movie) => {
            res.status(200).json(movie.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Return data about a director by name
app.get('/movies/director/:directorName', async (req, res) => {
    await Movies.findOne({'Director.Name': req.params.directorName})
        .then((movie) => {
            res.status(200).json(movie.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
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
        $addToSet: {FavoriteMovies: req.params.MovieID}
    },
    {new: true})
    .then((updatedUser) => {
        if (!updatedUser) {
            res.status(404).send('User not found');
        } else {
            res.json(updatedUser);
        } 
    })   
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Allow users to remove a movie from their list of favorites
app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
    await Users.findOneAndUpdate ({Username: req.params.Username}, {
        $pull: {FavoriteMovies: req.params.MovieID}
    },
    {new: true})
    .then((updatedUser) => {
        if (!updatedUser) {
            res.status(404).send('User not found');
        } else {
            res.json(updatedUser);
        } 
    })   
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Delete a user by username
app.delete('/users/:Username', async (req, res) => {
    await Users.findOneAndRemove({Username: req.params.Username})
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
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