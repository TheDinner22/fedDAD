/*
* all api tests
*
*/

// types
import { testObj } from ".";

// dependencies
import assert from "assert";
import { methods } from "../appStuff/server_";
import http from "http";
import config from "./../appWraperrr/config_"
const httpPort = config.httpPort;

// container for all tests
let api: testObj = {};

// helpers for making the http requests
let helpers = {
    makeGetRequest : function(path: string, method: methods, callback: (res: http.IncomingMessage) => void){
        // configure the request details
        const requestDetails = {
            'protocol' : "http:",
            "hostname" : "localhost",
            "port" : httpPort,
            "method" : method,
            "path" : path,
            "headers" : {
                "Content-Type" : "application/json"
            }
        };
        // send the request
        let req = http.request(requestDetails,function(res){
            callback(res);
        });
        req.end();
    }
};

// export tests
export default api;
