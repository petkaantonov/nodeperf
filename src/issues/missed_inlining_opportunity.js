"use strict";
var inherits = require("../util.js").inherits;
var getTypeIndexer = require("../util.js").getTypeIndexer;
var ShortFunction = require("../passes/short_function.js");
var Issue = require("../issue.js");

var ignoreMap = Object.create(null);
var reasonMap = Object.create(null);
var inliningMap = Object.create(null);

function MissedInliningOpportunity(calleeName, callerName, reason) {
    this.constructor$();
    this.calleeName = calleeName || "[anonymous]";
    this.callerName = callerName || "[anonymous]";
    this.reason = reason;
}
inherits(MissedInliningOpportunity, Issue);
module.exports = MissedInliningOpportunity;

MissedInliningOpportunity.prototype.typeIndex = getTypeIndexer();

MissedInliningOpportunity.prototype.isShortCallee =
function MissedInliningOpportunity$isShortCallee() {
    return ShortFunction.is(this.calleeName);
};

MissedInliningOpportunity.prototype.weight =
function MissedInliningOpportunity$weight() {
    return this.isShortCallee()
        ? Issue.High
        : Issue.Medium;
};


MissedInliningOpportunity.prototype.toString = function MissedInliningOpportunity$toString() {
    var mapped = reasonMap[this.reason];

    if (!mapped) {
        throw new Error("unimplemented reason for not inlining "+ this.reason);
    }
    var maybeSmall = this.isShortCallee() ? "small " : "";
    var ret = "The " + maybeSmall + "function `" +this.calleeName + "` when called from the function `"+
                this.callerName +"` cannot be inlined because " + mapped;

    return ret;
};

MissedInliningOpportunity.add = function(calleeName, callerName, reason) {
    if (ignoreMap[reason]) {
        return;
    }
    var key = calleeName + callerName + reason;
    if (inliningMap[key]) {
        return;
    }
    var issue = new MissedInliningOpportunity(calleeName, callerName, reason);
    inliningMap[key] = issue;
    return issue;
};

reasonMap["target requires context change"] = "they do not share the same scope.";
reasonMap["target is recursive"] = "calling the former will result in recursion.";
reasonMap["target has context-allocated variables"] = "the former creates closures.";
reasonMap["target uses non-stackallocated arguments object"] = "the former function's `arguments` object escapes.";
reasonMap["target has non-trivial declaration"] = "I don't know what this means.";

//Built-ins, unoptimizable functions etc are not inlineable
ignoreMap["target not inlineable"] = true;

//Big functions not being inlined or too much inlining happening
//are not considered missed opprtunities
ignoreMap["target text too big"] = true;
ignoreMap["target AST is too large [late]"] = true;
ignoreMap["target AST is too large [early]"] = true;
ignoreMap["cumulative AST node limit reached"] = true;
ignoreMap["inline depth limit reached"] = true;
