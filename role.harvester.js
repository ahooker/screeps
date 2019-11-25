const profiler = require('screeps-profiler');

// This class basically harvests from sources and drops that into containers/etc for others to use
// Build-wise it should be optimized for WORK
function run(creep) {
    let containerCount = creep.room.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER) } }).length;

    if (creep.memory.harvesting) {
        if (creep.isFull) {
            creep.memory.harvesting = false;
        } else {
            // Harvesters only touch sources, no picking up dropped stuff or container energy
            if (creep.grabSourceEnergy()) {
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

    targets = creep.room.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER && structure.store.energy < structure.storeCapacity) } });

    if (targets.length === 0) {
        targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                // If there aren't any containers yet, go ahead and keep running energy back to the spawn ourselves
                if (containerCount) {
                    return (structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity;
                } else {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                }
            }
        });
    }
    
    if (targets.length === 0) {
        targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
            }
        });
    }

    if (targets.length > 0) {
        if (targets.length > 1) {
            targets = _.sortBy(targets, s => creep.pos.getRangeTo(s));
        }

        if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            if (!creep.memory.waittime) {
                creep.memory.waittime = 1;
            } else if (creep.memory.waittime++ > 15) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            } else {
                console.log('I am a lazy harvester and will not move to deliver yet', creep.memory.waittime, creep);
            }
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
