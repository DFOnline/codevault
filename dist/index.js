"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var sqlite3_1 = __importDefault(require("sqlite3"));
var sqlite_1 = require("sqlite");
var PORT = 8000;
var DB = (0, sqlite_1.open)({ driver: sqlite3_1["default"], filename: '/dist/data.db' });
var APP = (0, express_1["default"])();
APP.get('/', function (_req, res) {
    res.send('ping');
});
APP.listen(PORT, function () {
    console.log("App listening at port ".concat(PORT));
});
