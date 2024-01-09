// create web server
var express = require("express");
var app = express();

// use the express.static middleware to server static content
app.use(express.static("public"));

// use the body-parser middleware to parse the body of the request
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// set the view engine to ejs
app.set("view engine", "ejs");

// create a comments array
var comments = [];

// home page route
app.get("/", function(req, res) {
    res.render("home", {comments: comments});
});

// create a new comment
app.post("/comment", function(req, res) {
    // get data from form and add to comments array
    var author = req.body.author;
    var comment = req.body.comment;
    var newComment = {author: author, comment: comment};
    comments.push(newComment);
    // redirect back to the home page
    res.redirect("/");
});

// start the server
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server has started!");
});