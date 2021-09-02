const bcrypt = require('bcrypt');

// Generates a random alphaNumeric 6 character string
const generateRandomString = function() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Checks if user's email is already in database
const userCheckEmail = function(users, email) {
  for (const user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return null;
};

// Checks if user is logged in, if user is logged in returns false.
const userCheckLogin = function(result, users, req) {
  if (users[req.session.user_id] === undefined) {
    // true if user is not logged in
    result = true;
  }
  return result;
};

// Checks if either email or password fields are blank
const registerCheckBlank = function(req, res) {
  if (req.body.email === '' || req.body.password === '') {
    res.sendStatus(400);
  }
};

// Checks if user id and URLid is the same, if so, update userID database and urLDatabase
const urlsForUser = function(users, urlDatabase, userURLs, req) {
  for (const shortURL in urlDatabase) {
    if (users[req.session.user_id].id === urlDatabase[shortURL].userID) {
      userURLs[shortURL] = {
        longURL: urlDatabase[shortURL].longURL,
        userID: users[req.session.user_id].id
      };
      urlDatabase[shortURL] = {
        longURL: urlDatabase[shortURL].longURL,
        userID: users[req.session.user_id].id
      };
    }
  }
};

module.exports = {
  generateRandomString,
  userCheckEmail,
  userCheckLogin,
  registerCheckBlank,
  urlsForUser
};