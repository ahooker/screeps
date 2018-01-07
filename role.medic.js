const profiler = require('screeps-profiler');
var utils = require('creep.utils');

function run(creep) {
    creep.memory.role = 'builder';
}

var roleMedic = {
    run: profiler.registerFN(run, 'runUpgrader')
};
module.exports = roleMedic;
