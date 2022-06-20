"use strict";
// library for storing and editing data locally
//basically our own fs
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localFS = void 0;
//dependencies
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const helpers_1 = require("./../appStuff/helpers_");
class Lib {
    constructor() {
        // base directroy of data folder
        this.baseDir = (path_1.default.join(__dirname, "/../../../"), "data/");
        // promise based crud functions
        this.promiseCreate = (0, util_1.promisify)(this.create).bind(this);
        this.promiseRead = (0, util_1.promisify)(this.read).bind(this);
        this.promiseUpdate = (0, util_1.promisify)(this.update).bind(this);
        this.promiseDelete = (0, util_1.promisify)(this.delete).bind(this);
    }
    overrideDefaultDataPath(dataDirPath) {
        // relative to the root of YOUR project (not fedora)
        this.baseDir = path_1.default.join(__dirname, "/../../../", dataDirPath);
    }
    // method to trim dir and filename
    createPathToFile(dir, fileName) {
        return path_1.default.join(this.baseDir, dir.trim(), fileName.trim() + ".json");
    }
    ;
    //function that writes data to a file
    create(dir, fileName, data, callback) {
        // if filename is false, set it to be ""
        fileName = fileName === false ? "" : fileName + "";
        // if filename has . in it, error
        if (fileName.indexOf(".") > -1) {
            callback({ error: "filename must not contain '.' file extension is added under the hood" });
            return;
        }
        // if data is object array, error
        if (Array.isArray(data) || typeof (data) !== "object") {
            callback({ error: `only accepts Object not Object[] for data. when data was:${data}` });
            return;
        }
        // trim inputs, create path to file
        const pathToFile = this.createPathToFile(dir, fileName);
        //try to open file for writing 
        fs_1.default.open(pathToFile, "wx", (err, fileDescriptor) => {
            // errror checking
            if (err || !fileDescriptor) {
                callback({ error: `Could not create new file at path ${pathToFile}, prolly alredy exists or missing directory` });
                return;
            }
            //convert data to string (this will always send and recive json)
            const stringData = JSON.stringify(data); // TODO check typeof data in all crud oporations
            //write to file
            fs_1.default.writeFile(fileDescriptor, stringData, function (err) {
                // errror checking
                if (err) {
                    callback({ "error": "error writing to newly made file (check data)" });
                    return;
                }
                // close file
                fs_1.default.close(fileDescriptor, function (err) {
                    // errror checking
                    if (err) {
                        callback({ "error": "error closing new file" });
                        return;
                    }
                    callback(false); //this is for sending errors so false is basically like saying "it worked"
                });
            });
        });
    }
    ;
    //funciton that can read from a file
    read(dir, fileName, callback) {
        // if fileName is Object error
        if (typeof (fileName) !== "string") {
            callback({ error: `filename was not == to string` });
            return;
        }
        // trim inputs
        const pathToFile = this.createPathToFile(dir, fileName);
        fs_1.default.readFile(pathToFile, "utf8", (err, data) => {
            // error checking
            if (err || !data) {
                const e = (err === null || err === void 0 ? void 0 : err.message) && err.name ? `${err.name}\n\n${err.message}` : `no error so maybe there was no data??\ndata=\n${data}`;
                callback({ error: e });
                return;
            }
            const parsedData = (0, helpers_1.parseJsonToObject)(data);
            callback(false, [parsedData]);
        });
    }
    ;
    // funtion that ""updates"" (writes to) data in a file
    update(dir, fileName, newData, callback) {
        // if filename is an object, error
        if (typeof (fileName) !== "string") {
            callback({ error: `filename was an object but I only take string` });
            return;
        }
        // newData isnt an object error
        if (typeof (newData) !== "object" || Array.isArray(newData)) {
            callback({ error: "newData was an array or not an object!" });
            return;
        }
        // trim inputs
        const pathToFile = this.createPathToFile(dir, fileName);
        //open the file for writing
        fs_1.default.open(pathToFile, "r+", (err, fileDescriptor) => {
            // error checking
            if (err || !fileDescriptor) {
                callback({ error: 'Could not open file for ""updating"", it may not exist' });
                return;
            }
            //convert data to string (this will always send and recive json)
            const stringData = JSON.stringify(newData);
            //truncate file
            fs_1.default.ftruncate(fileDescriptor, (err) => {
                if (err) {
                    callback({ error: "error truncating file" });
                    return;
                }
                //write to file
                fs_1.default.writeFile(fileDescriptor, stringData, (err) => {
                    // error checking
                    if (err) {
                        callback({ error: "Error writing to existing file" });
                        return;
                    }
                    // close file
                    fs_1.default.close(fileDescriptor, (err) => {
                        if (err) {
                            callback({ error: "error closing the existing file" });
                            return;
                        }
                        callback(false);
                    });
                });
            });
        });
    }
    ;
    //function for deleting a file
    delete(dir, fileName, callback) {
        // if filename is an object, error
        if (typeof (fileName) !== "string") {
            callback({ error: `filename was an object but I only take string` });
            return;
        }
        // trim inputs
        const pathToFile = this.createPathToFile(dir, fileName);
        //unlink the file (remove it from the fs)
        fs_1.default.unlink(pathToFile, (err) => {
            // error checking
            if (err) {
                callback({ error: "error deleting file" });
                return;
            }
            callback(false);
        });
    }
    ;
    // List all the items in a dir
    list(dir, callback) {
        fs_1.default.readdir(this.baseDir + dir + "/", (err, data) => {
            // error checking
            if (err || !data || data.length === 0) {
                const e = (err === null || err === void 0 ? void 0 : err.message) && err.name ? `${err.name}\n\n${err.message}` : "no error so maybe there were no dirs??";
                callback({ error: e }, data);
                return;
            }
            let trimmedFileNames = [];
            data.forEach(function (fileName) {
                trimmedFileNames.push(fileName.replace(".json", ""));
            });
            callback(false, trimmedFileNames);
        });
    }
    ;
}
;
exports.localFS = new Lib();
