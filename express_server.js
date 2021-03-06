// Import packages / functions
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { generateRandomString,
  userCheckLogin,
  checkBlankFields,
  urlsForUser,
  getUserByEmail
} = require('./helpers');

// Server Set-up
const app = express();
const PORT = 8080;
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set("view engine", "ejs");
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Databases
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// test account password: secret321
const users = {
  ruI7iW: {
    id: 'ruI7iW',
    email: 'test@email.com',
    password: '$2b$10$00xL1bQTw5JwtdD0X5OFT.oheqRyd45FD.dxLUrddJKLBWHb9c27W'
  }
};

// GET Requests
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };

  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };

  if (userCheckLogin(users, req)) {
    return res.redirect("/login");
  }

  return res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const userURLs = {};
  if (req.session.user_id !== undefined) {
    urlsForUser(users, urlDatabase, userURLs, req);
  }

  const templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase,
    users: users,
    req: req,
    userURLs: userURLs
  };

  res.render("urls_index", templateVars);
});

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
    user: users[req.session.user_id]
  };
  
  res.render("urls_register", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  const shortURLuser = urlDatabase[req.params.shortURL].userID;

  if (req.session.user_id !== shortURLuser) {
    res.status(401).send(`
    <h1>Error: 401</h1>
    <h2>invalid authentication</h2>
    `);
  } else {
    res.render("urls_show", templateVars);
  }
});

// POST Requests
app.post("/urls", (req, res) => {

  if (!req.session.user_id) {
    return res.status(401).send(`
    <h1>Error: 401</h1>
    <h2>invalid authentication</h2>
    `);
  }

  const shortURL = generateRandomString();
  
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: users[req.session.user_id].id
  };
  
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const urlDatabaseID = urlDatabase[shortURL].userID

  if (userID === urlDatabaseID) {
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    return res.redirect('/urls');
  }

  return res.status(401).send(`
  <h1>Error: 401</h1>
  <h2>Unauthorized client error</h2>
  `);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  for (const shortURL in urlDatabase) {
    if (users[req.session.user_id].id === urlDatabase[shortURL].userID) {
      delete urlDatabase[req.params.shortURL];
      return res.redirect('/urls');
    }
  }
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  
  if (checkBlankFields(req)) {
    return res.status(401).send(`
    <h1>Error: 401</h1>
    <h2>blank user or email</h2>
    `);
  };

  const email = req.body.email;
  const user = getUserByEmail(email, users);
  const passwordCheck = bcrypt.compareSync(req.body.password, users[user].password);
  if ((user) && passwordCheck) {
    req.session.user_id = users[user].id;
    return res.redirect('/urls');
  }

  return res.status(403).send(`
  <h1>Error: 403</h1>
  <h2>Invalid User or Password</h2>
  `);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post("/register", (req, res) => {

  if (checkBlankFields(req)) {
    return res.status(401).send(`
    <h1>Error: 401</h1>
    <h2>blank user or email</h2>
    `);
  };

  const randomID = generateRandomString();
  const email = req.body.email;
  const user = getUserByEmail(email, users);

  if (user) {
    return res.status(409).send(`
    <h1>Error: 409</h1>
    <h2>Email already taken</h2>
    `);
  }

  if (users[randomID] === undefined) {
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: hashedPassword
    };
  }
  req.session.user_id = randomID;
  res.redirect("/urls");
});