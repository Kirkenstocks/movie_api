//Importing modules
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const {check, validationResult} = require('express-validator');
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

const app = express();

app.use(morgan('common'));

//which line should I keep out of the below 2 lines?
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Import and configure cors
const cors = require('cors');
app.use(cors());

let allowedOrigins = ['*'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback (null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
            return callback (new Error(message), false);
        }
        return callback (null, true);
    }
}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport.js');

// local database
// mongoose.connect('mongodb://127.0.0.1:27017/myFlixDB', {useNewUrlParser: true, useUnifiedTopology: true});

// remote database
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

//Welcome message
app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

//Return a list of all movies
app.get('/movies', passport.authenticate('jwt', {session: false}), async (req, res) => {
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
app.get('/users', passport.authenticate('jwt', {session: false}), async (req, res) => {
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
app.get('/movies/:title', passport.authenticate('jwt', {session: false}), async (req, res) => {
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
app.get('/movies/genre/:genreName', passport.authenticate('jwt', {session: false}), async (req, res) => {
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
app.get('/movies/director/:directorName', passport.authenticate('jwt', {session: false}), async (req, res) => {
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
app.post('/users', [
    check ('Username', 'Username is required').not().isEmpty(),
    check ('Username', 'Username must only contain alphanumeric characters.').isAlphanumeric(),
    check ('Password', 'Password must be at least 8 characters').isLength({ min: 8 }),
    check ('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    await Users.findOne({Username: req.body.Username})
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + ' already exists');
            } else {
                Users.create({
                    Username: req.body.Username,
                    Password: hashedPassword,
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
app.put('/users/:Username', [
    check ('Username', 'Username is required').not().isEmpty(),
    check ('Username', 'Username must only contain alphanumeric characters.').isAlphanumeric(),
    check ('Password', 'Password is required').not().isEmpty(),
    check ('Email', 'Email does not appear to be valid').isEmail()
],  
    passport.authenticate('jwt', {session: false}), async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    await Users.findOneAndUpdate({Username: req.params.Username}, {
        $set:
        {
            Username: req.body.Username,
            Password: hashedPassword,
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
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), async (req, res) => {
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
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), async (req, res) => {
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
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
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
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('myFlix is listening on Port ' + port);
});