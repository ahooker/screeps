var utils = require('creep.utils');

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleWallbreaker = require('role.wallbreaker');
var roleThief = require('role.thief');
var roleSuicider = require('role.suicider');

function extendCreeps() {
    Object.defineProperty(Creep.prototype, 'isFull', {
        get: function() {
            if (!this._isFull) {
                this._isFull = _.sum(this.carry) === this.carryCapacity;
            }
            return this._isFull;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Creep.prototype, 'isDamaged', {
        get: function() {
            return this.hits < this.hitsMax;
        },
        enumerable: false,
        configurable: true
    });
    Creep.prototype.log = function(message) {
        console.log(this.name + ': ' + message);
    };
    Creep.prototype.init = function() {
        if (!this.memory.role) {
            this.log('Wanted to init, but I had no role.');
            return false;
        }

        var brain = require('role.' + this.memory.role);
        if (brain.init) {
            brain.init(this);
        } else {
            this.log('Wanted to init, there was no method for me to call.');
        }
    };
    Creep.prototype.run = function() {
        if (!this.memory.role) {
            console.log('Wat, no role');
            return false;
        }

        // this.log('I am a stinker! ' + this.memory.role);
        var brain = require('role.' + this.memory.role);
        brain.run(this);
    };
    Creep.prototype.grabDroppedEnergy = function() {
        return utils.grabDroppedEnergy(this);
    };
    Creep.prototype.grabSourceEnergy = function() {
        return utils.grabEnergy(this, {includeSources: true, includeContainers: false});
    };
    Creep.prototype.grabContainerEnergy = function() {
        return utils.grabEnergy(this, {includeSources: false, includeContainers: true});
    };
    Creep.prototype.goToPasture = function() {
        return utils.goToPasture(this);
    };
}

function extendSources() {
    Object.defineProperty(Source.prototype, 'memory', {
        configurable: true,
        get: function() {
            if(_.isUndefined(Memory.mySourcesMemory)) {
                Memory.mySourcesMemory = {};
            }
            if(!_.isObject(Memory.mySourcesMemory)) {
                return undefined;
            }
            return Memory.mySourcesMemory[this.id] =
                    Memory.mySourcesMemory[this.id] || {};
        },
        set: function(value) {
            if(_.isUndefined(Memory.mySourcesMemory)) {
                Memory.mySourcesMemory = {};
            }
            if(!_.isObject(Memory.mySourcesMemory)) {
                throw new Error('Could not set source memory');
            }
            Memory.mySourcesMemory[this.id] = value;
        }
    });

    Object.defineProperty(Source.prototype, 'freeSpaceCount', {
        get: function () {
            if (this._freeSpaceCount == undefined) {
                if (this.memory.freeSpaceCount == undefined) {
                    let freeSpaceCount = 0;
                    [this.pos.x - 1, this.pos.x, this.pos.x + 1].forEach(x => {
                        [this.pos.y - 1, this.pos.y, this.pos.y + 1].forEach(y => {
                            if (Game.map.getTerrainAt(x, y, this.pos.roomName) != 'wall')
                                    freeSpaceCount++;
                                }, this);
                        }, this);
                    this.memory.freeSpaceCount = freeSpaceCount;
                }
                this._freeSpaceCount = this.memory.freeSpaceCount;
            }
            return this._freeSpaceCount;
        },
        enumerable: false,
        configurable: true
    });
}

function extendSpawns() {
    Object.defineProperty(Spawn.prototype, 'totalEnergyAvailable', {
        get: function () {
            var energyForSpawning = 0;
            energyForSpawning += this.energy;
            var extensions = this.room.find(FIND_MY_STRUCTURES, {
                filter: { structureType: STRUCTURE_EXTENSION }
            });
            for (var extensionIndex in extensions) {
                extension = extensions[extensionIndex];
                energyForSpawning += extension.energy;
            }
            return energyForSpawning;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Spawn.prototype, 'totalEnergyPossible', {
        get: function () {
            var potentialEnergyForSpawning = 0;
            potentialEnergyForSpawning += this.energyCapacity;
            var extensions = this.room.find(FIND_MY_STRUCTURES, {
                filter: { structureType: STRUCTURE_EXTENSION }
            });
            for (var extensionIndex in extensions) {
                extension = extensions[extensionIndex];
                potentialEnergyForSpawning += extension.energyCapacity;
            }
            return potentialEnergyForSpawning;
        },
        enumerable: false,
        configurable: true
    });
}

function extendGame() {
    Object.defineProperty(OwnedStructure.prototype, 'creepsByRole', {
        get: function () {
            if (this._creepsByRole) {
                return this._creepsByRole;
            }

            var sortedCreeps = {};
            var roles = utils.roles();
            for (var roleIndex in roles) {
                sortedCreeps[roles[roleIndex]] = [];
            }

            for (var creepIndex in Game.creeps) {
                var role = Game.creeps[creepIndex].memory.role;
                if (!sortedCreeps[role]) {
                    // console.log('Role:', role);
                    sortedCreeps[role] = [];
                }

                sortedCreeps[role].push(Game.creeps[creepIndex]);
            }
            console.log('Creep stats:', JSON.stringify(sortedCreeps));
            return this._creepsByRole = sortedCreeps;
        },
        enumerable: false,
        configurable: true
    });
}

module.exports = {
    extendCreeps: extendCreeps,
    extendSources: extendSources,
    extendSpawns: extendSpawns,
    extendGame: extendGame
};
