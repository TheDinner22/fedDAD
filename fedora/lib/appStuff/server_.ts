/*
* server related tasks EXPERIMAENRTLALM<DL
*
*/

//dependencies
import http from "http"; //https servers and making a server to listen on 
import url from "url"; //parse urls
import { StringDecoder as stringDec } from "string_decoder"; //string decoder has a lot of stuff but we only want stuff from the decoding class
import https from "https"; //its http all over agian
import fs from "fs"; //read da FILES!!!!
import path from "path"; //normalize paths to different directories
import util from "util"; //built in module used to treat our own modules as built in modules when it comes to NODE_DEBUG and all the error logs in that module
import config from "./../appWraperrr/config_";
import { parseJsonToObject } from "./helpers_";

const debug = util.debuglog("server");

export type callbacks = {
    callback: (statusCode: number, payload?: object | string, contentType?: string) => void;
    html: (payload: string) => void;
    js: (payload: string) => void;
    css: (payload: string) => void;
    jpg: (payload: string) => void;
    png: (payload: string) => void;
    json: (payload: object) => void;
    favicon: (payload: string) => void;
    plain: (payload: string) => void;
};

export type reqData = {
    trimmedPath : string;
    queryStringObject : object;
    method : methods;
    headers : object;
    payload : object;
};

export type handlerFunc = (data: reqData, callbacks: callbacks)=>void;

export type methods = "post" | "get" | "put" | "delete" | "patch" | "all";

// fedora stuff?
import { router } from "./../appWraperrr/router_";

class MyServer {
    private httpServer: http.Server;
    // private httpsServer: https.Server;

    constructor(){
        //creating HTTP server
        this.httpServer = http.createServer((req, res)=>{
            this.unifiedServer(req, res);
        });

        //create HTTPS server
        // const httpsServerOptions = { //TODO readfile utf8 pain???
        //     "key" : fs.readFileSync(path.join(__dirname,"/../../https/key.pem"), "utf8"), //the "Sync" in the function means this happens synchronously which we need bcuz if its not done when the server starts (which happens next line) it won't start
        //     "cert" :  fs.readFileSync(path.join(__dirname,"/../../https/server.crt"), "utf8")
        // };
        // this.httpsServer = https.createServer(httpsServerOptions, (req, res)=>{
        //     this.unifiedServer(req, res);
        // });
    }

    //all the logic for the https and http servers (the standards and ports may be dif but the logic is the same)
    private unifiedServer(req: http.IncomingMessage, res: http.ServerResponse){
        //###from the url we need the url, url path (trimmed), the query string, the http method, any headers, and the payload (or body)###

        //get the url and parse it
        const baseURL: string = req.url || "pleaseError!!thx" // fix the fact that the base URL can be undefined for some stupid reason TODO NOTE!!
        if (baseURL == "pleaseError!!thx"){throw new Error(`req.url was undefined when req was:\n${req}`);}

        const parsedUrl = new url.URL(baseURL, `http://${req.headers.host}`);

        //get the path
        const path = parsedUrl.pathname;
        const trimmedPath = path.replace(/^\/+|\/+$/g,"") //rejex its looks complex but its just so https://www.website.com/foo/ reads as foo and not foo/ because foo and foo/ are the same 
        
        //get the query string as an object
        const queryStringNONObject = parsedUrl.searchParams;//TODO does this work BREAKS this badbadbadbadbadbad
        let queryStringObject: {[path: string]: string} = {};

        queryStringNONObject.forEach((value, name) => {
            queryStringObject[name] = value;
        });


        // get http method (Ex: post, get, put, delete, head)
        const method: methods = req.method?.toLocaleLowerCase() as methods;

        //get the headers as an object
        const headers = req.headers;

        //get the payload, if any
        let decoder = new stringDec('utf-8'); //we need this because payload comes in as a stream
        let holder = ""; //as new data comes in we append it to this var
        req.on("data", function(data){ //req.on means its an event listener
            holder += decoder.write(data); //decode data and append it to 'holder'
        });

        req.on("end", ()=>{ //end always gets called, even with no payload
            //response and logging happens in the end function becuase we know that there is no more data coming from the stream and that the information we have is identical to the information posted by the links request

            holder += decoder.end();

            //construct data object to send to handler
            const data: reqData = { //everything useful from the request that we can easily get to and give to the router/handler
                "trimmedPath" : trimmedPath,
                "queryStringObject" : queryStringObject,
                "method" : method,
                "headers" : headers,
                "payload" : parseJsonToObject(holder)
            };

            // TODO this doesnt work rn choose handler this request should be routed to, if not found, use not found handler
            let chosenHandler = router.getRoute(data);
            if (typeof(chosenHandler) == "undefined"){throw new Error(`chosenHandler was undefined when data was:\n${data}`);}

            // TODO NOTE maybe del me!! this shit is terrible
            const ProcHandlerRes = this.proccesHandlerResponse;
            function callback(statusCode: number, payload?: object | string, contentType?: string){
                ProcHandlerRes(res, data.method, data.trimmedPath, statusCode, payload, contentType);
            }

            const responses: callbacks = {
                // callback
                callback : (statusCode: number, payload?: object | string, contentType?: string) => {
                    callback(statusCode, payload, contentType);
                },

                // html
                html : (payload: string) => {
                    callback(200, payload, "html");
                },

                // js
                js : (payload: string) => {
                    callback(200, payload, "javascript");
                },

                // css
                css : (payload: string) => {
                    callback(200, payload, "css");
                },

                // jpg
                jpg : (payload: string) => {
                    callback(200, payload, "jpg");
                },

                // png
                png : (payload: string) => {
                    callback(200, payload, "png");
                },

                // json
                json : (payload: object) => {
                    callback(200, payload);
                },

                // favicon
                favicon : (payload: string) => {
                    callback(200, payload, "favicon");
                },

                // plain
                plain : (payload: string) => {
                    callback(200, payload, "plain");
                },
                // TODO download
            }

            //route the request to the handler specified in the router
            try{
                chosenHandler(data, responses);
            }catch(e){
                // debug(e as string)
                console.log(e as string)
                this.proccesHandlerResponse(res, method, trimmedPath, 500, {"error":"something really bad just happened"},"json");
            }
        });  
    };

    //this is that callback
    private proccesHandlerResponse(res: http.ServerResponse, method: methods, trimmedPath: string, statusCode?: number, payload?: object | string, contentType?: string){
        // determine the type of response (default to JSON)
        contentType = typeof(contentType) == "string" ? contentType : "json";

        //use the status code called back by the handler, or default at 200
        statusCode = typeof(statusCode) == "number" ? statusCode : 200;

        //return the response parts that are content-type specific
        let payloadString: string | object = "";
        switch (contentType) {
            case "json":
                payload = typeof(payload) === "object" ? payload : {};
                payloadString = JSON.stringify(payload);
                res.setHeader("Content-Type", "application/json");
                break;
            case "html":
                res.setHeader("Content-Type", "text/html");
                payloadString = typeof(payload) === "string" ? payload : "";
                break; 
            case "favicon":
                res.setHeader("Content-Type", "image/x-icon");
                payloadString = typeof(payload) !== "undefined" ? payload : "";
                break;
            case "javaScript":
                res.setHeader("Content-Type", "text/javascript"); // TODO some type of error here, I think res.end is being called multiple times somehow
                payloadString = typeof(payload) === "string" ? payload : "";
                break;
            case "css":
                res.setHeader("Content-Type", "text/css");
                payloadString = typeof(payload) !== "undefined" ? payload : "";
                break;
            case "png":
                res.setHeader("Content-Type", "image/png");
                res.setHeader("Cache-Control", "max-age=31536000");
                payloadString = typeof(payload) !== "undefined" ? payload : "";
                break;
            case "jpg":
                res.setHeader("Content-Type", "image/jpeg");
                res.setHeader("Cache-Control", "max-age=31536000");
                payloadString = typeof(payload) !== "undefined" ? payload : "";
                break;
            case "plain":
                res.setHeader("Content-Type", "text/plain");
                payloadString = typeof(payload) !== "undefined" ? payload : "";
                break;
            default:
                break;
        }

        //return the response parts that are common in all content-types
        res.writeHead(statusCode);
        res.end(payloadString);            

        //if the response is 200 print in green otherwise print red
        if(statusCode == 200){
            debug("\x1b[32m%s\x1b[0m",method.toUpperCase()+" /"+trimmedPath+ " 200");
        } else{
            debug("\x1b[31m%s\x1b[0m",method.toUpperCase()+" /"+trimmedPath+" "+statusCode);
        }
    };

    //init script (stuff that needs to run once the server starts Ex: server.listen())
    init(){
        //starting HTTP server
        this.httpServer.listen(config.httpPort, function(){
            console.log("\x1b[36m%s\x1b[0m",`listening on port ${config.httpPort} envName:${config.envName}`);
        })

        // start HTTPS server
        // this.httpsServer.listen(config.httpsPort, function(){
        //     console.log("\x1b[35m%s\x1b[0m",`listening on port ${config.httpsPort} envName:${config.envName}`);
        // })
    };
};

export let server = new MyServer();
