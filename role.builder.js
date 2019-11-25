const profiler = require('screeps-profiler');

function run(creep) {
    if (creep.memory.building && creep.carry.energy == 0) {
        creep.memory.building = false;
        // creep.say('-> harvest');
    }
    if (!creep.memory.building && creep.isFull) {
        creep.memory.building = true;
        creep.say('-> build');
    }

    // Building means we're on a full energy load (or remainder of one)
    if (creep.memory.building) {
        var target, targets;

        // First off, check for any repairable structures in range and go deal with those
        targets = creep.room.find(FIND_STRUCTURES, {
            filter: (object) => { return object.hits < 5000 && object.hits < object.hitsMax && creep.pos.inRangeTo(object.pos, 2) }
        });
    
        targets.sort((a,b) => a.hits - b.hits);
    
        if (targets.length > 0) {
            // console.log('Builder found a repair target:', JSON.stringify(targets));
            if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }
            return;
        }
    
        // Prioritize delivering energy to spawn & extensions
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity;
            }
        });
        
        if (target) {
            if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target.pos, {visualizePathStyle: {stroke: '#00ff00'}});
            }
            return;
        }



        // Then prioritize building any extensions
        target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION)
            }
        });

        // Then any containers
        if (!target) {
            target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER)
                }
            });
        }
        if (target) {
            if (creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            return;
        }

        // Now, top up any towers
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
            }
        });
        
        if (target) {
            if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target.pos, {visualizePathStyle: {stroke: '#00ff00'}});
            }
            return;
        }

        // After that, any other construction sites go
        target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if (target) {
            if(creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            creep.goToPasture();
        }
    } else { // if creep.memory.building
        if (creep.isFull) {
            creep.memory.building = true;
        } else if (creep.grabDroppedEnergy()) {
        } else if (creep.grabContainerEnergy()) {
        // } else if (creep.grabSourceEnergy()) {
        } else {
            creep.goToPasture();
        }
    }
}

var roleBuilder = {
    run: profiler.registerFN(run, 'runBuilder')
};

module.exports = roleBuilder;
