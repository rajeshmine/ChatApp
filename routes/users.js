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
var mongoDB = DBConfig.url;
mongoose.connect(mongoDB, {
  dbName: 'PIM',
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
 

    const UserDetails = {
     
      Details: {
        Firstname: req.body.firstname,
        Lastname: req.body.lastname,
        Email: req.body.email,
        Uid: tempUid,
        Password: passwordHash.generate(temp_password),
        isVerified: true,
        Status: "Y"
      }
    };


    db.collection('TempClientDetails').insertOne(UserDetails, (err, result) => {
      // Mail Send Data
      MailSendercredentials = {
        FromMail: 'rajeshjas20296@gmail.com',
        To: req.body.email,
        Subject: `Verification Mail.\n---Chat App.`,
        Html: `<!DOCTYPE html><html lang="en"><head><title>Check Mail Status</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link href="https://fonts.googleapis.com/css?family=Varela+Round" rel="stylesheet"><style>body {font-family: 'Varela Round', sans-serif;font-size: 14px;line-height: 1.42857143;color: #333;background-color: #c7ccdf;}.mycard{    background-color: #fff;border-radius: 5px;padding: 30px;margin: 20px auto;width: 650px;border: 1px solid #c7ccde;
        box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);font-family: 'Varela Round', sans-serif;}.mycard .cardheader h5{font-size: 35px;color: #000;font-weight: 600;letter-spacing: 1px;margin: 0;}.mycontent{margin-bottom: 20px;}.mycontent p{font-size: 18px;text-align: justify;color: #8f909c; line-height: 30px;margin-bottom: 30px;}.btn{padding: 15px 50px;outline: none;display: inline-block;padding: 6px 12px; margin-bottom: 0;font-size: 14px;font-weight: 400;line-height: 1.42857143;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius: 4px;}.btn-primary {color: #fff;background-color: #0260ee !important;border-color: #0260ee !important;width: 100%;font-size: 20px;} .btn-primary:hover {color: #fff;background-color: #0260ee !important;border-color: #0260ee !important;}
          .cardfooter p{ color:#c9cad0;}a{cursor: pointer;}</style></head><body>  <div class="mycard"><div class="cardheader"><h5>Verify your email</h5></div><div class="mycontent"><p>Hi ${req.body.firstname} ${req.body.lastname}! Use the Link below to verify your email and start enjoying with Chat App (team). </p>
          <a href="http://localhost:3002/users/Verify_user/${tempUid}" target="_blank"><button type="button" class="btn btn-primary">Verify email</button></a></div> <div class="cardfooter"><p>Questions? Email Us at <a href="#">noreply@gmail.com</a></p></div></div></body></html>`
      }
      Functions_controller.MailSend(MailSendercredentials, (err, MailStatus) => {
        if (err) return res.json({
          StatusCode: 503,
          Response: err.message
        });
        return res.json({
          StatusCode: 200,
          Response: "Verification link has send to your mail id."
        });
      });
    });

});

router.get('/Verify_user/:uid', (req, res) => {
  var Uid = req.params.uid;
  var Usercredential = {
    "Details.Uid": Uid
  };
  var updateValue = {
    "Details.isVerified": true
  }
  UserDetailsModel.findOneAndUpdate(Usercredential, updateValue, (err, result) => {
    if (err) return res.json({
      StatusCode: 503,
      Response: err.message
    });
    if (result === null) return res.sendFile(path.join(__dirname, '../public/error/', '404.html'));
    return res.redirect('https://darkholechat.herokuapp.com');

  });
});

// Forgot Password
router.post("/Forgotpsw/:email", (req, res) => {

  var UserID = req.headers.userid;
  var Reg_Email = req.params.email;
  var temp_password = randomstring.generate({
    length: 5,
    charset: 'alphabetic'
  });
  var findobj = {
    Status: 'Y',
    Uid: UserID
  };

  if (UserID == undefined) return res.json({
    StatusCode: 404,
    Response: "Header is missing"
  });

  db.collection('projectdetails').findOne(findobj, (err, result) => {
    if (err) return res.json({
      StatusCode: 503,
      Response: err.message
    });
    if (result == null) return res.json({
      StatusCode: 400,
      Response: "No Data found!!!.Check your user id"
    });
    var projectName = result.Projectname;
    try {
      if (Reg_Email == undefined) throw "";
    } catch (err) {
      return res.json({
        StatusCode: 503,
        Response: `One or more parameters missing.Peramaters : 1.email`
      });
    }
    var Usercredential = {
      Email: Reg_Email
    }
    var updatecredential = {
      Password: passwordHash.generate(temp_password)
    }
    UserDetailsModel.findOneAndUpdate(Usercredential, updatecredential, (err, result) => {
      if (err) return res.json({
        StatusCode: 503,
        Response: err.message
      });
      if (result === null) return res.json({
        StatusCode: 400,
        Response: 'No data found!!!'
      });
      MailSendercredentials = {
        FromMail: 'rajeshjas20296@gmail.com',
        To: result.Email,
        Subject: 'Forgot Password. -------.ChatApp',
        Html: `<!DOCTYPE html><html lang="en"><head><title>Check Mail Status</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link href="https://fonts.googleapis.com/css?family=Varela+Round" rel="stylesheet"><style>body {font-family: 'Varela Round', sans-serif;font-size: 14px;line-height: 1.42857143;color: #333;background-color: #c7ccdf;}.mycard{    background-color: #fff;border-radius: 5px;padding: 30px;margin: 20px auto;width: 650px;border: 1px solid #c7ccde;
        box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);font-family: 'Varela Round', sans-serif;}.mycard .cardheader h5{font-size: 35px;color: #000;font-weight: 600;letter-spacing: 1px;margin: 0;}.mycontent{margin-bottom: 20px;}.mycontent p{font-size: 18px;text-align: justify;color: #8f909c; line-height: 30px;margin-bottom: 30px;}.btn{padding: 15px 50px;outline: none;display: inline-block;padding: 6px 12px; margin-bottom: 0;font-size: 14px;font-weight: 400;line-height: 1.42857143;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius: 4px;}.btn-primary {color: #fff;background-color: #0260ee !important;border-color: #0260ee !important;width: 100%;font-size: 20px;} .btn-primary:hover {color: #fff;background-color: #0260ee !important;border-color: #0260ee !important;}
          .cardfooter p{ color:#c9cad0;}a{cursor: pointer;}</style></head><body>  <div class="mycard"><div class="cardheader"><h5>Forgot Password</h5></div><div class="mycontent"><p>Hi ${result.Firstname} ${result.Lastname}! Use the Password below to login your email and start enjoying with Chat App. </p>
          <p><span>Password : </span><b style="color: #000;">${temp_password}</b></p>
           </div> <div class="cardfooter"><p>Questions? Email Us at <a href="#">noreply@gmail.com</a></p></div></div>   </body></html>`
      };
      Functions_controller.MailSend(MailSendercredentials, (err, MailStatus) => {
        if (err) return res.json({
          StatusCode: 503,
          Response: err.message
        });
        return res.json({
          StatusCode: 200,
          Response: "Password has send to your mail id."
        });
      });
    });
  });
});


// Password change
router.post('/ChangePsw', (req, res) => {

  var Username = req.body.email;
  var O_psw = req.body.o_password;
  var N_psw = req.body.n_password;


  try {
    if (Username == undefined || O_psw == undefined || N_psw == undefined) throw "";
  } catch (err) {
    return res.json({
      StatusCode: 503,
      Response: `One or more parameters missing.Peramaters : \n1.email\n2.o_password \n3.n_password`
    });
  }
  var Usercredential = {
    Email: Username,
  };
  var updatecredential = {
    Password: passwordHash.generate(N_psw)
  }
  UserDetailsModel.find(Usercredential, (err, result) => {
    if (err) return res.json({
      StatusCode: 503,
      Response: err.message
    });
    Functions_controller.PasswordCheck(O_psw, result[0].Password, (pswstatus) => {
      if (!pswstatus) return res.json({
        StatusCode: 400,
        Response: "Please Enter a old password as correct!!!"
      });
      UserDetailsModel.findOneAndUpdate(Usercredential, updatecredential, (err, result) => {
        if (err) return res.json({
          StatusCode: 503,
          Response: err.message
        });
        res.json({
          StatusCode: 200,
          Response: "Password changed Successfully.",
        });
      });
    });
  });
});




router.post('/Login', (req, res) => {
  var Username = req.body.username;
  var Psw = req.body.password;

  try {
    if (Username == undefined || Psw == undefined ) {
      throw "";
    }
  } catch (err) {
    return res.json({
      StatusCode: 503,
      Response: `One or more parameters missing.Peramaters : 1.username\n2.password`
    });
  }
  var Usercredential = {
    "Details.Email": Username,
    "Details.Status": 'Y',
    "Details.isVerified": true,
  };
  var findonly = {
    _id: 0,
    UserID: 0
  };
  db.collection('TempClientDetails').findOne(Usercredential, findonly, (err, result) => {
    if (result === null) return res.json({
      StatusCode: 400,
      Response: 'Before login please verify your mail Id (or) User was blocked by Admin (or) No data found!!!'
    });
    return Functions_controller.PasswordCheck(Psw, result.Details.Password, (pswstatus) => {
      if (pswstatus) return res.json({
        StatusCode: 200,
        Response: result
      });
      res.json({
        StatusCode: 400,
        Response: "Username or Password Does Not Match!!!"
      });
    });
  });
});

module.exports = router;