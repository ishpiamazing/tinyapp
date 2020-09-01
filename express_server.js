const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser') // cookie parser 

app.set("view engine", "ejs");//  tells the Express app to use EJS as its templating engine



//Adding middleware to convert data into human readable-form
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

//Generate a Random ShortURL
function generateRandomString() {
  const id = Math.random().toString(36).substring(2,8);
  return id;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Addding a route for /urls
app.get("/urls", (req, res) => {
  let templateVars = {username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
})

//Add a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

//Adding a Second Route and Template
app.get("/urls/:shortURL", (req, res) => {
  
  let templateVars = {username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL; 
  res.redirect(`/urls/${shortURL}`);
  
});

//Adding short url and redirecting to long url
app.get("/u/:shortURL", (req, res) => {
  
  res.redirect(`${urlDatabase[req.params.shortURL]}`);
});

//updating urls
app.post("/urls/:id", (req, res)=> {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect("/urls");
})

// deleting short url's
app.post("/urls/:shortURL/delete",(req, res) => {

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})


// POST request which contains "Set-Cookie" in the header
app.post("/login",(req, res) => {
  console.log(req.body.username)
res.cookie("username", req.body.username);
res.redirect("/urls")
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


