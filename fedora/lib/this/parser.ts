// parse a raw html string and return an object that crawls throught the elements

interface HtmlObjLike {

}

function parseHTML(rawHTML: string): void {
    // go through string until you find < or >
    let done = false
    let i = 0;
    while (!done) {
        const currentChar = rawHTML[i];
        
        switch (currentChar) {
            case '>':
                getElementFromEndBracket(rawHTML, i);
                break;

            case '<':
                getElementFromOpenBracket(rawHTML, i);
                break;
        
            default:
                break;
        }

        done = true;
    }
};

export function goUntil(str: string, startI: number, listOfuntilChars: string[]): string{ // goes from index provided to first untilChar found
    // you can provide multiple untilChars as elements in a list

    // make sure char is a char
    if( !listOfuntilChars.every((element) => element.length === 1) ){throw new Error("expected Character but got string!!!!!!!");}
    // untilChar should be in str
    if( !listOfuntilChars.some((element) => str.indexOf(element) > 0) ){throw new Error("you made an infinate loop!!!LLL");} // this can still be made todo an infinate loop with index fuckery
    // startI should be smaller than str.length-1
    if(startI > str.length - 1){throw new Error("index out of range!!!L");}

    let done = false;
    let finalStr = "";
    while(!done){
        const currentChar = str[startI];
        if ( listOfuntilChars.some((element) => currentChar === element) ){
            done = true;
            break;
        }

        finalStr += currentChar;
        startI++;
    }

    return finalStr;
}

function getElementFromOpenBracket(rawHTML: string, currentIndex: number){
    // called if < is found
    
    currentIndex++;

    // determine element name and start index
    // are we at opening tag or end tag I.E.
    // is there a " " or a "/" first?
    let tagName = "";
    let inBetweenText = "";
    
    const currentChar = rawHTML[currentIndex]; // char one after the "<"
    
    if (currentChar === "/"){
        // ending tag, go until find ">" and thats tag name
        tagName = goUntil(rawHTML, currentIndex, [">"]);
    }

    else {
        // opening tag, go until ">" or " " and thats tag name
    }

};

function getElementFromEndBracket(rawHTML: string, currentIndex: number){};

// parseHTML("123456789");
