// Import packages / functions
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const { generateRandomString,
  userCheckEmail,
  userCheckLogin,
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

// right click browswer -> empty cache and hard reload -> seems to resolve the issue?
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL.startsWith('http://')) {
    res.redirect(303, longURL);
  } else {
    res.redirect('http://' + longURL);
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  
  res.render("urls_register", templateVars);
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
  for (const shortURL in urlDatabase) {
    if (users[req.cookies["user_id"]].id === urlDatabase[shortURL].userID) {
      const shortURLs = req.params.shortURL;
      urlDatabase[shortURLs] = {
        longURL: req.body.longURL,
        userID: users[req.cookies["user_id"]].id
      };
      return res.redirect('/urls');
    }
  }
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  for (const shortURL in urlDatabase) {
    if (users[req.cookies["user_id"]].id === urlDatabase[shortURL].userID) {
      delete urlDatabase[req.params.shortURL];
      res.redirect('/urls');
    }
  }
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const user = userCheckEmail(users, req.body.email);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const randomID = generateRandomString();

  if (userCheckEmail(users, req.body.email)) {
    return res.sendStatus(400);
  }

  registerCheckBlank(req, res);

  if (users[randomID] === undefined) {
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: hashedPassword
    };
  } else {
    console.log('error: userID already taken');
    res.redirect("/error");
  }

  res.cookie('user_id', randomID);
  res.redirect("/urls");
});
