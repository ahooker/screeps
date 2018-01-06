var utils = require('creep.utils');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.harvesting) {
            if (creep.carry.energy === creep.carryCapacity) {
                creep.memory.harvesting = false;
            } else {
                if (utils.grabDroppedEnergy(creep)) {
                    return;
    	        } else if (utils.grabEnergy(creep, {includeSources: true, includeContainers: false})) {
    	            return;
    	        } else if (utils.grabEnergy(creep, {includeSources: false, includeContainers: true})) {
    	            return;
    	        } else {
                    creep.memory.harvesting = false;
    	        }
            }
        }
        
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
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
            utils.goToPasture(creep);
            creep.memory.harvesting = true;
        }
    }
};

module.exports = roleHarvester;