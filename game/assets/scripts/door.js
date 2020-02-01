function createEntity_door(entity)
{
    if (!entity.mapObj.angle)
        entity.mapObj.angle = 0
    entity.angle = entity.mapObj.angle
    if (!entity.mapObj.model)
        entity.mapObj.model = "door.model"
    entity.model = getModel(entity.mapObj.model)
    entity.update = door_update;
}

function door_update(entity, dt)
{
}
