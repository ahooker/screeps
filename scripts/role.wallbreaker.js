var utils = require('creep.utils');

var roleWallbreaker = {
    run: function(creep) {
        /*
        console.log('BPC:');
        for (var i in BODYPART_COST) {
            console.log(i, ':', BODYPART_COST[i]);
        }
        */
        
        var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            creep.attack(closestHostile);
        } else {
            var walls = creep.room.find(FIND_STRUCTURES, {
                filter: (n) => n.structureType == STRUCTURE_WALL && n.pos.roomName == 'E52N7' && n.pos.x == 34 && n.pos.y == 49
            });
            
            if (walls.length) {
                var result = creep.attack(walls[0]);
                if (result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(walls[0].pos, {visualizePathStyle: {stroke: '#ff0000'}});
                } else {
                    // console.log('Yay?', result);
                }
            } else {
                utils.goToPasture(creep);
            }
        }
	}
};

module.exports = roleWallbreaker;
