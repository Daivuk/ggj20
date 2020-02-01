var editCam = {
    pos: new Vector3(0),
    angle: 0,
    angleX: 0,
    fov: 70,
    vel: new Vector3(0)
}
var editIsPanning = false

function updateEdit(dt)
{
    if (Input.isJustDown(Key.MOUSE_3))
    {
        editIsPanning = true
        Input.setFpsMouse(true)
    }
    else if (Input.isJustUp(Key.MOUSE_3))
    {
        editIsPanning = false
        Input.setFpsMouse(false)
    }

    if (editIsPanning)
    {
        var entity = editCam

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
        if (Input.isDown(Key.SPACE_BAR))
        {
            entity.vel = entity.vel.add(Vector3.UNIT_Z.mul(dt * maxSpeed * 50))
        }
        if (Input.isDown(Key.LEFT_CONTROL))
        {
            entity.vel = entity.vel.sub(Vector3.UNIT_Z.mul(dt * maxSpeed * 50))
        }
        if (entity.vel.length() > maxSpeed)
        {
            entity.vel = entity.vel.normalize().mul(maxSpeed)
        }

        entity.pos = entity.pos.add(entity.vel.mul(dt))
        entity.vel = entity.vel.mul(Math.max(0, 1 - dt * 10))
    }
}

function renderEditUI()
{

}
