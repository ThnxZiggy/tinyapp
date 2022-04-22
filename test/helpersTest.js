const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.deepEqual((user), (expectedUserID))
  });

  it('should return return undefined if the user does not exist in the database', () => {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = 'homer@simpson.com';
    assert.equal((user), (expectedUserID))
  })
});