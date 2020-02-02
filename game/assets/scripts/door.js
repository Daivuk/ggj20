function createEntity_door(entity)
{
    if (!entity.mapObj.angle)
        entity.mapObj.angle = 0
    entity.angle = entity.mapObj.angle
    if (!entity.mapObj.model)
        entity.mapObj.model = "door.model"
    entity.model = getModel(entity.mapObj.model)
    entity.update = door_update
    entity.trigger = door_trigger
    entity.isOpen = false
    entity.openAnim = new Vector3Anim(entity.pos)
    entity.collision = true
}

function door_update(entity, dt)
{
    entity.pos = entity.openAnim.get()
}

function door_trigger(entity, triggerer, player)
{
    if (entity.openAnim.isPlaying()) return
    if (entity.damage)
    {
        print("SHOW MSG: Door damaged")
        playSound("HonHon.wav")
        return
    }
    entity.isOpen = !entity.isOpen
    if (entity.isOpen)
    {
        entity.openAnim.playSingle(entity.pos, entity.pos.add(new Vector3(0, 0, 0.8)), 1.5, Tween.LINEAR)
    }
    else
    {
        entity.openAnim.playSingle(entity.pos, entity.pos.add(new Vector3(0, 0, -0.8)), 1.5, Tween.LINEAR)
    }
    playSound("ElectricDoorSlam.wav", 1.0, 0, 0.8)
}
