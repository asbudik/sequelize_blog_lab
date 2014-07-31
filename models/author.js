var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);
var passport = require("passport");
var passportLocal = require("passport-local");

module.exports = function (sequelize, DataTypes){
  var Author = sequelize.define('author', {
    username: { 
      type: DataTypes.STRING, 
      allowNull: false,
      unique: true, 
      validate: {
        len: [6, 30],
      }
    },
    password: {
      type:DataTypes.STRING,
      validate: {
        notEmpty: true,
      }
    }
  },

  {
    classMethods: {
      associate: function(db) {
        Author.hasMany(db.post);
      },
      encryptPass: function(password) {
        var hash = bcrypt.hashSync(password, salt);
        return hash;
      }, 
      comparePass: function(userpass, dbpass) {
      // don't salt twice when you compare....watch out for this
        return bcrypt.compareSync(userpass, dbpass);  
      },
      createNewUser: function(username, password, err, success ) {
        if(password.length < 6) {
          err({message: "Password should be more than six characters"});
        }
        else{
          Author.create({
            username: username,
            password: Author.encryptPass(password)
          }).error(function(error) {
            if(error.username){
              err({message: 'Your username should be at least 6 characters long', username: username});
            }
            else{
              err({message: 'An account with that username already exists', username: username});
            }
          }).success(function(user) {
              success({message: 'Account created, please log in now'});
            });
          }
        },
      } // close classMethods
    } //close classMethods outer 
  ); // close define user
     
  passport.use(new passportLocal.Strategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    }, 
    function(req, username, password, done) {
      // find a user in the DB
      Author.find({
        where: {
          username: username
        }
      })
    .done(function(error, author){
      if(error){
        console.log(error)
        return done(error, req.flash('loginMessage', 'Oops! Something went wrong...'))
      }
      if (author === null) {
        return done(null, false, req.flash('loginMessage', 'Username does not exist'))
      }
      if((Author.comparePass(password, author.password)) !== true) {
        return done(null, false, req.flash('loginMessage', 'Invalid password'))
      }
      done(null, author);
    });
  }));   
  return Author;
}; // close Author function