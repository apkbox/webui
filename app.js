process.env.DEBUG='express:* node app.js';
process.env.PORT=80

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

var soap = require('soap');
var az = require('./arizona_api_server.js');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// Make Arizona API accessible to our router
app.use(function(req,res,next){
    req.az = az;
    next();
});

// Hook up uploads
app.use(fileUpload());
app.post('/upload', function(req, res) {
  console.log(req.files.file); // the uploaded file object 

  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
  let sampleFile = req.files.file;
 
  // Use the mv() method to place the file somewhere on your server 
  //sampleFile.mv('/somewhere/on/your/server/filename.jpg', function(err) {
  //  if (err)
  //    return res.status(500).send(err);

  //  res.send('File uploaded!');
  //});
  res.send(sampleFile);
});

app.get('/backchannel/:fn/', function(req, res) {
  if (req.params.fn == 'get-packages') {
    var u = req.az.SoftwareUpdateInterface.getAvailablePackages();
    var files = u.list();
    res.status(200).json(files);
  } else {
    res.status(404).send('Not found');
  }
});

// Allow to retrieve the WSDL and schema through HTTP.
// The main purpose of this route is to retrieve dependent
// schema documents as WSDL itself is served by node-soap.
app.use('/eip/wave/', express.static(path.join(__dirname, '/wave/wsdl'),
  {
    setHeaders: function(res, filePath, stat) {
      if (stat.isFile()) {
        var ext = path.extname(filePath);
        if (ext == '.wsdl')
          res.setHeader("Content-Type", "text/xml");
        else if (ext == '.xsd')
          res.setHeader("Content-Type", "text/xml");
      }
    }
  }
));

// This is required to insert route before 404 handler.
// The actual WSDL route is added asynchronously after the server is started,
// so, the 404 handler (which is catch all) will always match first.
// By passing to soap.listen the router instead of server, we ensure that
// soap inserts WSDL route into the router, which in turn already placed
// before 404.
var wsrouter = express.Router();
if (false && wsrouter) {
  app.use(wsrouter);
  var wave = require('./wave.js');
  wave.SetupWaveService(wsrouter, 
                        'wave/wsdl/SystemService.wsdl',
                        { SystemService: wave.SystemService },
                        '/eip/wave/SystemService');

  wave.SetupWaveService(wsrouter,
                        'wave/wsdl/ClientSessionManagementService.wsdl',
                        { ClientSessionManagementService: wave.ClientSessionManagementService },
                        '/eip/wave/ClientSessionManagementService');
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
