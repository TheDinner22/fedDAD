"use strict";
// parse a raw html string and return an object that crawls throught the elements
// this will not work with nested elements that are the same element I.E. <p><p>text here </p></p>
// I don't need to worry about that so I am not fixing it LLLL
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElementFromOpenBracket = exports.goUntil = exports.parseHTML = void 0;
function reverseString(str) {
    return str.split("").reverse().join("");
}
;
function parseHTML(rawHTML) {
    // go through string until you find < or >
    let done = false;
    let i = 0;
    let res;
    let listOfElements = [];
    while (!done) {
        const currentChar = rawHTML[i];
        switch (currentChar) {
            case '>':
                res = getElementFromEndBracket(rawHTML, i);
                if (typeof res !== 'undefined') {
                    listOfElements.push(res);
                    i = res.endIndexOfElementInHTML + 1;
                }
                else {
                    i++;
                }
                break;
            case '<':
                res = getElementFromOpenBracket(rawHTML, i);
                if (typeof res !== 'undefined') {
                    listOfElements.push(res);
                    i = res.endIndexOfElementInHTML + 1;
                }
                else {
                    i++;
                }
                break;
            default:
                i++;
                break;
        }
        if (i >= rawHTML.length) {
            done = true;
            break;
        }
    }
    return listOfElements;
}
exports.parseHTML = parseHTML;
;
function goUntil(str, startI, listOfuntilChars, goForwards = true) {
    // you can provide multiple untilChars as elements in a list
    // untilChar should be in str
    if (!listOfuntilChars.some((element) => str.indexOf(element) > -1)) {
        throw new Error("you made an infinate loop!!!LLL\nnothing in " + listOfuntilChars.join("{|*|*|}") + " that was in str");
    } // this can still be made todo an infinate loop with index fuckery
    // startI should be smaller than str.length-1
    if (startI > str.length - 1) {
        throw new Error("index out of range!!!L");
    }
    let done = false;
    let finalStr = "";
    while (!done) {
        let currentStr = "";
        const untilStringFound = listOfuntilChars.some((element) => {
            currentStr = goForwards ? str.slice(startI, startI + element.length) : str.slice(startI - element.length + 1, startI + 1);
            return element === currentStr;
        });
        if (untilStringFound) {
            done = true;
            break;
        }
        finalStr = goForwards ? finalStr + currentStr[0] : finalStr + currentStr[currentStr.length - 1];
        startI = goForwards ? startI + 1 : startI - 1;
        // if the startI gets too big or too small, error
        // if( startI < 0 || startI === str.length){throw new Error(`Start I was too big/small and = ${startI}`);}
        if (startI < 0 || startI === str.length) {
            return undefined;
        }
    }
    finalStr = goForwards ? finalStr : reverseString(finalStr);
    return { str: finalStr, i: startI };
}
exports.goUntil = goUntil;
function getElementFromOpenBracket(rawHTML, currentIndex) {
    // called if < is found
    currentIndex++;
    // determine element name and start index
    // are we at opening tag or end tag I.E.
    // is there a ">" or a "/" first?
    let tagName = "";
    let rawElement = "";
    let startIOfElement = undefined;
    let endIOfElement = undefined;
    const currentChar = rawHTML[currentIndex]; // char one after the "<"
    if (currentChar === "/") {
        // ending tag, go until find ">" and thats tag name
        let goUntilInfo = goUntil(rawHTML, currentIndex, [">"]);
        if (goUntilInfo === undefined) {
            return undefined;
        }
        endIOfElement = goUntilInfo.i;
        tagName = goUntilInfo.str;
        const untilString = "<" + tagName;
        goUntilInfo = goUntil(rawHTML, currentIndex, [untilString], false);
        if (goUntilInfo === undefined) {
            return undefined;
        }
        rawElement = untilString + goUntilInfo.str;
        startIOfElement = endIOfElement - rawElement.length + 1; //BREAKS??
    }
    else {
        // opening tag, go until ">" or " " and thats tag name
        startIOfElement = currentIndex - 1;
        let goUntilInfo = goUntil(rawHTML, currentIndex, [">", " "]);
        if (goUntilInfo === undefined) {
            return undefined;
        }
        tagName = goUntilInfo.str;
        const untilString = "</" + tagName + ">";
        goUntilInfo = goUntil(rawHTML, currentIndex - 1, [untilString]);
        if (goUntilInfo === undefined) {
            return undefined;
        }
        rawElement = goUntilInfo.str + untilString;
        endIOfElement = startIOfElement + rawElement.length - 1; // BREAKS????
    }
    return { tagName: tagName, rawElement: rawElement, startIndexOfElementInHTML: startIOfElement, endIndexOfElementInHTML: endIOfElement };
}
exports.getElementFromOpenBracket = getElementFromOpenBracket;
;
function getElementFromEndBracket(rawHTML, currentIndex) {
    // called if > is found
    // just go back until you find '<' and then run getElementFromOpenBracket() on that index
    const goUntilInfo = goUntil(rawHTML, currentIndex, ['<'], false);
    if (goUntilInfo === undefined) {
        return undefined;
    }
    const indexOfClosestOpenBracket = goUntilInfo.i;
    return getElementFromOpenBracket(rawHTML, indexOfClosestOpenBracket);
}
;
// parseHTML("123456789");
