var creepUtils = {
    grabEnergy: function(creep, opts) {
        if (!opts.hasOwnProperty('includeContainers')) {
            opts['includeContainers'] = true;
        }
        
        creep.say('Hungry!');
        
        var targets = [];
        if (opts.includeContainers) {
            console.log('Lkg 4 containers');
            targets = Game.rooms[creep.room.name].find(FIND_STRUCTURES, { filter: (structure) => { return ((structure.structureType == STRUCTURE_CONTAINER)) } });
            targets = [];
        }
        
        if (targets.length > 0) {
            targets = _.sortBy(targets, s => creep.pos.getRangeTo(s));
            
            console.log('Fazz:', targets[0]);

            if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else {
            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source) {
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
    }
};

module.exports = creepUtils;
