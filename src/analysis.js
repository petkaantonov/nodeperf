var Issue = require( "./issue.js");
module.exports = Analysis;

function Analysis(passes) {
    this.waitingLines = false;
    //Pass that is being continued because it needs more than one line
    this.continuedPass = null;
    this.passes = passes;
    this.issues = [];
    this.output = "";
    this.issueMap = Object.create(null);
}

Analysis.prototype.getOutput = function Analysis$getOutput() {
    return this.output;
};

Analysis.prototype.print = function Analysis$print() {
    //Eventually move to a consumable JSON format and use this as a default reporter
    console.log("Found %d issues.\n", this.issues.length);
    var issueMap = Issue.map();
    for (var i = 0, len = this.issues.length; i < len; ++i) {
        var issue = this.issues[i];
        issueMap[issue.weight()].push(issue);
    }
    for (var weight in issueMap) {
        var issues = issueMap[weight];
        console.log(weight + " ("+issues.length+"):\n");
        issues.sort(function(a, b) {
            return a.typeIndex() - b.typeIndex();
        });
        for (var i = 0, len = issues.length; i < len; ++i) {
            issues[i].beforeOutput(this);
            console.log("    - " + issues[i] );
        }
        console.log("");
    }
};

Analysis.prototype.addIssue = function Analysis$addIssue(issue) {
    if (this.issueMap[issue.id()]) {
        return;
    }
    this.issueMap[issue.id()] = true;
    this.issues.push(issue);
};

Analysis.prototype.doNonConsumptive = function Analysis$doNonConsumptive(line) {
    for( var i = 0, len = this.passes.length; i < len; ++i ) {
        var pass = this.passes[i];
        if (pass.consumesInput()) {
            break;
        }
        pass.do(line, this);
    }
};

Analysis.prototype.add = function Analysis$add(line) {
    this.output += (line + "\n");
    this.doNonConsumptive(line);
    if (this.waitingLines) {
        this.continuedPass.do(line, this);
        if (!this.continuedPass.isWaitingLines()) {
            this.waitingLines = false;
        }
    }
    else {
        for( var i = 0, len = this.passes.length; i < len; ++i ) {
            var pass = this.passes[i];
            var consumedLine = pass.do(line, this);
            if (pass.isWaitingLines()) {
                this.waitingLines = true;
                this.continuedPass = pass;
                break;
            }
            if (consumedLine) {
                break;
            }
        }
    }
};
