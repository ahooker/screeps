var creepUtils = {
    grabEnergy: function(creep, opts) {
        if (!opts.hasOwnProperty('includeContainers')) {
            opts['includeContainers'] = true;
        }
        if (!opts.hasOwnProperty('includeSources')) {
            opts['includeSources'] = true;
        }
        
        var targets = [];
        if (opts.includeContainers) {
            targets = Game.rooms[creep.room.name].find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER && structure.store.energy > 0) } });
        }
        
        if (targets.length > 0) {
            targets = _.sortBy(targets, s => creep.pos.getRangeTo(s));
            
            if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                Game.spawns['Spawn1'].room.visual.text(
                    'Hungry!',
                    creep.pos.x + 1,
                    creep.pos.y,
                    {align: 'left', opacity: 0.8});
            }
        } else {
            if (opts.includeSources) {
                var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if (source) {
                    if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                        Game.spawns['Spawn1'].room.visual.text(
                            'Hungry!',
                            creep.pos.x + 1,
                            creep.pos.y,
                            {align: 'left', opacity: 0.8});
                    }
                } else {
                        Game.spawns['Spawn1'].room.visual.text(
                            'SO Hungry!',
                            creep.pos.x + 1,
                            creep.pos.y,
                            {align: 'left', opacity: 0.8});
                }
            } else {
                // Nothing to do so move out of the way for now
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER);
                    }
                });
                
                creep.moveTo(Game.flags['CreepPasture'].pos, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
};

module.exports = creepUtils;
