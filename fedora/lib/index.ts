// testing a WIP fedora by making a TODO app on localhost with it
import {server, router, MYfs} from "./appWraperrr/bundler_";
import fs from "fs";
import https from 'https';
import { StringDecoder as stringDec} from "string_decoder"

interface errorLike {
    error: string
    name?: string
}
type callbackLike = (error: errorLike | false, res?: string) => void;



// get the html for the webpage
function sendREQ(callback: callbackLike){
    //configure request details
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

// parse the HTML to get the items4sale
function parseHTML(rawHtml: string){
    const startFind = 'bodytext">';
    const endFind = '';

    const startI = rawHtml.indexOf(startFind) + (startFind.length-1)
    const endI = rawHtml.indexOf(endFind) + (endFind.length);


    console.log(rawHtml.slice(startI+1, 2900))
};


// sendREQ((e, res)=>{
//     parseHTML(res || '');
// });

// index html route
router.get("", (data, callbacks) =>{
    sendREQ((e, res) => {
        callbacks.html(res || '');
    });
});

server.init();