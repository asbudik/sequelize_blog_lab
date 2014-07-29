var express = require("express"),
  db = require("./models/index.js"),
  bodyParser = require("body-parser"),
  methodOverride = require("method-override"),
  path = require("path"),
  app = express();

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded());
app.use(methodOverride("_method"));


app.get("/", function(req, res){

  db.author.findAll().success(function(authors){
    res.render('index', {authors: authors})
  })
})

app.post("/", function(req, res) {
  console.log(req.body.author)
  db.author.findOrCreate({name: req.body.author}).success(function(author){
    var posts = db.posts.build({name: req.body.posts})
    author.setPosts([posts])
      .success(function(author){
        posts.save();
       console.log(author)
    })
  });
  res.redirect('/')
})


app.listen(3000, function(){
  console.log("SERVER listening on 3000")
})