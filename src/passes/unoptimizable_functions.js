"use strict";
var inherits = require("../util.js").inherits;
var Pass = require("../pass.js");
var DisabledOptimization = require("../issues/disabled_optimization.js");

function UnoptimizableFunctions() {
    this.constructor$();
    this.linePattern = /^\[disabled optimization for (?:0[xX])?[a-zA-Z0-9]{1,16} <SharedFunctionInfo ?([^>]*)>, reason: ([^\]]+)\]$/;
}
inherits(UnoptimizableFunctions, Pass);
module.exports = UnoptimizableFunctions;

UnoptimizableFunctions.prototype.do = function UnoptimizableFunctions$do(line, analysis) {
    var result = this.linePattern.exec(line);

    if (result == null) {
        return false;
    }
    var functionName = result[1];
    var reason = result[2];
    if (!DisabledOptimization.contains(functionName, reason)) {
        analysis.addIssue(new DisabledOptimization(functionName, reason));
    }
    return true;
};
