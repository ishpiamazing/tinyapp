const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser"); // body-parser
const cookieParser = require('cookie-parser'); // cookie parser 

app.set("view engine", "ejs");//  tells the Express app to use EJS as its templating engine


//Adding middleware to convert data into a readable-format

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//object containing short url as key and long url as value
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//object containing user details
const users = { 
  abc123: {
    id: "abc123", 
    email: "abc@example.com", 
    password: "purple-monkey-dinosaur"
  },
  cde456: {
    id: "cde456", 
    email: "cde@example.com", 
    password: "dishwasher-funk"
  }
}

//Generate a Random ShortURL
function generateRandomString() {
  const id = Math.random().toString(36).substring(2,8);
  return id;
}



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Add a route for /urls
app.get("/urls", (req, res) => {
  let templateVars ={user_id : users[req.cookies["user_id"]], urls: urlDatabase};
  //let templateVars = {username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
})

//Add a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  let templateVars ={user_id : users[req.cookies["user_id"]]};
  //let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

//Add a Second Route and Template
app.get("/urls/:shortURL", (req, res) => {
  let templateVars ={user_id : users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  //let templateVars = {username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

//Add short url and redirect to long url
app.get("/u/:shortURL", (req, res) => {
  
  res.redirect(`${urlDatabase[req.params.shortURL]}`);
});

// GET method route to view registration form
app.get("/register", (req, res) => {
  let templateVars ={user_id : users[req.cookies["user_id"]]};
  //let templateVars ={user_id : req.cookies["user_id"]};
  // console.log(templateVars)
  res.render("user_reg", templateVars);
})

//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL; 
  res.redirect(`/urls/${shortURL}`);
  
});




//update urls
app.post("/urls/:id", (req, res)=> {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect("/urls");
})

// delete short url's
app.post("/urls/:shortURL/delete",(req, res) => {

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});




// POST request which contains the login username
app.post("/login",(req, res) => {
  
  res.cookie("username", req.body.username);
  res.redirect("/urls")
});

//logout username code
app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.cookies["user_id"]);
  //res.clearCookie('username',req.cookies["username"]);
  res.redirect("/urls");
});

//Registration page POST method
//which saves the information entered by the user
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  //check if the email and password are not entered
  if(email === "" || password === "") {
    res.sendStatus(400);
    return;
  }
  //checking whether the email exists earlier 
  for(let user in users) {
    if(users[user].email === req.body.email) {
      res.sendStatus(400);
      return;
    }
    let user_id = generateRandomString();
    req.cookies.user_id = user_id;
    user_id = req.cookies.user_id;
    users[user_id] = {
      "id" : user_id,
      "email" : req.body.email,
      "password" : req.body.password
    };
   
    }
    res.cookie("user_id", req.cookies.user_id);
    res.redirect("/urls");   
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


