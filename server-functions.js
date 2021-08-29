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
const userCheckEmail = function (users, req, res) {
  for (const user in users) {
    if (req.body.email === users[user].email) {
      res.status(400);
      res.redirect('/error');
    }
  }
}

// Checks if user is logged in, if so, display user's email in header
const userCheckLogin = function (templateVars, users, req, res) {
  if (users[req.cookies["user_id"]] !== undefined) {
  templateVars.user = users[req.cookies["user_id"]].email
  }
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

module.exports = {
  generateRandomString,
  userCheckEmail,
  userCheckLogin,
  userCheckUserID
};