# myFlix Movie_API

## Description
This API provides users with access to a movie database that contains information about a small selection of movies, as well as their genre and director. Users can create an account and keep a list of their favorite movies found in the database.

## Endpoints

### Get All Movies
- HTTP method: GET/READ
- URL: `/movies`
- Request body: None
- Response body: A JSON object containing all movies.

### Get One Movie
- HTTP method: GET/READ
- URL: `/movies/:Title`
- Request body: None
- Response body: A JSON object containing data about the requested movie, including title, release year, description, director, and genre.

### Get Genre Data
- HTTP method: GET/READ
- URL: `/movies/genre/:genreName`
- Request body: None
- Response body: A JSON object containing data about the requested genre, including name and description.

### Get Director Data
- HTTP method: GET/READ
- URL: `/movies/director/:directorName`
- Request body: None
- Response body: A JSON object containing data about the requested director, including name, bio, birth year, and death year.

### Create New User
- HTTP method: POST/CREATE
- URL: `/users`
- Request body: A JSON object containing the user's data, including username, password, email, and birthday. Username, password, and email are required for successful registration. Username must only contain alphanumeric characters, password must be at least 8 characters, and email must be in a valid email format.
- Response body: A JSON object containing the user's data.

### Update User Account
- PUT/UPDATE
- URL: `/users/:Username`
- Request body: A JSON object containing the user's data. Requirements are the same as the endpoint for creating a user account.
- Response body: A JSON object containing the user's updated data.

### Add Favorite Movie
- POST/CREATE
- URL: `/users/:Username/movies/:MovieID`
- Request body: None
- Response body: A JSON object containing the user's updated data.

### Delete Favorite Movie
- DELETE
- URL: `/users/:Username/movies/:MovieID`
- Request body: None
- Response body: A JSON object containing the user's updated data.

### Delete User Account
- DELETE
- URL: `/users/:Username`
- Request body: None
- Response body: A string message indicating if the account deletion was successful.

## Technologies Used
- Node.js
- Express.js
- MongoDB and Mongoose
- Bcrypt
- Body-parser
- CORS
- JSON web token
- Passport
- Postman
- Uuid

## Getting Started
1. Clone repository to your local device
2. Run the command `npm install` to install dependencies
3. Start the server with the command `npm start`. Alternatively, you can use the command `npm run dev` to utilize nodemon for development mode.

Another option is to use the live backend hosted on [Render](https://myflixapi-3voc.onrender.com/).

## License
This project is licensed under an ISC license.

## Credits
All data was sourced from IMDB and Wikipedia.
This project was built for the CareerFoundry Full-Stack Web Development program, with their instruction essential to its completion.