var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.carry.energy < creep.carryCapacity) {
	        creep.say('Hungry!');
	        var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
	        if (source) {
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
	        }
        }
        else {
            var targets = [];
            var roomContainers = Game.rooms[creep.room.name].find(FIND_STRUCTURES, { filter: (structure) => { return ((structure.structureType == STRUCTURE_CONTAINER)) } });
            if (roomContainers.length > 0) {
                targets = roomContainers;
                creep.say('what?' + targets.length);
            } else {
                targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION ||
                                    structure.structureType == STRUCTURE_SPAWN ||
                                    structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                        }
                });
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