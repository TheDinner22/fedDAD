"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bundler_1 = require("./appWraperrr/bundler_");
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
bundler_1.MYfs.createDataStructure("user", {
    name: 'string',
    age: 'number',
    tall: 'boolean',
});
const userObj = {
    name: "ella",
    age: 16,
    tall: 1234
};
bundler_1.router.get("", (data, { json }) => {
    bundler_1.MYfs.create("", "myfile", "user", userObj, function (err) {
        if (!err) {
            json(userObj);
        }
        else {
            console.log(err);
        }
    });
});
bundler_1.server.init();
