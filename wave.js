var fs = require('fs');
var util = require('util');
var soap = require('soap');

function SetupWaveService(server, wsdl, service, path) {
    // Prepare soap.
    var xml = fs.readFileSync(wsdl, 'utf8');
    var soap_server = soap.listen(server, {
        path: path,
        services: service,
        xml: xml,
        uri: util.format('http://localhost:%d/eip/wave/', process.env.PORT) 
    });

    // SOAP logging
    soap_server.log = function(type, data) {
        console.log(JSON.stringify(type) + "\n" + JSON.stringify(data));
    };
}

module.exports.SystemService = {
    SystemPort: {
        getSystemElements: function(args, cb, headers, req) {
            return { 
                imagingSystem: {
                    devices: { 
                        printerDevice: {
                            printDeviceDescription: {
                                deviceModel: req.az.ProductInfoInterface.getProductInfo().getModel(),
                                deviceMakeAndModel: req.az.ProductInfoInterface.getProductInfo().getMakeAndModel(),
                                deviceVersion: "1.0",
                                deviceUriSupported: [
                                    "http://localhost/eip/wave/SystemService",
                                    "http://localhost/eip/wave/PrinterMonitoringService"
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
};

module.exports.ClientSessionManagementService = {
    ClientSessionManagementPort: {
        openClientSession: function(args, cb, headers, req) {
            return { 
                clientSession: "42"
            }
        }
    }
};


module.exports.SetupWaveService = SetupWaveService;
