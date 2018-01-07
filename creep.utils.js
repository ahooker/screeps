const profiler = require('screeps-profiler');

function sortCreepBodyParts(parts) {
    // console.log('I want to sort these:', JSON.stringify(parts));

    var sortedParts = {};
    for (var i in parts) {
        if (typeof sortedParts[parts[i]] === 'undefined') {
            sortedParts[parts[i]] = 1;
        } else {
            sortedParts[parts[i]]++;
        }
    }

    parts = [];
    if (sortedParts[TOUGH]) {
        for (var i=0; i<sortedParts[TOUGH]; i++) {
            parts.push(TOUGH);
        }
        delete sortedParts[TOUGH];
    }
    if (sortedParts[CARRY]) {
        for (var i=0; i<sortedParts[CARRY]; i++) {
            parts.push(CARRY);
        }
        delete sortedParts[CARRY];
    }
    if (sortedParts[CLAIM]) {
        for (var i=0; i<sortedParts[CLAIM]; i++) {
            parts.push(CLAIM);
        }
        delete sortedParts[CLAIM];
    }
    if (sortedParts[WORK]) {
        for (var i=0; i<sortedParts[WORK]; i++) {
            parts.push(WORK);
        }
        delete sortedParts[WORK];
    }
    if (sortedParts[MOVE]) {
        for (var i=0; i<sortedParts[MOVE]; i++) {
            parts.push(MOVE);
        }
        delete sortedParts[MOVE];
    }
    if (sortedParts[ATTACK]) {
        for (var i=0; i<sortedParts[ATTACK]; i++) {
            parts.push(ATTACK);
        }
        delete sortedParts[ATTACK];
    }
    for (var partIndex in sortedParts) {
        for (var i=0; i<sortedParts[partIndex]; i++) {
            parts.push(partIndex);
        }
        delete sortedParts[partIndex];
    }

    // console.log('How about this?:', JSON.stringify(parts));
    return parts;
}

function expansions() {
    return ['Expansion1', 'Expansion2', 'Expansion3', 'Expansion4', 'Expansion5'];
}

function expansionPaths() {
    var pathMap = [];
    pathMap.push(['Spawn1', 'Expansion1']);
    pathMap.push(['Spawn1', 'Expansion2']);
    pathMap.push(['Spawn1', 'Expansion3']);
    pathMap.push(['Spawn1', 'Expansion4']);
    pathMap.push(['Spawn1', 'Expansion5']);

    var expansionPaths = [];
    for (var i in pathMap) {
        var origin;
        if (pathMap[i][0].startsWith('Spawn')) {
            origin = Game.spawns[pathMap[i][0]].pos;
        } else {
            origin = Game.flags[pathMap[i][0]].pos;
        }
        var goal;
        if (pathMap[i][1].startsWith('Spawn')) {
            goal = Game.spawns[pathMap[i][1]].pos;
        } else {
            goal = Game.flags[pathMap[i][1]].pos;
        }
        expansionPaths.push(PathFinder.search(origin, goal));
    }

    return expansionPaths;
}

function roles() {
    return [
        'harvester',
        'upgrader',
        'builder',
        'thief',
        'wallbreaker',
        'wounded',
        'suicider',
        'medic'
    ];
}

function howManyCreeps(role) {
    switch (role) {
        case 'thief':
            return 25;
        case 'wallbreaker':
            return 0;
        case 'upgrader':
            return 2;
        case 'builder':
            return 1 + Math.floor(Game.spawns['Spawn1'].creepsByRole.thief.length/5);
        case 'harvester':
            return 5;
        default:
            return 0;
    }
}

function grabEnergy(creep, opts) {
    if (creep.isFull) {
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
        // console.log('I found containers for eating!', targets.length, 'of them! - ', creep.memory.role);
    }

    if (targets.length > 0) {
        targets = _.sortBy(targets, s => creep.pos.getRangeTo(s));

        if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            if (Game.time % 15 === 0) {
                creep.say('Hungry!');
            }
        }
    } else {
        if (opts.includeSources) {
            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source) {
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                    if (Game.time % 15 === 0) {
                        creep.say('Hungry!');
                    }
                }
            } else {
                if (Game.time % 15 === 0) {
                    creep.say('SO HUNGRY!');
                }
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
}

function grabDroppedEnergy(creep) {
    if (creep.isFull) {
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
}

function goToPasture(creep) {
    var target = creep.pos.findClosestByPath(FIND_FLAGS, {
        filter: (f) => {return f.name.substr(0, 12) === 'CreepPasture'}
    });

    if (target) {
        creep.moveTo(target.pos, {visualizePathStyle: {stroke: '#00ff00'}});
    }
}

function getCreepBodyParts(role, maxEnergy, howManyAlready) {
    console.log('maxEnergy:', maxEnergy);

    if (role == 'wallbreaker') {
        var parts = [];
        while (maxEnergy > BODYPART_COST[MOVE] + BODYPART_COST[ATTACK]) {
            parts.push(MOVE);
            parts.push(ATTACK);
            maxEnergy -= BODYPART_COST[MOVE] + BODYPART_COST[ATTACK];
        }
        while (maxEnergy > BODYPART_COST[MOVE]) {
            parts.push(MOVE);
            maxEnergy -= BODYPART_COST[MOVE];
        }
        parts = sortCreepBodyParts(parts);
        return parts;
    }

    /*
    console.log('BPC:');
    for (var i in BODYPART_COST) {
        console.log(i, ':', BODYPART_COST[i]);
    }
    */

    var parts = [];
    if (role == 'thief' && maxEnergy >= BODYPART_COST[MOVE] + BODYPART_COST[CLAIM]) {
        var thieves = _.filter(Game.creeps, (creep) => { return (creep.memory.role == 'thief') } );
        var claimers = _.filter(Game.creeps, (creep) => { return (creep.memory.role == 'thief' && creep.memory.claimer) } );
        console.log('I have', thieves.length, 'thieves. I have', claimers.length, 'claimers.');
        if (claimers.length < Math.ceil(thieves.length / 5)) {
            parts.push(CLAIM);
            maxEnergy -= BODYPART_COST[CLAIM];
            parts.push(MOVE);
            maxEnergy -= BODYPART_COST[MOVE];

            while (maxEnergy > BODYPART_COST[ATTACK] + BODYPART_COST[MOVE]) {
                parts.push(ATTACK);
                maxEnergy -= BODYPART_COST[ATTACK];
                parts.push(MOVE);
                maxEnergy -= BODYPART_COST[MOVE];
            }

            parts = sortCreepBodyParts(parts);
            console.log('Making a thief who can claim!', parts);
            return parts;
        }
    }

    if (role == 'thief') {
        parts.push(ATTACK);
        maxEnergy -= BODYPART_COST[ATTACK];
    }

    parts.push(WORK);
    maxEnergy -= BODYPART_COST[WORK];
    parts.push(WORK);
    maxEnergy -= BODYPART_COST[WORK];

    // 600+? extra work..
    if (maxEnergy > 400) {
        parts.push(WORK);
        maxEnergy -= BODYPART_COST[WORK];
    }

    while (maxEnergy > BODYPART_COST[MOVE] + BODYPART_COST[CARRY]) {
        parts.push(MOVE);
        parts.push(CARRY);
        maxEnergy -= BODYPART_COST[MOVE];
        maxEnergy -= BODYPART_COST[CARRY];
    }
    while (maxEnergy > BODYPART_COST[MOVE]) {
        parts.push(MOVE);
        maxEnergy -= BODYPART_COST[MOVE];
    }
    parts = sortCreepBodyParts(parts);
    console.log('parts:', parts);
    return parts;
}

var creepUtils = {
    roles: roles,
    expansions: expansions,
    expansionPaths: expansionPaths,
    howManyCreeps: howManyCreeps,
    grabEnergy: profiler.registerFN(grabEnergy, 'grabEnergy'),
    grabDroppedEnergy: profiler.registerFN(grabDroppedEnergy, 'grabDroppedEnergy'),
    goToPasture: profiler.registerFN(goToPasture, 'goToPasture'),
    getCreepBodyParts: profiler.registerFN(getCreepBodyParts, 'getCreepBodyParts')
};

module.exports = creepUtils;
