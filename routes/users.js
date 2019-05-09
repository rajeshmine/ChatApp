var express = require('express');
var path = require('path');
var TokenGenerator = require('uuid-token-generator');
var mongoose = require('mongoose');
var passwordHash = require('password-hash');
var randomstring = require("randomstring");
var DBConfig = require('./../config');
var Functions_controller = require('./../controller/functions.controller');
var UserDetailsModel = require('./../models/users.model');
var router = express.Router();
const Token = new TokenGenerator();
var MailSendercredentials = {};
// Mongoo DB Connection
var mongoDB = process.env.dbConfig || DBConfig.url;
mongoose.connect(mongoDB, {
  dbName: 'ChatApp',
  useNewUrlParser: true,
});
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// SignUp
router.post("/SignUp", (req, res) => {
  var tempUid = Token.generate();
  var temp_password = req.body.password;
  const UserDetails = { Details: { Firstname: req.body.firstname, Lastname: req.body.lastname, Email: req.body.email, Uid: tempUid, Password: passwordHash.generate(temp_password), isVerified: true, Status: "Y" } };
  var Usercredential = { "Details.Email": req.body.email };
  db.collection('TempClientDetails').findOne(Usercredential, (err, result) => {
    if (err) return res.json({ StatusCode: 503, Response: err.message });
    if (!result) return db.collection('TempClientDetails').insertOne(UserDetails, (err, result) => {
      if (err) return res.json({ StatusCode: 503, Response: err.message });
      return res.json({ StatusCode: 200, Response: "User Created Successfully" });
    });
    return res.json({ StatusCode: 503, Response: "User Already Exist" })
  });
});

router.post('/Login', (req, res) => {
  var Username = req.body.username;
  var Psw = req.body.password;
  try {
    if (Username == undefined || Psw == undefined) { throw "" }
  } catch (err) {
    return res.json({ StatusCode: 503, Response: `One or more parameters missing.Peramaters : 1.username\n2.password` });
  }
  var Usercredential = { "Details.Email": Username, "Details.Status": 'Y', "Details.isVerified": true};
  var findonly = { _id: 0, UserID: 0 };
  db.collection('TempClientDetails').findOne(Usercredential, findonly, (err, result) => {
    if (result === null) return res.json({
      StatusCode: 400,
      Response: 'Before login please verify your mail Id (or) User was blocked by Admin (or) No data found!!!'
    });
    return Functions_controller.PasswordCheck(Psw, result.Details.Password, (pswstatus) => {
      if (pswstatus) return res.json({ StatusCode: 200, Response: result });
      res.json({ StatusCode: 400, Response: "Username or Password Does Not Match!!!" });
    });
  });
});

module.exports = router;