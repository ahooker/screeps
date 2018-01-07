var utils = require('creep.utils');
var extenders = require('util.extenders');
extenders.extendCreeps();
extenders.extendSources();
extenders.extendSpawns();
extenders.extendGame();

// Any modules that you use that modify the game's prototypes should be require'd
// before you require the profiler.
const profiler = require('screeps-profiler');

// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function () {
profiler.wrap(function() {

    // console.log('BPC:');
    // for (var i in BODYPART_COST) {
    //     console.log(i, ':', BODYPART_COST[i]);
    // }

    delete Memory.lastConstructionUpdate;
    if (Game.time % 300 === 0) {
        console.log('Plotting new roads');
        var paths = utils.expansionPaths();
        for (var pathIndex in paths) {
            var path = paths[pathIndex];

            for (positionIndex in path.path) {
                var position = path.path[positionIndex];
                var room = Game.rooms[path.path[positionIndex].roomName];
                if (room && room.lookForAt(LOOK_STRUCTURES, position.x, position.y).length == 0) {
                    room.createConstructionSite(position.x, position.y, STRUCTURE_ROAD);
                }
            }
        }
    }

    var tower = Game.getObjectById('5a4e7787e2555e0bfc83e762');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 1000
        });
        if (!closestDamagedStructure) {
            closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax && structure.hitsMax <= 5000
            });
        }
        /*
        if (!closestDamagedStructure) {
            closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
        }
        */
        tower.repair(closestDamagedStructure);

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        creep.run();
    }

    var spawn = Game.spawns['Spawn1'];
    if (Game.time % 15 === 0) {
        var creepStats = [];
        _.forEach(spawn.creepsByRole, (creeps, role) => {
            creepStats.push(role + ': ' + creeps.length);
        });
        console.log(creepStats.join(', '));
    }

    var doSpawn = false;
    if (!spawn.spawning) {
        if (spawn.totalEnergyAvailable === spawn.totalEnergyPossible) {
            doSpawn = true;
        }

        // var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        if (!doSpawn && spawn.creepsByRole.harvester.length < 2) {
            // emergency spawn some little harvesters
            doSpawn = true;
        }
    }

    if (doSpawn) {
        var roles = utils.roles();
        _.forEach(utils.roles(), (role) => {
            // console.log('Hark, the role:', role);
            if (spawn.creepsByRole[role].length < utils.howManyCreeps(role)) {
                var newName = _.capitalize(role) + Game.time;
                var result = spawn.spawnCreep(utils.getCreepBodyParts(role, spawn.totalEnergyAvailable), newName, {memory: {role: role}});
                console.log('Spawning new creep: ' + newName + ' (' + result + ')');
                Game.creeps[newName].init();
            }
        });
    }

    var status = [];
    if (spawn.spawning) {
        var spawningCreep = Game.creeps[spawn.spawning.name];
        status.push('Spawn1 is actively spawning: ' + spawningCreep.memory.role);
        spawn.room.visual.text(
            'Spawning ' + spawningCreep.memory.role,
            spawn.pos.x + 2,
            spawn.pos.y + 2,
            {align: 'left', opacity: 0.8});
    } else {
        spawn.room.visual.text(
            'energyForSpawning: ' + spawn.totalEnergyAvailable + " out of possible: " + spawn.totalEnergyPossible,
            spawn.pos.x + 2,
            spawn.pos.y + 2,
            {align: 'left', opacity: 0.8});
    }
    status.push('energyForSpawning: ' + spawn.totalEnergyAvailable + " out of possible: " + spawn.totalEnergyPossible);

    if (Game.time % 15 === 0) {
        for (var i in status) {
            console.log(status[i]);
        }
    }

    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
});
}
