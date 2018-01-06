var creepUtils = {
    grabEnergy: function(creep, opts) {
        if (creep.carry.energy === creep.carryCapacity) {
            return false;
        }

        if (!opts.hasOwnProperty('includeContainers')) {
            opts['includeContainers'] = true;
        }
        if (!opts.hasOwnProperty('includeSources')) {
            opts['includeSources'] = true;
        }
        
        var targets = [];
        if (opts.includeContainers) {
            targets = Game.rooms[creep.room.name].find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER && structure.store.energy > 0) } });
            console.log('I found containers for eating!', targets.length, 'of them! - ', creep.memory.role);
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
                    var targets = [Game.flags['CreepPasture'].pos, Game.flags['CreepPasture2'].pos];
                    targets = _.sortBy(targets, s => creep.pos.getRangeTo(s));
                    creep.moveTo(targets[0].pos, {visualizePathStyle: {stroke: '#ffffff'}});
                    return false;
                }
            } else {
                // Nothing to do so move out of the way for now
                var targets = [Game.flags['CreepPasture'].pos, Game.flags['CreepPasture2'].pos];
                targets = _.sortBy(targets, s => creep.pos.getRangeTo(s));
                creep.moveTo(targets[0].pos, {visualizePathStyle: {stroke: '#ffffff'}});
                return false;
            }
        }
        
        return true;
    },
    grabDroppedEnergy: function(creep) {
        if (creep.carry.energy === creep.carryCapacity) {
            return false;
        }
        
        var droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: (d) => {return (d.resourceType == RESOURCE_ENERGY)}
        });
        if (droppedEnergy) {
            // console.log('I found some dropped energy!', droppedEnergy);
            if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedEnergy.pos, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            return true;
        } else {
            // console.log('No dropped energy around...');
            return false;
        }
    },
    goToPasture: function(creep) {
        /*
        var targets = [Game.flags['CreepPasture'].pos, Game.flags['CreepPasture2'].pos];
        targets = _.sortBy(targets, s => creep.pos.getRangeTo(s));
        */
        creep.moveTo(Game.flags['CreepPasture'].pos, {visualizePathStyle: {stroke: '#ffffff'}});
    },
    getCreepBodyParts: function(role, maxEnergy, howManyAlready) {
        console.log('maxEnergy:', maxEnergy);
        
        if (role == 'wallbreaker') {
            var parts = [];
            while (maxEnergy > 130) {
                parts.push(MOVE);
                parts.push(ATTACK);
                maxEnergy -= 130;
            }
            while (maxEnergy > 50) {
                parts.push(MOVE);
                maxEnergy -= 50;
            }
            return parts;
        }
        
        /*
        console.log('BPC:');
        for (var i in BODYPART_COST) {
            console.log(i, ':', BODYPART_COST[i]);
        }
        */
    
        var parts = [];
        
        if (role == 'thief' && maxEnergy >= 650) {
            var makeClaimer = true;
            var thieves = _.filter(Game.creeps, (creep) => creep.memory.role == 'thief');
            for (var i in thieves) {
                if (thieves[i].memory.claimer) {
                    makeClaimer = false;
                    break;
                }
            }
            
            if (makeClaimer) {
                parts.push(CLAIM);
                maxEnergy -= 600;
                while (maxEnergy > 50) {
                    parts.push(MOVE);
                    maxEnergy -= 50;
                }
                console.log('Making a thief who can claim!', parts);
                return parts;
            }
        }
        
        parts.push(WORK);
        parts.push(WORK);
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
