"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MYfs = exports.server = exports.router = void 0;
// cram all the functionality of thing into one object!!
const server_1 = require("../appStuff/server_");
Object.defineProperty(exports, "server", { enumerable: true, get: function () { return server_1.server; } });
const router_1 = require("./router_");
Object.defineProperty(exports, "router", { enumerable: true, get: function () { return router_1.router; } });
const data_1 = require("../data/data_");
Object.defineProperty(exports, "MYfs", { enumerable: true, get: function () { return data_1.fullDataSystem; } });
