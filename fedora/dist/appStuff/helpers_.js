"use strict";
//a helper librsry to help with varies tasks
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaticAsset = exports.objEqual = exports.parseJsonToObject = exports.MD5 = exports.hash = void 0;
//dependencies
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const config_1 = __importDefault(require("./../appWraperrr/config_"));
//create SHA256 hash
function hash(str) {
    if (str.length > 0) {
        const hash = crypto_1.default.createHmac("sha256", config_1.default.hashingSecret).update(str).digest("hex"); //don't really know what this means but its just encrypting the thing with sha256
        return hash;
    }
    else {
        return false;
    }
}
exports.hash = hash;
;
function MD5(str) {
    const hash = crypto_1.default.createHash('md5').update(str).digest("hex");
    return hash;
}
exports.MD5 = MD5;
;
// create parseJsonToObject function
function parseJsonToObject(str) {
    try {
        const obj = JSON.parse(str);
        return obj;
    }
    catch (e) {
        return {};
    }
}
exports.parseJsonToObject = parseJsonToObject;
;
function objEqual(obj1, obj2) {
    //compare two objects, if inputs are not objects return false
    return util_1.default.isDeepStrictEqual(obj1, obj2);
}
exports.objEqual = objEqual;
;
// get the contents of a static (public) assest
function getStaticAsset(fileName, callback) {
    if (!(fileName.length > 0)) {
        callback("valid filename not specified");
        return;
    }
    //define base dir
    const publicDir = path_1.default.join(__dirname, "/../../../public/");
    fs_1.default.readFile(publicDir + fileName, "utf8", function (err, data) {
        if (!err && data) {
            callback(false, data);
        }
        else {
            callback("no file could be found");
        }
    });
}
exports.getStaticAsset = getStaticAsset;
;
