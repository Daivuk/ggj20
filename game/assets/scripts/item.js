function createEntity_item(entity)
{
    if (!entity.mapObj.angle)
        entity.mapObj.angle = 0
    if (!entity.mapObj.angleX)
        entity.mapObj.angleX = 0
    if (!entity.mapObj.model)
        entity.mapObj.model = "entity.model"
    if (entity.mapObj.target == undefined)
        entity.mapObj.target = ""
    entity.angle = entity.mapObj.angle
    entity.angleX = entity.mapObj.angleX
    entity.model = getModel(entity.mapObj.model)
    entity.interract = item_interract
}

function getItem(entity, name)
{
    if (entity.items)
    {
        for (var i = 0; i<entity.items.length;++i)
        {
            var item = entity.items[i]
            if (item.mapObj.target == name)
            {
                return item
            }
        }
    }
    return null
}

function item_interract(entity, player)
{
    entity.inHandModel = entity.model
    entity.model = null
    entity.interract = null

    player.items.push(entity)
}
