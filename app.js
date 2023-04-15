require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");

const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");

app.use(session({
    secret: "some information",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB")
    .then(console.log("Successfully connected to MongoDB"))
    .catch(err => console.error(err));

const userSchema = mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("user", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            })
        }
    })

});


app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            })
        }
    })
});

app.get("/logout", function(req, res) {
    req.logout(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
})

app.get("/secrets", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
})

app.listen(3000, (req, res) => {
    console.log("Server running on port 3000");
})
