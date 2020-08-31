const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() {

  const id = Math.random().toString(36).substring(2,8);
}


//  tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Adding middleware to convert data into human readable-form
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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
  let templateVars = {urls: urlDatabase };
  res.render("urls_index", templateVars);
})

//Add a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Adding a Second Route and Template
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});