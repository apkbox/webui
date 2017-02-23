'use strict';

function ProductInfo() {
}

ProductInfo.prototype.getVersion = function() {
    return "1.2.4.22";
}

ProductInfo.prototype.getVersionString = function() {
    return "1.2.4.22 debug";
}

ProductInfo.prototype.getSerialNumber = function() {
    return "13571113";
}

ProductInfo.prototype.getPlatform = function() {
    return "2200";
}

ProductInfo.prototype.getBaseModel = function() {
    return "2280xt";
}

ProductInfo.prototype.getModel = function() {
    return "oce-arizona-2280xt";
}

ProductInfo.prototype.getMakeAndModel = function() {
    return "Oce Arizona 2280 XT";
}

exports.ProductInfoInterface = {};
exports.ProductInfoInterface.getProductInfo = function() {
    return new ProductInfo();
}

exports.SystemInterface = {};
exports.SystemInterface.getComputerName = function() {
    return 'hb-ott-xt';
}

function SoftwarePackage(name, version) {
    this.name_ = name;
    this.version_ = version;
}

SoftwarePackage.prototype.getFileName = function() {
    return this.name_;
}

SoftwarePackage.prototype.getVersion = function() {
    return this.version_;
}

function List(l) {
    this.list_ = l;
}

List.prototype.list = function() {
    return this.list_;
}

exports.SoftwareUpdateInterface = {};
exports.SoftwareUpdateInterface.getAvailablePackages = function() {
    return new List([
        new SoftwarePackage("ottawa-heartbeat-1.3.1.0-x64.exe", "1.3.1.0"),
        new SoftwarePackage("ottawa-heartbeat-1.3.2.0-x64.exe", "1.3.2.0"),
        new SoftwarePackage("ottawa-heartbeat-1.3.3.0-x64.exe", "1.3.3.0")
    ]);
}

