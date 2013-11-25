"use strict";
var inherits = require("../util.js").inherits;
var FunctionRedefinitionAbuse = require( "../issues/function_redefinition_abuse.js");
var Pass = require("../pass.js");

var functionMap = Object.create(null);

function MultipleFunctionIdentities() {
    this.constructor$();
    this.linePattern = /(?:0[xX])?([a-fA-F0-9]{1,16}) <JS Function ([^ ]*) \(SharedFunctionInfo (?:0[xX])?([a-fA-F0-9]{1,16})\)>/;
}

inherits(MultipleFunctionIdentities, Pass);
module.exports = MultipleFunctionIdentities;

MultipleFunctionIdentities.prototype.consumesInput =
function MultipleFunctionIdentities$consumesInput() {
    return false;
};

MultipleFunctionIdentities.prototype.do = function MultipleFunctionIdentities$do(line, analysis) {
    var match = this.linePattern.exec(line);
    if (!match) {
        return false;
    }
    var functionIdentity = match[1];
    var functionName = match[2];
    var sharedFunctionInfo = match[3];

    //Ignore anonymous functions
    if (!functionName) {
        return false;
    }

    var canonicalFunction = functionMap[sharedFunctionInfo];

    if (!canonicalFunction) {
        canonicalFunction = functionMap[sharedFunctionInfo] =
            new CanonicalFunction(functionName, sharedFunctionInfo);
    }

    canonicalFunction.addIdentity(functionIdentity);

    if (canonicalFunction.isAnIssue()) {
        analysis.addIssue(canonicalFunction.issue());
    }

    return false;
};

function CanonicalFunction(functionName, sharedFunctionInfo) {
    this.functionName = functionName;
    this.sharedFunctionInfo = sharedFunctionInfo;
    this.identities = Object.create(null);
    this._count = 0;
    this._issue = null;
}

CanonicalFunction.prototype.addIdentity =
function CanonicalFunction$addIdentity(identity) {
    if (!this.identities[identity]) {
        this.identities[identity] = true;
        this._count++;
    }
};

CanonicalFunction.prototype.issue = function CanonicalFunction$issue() {
    if (this._issue != null) {
        return this._issue;
    }
    this._issue = new FunctionRedefinitionAbuse(this);
    return this._issue;
};

CanonicalFunction.prototype.isAnIssue = function CanonicalFunction$isAnIssue() {
    return this.count() > 25;
};

CanonicalFunction.prototype.count = function CanonicalFunction$count() {
    return this._count;
};
