"use strict";
var inherits = require("../util.js").inherits;
var Pass = require("../pass.js");

var MAX_MARKING_SPEED = 1000;
var MARKING_SPEED_ACCELERATION = 2;
var INITIAL_MARKING_SPEED = 1;
var MARKING_SPEED_FACTOR = 1.3;
var possibleMarkingSpeeds = Object.create(null);

var markingSpeed = INITIAL_MARKING_SPEED;

while(markingSpeed < MAX_MARKING_SPEED) {
    possibleMarkingSpeeds[markingSpeed] = true;
    markingSpeed += MARKING_SPEED_ACCELERATION;
    markingSpeed = Math.min(MAX_MARKING_SPEED, ((markingSpeed * MARKING_SPEED_FACTOR) | 0));
}

function GcPressure() {
    this.constructor$();
    this.linePattern = /^\[\d+\] (?:Marking speed increased to (\d+)|Increasing marking speed to (\d+) due to high promotion rate)$/;
}
inherits(GcPressure, Pass);
module.exports = GcPressure;

GcPressure.prototype.do = function GcPressure$do(line, analysis) {
    var match = this.linePattern.exec(line);

    if (!match) {
        return false;
    }

    var markingSpeed = match[1] || match[2];

    if (!possibleMarkingSpeeds[markingSpeed]) {
        throw new Error("Unrecognized marking speed: " + markingSpeed);
    }

    return true;
};
