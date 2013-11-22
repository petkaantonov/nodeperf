"use strict";
var inherits = require("../util.js").inherits;
var getTypeIndexer = require("../util.js").getTypeIndexer;
var Issue = require("../issue.js");

var rishard = /lazy|eager/i;
function isHard(str) {
    return rishard.test(str);
}

var isHardMap = Object.create(null);
var crankshaftMap = Object.create(null);

function DeoptimizationReason(crankshaftInstructionName, bailoutId) {
    this.crankshaftInstructionName = crankshaftInstructionName;
    this.bailoutId = bailoutId;
}

DeoptimizationReason.prototype.toString = function DeoptimizationReason$toString() {
    var mapped = crankshaftMap[this.crankshaftInstructionName];

    if (!mapped) {
        throw new Error("unmapped crankshaft instruction name: " + this.crankshaftInstructionName);
    }

    return "An assumption failed: " + mapped + " At bailout position " + this.bailoutId;
};

function DeoptimizesAlot(deopt) {
    this.constructor$();
    this.deopt = deopt;
    this.reasons = [];
}
inherits(DeoptimizesAlot, Issue);
module.exports = DeoptimizesAlot;

DeoptimizesAlot.prototype.typeIndex = function DeoptimizesAlot$typeIndex() {
    return this.deopt.typeIndex();
};

DeoptimizesAlot.prototype.weight = function DeoptimizesAlot$weight() {
    if (this.deopt.count() > 8) {
        return Issue.Critical;
    }
    return Issue.High;
};

var jumps =
    "(?:jo|jno|js|jns|je|jz|jne|jnz|jb|jnae|jc|jnb|jae|jnc|jbe" +
    "|jna|ja|jnbe|jl|jnge|jge|jnl|jle|jng|jg|jnle|jp|jpe|jnp|" +
    "jpo|jcxz|jecxz)";

var rinstructionpos = /^[a-fA-F0-9]{1,16}\s*(\d+)/;
var rCrankshaftInstructionComment = /^;;; <@\d+,#\d+> ([^\n]+)/;
DeoptimizesAlot.prototype.beforeOutput = function DeoptimizesAlot$beforeOutput(analysis) {
    var output = analysis.getOutput();
    var deopt = this.deopt;
    var search = "kind = OPTIMIZED_FUNCTION\nname = " + deopt.functionName;
    var bailoutIds = deopt.bailoutIds.slice(0);
    var cursor = 0;
    var reasons = [];
    var previousBailoutId = "";

    while(bailoutIds.length > 0) {
        var bailoutId = bailoutIds.shift();
        cursor = output.indexOf(search, cursor);
        if (cursor < 0) {
            if (bailoutId !== previousBailoutId) {
                reasons.push(bailoutId);
            }
            previousBailoutId = bailoutId;
            continue;
        }
        var codePos = cursor;
        cursor = output.indexOf(";;; -------------------- Jump table", cursor);

        if(cursor < 0) {
            throw new Error("disassembler output doesn't match expectations (Jump table not found");
        }

        var lineBefore = "deoptimization bailout " + bailoutId + ".\n";
        var lineAfter = ";; deoptimization bailout " + bailoutId;
        cursor = output.indexOf(lineBefore, cursor);
        if(cursor < 0) {
            throw new Error("disassembler output doesn't match expectations (Deoptimization bailout comments not found)");
        }
        cursor += lineBefore.length;

        var functionCode = output.slice(codePos, cursor);
        if (cursor < codePos) {
            console.log(cursor, codePos);
            throw new Error("disassembler output doesn't match expectations (Deopt bailout comments found before code start)");
        }
        var endCursor = output.indexOf(lineAfter, cursor);
        var line = output.slice(cursor, endCursor);
        var matches = rinstructionpos.exec(line);

        if (!matches) {
            throw new Error("disassembler output doesn't match expectations");
        }
        var instructionPosition = matches[1];
        var rjump = new RegExp(jumps + " " + instructionPosition, "i");

        var jumpPos = functionCode.search(rjump);

        if (jumpPos < 0) {
            throw new Error("disassembler output doesn't match expectations (couldn't find jump instruction)");
        }
        var instructionName = "gap";
        cursor = jumpPos;
        while(instructionName === "gap") {
            cursor = functionCode.lastIndexOf(";;;", cursor);
            if (cursor < 0) {
                throw new Error("disassembler output doesn't match expectations (couldn't locate crankshaft instruction comment ;;;)");
            }
            var line = functionCode.slice(cursor, functionCode.indexOf("\n", cursor));
            var match = rCrankshaftInstructionComment.exec(line);
            if (!match) {
                throw new Error("disassembler output doesn't match expectations (couldn't locate crankshaft instruction comment)");
            }
            instructionName = match[1];
            cursor--;
        }
        reasons.push(new DeoptimizationReason(instructionName, bailoutId));
        cursor = endCursor;
        previousBailoutId = bailoutId;
    }
    this.reasons = reasons;
};

DeoptimizesAlot.prototype.toString = function DeoptimizesAlot$toString() {
    var functionName = this.deopt.functionName;
    var bailoutPositions = this.deopt.bailoutIds.join(", ");
    var ret = "Function `" + functionName + "` was hard deoptimized " +
                this.deopt.count() + " times:\n";

    for( var i = 0, len = this.reasons.length; i < len; ++i ) {
        var out = "        " + (i + 1) +". ";
        var reason = this.reasons[i];
        if(reason instanceof DeoptimizationReason) {
            out += (reason + "") + "\n";
        }
        else {
            out += "(Could not find code in disassembly, bailout position: " + reason + ")\n";
        }
        ret += out;
    }

    return ret;

};

function HardBailoutDeoptimization(functionName) {
    this.issue = new DeoptimizesAlot(this);
    this.bailoutIds = [];
    this.functionName = functionName;
}

HardBailoutDeoptimization.prototype.typeIndex = getTypeIndexer();

HardBailoutDeoptimization.prototype.increment =
function HardBailoutDeoptimization$increment(bailoutId) {
    this.bailoutIds.push(bailoutId);
};

HardBailoutDeoptimization.prototype.count =
function HardBailoutDeoptimization$count() {
    return this.bailoutIds.length;
};

HardBailoutDeoptimization.prototype.isAnIssue =
function HardBailoutDeoptimization$isAnIssue() {
    return this.count() > 2;
};

HardBailoutDeoptimization.prototype.getIssue =
function HardBailoutDeoptimization$getIssue() {
    return this.issue;
};

DeoptimizesAlot.register =
function(functionAddresss, functionName, bailoutType, bailoutId) {
    if (functionName) {
        if (isHard(bailoutType)) {
            var deopt = isHardMap[functionName];
            if (!deopt) {
                deopt = isHardMap[functionName]
                    = new HardBailoutDeoptimization(functionName);
            }

            deopt.increment(bailoutId);
            if (deopt.isAnIssue()) {
                return deopt.getIssue();
            }
        }
    }
};


crankshaftMap["check-smi"] = "Expected a value to be an integer but it wasn't (check-smi).";
