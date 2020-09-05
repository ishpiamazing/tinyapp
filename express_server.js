const express = require("express");
const { getUserByEmail,
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


//-----------------GET METHODS----------------------------------------------------------------------//

//home page
app.get("/", (req, res) => {
  if (req.session.user_id)
    res.redirect("/urls");
  else
    res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Add a route for /urls
app.get("/urls", (req, res) => {
  let userURLs = urlsForUser(req.session["user_id"]);
  let templateVars = {user_id : users[req.session["user_id"]], urls: userURLs};
  
  if(req.session["user_id"]){
    res.render("urls_index", templateVars);
  } else {
    res.render("intro", templateVars);
  }

})

//Add a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  let templateVars ={user_id : users[req.session["user_id"]]};
  let id = users[req.session["user_id"]];
  if(!id) {
    res.redirect("/login"); 
  } else {
    res.render("urls_new", templateVars); 
  }
  
});

app.get("/login",(req, res) => {
  let templateVars ={user_id : users[req.session["user_id"]]};

  if(req.session.user_id) {
    res.redirect("/urls");
  } else {
  res.render("login", templateVars);
  } 
});

//Add a Second Route and Template

app.get("/urls/:shortURL", (req, res) => {
  
  let templateVars ={user_id : users[req.session["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  
  if (req.session.user_id) {
    if (req.session.user_id === (urlDatabase[req.params.shortURL].userID)) {
      res.render("urls_show", templateVars);
      return;
    } else {
      res.redirect("/urls");
      return;
    }
  }
    res.send('You need to <a href="/login">log in</a> to see your shortened URLs.<br> If you do not have an account, you can <a href="/register">Register here.'); 
});


//Add short url and redirect to long url
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

// GET method route to view registration form
app.get("/register", (req, res) => {
  let templateVars ={user_id : users[req.session["user_id"]]};
  if(req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("user_reg", templateVars);
  } 
})

// get method to handle delete request
app.get("/urls/:shortURL/delete",(req, res) => {
  let templateVars ={user_id : users[req.session["user_id"]]};
  if(req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
  } else {
    res.send("You are not authorized to delete");
  } 
})

//----------------------------POST methods-------------------------------------------------// 

//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  
  if (req.session.user_id) {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL : req.body.longURL,
    userID : req.session["user_id"]
  };
  res.redirect(`/urls/${shortURL}`);
  
} else {
  res.send('You need to <a href="/login">LogIn</a> to create new URL.<br> If you do not have an account, you can <a href="/register">Register here.</a>');
  
}
});


//update urls
app.post("/urls/:shortURL", (req, res) => {
  let userLinks = urlsForUser(req.session.user_id);
  let id = req.params.shortURL;
    if (userLinks[id]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.send("You are not authorized to edit this. Please <a href='/login'>Login first. <br> If you do not have an account, you can <a href='/register'>Register here.</a>");
  }
});

// delete short url's
app.post("/urls/:shortURL/delete", (req, res) => {
  let userLinks = urlsForUser(req.session.user_id);
  let id = req.params.shortURL;
  
  if (userLinks[id]) {
    delete urlDatabase[id];
    res.redirect('/urls');
  } else {
    res.send("You are not authorized to delete this.  <a href='/urls'>Back to Previous Page.<br> If you do not have an account, you can <a href='/register'>Register here.</a>");
  }
});

// POST request for login
app.post("/login",(req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Please enter email and password to proceed.Please try again.<br><a href='/login'>Login Here.");
  }
  const userId = authenticateUser(req.body.email, req.body.password);
  if(userId) {
    req.session['user_id'] = userId;
    res.redirect('/urls'); 
  } else {
    res.status(403).send("Incorrect email or password");
  }
});


// Logout a user and clear cookie
app.post("/logout", (req, res) => {
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
    res.status(400).send("<br><b><h4>Please enter the email and password again. No field should be empty and the email should be valid. </h4></b> <br><br><a href='/register'>Register Here");
    return;
  }
  const user = getUserByEmail(email, users);
  if (!user) {
    let user_id = generateRandomString();
    users[user_id] = {
      "id" : user_id,
      "email" : req.body.email,
      "password" : bcrypt.hashSync(req.body.password, 10) // hash password using bcrypt.hashSync
    };
    req.session.user_id = user_id;
    res.redirect("/urls");
    } else {
    res.status(400).send("<br><b><h4>Sorry, the email already exists.</h4></b> <br><br><a href='/register'>Register Here.");
  }
});
  
//Server listen on port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

