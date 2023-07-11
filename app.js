const express = require('express');
const bodyParser = require('body-parser');
const indexRouter = require("./routes/index");
var path = require('path');
const cookieParser = require('cookie-parser');

const {user_auth} = require('./middleware/auth');

const currentController = require('./controllers/currentController');

const app = express();
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.json());

var urlencodedParser = bodyParser.urlencoded( {extended: false});

//customer post
app.post("/signup", currentController.signup_post);
app.post("/login", currentController.login_post);

//protected routes
app.get("/", user_auth, user_auth, currentController.index);
app.get('/toggle-state', user_auth, currentController.toggle_state);
app.get('/delete-data', user_auth, currentController.delete_data);
app.get('/delete-users', user_auth, currentController.delete_users);
app.get('/delete-user/:id', user_auth, currentController.delete_user);
app.get('/users', user_auth, currentController.show_users);
app.get('/records', user_auth, currentController.show_records);

mongoDB = "mongodb+srv://Geofrey:Geofrey1234@cluster0.wn8iyom.mongodb.net/cctBreakerDB?retryWrites=true&w=majority";

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use("/", indexRouter);

module.exports = app;
