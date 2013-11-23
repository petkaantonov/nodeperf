"use strict";
var inherits = require("../util.js").inherits;
var getTypeIndexer = require("../util.js").getTypeIndexer;
var Issue = require("../issue.js");

function FunctionRedefinitionAbuse(canonicalFunction) {
    this.constructor$();
    this.canonicalFunction = canonicalFunction;
}
inherits(FunctionRedefinitionAbuse, Issue);
module.exports = FunctionRedefinitionAbuse;

FunctionRedefinitionAbuse.prototype.typeIndex = getTypeIndexer();

//TODO when gc stuff is added add interaction with GC pressure
FunctionRedefinitionAbuse.prototype.weight =
function FunctionRedefinitionAbuse$weight() {
    return Issue.High;
};

FunctionRedefinitionAbuse.prototype.toString =
function FunctionRedefinitionAbuse$toString() {
    var count = this.canonicalFunction.count();
    var functionName = this.canonicalFunction.functionName;
    var ret = "The function `"+functionName+"` was re-defined at least "  + count + " times.";
    return ret;
};
