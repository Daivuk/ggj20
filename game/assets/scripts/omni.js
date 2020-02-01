function createEntity_omni(entity)
{
    if (!entity.mapObj.color)
        entity.mapObj.color = new Color(1, 1, 1, 1)
    if (!entity.mapObj.radius)
        entity.mapObj.radius = 4
    if (!entity.mapObj.flicker)
        entity.mapObj.flicker = 0
    if (!entity.mapObj.intensity)
        entity.mapObj.intensity = 1.15
    omnis.push(entity)
}
