/**
 * 
 * handle reading and writing stupid json str
 * collection name: only
 * must have uid: 1
 * 
 * 
 * this shit is untested!
 */

import { MYfs } from "../appWraperrr/bundler_";
import ENV from "../appWraperrr/config_";
import { callbackLike } from "..";
import { promisify } from "util";
import { convertJSONStrToObj, parseParseParse } from "./parserParser";

interface storedThingAsObj {
    uid: 1
    str: string
}

// create ds
MYfs.createDataStructure("JSONSTR", {
    "str" : "string",
    "uid" : "number"
});

function save(JSONStr: string, callback: callbackLike){
    // depends on which use there is!!!!
    if(ENV.use === "FS"){
        MYfs.update("", "JSONSTR", "storage", {"str": JSONStr, "uid" : 1}, (err) => {
            if(err){
                callback(err);
            }
            else{
                callback(false);
            }
        });
    }
    else if (ENV.use === "ATLAS/API"){
        MYfs.update("only", "JSONSTR", {uid: 1}, {str: JSONStr, uid: 1}, (err) => {
            if(err){
                callback(err);
            }
            else{
                callback(false);
            }
        });
    }
    else{
        throw new Error("no use provided to save funcLLLLLLl");
    }
};

export const promiseSave = promisify(save);

export async function get(callback: callbackLike){
    // depends on which use there is!!!!
    if(ENV.use === "FS"){
        MYfs.read("", "storage", (err, data) => {
            if(err){callback(err);return}
            if(typeof data === "undefined"){callback({'error':"there was no data"});return;}
            const Obj = data[0];
            const storedData: storedThingAsObj = { uid: 1, str: Obj["str" as keyof object]  };
            const storedJsonStr = storedData.str
            if(typeof storedJsonStr !== "string"){callback({error: `stored json str was not a string, it was ${typeof storedJsonStr}!`});return;}

            // fix the storedJsonStr
            const HTMLObjArr = convertJSONStrToObj(storedJsonStr);

            callback(false, HTMLObjArr);
        });
    }
    else if (ENV.use === "ATLAS/API"){
        MYfs.read("only", {uid: 1}, (err, data) =>{
            if(err){callback(err);return}
            if(typeof data === "undefined"){callback({'error':"there was no data"});return;}
            const Obj = data[0];
            const storedData: storedThingAsObj = { uid: 1, str: Obj["str" as keyof object]  };
            const storedJsonStr = storedData.str
            if(typeof storedJsonStr !== "string"){callback({error: `stored json str was not a string, it was ${typeof storedJsonStr}!`});return;}
            
            // fix the storedJsonStr
            const HTMLObjArr = convertJSONStrToObj(storedJsonStr);

            callback(false, HTMLObjArr);
        });
    }
    else{
        throw new Error("no use provided to get funcLLLLLLl");
    }
};

export const promiseGet = promisify(get);
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
