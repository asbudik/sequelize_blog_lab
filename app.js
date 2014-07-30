var express = require("express"),
  db = require("./models/index.js"),
  bodyParser = require("body-parser"),
  methodOverride = require("method-override"),
  app = express();

app.set("view engine", "ejs");

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded());
app.use(methodOverride("_method"));

app.get('/', function(req, res) {
  res.render('index')
});

app.get('/authors/new_author', function(req, res) {
  res.render('authors/new_author')
})

app.get('/authors', function(req, res) {
  db.author.findAll({order: 'createdAt ASC'}).success(function(allAuthors) {
    res.render('authors/index', {authors: allAuthors});
  });
});

app.get('/blogs', function(req, res) {
  db.post.findAll({order: 'createdAt ASC'}).success(function(allPosts) {
    res.render('posts/index', {posts: allPosts});
  });
});

app.get('/authors/:id', function(req, res) {
  db.author.find(req.params.id).success(function(foundAuthor) {
    foundAuthor.getPosts().success(function(foundPosts) {
      res.render("authors/show", {author: foundAuthor, posts: foundPosts});
    });
  });
});

app.get('/posts/:id', function(req, res) {
  db.post.find(req.params.id).success(function(foundPost) {
    res.render("posts/show", {post: foundPost});
  });
});

app.get('/posts/:id/edit', function(req, res) {
  db.post.find(req.params.id).success(function(foundPost) {
    res.render('posts/edit', {post: foundPost})
  })
})

app.get('/authors/:id/posts/new', function(req, res) {
  db.author.find(req.params.id).success(function(foundAuthor) {
    res.render("posts/new", {author: foundAuthor});
  });
});

app.post('/authors', function(req, res) {
  db.author.create(req.body.author).success(function() {
    res.redirect('/authors');
  });
});

app.post('/authors/:id/posts', function(req, res) {
  db.author.find(req.params.id).success(function(foundAuthor) {
    db.post.create(req.body.post).success(function(newPost) {
      foundAuthor.addPost(newPost).success(function() {
        res.redirect("/posts/" + newPost.dataValues.id);
      });
    });
  }).error(function(err) {
    res.redirect("/authors");
  });
});

app.put('/posts/:id', function(req, res) {
  db.post.find(req.params.id).success(function(foundPost) {
    foundPost.updateAttributes({title: req.body.post.title, 
    body: req.body.post.body}).success(function() {
      res.redirect("/posts/" + foundPost.dataValues.id);
    });
  });
});

app.delete('/posts/:id', function(req, res) {
  db.post.find(req.params.id).success(function(foundPost) {
    foundPost.destroy().success(function() {
      res.redirect("/blogs")
    });
  });
});

app.delete('/authors/:id', function(req, res) {
  db.author.find(req.params.id).success(function(foundAuthor) {
    foundAuthor.getPosts().success(function(foundPosts) {
      foundPosts.forEach(function(post) {
        post.destroy().success(function() {})
      })
      foundAuthor.destroy().success(function() {
        res.redirect("/authors");
      });
    });
  });
});

app.listen(3000, function() {
  console.log("SERVER LISTENING ON 3000")
});



