"use strict";
// router idek wat else to say
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
// dependencies
const helpers_1 = require("./../appStuff/helpers_");
;
class Router {
    constructor() {
        this.routes = {};
        // create 404
        this.routes.notFound404 = { all: (data, callbacks) => {
                callbacks.callback(404, { "Error": "route not found" });
            } };
        // create public
        this.routes.public = { 'get': function (data, callbacks) {
                // get the file being requested (trim publuc off of the string so we can look it up)
                const trimmedAssetName = data.trimmedPath.replace("public/", "");
                if (!(trimmedAssetName.length > 0)) {
                    callbacks.callback(404);
                    return;
                }
                //read in the assets data
                (0, helpers_1.getStaticAsset)(trimmedAssetName, function (err, assetData) {
                    if (err && !assetData) {
                        callbacks.callback(404);
                        return;
                    }
                    // NOTE TODO BREAKS, this assumes there is only one '.' in every file.
                    const temp = trimmedAssetName.split(".");
                    const fileExtension = temp[temp.length - 1];
                    let contentType;
                    switch (fileExtension) {
                        case "css":
                            contentType = "css";
                            break;
                        case "png":
                            contentType = "png";
                            break;
                        case "jpg":
                            contentType = "jpg";
                            break;
                        case "ico":
                            contentType = "favicon";
                            break;
                        case "html":
                            contentType = "html";
                            break;
                        case "js":
                            contentType = "javaScript";
                            break;
                        default:
                            contentType = "plain";
                            break;
                    }
                    //callback the data
                    callbacks.callback(200, assetData, contentType);
                });
            } };
    }
    ;
    createRoute(path, handlerFunc, accepts = "all") {
        if (typeof this.routes[path] !== 'object') { //TODO look at me
            this.routes[path] = {};
        }
        this.routes[path][accepts] = handlerFunc;
    }
    ;
    getRoute(data) {
        const path = data.trimmedPath;
        let func = false;
        try {
            // this will only error for paths that dont
            // exist and will be undefined for methods that dont exist
            func = this.routes[path][data.method];
        }
        catch (e) {
            func = false;
        }
        // if the func is undefined, check the path for an "all" func
        if (func == undefined) {
            func = this.routes[path]["all"];
        }
        //TODO useless if you do the dynamic address thinhy also check if its asking for public folder
        if (path.indexOf("public/") > -1) {
            const public_func = this.routes.public.get;
            if (typeof (public_func) == "function") {
                return public_func;
            }
        }
        else if (typeof (func) == "function") {
            return func;
        }
        return this.routes.notFound404.all;
    }
    ;
    get(path, handlerFunc) {
        this.createRoute(path, handlerFunc, "get");
    }
    post(path, handlerFunc) {
        this.createRoute(path, handlerFunc, "post");
    }
    put(path, handlerFunc) {
        this.createRoute(path, handlerFunc, "put");
    }
    delete(path, handlerFunc) {
        this.createRoute(path, handlerFunc, "delete");
    }
    patch(path, handlerFunc) {
        this.createRoute(path, handlerFunc, "patch");
    }
    all(path, handlerFunc) {
        this.createRoute(path, handlerFunc, "all");
    }
}
exports.router = new Router();
