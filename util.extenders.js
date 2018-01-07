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
    Creep.prototype.init = function() {

    };
    Creep.prototype.run = function() {
        if (!this.memory.role) {
            return false;
        }

        // console.log('I am a stinker!', this.memory.role);
        var brain = require('role.' + this.memory.role);
        brain.run(this);
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

module.exports = {
    extendCreeps: extendCreeps,
    extendSources: extendSources,
    extendSpawns: extendSpawns
};
