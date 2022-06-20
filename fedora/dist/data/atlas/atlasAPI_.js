"use strict";
// interact with atlas DB using an api endpoint and https
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.atlasApi = void 0;
const https_1 = require("https");
const util_1 = require("util");
const string_decoder_1 = require("string_decoder");
const config_1 = __importDefault(require("./../../appWraperrr/config_"));
class AtlasAPI {
    constructor() {
        // promise based crud functions
        this.promiseCreate = (0, util_1.promisify)(this.create).bind(this);
        this.promiseRead = (0, util_1.promisify)(this.read).bind(this);
        this.promiseUpdate = (0, util_1.promisify)(this.update).bind(this);
        this.promiseDelete = (0, util_1.promisify)(this.delete).bind(this);
    }
    validateDocList(docList) {
        // list of objects was passed
        if (docList.length > 0) {
            let flag = true;
            // make sure the docs all have keys (basically doc != {})
            for (let i = 0; i < docList.length; i++) {
                const doc = docList[i];
                if (Object.keys(doc).length === 0) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    ;
    // make https req to through atlas db
    sendReq(action, collection, docList, callback) {
        var _a;
        // validate docList
        const isValid = this.validateDocList(docList);
        if (!isValid) {
            callback({ "error": "The docList provided was invalid" });
            return;
        }
        // validate collection
        if (config_1.default.okCollections !== undefined && ((_a = config_1.default.okCollections) === null || _a === void 0 ? void 0 : _a.indexOf(collection)) === -1) {
            callback({ error: `the collection provided: (${collection}) was not in the list of ok collecitons` });
            return;
        }
        const payload = {
            "dataSource": config_1.default.CLUSTER_NAME || "test",
            "database": config_1.default.DB_NAME || "myDataBase",
            "collection": collection,
        };
        // either add document or filter here (depending on the specified action)
        switch (action) {
            case "insertMany":
                payload.documents = docList;
                break;
            case "replaceOne":
                payload.filter = docList[0]; // find
                payload.replacement = docList[1]; // replace
                break;
            case "find":
                payload.filter = docList[0]; // find
                break;
            case "deleteMany":
                payload.filter = docList[0]; // find
                break;
            default:
                console.error("NO ACTION ASSIGNED TO PAYLOAD. literally how are you seeing this error message?!");
                break;
        }
        //stringify payload
        const stringPayload = JSON.stringify(payload);
        //configure request details
        const requestDetails = {
            "protocol": "https:",
            "hostname": "data.mongodb-api.com",
            "method": "POST",
            "path": `/app/${config_1.default.DATA_API_ID}/endpoint/data/beta/action/${action}`,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Request-Headers": "*",
                "api-key": config_1.default.DATA_KEY,
            }
        };
        //instantiate the request object including telling what we do when we get the request response back (this does not send the request)
        const req = (0, https_1.request)(requestDetails, function (res) {
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
                    const resPayload = JSON.parse(holder);
                    callback(false, resPayload);
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
            console.log('There was an error with the atlas api htpps request LLLLL');
            callback({ error: `${e.name}\n\n${e.message}` });
        });
        // add the payload to the request
        req.write(stringPayload);
        //end the request (same as sending it off)
        req.end();
    }
    ;
    // Create (one or many) - errors if a uid is specified and that uid exists in the db
    // uid is a string and should be a key on the object[s] in dl. For example "name", "email", or "username"
    // if the uid key-value pair already exists in db, the function will calllback error and nothing will be created 
    // uid is false by default and wont do anything (no checking to see if it already exists) if it's false
    // TODO is the way i made this ok?????
    create(collection, uid, stuff, callback) {
        // make sure dl is a docList
        const dl = Array.isArray(stuff) ? stuff : [stuff];
        if (uid === false) {
            this.sendReq("insertMany", collection, dl, (err, result) => {
                var _a, _b;
                // error checking
                if (err || !result) {
                    callback(err || { "error": "there was no error but also no result" });
                    return;
                } //TODO vauge much??
                if (((_a = result.insertedIds) === null || _a === void 0 ? void 0 : _a.length) !== (dl.length)) {
                    callback({ "error": `only inserted ${(_b = result.insertedIds) === null || _b === void 0 ? void 0 : _b.length} docs when ${dl.length} were given!` });
                    return;
                }
                callback(false, result.insertedIds);
            });
        }
        else {
            // make sure uid is key in every object TODO maybe Object.keys() is better here???
            if (dl.some((doc) => doc[uid] === undefined)) {
                callback({ "error": `${uid} was not a key in all objects in docList` });
                return;
            }
            // check to see if any of the docs have the same uid value
            // if they do, callback the error and return to kill the function
            // TODO does this catch objects and lists?
            const valuesSet = new Set();
            dl.forEach((doc) => {
                // sets cant differentiate between a = ['a'] and b = ['a']
                // 'they occupy different spaces in memory' bs!
                // stringify to normalize stuff like that
                let uidObj = {};
                uidObj[uid] = doc[uid];
                const uidObjStr = JSON.stringify(uidObj);
                valuesSet.add(uidObjStr);
            });
            if (valuesSet.size != dl.length) {
                callback({ "error": `some docs in the given docList shared uid values when uid = ${uid}` });
                return;
            }
            // check to see if {uid : value} already exists in db
            let foundUid = false;
            for (let i = 0; i < dl.length; i++) {
                const doc = { [uid]: dl[i][uid] };
                this.read(collection, doc, (_, result) => {
                    if (result !== undefined && result.length > 0) {
                        foundUid = true;
                    }
                    // if this is the last iter of for loop...     //TODO this is bad??? BREAKS
                    if (i == (dl.length - 1)) {
                        // and foundUid is false, create the docs
                        if (foundUid) {
                            callback({ "error": `uid conflict! nothing created!LLL` });
                            return;
                        }
                        this.sendReq("insertMany", collection, dl, (err, result) => {
                            var _a, _b;
                            if (err || !result) {
                                callback(err);
                                return;
                            }
                            if (((_a = result.insertedIds) === null || _a === void 0 ? void 0 : _a.length) !== dl.length) {
                                callback({ "error": `only inserted ${(_b = result.insertedIds) === null || _b === void 0 ? void 0 : _b.length} docs when ${dl.length} were given!` });
                                return;
                            }
                            callback(false, result.insertedIds);
                        });
                    }
                });
            }
        }
    }
    ;
    // Read (one or many) - errors if nothing is found
    read(collection, find, callback) {
        // if find is a string error
        if (typeof (find) === "string") {
            callback({ error: "find was a string, I only take object" });
            return;
        }
        this.sendReq("find", collection, [find], (err, result) => {
            var _a;
            // error checking
            if (err || !result) {
                callback(err);
                return;
            }
            if (result.documents === undefined || ((_a = result.documents) === null || _a === void 0 ? void 0 : _a.length) === 0) {
                callback({ "error": "search returned 0 documents!" });
                return;
            }
            // remove _ids from objects
            const trimmedDocs = [];
            for (let i = 0; i < result.documents.length; i++) {
                const doc = result.documents[i];
                delete doc._id;
            }
            callback(false, result.documents);
        });
    }
    ;
    // Update (one and truncate old file) - errors if nothing is updated
    update(collection, find, replace, callback) {
        // if find is a string error
        if (typeof (find) === "string") {
            callback({ error: `find was a string but I only take object` });
            return;
        }
        const dl = [find, replace];
        this.sendReq("replaceOne", collection, dl, (err, result) => {
            if (err || !result) {
                callback(err);
                return;
            }
            if (result.matchedCount !== 1 || result.modifiedCount !== 1) {
                callback({ "error": "could not find anything to update" });
                return;
            }
            callback(false);
        });
    }
    ;
    // delete (one or many) - errors if nothing is deleted
    delete(collection, find, callback) {
        // if find is a string error
        if (typeof (find) === "string") {
            callback({ error: `find was a string but I only take object` });
            return;
        }
        this.sendReq("deleteMany", collection, [find], (err, result) => {
            // error checking
            if (err || !result) {
                callback(err);
                return;
            }
            if (result.deletedCount === undefined || result.deletedCount === 0) {
                callback({ "error": "could not find anything to delete" });
                return;
            }
            callback(false, result.deletedCount);
        });
    }
    ;
}
exports.atlasApi = new AtlasAPI();
// TODO test me!!!
/*
examples on how to use crud operations (assuming you have set up the 4 config vars or supplied them at runtime)

*/
// create - one or many docs, will take { stuff } or [ { stuff } ] or [ { stuff }, { stuff },... ] for the dl arguement
// const dl = [{"bean":"dssiic", "names":"lame"},{"bean":"dssiic", "names":"tame"},{"bean":"dssiic", "names":"l'shame"},{"bean":"dssiic", "names":"fame"},{"bean":"dssiic", "names":"same"}];
// atlasAPI.create("test", uid=false, dl, (err, insertedIds)=>{
//     console.log(err) // false or {"error":"some error here"}
//     console.log(insertedIds); // array of inserted documents' uids
// });
// read - one or many (depends on how many it finds!), will take { stuff } or [ { stuff } ] for dl arguement
// atlasAPI.read("test", {"name" : "lame"}, (err, documents)=>{
//     console.log(err); // false or {"error":"some error here"}
//     console.log(documents); // array of located documents
// });
// update - one, will take { stuff } or [ { stuff } ] for find and rep
// find is deleted and rep is inserted in its place
// const find = {"name":"lame"};
// const rep = {"BBBBBBBBBBBBBBB" : "BBBBBBBBBBBBBBB"};
// atlasAPI.update("test", find, rep, (err)=>{
//     console.log(err); // false or {"error":"some error here"}
// });
// delete - one or many (depends on how many it finds!), will take { stuff } or [ { stuff } ] for dl arguement
// atlasAPI.delete("test", {"bean":"dssiic"}, (err, deletedCount)=>{
//     console.log(err) // false or {"error":"some error here"}
//     console.log(deletedCount) // number of files found and deleted or undefined
// });
// dl stands for docList and { stuff } is a doc
// docs have no name and are identified/found with their key value pairs
//so if {"name" : "john", "age" : 22} is a doc, then it could be found with
// {"name" : "john", "age" : 22}, {"name" : "john"}, and {"age" : 22}
// but not found with {"name" : "john", age : 22, "pets" : "none"}, {"name" : "john", "pets" : "none"}, {age : 22, "pets" : "none"}
