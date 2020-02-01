function createEntity_spinner(obj)
{
    obj.update = spinner_update;
}

function spinner_update(entity, dt)
{
    entity.angle += dt * 360 * 3 % 360
}
