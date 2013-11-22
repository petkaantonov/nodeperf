module.exports = Issue;
var id = 0;

function Issue() {
    this._id = id++;
}

var Low = Issue.Low = "Low";
var Medium = Issue.Medium = "Medium";
var High = Issue.High = "High";
var Critical = Issue.Critical = "Critical";

Issue.map = function() {
    var ret = Object.create(null);
    ret[Critical] = [];
    ret[High] = [];
    ret[Medium] = [];
    ret[Low] = [];
    return ret;
};

Issue.prototype.id = function Issue$id() {
    return this._id;
};

Issue.prototype.beforeOutput = function Issue$beforeOutput() {

};

Issue.prototype.weight = function Issue$weight() {
    return Issue.Low;
};

Issue.prototype.typeIndex = function Issue$typeIndex() {
    return 0;
};
