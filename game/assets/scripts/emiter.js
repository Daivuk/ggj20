function createEntity_emiter(entity)
{
    if (!entity.mapObj.color)
        entity.mapObj.color = new Color(1, 1, 1, 1)
    if (!entity.mapObj.duration)
        entity.mapObj.duration = 1
    if (!entity.mapObj.speedF)
        entity.mapObj.speedF = 1
    if (!entity.mapObj.speedT)
        entity.mapObj.speedT = 1
    if (!entity.mapObj.sizeF)
        entity.mapObj.sizeF = 0.5
    if (!entity.mapObj.sizeT)
        entity.mapObj.sizeT = 1
    if (!entity.mapObj.spawnAreaSize)
        entity.mapObj.spawnAreaSize = 0
    if (!entity.mapObj.spread)
        entity.mapObj.spread = 45
    if (!entity.mapObj.freq)
        entity.mapObj.freq = 0.1
    if (!entity.mapObj.angle)
        entity.mapObj.angle = 0
    if (!entity.mapObj.angleX)
        entity.mapObj.angleX = 0
    entity.angle = entity.mapObj.angle
    entity.angleX = entity.mapObj.angleX
    entity.delay = 0
    entity.update = emiter_update
    emiters.push(entity)
}

function emiter_update(entity, dt)
{
    entity.delay -= dt
    if (entity.delay <= 0)
    {
        entity.delay = entity.mapObj.freq

        // Do spawning
        var vel = getEntityFront(entity).mul(Random.randNumber(entity.mapObj.speedF, entity.mapObj.speedT))
        var pos = getEntityCamPos(entity)
        pos = Random.randVector3(pos.sub(entity.mapObj.spawnAreaSize), pos.add(entity.mapObj.spawnAreaSize))

        smoke_create(pos, vel, entity.mapObj.duration, entity.mapObj.sizeF, entity.mapObj.sizeT, Color.WHITE)
    }
}
