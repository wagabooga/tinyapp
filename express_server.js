
////////////////////////// imports //////////////////////////
const express = require("express");
const bodyParser = require("body-parser");
const { json } = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');

const {
  generateRandomString,
  checkLoginAgainstDatabase,
  checkIfEmailExists,
  checkIfEmailOrPasswordEmpty,
  isUserLoggedIn,
  getUrlsForUser,
  urlBelongsToUser
} = require(`./helpers.js`)

////////////////////////// imports end //////////////////////////
////////////////////////// databases //////////////////////////

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
////////////////////////// database end //////////////////////////
////////////////////////// app server ////////////////////////////
const app = express();// using variable "app" for express
app.use(bodyParser.urlencoded({ extended: true })); // bodyParser
app.use(cookieSession({// cookies
  name: 'session',
  keys: [`key1`, `key2`],
  maxAge: 24 * 60 * 60 * 1000 
}))
const PORT = 8080; // default port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
////////////////////////// app server end //////////////////////////
////////////////////////// databases //////////////////////////
////////////////////////// template //////////////////////////
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  if (isUserLoggedIn(req)){
    res.redirect("/urls")
  }
  else {
    res.redirect("/login")
  }
});
////////////////////////// login //////////////////////////
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] }
  res.render("login", templateVars);
});
app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const validCheck = checkLoginAgainstDatabase(email, password, users)

  if (!validCheck) {
    res.status(403).send("incorrect login")
  }
  else {
    // validCheck === checkLoginAgainstDatabase's return of userID
    // res.cookie("user_id", validCheck)
    req.session.user_id = validCheck
    res.redirect(`/urls`)
  }
});
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect('/login');
});
////////////////////////// register //////////////////////////
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] }

  res.render("register", templateVars);
});
app.post("/register", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const hashedPassword = bcrypt.hashSync(password, 10);
  const isEmailOrPasswordEmpty = checkIfEmailOrPasswordEmpty(email, password)
  if (isEmailOrPasswordEmpty) {
    res.status(400).send("Email or Password is empty")
    return
  }
  else {
    const doesEmailExist = checkIfEmailExists(email, users)
    if (doesEmailExist) {
      res.status(400).send("User with Email already exists")
      return
    }
    const userID = generateRandomString()
    users[userID] = {
      id: userID,
      email: email,
      password: hashedPassword
    }
    // res.cookie("user_id", userID)
    req.session.user_id = userID
    console.log(users)
    res.redirect(`/urls`);
  }
});

////////////////////////// /urls //////////////////////////
// get request to urls
app.get("/urls", (req, res) => {
  if (isUserLoggedIn(req)) {
    // decalare vars
    const user = users[req.session.user_id]
    const urlsForUser = getUrlsForUser(user["id"], urlDatabase)
    // our templateVars will only show the 130: log in's the table
    const templateVars = {
      // we need the keys of urlsForUser, we map with a cb that returns our  urlsForUser array with an object 
      urls: Object.keys(urlsForUser).map(key => {return [key, urlsForUser[key]]}),
      user,
      isUserLoggedInBool: true
    };
    res.render("urls_index", templateVars);
  }
  else {
    const templateVars = {user: null,urls: null,isUserLoggedInBool: false};
    res.render("urls_index", templateVars);
  }
});
app.post("/urls", (req, res) => {
  if (!isUserLoggedIn(req)) {
    res.status(403).send("user is not logged in ")
    return
  }
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect(`/urls/${shortURL}`);

});
////////////////////////// urls/new //////////////////////////
app.get("/urls/new", (req, res) => {
  if (isUserLoggedIn(req)){
    const templateVars = { user: users[req.session.user_id] }
    res.render("urls_new", templateVars);
  }
  else {
    res.redirect("/login")
  }

});

////////////////////////// u/:id //////////////////////////
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id]
  const paramsURLBelongsToUser = urlBelongsToUser(req.params.shortURL, user, urlDatabase)
  const urlExistsInDatabase = !!urlDatabase[req.params.shortURL]
  // logged in and user belongs
  if (isUserLoggedIn(req) && paramsURLBelongsToUser === true) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      user,
      isUserLoggedInBool: true,
      paramsURLBelongsToUser,
      urlExistsInDatabase
    };
    res.render("urls_show", templateVars);
  }
// the user is logged in but the url does not exist
  else if (isUserLoggedIn(req) && urlExistsInDatabase === false) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: null,
      user,
      isUserLoggedInBool: true,
      paramsURLBelongsToUser,
      urlExistsInDatabase
    };
    res.render("urls_show", templateVars)
  }
    // user is logged in but url does not belong
  else if (isUserLoggedIn(req)){
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      user,
      isUserLoggedInBool: true,
      paramsURLBelongsToUser,
      urlExistsInDatabase
    };
    res.render("urls_show", templateVars)
  }
  // else
  else {
    const templateVars = {
      shortURL: null,
      longURL: null,
      user: null,
      isUserLoggedInBool: false,
      paramsURLBelongsToUser,
      urlExistsInDatabase
    };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  urlDatabase[shortURL]["longURL"] = req.body.longURL
  res.redirect(`/urls`)
})

app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id]
  if (urlBelongsToUser(req.params.shortURL, user, urlDatabase) && isUserLoggedIn(req)) {
    delete urlDatabase[req.params.shortURL]
    res.redirect(`/urls`)
  }
  else {
    res.status(403).send("You dont have permissions to delete this link or you are not logged in.")
  }
  // refresh
});

// /u/:shortURL is an instant redirect link
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  if (urlDatabase[shortURL]) {
    res.redirect(urlDatabase[shortURL]["longURL"]);
  }
  else {
    const templateVars = { user: users[req.session.user_id] }
    res.render("u_not_found", templateVars);
  }
});










