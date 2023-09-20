const express = require("express")

const app = express()


const session = require("express-session")

const FileStore = require("session-file-store")(session)

const PORT = process.env.PORT || 3000

const passport = require("passport")

const localStrategy = require("passport-local")
const { clientId, clientSecret } = require("./config/config")

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.set("view engine", "ejs")

app.use(session({
    resave: false,
    secret: "secret",
    saveUninitialized: true,
    store: new FileStore(),
    cookie: {
        secure: false
    }
}))
const strategy = require("passport-google-oauth20").Strategy

const googleStrategy = new strategy({
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: "http://localhost:3000/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    done(null, profile)
})

// const strategy = new localStrategy((username, password, done) => {
//     done(null, { username, password })
// })

passport.use(googleStrategy)

passport.serializeUser((profile, done) => {
    return done(null, profile)
})

passport.deserializeUser((profile, done) => {
    return done(null, profile)
})

app.get('/', (req, res) => {
    res.render("index")
})

app.post('/login', passport.authenticate("local", { failureRedirect: "/", failureMessage: false }), (req, res) => {
    res.status(200).json({ user: req.session.passport.user })
})

app.get('/logout', (req, res) => {
    req.session.destroy(function () {
        res.render("logout")
    })
})

app.get('/google/auth', passport.authenticate("google", { scope: ["profile"] }))

app.get('/google/callback', passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
    res.redirect("/auth/success")
})

app.get("/auth/success", (req, res) => {
    res.status(200).render("success")
})

app.listen(PORT, () => console.log("server running on port " + PORT))