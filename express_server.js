// Import packages / functions
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { generateRandomString,
  userCheckEmail,
  userCheckLogin,
  userCheckUserID,
  registerCheckBlank,
  urlsForUser
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
  //shortURL {longURL: URL, userID: ID}
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
    user: users[req.cookies["user_id"]]
  };

  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };

  if (userCheckLogin(false, users, req, res)) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls", (req, res) => {
  const userURLs = {};
  if (req.cookies["user_id"] !== undefined) {
    urlsForUser(users, urlDatabase, userURLs, req);
  }

  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
    users: users,
    req: req,
    userURLs: userURLs
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };

  if (userCheckLogin(false, users, req, res)) {
    res.redirect("/login");
  } else {
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };

  res.render("urls_register", templateVars);
});

// POST Requests
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: users[req.cookies["user_id"]].id
  };

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: users[req.cookies["user_id"]].id
  };

  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  if (userCheckEmail(users, false, req, res)) {
    for (const user in users) {
      let bodyEmail = req.body.email;
      let userEmail = users[user].email;
      let bodyPassword = req.body.password;
      let userPassword = users[user].password;
      if (bodyEmail === userEmail && bodyPassword === userPassword) {
        res.cookie('user_id', user);
        res.redirect('/urls');
      }
    }
  }
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
  res.redirect("/urls");
});
