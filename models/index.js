var fs        = require('fs')
  , path      = require('path')
  , Sequelize = require('sequelize')
  , lodash    = require('lodash')
  , env       = process.env.NODE_ENV || 'development'
  , config    = require(__dirname + '/../config/config.json')[env]
  , sequelize = new Sequelize(config.database, config.username, config.password, config)
  , db        = {}

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js')
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})

// db.author.create({name: "Rodney Reams"}).success(function(author) {
//   console.log(author);
// })

// db.author.find(1).success(function(foundAuthor) {
//   var newPost = db.post.build({title: "The Great"});
//   foundAuthor.setPosts([newPost]).success(function() {
//     newPost.save();
//   });
// });

// db.author.find(1).success(function(foundAuthor){
//   var newPost = db.post.build({title: "hello worlds again!"});
//   foundAuthor.addPost(newPost).success(function(){
//     newPost.save()
//   })
// });

// addPost adds foreign key
// setPost is destructive

// db.author.find(1).success(function(author){
//     var posts = db.posts.build({name: "Fantasmo"})
//     author.setPosts([posts])
//       .success(function(author){
//         posts.save();
//        console.log(author)
//     })
// });

module.exports = lodash.extend({
  sequelize: sequelize,
  Sequelize: Sequelize
}, db)
