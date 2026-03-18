const bcrypt = require("bcrypt");

bcrypt.hash("super123", 10).then(hash => {
  console.log(hash);
});