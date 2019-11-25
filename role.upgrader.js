const profiler = require('screeps-profiler');
var utils = require('creep.utils');

function run(creep) {
    if (creep.memory.upgrading && creep.carry.energy == 0) {
        creep.memory.upgrading = false;
        creep.say('-> harvest');
    }
    if (!creep.memory.upgrading && creep.isFull) {
        creep.memory.upgrading = true;
        creep.say('-> upgrade');
    }

    if (creep.memory.upgrading) {
        // creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffaa00'}});
        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    } else if (creep.grabDroppedEnergy()) {
    } else if (creep.grabContainerEnergy()) {
    } else {
        creep.memory.upgrading = true;
    }
}

var roleUpgrader = {
    run: profiler.registerFN(run, 'runUpgrader')
};
module.exports = roleUpgrader;
