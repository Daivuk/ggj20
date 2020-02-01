function createEntity_model(entity)
{
    var mapObj = entity.mapObj

    if (!entity.mapObj.angle)
        entity.mapObj.angle = 0
    if (!entity.mapObj.angleX)
        entity.mapObj.angleX = 0
    if (!entity.mapObj.model)
        entity.mapObj.model = "entity.model"
    entity.angle = entity.mapObj.angle
    entity.angleX = entity.mapObj.angleX
    entity.model = getModel(entity.mapObj.model)
}
