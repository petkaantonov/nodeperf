"use strict";
var inherits = require("../util.js").inherits;
var Pass = require("../pass.js");

var ignoreMap = Object.create(null);

function Inlining() {
    this.constructor$();
    this.linePattern = /^Did not inline ([^ ]*) called from ([^ ]*) \(([^\)]+)\)$/;
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

    if (ignoreMap[reason]) {
        return true;
    }

    return true;
};

//Built-ins etc are not inlineable
ignoreMap["target not inlineable"] = true;

//We don't need to hear about big functions not being inlined or such
ignoreMap["target text too big"] = true;
ignoreMap["target AST is too large [late]"] = true;
ignoreMap["target AST is too large [early]"] = true;
ignoreMap["cumulative AST node limit reached"] = true;
ignoreMap["inline depth limit reached"] = true;
