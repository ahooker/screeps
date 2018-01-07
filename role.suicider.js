var roleSuicider = {
    run: function(creep) {
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN);
            }
        });
        if (Game.spawns['Spawn1'].recycleCreep(creep) === ERR_NOT_IN_RANGE) {
			creep.moveTo(targets[0].pos);
		}
	}
};

module.exports = roleSuicider;
