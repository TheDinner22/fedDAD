/*
* test runner
*
*/

// override the NODE_ENV variable
process.env.NODE_ENV = "testing";

export type testObj = {[path: string] : testFuncType};
type doneType = () => void;
type testFuncType = (done: doneType) => void;
type testErr = {
    name: string,
    error: unknown // its an assertion error but ts wont let me!!!!
};

class TestApp {
    // container for all tests
    private tests: {[path: string] : testObj} = {
        // add on the unit and api tests
        unit: require("./unit").default,
        // api: require("./api").default
    };

    // count all the tests
    private countTests(): number{ // i didnt write this dont ask
        let counter = 0;
        for(const key in this.tests){
            if(this.tests.hasOwnProperty(key)){
                const subTests = this.tests[key];
                for(const testName in subTests){
                    if(subTests.hasOwnProperty(testName)){
                        counter++;
                    }
                }
            }
        }
        return counter;
    };

    // run all test and note the errors and succeses. 
    public async runTests(){
        // array to hold all of the errors
        let errors: testErr[] = [];

        // successes counter
        let successes = 0;

        // how many tests there are
        const limit = this.countTests();
        let counter = 0;

        // loop through all keys in _app.tests
        for(const key in this.tests){
            if(this.tests.hasOwnProperty(key)){
                const subTests = this.tests[key];
                for (const testName in subTests){
                    if(subTests.hasOwnProperty(testName)){
                        const tempTestName = testName;
                        const testFunction = subTests[testName];
                        // call the test
                        try{
                            await testFunction(()=>{ // this await took an hour to put in and is SUPER FUCKING IMPORTANT DONT TOUCH IT
                                //if it calls back, it worked, log in green
                                console.log("\x1b[32m%s\x1b[0m",tempTestName);
                                counter++;
                                successes++;
                                if(counter == limit){
                                    this.produceTestReport(limit, successes, errors);
                                }
                            });
                        }catch(e){
                            // if it throws, it failed, so log the error in red
                            errors.push({
                                'name' : tempTestName,
                                'error' : e
                            });
                            console.log("\x1b[31m%s\x1b[0m",tempTestName);
                            counter++;
                            if(counter == limit){
                                this.produceTestReport(limit, successes, errors);
                            }
                        }
                    }
                }
            }
        }
    };

    // produces the report of the outcome of all tests
    private produceTestReport(limit: number, successes: number, errors: testErr[]){
        // header
        console.log("");
        console.log("------------------BEGIN TEST REPORT-----------------");
        console.log("Tests Ran: " + limit);
        console.log("Tests Passes: " + successes);
        console.log("Test Fails: " + errors.length);
        console.log("");

        // if there are erros print them in detail
        if(errors.length > 0){
            console.log("------------------BEGIN ERROR DETAILS-----------------");
            console.log("");
            
            errors.forEach(function(testError){
                console.log("\x1b[31m%s\x1b[0m",testError.name);
                console.log(testError.error);
                console.log("");
            });

            console.log("");
            console.log("------------------END ERROR DETAILS-----------------");

        }
        console.log("");
        console.log("------------------END TEST REPORT-----------------");
        process.exit(0); // kill the app, otherwise it'd keep running (for stuff like e2e/api testing)
    };
}

const _App = new TestApp;
_App.runTests()
