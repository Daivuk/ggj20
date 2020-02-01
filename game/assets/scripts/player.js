var PLAYER_WALK_SPEED = 2
var PLAYER_RUN_SPEED = 4

function wrapAngle(n)
{
    return ((n % 360) + 360) % 360;
}

function toRad(a)
{
    return a * Math.PI / 180
}

function createEntity_player(entity)
{
    entity.update = player_update
    entity.pos.x = 2
    entity.pos.y = 4.5
    entity.pos.z = 1
    entity.angle = 180
    entity.angleX = 0
    entity.fov = 70
    entity.vel = new Vector3(0)
    entity.headOffset = new Vector3(0, 0, 0.5)
    entity.size = 0.2
    entity.hoverObject = null
    entity.postDraw = player_postDraw
}

function player_update(entity, dt)
{
    entity.angle = wrapAngle(entity.angle + Input.getMouseDelta().x * 0.3)
    entity.angleX -= Input.getMouseDelta().y * 0.3
    if (entity.angleX > 80) entity.angleX = 80
    if (entity.angleX < -80) entity.angleX = -80

    var dir = new Vector3(
        Math.sin(toRad(entity.angle)),
        Math.cos(toRad(entity.angle)), 0)
    var right = new Vector3(dir.y, -dir.x, 0)
    var maxSpeed = Input.isDown(Key.LEFT_SHIFT) ? PLAYER_RUN_SPEED : PLAYER_WALK_SPEED

    if (Input.isDown(Key.W))
    {
        entity.vel = entity.vel.add(dir.mul(dt * maxSpeed * 50))
    }
    if (Input.isDown(Key.S))
    {
        entity.vel = entity.vel.sub(dir.mul(dt * maxSpeed * 50))
    }
    if (Input.isDown(Key.D))
    {
        entity.vel = entity.vel.add(right.mul(dt * maxSpeed * 50))
    }
    if (Input.isDown(Key.A))
    {
        entity.vel = entity.vel.sub(right.mul(dt * maxSpeed * 50))
    }
    if (entity.vel.length() > maxSpeed)
    {
        entity.vel = entity.vel.normalize().mul(maxSpeed)
    }

    // Collisions
    voxelCollision(entity, dt)
    entity.pos = entity.pos.add(entity.vel.mul(dt))
    entity.vel = entity.vel.mul(Math.max(0, 1 - dt * 10))

    // Mouse pick
    {
        entity.hoverObject = null
        var camFront = getEntityFront(entity)
        var camPos = getEntityCamPos(entity)
        var pick = map_rayPick(camPos, camFront, 1, 0.1)
        if (pick && pick.interract)
        {
            entity.hoverObject = pick
        }
    }

    if (entity.hoverObject && Input.isJustDown(Key.MOUSE_1))
    {
        entity.hoverObject.interract(entity.hoverObject, entity)
    }
}

function player_postDraw(entity)
{
    if (entity.hoverObject)
    {
        Renderer.pushBlendMode(BlendMode.ALPHA)
        if (entity.hoverObject.model)
        {
            shaders.entityPS.setVector4("entityColor", new Vector4(1, 1, 0, 0.5))
            entity.hoverObject.model.render(getEntityTransform(entity.hoverObject));
        }
        Renderer.popBlendMode()
    }
}
