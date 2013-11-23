"use strict";
//ShortFunction pass is a non-consumptive pass that tracks all functions which are considered
//short
//Then inlining pass can consider the functions that are short but cannot be inlined for some other reason
//as critical or high
var inherits = require("../util.js").inherits;
var Pass = require("../pass.js");

var shortFunctionMap = Object.create(null);


function ShortFunction() {
    this.constructor$();
    this.linePattern = /^\[marking [a-zA-Z0-9]{1,16} <JS Function ([^ ]*) \(SharedFunctionInfo [a-zA-Z0-9]{1,16}\)> for recompilation, reason: small function/;
}
inherits(ShortFunction, Pass);
module.exports = ShortFunction;

ShortFunction.prototype.consumesInput =
function ShortFunction$consumesInput() {
    return false;
};

ShortFunction.prototype.do = function ShortFunction$do(line, analysis) {
    var match = this.linePattern.exec(line);
    if (!match) {
        return false;
    }
    var functionName = match[1];
    shortFunctionMap[functionName] = true;
    return false;
};

ShortFunction.is = function(functionName) {
    return !!shortFunctionMap[functionName];
};
