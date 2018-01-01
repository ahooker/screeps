var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

function getCreepBodyParts(role, maxEnergy) {
    console.log('maxEnergy:', maxEnergy);

    if (maxEnergy >= 400) {
        return [WORK, WORK, WORK, CARRY, MOVE];
    }

    return [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE];
    return [WORK, WORK, CARRY, MOVE];

    var parts = [WORK,WORK,CARRY,MOVE];

    var energyRemaining = maxEnergy - 300;
    while (energyRemaining > 50) {
        parts.push(WORK);
        energyRemaining -= 50;
    }
    console.log('Parts:', parts);

    return parts;
}

module.exports.loop = function () {
    var tower = Game.getObjectById('f0179790bd8282e033d0d8b2');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
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
    // console.log('energyForSpawning:', energyForSpawning);


    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);
    if(harvesters.length < 10) {
        var newName = 'Harvester' + Game.time;
        console.log('Spawning new harvester: ' + newName);
        var result = Game.spawns['Spawn1'].spawnCreep(getCreepBodyParts('harvester', energyForSpawning), newName,
            {memory: {role: 'harvester'}});
        console.log('The result was: ' + result);
    } else {
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        console.log('Upgraders: ' + upgraders.length);
        if(upgraders.length < 1 ) {
            var newName = 'Upgrader' + Game.time;
            console.log('Spawning new upgrader: ' + newName);
            var result = Game.spawns['Spawn1'].spawnCreep(getCreepBodyParts('upgrader', energyForSpawning), newName,
                {memory: {role: 'upgrader'}});
            console.log('The result was: ' + result);
        } else {
            var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
            console.log('Builders: ' + builders.length);
            if(builders.length < 2) {
                var newName = 'Builder' + Game.time;
                console.log('Spawning new builder: ' + newName);
                var result = Game.spawns['Spawn1'].spawnCreep(getCreepBodyParts('builder', energyForSpawning), newName,
                    {memory: {role: 'builder'}});
                console.log('The result was: ' + result);
            }
        }
    }

    if (Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            'ð ï¸' + spawningCreep.memory.role,
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
