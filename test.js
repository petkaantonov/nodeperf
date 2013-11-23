var count = 100000;
var phase = 1;


function doPhase(a1, a2, a3, a4) {
    var l = count;
    while(l--) {
        THISISTHEFUNCTION(a1, a2);
    }
    THISISTHEFUNCTION(a3, a4);
    phase++;
}

function strict() {
    "use-strict";
    return this + 5;
}
function nonstrict() {
    return this + 5;
}

function ib() {
    return arguments[0];
}
function oob() {
    return arguments[1];
}

function THISISTHEFUNCTION(o, b) {
    if (phase === 1) {
        return o.prototype;
    }
    else if(phase === 2) {
        return o / b;
    }
    else if(phase === 3) {
        return o[b];
    }
    else if(phase === 4) {
        o.call(5);
    }
    else if(phase === 5) {
        o(b);
    }

}

doPhase(THISISTHEFUNCTION, void 0, 3, void 0);
doPhase(1, 1, 1, 0);
doPhase([1,2,3], 1, [,,,4,,7], 1);
doPhase(strict, void 0, nonstrict, void 0);
doPhase(ib, 1, oob, 1);
