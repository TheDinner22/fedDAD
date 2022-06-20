import {server, router, MYfs} from "./appWraperrr/bundler_";

/**
 * 
 * FS
 * -create (basic pass)
 * -read
 * -update
 * -delete
 * 
 * Atlas/api
 * -create
 * -read
 * -update
 * -delete
 * 
 */

// make data strucutre
MYfs.createDataStructure("user", {
    name: 'string',
    age: 'number',
    tall: 'boolean',
});

const userObj = {
    name: "ella",
    age: 16,
    tall: 1234
}

router.get("", (data, {json})=>{
    MYfs.create("", "myfile", "user", userObj, function(err) {
        if(!err){
            json(userObj)
        }else{console.log(err)}
    });
});

server.init();
