// Generates a random alphaNumeric 6 character string
const generateRandomString = function () {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Checks if user's email is already in database
const userCheckEmail = function (users, result, req, res) {
  for (const user in users) {
    if (req.body.email === users[user].email) {
      result = true;
    }
  }
  return result;
}

// Checks if user is logged in, if so, display user's email in header
const userCheckLogin = function (result, users, req, res) {
  if (users[req.cookies["user_id"]] === undefined) {
    // true if user is not logged in
  result = true;
  }
  return result;
};

// Checks if user's ID is already in database when registering a user
const userCheckUserID = function (users, userID, randomID, req, res) {
  if (users[userID] === undefined) {
    users[userID] = {
      id: randomID,
      email: req.body.email,
      password: req.body.password
    }
  } else {
    console.log('error: userID already taken');
    res.redirect("/error");
  }
};

// Checks if either email or password fields are blank
const registerCheckBlank = function(req, res) {
  if (req.body.email === '' || req.body.password === '') {
    res.sendStatus(400);
  }
};

module.exports = {
  generateRandomString,
  userCheckEmail,
  userCheckLogin,
  userCheckUserID,
  registerCheckBlank
};