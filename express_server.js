const express = require("express");
const {getUserByEmail,
authenticateUser,urlsForUser,
 generateRandomString,urlDatabase, users} = require('./helpers/appHelpers')

const app = express();
const PORT = 8080; // default port 8080

const bcrypt = require('bcrypt');//for hashing the password
const bodyParser = require("body-parser"); // body-parser
const cookieSession = require('cookie-session') // cookie Session

app.set("view engine", "ejs");//  tells the Express app to use EJS as its templating engine


//Adding middleware to convert data into a readable-format
app.use(bodyParser.urlencoded({extended: true}));


//cookie session config
app.use(
  cookieSession({
    name: 'session',
    keys: [
      '8f232fc4-47de-41a1-a8cd-4f9323253715',
      '1279e050-24c2-4cc6-a176-3d03d66948a2',
    ],
  }),
);


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
  
  if(req.session["user_id"]){
    
    let userURLs = urlsForUser(req.session["user_id"]);
    
    let templateVars ={user_id : users[req.session["user_id"]], urls: userURLs};

    res.render("urls_index", templateVars);
  }

  else {
    let templateVars = {user_id:req.session["user_id"] }
    res.render("intro", templateVars);
  }

})

//Add a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  let templateVars ={user_id : users[req.session["user_id"]]};
  let id = users[req.session["user_id"]];
  if(!id) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars);
  }
  
});

app.get("/login",(req, res) => {
  let templateVars ={user_id : users[req.session["user_id"]]};
  res.render("login", templateVars);
});

//Add a Second Route and Template
app.get("/urls/:shortURL", (req, res) => {

  let userURLs = urlsForUser(req.session["user_id"]);
    let flag = true;
    for (let key in userURLs){
      if(key === req.params.shortURL){

        let templateVars ={user_id : users[req.session["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
        res.render("urls_show", templateVars);
        flag = false;
      }
    }
    if(flag) {
      res.send("<html><body><br><h1><b>Not Authorized!!!<h1></b><br></body></html>\n");
    }



  
});

//Add short url and redirect to long url
app.get("/u/:shortURL", (req, res) => {
  let flag = true;
  for (let key in urlDatabase){
    if (key === req.params.shortURL){
      flag = false;
      res.redirect(urlDatabase[req.params.shortURL].longURL);
    }
  }
    if(flag){
      res.send("<html><body><br><h1><b>Short URL Invalid!!!<h1></b><br></body></html>\n");
    }
});

// GET method route to view registration form
app.get("/register", (req, res) => {
  let templateVars ={user_id : users[req.session["user_id"]]};
  res.render("user_reg", templateVars);
})

//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  
  urlDatabase[shortURL] = {
    longURL : req.body.longURL,
    userID : req.session["user_id"]
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

app.get(
  "/urls/:shortURL/delete",(req, res) => {
    let userURLs = urlsForUser(req.session["user_id"]);
    let flag = true;
    for (let key in userURLs){
      if(key === req.params.shortURL){
        delete urlDatabase[req.params.shortURL];
        flag = false;
        res.redirect("/urls");
      }
    }
    if(flag) {
      res.send("<html><body><br><h1><b>Not Authorized!!!<h1></b><br></body></html>\n");
    }
   
  }
);



// POST request for login
app.post("/login",(req, res) => {
 
  const userId = authenticateUser(req.body.email, req.body.password);
  if(userId) {
   // res.cookie("user_id" , userId);
   req.session['user_id'] = userId;
    res.redirect('/urls'); 
  } else {
    res.status(403).send("Incorrect email or password");
  }
});


// Logout a user and clear cookie
app.post("/logout", (req, res) => {
 //res.clearCookie("user_id", req.session["user_id"]);
 req.session.user_id = null;
  res.redirect('/urls'); 
});

//Registration page POST method
//which saves the information entered by the user
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  //check if the email and password are not entered
  if(email === "" || password === "") {
    res.status(400).send("Enter valid email or password");
    return;
  }

  const user = getUserByEmail(email, users);
  // console.log(user);
  if (!user) {
    let user_id = generateRandomString();
    users[user_id] = {
      "id" : user_id,
      "email" : req.body.email,
      "password" : bcrypt.hashSync(req.body.password, 10) // hash password using bcrypt.hashSync
    };
 

    req.session.user_id = user_id;
    // setCookie with the user id
    //res.cookie('user_id', userId);
    res.redirect("/urls");
    
  } else {
    res.status(400).send('Sorry, the user is already registered');
  }
});
  
//Server listen on port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

