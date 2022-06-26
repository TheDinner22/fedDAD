"use strict";
/*
*
*all da unit tests
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
// dependencies (to be tested)
const helpers_1 = require("../appStuff/helpers_");
const local_1 = require("./../data/local_");
const atlasAPI_1 = require("./../data/atlas/atlasAPI_");
//holder for the tests
let unit = {};
//#region - TESTS FOR HELPERS
unit["helpers.obj_equal should work"] = function (done) {
    const inputs = [
        [{}, {}],
        [{ a: "man" }, { a: "man" }],
        [{ a: "man", gf: "none" }, { gf: "none", a: "man" }],
        [[1, 2, 3], [1, 2, 3]],
        [[1, 2, 3], [3, 2, 1]],
        [{ a: "man", gf: "awesome" }, { a: "man" }],
        [{ a: "Man" }, { a: "man" }]
    ];
    const outputs = [
        true,
        true,
        true,
        true,
        false,
        false,
        false,
    ];
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const output = outputs[i];
        assert_1.default.strictEqual((0, helpers_1.objEqual)(input[0], input[1]), output);
    }
    done();
};
//#endregion
//#region - DATA LOCAL-FS TESTS
unit["LOCAL-FS - overrideDefaultDataPath should actually work"] = function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        // change data path
        local_1.localFS.overrideDefaultDataPath("fedora/lib/test/fakeData");
        try {
            // creating file
            yield local_1.localFS.promiseCreate("", "testFile", { testing: true });
            // reading file
            const dataList = (yield local_1.localFS.promiseRead("", "testFile")) || [{ error: 'bind read returned not data!' }];
            assert_1.default.deepStrictEqual(dataList[0], { testing: true });
            // deleting file
            yield local_1.localFS.promiseDelete("", "testFile");
        }
        catch (e) {
            throw new Error(e.error);
        }
        done();
    });
};
//#region CREATE tests
unit["FScreate - promisify version of create works as expected"] = function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        // make it so this is in fakeData dir
        local_1.localFS.overrideDefaultDataPath("fedora/lib/test/fakeData");
        // try block for if there are errors
        try {
            // ONE AT A TIME EXAMPLE
            // create the file and error if it errors
            yield local_1.localFS.promiseCreate("", "testFile", { testing: true });
            // delete the file and error if it errors
            yield local_1.localFS.promiseDelete("", "testFile");
            // CONCURRENT EXAMPLE
            // create a bunch of files
            const file1Prom = local_1.localFS.promiseCreate("", "testFile1", { testing: true });
            const file2Prom = local_1.localFS.promiseCreate("", "testFile2", { testing: true });
            const file3Prom = local_1.localFS.promiseCreate("", "testFile3", { testing: true });
            const file4Prom = local_1.localFS.promiseCreate("", "testFile4", { testing: true });
            const file5Prom = local_1.localFS.promiseCreate("", "testFile5", { testing: true });
            yield Promise.all([file1Prom, file2Prom, file3Prom, file4Prom, file5Prom]);
            // delete a bunch of files
            const file1DeleteProm = local_1.localFS.promiseDelete("", "testFile1");
            const file2DeleteProm = local_1.localFS.promiseDelete("", "testFile2");
            const file3DeleteProm = local_1.localFS.promiseDelete("", "testFile3");
            const file4DeleteProm = local_1.localFS.promiseDelete("", "testFile4");
            const file5DeleteProm = local_1.localFS.promiseDelete("", "testFile5");
            yield Promise.all([file1DeleteProm, file2DeleteProm, file3DeleteProm, file4DeleteProm, file5DeleteProm]);
        }
        catch (e) { // this is how we get the error
            throw new Error(e.error);
        }
        done();
    });
};
unit["FScreate - throws errors as expected"] = function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        // if passed object[], should error
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseCreate("", "testFile", [{ testing: true }]);
        }), "passed it Object[], so it should have thrown");
        // if passed bad dir, should error
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseCreate("badDirName", "testFile", { testing: true });
        }), "passed bad dir name, so it should have thrown");
        // if passed bad fileName, should error
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseCreate("", "testFile.json", { testing: true });
        }), "passed bad fileName, so it should have thrown");
        // if pass bad data should error
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseCreate("", "testFile", "bad input (should be object)");
        }), "passed bad data, so it should have thrown");
        // if file already exists, should error
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseCreate("", "testFile", { testing: true });
            yield local_1.localFS.promiseCreate("", "testFile", { testing: true });
        }), "made file twice, so it should have thrown");
        // delete the file made twice
        yield local_1.localFS.promiseDelete("", "testFile");
        done();
    });
};
//#endregion CREATE tests
//#region READ tests
unit["FSread - promisify version of read works as expected"] = function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        // make it so this is in fakeData dir
        local_1.localFS.overrideDefaultDataPath("fedora/lib/test/fakeData");
        // one at a time example
        // create file to test on
        yield local_1.localFS.promiseCreate("", "testFile", {});
        // try and read file
        const dataList = (yield local_1.localFS.promiseRead("", "testFile")) || [{ noData: "there was not data" }];
        assert_1.default.deepStrictEqual(dataList[0], {});
        // update file
        yield local_1.localFS.promiseUpdate("", "testFile", { testing: "yeah!" });
        // try and read updated file, make sure update is picked up
        const updatedDataList = (yield local_1.localFS.promiseRead("", "testFile")) || [{ noData: "there was not data" }];
        assert_1.default.deepStrictEqual(updatedDataList[0], { testing: 'yeah!' });
        // delete the file
        yield local_1.localFS.promiseDelete("", "testFile");
        // concurrent example
        // create a bunch of files
        const file1Prom = local_1.localFS.promiseCreate("", "testFile1", {});
        const file2Prom = local_1.localFS.promiseCreate("", "testFile2", {});
        const file3Prom = local_1.localFS.promiseCreate("", "testFile3", {});
        const file4Prom = local_1.localFS.promiseCreate("", "testFile4", {});
        const file5Prom = local_1.localFS.promiseCreate("", "testFile5", {});
        yield Promise.all([file1Prom, file2Prom, file3Prom, file4Prom, file5Prom]);
        // try and read all the files
        let file1ReadProm = local_1.localFS.promiseRead("", "testFile1");
        let file2ReadProm = local_1.localFS.promiseRead("", "testFile2");
        let file3ReadProm = local_1.localFS.promiseRead("", "testFile3");
        let file4ReadProm = local_1.localFS.promiseRead("", "testFile4");
        let file5ReadProm = local_1.localFS.promiseRead("", "testFile5");
        let [file1Read, file2Read, file3Read, file4Read, file5Read] = yield Promise.all([file1ReadProm, file2ReadProm, file3ReadProm, file4ReadProm, file5ReadProm]);
        // check all files
        assert_1.default.deepStrictEqual(file1Read ? file1Read[0] : { error: 'file read returned undefined' }, {});
        assert_1.default.deepStrictEqual(file2Read ? file2Read[0] : { error: 'file read returned undefined' }, {});
        assert_1.default.deepStrictEqual(file3Read ? file3Read[0] : { error: 'file read returned undefined' }, {});
        assert_1.default.deepStrictEqual(file4Read ? file4Read[0] : { error: 'file read returned undefined' }, {});
        assert_1.default.deepStrictEqual(file5Read ? file5Read[0] : { error: 'file read returned undefined' }, {});
        // update all files
        const update1Prom = local_1.localFS.promiseUpdate("", "testFile1", { works: "nope!" });
        const update2Prom = local_1.localFS.promiseUpdate("", "testFile2", { works: "nope!" });
        const update3Prom = local_1.localFS.promiseUpdate("", "testFile3", { works: "nope!" });
        const update4Prom = local_1.localFS.promiseUpdate("", "testFile4", { works: "nope!" });
        const update5Prom = local_1.localFS.promiseUpdate("", "testFile5", { works: "nope!" });
        yield Promise.all([update1Prom, update2Prom, update3Prom, update4Prom, update5Prom]);
        // read all files
        file1ReadProm = local_1.localFS.promiseRead("", "testFile1");
        file2ReadProm = local_1.localFS.promiseRead("", "testFile2");
        file3ReadProm = local_1.localFS.promiseRead("", "testFile3");
        file4ReadProm = local_1.localFS.promiseRead("", "testFile4");
        file5ReadProm = local_1.localFS.promiseRead("", "testFile5");
        [file1Read, file2Read, file3Read, file4Read, file5Read] = yield Promise.all([file1ReadProm, file2ReadProm, file3ReadProm, file4ReadProm, file5ReadProm]);
        // check to see if read caught update
        assert_1.default.deepStrictEqual(file1Read ? file1Read[0] : { error: 'file read returned undefined' }, { works: "nope!" });
        assert_1.default.deepStrictEqual(file2Read ? file2Read[0] : { error: 'file read returned undefined' }, { works: "nope!" });
        assert_1.default.deepStrictEqual(file3Read ? file3Read[0] : { error: 'file read returned undefined' }, { works: "nope!" });
        assert_1.default.deepStrictEqual(file4Read ? file4Read[0] : { error: 'file read returned undefined' }, { works: "nope!" });
        assert_1.default.deepStrictEqual(file5Read ? file5Read[0] : { error: 'file read returned undefined' }, { works: "nope!" });
        // delete all the files
        const file1DeleteProm = local_1.localFS.promiseDelete("", "testFile1");
        const file2DeleteProm = local_1.localFS.promiseDelete("", "testFile2");
        const file3DeleteProm = local_1.localFS.promiseDelete("", "testFile3");
        const file4DeleteProm = local_1.localFS.promiseDelete("", "testFile4");
        const file5DeleteProm = local_1.localFS.promiseDelete("", "testFile5");
        yield Promise.all([file1DeleteProm, file2DeleteProm, file3DeleteProm, file4DeleteProm, file5DeleteProm]);
        done();
    });
};
unit["FSread - throws errors as expected"] = function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        // make it so this is in fakeData dir
        local_1.localFS.overrideDefaultDataPath("fedora/lib/test/fakeData");
        // create file to test on
        yield local_1.localFS.promiseCreate("", "testFile", {});
        // bad dir
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseRead("notadir", "testFile");
        }), "passed bad dir so it should have thrown");
        // bad path
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseRead("", "testFilenope");
        }), "passed bad path so it should have thrown");
        // bad dir and path
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseRead("nope", "testFilenope");
        }), "passed bad path and dir so it should have thrown");
        // delete the test file
        yield local_1.localFS.promiseDelete("", "testFile");
        done();
    });
};
//#endregion READ tests
//#region UPDATE tests
unit["FSupdate throws erros as expected"] = function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        // make it so this is in fakeData dir
        local_1.localFS.overrideDefaultDataPath("fedora/lib/test/fakeData");
        // create file to test on
        yield local_1.localFS.promiseCreate("", "testFile", {});
        // newData is an arry
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseUpdate("", "testFile", ['im', 'array']);
        }), "newData is an arry so it should have thrown");
        // newData is not an object
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseUpdate("", "testFile", "stringy boi");
        }), "newData is not an object so it should have thrown");
        // dir is bad
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseUpdate("fake dir", "testFile", { update: true });
        }), "dir is bad so it should have thrown");
        // filename is bad
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseUpdate("", "testFilebadbad", { update: true });
        }), "filename is bad so it should have thrown");
        // dir and filename is bad
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseUpdate("fake", "testFilebad", { update: true });
        }), "dir and filename is bad so it should have thrown");
        // delete the test file
        yield local_1.localFS.promiseDelete("", "testFile");
        done();
    });
};
//#endregion
//#region DELETE tests
unit["FSdelete - throws errors as expected"] = function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        // make it so this is in fakeData dir
        local_1.localFS.overrideDefaultDataPath("fedora/lib/test/fakeData");
        // create file to test on
        yield local_1.localFS.promiseCreate("", "testFile", {});
        // file name was not string
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseDelete("", []);
        }), "file name was not string so it should have thrown");
        // bad filename
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseDelete("", "testFilebad");
        }), "bad filename so it should have thrown");
        // bad dir
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseDelete("bad", "testFile");
        }), "bad dir so it should have thrown");
        // bad file name and dir
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield local_1.localFS.promiseDelete("badbad", "badbad");
        }), "bad file name and dir so it should have thrown");
        // delete test file
        yield local_1.localFS.promiseDelete("", "testFile");
        done();
    });
};
//#endregion
//#endregion
//#region - ATLAS DATA API TESTS
//#region CREATE tests
unit["ATLASAPIcreate - promisify version of create works as expected"] = function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        // ONE AT A TIME EXAMPLE
        // WIP starting here
        // create the file, check that only one file was inserted
        const insertedIDS = yield atlasAPI_1.atlasApi.promiseCreate("test", false, { testing: true });
        assert_1.default.equal(insertedIDS === null || insertedIDS === void 0 ? void 0 : insertedIDS.length, 1);
        // delete the file, check that only one file was deleted
        const deletedCount = yield atlasAPI_1.atlasApi.promiseDelete("test", { testing: true });
        assert_1.default.equal(deletedCount, 1);
        // CONCURRENT EXAMPLE
        // create a bunch of files
        const file1Prom = atlasAPI_1.atlasApi.promiseCreate("test", false, { testing: 1 });
        const file2Prom = atlasAPI_1.atlasApi.promiseCreate("test", false, { testing: 2 });
        const file3Prom = atlasAPI_1.atlasApi.promiseCreate("test", false, { testing: 3 });
        const file4Prom = atlasAPI_1.atlasApi.promiseCreate("test", false, { testing: 4 });
        const file5Prom = atlasAPI_1.atlasApi.promiseCreate("test", false, { testing: 5 });
        // check that each inserted ==1
        const [inserted1, inserted2, inserted3, inserted4, inserted5] = yield Promise.all([file1Prom, file2Prom, file3Prom, file4Prom, file5Prom]);
        assert_1.default.equal(inserted1 === null || inserted1 === void 0 ? void 0 : inserted1.length, 1);
        assert_1.default.equal(inserted2 === null || inserted2 === void 0 ? void 0 : inserted2.length, 1);
        assert_1.default.equal(inserted3 === null || inserted3 === void 0 ? void 0 : inserted3.length, 1);
        assert_1.default.equal(inserted4 === null || inserted4 === void 0 ? void 0 : inserted4.length, 1);
        assert_1.default.equal(inserted5 === null || inserted5 === void 0 ? void 0 : inserted5.length, 1);
        // delete a bunch of files
        const file1DeleteProm = atlasAPI_1.atlasApi.promiseDelete("test", { testing: 1 });
        const file2DeleteProm = atlasAPI_1.atlasApi.promiseDelete("test", { testing: 2 });
        const file3DeleteProm = atlasAPI_1.atlasApi.promiseDelete("test", { testing: 3 });
        const file4DeleteProm = atlasAPI_1.atlasApi.promiseDelete("test", { testing: 4 });
        const file5DeleteProm = atlasAPI_1.atlasApi.promiseDelete("test", { testing: 5 });
        // check that each deleted ==1
        const [deleted1, deleted2, deleted3, deleted4, deleted5] = yield Promise.all([file1DeleteProm, file2DeleteProm, file3DeleteProm, file4DeleteProm, file5DeleteProm]);
        assert_1.default.equal(deleted1, 1);
        assert_1.default.equal(deleted2, 1);
        assert_1.default.equal(deleted3, 1);
        assert_1.default.equal(deleted4, 1);
        assert_1.default.equal(deleted5, 1);
        done();
    });
};
unit["ATLASAPIcreate - throws errors as expected"] = function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        // bad collection
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseCreate("superduperbad1", false, [{ testing: true }]);
        }), "bad collection, so it should have thrown");
        // bad docList (dl for short)
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseCreate("test", false, ['im', 'real', 'bad']);
        }), "bad docList (dl for short), so it should have thrown");
        // uid missing from some docs
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            const dl = [{ testing: true }, { testing: 'deez' }, { age: 6969696420 }];
            yield atlasAPI_1.atlasApi.promiseCreate("test", 'testing', dl);
        }), "uid missing from some docs, so it should have thrown");
        // some docs had same uid
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            const dl = [{ testing: true }, { testing: 'deez' }, { testing: true, age: 6969696420 }];
            yield atlasAPI_1.atlasApi.promiseCreate("test", 'testing', dl);
        }), "some docs had same uid, so it should have thrown");
        // uid already exists in db
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            // this should not error, it is so that there is a uid in the db to find
            const insertedIDS = yield atlasAPI_1.atlasApi.promiseCreate("test", false, [{ testing: true }, { age: 18 }]);
            assert_1.default.equal(insertedIDS === null || insertedIDS === void 0 ? void 0 : insertedIDS.length, 2);
            // this should error
            yield atlasAPI_1.atlasApi.promiseCreate("test", 'age', [{ age: 111, testing: true }, { age: 18 }]);
        }), "uid already exists in db, so it should have thrown");
        // delete the files made for uid testing
        yield atlasAPI_1.atlasApi.promiseDelete("test", { age: 18 });
        yield atlasAPI_1.atlasApi.promiseDelete("test", { testing: true });
        done();
    });
};
//#endregion CREATE tests
//#region READ tests
unit["ATLASAPIread - promisify version of read works as expected"] = function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        // one at a time example
        // create file to test on
        yield atlasAPI_1.atlasApi.promiseCreate("test", false, { testing: true });
        // try and read file
        const dataList = (yield atlasAPI_1.atlasApi.promiseRead("test", { testing: true })) || [{ noData: "there was not data" }];
        assert_1.default.deepStrictEqual(dataList[0], { testing: true });
        // update file
        yield atlasAPI_1.atlasApi.promiseUpdate("test", { testing: true }, { test: "yeah!" });
        // try and read updated file, make sure update is picked up
        const updatedDataList = (yield atlasAPI_1.atlasApi.promiseRead("test", { test: 'yeah!' })) || [{ noData: "there was not data" }];
        assert_1.default.deepStrictEqual(updatedDataList[0], { test: 'yeah!' });
        // delete the file
        yield atlasAPI_1.atlasApi.promiseDelete("test", { test: 'yeah!' });
        // concurrent example
        // create a bunch of files
        const file1Prom = atlasAPI_1.atlasApi.promiseCreate("test", false, { testing: 1 });
        const file2Prom = atlasAPI_1.atlasApi.promiseCreate("test", false, { testing: 2 });
        const file3Prom = atlasAPI_1.atlasApi.promiseCreate("test", false, { testing: 3 });
        const file4Prom = atlasAPI_1.atlasApi.promiseCreate("test", false, { testing: 4 });
        const file5Prom = atlasAPI_1.atlasApi.promiseCreate("test", false, { testing: 5 });
        yield Promise.all([file1Prom, file2Prom, file3Prom, file4Prom, file5Prom]);
        // try and read all the files
        let file1ReadProm = atlasAPI_1.atlasApi.promiseRead("test", { testing: 1 });
        let file2ReadProm = atlasAPI_1.atlasApi.promiseRead("test", { testing: 2 });
        let file3ReadProm = atlasAPI_1.atlasApi.promiseRead("test", { testing: 3 });
        let file4ReadProm = atlasAPI_1.atlasApi.promiseRead("test", { testing: 4 });
        let file5ReadProm = atlasAPI_1.atlasApi.promiseRead("test", { testing: 5 });
        let [file1Read, file2Read, file3Read, file4Read, file5Read] = yield Promise.all([file1ReadProm, file2ReadProm, file3ReadProm, file4ReadProm, file5ReadProm]);
        // check all files
        assert_1.default.deepStrictEqual(file1Read ? file1Read[0] : { error: 'file read returned undefined' }, { testing: 1 });
        assert_1.default.deepStrictEqual(file2Read ? file2Read[0] : { error: 'file read returned undefined' }, { testing: 2 });
        assert_1.default.deepStrictEqual(file3Read ? file3Read[0] : { error: 'file read returned undefined' }, { testing: 3 });
        assert_1.default.deepStrictEqual(file4Read ? file4Read[0] : { error: 'file read returned undefined' }, { testing: 4 });
        assert_1.default.deepStrictEqual(file5Read ? file5Read[0] : { error: 'file read returned undefined' }, { testing: 5 });
        // update all files
        const update1Prom = atlasAPI_1.atlasApi.promiseUpdate("test", { testing: 1 }, { works: "nope1" });
        const update2Prom = atlasAPI_1.atlasApi.promiseUpdate("test", { testing: 2 }, { works: "nope2" });
        const update3Prom = atlasAPI_1.atlasApi.promiseUpdate("test", { testing: 3 }, { works: "nope3" });
        const update4Prom = atlasAPI_1.atlasApi.promiseUpdate("test", { testing: 4 }, { works: "nope4" });
        const update5Prom = atlasAPI_1.atlasApi.promiseUpdate("test", { testing: 5 }, { works: "nope5" });
        yield Promise.all([update1Prom, update2Prom, update3Prom, update4Prom, update5Prom]);
        // read all files
        file1ReadProm = atlasAPI_1.atlasApi.promiseRead("test", { works: 'nope1' });
        file2ReadProm = atlasAPI_1.atlasApi.promiseRead("test", { works: 'nope2' });
        file3ReadProm = atlasAPI_1.atlasApi.promiseRead("test", { works: 'nope3' });
        file4ReadProm = atlasAPI_1.atlasApi.promiseRead("test", { works: 'nope4' });
        file5ReadProm = atlasAPI_1.atlasApi.promiseRead("test", { works: 'nope5' });
        [file1Read, file2Read, file3Read, file4Read, file5Read] = yield Promise.all([file1ReadProm, file2ReadProm, file3ReadProm, file4ReadProm, file5ReadProm]);
        // check to see if read caught update
        assert_1.default.deepStrictEqual(file1Read ? file1Read[0] : { error: 'file read returned undefined' }, { works: "nope1" });
        assert_1.default.deepStrictEqual(file2Read ? file2Read[0] : { error: 'file read returned undefined' }, { works: "nope2" });
        assert_1.default.deepStrictEqual(file3Read ? file3Read[0] : { error: 'file read returned undefined' }, { works: "nope3" });
        assert_1.default.deepStrictEqual(file4Read ? file4Read[0] : { error: 'file read returned undefined' }, { works: "nope4" });
        assert_1.default.deepStrictEqual(file5Read ? file5Read[0] : { error: 'file read returned undefined' }, { works: "nope5" });
        // delete all the files
        const file1DeleteProm = atlasAPI_1.atlasApi.promiseDelete("test", { works: 'nope1' });
        const file2DeleteProm = atlasAPI_1.atlasApi.promiseDelete("test", { works: 'nope2' });
        const file3DeleteProm = atlasAPI_1.atlasApi.promiseDelete("test", { works: 'nope3' });
        const file4DeleteProm = atlasAPI_1.atlasApi.promiseDelete("test", { works: 'nope4' });
        const file5DeleteProm = atlasAPI_1.atlasApi.promiseDelete("test", { works: 'nope5' });
        yield Promise.all([file1DeleteProm, file2DeleteProm, file3DeleteProm, file4DeleteProm, file5DeleteProm]);
        done();
    });
};
unit["ATLASAPIread - throws errors as expected"] = function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        // create file to test on
        yield atlasAPI_1.atlasApi.promiseCreate("test", false, { age: 18 });
        // find is a string
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseRead("test", "im bad bad bad");
        }), "find is a string, so it should have thrown");
        // find is not a dl or doc
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseRead("test", ['im', 'bad']);
        }), "find is not a dl or doc, so it should have thrown");
        // bad collection
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseRead("im bad bad bad bad bad", { age: 18 });
        }), "bad collection, so it should have thrown");
        // bad find (redundant??)
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseRead("test", () => { return 123345; });
        }), "bad find, so it should have thrown");
        // found nothing
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseRead("test", { age: 19 });
        }), "found nothing, so it should have thrown");
        // delete the test file
        yield atlasAPI_1.atlasApi.promiseDelete("test", { age: 18 });
        done();
    });
};
//#endregion READ tests
//#region UPDATE tests
unit["ATLASAPIupdate throws erros as expected"] = function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        // create file to test on
        yield atlasAPI_1.atlasApi.promiseCreate("test", false, { testing: 'a lot' });
        // find is a string
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseUpdate("test", "not", { age: 18 });
        }), "find is a string, so it should have thrown");
        // bad find
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseUpdate("test", ['terrible'], { age: 18 });
        }), "bad find, so it should have thrown");
        // bad replace
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseUpdate("test", { testing: 'a lot' }, ['evil!!']);
        }), "bad replace, so it should have thrown");
        // bad find and replace
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseUpdate("test", ['so'], () => { return 123456; });
        }), "bad find and replace, so it should have thrown");
        // bad collection
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseUpdate("badbadbad", { testing: 'a lot' }, { age: 18 });
        }), "bad collection, so it should have thrown");
        // nothing updated
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseUpdate("test", { testing: 'not a doc!!' }, { age: 18 });
        }), "nothing updated, so it should have thrown");
        // delete the test file
        yield atlasAPI_1.atlasApi.promiseDelete("test", { testing: 'a lot' });
        done();
    });
};
//#endregion
//#region DELETE tests
unit["ATLASAPIdelete - throws errors as expected"] = function (done) {
    return __awaiter(this, void 0, void 0, function* () {
        // create file to test on
        yield atlasAPI_1.atlasApi.promiseCreate("test", false, { testing: true });
        // find is a string
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseDelete("test", 'stringy');
        }), "find is a string, so it should have thrown");
        // bad find
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseDelete("test", ['im']);
        }), "bad find, so it should have thrown");
        // bad collection
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseDelete("asasasdas", { testing: true });
        }), "bad collection, so it should have thrown");
        // nothing to delete
        yield assert_1.default.rejects(() => __awaiter(this, void 0, void 0, function* () {
            yield atlasAPI_1.atlasApi.promiseDelete("test", { testing: false });
        }), "nothing to delete, so it should have thrown");
        // delete test file
        yield atlasAPI_1.atlasApi.promiseDelete("test", { testing: true });
        done();
    });
};
//#endregion
//#endregion
// export the tests
exports.default = unit;
