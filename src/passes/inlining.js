"use strict";
var inherits = require("../util.js").inherits;
var MissedInliningOpportunity = require("../issues/missed_inlining_opportunity.js");
var Pass = require("../pass.js");

function Inlining() {
    this.constructor$();
    this.linePattern = /^Did not inline ([^ ]*) called from ([^ ]*) \(([^\)]+)\)\.$/;
}
inherits(Inlining, Pass);
module.exports = Inlining;

Inlining.prototype.do = function Inlining$do(line, analysis) {
    var match = this.linePattern.exec(line);

    if (!match) {
        return false;
    }

    var calleeName = match[1];
    var callerName = match[2];
    var reason = match[3];
    var issue = MissedInliningOpportunity.add(calleeName, callerName, reason);

    if (issue) {
        analysis.addIssue(issue);
    }
    return true;
};

