function createEntity_player(entity)
{
    entity.update = player_update
    entity.pos.x = 2
    entity.pos.y = 4.5
    entity.pos.z = 1.6
    entity.angle = 180
    entity.angleX = 0
    entity.fov = 70
}

function player_update(entity, dt)
{
}
