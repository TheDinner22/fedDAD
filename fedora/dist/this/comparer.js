"use strict";
/**
 *
 * compare json strings to determine if items were added or removed from the freaking thing
 *
 *
 *
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareJSON = void 0;
function compareJSON(oldItems, newItems) {
    // convert these lists of obects to lists of htmlElements
    const oldElements = oldItems.map(item => item.rawElement);
    const newElements = newItems.map(item => item.rawElement);
    // # of iterations is based on length of the longest list
    const iterNum = oldElements.length > newElements.length ? oldElements.length : newElements.length;
    const biggerItemList = oldItems.length > newItems.length ? oldItems : newItems;
    const biggerElementList = oldElements.length > newElements.length ? oldElements : newElements;
    const smallerElementList = oldElements.length > newElements.length ? newElements : oldElements;
    const smallerElementListIsNewOne = oldElements.length > newElements.length ? true : false;
    for (let i = 0; i < iterNum; i++) {
        const element = biggerItemList[i].rawElement;
        const indexOfElementInSmall = smallerElementList.indexOf(element);
        if (indexOfElementInSmall != -1) {
            // remove element from both element lists
            biggerElementList.splice(indexOfElementInSmall, 1);
            smallerElementList.splice(indexOfElementInSmall, 1);
        }
    }
    if (smallerElementListIsNewOne) {
        return smallerElementList;
    }
    else {
        return biggerElementList;
    }
}
exports.compareJSON = compareJSON;
;
