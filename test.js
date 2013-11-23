var count = 100000;

//Disabled optimization
var lol = 1;
function disabled(a) {
    switch(a) {
    case lol: break;
    }
}

var l = count / 20;

while(l--) {
    disabled(1);
}


//Hard deopts
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
doPhase([1,2,3], 1, [,,,4,,7], 15);
doPhase(strict, void 0, nonstrict, void 0);
doPhase(ib, 1, oob, 1);


//Inline stuff
var noInline = (function(){
    var abc;
    return function() {
        return abc;
    };
})();

var noInline2 = function() {
    var a = 5;
    (function(){a})

};

function MissingInlineOpportunities(fn) {
    if (fn === 1) {
        return noInline();
    }
    else if (fn === 2) {
        return noInline2();
    }
}


var l = count / 5;

while(l--) {
    MissingInlineOpportunities(1);
}

var l = count / 5;

while(l--) {
    MissingInlineOpportunities(2);
}

//Function redefinition abuse
function redefinitionAbuse() {
    var a = new ClosureClass();
    a.setAge(5);
    return a.getAge();
}

function ClosureClass() {
    var age = 3;
    this.getAge = function() {
        return age;
    };
    this.setAge = function(_age) {
        age = _age;
    }
}

var l = count / 5;
while(l--) {
    redefinitionAbuse();
}
