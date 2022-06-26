// testing a WIP fedora by making a TODO app on localhost with it
import {server, router, MYfs} from "./appWraperrr/bundler_";
import { parseParseParse, convertJSONStrToObj } from "./this/parserParser";
import { promiseGet, promiseSave } from "./this/data";
import { compareJSON } from "./this/comparer";
import { inject } from "./this/injector";
import fs from "fs";
import https from 'https';
import { StringDecoder as stringDec} from "string_decoder"

interface errorLike {
    error: string
    name?: string
}

import { getElementFromOpenBracketReturnLike } from "./this/parser";

export type callbackLike = (error: errorLike | false, res?: string | getElementFromOpenBracketReturnLike[]) => void;

// get the html for the webpage
export function sendREQ(callback: callbackLike){
    //configure request details to go to www.centipedepress.com/scratchanddents.html
    const requestDetails = {
        "protocol" : "https:",
        "hostname" : "www.centipedepress.com",
        "method" : "GET",
        "path" : "/scratchanddents.html",
    };

    //instantiate the request object including telling what we do when we get the request response back (this does not send the request)
    const req = https.request(requestDetails,function(res){
        // for if there is a response payload
        const decoder = new stringDec('utf-8');
        let holder = "";
        res.on("data", (d)=>{
            holder += decoder.write(d);
        })

        res.on("end", ()=>{
            // cap decoder
            holder += decoder.end();

            // grab the status of the sent request
            const status = res.statusCode;

            // callback if the request went through
            if(status == 200 || status == 201){
                // get the payload (if it exists)

                callback(false, holder);
            } else{callback({"error":"status code returned by atlasAPI was " + status});}
        });


        //bind to the error event just in case
        res.on("error", function(e){
            console.log("There was an error with the atlas api htpps request's response object LLLLL");
            callback({error : `${e.name}\n\n${e.message}`});
        });
    });

    //bind to the error event so that it does not get thrown
    req.on("error",function(e){
        const errorObj = {'error' : e.message, 'name': e.name};
        callback(errorObj);
    });

    //end the request (same as sending it off)
    req.end();
};

if (require.main === module) {

    // index html route
    router.get("", (data, callbacks) =>{
        sendREQ(async (e, res) => {
            if(typeof res === "string"){
                // parse the incoming html
                console.log('1')
                const incomingJSONStr = await parseParseParse(res);
                console.log('2')
                if(typeof incomingJSONStr !== 'string'){throw new Error("idk man no stringy boi LLLL");}
                console.log('3')
                const incomingObjArr = convertJSONStrToObj(incomingJSONStr);
                console.log('4')

                // get previous pages JSON str and objArr
                console.log('5')
                const prevObjArr = await promiseGet();
                console.log('6')
                if(typeof prevObjArr === "undefined" || typeof prevObjArr === "string"){throw new Error("prevObjArr was not right type");}

                // compare
                const newItems4Sale = compareJSON(prevObjArr, incomingObjArr);

                // inject red
                const newRedItems4Sale = inject(newItems4Sale);

                // store recent                
                await promiseSave(incomingJSONStr);

                //replace with red
                newItems4Sale.forEach((newItem) => {
                    if(typeof res === 'string'){
                        res = res.replace(newItem, newRedItems4Sale[newItems4Sale.indexOf(newItem)])
                    }
                });

                // sendoff html
                callbacks.html(res);
            }
            else{throw new Error("bro shit was not a string that sucks");}
        });
    });
    
    server.init();
}
