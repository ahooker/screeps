var utils = require('creep.utils');

var roleBuilder = {
    run: function(creep) {
        if (creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('-> harvest');
        }
        if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('-> build');
        }

        if (creep.memory.building) {
            var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (target) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                utils.goToPasture(creep);
            }
        } else {
	        if (!utils.grabEnergy(creep, {includeSources: false, includeContainers: true})) {
	            // console.log('Builder could not grabEnergy');
                if (!utils.grabDroppedEnergy(creep)) {
                    // console.log('Builder could not grabDroppedEnergy');

                    if (creep.carry.energy > 0) {
                        creep.memory.building = true;
                    } else {
                        utils.goToPasture(creep);
                    }
                }
	        }
        }
    }
};

module.exports = roleBuilder;
