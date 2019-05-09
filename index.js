// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var TokenGenerator = require('uuid-token-generator');
var bodyparser = require('body-parser');
var fileUpload = require('express-fileupload');
var mongoose = require('mongoose');

var DBConfig = require('./config');

var mongoDB = DBConfig.url;
const Token = new TokenGenerator(256, TokenGenerator.BASE58);
const Token2 = new TokenGenerator(512, TokenGenerator.BASE66);

mongoose.connect(mongoDB, {
  dbName: 'PIM',
  useNewUrlParser: true
});
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;



var port = process.env.PORT || 3002;
var users = require('./routes/users');


server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

app.use(bodyparser());

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/users', users);



// Project Id Validation
var userArray = [];
io.use((socket, next) => {
  userArray[socket.handshake.query.ClientUID] = socket.id;
  next();
});



// On socket Connection

io.on('connection', (socket) => {

  socket.on('typing', (data) => {
    socket.to(userArray[data.to]).emit('typing', data);
  });

  socket.on('stop typing', (data) => {
    socket.to(userArray[data.to]).emit('stop typing', data);
  });

  socket.on('Add User', (data) => {
    let temp = {
      UserID: Token.generate(),
      Details: data
    }
    db.collection('TempClientDetails').insert(temp).then(result => {
      socket.emit('Add User', result);
    });
  });

  socket.on('User List', () => {
    db.collection('TempClientDetails').find({}).toArray().then(result => {
      socket.emit('User List', result);
    });
  });

  socket.on('New Message', (data) => {
    let temp = {
      MessageID: Token.generate(),
      Content: data
    }
    db.collection('ClientChatDetails').insert(temp).then(result => {
      socket.to(userArray[data.to]).emit('New Message', temp);
    });
  });

  socket.on('All Messages', () => {

    db.collection('ClientChatDetails').find({}).toArray().then(result => {
      socket.emit('All Messages', result);
    });
  });


  socket.on('Subscribe', () => {
    socket.join('Subscribers List');
    socket.emit('SubscribersMessage', 'Subscribed');
  });

  socket.on('SubscribersMessage', (data) => {
    socket.in('Subscribers List').broadcast.emit('SubscribersMessage', data);
  });

});