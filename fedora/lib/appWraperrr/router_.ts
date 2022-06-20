// router idek wat else to say

// dependencies
import { getStaticAsset } from "./../appStuff/helpers_";
import { callbacks } from "./../appStuff/server_";
import { reqData } from "./../appStuff/server_";
import { handlerFunc } from "./../appStuff/server_";
import { methods } from "./../appStuff/server_";

interface Route {
  post?: handlerFunc
  get?: handlerFunc
  put?: handlerFunc
  delete?: handlerFunc
  patch?: handlerFunc
  all?: handlerFunc
};

class Router {
    private routes: { [path: string]: Route } = {};

    constructor(){
        // create 404
        this.routes.notFound404 = {all : (data: reqData, callbacks: callbacks)=>{
            callbacks.callback(404, {"Error" : "route not found"});
        }};

        // create public
        this.routes.public = {'get': function(data: reqData, callbacks: callbacks){
            // get the file being requested (trim publuc off of the string so we can look it up)
            const trimmedAssetName = data.trimmedPath.replace("public/", "");
            if(!(trimmedAssetName.length > 0)){callbacks.callback(404);return;}
            //read in the assets data
            getStaticAsset(trimmedAssetName, function(err, assetData){
                if(err && !assetData){callbacks.callback(404);return;}
                
                // NOTE TODO BREAKS, this assumes there is only one '.' in every file.
                const temp: Array<string> = trimmedAssetName.split(".");
                const fileExtension: string = temp[temp.length - 1];
                let contentType: string;

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
                callbacks.callback(200,assetData,contentType);

            });
        }};
    };
    
    createRoute(path: string, handlerFunc: handlerFunc, accepts: methods="all"): void{
        if( typeof this.routes[path] !== 'object' ){  //TODO look at me
            this.routes[path] = {};
        }
        this.routes[path][accepts] = handlerFunc;
    };

    getRoute (data: reqData): handlerFunc | undefined{
        const path = data.trimmedPath;
        let func: handlerFunc | boolean | undefined = false;
        try {
            // this will only error for paths that dont
            // exist and will be undefined for methods that dont exist
            func = this.routes[path][data.method as keyof Route];
        }catch(e){func = false;}

        // if the func is undefined, check the path for an "all" func
        if(func == undefined){
            func = this.routes[path]["all"];
        }

        //TODO useless if you do the dynamic address thinhy also check if its asking for public folder
        if(path.indexOf("public/") > -1){
            const public_func = this.routes.public.get;
            if (typeof(public_func) == "function"){
                return public_func
            }
        }

        else if(typeof(func) == "function"){
            return func
        } 

        return this.routes.notFound404.all
    };
    get(path: string, handlerFunc: handlerFunc){
        this.createRoute(path, handlerFunc, "get");
    }

    post(path: string, handlerFunc: handlerFunc){
        this.createRoute(path, handlerFunc, "post")
    }

    put(path: string, handlerFunc: handlerFunc){
        this.createRoute(path, handlerFunc, "put")
    }

    delete(path: string, handlerFunc: handlerFunc){
        this.createRoute(path, handlerFunc, "delete")
    }

    patch(path: string, handlerFunc: handlerFunc){
        this.createRoute(path, handlerFunc, "patch")
    }

    all(path: string, handlerFunc: handlerFunc){
        this.createRoute(path, handlerFunc, "all")
    }
}

export let router = new Router();
