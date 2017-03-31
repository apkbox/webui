var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var p = req.az.ProductInfoInterface.getProductInfo();
  var computer_name = req.az.SystemInterface.getComputerName();
  var u = req.az.SoftwareUpdateInterface.getAvailablePackages();
  res.render('index', { 
    title: p.getMakeAndModel() + ' - ' + computer_name, 
    computer_name: computer_name,
    make_and_model: p.getMakeAndModel(),
    software_version: p.getVersion(),
    serial_number: p.getSerialNumber(),
    available_packages: u.list()
  });
});

module.exports = router;
