"use strict";
var inherits = require("../util.js").inherits;
var Pass = require("../pass.js");
var DisabledOptimization = require("../issues/disabled_optimization.js");

function OptimizationBlocker() {
    this.constructor$();
    this.linePattern = /^\[disabled optimization for [a-zA-Z0-9]{1,16} <SharedFunctionInfo ([^>]*)>, reason: ([^\]]+)\]$/;
}
inherits(OptimizationBlocker, Pass);
module.exports = OptimizationBlocker;

OptimizationBlocker.prototype.do = function OptimizationBlocker$do(line, analysis) {
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
