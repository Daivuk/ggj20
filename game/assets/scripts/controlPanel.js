function createEntity_controlPanel(entity)
{
    if (!entity.mapObj.angle)
        entity.mapObj.angle = 0
    entity.angle = entity.mapObj.angle
    if (!entity.mapObj.model)
        entity.mapObj.model = "controlPanel.model"
    if (entity.mapObj.target == undefined)
        entity.mapObj.target = ""
    if (!entity.mapObj.color)
        entity.mapObj.color = new Color(.8, 1, .9, 1)
    if (!entity.mapObj.radius)
        entity.mapObj.radius = 0.5
    if (!entity.mapObj.intensity)
        entity.mapObj.intensity = 2
    if (!entity.mapObj.flicker)
        entity.mapObj.flicker = 0
    omnis.push(entity)
    entity.interract = controlPanel_interract
    entity.model = getModel(entity.mapObj.model)
}

function controlPanel_interract(entity, player)
{
    if (entity.mapObj.target == "hangar")
    {
        entity.mapObj.target = ""
        playSound("HangarDoor.wav", 2.0, 0, 0.6)
        hangarMat.queue(Matrix.IDENTITY, 4, Tween.LINEAR, function()
        {
            hangarOpen = false
            // stop sound
        })
        hangarMat.play()
        return
    }
    var target = findEntity(entity.mapObj.target)
    if (target && target.trigger) target.trigger(target, entity, player)
}
