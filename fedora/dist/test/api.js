"use strict";
/*
* all api tests
*
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const config_1 = __importDefault(require("./../appWraperrr/config_"));
const httpPort = config_1.default.httpPort;
// container for all tests
let api = {};
// helpers for making the http requests
let helpers = {
    makeGetRequest: function (path, method, callback) {
        // configure the request details
        const requestDetails = {
            'protocol': "http:",
            "hostname": "localhost",
            "port": httpPort,
            "method": method,
            "path": path,
            "headers": {
                "Content-Type": "application/json"
            }
        };
        // send the request
        let req = http_1.default.request(requestDetails, function (res) {
            callback(res);
        });
        req.end();
    }
};
// export tests
exports.default = api;
