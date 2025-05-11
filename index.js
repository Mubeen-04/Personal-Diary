const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Chat = require("./models/chat");
const methodOverride = require('method-override');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user"); 

require('dotenv').config();


const dbUrl = process.env.MONGO_URL;


app.set("views",path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));


app.use(session({
    secret: "secret-diary",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

main()
    .then(() => {
        console.log("Connection Successful");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
}

app.get("/register", (req, res) => {
    res.render("register", { errorMessage: null });
});

// Register Route
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Create a new user using the data from the form
        const newUser = new User({
            username: username,
            email: email
        });

        // Register the user using Passport (this automatically handles hashing the password)
        await User.register(newUser, password);

        // Log the user in after successful registration
        passport.authenticate("local")(req, res, () => {
            res.redirect("/chats");  // Redirect to the 'chats' page (index.ejs)
        });

    } catch (err) {
    console.log(err);

    let errorMessage = "Registration failed. Please try again.";
    if (err.name === "UserExistsError") {
        errorMessage = "User already exists. Please login or use a different username.";
    }

    res.render("register", { errorMessage });
}
});



app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/chats"
}));

app.get("/logout", (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect("/");
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

// Show user's own diary (chats)
app.get("/chats", isLoggedIn, async (req, res) => {
    const chats = await Chat.find({ user: req.user._id }); // Fetch only chats that belong to the logged-in user
    res.render("index", { chats });  // Render the index.ejs page with only the user's chats
});



//New Route
app.get("/chats/new", isLoggedIn, (req,res) => {
    res.render("new.ejs");
});

//Create Route
// Create Route for writing a new diary entry (chat)
app.post("/chats", isLoggedIn, (req, res) => {
    const { from, to, msg } = req.body;
    const newChat = new Chat({
        from: from,
        to: to,
        msg: msg,
        created_at: new Date(),
        user: req.user._id  // Save the logged-in user's ID with the chat
    });

    newChat
        .save()
        .then(() => {
            console.log("Chat Created");
            res.redirect("/chats");
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/chats/new");
        });
});



//Edit Route
app.get("/chats/:id/edit",async (req,res) => {
    let {id} = req.params;
    let chat = await Chat.findById(id);
    res.render("edit.ejs",{chat});

});

//Update Route
app.put("/chats/:id", async (req,res) => {
    let {id} = req.params;
    let {msg : newMsg} = req.body;
    let updatedChat = await Chat.findByIdAndUpdate(
        id,
        {msg: newMsg},
        {runValidators: true , new: true}
    );
    console.log(updatedChat);
    res.redirect("/chats");
});

//Destroy Route
app.delete("/chats/:id", async (req,res) => {
    let {id} = req.params;
    let deletedChat = await Chat.findByIdAndDelete(id);
    console.log(deletedChat);
    res.redirect("/chats");
});

app.get("/", (req, res) => {
    res.render("landing.ejs");
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});