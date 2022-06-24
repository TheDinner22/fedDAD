// parse a raw html string and return an object that crawls throught the elements
// this will not work with nested elements that are the same element I.E. <p><p>text here </p></p>
// I don't need to worry about that so I am not fixing it LLLL

interface HtmlObjLike {

}

interface goUntilReturnLike {
    str : string
    i : number
}

interface getElementFromOpenBracketReturnLike {
    tagName: string
    rawElement: string
    startIndexOfElementInHTML: number
    endIndexOfElementInHTML: number
}

function reverseString(str: string){
    return str.split("").reverse().join("");
};

function parseHTML(rawHTML: string): void {
    // go through string until you find < or >
    let done = false
    let i = 0;
    let listOfElements: getElementFromOpenBracketReturnLike[] = [];
    while (!done) {
        const currentChar = rawHTML[i];
        
        switch (currentChar) {
            case '>':
                let res = getElementFromEndBracket(rawHTML, i);
                listOfElements.push(res);
                i = res.endIndexOfElementInHTML;
                break;

            case '<':
                res = getElementFromOpenBracket(rawHTML, i);
                listOfElements.push(res);
                i = res.endIndexOfElementInHTML;
                break;
        
            default:
                i++;
                break;
        }

        // TODO this is temp 
        if (i === rawHTML.length - 1){
            done = true;
            break;
        }
    }
};

export function goUntil(str: string, startI: number, listOfuntilChars: string[], goForwards = true): goUntilReturnLike{ // goes from index provided to first untilStr found
    // you can provide multiple untilChars as elements in a list

    // untilChar should be in str
    if( !listOfuntilChars.some((element) => str.indexOf(element) > -1 ) ){throw new Error("you made an infinate loop!!!LLL");} // this can still be made todo an infinate loop with index fuckery
    // startI should be smaller than str.length-1
    if(startI > str.length - 1){throw new Error("index out of range!!!L");}

    let done = false;
    let finalStr = "";
    while(!done){
        let currentStr = "";
        const untilStringFound = listOfuntilChars.some((element) => {
            currentStr = goForwards ? str.slice(startI, startI + element.length) : str.slice(startI - element.length + 1, startI + 1);
            return element === currentStr
        });

        if ( untilStringFound ){
            done = true;
            break;
        }

        finalStr = goForwards ? finalStr + currentStr[0] : finalStr + currentStr[currentStr.length - 1];
        startI = goForwards ? startI + 1 : startI - 1;
    }

    finalStr = goForwards ? finalStr : reverseString(finalStr);

    return {str: finalStr, i: startI};
}

export function getElementFromOpenBracket(rawHTML: string, currentIndex: number): getElementFromOpenBracketReturnLike {
    // called if < is found
    
    currentIndex++;

    // determine element name and start index
    // are we at opening tag or end tag I.E.
    // is there a ">" or a "/" first?
    let tagName = "";
    let rawElement = "";
    let startIOfElement: number = -1;
    let endIOfElement: number = -1;
    
    const currentChar = rawHTML[currentIndex]; // char one after the "<"
    
    if (currentChar === "/"){
        // ending tag, go until find ">" and thats tag name
        let goUntilInfo = goUntil(rawHTML, currentIndex, [">"]);
        endIOfElement = goUntilInfo.i;
        tagName = goUntilInfo.str;

        const untilString = "<" + tagName;
        goUntilInfo = goUntil(rawHTML, currentIndex, [ untilString ], false);
        rawElement = untilString + goUntilInfo.str;

        startIOfElement = endIOfElement - rawElement.length + 1; //BREAKS??
    }

    else {
        // opening tag, go until ">" or " " and thats tag name
        startIOfElement = currentIndex - 1;
        tagName = goUntil(rawHTML, currentIndex, [">", " "]).str;

        const untilString = "</" + tagName + ">";
        rawElement = goUntil(rawHTML, currentIndex - 1, [ untilString ]).str + untilString;

        endIOfElement = startIOfElement + rawElement.length - 1 // BREAKS????
    }

    return {tagName: tagName, rawElement: rawElement, startIndexOfElementInHTML: startIOfElement, endIndexOfElementInHTML: endIOfElement};
};

function getElementFromEndBracket(rawHTML: string, currentIndex: number): getElementFromOpenBracketReturnLike {
    // called if > is found
    // just go back until you find '<' and then run getElementFromOpenBracket() on that index
    const indexOfClosestOpenBracket = goUntil(rawHTML, currentIndex, ['<'], false).i
    return getElementFromOpenBracket(rawHTML, indexOfClosestOpenBracket);
};



// parseHTML("123456789");
