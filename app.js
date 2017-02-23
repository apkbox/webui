process.env.DEBUG='express:* node-soap node app.js';
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
app.use(wsrouter);

// Prepare soap.
var xml = require('fs').readFileSync(path.join(__dirname, 'wave/wsdl/SystemService.wsdl'), 'utf8');
var soap_server = soap.listen(wsrouter, {
    path: '/eip/wave/SystemService/',
    services: { 
        SystemService: {
          SystemPort: {
            getSystemElements: function(args) {
              return { 
                imagingSystem: {
                  devices: { 
                    printerDevice: {
                      printDeviceDescription: {
                        deviceModel: "oce-arizona-2280xt",
                        deviceMakeAndModel: "Oce Arizona 2280 XT",
                        deviceVersion: "1.0",
                        deviceUriSupported: [
                          "http://localhost/eip/wave/SystemService/",
                          "http://localhost/eip/wave/PrinterMonitoringService/"
                        ]
                      }
                    }
                  },
                  services: 1,
                  systemStatus: 1,
                }
              };
            }
          }
        } 
    },
    xml: xml,
    // By passing os path, we make WSDL readout faster as there is no need
    // to do referred documents retrieveal through HTTP.
    uri: 'http://localhost/eip/wave/'});
    //uri: path.join(__dirname, 'wave/wsdl/') });

// SOAP logging
soap_server.log = function(type, data) {
    console.log(JSON.stringify(type) + "\n" + JSON.stringify(data));
};

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