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
  "b2xVn2": { longURL :"http://www.lighthouselabs.ca", userID : "abc123"},
  "9sm5xK": { longURL :"http://www.google.com", userID : "cde456"}
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



  const getUserByEmail = function(email) {
    for (let user in users) {
      if (users[user].email === email) {
        return users[user];
      }
    }
    return false;
  };


// Check for correct login credential
const authenticateUser = (email, password) => {
  // Does the user with that email exist?
  const user = getUserByEmail(email);

  // check the email and passord match
  if (user && user.password === password) {
    return user.id;
  } else {
    return false;
  }
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

// Add a route for /urls
app.get("/urls", (req, res) => {
  let templateVars ={user_id : users[req.cookies["user_id"]], urls: urlDatabase};
  console.log(urlDatabase);
  console.log(users);
  res.render("urls_index", templateVars);
})

//Add a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  let templateVars ={user_id : users[req.cookies["user_id"]]};
  let id = users[req.cookies["user_id"]];
  if(!id) {
    res.redirect("/login")
  }else {
    res.render("urls_new", templateVars);
  }
  
});

app.get("/login",(req, res) => {
  let templateVars ={user_id : users[req.cookies["user_id"]]};
  res.render("login", templateVars);
});

//Add a Second Route and Template
app.get("/urls/:shortURL", (req, res) => {
  let templateVars ={user_id : users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};

  res.render("urls_show", templateVars);
});

//Add short url and redirect to long url
app.get("/u/:shortURL", (req, res) => {
  console.log(urlDatabase[req.params.shortURL.longURL])
  // res.redirect(`${urlDatabase[req.params.shortURL]}`);
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// GET method route to view registration form
app.get("/register", (req, res) => {
  let templateVars ={user_id : users[req.cookies["user_id"]]};
  res.render("user_reg", templateVars);
})

//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  // let user_id = req.cookie["user_id"];
  //urlDatabase[shortURL] = req.body.longURL; 
  console.log("********");
  // console.log(req.body.longURL);
  // console.log(req.session);
  console.log(req.cookies["user_id"]);
  // console.log(user_id);
  console.log("********");
  urlDatabase[shortURL] = {
    longURL : req.body.longURL,
    userID : req.cookies["user_id"]
  }
  res.redirect(`/urls/${shortURL}`);
  
});




//update urls
app.post("/urls/:id", (req, res)=> {
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect("/urls");
})

// delete short url's
app.post("/urls/:shortURL/delete",(req, res) => {

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});




// POST request for login
app.post("/login",(req, res) => {
 
  const userId = authenticateUser(req.body.email, req.body.password);
  if(userId) {
    res.cookie("user_id" , userId);
    res.redirect('/urls'); 
  } else {
    res.status(403).send("Incorrect email or password");
  }
});


// Logout a user and clear cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.cookies["user_id"]);
  res.redirect('/urls'); 
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
  }
    let user_id = generateRandomString();
    req.cookies.user_id = user_id;
    user_id = req.cookies.user_id;
    users[user_id] = {
      "id" : user_id,
      "email" : req.body.email,
      "password" : req.body.password
    };
    res.cookie("user_id", req.cookies.user_id);
    res.redirect("/urls");   
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});