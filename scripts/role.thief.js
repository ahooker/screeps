var utils = require('creep.utils');

var roleThief = {
    run: function(creep) {
        if (typeof creep.memory.claimer === 'undefined') {
            var claimer = false;
            for (var i in creep.body) {
                if (creep.body[i].type == CLAIM) {
                    claimer = true;
                    break;
                }
            }
            creep.memory.claimer = claimer;
        }
        
        if (creep.memory.claimer) {
            var controller = Game.getObjectById('59bbc5462052a716c3ce93a5');
            if (creep.reserveController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, {visualizePathStyle: {stroke: '#00ff00'}});
            }
            return;
        }

        if (creep.memory.mode == 'venturing') {
            var targetFlag = Game.flags['Expansion1'];
            creep.moveTo(targetFlag.pos, {visualizePathStyle: {stroke: '#ffffff'}});
            
            if (creep.pos.inRangeTo(targetFlag.pos, 5)) {
                // console.log('I am at the expansion!');
                creep.memory.mode = 'harvesting';
            }
        } else if (creep.memory.mode == 'harvesting') {
            if (utils.grabDroppedEnergy(creep)) {
                console.log('grabDroppedEnergy worked');
            } else if (utils.grabEnergy(creep, {includeSources: true, includeContainers: false})) {
                console.log('grabEnergy worked?');
	        } else {
                console.log('Carrying:', creep.carry.energy);
                if (creep.carry.energy > 0) {
                    creep.memory.mode = 'returning';
                }
	        }
        } else if (creep.memory.mode == 'returning') {
            var targetFlag = Game.flags['EnergyDrop1'];
            creep.moveTo(targetFlag.pos, {visualizePathStyle: {stroke: '#ffffff'}});
            
            if (creep.pos.isEqualTo(targetFlag.pos)) {
                // console.log('I am at the drop point!');
                creep.memory.mode = 'dropping';
            }
        } else if (creep.memory.mode == 'dropping') {
            var targets = creep.room.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER && structure.store.energy < structure.energyCapacity) } });
            console.log('found willing containers:', targets.length);
            
            if (targets.length > 0) {
                if (targets.length > 1) {
                    targets = _.sortBy(targets, s => creep.pos.getRangeTo(s));
                }
                
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
                if (creep.carry.energy > 0) {
                    creep.drop(RESOURCE_ENERGY);
                    creep.memory.mode = 'venturing';
                }
            } else {
                creep.drop(RESOURCE_ENERGY);
                creep.memory.mode = 'venturing';
            }
        } else {
            creep.memory.mode = 'venturing';
        }
        
	}
};

module.exports = roleThief;
