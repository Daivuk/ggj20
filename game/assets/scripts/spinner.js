function createEntity_spinner(entity)
{
    entity.update = spinner_update;
}

function spinner_update(entity, dt)
{
    entity.angle += dt * 360 * 3 % 360
}
