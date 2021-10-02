
// imports//
const express = require("express");
const bodyParser = require("body-parser");
const { json } = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session')
// imports end //


//exporting functions //
function generateRandomString() {
  const randomed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (var i = 0; i < 6; i++) {
    result += randomed.charAt(Math.floor(Math.random() * randomed.length));
  }
  return result
}
// if the login is good, return a user id, else return null
function checkLoginAgainstDatabase(email, password = null) {
  const user = getUserByEmail(email, users)
  if (bcrypt.compareSync(password, user["password"])) {
    return (user.id)
  }
  else {
    return null
  }
}

function getUserByEmail(email, database) {
  for (let userid of Object.keys(database)) {
    if (database[userid]["email"] === email) {
      return database[userid]
    }
  }
  return null
}
function checkIfEmailOrPasswordEmpty(email, password) {
  return (!email || !password)
}
function checkIfEmailExists(email) {
  if (getUserByEmail(email, users)){
    return true
  }
  return false
}
function isUserLoggedIn(req) {
  if (req.session.user_id) {
    return true
  }
  return false
}
function getUrlsForUser(userID) {
  let urlsForUser = {}
  for (let key of Object.keys(urlDatabase)) {
    if (urlDatabase[key]["userID"] === userID) {
      urlsForUser[key] = { ...urlDatabase[key] }
    }
  }
  return urlsForUser
}
function urlBelongsToUser(paramsShortURL, user) {
  let urlBelongsToUser = false

  // see if url belogns to user
  if (user) { // this is because the user must exist to have urlbelongtouser === true
    for (let shortURL of Object.keys(getUrlsForUser(user.id))) {
      if (shortURL === paramsShortURL) {
        urlBelongsToUser = true
      }
    }
  }
  return urlBelongsToUser
}
//exporting functions end//


// app server //
const app = express();// using variable "app" for express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: [`key1`, `key2`],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
const PORT = 8080; // default port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
// app server end //


// template // 
app.set("view engine", "ejs");
// template end // 


// databases // 
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
// database end //


// /urls //
app.get("/urls", (req, res) => {
  if (isUserLoggedIn(req)) {
    const user = users[req.session.user_id]
    const urlsForUser = getUrlsForUser(user["id"])
    const templateVars = {
      urls: Object.keys(urlsForUser).map(key => {
        return [key, urlsForUser[key]]
      }),
      user,
      isUserLoggedIn: true
    };
    res.render("urls_index", templateVars);
  }
  else {
    const templateVars = {
      user: null,
      urls: null,
      isUserLoggedIn: false
    };
    res.render("urls_index", templateVars);
  }
});
app.post("/urls", (req, res) => {
  if (!isUserLoggedIn(req)) {
    res.status(403).send("user is not logged in ")
  }
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect(`/urls/${shortURL}`);

});
// /urls end //


// urls/new //
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] }
  res.render("urls_new", templateVars);
});
// urls/new end //


// u/:id //
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id]
  const paramsURLBelongsToUser = urlBelongsToUser(req.params.shortURL, user)
  // logged in and user belongs
  if (isUserLoggedIn(req) && paramsURLBelongsToUser === true) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      user,
      isUserLoggedIn: true,
      paramsURLBelongsToUser
    };
    res.render("urls_show", templateVars);
  }
  // user is logged in but url does not belong
  else if (isUserLoggedIn(req)) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      user,
      isUserLoggedIn: true,
      paramsURLBelongsToUser
    };
    res.render("urls_show", templateVars)
  }
  // else
  else {
    const templateVars = {
      shortURL: null,
      longURL: null,
      user: null,
      isUserLoggedIn: false,
      paramsURLBelongsToUser
    };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  urlDatabase[shortURL]["longURL"] = req.body.longURL
  res.redirect(`/urls`)
})

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

// u/:id delete //
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id]
  if (urlBelongsToUser(req.params.shortURL, user) && isUserLoggedIn(req)) {
    delete urlDatabase[req.params.shortURL]
    res.redirect(`/urls`)
  }
  else {
    res.status(403).send("You dont have permissions to delete this link or you are not logged in.")
  }
  // refresh
});
// u/:id delete end //

// u/:id end //




// login//
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] }
  res.render("login", templateVars);
});
app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const validCheck = checkLoginAgainstDatabase(email, password)

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

// logout //
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect('/login');
});
// logout end//

// login end//

// register//
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
    const doesEmailExist = checkIfEmailExists(email)
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
// register end







