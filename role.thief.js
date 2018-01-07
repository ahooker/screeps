var utils = require('creep.utils');

var expansions = utils.expansions();

var roleThief = {
    run: function(creep) {
        /*
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN);
            }
        });
        creep.moveTo(targets[0].pos);
        Game.spawns['Spawn1'].recycleCreep(creep);
        return;
        */

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
            var thieves = _.sortBy(_.filter(Game.creeps, (creep) => { return creep.memory.role == 'thief' && !creep.memory.claimer} ), t => t.ticksToLive);
            var claimers = _.filter(Game.creeps, (creep) => { return creep.memory.role == 'thief' && creep.memory.claimer} );

            var expansion = 0;
            var creepsInExpansion = 0;
            for (var i in thieves) {
                thieves[i].memory.expansion = expansions[expansion];
                creepsInExpansion++;

                // console.log('Thief went into', expansions[expansion]);
                if (creepsInExpansion == 4) {
                    creepsInExpansion = 0;
                    expansion++;
                }
            }

            for (var expansionIndex in expansions) {
                var expansionCovered = false;
                for (var claimerIndex in claimers) {
                    if (claimers[claimerIndex].memory.expansion == expansions[expansionIndex]) {
                        console.log('Expansion', expansions[expansionIndex], 'has a claimer assigned');
                        expansionCovered = true;
                        break;
                    }
                }

                if (!expansionCovered) {
                    console.log('Expansion', expansions[expansionIndex], 'had no claimer assigned!');
                    for (var claimerIndex in claimers) {
                        if (!claimers[claimerIndex].memory.expansion) {
                            claimers[claimerIndex].memory.expansion = expansions[expansionIndex];
                            claimers[claimerIndex].memory.in_position = false;
                            console.log('But now it does!', claimers[claimerIndex].name);
                            break;
                        }
                    }
                }
            }
        }

        if (Game.time % 10 === 0) {
            creep.say(creep.memory.expansion);
        }

        var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            creep.say('DIE!');
            if (creep.attack(closestHostile) === ERR_NOT_IN_RANGE) {
                creep.moveTo(closestHostile, {visualizePathStyle: {stroke: '#ff0000'}});
            }
            return;
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

            if (!creep.memory.path) {
                var path = creep.pos.findPathTo(targetFlag.pos);
                creep.memory.path = Room.serializePath(path);
            }

            // creep.moveByPath(Room.deserializePath(creep.memory.path));
            creep.moveTo(targetFlag.pos);

            if (creep.pos.inRangeTo(targetFlag.pos, 5)) {
                // console.log('I am at the expansion!', creep.memory.expansion);
                delete creep.memory.path;
                creep.memory.mode = 'harvesting';
            }
        } else if (creep.memory.mode == 'harvesting') {
            if (utils.grabDroppedEnergy(creep)) {
                // console.log('grabDroppedEnergy worked');
            } else if (utils.grabEnergy(creep, {includeSources: true, includeContainers: false})) {
                // console.log('grabEnergy worked?');
	        } else {
                // console.log('Carrying:', creep.carry.energy);
                if (creep.carry.energy > 0) {
                    creep.memory.mode = 'returning';
                }
	        }
        } else if (creep.memory.mode == 'returning') {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (object) => { return object.hits < object.hitsMax && creep.pos.inRangeTo(object.pos, 2) && object.hits <= 1000 }
            });

            targets.sort((a,b) => a.hits - b.hits);

            if (targets.length > 0) {
                // console.log('Thief found a repair target:', JSON.stringify(targets));
                if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
                return;
            }

            var constructionSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
            if (constructionSite && creep.pos.inRangeTo(constructionSite, 10)) {
                if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructionSite.pos, {visualizePathStyle: {stroke: '#0000ff'}});
                }
                if (creep.carry.energy === 0) {
                    creep.memory.mode = 'venturing';
                }
                return;
            }

            if (creep.carry.energy === 0) {
                creep.memory.mode = 'venturing';
            }

            var targetFlag = Game.flags['EnergyDrop1'];
            creep.moveTo(targetFlag.pos, {visualizePathStyle: {stroke: '#ffffff'}});

            if (creep.pos.inRangeTo(targetFlag.pos, 2)) {
                // console.log('I am at the drop point!');
                creep.memory.mode = 'dropping';
            }
        } else if (creep.memory.mode == 'dropping') {
            var targets = creep.room.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER && structure.store.energy < structure.storeCapacity) } });
            // console.log('found willing containers:', targets.length);

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
