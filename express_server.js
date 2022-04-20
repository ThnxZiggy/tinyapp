const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const { response } = require('express');
app.use(bodyParser.urlencoded({extended: true}));


const generateRandomString = function(n) {
  let randomString           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for ( let i = 0; i < n; i++ ) {
    randomString += characters.charAt(Math.floor(Math.random()*characters.length));
 }
 return randomString;
}


app.set ('view engine', 'ejs')

const urlDatabase = {
  'b2xBn2': 'http://www.lighthouselabs.ca',
  '9sm5xK' : 'http://www.google.com'
};

app.get('/', (request, response) => {
  response.send('hello');
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
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] };
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