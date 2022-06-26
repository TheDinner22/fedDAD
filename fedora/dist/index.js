"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendREQ = void 0;
// testing a WIP fedora by making a TODO app on localhost with it
const bundler_1 = require("./appWraperrr/bundler_");
const parserParser_1 = require("./this/parserParser");
const data_1 = require("./this/data");
const comparer_1 = require("./this/comparer");
const injector_1 = require("./this/injector");
const https_1 = __importDefault(require("https"));
const string_decoder_1 = require("string_decoder");
// get the html for the webpage
function sendREQ(callback) {
    //configure request details to go to www.centipedepress.com/scratchanddents.html
    const requestDetails = {
        "protocol": "https:",
        "hostname": "www.centipedepress.com",
        "method": "GET",
        "path": "/scratchanddents.html",
    };
    //instantiate the request object including telling what we do when we get the request response back (this does not send the request)
    const req = https_1.default.request(requestDetails, function (res) {
        // for if there is a response payload
        const decoder = new string_decoder_1.StringDecoder('utf-8');
        let holder = "";
        res.on("data", (d) => {
            holder += decoder.write(d);
        });
        res.on("end", () => {
            // cap decoder
            holder += decoder.end();
            // grab the status of the sent request
            const status = res.statusCode;
            // callback if the request went through
            if (status == 200 || status == 201) {
                // get the payload (if it exists)
                callback(false, holder);
            }
            else {
                callback({ "error": "status code returned by atlasAPI was " + status });
            }
        });
        //bind to the error event just in case
        res.on("error", function (e) {
            console.log("There was an error with the atlas api htpps request's response object LLLLL");
            callback({ error: `${e.name}\n\n${e.message}` });
        });
    });
    //bind to the error event so that it does not get thrown
    req.on("error", function (e) {
        const errorObj = { 'error': e.message, 'name': e.name };
        callback(errorObj);
    });
    //end the request (same as sending it off)
    req.end();
}
exports.sendREQ = sendREQ;
;
if (require.main === module) {
    // index html route
    // router.get("", (data, callbacks) =>{
    sendREQ((e, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (typeof res === "string") {
            // parse the incoming html
            console.log('1');
            const incomingJSONStr = yield (0, parserParser_1.parseParseParse)(res);
            console.log('2');
            if (typeof incomingJSONStr !== 'string') {
                throw new Error("idk man no stringy boi LLLL");
            }
            yield (0, data_1.promiseSave)(incomingJSONStr);
            return;
            console.log('3');
            const incomingObjArr = (0, parserParser_1.convertJSONStrToObj)(incomingJSONStr);
            console.log('4');
            // get previous pages JSON str and objArr
            console.log('5');
            const prevObjArr = yield (0, data_1.promiseGet)();
            console.log('6');
            if (typeof prevObjArr === "undefined" || typeof prevObjArr === "string") {
                throw new Error("prevObjArr was not right type");
            }
            // compare
            const newItems4Sale = (0, comparer_1.compareJSON)(prevObjArr, incomingObjArr);
            // inject red
            const newRedItems4Sale = (0, injector_1.inject)(newItems4Sale);
            // store recent                
            yield (0, data_1.promiseSave)(incomingJSONStr);
            //replace with red
            newItems4Sale.forEach((newItem) => {
                if (typeof res === 'string') {
                    res = res.replace(newItem, newRedItems4Sale[newItems4Sale.indexOf(newItem)]);
                }
            });
            // sendoff html
            // callbacks.html(res);
        }
        else {
            throw new Error("bro shit was not a string that sucks");
        }
    }));
    // });
    bundler_1.server.init();
}
