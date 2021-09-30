
// For now you can place it in the outer-most (global) scope of your express_server.js file.
function generateRandomString() {
  var randomed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var result = '';
  for ( var i = 0; i < 6; i++ ) {
      result += randomed.charAt(Math.floor(Math.random() * randomed.length));
  }
  return result
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


//database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// link.urls/
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]

  };
  res.render("urls_index", templateVars);
  
});

// above urls/:id's
app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]}
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
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
    const templateVars = {username: req.cookies["username"]}
    res.render("u_not_found", templateVars);
  }
});

app.post("/login", (req, res) => {    
  res.cookie("username", req.body.username)
  res.redirect(`/urls`)
});

app.post("/logout", (req, res) => {    
  res.clearCookie("username")
  res.redirect(`/urls`)
});

app.get("/register", (req, res) => {
  const templateVars = {username: req.cookies["username"]}
  res.render("register", templateVars);
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});






