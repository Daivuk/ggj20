function createEntity_model(entity)
{
    var mapObj = entity.mapObj

    if (!entity.mapObj.model)
        entity.mapObj.model = "entity.model"
    entity.model = getModel(entity.mapObj.model)
}
