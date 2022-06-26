"use strict";
//create and export configuration variables
//
Object.defineProperty(exports, "__esModule", { value: true });
let enviroments = {};
//staging (default) enviroment
enviroments.staging = {
    // server/helpers/general
    "httpPort": process.env.PORT,
    // 'httpPort' : 3000,
    "httpsPort": 3001,
    "envName": "staging",
    "hashingSecret": "thisIsASecret",
    // data
    "use": "ATLAS/API",
    // ATLAS for dev testing u gotta pass these in order bcuz ts-node is bad, in production pass so they are key-value pairs in process.env!!
    okCollections: ['only'],
    // "DB_URL" : process.argv[2] || process.env.DB_URI,
    "CLUSTER_NAME": process.argv[3] || process.env.CLUSTER_NAME,
    "DB_NAME": process.argv[4] || process.env.DB_NAME,
    "DATA_API_ID": process.argv[5] || process.env.DATA_ID,
    "DATA_KEY": process.argv[6] || process.env.DATA_KEY,
};
// testing enviroment
enviroments.testing = {
    // server/helpers/general
    "httpPort": process.env.PORT,
    "httpsPort": 4001,
    "envName": "testing",
    "hashingSecret": "thisIsASecret",
    // data
    "use": "FS",
    // ATLAS
    okCollections: ['only'],
    // "DB_URL" : process.argv[2] || process.env.DB_URI,
    "CLUSTER_NAME": process.argv[3] || process.env.CLUSTER_NAME,
    "DB_NAME": process.argv[4] || process.env.DB_NAME,
    "DATA_API_ID": process.argv[5] || process.env.DATA_ID,
    "DATA_KEY": process.argv[6] || process.env.DATA_KEY,
};
//production enviroment
enviroments.production = {
    // server/helpers/general
    "httpPort": process.env.PORT,
    "httpsPort": 5001,
    "envName": "production",
    "hashingSecret": "thisIsASecret",
    // data
    "use": "FS",
    // ATLAS
    okCollections: ['only'],
    // "DB_URL" : process.argv[2] || process.env.DB_URI,
    "CLUSTER_NAME": process.env.CLUSTER_NAME,
    "DB_NAME": process.env.DB_NAME,
    "DATA_API_ID": process.env.DATA_ID,
    "DATA_KEY": process.env.DATA_KEY,
};
//determine which env was requested via command-line
const envName = typeof (process.env.NODE_ENV) == "string" ? process.env.NODE_ENV.toLowerCase() : "";
//check if the env is listed in the env's above, if not defualt to staging
const currentEnviroment = typeof (enviroments[envName]) == "object" ? enviroments[envName] : enviroments.staging;
//export the module
exports.default = currentEnviroment;
