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
        if (Input.isDown(Key.C))
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
    else if (Input.isDown(Key.LEFT_CONTROL) && Input.isJustDown(Key.S))
    {
        saveMap()
    }

    // Voxel edit
    if (Input.isDown(Key.E))
    {
        setSolidAt(editCam.pos, false)
    }
    else if (Input.isDown(Key.Q))
    {
        setSolidAt(editCam.pos, true)
    }
}

function renderEdit()
{
    // Setup camera
    var camFront = getEntityFront(editCam)
    Renderer.setupFor3D(editCam.pos, editCam.pos.add(camFront), Vector3.UNIT_Z, editCam.fov)
    Renderer.clearDepth()
    Renderer.setDepthEnabled(true)
    Renderer.setDepthWrite(true)

    // Draw entities that don't have mesh
    Renderer.setVertexShader(shaders.entityVS)
    Renderer.setPixelShader(shaders.entityPS)
    for (var i = 0; i < editDrawables.length; ++i)
    {
        var entity = editDrawables[i]
        var color = entity.color ? entity.color : Color.WHITE
        shaders.entityPS.setVector3("entityColor", color.toVector3())
        models.entity.render(getEntityTransform(entity))
    }
}

function renderEditUI()
{
    if (getSolidAt(editCam.pos))
    {
        SpriteBatch.begin()
        SpriteBatch.drawRect(null, new Rect(0, 0, res.x, 10), new Color(1, 0, 0))
        SpriteBatch.end()
    }
}
