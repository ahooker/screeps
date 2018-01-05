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
                        creep.moveTo(source, {visualizePathStyle: {stroke: '#ff0000'}});
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
                    var targets = [Game.flags['CreepPasture'].pos, Game.flags['CreepPasture2'].pos];
                    targets = _.sortBy(targets, s => creep.pos.getRangeTo(s));
                    creep.moveTo(Game.flags['CreepPasture'].pos, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                // Nothing to do so move out of the way for now
                var targets = [Game.flags['CreepPasture'].pos, Game.flags['CreepPasture2'].pos];
                targets = _.sortBy(targets, s => creep.pos.getRangeTo(s));
                creep.moveTo(Game.flags['CreepPasture'].pos, {visualizePathStyle: {stroke: '#ffffff'}});
                return false;
            }
        }
        
        return true;
    },
    getCreepBodyParts: function(role, maxEnergy) {
        console.log('maxEnergy:', maxEnergy);
        
        /*
        console.log('BPC:');
        for (var i in BODYPART_COST) {
            console.log(i, ':', BODYPART_COST[i]);
        }
        */
    
        var parts = [WORK, WORK];
        maxEnergy -= 200;
        
        // 600+? extra work..
        if (maxEnergy > 400) {
            parts.push(WORK);
            maxEnergy -= 100;
        }

        while (maxEnergy > 100) {
            parts.push(MOVE);
            parts.push(CARRY);
            maxEnergy -= 100;
        }
        while (maxEnergy > 50) {
            parts.push(MOVE);
            maxEnergy -= 50;
        }
        console.log('parts:', parts);
        return parts;
        
        
        switch (role) {
            case 'upgrader':
                break;
            case 'builder':
                break;
            case 'harvester':
            default:
                break;
        }
        
        return parts;
    }
};

module.exports = creepUtils;
