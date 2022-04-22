//helper functions to clean up express_server.js

//function to help validate users that can be called in each route
const getUserByEmail = function (email, users) {
  for (const user in users) {
    if (users[user].email === email)
  return user;
  }
};

//function to generate shortURL & user ID keys
const generateRandomString = function (n) {
  let randomString = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < n; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

const userURLs = function (ID, urlDatabase) {
  let result = {};
  for (const url in urlDatabase) {
    if (ID === urlDatabase[url].ID) {
      result[url] = urlDatabase[url]
    }
  }
  return result;
};


module.exports = { 
  getUserByEmail, 
  generateRandomString, 
  userURLs 
}