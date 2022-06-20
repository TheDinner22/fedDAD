"use strict";
/*
-pick one of the db options (local fs, atlas API, atlas NPM SDK)
-make standard data types
-abstract away the crud oporations
-das it bb (every method uses json)

*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fullDataSystem = void 0;
// config stuff
const config_1 = __importDefault(require("./../appWraperrr/config_"));
const use = config_1.default.use;
const envName = config_1.default.envName;
// my favorite function
const util_1 = require("util");
// TODO make me better
// db modules
const local_1 = require("./local_");
const atlasAPI_1 = require("./atlas/atlasAPI_");
class Data {
    constructor(dataDirPath) {
        // place to store any and all data structures
        this._dataStructures = {};
        // promise based crud functions
        this.promiseCreate = (0, util_1.promisify)(this.create).bind(this);
        this.promiseRead = (0, util_1.promisify)(this.read).bind(this);
        this.promiseUpdate = (0, util_1.promisify)(this.update).bind(this);
        this.promiseDelete = (0, util_1.promisify)(this.delete).bind(this);
        this.switchActiveDB(use);
    }
    //
    createDataStructure(dsName, structureObj) {
        const keys = Object.keys(structureObj);
        if (keys.length === 0) {
            throw Error(`Either structureObj was not an object and its keys were unacceptable types.\nacceptable types:\n${["bigint", "boolean", "function", "number", "object", "string", "symbol", "undefined"]}\n----------OR--------------\ndsName was not a string or it was an empty string`);
        }
        // add data structre to list
        this._dataStructures[dsName] = structureObj;
    }
    ;
    switchActiveDB(use) {
        // determine what db/fs we will be using
        switch (use) {
            case "FS":
                this._data = local_1.localFS;
                break;
            // case "ATLAS":
            //     import ATLAS from "./atlas/atlasDB_";
            //     this._data = ATLAS;
            //     break;
            case "ATLAS/API":
                this._data = atlasAPI_1.atlasApi;
                break;
            default:
                throw Error(`no or bad db/fs specified in config_. {use : \x1b[31m${use}\x1b[0m}\nPlease set a 'use' keyword on the ${envName} enviroment!`);
        }
    }
    ;
    validateData(dsName, stuff) {
        const ds = this._dataStructures[dsName];
        if (typeof (ds) === "undefined") {
            return false;
        }
        const stuffAsArr = Array.isArray(stuff) ? stuff : [stuff];
        // stuff is a docList
        let docIsOk = true;
        stuffAsArr.forEach(doc => {
            const stuffKeys = Object.keys(doc);
            if (stuffKeys.length != Object.keys(ds).length) {
                docIsOk = false;
                return;
            }
            if (!stuffKeys.every((key) => typeof (doc[key]) == ds[key])) {
                docIsOk = false;
                return;
            }
        });
        return docIsOk;
    }
    ;
    // NOTE i had already used 'data' a lot so ill
    // be using 'stuff' in place of it to avoid confusion
    // create
    create(collection, uid, dsName, stuff, callback) {
        const valid = this.validateData(dsName, stuff);
        if (!valid) {
            callback({ "error": "dsName or 'stuff' (data) was not valid or did not match" });
            return;
        }
        // attempt to create the data
        this._data.create(collection, uid, stuff, (err, results) => {
            // error checking
            if (err) {
                callback(err);
                return;
            }
            callback(false, results);
        });
    }
    ;
    // read TODO fix and bug test me
    read(collection, find, callback) {
        this._data.read(collection, find, callback); // one line ezezzezeez
    }
    ;
    // update
    update(collection, dsName, find, replace, callback) {
        // validate data
        const valid = this.validateData(dsName, replace);
        if (!valid) {
            callback({ "error": "dsName or 'replace' (data) was not valid or did not match" });
            return;
        }
        this._data.update(collection, find, replace, callback);
    }
    ;
    // delete
    delete(collection, find, callback) {
        this._data.delete(collection, find, callback); // one line ezzzz
    }
    ;
}
;
exports.fullDataSystem = new Data();
// switch to default DB/FS specified in fs TODO is this bad bad bad??? A: YES!!
// data.switchActiveDB(use);
// Testing!!!! del me TODOTODOTODOTODOTODOTODO
// data.createDataStructure("users", {
//     name : "string",
//     age: 'number',
//     tall : 'boolean'
// });
// local!
// data.create('', "fileBean", 'users', {
//     name : "joey",
//     age: 22,
//     tall : false
// }, (err, results)=>{
//     console.log(err);
//     console.log(results);
// });
// data.read("", "filey", (err, res)=>{
//     console.log(err);
//     console.log(res);
// });
// data.update("", "users", "fileBean", {"idek":'man123'}, (err)=>{
//     console.log(err);
// });
// data.delete("", "fileBean", (err, delCount)=>{
//     console.log(err);
//     console.log(delCount);
// });
// atlas!!
// data.switchActiveDB("ATLAS/API");
// let dl = [{name : "goseph", age: 69,tall : true}, {name : "joes",age: 69,tall : true}, {name : "joe123",age: 69,tall : true}, {name : "joey",age: 69,tall : true}]
// data.create('test', 'name', 'users', dl, (err, results)=>{
//     console.log(err);
//     console.log(results);
// });
// dl = {name : "joey", age : 69};
// data.read('test', dl, (err, res)=>{
//     console.log(err);
//     console.log(res);
// });
// const replace = {"name" : "bread", "tall" : true, "age" : 10000};
// data.update('test', "users", {age : 69}, replace, (err)=>{
//     console.log(err);
// });
// data.delete("test", {age : 10000}, (err, delCount)=>{
//     console.log(err);
//     console.log(delCount);
// });
