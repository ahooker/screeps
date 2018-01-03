var utils = require('creep.utils');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.carry.energy < creep.carryCapacity) {
	        utils.grabEnergy(creep, {includeContainers: false});
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
            });
            
            if (targets.length == 0) {
                var roomContainers = Game.rooms[creep.room.name].find(FIND_STRUCTURES, { filter: (structure) => { return ((structure.structureType == STRUCTURE_CONTAINER)) } });
                if (roomContainers.length > 0) {
                    targets = roomContainers;
                }
            }

            if(targets.length > 0) {
                targets = _.sortBy(targets, s => creep.pos.getRangeTo(s));
                
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	}
};

module.exports = roleHarvester;