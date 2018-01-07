const profiler = require('screeps-profiler');
var utils = require('creep.utils');

function run(creep) {
    if (creep.memory.building && creep.carry.energy == 0) {
        creep.memory.building = false;
        creep.say('-> harvest');
    }
    if (!creep.memory.building && creep.isFull) {
        creep.memory.building = true;
        creep.say('-> build');
    }

    if (creep.memory.building) {
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity;
            }
        });
        if (targets.length) {
            if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0].pos, {visualizePathStyle: {stroke: '#00ff00'}});
            }
            return;
        }

        var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if (target) {
            if(creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            utils.goToPasture(creep);
        }
    } else {
        if (creep.isFull) {
            creep.memory.building = true;
        } else if (utils.grabDroppedEnergy(creep)) {
        } else if (utils.grabEnergy(creep, {includeSources: false, includeContainers: true})) {
        } else {
            utils.goToPasture(creep);
        }
    }
}

var roleBuilder = {
    run: profiler.registerFN(run, 'runBuilder')
};

module.exports = roleBuilder;
