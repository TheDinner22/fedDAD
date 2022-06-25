/*
*
*all da unit tests for fedDAD
*/

//types
import { testObj } from ".";

// dependencies
import assert from "assert";
import fs from "fs";
import { promisify } from "util";
const readFilePromise = promisify(fs.readFile);
const readDirPromise = promisify(fs.readdir);


// dependencies (to be tested)
import { goUntil, parseHTML } from "./../this/parser"; 

// get all of the html strings
async function getHTML() {
    const fileNames = await readDirPromise("./fedora/lib/test/fakeData/");
    let myPromises: Promise<string>[] = []; 
    fileNames.forEach( async (fileName) => {
        const dataProm = readFilePromise("./fedora/lib/test/fakeData/" + fileName, 'utf8');
        myPromises.push(dataProm);
    });

    const rawHtmlStrings = await Promise.all(myPromises);

    return rawHtmlStrings;
}

//holder for the tests
let unit:testObj = {};

unit["goUntil works"] = function(done){
    const I = "123456789";
    const O = "123456";

    let goUntilInfo = goUntil(I, 0, ["7"]);
    if(typeof goUntilInfo === undefined){throw new Error("go until returned undefined how???")}
    const actual = goUntilInfo!.str;

    assert.strictEqual(actual, O);

    const I2 = "123456789";
    const O2 = "456";

    goUntilInfo = goUntil(I2, 3, ["7"]);
    if(typeof goUntilInfo === undefined){throw new Error("go until returned undefined how???")}
    const actual2 = goUntilInfo!.str;

    assert.strictEqual(actual2, O2);

    const I3 = "12345689";
    const O3 = "456";

    
    assert.throws(()=>{
        const actual3 = goUntil(I3, 3, ["7"]);
    });

    done();
};

unit["goUntil works with sting untilChars"] = function(done){
    const I = "123456789";
    const O = "123456";

    let goUntilInfo = goUntil(I, 0, ["789"]);
    if(typeof goUntilInfo === undefined){throw new Error("go until returned undefined how???")}
    const actual = goUntilInfo!.str;

    assert.strictEqual(actual, O);

    const I2 = "123456789";
    const O2 = "45";

    goUntilInfo = goUntil(I2, 3, ["67"]);
    if(typeof goUntilInfo === undefined){throw new Error("go until returned undefined how???")}
    const actual2 = goUntilInfo!.str;

    assert.strictEqual(actual2, O2);

    const I3 = "12345689";
    const O3 = "456";

    
    assert.throws(()=>{
        const actual3 = goUntil(I3, 3, ["7899"]);
    });

    done();
};

unit["goUntil works backwards"] = function(done){
    const I = "123456789";
    const O = "456789";

    let goUntilInfo = goUntil(I, 8, ["123"], false);
    if(typeof goUntilInfo === undefined){throw new Error("go until returned undefined how???")}
    const actual = goUntilInfo!.str;

    assert.strictEqual(actual, O);

    const I2 = "123456789";
    const O2 = "8";

    goUntilInfo = goUntil(I2, 7, ["67"], false);
    if(typeof goUntilInfo === undefined){throw new Error("go until returned undefined how???")}
    const actual2 = goUntilInfo!.str;

    assert.strictEqual(actual2, O2);

    const I3 = "12345689";
    const O3 = "456";

    
    assert.throws(()=>{
        const actual3 = goUntil(I3, 3, ["7899"]);
    });

    done();
};

unit["html parser works"] = async function(done){
    const rawHtmlStrings = await getHTML();
    const res = parseHTML(rawHtmlStrings[0]);
    const expectedElement = '<p>test *</p>';

    for(let i = 0; i < res.length; i++){
        assert.equal(res[i].tagName, 'p');
        const element = expectedElement.replace('*', (i + 1).toString());
        assert.equal(res[i].rawElement, element);

    }

    done();
};

unit["html parser works with nested elements and inline styling"] = async function(done){
    const rawHtmlStrings = await getHTML();
    const res = parseHTML(rawHtmlStrings[1]);

    assert.equal(res.length, 2);
    done();
};


export default unit;