/*
*
*all da unit tests for fedDAD
*/

//types
import { testObj } from ".";

// dependencies
import assert from "assert";

// dependencies (to be tested)
import { goUntil } from "./../this/parser"; 

//holder for the tests
let unit:testObj = {};

unit["goUntil works"] = function(done){
    const I = "123456789";
    const O = "123456";

    const actual = goUntil(I, 0, ["7"]);

    assert.strictEqual(actual, O);

    const I2 = "123456789";
    const O2 = "456";

    const actual2 = goUntil(I2, 3, ["7"]);

    assert.strictEqual(actual2, O2);

    const I3 = "12345689";
    const O3 = "456";

    
    assert.throws(()=>{
        const actual3 = goUntil(I3, 3, ["7"]);
    });

    done();
};


export default unit;