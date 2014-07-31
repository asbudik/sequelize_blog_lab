var express = require("express"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  passportLocal = require("passport-local"),
  cookieParser = require("cookie-parser"),
  cookieSession = require("cookie-session"),
  flash = require("connect-flash"),
  methodOverride = require("method-override"),
  app = express(),
  db = require("./models/index.js");

app.set("view engine", "ejs");

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  secret: 'blogcentralasdf',
  name: 'blog central cookie',
  maxage: 300000
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(methodOverride("_method"));


passport.serializeUser(function(author, done) {
  console.log("SERIALIZED");
  done(null, author.id);
})

passport.deserializeUser(function(id, done) {
  console.log("DESERIALIZED");
  db.author.find({
    where: {
      id: id
    }
  }).done(function(error, user) {
    done(error, user)
  })
})


app.get('/', function(req, res) {
  res.render('index', {
  author: req.author});
});

app.get('/signup', function(req, res) {
  if(!req.author) {
    res.render("authors/new_author");
  } else {
    res.redirect('/')
  }
});

app.get('/login', function(req, res) {
  if (!req.author) {
    res.render("authors/login", {
      author: req.author});
  } else {
    res.redirect('/');
  }
})

app.get('/authors', function(req, res) {
  db.author.findAll({order: [['createdAt', 'DESC']]}).success(function(allAuthors) {
    res.render('authors/index', { 
    authors: allAuthors});
  });
});

app.get('/blogs', function(req, res) {
  db.post.findAll({order: [['createdAt', 'DESC']]}).success(function(allPosts) {
    res.render('posts/index', {
    post: req.post, posts: allPosts});
  });
});

app.get('/authors/:id', function(req, res) {
  db.author.find(req.params.id).success(function(foundAuthor) {
    foundAuthor.getPosts().success(function(foundPosts) {
      res.render("authors/show", {
      author: foundAuthor, posts: foundPosts});
    });
  });
});

app.get('/posts/:id', function(req, res) {
  db.post.find(req.params.id).success(function(foundPost) {
    res.render("posts/show", {
    post: foundPost});
  });
});

app.get('/posts/:id/edit', function(req, res) {
  db.post.find(req.params.id).success(function(foundPost) {
    res.render('posts/edit', {
    post: foundPost})
  })
})

app.get('/authors/:id/posts/new', function(req, res) {
  db.author.find(req.params.id).success(function(foundAuthor) {
    res.render("posts/new", {
    author: foundAuthor});
  });
});

app.post('/authors', function(req, res) {
  db.author.createNewUser(req.body.username, req.body.password, 
  function(err){
    res.render("authors/new_author", {message: err.message, username: req.body.username});
  }, 
  function(success){
    res.render("index", {
    message: success.message});
  });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/authors',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/');
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



