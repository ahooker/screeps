var utils = require('creep.utils');
var extenders = require('util.extenders');
extenders.extendCreeps();
extenders.extendSources();
extenders.extendSpawns();

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleWallbreaker = require('role.wallbreaker');
var roleThief = require('role.thief');
var roleSuicider = require('role.suicider');

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

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        creep.run();
    }

    var spawn = Game.spawns['Spawn1'];
    var doSpawn = false;
    if (spawn.totalEnergyAvailable === spawn.totalEnergyPossible) {
        doSpawn = true;
    }


    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    if (!doSpawn && harvesters.length < 2) {
        doSpawn = true;
    }

    if (doSpawn) {
        console.log('Harvesters: ' + harvesters.length);
        if(harvesters.length < utils.howManyCreeps('harvester')) {
            var newName = 'Harvester' + Game.time;
            console.log('Spawning new harvester: ' + newName);
            var result = spawn.spawnCreep(utils.getCreepBodyParts('harvester', spawn.totalEnergyAvailable), newName,
                {memory: {role: 'harvester'}});
            console.log('The result was: ' + result);
        } else {
            var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
            console.log('Upgraders: ' + upgraders.length);
            if(upgraders.length < 2 ) {
                var newName = 'Upgrader' + Game.time;
                console.log('Spawning new upgrader: ' + newName);
                var result = spawn.spawnCreep(utils.getCreepBodyParts('upgrader', spawn.totalEnergyAvailable), newName,
                    {memory: {role: 'upgrader'}});
                console.log('The result was: ' + result);
            } else {
                var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
                console.log('Builders: ' + builders.length);
                if(builders.length < utils.howManyCreeps('builder')) {
                    var newName = 'Builder' + Game.time;
                    console.log('Spawning new builder: ' + newName);
                    var result = spawn.spawnCreep(utils.getCreepBodyParts('builder', spawn.totalEnergyAvailable), newName,
                        {memory: {role: 'builder'}});
                    console.log('The result was: ' + result);
                } else {
                    var wallbreakers = _.filter(Game.creeps, (creep) => creep.memory.role == 'wallbreaker');
                    console.log('Wallbreakers: ' + wallbreakers.length);
                    if (wallbreakers.length < utils.howManyCreeps('wallbreaker')) {
                        var newName = 'Wallbreaker' + Game.time;
                        console.log('Spawning new wallbreaker: ' + newName);
                        var result = spawn.spawnCreep(utils.getCreepBodyParts('wallbreaker', spawn.totalEnergyAvailable), newName,
                            {memory: {role: 'wallbreaker'}});
                        console.log('The result was: ' + result);
                    } else {
                        var thievesWanted = utils.howManyCreeps('thief');
                        var thieves = _.filter(Game.creeps, (creep) => creep.memory.role == 'thief');
                        console.log('Thieves: ' + thieves.length);
                        if (thieves.length < thievesWanted) {
                            var newName = 'Thief' + Game.time;
                            console.log('Spawning new thief: ' + newName);
                            var result = spawn.spawnCreep(utils.getCreepBodyParts('thief', spawn.totalEnergyAvailable, thieves.length), newName,
                                {memory: {role: 'thief'}});
                            console.log('The result was: ' + result);
                        }
                    }
                }
            }
        }
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

    for (var i in status) {
        console.log(status[i]);
    }

    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
});
}
