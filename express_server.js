// Import packages / functions
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { generateRandomString, 
  userCheckEmail,
  userCheckLogin,
  userCheckUserID,
  registerCheckBlank
} = require('./server-functions');

// Server Set-up
const app = express();
const PORT = 8080;
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Databases
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

// GET Requests
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/error", (req, res) => {
  res.render("urls_error");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"]
  }
  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"]
  }

  userCheckLogin(templateVars, users, req, res);
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"],
    urls: urlDatabase
  };
  
  userCheckLogin(templateVars, users, req, res);
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  templateVars = {
    user: req.cookies["user_id"],
    urls: urlDatabase,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  }

  userCheckLogin(templateVars, users, req, res);
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

  userCheckLogin(templateVars, users, req, res);
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
  console.log('users = ', users);
  if (userCheckEmail(users, false, req, res)) {
    for (const user in users){
      let bodyEmail = req.body.email;
      let bodyPassword = req.body.password;
      let userEmail = users[user].email;
      let userPassword = users[user].password;
      if (bodyEmail === userEmail && bodyPassword === userPassword) {
      res.cookie('user_id', req.body.email);
      res.redirect('/urls');
      };
    };
  };
  res.sendStatus(403);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const userID = 'user' + Object.keys(users).length + randomID;

  if (userCheckEmail(users, false, req, res)) {
    res.sendStatus(400);
  }

  userCheckUserID(users, userID, randomID, req, res);
  registerCheckBlank(req, res);

  res.cookie('user_id', userID);
  console.log(users);
  res.redirect("/urls");
});
