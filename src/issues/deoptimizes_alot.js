"use strict";
var inherits = require("../util.js").inherits;
var getTypeIndexer = require("../util.js").getTypeIndexer;
var Issue = require("../issue.js");

var rishard = /lazy|eager/i;
function isHard(str) {
    return rishard.test(str);
}

var isHardMap = Object.create(null);
var instructionMap = Object.create(null);

function DeoptimizationReason(instructionName, bailoutId) {
    this.instructionName = instructionName;
    this.bailoutId = bailoutId;
}

DeoptimizationReason.prototype.toString = function DeoptimizationReason$toString() {
    var mapped = instructionMap[this.instructionName];

    if (!mapped) {
        throw new Error("unmapped instruction name: " + this.instructionName);
    }

    return "At bailout position " + this.bailoutId +
            " an assumption failed: " + mapped;
};

DeoptimizationReason.equals = function(a, b) {
    if (typeof a === "string" && typeof b === "string") {
        return a === b;
    }
    else if (typeof a === "string") {
        return a === b.bailoutId;
    }
    else if (typeof b === "string") {
        return a.bailoutId === b;
    }
    else {
        return a.instructionName === b.instructionName &&
            a.bailoutId === b.bailoutId;
    }
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
var rinstructioncomment = /^;;; <@\d+,#\d+> ([^\n]+)/;
DeoptimizesAlot.prototype.beforeOutput = function DeoptimizesAlot$beforeOutput(analysis) {
    var output = analysis.getOutput();
    var deopt = this.deopt;
    var search = "kind = OPTIMIZED_FUNCTION\nname = " + deopt.functionName;
    var bailoutIds = deopt.bailoutIds.slice(0);
    var cursor = 0;
    var reasons = [];
    var previousReason = "";

    while(bailoutIds.length > 0) {
        var bailoutId = bailoutIds.shift();
        if (DeoptimizationReason.equals(bailoutId, previousReason)) {
            continue;
        }
        cursor = output.indexOf(search, cursor);
        if (cursor < 0) {
            previousReason = bailoutId;
            reasons.push(bailoutId);
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
                throw new Error("disassembler output doesn't match expectations (couldn't locate instruction comment ;;;)");
            }
            var line = functionCode.slice(cursor, functionCode.indexOf("\n", cursor));
            var match = rinstructioncomment.exec(line);
            if (!match) {
                throw new Error("disassembler output doesn't match expectations (couldn't locate instruction comment)");
            }
            instructionName = match[1];
            cursor--;
        }
        var reason = new DeoptimizationReason(instructionName, bailoutId);
        reasons.push(reason);
        cursor = endCursor;
        previousReason = reason;
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


instructionMap["check-smi"] = "Expected a value to be an integer. (check-smi)";
instructionMap["check-non-smi"] = "Expected a value not to be an integer. (check-non-smi)";
instructionMap["check-maps"] = "Expected an object to have a certain hidden class. (check-maps)";
instructionMap["check-instance-type"] = "Expected a value to be of a certain type (e.g. string but it was an object). (check-instance-type)";
instructionMap["check-value"] = "Expected a value to equal another. (check-value)";
instructionMap["mod-i"] = "Expected integer mod operation not to be passed a 0 dividend or negative zero (mod-i)";
instructionMap["div-i"] = "Expected integer division operation not to be passed a 0 dividend, negative zero, not to overflow signed int32 range or have a non-zero remainder. (div-i)";
instructionMap["math-floor-of-div"] = "Expected Math.floor division not to be passed a 0 dividend, negative zero or not to overflow signed int32 range. (math-floor-of-div)";
instructionMap["mul-i"] = "Expected integer multiplication operation not to overflow 32-bit range or result in a negative zero. (mul-i)";
instructionMap["bit-i"] = "? (bit-i)";
instructionMap["shift-i"] = "Expected left shift not to overflow or right shift to be (???). (shift-i)";
instructionMap["sub-i"] = "Expected integer subtraction not to overflow. (sub-i)";
instructionMap["add-i"] = "Expected integer addition not to overflow. (add-i)";
instructionMap["date-field"] = "Expected a Date object. (date-field)";
instructionMap["branch"] = "Unexpected integer in a conditional test. (branch)";
instructionMap["load-global-cell"] = "Expected a global variable reference not to reference deleted global object properties. (load-global-cell)";
instructionMap["store-global-cell"] = "Expected a global variable assignment not to reference deleted global object properties. (store-global-cell)";
instructionMap["load-context-slot"] = "Expected a const/let reference not to be to an uninitialized harmony binding. (load-context-slot)";
instructionMap["store-context-slot"] = "Expected a const/let assignment not to be to an uninitialized harmony binding. (store-context-slot)";
instructionMap["load-function-prototype"] = "Expected a value to be a function with a .prototype object. (load-function-prototype)";
instructionMap["load-keyed-external-array"] = "Expected Uint32 array not to contain large integers. (load-keyed-external-array)";
instructionMap["load-keyed-fixed-double-array"] = "Expected array access not to be to an non-existent index. (e.g. holes sparse arrays) (load-keyed-fixed-double-array)";
instructionMap["load-keyed-fixed-array"] = "Expected array access not to be to an non-existent index. (e.g. holes sparse arrays) (load-keyed-fixed-array)";
instructionMap["wrap-receiver"] = "Expected non-strict function not to be called with a primitive `this` value. (wrap-receiver)";
instructionMap["array-method"] = "Expected an array method to be a function. (array-method)";
instructionMap["apply-arguments"] = "Expected the size of an array passed to `Function.prototype.apply` to be less than 1024. (apply-arguments)";
instructionMap["math-abs"] = "(math-abs)";
instructionMap["math-floor"] = "Expected Math.floor not to result in a negative zero or overflow integer range. (math-floor)";
instructionMap["math-round"] = "Expected Math.round not to result in a negative zero or overflow integer range. (math-round)";
instructionMap["math-power"] = "Expected exponent passed to Math.power to be either an integer or a double. (math-power)";
instructionMap["store-named-field"] = " Expected a certain object field to have a single type. (store-named-field)";
instructionMap["bounds-check"] = "Expected numeric property access not to be made out of bounds. (bounds-check)";
instructionMap["int32-to-smi"] = "Expected conversion to an integer not to overflow. (int32-to-smi)";
instructionMap["smi-untag"] = "Expected object to be an integer. (smi-untag)";
instructionMap["double-to-i"] = "Expected conversion from double to integer to succeed. (double-to-i)";
instructionMap["double-to-smi"] = "Expected conversion from double to integer to succeed. (double-to-smi)";
instructionMap["clamp-t-to-uint8"] = "Expected an integer, double or undefined when clamping to uint8. (clamp-t-to-uint8)";
instructionMap["clamp-t-to-uint8-nosse2"] = "Expected an integer, double or undefined when clamping to uint8. (clamp-t-to-uint8-nosse2)";
instructionMap["for-in-prepare-map"] = "Expected an object to be passed for enumeration in a for-in statement but got a primitive instead. (for-in-prepare-map)";
instructionMap["for-in-cache-array"] = "Expected the property cache array used in a for-in statement not to be empty. (for-in-cache-array)";
instructionMap["check-map-value"] = "Expected object to have a certain hidden class. (check-map-value)";
instructionMap["-------------------- Deferred tagged-to-i --------------------"] = "Expected to be able to convert an object to an integer. (deferred tagged-to-i)";
