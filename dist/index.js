"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var APP = (0, express_1["default"])();
APP.get('/', function (_req, res) {
    res.send('ping');
});
APP.listen(8000);
