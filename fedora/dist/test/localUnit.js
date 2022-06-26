"use strict";
/*
*
*all da unit tests for fedDAD
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// dependencies
const assert_1 = __importDefault(require("assert"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const readFilePromise = (0, util_1.promisify)(fs_1.default.readFile);
const readDirPromise = (0, util_1.promisify)(fs_1.default.readdir);
// dependencies (to be tested)
const parser_1 = require("./../this/parser");
// get all of the html strings
function getHTML() {
    return __awaiter(this, void 0, void 0, function* () {
        const fileNames = yield readDirPromise("./fedora/lib/test/fakeData/");
        let myPromises = [];
        fileNames.forEach((fileName) => __awaiter(this, void 0, void 0, function* () {
            const dataProm = readFilePromise("./fedora/lib/test/fakeData/" + fileName, 'utf8');
            myPromises.push(dataProm);
        }));
        const rawHtmlStrings = yield Promise.all(myPromises);
        return rawHtmlStrings;
    });
}
//holder for the tests
let unit = {};
unit["goUntil works"] = function (done) {
    const I = "123456789";
    const O = "123456";
    let goUntilInfo = (0, parser_1.goUntil)(I, 0, ["7"]);
    if (typeof goUntilInfo === undefined) {
        throw new Error("go until returned undefined how???");
    }
    const actual = goUntilInfo.str;
    assert_1.default.strictEqual(actual, O);
    const I2 = "123456789";
    const O2 = "456";
    goUntilInfo = (0, parser_1.goUntil)(I2, 3, ["7"]);
    if (typeof goUntilInfo === undefined) {
        throw new Error("go until returned undefined how???");
    }
    const actual2 = goUntilInfo.str;
    assert_1.default.strictEqual(actual2, O2);
    const I3 = "12345689";
    const O3 = "456";
    assert_1.default.throws(() => {
        const actual3 = (0, parser_1.goUntil)(I3, 3, ["7"]);
    });
    done();
};
unit["goUntil works with sting untilChars"] = function (done) {
    const I = "123456789";
    const O = "123456";
    let goUntilInfo = (0, parser_1.goUntil)(I, 0, ["789"]);
    if (typeof goUntilInfo === undefined) {
        throw new Error("go until returned undefined how???");
    }
    const actual = goUntilInfo.str;
    assert_1.default.strictEqual(actual, O);
    const I2 = "123456789";
    const O2 = "45";
    goUntilInfo = (0, parser_1.goUntil)(I2, 3, ["67"]);
    if (typeof goUntilInfo === undefined) {
        throw new Error("go until returned undefined how???");
    }
    const actual2 = goUntilInfo.str;
    assert_1.default.strictEqual(actual2, O2);
    const I3 = "12345689";
    const O3 = "456";
    assert_1.default.throws(() => {
        const actual3 = (0, parser_1.goUntil)(I3, 3, ["7899"]);
    });
    done();
};
unit["goUntil works backwards"] = function (done) {
    const I = "123456789";
    const O = "456789";
    let goUntilInfo = (0, parser_1.goUntil)(I, 8, ["123"], false);
    if (typeof goUntilInfo === undefined) {
        throw new Error("go until returned undefined how???");
    }
    const actual = goUntilInfo.str;
    assert_1.default.strictEqual(actual, O);
    const I2 = "123456789";
    const O2 = "8";
    goUntilInfo = (0, parser_1.goUntil)(I2, 7, ["67"], false);
    if (typeof goUntilInfo === undefined) {
        throw new Error("go until returned undefined how???");
    }
    const actual2 = goUntilInfo.str;
    assert_1.default.strictEqual(actual2, O2);
    const I3 = "12345689";
    const O3 = "456";
    assert_1.default.throws(() => {
        const actual3 = (0, parser_1.goUntil)(I3, 3, ["7899"]);
    });
    done();
};
unit["html parser works"] = function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        const rawHtmlStrings = yield getHTML();
        const res = (0, parser_1.parseHTML)(rawHtmlStrings[0]);
        const expectedElement = '<p>test *</p>';
        for (let i = 0; i < res.length; i++) {
            assert_1.default.equal(res[i].tagName, 'p');
            const element = expectedElement.replace('*', (i + 1).toString());
            assert_1.default.equal(res[i].rawElement, element);
        }
        done();
    });
};
unit["html parser works with nested elements and inline styling"] = function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        const rawHtmlStrings = yield getHTML();
        const res = (0, parser_1.parseHTML)(rawHtmlStrings[1]);
        assert_1.default.equal(res.length, 2);
        done();
    });
};
exports.default = unit;
