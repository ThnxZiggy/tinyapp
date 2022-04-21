const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const { response } = require('express');
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser')
app.use(cookieParser());


const generateRandomString = function (n) {
  let randomString = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < n; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}

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


app.set('view engine', 'ejs')

const urlDatabase = {
  'b2xBn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
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
  const user = users[id]
  console.log('first ID:', id)
  console.log('users object: ', users)
  console.log('users[ID :', users[id])
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  }  
  res.render("urls_new", templateVars);

  });

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
})

// app.post("/urls", (req, res) => {
//   console.log(req.body);
//   res.send('OK');
// })

app.post("/urls", (req, res) => {
  //get the long URL from request
  const longURL = req.body.longURL
  //generate short URL
  const shortURL = generateRandomString(6);
  //set shortURLlongURL pair into database
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls/${shortURL}`);
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  console.log('long URL: ', longURL)
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const deleteURL = req.params.shortURL
  console.log(urlDatabase[deleteURL])
  delete urlDatabase[deleteURL]
  res.redirect("/urls")
})

app.get("/urls/:shortURL", (req, res) => {
  const shortURLID = req.params.shortURL

  res.redirect(`/urls/${shortURLID}`)
})

app.post('/urls/:shortURL', (req, res) => {
  const editshortURLID = req.params.shortURL
  console.log('this is the short URL : ', editshortURLID);
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
    if (users[user].email === email && users[user].password === password){
      res.cookie("user_id", users[user].id)
      return res.redirect('/urls')
    } 
  }

  res.send('incorrect email or password')
 // res.cookie("user_id", users[id].id)
  
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id",)
  res.redirect('/urls')
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
  if (!email || !password) {
    return res.status(400).send('Both fields cannot be empty')
  }
  for (const user in users) {
    if (users[user].email === email) {
      return res.send("email already exists")
    }
  }
  const id = generateRandomString(8);
  users[id] = { id, email, password }
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