/**
 * 
 * take an html element and make its background red by injecting inline styling
 * 
 * 
 * 
 */

import { goUntil } from "./parser";

export function inject( htmlElements: string | string[]){
    if(typeof htmlElements === "string"){
        htmlElements = [ htmlElements ];
    }

    let finalArr: string[] = [];
    htmlElements.forEach((element) => {
        
        // already a style attribute
        const styleSearch = 'style=';
        const styleI = element.indexOf(styleSearch);
        if(styleI !== -1){
            const styleStr = 'background-color: red; ';
            let newElement = element.split('')
            newElement.splice(styleI + styleSearch.length + 1, 0, styleStr)
            const finalElement = newElement.join("");
            finalArr.push(finalElement);
        }
        
        // go until '>' then insert style attribute and bg color before it
        else{
            const goUntilRes = goUntil(element, 0, ['>'])
            if(typeof goUntilRes === 'undefined'){throw new Error("the html passed did not have a > -inject");}
            const insertI = goUntilRes.i;
            let newElement = element.split('')
            newElement.splice(insertI, 0, ' style="background-color: red;"');
            const finalElement = newElement.join("");
            finalArr.push(finalElement);
        }


    });

    return finalArr;
};

if(require.main === module){
    console.log(inject(['<body style="padding: 0px;"></body>','<p>abc please kill be</p>']))
}
