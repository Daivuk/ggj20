function createEntity_sound(entity)
{
    if (!entity.mapObj.sound)
        entity.mapObj.sound = "LightBuzzAndFlicker.wav"
    if (!entity.mapObj.radius)
        entity.mapObj.radius = 4
    if (!entity.mapObj.volume)
        entity.mapObj.volume = 1
    if (!entity.mapObj.pitch)
        entity.mapObj.pitch = 1
    entity.sound = createSoundInstance(entity.mapObj.sound)
    if (entity.sound)
    {
        entity.sound.setVolume(0)
        entity.sound.setLoop(true)
        entity.sound.play();
    }
    entity.update = sound_update
    sounds.push(entity)
}

function sound_update(entity, dt)
{
    if (!entity.sound) return
    var listener = player
    if (state == "edit") listener = editCam
    var lpos = getEntityCamPos(listener)
    var lfront = getEntityFront(listener)
    var lright = lfront.cross(Vector3.UNIT_Z).normalize()
    var dir = entity.pos.sub(lpos)
    var dis = dir.length()

    if (dis > entity.mapObj.radius)
    {
        entity.sound.setVolume(0)
        return
    }

    dir = dir.div(dis)
    var dotR = lright.dot(dir)

    entity.sound.setVolume(1 - dis / entity.mapObj.radius)
    entity.sound.setBalance(dotR)
    entity.sound.setPitch(entity.mapObj.pitch)
}
