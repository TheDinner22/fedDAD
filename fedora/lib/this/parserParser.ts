/**
 * parse my parsed html
 * tldr it is hard to get the html into json
 * it is also hard to make sense of the json
 * 
 */

import fs from 'fs';
import { sendREQ } from "../index";
import { parseHTML, goUntil} from "./parser";

import { getElementFromOpenBracketReturnLike } from "./parser";

function removeSlice(str: string, startI: number, endI: number){
    const sliceToRemove = str.substring(startI, endI);
    const final = str.replace(sliceToRemove, "");
    return final;
};

// parse the HTML to get the items4sale
function trimHTML(rawHTML: string): string{

    const startI = rawHTML.indexOf('bodytext');
    if(startI < 2200){console.log(`startI = ${startI}! WWTF!`)};

    const leftTrimmedStr = rawHTML.substring(startI, rawHTML.length);

    const endI = leftTrimmedStr.indexOf('</td>');
    const trimmedStr = leftTrimmedStr.substring(0, endI);
    const re = /<br>/gi
    let trimmedStrWithH4 = trimmedStr.replace(re, "");


    // remove every fucking stupid ass H4 and its closing tag
    // get the start and end index of the h4 tag
    while(1){
        // find the next h4 tag
        const h4Index = trimmedStrWithH4.indexOf('h4');
        // if h4Index is -1, stop loop
        if(h4Index === -1){break}
        // get the start index of entire tag
        const startIOfTag = trimmedStrWithH4[h4Index - 1] === "/" ? h4Index - 2 : h4Index -1;
        // get the end index of tag
        const goUntilRes = goUntil(trimmedStrWithH4, startIOfTag, ['>']);
        if( typeof goUntilRes === "undefined"){throw new Error("h4 tag did not have ending >!!!LLL");}
        const endIofTag = goUntilRes.i;

        // remove h4 tag
        trimmedStrWithH4 = removeSlice(trimmedStrWithH4, startIOfTag, endIofTag + 1);
    }
    
    return trimmedStrWithH4; // no, it does not have an h4 
};

export function parseParseParse(HTMLObjArr?: getElementFromOpenBracketReturnLike){
    sendREQ((e, res)=>{
        if(typeof res === "string"){
            const trimmedRawHTML = trimHTML(res)
            return;
            const arrOfElements = parseHTML(trimmedRawHTML);

            const noFormArrOfElements: getElementFromOpenBracketReturnLike[] = [];
            // remove all form elements
            arrOfElements.forEach((element)=>{if(element.tagName != 'form'){noFormArrOfElements.push(element);}}); 

            const jsonStr = noFormArrOfElements.map(element => JSON.stringify(element)).join("\n");
            fs.writeFile("delme.txt", jsonStr, 'utf8', (err)=>{
                console.log('done');
            });
        }
        else{
            throw new Error("res was not a string");
        }
    });
};

if (require.main === module) {
    parseParseParse();
}





