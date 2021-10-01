
//exporting functions 1
function generateRandomString() {
  var randomed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var result = '';
  for ( var i = 0; i < 6; i++ ) {
      result += randomed.charAt(Math.floor(Math.random() * randomed.length));
  }
  return result
}

//exporting functions 2
// if the login is good, return a user id, else return null
function checkLoginAgainstDatabase(email, password = null) {
  // userid is our string valued key
  for (let userid of Object.keys(users)){
    if (users[userid]["email"] === email) {
      if (password === users[userid]["password"]){
        return (userid)
      }
      else{
        return null
      }
    }
  }
  return null
}
//exporting functions 3
function checkIfEmailOrPasswordEmpty(email, password){
  return (!email || !password)
}
function checkIfEmailExists(email){
  for (let userid of Object.keys(users)){
    if (users[userid]["email"] === email) {
      return true
    }
  }
  return false
}
//exporting functions end

// imports
const express = require("express");
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");

// app server
const app = express();// using variable "app" for express
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())


const PORT = 8080; // default port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// template
app.set("view engine", "ejs");


// databases
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// link.urls/
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]

  };
  res.render("urls_index", templateVars);
  
});

// above urls/:id's
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]){
    res.redirect(`/login`)
  }
  const templateVars = {user: users[req.cookies["user_id"]]}
  res.render("urls_new", templateVars);
});

// creating url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL
  // console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);       
  
});
// 
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});



app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`)
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  // refresh
  res.redirect(`/urls`)
});

// redirect link
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]){
    res.redirect(urlDatabase[req.params.shortURL]); 
  }
  else{
    const templateVars = {user: users[req.cookies["user_id"]]}
    res.render("u_not_found", templateVars);
  }
});

app.get("/login", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]}
  res.render("login", templateVars);
});

// login/logout
app.post("/login", (req, res) => {  
  const email = req.body.email
  const password = req.body.password
  const validCheck = checkLoginAgainstDatabase(email,password)

  if (!validCheck){
    res.status(403).send("incorrect login")
  }
  else{
    // validCheck === checkLoginAgainstDatabase's return of userID
    res.cookie("user_id", validCheck)
    console.log(validCheck)
    res.redirect(`/urls`)  
  }
});
app.post("/logout", (req, res) => {    
  res.clearCookie("user_id")
  res.redirect(`/urls`)
});
// login end

// register
app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]}

  res.render("register", templateVars);
});
app.post("/register", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const isEmailOrPasswordEmpty = checkIfEmailOrPasswordEmpty(email,password)
  if (isEmailOrPasswordEmpty){
    res.status(400).send("Email or Password is empty")
    return
  }
  else{
    const doesEmailExist = checkIfEmailExists(email)
    if (doesEmailExist){
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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});






