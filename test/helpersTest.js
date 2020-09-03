const { assert } = require('chai');
const {getUserByEmail, urlsForUser} = require('../helpers/appHelpers')

//------------------------DATABASES-----------------------------------------//

// object containing short url as key and long url as value
const urlDatabase = {
  "b2xVn2": { longURL :"http://www.lighthouselabs.ca", userID : "abc123"},
  "9sm5xK": { longURL :"http://www.google.com", userID : "cde456"}
};

const testUsers = {
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
};

//-----------------TEST CASES---------------------------------------------//

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedOutput);
  });

  
  it('should return undefined for non-existent email', function() {
    const user = getUserByEmail("users@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user.id, expectedOutput);
  });


});

describe('urlsForUser', function() {
  it('should return urls with valid user id', function() {
    const actual = urlsForUser("abc123");
    const expected = { b2xVn2: {"longURL": "http://www.lighthouselabs.ca", "userID": "abc123" }};
    assert.deepEqual(expected, actual);
  });
  
  it('should return empty array with invalid user id', function() {
    const user = urlsForUser("abfgte345");
    assert.isEmpty(user);
  });
});