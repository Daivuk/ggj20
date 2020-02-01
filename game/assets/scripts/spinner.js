function createEntity_spinner(entity)
{
    if (!entity.mapObj.angle)
        entity.mapObj.angle = 0
    entity.angle = entity.mapObj.angle
    if (!entity.mapObj.model)
        entity.mapObj.model = "entity.model"
    entity.model = getModel(entity.mapObj.model)
    entity.update = spinner_update;
}

function spinner_update(entity, dt)
{
    entity.angle = wrapAngle(entity.angle + dt * 360 * 3)
}
