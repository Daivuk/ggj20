function createEntity_omni(entity)
{
    if (!entity.mapObj.color)
        entity.mapObj.color = new Color(1, 1, 1, 1)
    if (!entity.mapObj.radius)
        entity.mapObj.radius = 4
    omnis.push(entity)
}
