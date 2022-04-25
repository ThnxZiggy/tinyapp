const express = require('express');
const app = express();
const PORT = 8080; // ---default set to 8080 but change port as required to run this on your machine
const bodyParser = require('body-parser');
const { response } = require('express');
app.use(bodyParser.urlencoded({ extended: true }));
const cookieSession = require('cookie-session');
app.use(
  cookieSession({
    name: 'session',
    keys: ["hello this is my key, pls work"]
  }));
const bcrypt = require('bcryptjs');
const { getUserByEmail, generateRandomString, userURLs } = require('./helpers.js');
app.set('view engine', 'ejs');

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});

//User database with included default users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
    hashedPassword: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
    hashedPassword: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

//default URL's assigned to first user in user database
const urlDatabase = {
  'b2xBn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'userRandomID'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'userRandomID'
  }
};

//redirect to login page
app.get('/', (request, response) => {
  response.redirect('/login');
});


app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});


app.get('/urls', (req, res) => {
  const id = req.session['userID'];

  if (!id) {
    return res.redirect('/login');
  }
 
  const user = users[id];
  const templateVars = {
    urls: userURLs(id, urlDatabase),
    user: user
  };

  res.render('urls_index', templateVars);

});

app.post("/urls", (req, res) => {
  const id = req.session['userID'];
 
  if (!id) {
    return res.redirect('/login');
  }
  const user = users[id];

  if (!user) {
    return res.status(403).json({ error: "Please login to access this endpoint" });

  }
  //get the long URL from request
  const longURL = req.body.longURL;
  //generate short URL
  const shortURL = generateRandomString(6);
  //set shortURLlongURL pair into database
  urlDatabase[shortURL] = { longURL, userID: id };
  res.redirect(`/urls/${shortURL}`);

});

//create new shortURL
app.get("/urls/new", (req, res) => {
  const id = req.session['userID'];

  if (!id) {
    res.redirect('/login');
  }

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: userURLs(id, urlDatabase),
    user: users[id]
  };

  res.render('urls_new', templateVars);
});


app.get('/urls/:shortURL', (req, res) => {
  const id = req.session['userID'];
  const editshortURLID = req.params.shortURL;
  if (!id) {
    return res.redirect('/login');
  }

  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("Short URL does not exist");
  }

  if (urlDatabase[editshortURLID] && urlDatabase[editshortURLID].userID === req.session.userID) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session["userID"]]
    };
    return res.render("urls_show", templateVars);
  }
  
  return res.status(403).send(`<html><Access not allowed.</body></html>`);

});

app.post('/urls/:shortURL', (req, res) => {
  const editshortURLID = req.params.shortURL;
  const id = req.session['userID'];
 
  const newlongURL = req.body.longURL;
  urlDatabase[editshortURLID] = {
    longURL: newlongURL,
    userID: id };
  return res.redirect("/urls");
 
});


//shortURL link for redirecting
app.get('/u/:shortURL', (req, res) => {
  const { longURL } = urlDatabase[req.params.shortURL] || {};
  if (!longURL) {
    return res.status(404).send(`<html><body>This short URL does not exist</body></html>`);
  }
  res.redirect(longURL);
});

//delete a shortURL from your URL index
app.post('/urls/:shortURL/delete', (req, res) => {
  const deleteURL = req.params.shortURL;

  if (!urlDatabase[deleteURL]) {
    return res.status(404).send(`<html><URL doesn't exist</body></html>`);
  }

  if (!req.session.userID) {
    return res.status(403).send(`<html><Permission Denied</body></html>`);
  }
    

  if (urlDatabase[deleteURL] && urlDatabase[deleteURL].userID === req.session.userID) {
    delete urlDatabase[deleteURL];
    return res.redirect("/urls");
  }
  return res.status(404).send(`<html><This URL does not belong to you</body></html>`);
});


//Register route logic and generate cookie
app.get("/register", (req, res) => {
  const templateVars = {
    user: null
  };
  res.render("registrationPage", templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    return res.status(400).send('Both fields cannot be empty');
  }
  if (getUserByEmail(email, users)) {
    return res.send("email already exists");
  }

  const id = generateRandomString(8);
  users[id] = { id, email, hashedPassword };
  req.session['userID'] = id;

  res.redirect('/urls');

});


//Login route logic and set cookie
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session['userID']],
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = getUserByEmail(email, users);

  if (!email || !password) {
    return res.status(400).send('Both fields cannot be empty');
  }
  if (user) {
    console.log(user);
    let passwordCompare = bcrypt.compareSync(password, users[user].hashedPassword);
    if (passwordCompare) {
      req.session['userID'] = users[user].id;
      return res.redirect('/urls');
    }
  }
  
  res.status(403).send('incorrect email or password');

});

//Log user out and delete cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});



