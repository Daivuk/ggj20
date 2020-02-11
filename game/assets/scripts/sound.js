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
    entity.update = sound_update
    entity.sound = createSoundInstance(entity.mapObj.sound)
    if (entity.sound)
    {
        entity.sound.set3D(true, entity.pos, entity.mapObj.radius)
        entity.sound.setLoop(true)
        entity.sound.play();
    }
}

function sound_update(entity, dt)
{
    if (entity.sound)
        entity.sound.set3D(true, entity.pos, entity.mapObj.radius)
}
