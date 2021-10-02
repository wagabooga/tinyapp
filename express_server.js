
// imports//
const express = require("express");
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
// imports end //


//exporting functions //
function generateRandomString() {
  var randomed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var result = '';
  for (var i = 0; i < 6; i++) {
    result += randomed.charAt(Math.floor(Math.random() * randomed.length));
  }
  return result
}
// if the login is good, return a user id, else return null
function checkLoginAgainstDatabase(email, password = null) {
  // userid is our string valued key
  for (let userid of Object.keys(users)) {
    if (users[userid]["email"] === email) {
      if (password === users[userid]["password"]) {
        return (userid)
      }
      else {
        return null
      }
    }
  }
  return null
}
function checkIfEmailOrPasswordEmpty(email, password) {
  return (!email || !password)
}
function checkIfEmailExists(email) {
  for (let userid of Object.keys(users)) {
    if (users[userid]["email"] === email) {
      return true
    }
  }
  return false
}
function isUserLoggedIn(req){
  if (req.cookies["user_id"]){
    return true
  }
  return false
}
function getUrlsForUser(userID){
  let urlsForUser = []
  for (let value of Object.values(urlDatabase)){
    if (value["userID"] === userID){
      urlsForUser.push(value["longURL"])
    }
  }
  return urlsForUser
}
//exporting functions end//


// app server //
const app = express();// using variable "app" for express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

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
  if (isUserLoggedIn(req)){
    const user = users[req.cookies["user_id"]]
    const templateVars = {
      urls: getUrlsForUser(user["id"]),
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
    userID: req.cookies["user_id"]
  } 
  res.redirect(`/urls/${shortURL}`);

});
// /urls end //


// urls/new //
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] }
  res.render("urls_new", templateVars);
});
// urls/new end //


// u/:id //
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"] };
  res.render("urls_show", templateVars);
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
    const templateVars = { user: users[req.cookies["user_id"]] }
    res.render("u_not_found", templateVars);
  }
});

// u/:id delete //
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  // refresh
  res.redirect(`/urls`)
});
// u/:id delete end //

// u/:id end //




// login//
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] }
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
    res.cookie("user_id", validCheck)
    console.log(validCheck)
    res.redirect(`/urls`)
  }
});

// logout //
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect(`/login`)
});
// logout end//

// login end//

// register//
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] }

  res.render("register", templateVars);
});
app.post("/register", (req, res) => {
  const email = req.body.email
  const password = req.body.password
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
      password: password
    }
    res.cookie("user_id", userID)
    console.log(users)
    res.redirect(`/urls`);
  }
});
// register end







