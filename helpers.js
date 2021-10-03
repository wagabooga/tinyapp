const bcrypt = require('bcryptjs');


function getUserByEmail(email, usersDatabase) {
  // we want to loop through our userid is (6 letter string)  
  for (let userid of Object.keys(usersDatabase)) {
    // 
    if (usersDatabase[userid]["email"] === email) {
      return usersDatabase[userid]
    }
  }
  return null
}


function generateRandomString() {
  const randomed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (var i = 0; i < 6; i++) {
    result += randomed.charAt(Math.floor(Math.random() * randomed.length));
  }
  return result
}


// this email is used to check password
// we use password null here because we only want to use crypt the password if password was given
function checkLoginAgainstDatabase(email, password = null, usersDatabase) {
  const user = getUserByEmail(email, usersDatabase)
  if (bcrypt.compareSync(password, user["password"])) {
    return (user.id)
  }
  else {
    return null
  }
}


// this function uses the database to find our userid by email
// find the user (user = {}) variable by email, compares from database being user itself
function checkIfEmailOrPasswordEmpty(email, password) {
  return (!email || !password)
}


function checkIfEmailExists(email, usersDatabase) {
  if (getUserByEmail(email, usersDatabase)){
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


function getUrlsForUser(userID, urlDatabase) {
  let urlsForUser = {}
// we need to access to all users
// we check our userID for {1!2@3#}[key][userID] // key is going through database
// we copy it into urlsForUser object we create
  for (let key of Object.keys(urlDatabase)) {
    if (urlDatabase[key]["userID"] === userID) {
      urlsForUser[key] = { ...urlDatabase[key] }
    }
  }
  return urlsForUser
}


function urlBelongsToUser(paramsShortURL, user, urlDatabase) {
  let urlBelongsToUser = false
  // see if url belogns to user
  if (user) { // this is because the user must exist to have urlbelongtouser === true
    for (let shortURL of Object.keys(getUrlsForUser(user.id, urlDatabase))) {
      if (shortURL === paramsShortURL) {
        urlBelongsToUser = true
      }
    }
  }
  return urlBelongsToUser
}

module.exports = {
  generateRandomString,
  getUserByEmail,
  checkLoginAgainstDatabase,
  checkIfEmailExists,
  checkIfEmailOrPasswordEmpty,
  isUserLoggedIn,
  getUrlsForUser,
  urlBelongsToUser
}
