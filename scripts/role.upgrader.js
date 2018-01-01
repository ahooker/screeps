var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
	    if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('🚧 upgrade');
	    }
	    
	    if(creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else {
            var roomContainers = Game.rooms[creep.room.name].find(FIND_MY_STRUCTURES, { filter: (structure) => { return ((structure.structureType == STRUCTURE_CONTAINER)) } });
            console.log("Containers: "+ roomContainers.length);
            
            /*
	        var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
	        if (source) {
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
	        }
	        */
        }
	}
};

module.exports = roleUpgrader;