var utils = require('creep.utils');

var expansions = utils.expansions();

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
        
        if (typeof creep.memory.expansion === 'undefined') {
            // I want 10
            var thievesWanted = utils.howManyCreeps('thief');
            
            // I have 5
            var thieves = _.sortBy(_.filter(Game.creeps, (creep) => creep.memory.role == 'thief'), t => t.ticksToLive);
            
            var expansion = 0;
            var creepsInExpansion = 0;
            console.log('I have', thieves.length, 'and I want', thievesWanted);
            for (var i in thieves) {
                thieves[i].memory.expansion = expansions[expansion];
                creepsInExpansion++;
                
                console.log('Thief went into', expansions[expansion]);
                if (creepsInExpansion == 5) {
                    creepsInExpansion = 0;
                    expansion++;
                }
            }
        }
        
        if (creep.memory.claimer) {
            if (creep.memory.in_position) {
                var controller = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_CONTROLLER) } });
                // var controller = Game.getObjectById('59bbc5462052a716c3ce93a5');
                if (creep.reserveController(controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller, {visualizePathStyle: {stroke: '#00ff00'}});
                }
            } else {
                var targetFlag = Game.flags[creep.memory.expansion];
                creep.moveTo(targetFlag.pos, {visualizePathStyle: {stroke: '#ffffff'}});
                
                if (creep.pos.inRangeTo(targetFlag.pos, 5)) {
                    // console.log('I am at the expansion!', creep.memory.expansion);
                    creep.memory.in_position = true;
                }
            }
            return;
        }

        if (creep.memory.mode == 'venturing') {
            // console.log('Looking for the flag:', creep.memory.expansion);
            var targetFlag = Game.flags[creep.memory.expansion];
            creep.moveTo(targetFlag.pos, {visualizePathStyle: {stroke: '#ffffff'}});
            
            if (creep.pos.inRangeTo(targetFlag.pos, 5)) {
                // console.log('I am at the expansion!', creep.memory.expansion);
                creep.memory.mode = 'harvesting';
            }
        } else if (creep.memory.mode == 'harvesting') {
            if (utils.grabDroppedEnergy(creep)) {
                // console.log('grabDroppedEnergy worked');
            } else if (utils.grabEnergy(creep, {includeSources: true, includeContainers: false})) {
                // console.log('grabEnergy worked?');
	        } else {
                console.log('Carrying:', creep.carry.energy);
                if (creep.carry.energy > 0) {
                    creep.memory.mode = 'returning';
                }
	        }
        } else if (creep.memory.mode == 'returning') {
            var targetFlag = Game.flags['EnergyDrop1'];
            creep.moveTo(targetFlag.pos, {visualizePathStyle: {stroke: '#ffffff'}});
            
            if (creep.pos.inRangeTo(targetFlag.pos, 2)) {
                // console.log('I am at the drop point!');
                creep.memory.mode = 'dropping';
            }
        } else if (creep.memory.mode == 'dropping') {
            var targets = creep.room.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER && structure.store.energy < structure.storeCapacity) } });
            console.log('found willing containers:', targets.length);
            
            if (targets.length > 0) {
                if (targets.length > 1) {
                    targets = _.sortBy(targets, s => creep.pos.getRangeTo(s));
                }
                
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
                
                if (creep.carry.energy === 0) {
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