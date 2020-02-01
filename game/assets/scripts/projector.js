function createEntity_projector(entity)
{
    if (!entity.mapObj.angle)
        entity.mapObj.angle = 0
    if (!entity.mapObj.angleX)
        entity.mapObj.angleX = 0
    if (!entity.mapObj.texture)
        entity.mapObj.texture = "white.png"
    if (!entity.mapObj.color)
        entity.mapObj.color = new Color(1, 1, 1, 1)
    if (!entity.mapObj.radius)
        entity.mapObj.radius = 4
    if (!entity.mapObj.flicker)
        entity.mapObj.flicker = 0
    
    entity.angle = entity.mapObj.angle
    entity.angleX = entity.mapObj.angleX
    entity.texture = getTexture(entity.mapObj.texture)
    projectors.push(entity)
}
