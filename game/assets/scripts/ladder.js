function createEntity_ladder(entity)
{
    if (!entity.mapObj.angle)
        entity.mapObj.angle = 0
    entity.angle = entity.mapObj.angle
    if (!entity.mapObj.model)
        entity.mapObj.model = "ladder.model"
    entity.interract = ladder_interract
    entity.model = getModel(entity.mapObj.model)
}

function ladder_interract(entity, player)
{
    if (player.pos.z < 2)
    {
        player.pos.x = 5.5
        player.pos.y = 13.5
        player.pos.z = 3
        player.angle = -20
        player.angleX = -20
    }
    else
    {
        player.pos.x = 5.7
        player.pos.y = 14.5
        player.pos.z = 1
        player.angle = -90
        player.angleX = -10
    }
    player.vel = new Vector3(0, 0, 0)
    saveOverlay.playSingle(Color.BLACK, Color.TRANSPARENT, 0.5)
}
