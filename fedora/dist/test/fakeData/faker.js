"use strict";
// generate unique, seeded data
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../../appStuff/helpers_");
const helpers_2 = require("../../appStuff/helpers_");
class Faker {
    constructor() {
        this.seed = 0; // for random num
        this.prevHash = "firstsasg12@%@#%@#%#@%#@6!@&^*@%#@!^&*$@#@!!!$@!$@#@@#%@8o4543874623423";
        // make seeded ass number generator function
        this.seededNumGen = helpers_2.makeSeededNumGen;
    }
    // random ass string
    string() {
        const preHashStr = Date.now().toString() + this.prevHash + Math.sin(Math.random() * 100).toString();
        this.prevHash = preHashStr;
        return (0, helpers_1.MD5)(preHashStr);
    }
    //| a function that returns a function that returns a number |
    // random ass number generator
    number() {
        return this.seededNumGen(Math.floor(Math.random() * 1000000))();
    }
    ;
    // take an object, convert keys to to random values of same type, leave keys alone
    object(data) {
        let newObj = {};
        Object.keys(data).forEach((key) => {
            // todo make me work for string number object and array newObj[key] = 
        });
    }
    ;
}
;
const faker = new Faker();
