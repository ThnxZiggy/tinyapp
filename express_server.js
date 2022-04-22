const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const { response } = require('express');
app.use(bodyParser.urlencoded({ extended: true }));
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
//app.use(cookieParser());
app.use(
  cookieSession({
    name: 'session',
    keys: ["hello this is my key, pls work"]
  }));
const bcrypt = require('bcryptjs');


const generateRandomString = function (n) {
  let randomString = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < n; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

const userObject = function (userID2, urlDatabase) {
  let result = {};
  for (const url in urlDatabase) {
    console.log(urlDatabase[url].userID)
    if (userID2 === urlDatabase[url].userID) {
      console.log("success")
      result[url] = urlDatabase[url]
    }
  }
  return result;
};

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
}


app.set('view engine', 'ejs')

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


app.get('/', (request, response) => {
  response.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get('/urls', (req, res) => {
  const id = req.cookies['user_id']

  if (!id) {
    return res.redirect('/login')
  }

  const user = users[id]
  const templateVars = {
    urls: userObject(id, urlDatabase),
    user: user
  };

  res.render('urls_index', templateVars);

});

app.get("/urls/new", (req, res) => {
  const id = req.cookies['user_id']

  if (!id) {
    res.redirect('/login')
  }

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: userObject(id, urlDatabase),
    user: users[id]
  }

  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const id = req.cookies['user_id']

  if (!id) {
    return res.redirect('/login')
  } 
  
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("Short URL does not exist")
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
})


app.post("/urls", (req, res) => {
  const id = req.cookies['user_id']
  if (!id) {
    return res.redirect('/login');
  }
  const user = users[id]

  if (!user) {
    return res.status(403).json({ error: "Please login to access this endpoint" })

  }
  //get the long URL from request
  const longURL = req.body.longURL
  //generate short URL
  const shortURL = generateRandomString(6);
  //set shortURLlongURL pair into database
  urlDatabase[shortURL] = { longURL, userID: id }
  res.redirect(`/urls/${shortURL}`);

})

app.get('/u/:shortURL', (req, res) => {
  const { longURL } = urlDatabase[req.params.shortURL] || {}
  if (!longURL) {
    return res.status(404).send(`<html><body>This short URL does not exist</body></html>`)
  }
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const deleteURL = req.params.shortURL
  if (!urlDatabase[deleteURL]) {
    return res.status(404).send(`<html><URL doesn't exist</body></html>`)
  }

  else if (urlDatabase[deleteURL].userID !== req.cookies["user_id"]) {
    return res.status(404).send(`<html><Permission Denied</body></html>`)
  }
  
  delete urlDatabase[deleteURL]
  res.redirect("/urls")
  
})

// app.get("/urls/:shortURL", (req, res) => {
//   const shortURLID = req.params.shortURL
//   const id = req.cookies['user_id']

//   if (!id) {
//     return res.redirect('/login')
//     } 

//   res.redirect(`/urls/${shortURLID}`)
// })

app.post('/urls/:shortURL', (req, res) => {
  const editshortURLID = req.params.shortURL
  res.redirect("/urls")
})

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  }
  res.render('login', templateVars)
})

app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('Both fields cannot be empty')
  }
  for (const user in users) {
    let passwordCompare = bcrypt.compareSync(password, users[user].hashedPassword)
    if (users[user].email === email && passwordCompare) {
      res.cookie("user_id", users[user].id)
      return res.redirect('/urls')
    }
  }

  res.status(403).send('incorrect email or password')
  // res.cookie("user_id", users[id].id)

})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id",)
  res.redirect('/login')
})

app.get("/register", (req, res) => {
  const templateVars = {
    user: null
  }
  res.render("registrationPage", templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    return res.status(400).send('Both fields cannot be empty')
  }
  for (const user in users) {
    if (users[user].email === email) {
      return res.send("email already exists")
    }
  }
  const id = generateRandomString(8);
  users[id] = { id, email, hashedPassword }
  res.cookie("user_id", id)
  console.log(users);
  res.redirect('/urls')

})

// app.get('/login', (req, res) => {
//   res.render('login')
// })






// app.get('/login', (req, res) => {
//   res.render('login')
// })

// app.post('/login', (req, res) => {
// //loop through user object
// //if givenEmail == the curernt user i'm looping through then i found the right user
// for (let userKey in users) {
//   console.log(userKey)
//   console.log(user[userkey])
// //if found, i will "authenticate them"
// //use for in for object
//  if(users[userkey].email === givenEmail) {
//    //i found the right user
//    console.log('you are authenticated')
//    res.send('you are authenticated')
//    //return res.send to avoid errors
//  }
// }
//   res.redirect("/urls");
// })