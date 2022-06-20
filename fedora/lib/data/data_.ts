/* 
-pick one of the db options (local fs, atlas API, atlas NPM SDK)
-make standard data types
-abstract away the crud oporations 
-das it bb (every method uses json)

*/

// types
import { okToUse } from "./../appWraperrr/config_";
// for when i literally want to allow any value type for object (which i do becuase its user inputed data)
import { errorObj } from "./atlas/atlasAPI_";
import { APIresponse } from "./atlas/atlasAPI_";

type okTypes = "bigint" | "boolean" | "function" | "number" | "object" | "string" | "symbol" | "undefined";
type structureObj = { [path: string]: okTypes };

// config stuff
import config from "./../appWraperrr/config_";
const use = config.use;
const envName = config.envName;

// my favorite function
import { promisify } from "util";

// TODO make me better
// db modules
import { localFS } from "./local_";
import { atlasApi } from "./atlas/atlasAPI_";

class Data {
    private _data!: typeof localFS | typeof atlasApi;
    // place to store any and all data structures
    private _dataStructures: { [path: string]: structureObj } = {};

    // promise based crud functions
    promiseCreate = promisify(this.create).bind(this);
    promiseRead = promisify(this.read).bind(this);
    promiseUpdate = promisify(this.update).bind(this);
    promiseDelete = promisify(this.delete).bind(this);

    constructor(dataDirPath?: string){
        this.switchActiveDB(use);
    }

    //
    createDataStructure(dsName: string, structureObj: structureObj){
        const keys = Object.keys(structureObj);
        if(keys.length === 0){throw Error(`Either structureObj was not an object and its keys were unacceptable types.\nacceptable types:\n${["bigint", "boolean", "function", "number", "object", "string", "symbol", "undefined"]}\n----------OR--------------\ndsName was not a string or it was an empty string`);}

        // add data structre to list
        this._dataStructures[dsName] = structureObj;
    };

    switchActiveDB(use: okToUse){
        // determine what db/fs we will be using
        switch (use) {
            case "FS":
                this._data = localFS;
                break;

            // case "ATLAS":
            //     import ATLAS from "./atlas/atlasDB_";
            //     this._data = ATLAS;
            //     break;

            case "ATLAS/API":
                this._data = atlasApi;
                break;

            default:
                throw Error(`no or bad db/fs specified in config_. {use : \x1b[31m${use}\x1b[0m}\nPlease set a 'use' keyword on the ${envName} enviroment!`)
        }
    };

    private validateData(dsName: string, stuff: Object | Array<Object>): boolean{
        const ds = this._dataStructures[dsName];
        if (typeof(ds) === "undefined"){return false;}

        const stuffAsArr: Array<Object> = Array.isArray(stuff) ? stuff : [ stuff ];

        // stuff is a docList
        let docIsOk = true;
        stuffAsArr.forEach(doc => {
            const stuffKeys = Object.keys(doc);
            if(stuffKeys.length != Object.keys(ds).length){
                docIsOk = false;
                return;
            }
            
            if(!stuffKeys.every((key) => typeof(doc[key as keyof Object]) == ds[key])){
                docIsOk = false;
                return;
            }
        });

        return docIsOk;
    };


    // NOTE i had already used 'data' a lot so ill
    // be using 'stuff' in place of it to avoid confusion
    // create
    create(collection: string, uid: string | false, dsName: string, stuff: Object | Array<Object>, callback: (err: false|errorObj, results?: APIresponse["insertedIds"])=>void){ //TODO what type is results
        const valid = this.validateData(dsName, stuff);
        if(!valid){callback({"error":"dsName or 'stuff' (data) was not valid or did not match"});return;}
            
        // attempt to create the data
        this._data.create(collection, uid, stuff, (err: errorObj, results?: APIresponse["insertedIds"]) => { // NOTE TODO got to here before needing to go and work on other files
            // error checking
            if(err){callback(err);return;}
            
            callback(false, results);
        });
    };

    // read TODO fix and bug test me
    read(collection: string, find: Object | string, callback: (err: errorObj, data?: Object[]) =>  void ){
        this._data.read(collection, find, callback); // one line ezezzezeez
    };

    // update
    update(collection: string, dsName: string, find: string | Object, replace: Object, callback: (err: errorObj) => void){
        // validate data
        const valid = this.validateData(dsName, replace);
        if(!valid){callback({"error":"dsName or 'replace' (data) was not valid or did not match"});return;}

        this._data.update(collection, find, replace, callback);
    };

    // delete
    delete(collection: string, find: string | Object, callback: (err: errorObj, deletedCount?: APIresponse["deletedCount"]) => void){
        this._data.delete(collection, find, callback); // one line ezzzz
    };
};


export let fullDataSystem = new Data();




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
