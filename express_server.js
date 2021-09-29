
// For now you can place it in the outer-most (global) scope of your express_server.js file.
function generateRandomString() {
  var randomed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var result = '';
  for ( var i = 0; i < 6; i++ ) {
      result += randomed.charAt(Math.floor(Math.random() * randomed.length));
  }
  return result
}



// express
const express = require("express");
const app = express();// using variable "app" for express

// bodyParser
const bodyParser = require("body-parser");
// app.use(express.urlencoded({extended: true}))
app.use(bodyParser.urlencoded({extended: true}));

// server
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// above urls/:id's
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// redirect link
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]); 
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});






