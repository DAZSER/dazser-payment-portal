"use strict";

import * as _Express from "express";

const serverless = require("serverless-http");
const express = require("express");
//const favicon = require('serve-favicon');
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname,"public")));
//app.use(favicon(path.join(__dirname,"public","favicon.ico")));

app.get("/", (req: _Express.Request, res: _Express.Response) => {
  res.status(200).sendFile(path.join(__dirname,"views","index.html"));
});

module.exports.handler = serverless(app);
