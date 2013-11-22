var inherits = function( Child, Parent ) {
    var hasProp = {}.hasOwnProperty;
    function T() {
        this.constructor = Child;
        this.constructor$ = Parent;
        for (var propertyName in Parent.prototype) {
            if (hasProp.call( Parent.prototype, propertyName) &&
                propertyName.charAt(propertyName.length-1) !== "$"
            ) {
                this[ propertyName + "$"] = Parent.prototype[propertyName];
            }
        }
    }
    T.prototype = Parent.prototype;
    Child.prototype = new T();
    return Child.prototype;
};
var id = 1;
var getTypeIndexer = function() {
    var ret = id++;
    return function() {
        return ret;
    };
};

exports.inherits = inherits;
exports.getTypeIndexer = getTypeIndexer;
