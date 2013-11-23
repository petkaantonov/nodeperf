var spawn = require("child_process").spawn;
var Path = require("path");
var passesPath = Path.join(__dirname, "passes");
var passes = require("fs").readdirSync(passesPath).map(function(fileName) {
    return new (require("./passes/" + fileName));
}).sort(function(a, b){
        return a.consumesInput() - b.consumesInput();
});
var Analysis = require("./analysis.js");
var through = require("through");
var split = require("split");

var flags = [
    "--trace_inlining",
    "--trace_opt",
    "--trace_deopt",
    "--print_opt_code",
    "--code_comments",
    //"--trace_normalization",
    "--trace_generalization",
    "--trace_gc",
    "--trace_array_abuse"
];

var args = process.argv.slice(1);

var newArgs = flags.concat(args);

var i = newArgs.indexOf(__filename);

if(i > -1) {
    newArgs.splice(i, 1);
}

var p = spawn(process.execPath, newArgs);

var analysis = new Analysis(passes);
p.stderr.pipe(process.stderr);
p.stdout.pipe(split()).pipe(through(function(line) {
    analysis.addLine(line);
}));

p.stdout.on("close", function() {
    analysis.print();
});
