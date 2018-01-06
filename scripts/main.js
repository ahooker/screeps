var utils = require('creep.utils');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleWallbreaker = require('role.wallbreaker');
var roleThief = require('role.thief');

module.exports.loop = function () {
    // console.log('BPC:');
    // for (var i in BODYPART_COST) {
    //     console.log(i, ':', BODYPART_COST[i]);
    // }
    
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
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        } else if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        } else if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        } else if (creep.memory.role == 'wallbreaker') {
            roleWallbreaker.run(creep);
        } else if (creep.memory.role == 'thief') {
            roleThief.run(creep);
        }
    }

    var energyForSpawning = 0;
    energyForSpawning += Game.spawns['Spawn1'].energy;
    var extensions = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    });
    for (var extension in extensions) {
        extension = extensions[extension];
        energyForSpawning += extension.energy;
    }
    var possibleEnergyForSpawning = 300;
    possibleEnergyForSpawning = 300 + (50 * extensions.length)
    // console.log('energyForSpawning:', energyForSpawning, "out of possible", possibleEnergyForSpawning);
    
    var doSpawn = false;
    if (energyForSpawning === possibleEnergyForSpawning) {
        doSpawn = true;
    }

    
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    if (!doSpawn && harvesters.length < 2) {
        doSpawn = true;
    }
    
    if (doSpawn) {
        console.log('Harvesters: ' + harvesters.length);
        if(harvesters.length < 5) {
            var newName = 'Harvester' + Game.time;
            console.log('Spawning new harvester: ' + newName);
            var result = Game.spawns['Spawn1'].spawnCreep(utils.getCreepBodyParts('harvester', energyForSpawning), newName,
                {memory: {role: 'harvester'}});
            console.log('The result was: ' + result);
        } else {
            var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
            console.log('Upgraders: ' + upgraders.length);
            if(upgraders.length < 4 ) {
                var newName = 'Upgrader' + Game.time;
                console.log('Spawning new upgrader: ' + newName);
                var result = Game.spawns['Spawn1'].spawnCreep(utils.getCreepBodyParts('upgrader', energyForSpawning), newName,
                    {memory: {role: 'upgrader'}});
                console.log('The result was: ' + result);
            } else {
                var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
                console.log('Builders: ' + builders.length);
                if(builders.length < 2) {
                    var newName = 'Builder' + Game.time;
                    console.log('Spawning new builder: ' + newName);
                    var result = Game.spawns['Spawn1'].spawnCreep(utils.getCreepBodyParts('builder', energyForSpawning), newName,
                        {memory: {role: 'builder'}});
                    console.log('The result was: ' + result);
                } else {
                    var wallbreakers = _.filter(Game.creeps, (creep) => creep.memory.role == 'wallbreaker');
                    console.log('Wallbreakers: ' + wallbreakers.length);
                    if (wallbreakers.length < 1) {
                        var newName = 'Wallbreaker' + Game.time;
                        console.log('Spawning new wallbreaker: ' + newName);
                        var result = Game.spawns['Spawn1'].spawnCreep(utils.getCreepBodyParts('wallbreaker', energyForSpawning), newName,
                            {memory: {role: 'wallbreaker'}});
                        console.log('The result was: ' + result);
                    } else {
                        var thieves = _.filter(Game.creeps, (creep) => creep.memory.role == 'thief');
                        console.log('Thieves: ' + thieves.length);
                        if (thieves.length < 5) {
                            var newName = 'Thief' + Game.time;
                            console.log('Spawning new thief: ' + newName);
                            var result = Game.spawns['Spawn1'].spawnCreep(utils.getCreepBodyParts('thief', energyForSpawning, thieves.length), newName,
                                {memory: {role: 'thief'}});
                            console.log('The result was: ' + result);
                        }
                    }
                }
            }
        }
    }

    if (Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            'Spawning ' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    } else {
        Game.spawns['Spawn1'].room.visual.text(
            'energyForSpawning: ' + energyForSpawning + " out of possible: " + possibleEnergyForSpawning,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }

   for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
}
