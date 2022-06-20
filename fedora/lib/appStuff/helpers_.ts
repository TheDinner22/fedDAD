//a helper librsry to help with varies tasks

//dependencies
import crypto from "crypto";
import path from "path";
import fs from "fs";
import util from "util";
import config from "./../appWraperrr/config_"

//create SHA256 hash
export function hash(str: string): string | boolean{
    if(str.length > 0) {
        const hash = crypto.createHmac("sha256",config.hashingSecret).update(str).digest("hex"); //don't really know what this means but its just encrypting the thing with sha256
        return hash
    } else {return false;}
};

export function MD5(str: string): string {
    const hash = crypto.createHash('md5').update(str).digest("hex");
    return hash
};

// create parseJsonToObject function
export function parseJsonToObject(str: string): object{ //parse json string to an object we do this because it means we can aviod throwing an error and instead just return false
    try{
        const obj = JSON.parse(str);
        return obj;
    }catch(e){
        return {};
    }
};

export function objEqual(obj1: object, obj2: object): boolean{
    //compare two objects, if inputs are not objects return false
    return util.isDeepStrictEqual(obj1, obj2);
};

// get the contents of a static (public) assest
export function getStaticAsset(fileName: string, callback: (err: string|boolean, data?: string)=>void): void{
    if(!(fileName.length > 0)){callback("valid filename not specified");return;}

    //define base dir
    const publicDir = path.join(__dirname,"/../../../public/");
    fs.readFile(publicDir+fileName, "utf8",function(err, data){
        if(!err && data){
            callback(false,data);
        } else{callback("no file could be found");}
    });
};
