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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Import and configure cors
const cors = require('cors');
app.use(cors());

let allowedOrigins = [
    'https://myflix-sw.netlify.app', 'https://kirkenstocks.github.io', 'http://localhost:1234', 'http://localhost:4200'
];

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

// Setting up passport for user authentication
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport.js');

// local database
// mongoose.connect('mongodb://127.0.0.1:27017/myFlixDB', {useNewUrlParser: true, useUnifiedTopology: true});

// remote database
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

/**
 * GET the welcome page
 * 
 * @function
 * @name getWelcomePage
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {string} - Returns a string response welcoming the user to the page.
 */
app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

/**
 * GET all movies in the database
 * 
 * @function
 * @name getAllMovies
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @throws {error} - If there is an error retrieving movies from the database.
 * @returns {object} - The JSON response containing all movies.
 */
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

/**
 * GET data for one movie by title
 * 
 * @function
 * @name getOneMovie
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {string} req.params.title - The title of the movie to retrieve.
 * @throws {error} - If there is an error retrieving movie data from the database.
 * @returns {object} - The JSON response containing the requested movie.
 */
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

/**
 * GET data for a genre by genre name
 * 
 * @function
 * @name getGenre
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {string} req.params.genreName - The name of the genre to retrieve data about.
 * @throws {error} - If there is an error retrieving data about the genre from the database.
 * @returns {object} - The JSON response containing the requested genre data.
 */
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

/**
 * GET data for a director by name
 * 
 * @function
 * @name getDirector
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {string} req.params.directorName - The name of the director to retrieve data about.
 * @throws {error} - If there is an error retrieving data about the director from the database.
 * @returns {object} - The JSON response containing the requested director data.
 */
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

/**
 * POST a new user account
 * 
 * @function
 * @name registerUser
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {string} req.body.Username - The username selected by the user.
 * @param {string} req.body.Password - The password selected by the user.
 * @param {string} req.body.Email - The email address provided by the user.
 * @param {string} req.body.Birthday - The birthday provided by the user.
 * @throws {error} - If there is an error creating the new user and adding them to the database.
 * @returns {object} - The JSON response containing the new user's data.
 */
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

/**
 * UPDATE the user's account
 * 
 * @function
 * @name updateUser
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {string} req.body.Username - The username selected by the user.
 * @param {string} req.body.Password - The password selected by the user.
 * @param {string} req.body.Email - The email address provided by the user.
 * @param {string} req.body.Birthday - The birthday provided by the user.
 * @throws {error} - If there is an error updating the user's account in the database.
 * @returns {object} - The JSON response containing the updated user data.
 */
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

/**
 * POST a movie to the user's list of favorite movies
 * 
 * @function
 * @name addFavoriteMovie
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {string} req.params.Username - The user's username.
 * @param {string} req.params.MovieID - The ID of the movie to be added to the favorites list.
 * @throws {error} - If there is an error adding the movie to the favorites list.
 * @returns {object} - The JSON response object containing the user's data updated with the movie added.
 */
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

/**
 * DELETE a movie from the user's list of favorite movies
 * 
 * @function
 * @name removeFavoriteMovie
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {string} req.params.Username - The user's username.
 * @param {string} req.params.MovieID - The ID of the movie to be removed from the favorites list.
 * @throws {error} - If there is an error removing the movie from the favorites list.
 * @returns {object} - The JSON response object containing the user's data updated with the movie removed.
 */
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

/**
 * DELETE a user's account
 * 
 * @function
 * @name deleteUser
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {object} req.user - The user object.
 * @param {string} req.user.Username - The user's username.
 * @throws {error} - If there is an error deleting the user from the database.
 * @returns {object} - The message indicating if the account deletion was successful.
 */
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