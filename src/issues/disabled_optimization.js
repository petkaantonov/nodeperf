"use strict";
var inherits = require("../util.js").inherits;
var getTypeIndexer = require("../util.js").getTypeIndexer;
var Issue = require("../issue.js");

var ignoreMap = Object.create(null);
var reasonMap = Object.create(null);
var addedFunctions = Object.create(null);

function DisabledOptimization(functionName, reason) {
    this.constructor$();
    this.functionName = functionName;
    this.reason = reason;
    this.addToMap();
}
inherits(DisabledOptimization, Issue);
module.exports = DisabledOptimization;

DisabledOptimization.prototype.addToMap = function DisabledOptimization$addToMap() {
    var functionName = this.functionName;
    var r = addedFunctions[functionName];
    if( !r) {
        addedFunctions[functionName] = [this];
    }
    else {
        r.push(this);
    }
};

DisabledOptimization.prototype.hasReason = function DisabledOptimization$hasReason(reason) {
    return this.reason === reason;
};

DisabledOptimization.prototype.toString = function DisabledOptimization$toString() {
    var mappedReason = reasonMap[this.reason];

    if (!mappedReason) {
        throw new Error("Unimplemented reason " + this.reason + ".");
    }

    return "Function `"+ this.functionName + "` cannot be optimized because "+ mappedReason;
};

DisabledOptimization.prototype.typeIndex = getTypeIndexer();

DisabledOptimization.prototype.weight = function DisabledOptimization$weight() {
    return Issue.Critical;
};

DisabledOptimization.contains = function(functionName, reason) {
    if (ignoreMap[reason]) {
        return true;
    }
    var r = addedFunctions[functionName];
    if (!r) {
        return false;
    }
    for (var i = 0, len = r.length; i < len; ++i) {
        if( r[i].hasReason(reason) ) {
            return true;
        }
    }
    return false;
};



//Scraped from V8 objects.h
ignoreMap["inlined runtime function: FastAsciiArrayJoin"] = true;
ignoreMap["inlined runtime function: ClassOf"] = true;
ignoreMap["call to a JavaScript runtime function"] = true;

reasonMap["arguments object value in a test context"] = "it contains a comparison with the `arguments` object.";
reasonMap["array index constant value too big"] = "array index constant value too big";
reasonMap["assignment to arguments"] = "it contains a re-assignment to `arguments`.";
reasonMap["assignment to let variable before initialization"] = "it contains an assignment to a let variable before initialization.";
reasonMap["assignment to LOOKUP variable"] = "there is an `eval` or `with` used somewhere in upper scope to the function.";
reasonMap["assignment to parameter function uses arguments object"] = "reassigns a formal parameter while also mentioning `arguments` somewhere in its body.";
reasonMap["assignment to parameter in arguments object"] = "assigns a value in the `arguments` object to a formal parameter.";
reasonMap["Attempt to use undefined cache"] = "Attempt to use undefined cache";
reasonMap["bad value context for arguments object value"] = "the `arguments` object escapes the function.";
reasonMap["bad value context for arguments value"] = "the `arguments` object escapes the function.";
reasonMap["context-allocated arguments"] = "the `arguments` object escapes the function.";
reasonMap["DebuggerStatement"] = "it contains a `debugger` statement.";
reasonMap["Declaration in catch context"] = "it contains a function declaration inside a `catch` block.";
reasonMap["Declaration in with context"] = "it contains a function declaration inside a `with` block.";
reasonMap["delete with global variable"] = "it contains a `delete` statement to a global variable.";
reasonMap["delete with non-global variable"] = "it contains a `delete` statement to a non-global variable.";
reasonMap["eval"] = "it contains a call to `eval`.";
reasonMap["ForInStatement is not fast case"] = "it contains a for-in statement that has been passed a normalized object to be iterated over.";
reasonMap["ForInStatement with non-local each variable"] = "it contains a for-in statement where the key variable is not a local variable.";
reasonMap["ForOfStatement"] = "it contains a for-of statement.";
reasonMap["function calls eval"] = "it contains a call to `eval`.";
reasonMap["function with illegal redeclaration"] = "it contains a function with illegal redeclaration.";
reasonMap["Generated code is too large"] = "it is too large.";
reasonMap["function is a generator"] = "it is a generator function.";
reasonMap["generator"] = "it is a generator function.";
reasonMap["non-initializer assignment to const"] = "it contains a non-initializer assignment to const.";
reasonMap["Non-smi value"] = "Non-smi value";
reasonMap["Non-smi index"] = "Non-smi index";
reasonMap["Non-smi key in array literal"] = "an array literal with non-integer key.";
reasonMap["Object literal with complex property"] = "an object literal definition with a `__proto__` key or `set` or `get` syntax.";
reasonMap["optimized too many times"] = "it has been reoptimized too many times.";
reasonMap["possible direct call to eval"] = "it contains a direct call to `eval`";
reasonMap["reference to a variable which requires dynamic lookup"] = "it contains references to dynamically scoped variables.";
reasonMap["reference to global lexical variable"] = "it contains references to global lexical variables";
reasonMap["reference to uninitialized variable"] = "it contains references to uninitialized harmony bindings.";
reasonMap["SwitchStatement: mixed or non-literal switch labels"] = "it contains a switch-statement that has case clauses that are either not integer literals or string literals";
reasonMap["SwitchStatement: too many clauses"] = "it contains a switch-statement with over 128 case clauses.";
reasonMap["too many parameters/locals"] = "it contains too many formal parameters or local variables.";
reasonMap["too many parameters"] = "it contains too many formal parameters.";
reasonMap["Too many spill slots needed for OSR"] = "Too many spill slots needed for OSR";
reasonMap["TryCatchStatement"] = "it contains a try-catch statement.";
reasonMap["TryFinallyStatement"] = "it contains a try-finally statement.";
reasonMap["unsupported const compound assignment"] = "it contains a compound const assignment.";
reasonMap["unsupported count operation with const"] = "it contains a count operation with const.";
reasonMap["unsupported double immediate"] = "unsupported double immediate";
reasonMap["unsupported let compound assignment"] = "it contains a compound let assignment.";
reasonMap["unsupported lookup slot in declaration"] = "unsupported lookup slot in declaration";
reasonMap["Unsupported non-primitive compare"] = "Unsupported non-primitive compare";
reasonMap["Unsupported phi use of arguments"] = "Unsupported phi use of arguments";
reasonMap["Unsupported phi use of const variable"] = "Unsupported phi use of const variable";
reasonMap["unsupported tagged immediate"] = "unsupported tagged immediate";
reasonMap["Variable resolved to with context"] = "a variable that is in a `with`-context.";
reasonMap["WithStatement"] = "it contains a `with`-statement";
reasonMap["Yield"] = "it contains a `yield`-statement";
