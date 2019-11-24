const profiler = require('screeps-profiler');

function run(creep) {
    if (creep.memory.harvesting) {
        if (creep.isFull) {
            creep.memory.harvesting = false;
        } else {
            if (creep.grabDroppedEnergy()) {
                return;
            } else if (creep.grabSourceEnergy()) {
                return;
            } else if (creep.grabContainerEnergy()) {
                return;
            } else {
                creep.memory.harvesting = false;
            }
        }
    }

    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var targets = [];

    /*
    if (builders.length === 0) {
        targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
            }
        });
    } else {
        targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity;
            }
        });
    }
    */

    targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
        }
    });
    
    if (targets.length === 0) {
        targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
            }
        });
    }
    if (targets.length === 0) {
        targets = creep.room.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER && structure.store.energy < structure.storeCapacity) } });
    }

    if (targets.length > 0) {
        if (targets.length > 1) {
            targets = _.sortBy(targets, s => creep.pos.getRangeTo(s));
        }

        if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
        } else {
            if (creep.carry.energy < 50) {
                creep.memory.harvesting = true;
            }
        }
    } else {
        // Nothing to do so move out of the way for now
        creep.goToPasture();
        creep.memory.harvesting = true;
    }

    if (creep.carry.energy < 50) {
        creep.memory.harvesting = true;
    }
}

var roleHarvester = {
    run: profiler.registerFN(run, 'runHarvester')
};

module.exports = roleHarvester;
