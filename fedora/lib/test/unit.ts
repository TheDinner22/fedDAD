/*
*
*all da unit tests
*/

//types
import { testObj } from ".";

// dependencies
import assert from "assert";

// dependencies (to be tested)
import { objEqual } from "../appStuff/helpers_";
import { localFS } from "./../data/local_";
import { atlasApi } from "./../data/atlas/atlasAPI_"

//holder for the tests
let unit:testObj = {};

//#region - TESTS FOR HELPERS
unit["helpers.obj_equal should work"] = function(done){
    const inputs = [
        [{}, {}],
        [{a : "man"}, {a : "man"}],
        [{a : "man", gf : "none"}, {gf : "none", a : "man"}],
        [[1, 2, 3], [1, 2, 3]],
        [[1, 2, 3], [3, 2, 1]],
        [{a : "man", gf : "awesome"}, {a : "man"}],
        [{a : "Man"}, {a : "man"}]
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

        assert.strictEqual(objEqual(input[0], input[1]), output);   
    }
    done();
};
//#endregion

//#region - DATA LOCAL-FS TESTS

unit["LOCAL-FS - overrideDefaultDataPath should actually work"] = async function(done){ // todo finish me with promiseify
    // change data path
    localFS.overrideDefaultDataPath("fedora/lib/test/fakeData");

    try {
        // creating file
        await localFS.promiseCreate("", "testFile", {testing: true});

        // reading file
        const dataList: Object[] = await localFS.promiseRead("", "testFile") || [{error: 'bind read returned not data!'}];
        assert.deepStrictEqual(dataList[0], {testing: true});
        
        // deleting file
        await localFS.promiseDelete("", "testFile");
    }catch(e:any){throw new Error(e.error)}

    done();
};

//#region CREATE tests
unit["FScreate - promisify version of create works as expected"] = async function(done){
    // make it so this is in fakeData dir
    localFS.overrideDefaultDataPath("fedora/lib/test/fakeData");
    
    // try block for if there are errors
    try {
        // ONE AT A TIME EXAMPLE

        // create the file and error if it errors
        await localFS.promiseCreate("", "testFile", {testing: true})

        // delete the file and error if it errors
        await localFS.promiseDelete("", "testFile");
        
        // CONCURRENT EXAMPLE
        // create a bunch of files
        const file1Prom = localFS.promiseCreate("", "testFile1", {testing: true})
        const file2Prom = localFS.promiseCreate("", "testFile2", {testing: true})
        const file3Prom = localFS.promiseCreate("", "testFile3", {testing: true})
        const file4Prom = localFS.promiseCreate("", "testFile4", {testing: true})
        const file5Prom = localFS.promiseCreate("", "testFile5", {testing: true})

        await Promise.all([file1Prom, file2Prom, file3Prom, file4Prom, file5Prom]);
        
        // delete a bunch of files
        const file1DeleteProm = localFS.promiseDelete("", "testFile1")
        const file2DeleteProm = localFS.promiseDelete("", "testFile2")
        const file3DeleteProm = localFS.promiseDelete("", "testFile3")
        const file4DeleteProm = localFS.promiseDelete("", "testFile4")
        const file5DeleteProm = localFS.promiseDelete("", "testFile5")

        await Promise.all([file1DeleteProm, file2DeleteProm, file3DeleteProm, file4DeleteProm, file5DeleteProm]);

    } catch (e:any) { // this is how we get the error
        throw new Error(e.error);
    }
    
    done();
};

unit["FScreate - throws errors as expected"] = async function(done){
    // if passed object[], should error
    await assert.rejects(async ()=>{ // use rejects for when promises are supposed to 'error'
        await localFS.promiseCreate("", "testFile", [{testing:true}]);
    }, "passed it Object[], so it should have thrown");

    // if passed bad dir, should error
    await assert.rejects(async ()=>{ // use rejects for when promises are supposed to 'error'
        await localFS.promiseCreate("badDirName", "testFile", {testing:true});
    }, "passed bad dir name, so it should have thrown");

    // if passed bad fileName, should error
    await assert.rejects(async ()=>{ // use rejects for when promises are supposed to 'error'
        await localFS.promiseCreate("", "testFile.json", {testing:true});
    }, "passed bad fileName, so it should have thrown");

    // if pass bad data should error
    await assert.rejects(async ()=>{ // use rejects for when promises are supposed to 'error'
        await localFS.promiseCreate("", "testFile", "bad input (should be object)");
    }, "passed bad data, so it should have thrown");

    // if file already exists, should error
    await assert.rejects(async ()=>{ // use rejects for when promises are supposed to 'error'
        await localFS.promiseCreate("", "testFile", {testing: true});
        await localFS.promiseCreate("", "testFile", {testing: true});
    }, "made file twice, so it should have thrown");

    // delete the file made twice
    await localFS.promiseDelete("", "testFile");

    done();
};
//#endregion CREATE tests

//#region READ tests
unit["FSread - promisify version of read works as expected"] = async function(done){
    // make it so this is in fakeData dir
    localFS.overrideDefaultDataPath("fedora/lib/test/fakeData");

    // one at a time example

    // create file to test on
    await localFS.promiseCreate("", "testFile", {});

    // try and read file
    const dataList: Object[] = await localFS.promiseRead("", "testFile") || [{noData:"there was not data"}];
    assert.deepStrictEqual(dataList[0], {});
    
    // update file
    await localFS.promiseUpdate("", "testFile", {testing: "yeah!"});
    
    // try and read updated file, make sure update is picked up
    const updatedDataList: Object[] = await localFS.promiseRead("", "testFile") || [{noData:"there was not data"}];
    assert.deepStrictEqual(updatedDataList[0], {testing: 'yeah!'});
    
    // delete the file
    await localFS.promiseDelete("", "testFile");

    // concurrent example

    // create a bunch of files
    const file1Prom = localFS.promiseCreate("", "testFile1", {});
    const file2Prom = localFS.promiseCreate("", "testFile2", {});
    const file3Prom = localFS.promiseCreate("", "testFile3", {});
    const file4Prom = localFS.promiseCreate("", "testFile4", {});
    const file5Prom = localFS.promiseCreate("", "testFile5", {});

    await Promise.all([file1Prom, file2Prom, file3Prom, file4Prom, file5Prom]);

    // try and read all the files
    let file1ReadProm = localFS.promiseRead("", "testFile1");
    let file2ReadProm = localFS.promiseRead("", "testFile2");
    let file3ReadProm = localFS.promiseRead("", "testFile3");
    let file4ReadProm = localFS.promiseRead("", "testFile4");
    let file5ReadProm = localFS.promiseRead("", "testFile5");

    let [file1Read, file2Read, file3Read, file4Read, file5Read] = await Promise.all([file1ReadProm, file2ReadProm, file3ReadProm, file4ReadProm, file5ReadProm]);

    // check all files
    assert.deepStrictEqual(file1Read ? file1Read[0] : {error: 'file read returned undefined'}, {});
    assert.deepStrictEqual(file2Read ? file2Read[0] : {error: 'file read returned undefined'}, {});
    assert.deepStrictEqual(file3Read ? file3Read[0] : {error: 'file read returned undefined'}, {});
    assert.deepStrictEqual(file4Read ? file4Read[0] : {error: 'file read returned undefined'}, {});
    assert.deepStrictEqual(file5Read ? file5Read[0] : {error: 'file read returned undefined'}, {});

    // update all files
    const update1Prom = localFS.promiseUpdate("", "testFile1", {works: "nope!"});
    const update2Prom = localFS.promiseUpdate("", "testFile2", {works: "nope!"});
    const update3Prom = localFS.promiseUpdate("", "testFile3", {works: "nope!"});
    const update4Prom = localFS.promiseUpdate("", "testFile4", {works: "nope!"});
    const update5Prom = localFS.promiseUpdate("", "testFile5", {works: "nope!"});

    await Promise.all([update1Prom, update2Prom, update3Prom, update4Prom, update5Prom]);

    // read all files
    file1ReadProm = localFS.promiseRead("", "testFile1");
    file2ReadProm = localFS.promiseRead("", "testFile2");
    file3ReadProm = localFS.promiseRead("", "testFile3");
    file4ReadProm = localFS.promiseRead("", "testFile4");
    file5ReadProm = localFS.promiseRead("", "testFile5");

    [file1Read, file2Read, file3Read, file4Read, file5Read] = await Promise.all([file1ReadProm, file2ReadProm, file3ReadProm, file4ReadProm, file5ReadProm]);

    // check to see if read caught update
    assert.deepStrictEqual(file1Read ? file1Read[0] : {error: 'file read returned undefined'}, {works: "nope!"});
    assert.deepStrictEqual(file2Read ? file2Read[0] : {error: 'file read returned undefined'}, {works: "nope!"});
    assert.deepStrictEqual(file3Read ? file3Read[0] : {error: 'file read returned undefined'}, {works: "nope!"});
    assert.deepStrictEqual(file4Read ? file4Read[0] : {error: 'file read returned undefined'}, {works: "nope!"});
    assert.deepStrictEqual(file5Read ? file5Read[0] : {error: 'file read returned undefined'}, {works: "nope!"});

    // delete all the files
    const file1DeleteProm = localFS.promiseDelete("", "testFile1")
    const file2DeleteProm = localFS.promiseDelete("", "testFile2")
    const file3DeleteProm = localFS.promiseDelete("", "testFile3")
    const file4DeleteProm = localFS.promiseDelete("", "testFile4")
    const file5DeleteProm = localFS.promiseDelete("", "testFile5")

    await Promise.all([file1DeleteProm, file2DeleteProm, file3DeleteProm, file4DeleteProm, file5DeleteProm]);

    done();
};

unit["FSread - throws errors as expected"] = async function (done){
    // make it so this is in fakeData dir
    localFS.overrideDefaultDataPath("fedora/lib/test/fakeData");

    // create file to test on
    await localFS.promiseCreate("", "testFile", {});

    // bad dir
    await assert.rejects(async () => {
        await localFS.promiseRead("notadir", "testFile");
    }, "passed bad dir so it should have thrown");

    // bad path
    await assert.rejects(async () => {
        await localFS.promiseRead("", "testFilenope");
    }, "passed bad path so it should have thrown");

    // bad dir and path
    await assert.rejects(async () => {
        await localFS.promiseRead("nope", "testFilenope");
    }, "passed bad path and dir so it should have thrown");

    // delete the test file
    await localFS.promiseDelete("", "testFile");

    done();
};
//#endregion READ tests

//#region UPDATE tests
unit["FSupdate throws erros as expected"] = async function (done){
    // make it so this is in fakeData dir
    localFS.overrideDefaultDataPath("fedora/lib/test/fakeData");

    // create file to test on
    await localFS.promiseCreate("", "testFile", {});

    // newData is an arry
    await assert.rejects(async () => {
        await localFS.promiseUpdate("", "testFile", ['im', 'array']);
    },"newData is an arry so it should have thrown");

    // newData is not an object
    await assert.rejects(async () => {
        await localFS.promiseUpdate("", "testFile", "stringy boi");
    },"newData is not an object so it should have thrown");

    // dir is bad
    await assert.rejects(async () => {
        await localFS.promiseUpdate("fake dir", "testFile", {update: true});
    },"dir is bad so it should have thrown");

    // filename is bad
    await assert.rejects(async () => {
        await localFS.promiseUpdate("", "testFilebadbad", {update: true});
    },"filename is bad so it should have thrown");

    // dir and filename is bad
    await assert.rejects(async () => {
        await localFS.promiseUpdate("fake", "testFilebad", {update: true});
    },"dir and filename is bad so it should have thrown");

    // delete the test file
    await localFS.promiseDelete("", "testFile");

    done();
};

//#endregion

//#region DELETE tests
unit["FSdelete - throws errors as expected"] = async function (done){
    // make it so this is in fakeData dir
    localFS.overrideDefaultDataPath("fedora/lib/test/fakeData");

    // create file to test on
    await localFS.promiseCreate("", "testFile", {});

    // file name was not string
    await assert.rejects(async () => {
        await localFS.promiseDelete("", []);
    },"file name was not string so it should have thrown");

    // bad filename
    await assert.rejects(async () => {
        await localFS.promiseDelete("", "testFilebad");
    },"bad filename so it should have thrown");

    // bad dir
    await assert.rejects(async () => {
        await localFS.promiseDelete("bad", "testFile");
    },"bad dir so it should have thrown");

    // bad file name and dir
    await assert.rejects(async () => {
        await localFS.promiseDelete("badbad", "badbad");
    },"bad file name and dir so it should have thrown");

    // delete test file
    await localFS.promiseDelete("", "testFile");

    done();
};

//#endregion


//#endregion

//#region - ATLAS DATA API TESTS

//#region CREATE tests
unit["ATLASAPIcreate - promisify version of create works as expected"] = async function(done){
    // ONE AT A TIME EXAMPLE

    // WIP starting here

    // create the file, check that only one file was inserted
    const insertedIDS = await atlasApi.promiseCreate("test", false, {testing: true});
    assert.equal(insertedIDS?.length, 1);

    // delete the file, check that only one file was deleted
    const deletedCount = await atlasApi.promiseDelete("test", {testing: true});
    assert.equal(deletedCount, 1);

    
    // CONCURRENT EXAMPLE
    // create a bunch of files
    const file1Prom = atlasApi.promiseCreate("test", false, {testing: 1});
    const file2Prom = atlasApi.promiseCreate("test", false, {testing: 2});
    const file3Prom = atlasApi.promiseCreate("test", false, {testing: 3});
    const file4Prom = atlasApi.promiseCreate("test", false, {testing: 4});
    const file5Prom = atlasApi.promiseCreate("test", false, {testing: 5});

    // check that each inserted ==1
    const [inserted1, inserted2, inserted3, inserted4, inserted5] = await Promise.all([file1Prom, file2Prom, file3Prom, file4Prom, file5Prom]);
    assert.equal(inserted1?.length, 1);
    assert.equal(inserted2?.length, 1);
    assert.equal(inserted3?.length, 1);
    assert.equal(inserted4?.length, 1);
    assert.equal(inserted5?.length, 1);
    
    // delete a bunch of files
    const file1DeleteProm = atlasApi.promiseDelete("test", {testing: 1});
    const file2DeleteProm = atlasApi.promiseDelete("test", {testing: 2});
    const file3DeleteProm = atlasApi.promiseDelete("test", {testing: 3});
    const file4DeleteProm = atlasApi.promiseDelete("test", {testing: 4});
    const file5DeleteProm = atlasApi.promiseDelete("test", {testing: 5});

    // check that each deleted ==1
    const [deleted1, deleted2, deleted3, deleted4, deleted5] = await Promise.all([file1DeleteProm, file2DeleteProm, file3DeleteProm, file4DeleteProm, file5DeleteProm]);
    assert.equal(deleted1, 1);
    assert.equal(deleted2, 1);
    assert.equal(deleted3, 1);
    assert.equal(deleted4, 1);
    assert.equal(deleted5, 1);

    done();
};

unit["ATLASAPIcreate - throws errors as expected"] = async function(done){
    
    // bad collection
    await assert.rejects(async ()=>{ // use rejects for when promises are supposed to 'error'
        await atlasApi.promiseCreate("superduperbad1", false, [{testing:true}]);
    },"bad collection, so it should have thrown");
    
    // bad docList (dl for short)
    await assert.rejects(async ()=>{ // use rejects for when promises are supposed to 'error'
        await atlasApi.promiseCreate("test", false, ['im', 'real', 'bad']);
    },"bad docList (dl for short), so it should have thrown");

    // uid missing from some docs
    await assert.rejects(async ()=>{ // use rejects for when promises are supposed to 'error'
        const dl = [{testing:true}, {testing: 'deez'}, {age:6969696420}];
        await atlasApi.promiseCreate("test", 'testing', dl);
    },"uid missing from some docs, so it should have thrown");

    // some docs had same uid
    await assert.rejects(async ()=>{ // use rejects for when promises are supposed to 'error'
        const dl = [{testing:true}, {testing: 'deez'}, {testing:true, age:6969696420}];
        await atlasApi.promiseCreate("test", 'testing', dl);
    },"some docs had same uid, so it should have thrown");

    // uid already exists in db
    await assert.rejects(async ()=>{ // use rejects for when promises are supposed to 'error'
        // this should not error, it is so that there is a uid in the db to find
        const insertedIDS = await atlasApi.promiseCreate("test", false, [{testing:true}, {age:18}]);
        assert.equal(insertedIDS?.length, 2);

        // this should error
        await atlasApi.promiseCreate("test", 'age', [{age:111, testing:true}, {age:18}]);
    },"uid already exists in db, so it should have thrown");
    
    // delete the files made for uid testing
    await atlasApi.promiseDelete("test", {age: 18});
    await atlasApi.promiseDelete("test", {testing: true});

    done();
};

//#endregion CREATE tests

//#region READ tests
unit["ATLASAPIread - promisify version of read works as expected"] = async function(done){
    // one at a time example

    // create file to test on
    await atlasApi.promiseCreate("test", false, {testing: true});

    // try and read file
    const dataList: Object[] = await atlasApi.promiseRead("test", {testing: true}) || [{noData:"there was not data"}];
    assert.deepStrictEqual(dataList[0], {testing: true});
    
    // update file
    await atlasApi.promiseUpdate("test", {testing: true}, {test: "yeah!"});
    
    // try and read updated file, make sure update is picked up
    const updatedDataList: Object[] = await atlasApi.promiseRead("test", {test: 'yeah!'}) || [{noData:"there was not data"}];
    assert.deepStrictEqual(updatedDataList[0], {test: 'yeah!'});
    
    // delete the file
    await atlasApi.promiseDelete("test", {test: 'yeah!'});

    // concurrent example

    // create a bunch of files
    const file1Prom = atlasApi.promiseCreate("test", false, {testing: 1});
    const file2Prom = atlasApi.promiseCreate("test", false, {testing: 2});
    const file3Prom = atlasApi.promiseCreate("test", false, {testing: 3});
    const file4Prom = atlasApi.promiseCreate("test", false, {testing: 4});
    const file5Prom = atlasApi.promiseCreate("test", false, {testing: 5});

    await Promise.all([file1Prom, file2Prom, file3Prom, file4Prom, file5Prom]);

    // try and read all the files
    let file1ReadProm = atlasApi.promiseRead("test", {testing: 1});
    let file2ReadProm = atlasApi.promiseRead("test", {testing: 2});
    let file3ReadProm = atlasApi.promiseRead("test", {testing: 3});
    let file4ReadProm = atlasApi.promiseRead("test", {testing: 4});
    let file5ReadProm = atlasApi.promiseRead("test", {testing: 5});

    let [file1Read, file2Read, file3Read, file4Read, file5Read] = await Promise.all([file1ReadProm, file2ReadProm, file3ReadProm, file4ReadProm, file5ReadProm]);

    // check all files
    assert.deepStrictEqual(file1Read ? file1Read[0] : {error: 'file read returned undefined'}, {testing: 1});
    assert.deepStrictEqual(file2Read ? file2Read[0] : {error: 'file read returned undefined'}, {testing: 2});
    assert.deepStrictEqual(file3Read ? file3Read[0] : {error: 'file read returned undefined'}, {testing: 3});
    assert.deepStrictEqual(file4Read ? file4Read[0] : {error: 'file read returned undefined'}, {testing: 4});
    assert.deepStrictEqual(file5Read ? file5Read[0] : {error: 'file read returned undefined'}, {testing: 5});

    // update all files
    const update1Prom = atlasApi.promiseUpdate("test", {testing: 1}, {works: "nope1"});
    const update2Prom = atlasApi.promiseUpdate("test", {testing: 2}, {works: "nope2"});
    const update3Prom = atlasApi.promiseUpdate("test", {testing: 3}, {works: "nope3"});
    const update4Prom = atlasApi.promiseUpdate("test", {testing: 4}, {works: "nope4"});
    const update5Prom = atlasApi.promiseUpdate("test", {testing: 5}, {works: "nope5"});

    await Promise.all([update1Prom, update2Prom, update3Prom, update4Prom, update5Prom]);

    // read all files
    file1ReadProm = atlasApi.promiseRead("test", {works: 'nope1'});
    file2ReadProm = atlasApi.promiseRead("test", {works: 'nope2'});
    file3ReadProm = atlasApi.promiseRead("test", {works: 'nope3'});
    file4ReadProm = atlasApi.promiseRead("test", {works: 'nope4'});
    file5ReadProm = atlasApi.promiseRead("test", {works: 'nope5'});

    [file1Read, file2Read, file3Read, file4Read, file5Read] = await Promise.all([file1ReadProm, file2ReadProm, file3ReadProm, file4ReadProm, file5ReadProm]);

    // check to see if read caught update
    assert.deepStrictEqual(file1Read ? file1Read[0] : {error: 'file read returned undefined'}, {works: "nope1"});
    assert.deepStrictEqual(file2Read ? file2Read[0] : {error: 'file read returned undefined'}, {works: "nope2"});
    assert.deepStrictEqual(file3Read ? file3Read[0] : {error: 'file read returned undefined'}, {works: "nope3"});
    assert.deepStrictEqual(file4Read ? file4Read[0] : {error: 'file read returned undefined'}, {works: "nope4"});
    assert.deepStrictEqual(file5Read ? file5Read[0] : {error: 'file read returned undefined'}, {works: "nope5"});

    // delete all the files
    const file1DeleteProm = atlasApi.promiseDelete("test", {works: 'nope1'})
    const file2DeleteProm = atlasApi.promiseDelete("test", {works: 'nope2'})
    const file3DeleteProm = atlasApi.promiseDelete("test", {works: 'nope3'})
    const file4DeleteProm = atlasApi.promiseDelete("test", {works: 'nope4'})
    const file5DeleteProm = atlasApi.promiseDelete("test", {works: 'nope5'})

    await Promise.all([file1DeleteProm, file2DeleteProm, file3DeleteProm, file4DeleteProm, file5DeleteProm]);

    done();
};

unit["ATLASAPIread - throws errors as expected"] = async function (done){
    // create file to test on
    await atlasApi.promiseCreate("test", false, {age:18});

    
    // find is a string
    await assert.rejects(async () => {
        await atlasApi.promiseRead("test", "im bad bad bad");
    }, "find is a string, so it should have thrown");
    
    // find is not a dl or doc
    await assert.rejects(async () => {
        await atlasApi.promiseRead("test", ['im', 'bad']);
    }, "find is not a dl or doc, so it should have thrown");

    // bad collection
    await assert.rejects(async () => {
        await atlasApi.promiseRead("im bad bad bad bad bad", {age: 18});
    }, "bad collection, so it should have thrown");

    // bad find (redundant??)
    await assert.rejects(async () => {
        await atlasApi.promiseRead("test", ()=>{return 123345});
    }, "bad find, so it should have thrown");

    // found nothing
    await assert.rejects(async () => {
        await atlasApi.promiseRead("test", {age: 19});
    }, "found nothing, so it should have thrown");

    // delete the test file
    await atlasApi.promiseDelete("test", {age:18});

    done();

};

//#endregion READ tests

//#region UPDATE tests
unit["ATLASAPIupdate throws erros as expected"] = async function (done){
    // create file to test on
    await atlasApi.promiseCreate("test", false, {testing:'a lot'});

    
    // find is a string
    await assert.rejects(async () => {
        await atlasApi.promiseUpdate("test", "not", {age: 18});
    }, "find is a string, so it should have thrown");

    // bad find
    await assert.rejects(async () => {
        await atlasApi.promiseUpdate("test", ['terrible'], {age: 18});
    }, "bad find, so it should have thrown");

    // bad replace
    await assert.rejects(async () => {
        await atlasApi.promiseUpdate("test", {testing: 'a lot'}, ['evil!!']);
    }, "bad replace, so it should have thrown");

    // bad find and replace
    await assert.rejects(async () => {
        await atlasApi.promiseUpdate("test", ['so'], ()=>{return 123456});
    }, "bad find and replace, so it should have thrown");

    // bad collection
    await assert.rejects(async () => {
        await atlasApi.promiseUpdate("badbadbad", {testing: 'a lot'}, {age: 18});
    }, "bad collection, so it should have thrown");

    // nothing updated
    await assert.rejects(async () => {
        await atlasApi.promiseUpdate("test", {testing: 'not a doc!!'}, {age: 18});
    }, "nothing updated, so it should have thrown");

    // delete the test file
    await atlasApi.promiseDelete("test", {testing: 'a lot'});

    done();
};

//#endregion

//#region DELETE tests
unit["ATLASAPIdelete - throws errors as expected"] = async function (done){
    // create file to test on
    await atlasApi.promiseCreate("test", false, {testing: true});
    
    // find is a string
    await assert.rejects(async () => {
        await atlasApi.promiseDelete("test", 'stringy');
    }, "find is a string, so it should have thrown");

    // bad find
    await assert.rejects(async () => {
        await atlasApi.promiseDelete("test", ['im']);
    }, "bad find, so it should have thrown");

    // bad collection
    await assert.rejects(async () => {
        await atlasApi.promiseDelete("asasasdas", {testing: true});
    }, "bad collection, so it should have thrown");

    // nothing to delete
    await assert.rejects(async () => {
        await atlasApi.promiseDelete("test", {testing: false});
    }, "nothing to delete, so it should have thrown");

    // delete test file
    await atlasApi.promiseDelete("test", {testing: true});

    done();
};

//#endregion

//#endregion

// export the tests
export default unit;
