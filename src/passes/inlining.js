"use strict";
var inherits = require("../util.js").inherits;
var Pass = require("../pass.js");
function Inlining() {
    this.constructor$();
}
inherits(Inlining, Pass);
module.exports = Inlining;

Inlining.prototype.do = function Inlining$do(line, analysis) {
    return false;
};
