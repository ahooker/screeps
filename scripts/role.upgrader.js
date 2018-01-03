var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('-> harvest');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('-> upgrade');
	    }

	    if(creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else {
            // var targets = Game.rooms[creep.room.name].find(FIND_STRUCTURES, { filter: (structure) => { return ((structure.structureType == STRUCTURE_CONTAINER)) } });
            // if (targets.length > 0) {
            //     targets = _.sortBy(targets, s => creep.pos.getRangeTo(s));

            //     if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //         creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            //     }
            // } else {
    	        var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    	        if (source) {
    	            creep.say('Hungry!');
                    if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
    	        } else {
    	            creep.say('SO HNGRY');
    	        }
            //}
        }
	}
};

module.exports = roleUpgrader;
