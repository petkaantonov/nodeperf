"use strict";
var inherits = require("../util.js").inherits;
var Pass = require("../pass.js");

var optimizationMap = Object.create(null);

function Optimization() {
    this.constructor$();
    this.linePattern = /^\[optimizing [a-fA-F0-9]{1,16} <JS Function ([^ ]*) \(SharedFunctionInfo ([a-fA-F0-9]{1,16})\)> - took ([^\]]+)\]$/;
}
inherits(Optimization, Pass);
module.exports = Optimization;

Optimization.prototype.consumesInput = function Optimization$consumesInput() {
    return false;
};

Optimization.prototype.do = function Optimization$do(line, analysis) {
    var match = this.linePattern.exec(line);
    if (!match) {
        return false;
    }
    var functionOptimization = new FunctionOptimization(match[1], match[2], match[3]);
    Optimization.add(functionOptimization);
    return false;
};

Optimization.stats = function() {
    var keys = Object.keys(optimizationMap);
    var total = 0;
    var totalTime = 0;

    for (var i = 0, len = keys.length; i < len; ++i) {
        var key = keys[i];
        var optimizations = optimizationMap[key];
        total += optimizations.length;
        for( var j = 0, oLen = optimizations.length; j < oLen; ++j ) {
            totalTime += optimizations[j].totalTime();
        }

    }
    return {
        totalTime: totalTime,
        totalOptimizations: total,
        totalUniqueOptimizations: keys.length
    };
};

Optimization.add = function(functionOptimization) {
    var o = optimizationMap[functionOptimization.sharedFunctionInfo];
    if (!o) {
        optimizationMap[functionOptimization.sharedFunctionInfo] =
            [functionOptimization];
    }
    else {
        o.push(functionOptimization);
    }
};

var rtimepattern = /^([0-9.]+), ([0-9.]+), ([0-9.]+) ms$/;
function FunctionOptimization(functionName, sharedFunctionInfo, timePart) {
    this.functionName = functionName;
    this.sharedFunctionInfo = sharedFunctionInfo;
    var match = rtimepattern.exec(timePart);
    this.timeToCreateGraph = parseFloat(match[1]);
    this.timeToOptimize = parseFloat(match[2]);
    this.timeToGenerateCode = parseFloat(match[3]);
}

FunctionOptimization.prototype.totalTime = function FunctionOptimization$totalTime() {
    return this.timeToCreateGraph + this.timeToOptimize + this.timeToGenerateCode;
};
