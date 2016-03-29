var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var path = require('path');
var http = require('http').Server(app);
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Twitter = require('twitter');
var socketIO = require('socket.io')(http);

//var routes = require('./routes/index');

var twitCreds = {
  consumer_key: 'qgaFMA7nBXBblpeDeKcwOwqmt',
  consumer_secret: 'EZzJ4qYVDqBsdJXrGmOpoz8E9EUtbaVDx3ti3a9wawC9HpgX14',
  access_token_key: '164335620-l9jxia1ySAIXof0899v5Bq6bDdE88tUJZUOHr7gl',
  access_token_secret: '4HW9pKSCXboQZJQO5o9f5qTrgrMDeagnKxV5JZsQFzl7N'
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);

http.listen(port, function() {
  console.log("Listening on port: " + port);
});

var twitClient = new Twitter({
  consumer_key: twitCreds.consumer_key,
  consumer_secret: twitCreds.consumer_secret,
  access_token_key: twitCreds.access_token_key,
  access_token_secret: twitCreds.access_token_secret
});

app.get('/', function(req, res, next) {
  var searchTerms = req.query.keySearch;

  if (searchTerms == undefined) {
    socketIO.on('connection', function (socket) {
      console.log('User connected. Socket id %s', socket.id);

      socket.on('disconnect', function () {
        console.log('User disconnected. %s. Socket id %s', socket.id);
      });
    });

    res.render('index', { title: 'Twitter Monitor', search: '' });
  } else {
    twitClient.stream('statuses/filter', { track: searchTerms }, function (stream) {
      stream.on('data', function (tweet) {
        //console.log(tweet.text);
        socketIO.sockets.emit('twitter', tweet);
      });

      stream.on('error', function (error) {
        console.log(error);
      });
    });

    res.render('index', { title: 'Twitter Monitor', search: searchTerms });
  }

  /*var twitId = 0;

  twitClient.get('users/show', { screen_name: req.body.nameSearch }, function(error, user, response) {
    twitId = user.id
  });*/

  /*twitClient.stream('statuses/filter', { track: req.body.keySearch}, function(stream) {
    stream.on('data', function(tweet) {
      socketIO.sockets.emit('twitter', tweet);
    });

    stream.on('error', function(error) {console.log(error);
    });
  });

  res.send('Success');*/
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});