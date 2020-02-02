function createEntity_computer(entity)
{
    if (!entity.mapObj.angle)
        entity.mapObj.angle = 0
    entity.angle = entity.mapObj.angle
    if (!entity.mapObj.model)
        entity.mapObj.model = "computer.model"
    entity.model = getModel(entity.mapObj.model)
    entity.update = computer_update
    entity.collision = true
}

function computer_update(entity, dt)
{
}
