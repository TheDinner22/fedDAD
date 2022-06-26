"use strict";
/**
 * parse my parsed html
 * tldr it is hard to get the html into json
 * it is also hard to make sense of the json
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertJSONStrToObj = exports.parseParseParse = void 0;
const util_1 = require("util");
const parser_1 = require("./parser");
function removeSlice(str, startI, endI) {
    const sliceToRemove = str.substring(startI, endI);
    const final = str.replace(sliceToRemove, "");
    return final;
}
;
// parse the HTML to get the items4sale
function trimHTML(rawHTML) {
    const startI = rawHTML.indexOf('bodytext');
    if (startI < 2200) {
        console.log(`startI = ${startI}! WWTF!`);
    }
    ;
    const leftTrimmedStr = rawHTML.substring(startI, rawHTML.length);
    const endI = leftTrimmedStr.indexOf('</td>');
    const trimmedStr = leftTrimmedStr.substring(0, endI);
    const re = /<br>/gi;
    let trimmedStrWithH4 = trimmedStr.replace(re, "");
    // remove every stupid H4 and its closing tag
    // get the start and end index of the h4 tag
    while (1) {
        // find the next h4 tag
        const h4Index = trimmedStrWithH4.indexOf('h4');
        // if h4Index is -1, stop loop
        if (h4Index === -1) {
            break;
        }
        // get the start index of entire tag
        const startIOfTag = trimmedStrWithH4[h4Index - 1] === "/" ? h4Index - 2 : h4Index - 1;
        // get the end index of tag
        const goUntilRes = (0, parser_1.goUntil)(trimmedStrWithH4, startIOfTag, ['>']);
        if (typeof goUntilRes === "undefined") {
            throw new Error("h4 tag did not have ending >!!!LLL");
        }
        const endIofTag = goUntilRes.i;
        // remove h4 tag
        trimmedStrWithH4 = removeSlice(trimmedStrWithH4, startIOfTag, endIofTag + 1);
    }
    return trimmedStrWithH4; // no, it does not have an h4 
}
;
function parseParse(RAWHTML, callback) {
    const trimmedRawHTML = trimHTML(RAWHTML);
    const arrOfElements = (0, parser_1.parseHTML)(trimmedRawHTML);
    const noFormArrOfElements = [];
    // remove all form elements
    arrOfElements.forEach((element) => { if (element.tagName != 'form') {
        noFormArrOfElements.push(element);
    } });
    const jsonStr = noFormArrOfElements.map(element => JSON.stringify(element)).join("\n");
    callback(false, jsonStr);
}
;
exports.parseParseParse = (0, util_1.promisify)(parseParse);
function convertJSONStrToObj(JSONStr) {
    const JSONStrArr = JSONStr.split("\n");
    let finalArr = [];
    JSONStrArr.forEach((element) => {
        finalArr.push(JSON.parse(element));
    });
    return finalArr;
}
exports.convertJSONStrToObj = convertJSONStrToObj;
/*
if (require.main === module) {
    myMain();
}

async function myMain(){
    const promiseParseParse = promisify(parseParse);

    const res1 = await promiseParseParse();
    const res2 = await promiseParseParse();
    const res3 = await promiseParseParse();

    if (typeof res1 === "string" && typeof res2 === "string" && typeof res3 === "string"){
        console.log(res1 === res2);
        console.log(res2 === res3);

        console.log(compareJSON(convertJSONStrToObj(res1), convertJSONStrToObj(res2)));
    }

};*/
