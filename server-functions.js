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
const userCheck = function (users, req, res) {
  console.log('yep');
  for (const user in users) {
    console.log('prop = ', users[user].email)
    if (req.body.email === users[user].email) {
      res.status(400);
      res.redirect('/error');
    }
  }
}

module.exports = {
  generateRandomString,
  userCheck
};