"use strict";
var inherits = require("../util.js").inherits;
var Pass = require("../pass.js");
function FunctionRedefinitionAbuse() {
    this.constructor$();
}
inherits(FunctionRedefinitionAbuse, Pass);
module.exports = FunctionRedefinitionAbuse;

FunctionRedefinitionAbuse.prototype.consumesInput =
function FunctionRedefinitionAbuse$consumesInput() {
    return false;
};

FunctionRedefinitionAbuse.prototype.do = function FunctionRedefinitionAbuse$do(line, analysis) {
    return false;
};
