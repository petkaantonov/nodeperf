"use strict";
var inherits = require("../util.js").inherits;
var Pass = require("../pass.js");
var DeoptimizesAlot = require("../issues/deoptimizes_alot.js");

function Deoptimization() {
    this.constructor$();
    this.beginPattern = /^\[deoptimizing \(([^\)]*)\): begin 0[xX]([a-fA-F0-9]{1,16}) ([^ ]*) @(\d+)[^\]]+\]$/;
    this.endPattern = /^\[deoptimizing \((?:[^\)]*)\): end/;
}
inherits(Deoptimization, Pass);
module.exports = Deoptimization;

Deoptimization.prototype.continuePrevious = function Deoptimization$continuePrevious(line, analysis) {
    if (this.endPattern.test(line)) {
        this.unsetWaitLines();
    }
    return true;
};

Deoptimization.prototype.do = function Deoptimization$do(line, analysis) {
    if (this.isWaitingLines()) {
        return this.continuePrevious(line, analysis);
    }
    var result = this.beginPattern.exec(line);
    if (result == null) {
        return false;
    }
    this.setWaitLines();

    var functionAddress = result[2].toLowerCase();
    var functionName = result[3];
    var bailoutType = result[1];
    var bailoutId = result[4];

    var issue = DeoptimizesAlot.register(functionAddress,
                                        functionName, bailoutType, bailoutId);

    if (issue) {
        analysis.addIssue(issue);
    }
    return true;
};
