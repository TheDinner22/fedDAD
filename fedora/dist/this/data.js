"use strict";
/**
 *
 * handle reading and writing stupid json str
 * collection name: only
 * must have uid: 1
 *
 *
 * this shit is untested!
 */
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
exports.promiseGet = exports.get = exports.promiseSave = void 0;
const bundler_1 = require("../appWraperrr/bundler_");
const config_1 = __importDefault(require("../appWraperrr/config_"));
const util_1 = require("util");
const parserParser_1 = require("./parserParser");
// create ds
bundler_1.MYfs.createDataStructure("JSONSTR", {
    "str": "string",
    "uid": "number"
});
function save(JSONStr, callback) {
    // depends on which use there is!!!!
    if (config_1.default.use === "FS") {
        bundler_1.MYfs.update("", "JSONSTR", "storage", { "str": JSONStr, "uid": 1 }, (err) => {
            if (err) {
                callback(err);
            }
            else {
                callback(false);
            }
        });
    }
    else if (config_1.default.use === "ATLAS/API") {
        bundler_1.MYfs.update("only", "JSONSTR", { uid: 1 }, { str: JSONStr, uid: 1 }, (err) => {
            if (err) {
                callback(err);
            }
            else {
                callback(false);
            }
        });
    }
    else {
        throw new Error("no use provided to save funcLLLLLLl");
    }
}
;
exports.promiseSave = (0, util_1.promisify)(save);
function get(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        // depends on which use there is!!!!
        if (config_1.default.use === "FS") {
            bundler_1.MYfs.read("", "storage", (err, data) => {
                if (err) {
                    callback(err);
                    return;
                }
                if (typeof data === "undefined") {
                    callback({ 'error': "there was no data" });
                    return;
                }
                const Obj = data[0];
                const storedData = { uid: 1, str: Obj["str"] };
                const storedJsonStr = storedData.str;
                if (typeof storedJsonStr !== "string") {
                    callback({ error: `stored json str was not a string, it was ${typeof storedJsonStr}!` });
                    return;
                }
                // fix the storedJsonStr
                const HTMLObjArr = (0, parserParser_1.convertJSONStrToObj)(storedJsonStr);
                callback(false, HTMLObjArr);
            });
        }
        else if (config_1.default.use === "ATLAS/API") {
            bundler_1.MYfs.read("only", { uid: 1 }, (err, data) => {
                if (err) {
                    callback(err);
                    return;
                }
                if (typeof data === "undefined") {
                    callback({ 'error': "there was no data" });
                    return;
                }
                const Obj = data[0];
                const storedData = { uid: 1, str: Obj["str"] };
                const storedJsonStr = storedData.str;
                if (typeof storedJsonStr !== "string") {
                    callback({ error: `stored json str was not a string, it was ${typeof storedJsonStr}!` });
                    return;
                }
                // fix the storedJsonStr
                const HTMLObjArr = (0, parserParser_1.convertJSONStrToObj)(storedJsonStr);
                callback(false, HTMLObjArr);
            });
        }
        else {
            throw new Error("no use provided to get funcLLLLLLl");
        }
    });
}
exports.get = get;
;
exports.promiseGet = (0, util_1.promisify)(get);
/*
if (require.main === module) {
    myMain();
}

async function myMain(){
    const JSONSTR = await parseParseParse();
    if(typeof JSONSTR === "string"){
        await promiseSave(JSONSTR);
    }
    
    const res55 = await promiseGet();
    if(typeof res55 === "undefined" || typeof res55 === "string"){console.log('get returned wrong type!');return;}
    // console.log(res55)
};*/
