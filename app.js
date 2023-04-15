require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");

// Require bcrypt to use salting to enhance password security
const bcrypt = require("bcrypt");
const saltingRounds = 10;

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");


mongoose.connect("mongodb://localhost:27017/userDB")
    .then(console.log("Successfully connected to MongoDB"))
    .catch(err => console.error(err));

const userSchema = mongoose.Schema({
    email: String,
    password: String
});


const User = mongoose.model("user", userSchema);


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({
            email: username
        }).then(foundUser => {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function(error, result) {
                    if (result === true) {
                        res.render("secrets");
                    } else {
                        res.send("Wrong password");
                    }
                })
            } else {
                res.send("No username");
            }
        })

    } catch (err) {
        console.error(err);
    }
});


app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    bcrypt.hash(req.body.password, saltingRounds, function(err, hash) {
        try {
        User({
            email: req.body.username,
            password: hash
        }).save().then(res.render("secrets"));
        } catch (error) {
            console.error(error);
        }
    })
    
});


app.listen(3000, (req, res) => {
    console.log("Server running on port 3000");
})
