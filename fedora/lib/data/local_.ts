// library for storing and editing data locally
//basically our own fs

//dependencies
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { parseJsonToObject } from "./../appStuff/helpers_";
import { errorObj } from "./atlas/atlasAPI_";

class Lib {
    // base directroy of data folder
    private baseDir: string = (path.join(__dirname, "/../../../"), "data/");

    // promise based crud functions
    promiseCreate = promisify(this.create).bind(this);
    promiseRead = promisify(this.read).bind(this);
    promiseUpdate = promisify(this.update).bind(this);
    promiseDelete = promisify(this.delete).bind(this);

    overrideDefaultDataPath(dataDirPath: string){ // data dir is the path to your data folder
                                                   // relative to the root of YOUR project (not fedora)
        this.baseDir = path.join(__dirname, "/../../../", dataDirPath);
    }

    // method to trim dir and filename
    private createPathToFile(dir: string, fileName: string){
        return path.join(this.baseDir, dir.trim(), fileName.trim() + ".json");
    };

    //function that writes data to a file
    create(dir: string, fileName: string | false, data: Object | Object[], callback: (err: false | errorObj) => void){
        // if filename is false, set it to be ""
        fileName = fileName === false ? "" : fileName + "";
        // if filename has . in it, error
        if(fileName.indexOf(".") > -1){callback({error: "filename must not contain '.' file extension is added under the hood"});return;}

        // if data is object array, error
        if(Array.isArray(data) || typeof(data) !== "object"){callback({error: `only accepts Object not Object[] for data. when data was:${data}`});return;}

        // trim inputs, create path to file
        const pathToFile = this.createPathToFile(dir, fileName);
    
        //try to open file for writing 
        fs.open(pathToFile, "wx", (err, fileDescriptor) => {
            // errror checking
            if (err || !fileDescriptor){callback({error : `Could not create new file at path ${pathToFile}, prolly alredy exists or missing directory`});return;}

            //convert data to string (this will always send and recive json)
            const stringData = JSON.stringify(data); // TODO check typeof data in all crud oporations

            //write to file
            fs.writeFile(fileDescriptor, stringData, function(err){
                // errror checking
                if (err) {callback({"error" : "error writing to newly made file (check data)"});return;}

                // close file
                fs.close(fileDescriptor, function(err){
                    // errror checking
                    if (err) {callback({"error":"error closing new file"});return;}

                    callback(false); //this is for sending errors so false is basically like saying "it worked"
                });
            });
        });
    };

    //funciton that can read from a file
    read(dir: string, fileName: string | Object, callback: (err: errorObj, data?: Object[]) => void){
        // if fileName is Object error
        if(typeof(fileName) !== "string"){callback({error: `filename was not == to string`});return;}

        // trim inputs
        const pathToFile = this.createPathToFile(dir, fileName);
        
        fs.readFile(pathToFile, "utf8", (err, data) => {
            // error checking
            if(err || !data){
                const e = err?.message && err.name ? `${err.name}\n\n${err.message}` : `no error so maybe there was no data??\ndata=\n${data}`;
                callback({error: e});
                return;     
            }

            const parsedData = parseJsonToObject(data);
            callback(false, [ parsedData ]);
        });
    };

    // funtion that ""updates"" (writes to) data in a file
    update(dir: string, fileName: string | Object, newData: Object, callback: (err: errorObj)=> void ){
        // if filename is an object, error
        if(typeof(fileName) !== "string"){callback({error:`filename was an object but I only take string`});return;}
        // newData isnt an object error
        if(typeof(newData) !== "object" || Array.isArray(newData)){callback({error: "newData was an array or not an object!"});return;}

        // trim inputs
        const pathToFile = this.createPathToFile(dir, fileName);

        //open the file for writing
        fs.open(pathToFile, "r+", (err, fileDescriptor) => {
            // error checking
            if(err || !fileDescriptor){callback({error : 'Could not open file for ""updating"", it may not exist'});return;}

            //convert data to string (this will always send and recive json)
            const stringData = JSON.stringify(newData);

            //truncate file
            fs.ftruncate(fileDescriptor, (err) => {
                if (err){callback({error : "error truncating file"});return;}

                //write to file
                fs.writeFile(fileDescriptor,stringData, (err) => {
                    // error checking
                    if(err) {callback({error : "Error writing to existing file"});return;}
                        
                    // close file
                    fs.close(fileDescriptor, (err) => {
                        if (err) {callback({error : "error closing the existing file"});return;}

                        callback(false);
                    });
                });
            });
        });
    };

    //function for deleting a file
    delete(dir: string, fileName: object | string, callback: (err: errorObj) => void){
        // if filename is an object, error
        if(typeof(fileName) !== "string"){callback({error:`filename was an object but I only take string`});return;}

        // trim inputs
        const pathToFile = this.createPathToFile(dir, fileName);

        //unlink the file (remove it from the fs)
        fs.unlink(pathToFile, (err) => {
            // error checking
            if(err){callback({error : "error deleting file"});return;}

            callback(false);
        });
    };

    // List all the items in a dir
    list(dir: string, callback: (err: errorObj, data: string[]) => void){ //TODO use path.join here
        fs.readdir(this.baseDir + dir + "/", (err, data) => {  //nodes built in fs thing for listing things in a dir
            // error checking
            if(err || !data || data.length === 0){
                const e = err?.message && err.name ? `${err.name}\n\n${err.message}` : "no error so maybe there were no dirs??";
                callback({error : e}, data);
                return;
            }

            let trimmedFileNames: string[] = [];
            data.forEach(function(fileName){
                trimmedFileNames.push(fileName.replace(".json", ""));
            });
            callback(false,trimmedFileNames);
        });
    };
};

export let localFS = new Lib()
