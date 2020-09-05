const bcrypt = require('bcrypt');

//----------------DATABASES-----------------------------------------------//


// object containing short url as key and long url as value
const urlDatabase = {
  "b2xVn2": { longURL :"http://www.lighthouselabs.ca", userID : "abc123"},
  "9sm5xK": { longURL :"http://www.google.com", userID : "cde456"}
};

// object containing user details
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


//-------------------HELPER FUNCTIONS----------------------------------------------//


//Generate a Random ShortID
function generateRandomString() {
  const id = Math.random().toString(36).substring(2,8);
  return id;
}



const getUserByEmail = function(email, users) {

  for (let user in users) {
    if (users[user].email === email) {
      
      return users[user];
    }

  }
  return false;
};


// Check for correct login credentials
const authenticateUser = (email, password) => {
// Does the user with that email exist?
const user = getUserByEmail(email, users);


// check the email and password match
if (user && bcrypt.compareSync(password,user.password)) {
  return user.id;
} else {
  return false;
}
};


//Fetch URLs for User
function urlsForUser(id){
  let urls = {};
 
  for(let key in urlDatabase){
    
    if(urlDatabase[key].userID === id){
      
      urls[key] = {"longURL": urlDatabase[key].longURL, "userID": id };
    }
  }
    
  return urls;
}

//-------------------------------------------------------------------------------------------//

module.exports = {
  getUserByEmail,
  authenticateUser, urlsForUser,generateRandomString,
  urlDatabase, users
};