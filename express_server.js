
// For now you can place it in the outer-most (global) scope of your express_server.js file.
function generateRandomString() {
  var randomed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var result = '';
  for ( var i = 0; i < 6; i++ ) {
      result += randomed.charAt(Math.floor(Math.random() * randomed.length));
  }
  return result
}

function isEmailInUsers(email) {
  for (let userid of Object.keys(users)){
    if (users[userid]["email"] === email) {
      return true
    }
  }
  return false
}

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

app.post("/login", (req, res) => {    
  ////////////broke////////////////////
  res.cookie("username", req.body.username)
  res.redirect(`/urls`)
});

app.post("/logout", (req, res) => {    
  res.clearCookie("user_id")
  res.redirect(`/urls`)
});

app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]}

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (isEmailInUsers(req.body.email) || !req.body.email || !req.body.password){
    res.status(400).end()
  }
  else{
    const userID = generateRandomString()
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    }
    res.cookie("user_id", userID)
    console.log(users)
    res.redirect(`/urls`);       
  }
  
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});






