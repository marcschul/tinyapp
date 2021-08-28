// Import packages / functions
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const generateRandomString = require('./server-functions');

// Server Set-up
const app = express();
const PORT = 8080;
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

// GET Requests
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"]
  }

  if (users[req.cookies["user_id"]] !== undefined) {
    templateVars.user = users[req.cookies["user_id"]].email
  }
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"],
    urls: urlDatabase
  };

  if (users[req.cookies["user_id"]] !== undefined) {
    templateVars.user = users[req.cookies["user_id"]].email
  }

  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  templateVars = {
    user: req.cookies["user_id"],
    urls: urlDatabase,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  }

  if (users[req.cookies["user_id"]] !== undefined) {
    templateVars.user = users[req.cookies["user_id"]].email
  }

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  templateVars = {
    user: req.cookies["user_id"]
  }

  if (users[req.cookies["user_id"]] !== undefined) {
    templateVars.user = users[req.cookies["user_id"]].email
  }
  
  res.render("urls_register", templateVars);
});

// POST Requests
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  const newLongURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const userID = 'user' + Object.keys(users).length + randomID;

  if (req.body.email === '' || req.body.password === '') {
    res.status(400)
    res.send(`
    <div style="text-align: center; padding: 3em">
    <h1>Error: 400</h1>
    <h3>Bad Request</h3>
    `)
  }

  if (users[userID] === undefined) {
    users[userID] = {
      id: randomID,
      email: req.body.email,
      password: req.body.password
    }
  } else {
    console.log('error: userID already taken');
    res.redirect("/urls");
  }

  res.cookie('user_id', userID);
  console.log('users = ', users);
  console.log('name="email" === ', req.body.email)
  res.redirect("/urls");
});
