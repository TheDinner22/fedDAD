"use strict";
/*
* test runner
*
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// override the NODE_ENV variable
process.env.NODE_ENV = "testing";
class TestApp {
    constructor() {
        // container for all tests
        this.tests = {
            // add on the unit and api tests
            // unit: require("./unit").default,
            unit: require("./localUnit").default
            // api: require("./api").default
        };
    }
    // count all the tests
    countTests() {
        let counter = 0;
        for (const key in this.tests) {
            if (this.tests.hasOwnProperty(key)) {
                const subTests = this.tests[key];
                for (const testName in subTests) {
                    if (subTests.hasOwnProperty(testName)) {
                        counter++;
                    }
                }
            }
        }
        return counter;
    }
    ;
    // run all test and note the errors and succeses. 
    runTests() {
        return __awaiter(this, void 0, void 0, function* () {
            // array to hold all of the errors
            let errors = [];
            // successes counter
            let successes = 0;
            // how many tests there are
            const limit = this.countTests();
            let counter = 0;
            // loop through all keys in _app.tests
            for (const key in this.tests) {
                if (this.tests.hasOwnProperty(key)) {
                    const subTests = this.tests[key];
                    for (const testName in subTests) {
                        if (subTests.hasOwnProperty(testName)) {
                            const tempTestName = testName;
                            const testFunction = subTests[testName];
                            // call the test
                            try {
                                yield testFunction(() => {
                                    //if it calls back, it worked, log in green
                                    console.log("\x1b[32m%s\x1b[0m", tempTestName);
                                    counter++;
                                    successes++;
                                    if (counter == limit) {
                                        this.produceTestReport(limit, successes, errors);
                                    }
                                });
                            }
                            catch (e) {
                                // if it throws, it failed, so log the error in red
                                errors.push({
                                    'name': tempTestName,
                                    'error': e
                                });
                                console.log("\x1b[31m%s\x1b[0m", tempTestName);
                                counter++;
                                if (counter == limit) {
                                    this.produceTestReport(limit, successes, errors);
                                }
                            }
                        }
                    }
                }
            }
        });
    }
    ;
    // produces the report of the outcome of all tests
    produceTestReport(limit, successes, errors) {
        // header
        console.log("");
        console.log("------------------BEGIN TEST REPORT-----------------");
        console.log("Tests Ran: " + limit);
        console.log("Tests Passes: " + successes);
        console.log("Test Fails: " + errors.length);
        console.log("");
        // if there are erros print them in detail
        if (errors.length > 0) {
            console.log("------------------BEGIN ERROR DETAILS-----------------");
            console.log("");
            errors.forEach(function (testError) {
                console.log("\x1b[31m%s\x1b[0m", testError.name);
                console.log(testError.error);
                console.log("");
            });
            console.log("");
            console.log("------------------END ERROR DETAILS-----------------");
        }
        console.log("");
        console.log("------------------END TEST REPORT-----------------");
        process.exit(0); // kill the app, otherwise it'd keep running (for stuff like e2e/api testing)
    }
    ;
}
const _App = new TestApp;
_App.runTests();
