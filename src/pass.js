module.exports = Pass;
function Pass() {
    this._waitingLines = false;
}
Pass.prototype.do = function Pass$do() {
    throw new TypeError("not implemented");
};

Pass.prototype.consumesInput = function Pass$consumesInput() {
    return true;
};

Pass.prototype.setWaitLines = function Pass$setWaitLines() {
    this._waitingLines = true;
};

Pass.prototype.unsetWaitLines = function Pass$unsetWaitLines() {
    this._waitingLines = false;
};

Pass.prototype.isWaitingLines = function Pass$needsMoreLines() {
    return this._waitingLines;
};
