var editCam = {
    pos: new Vector3(0),
    angle: 0,
    angleX: 0,
    fov: 70,
    vel: new Vector3(0)
}
var editIsPanning = false
var hoverEntity = null
var selectedEntity = null

function intersect(bmin, bmax, rayFrom, rayDir)
{
    var tmin = (bmin.x - rayFrom.x) / rayDir.x;
    var tmax = (bmax.x - rayFrom.x) / rayDir.x;

    if (tmin > tmax) { var tmp = tmax; tmax = tmin; tmin = tmp; }

    var tymin = (bmin.y - rayFrom.y) / rayDir.y;
    var tymax = (bmax.y - rayFrom.y) / rayDir.y;

    if (tymin > tymax) { var tmp = tymax; tymax = tymin; tymin = tmp; }

    if ((tmin > tymax) || (tymin > tmax))
        return false;

    if (tymin > tmin)
        tmin = tymin;

    if (tymax < tmax)
        tmax = tymax;

    tzmin = (bmin.z - rayFrom.z) / rayDir.z;
    tzmax = (bmax.z - rayFrom.z) / rayDir.z;

    if (tzmin > tzmax) { var tmp = tzmax; tzmax = tzmin; tzmin = tmp; }

    if ((tmin > tzmax) || (tzmin > tmax))
        return false;

    if (tzmin > tmin)
        tmin = tzmin;

    if (tzmax < tmax)
        tmax = tzmax;

    return true;
}

function map_rayPick(rayFrom, rayDir)
{
    var prevDist = 1000 * 1000; // Squared
    var ret = null;

    for (var i = 0; i < entities.length; ++i)
    {
        var entity = entities[i]
        if (entity.mapObj && entity.mapObj.unpickable) continue
        var bmin = entity.model ? entity.model.getMin() : new Vector3(.05, .05, .05)
        var bmax = entity.model ? entity.model.getMax() : new Vector3(-.05, -.05, -.05)
        bmin = bmin.add(entity.pos)
        bmax = bmax.add(entity.pos)
        if (intersect(bmin, bmax, rayFrom, rayDir))
        {
            var dist = Vector3.distanceSquared(rayFrom, entity.pos)
            if (dist < prevDist)
            {
                prevDist = dist;
                ret = entity;
            }
        }
    }

    return ret;
}

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
        var maxSpeed = Input.isDown(Key.LEFT_SHIFT) ? 10 : PLAYER_WALK_SPEED

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
    else
    {
        if (Input.isDown(Key.LEFT_CONTROL) && Input.isJustDown(Key.S)) saveMap()
    }

    // Mouse picking (View picking...)
    var camFront = getEntityFront(editCam)
    var camPos = getEntityCamPos(editCam)
    hoverEntity = map_rayPick(camPos, camPos.add(camFront.mul(1000)))

    if (hoverEntity && Input.isJustDown(Key.MOUSE_1))
    {
        selectedEntity = hoverEntity
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
    Renderer.setDepthEnabled(false)

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

    // Hovered entity
    if (hoverEntity)
    {
        Renderer.pushBlendMode(BlendMode.ALPHA)
        shaders.entityPS.setVector3("entityColor", new Vector3(1, 1, 0, 0.5))
        models.entity.render(getEntityTransform(hoverEntity))
        Renderer.popBlendMode()
    }
    if (selectedEntity)
    {
        Renderer.pushBlendMode(BlendMode.ALPHA)
        shaders.entityPS.setVector3("entityColor", new Vector3(1, 0, 0, 0.5))
        models.entity.render(getEntityTransform(selectedEntity))
        Renderer.popBlendMode()
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

    Renderer.setBackFaceCull(false)

    if (GUI.begin("voxel"))
    {
        var voxel = getVoxelAt(editCam.pos)
        if (voxel)
        {
            voxel.solid = GUI.checkbox("Solid", voxel.solid)
        }
    }
    GUI.end()

    if (GUI.begin("Inspector"))
    {
        var newType = ""
        GUI.inputText("new type", newType)
        GUI.sameLine()
        if (GUI.button("Create"))
        {
            selectedEntity = createEntity({type:newType}, editCam.pos.add(getEntityFront(editCam)))
        }
        GUI.separator()
        if (selectedEntity && GUI.button("Delete"))
        {
            deleteEntity(selectedEntity)
            selectedEntity = null
        }
        if (selectedEntity)
        {
            if (!selectedEntity.mapObj.name) selectedEntity.mapObj.name = ""
            selectedEntity.name = GUI.inputText("Name", selectedEntity.mapObj.name)
            if (!selectedEntity.mapObj.type) selectedEntity.mapObj.type = ""
            selectedEntity.type = GUI.inputText("Type", selectedEntity.mapObj.type)
            selectedEntity.pos = GUI.dragVector3("Position", selectedEntity.pos, 0.01)
            selectedEntity.mapObj.pos.x = selectedEntity.pos.x
            selectedEntity.mapObj.pos.y = selectedEntity.pos.y
            selectedEntity.mapObj.pos.z = selectedEntity.pos.z
            if (selectedEntity.angle != undefined)
            {
                selectedEntity.angle = GUI.dragNumber("Angle", selectedEntity.angle, 0.1)
                selectedEntity.mapObj.angle = selectedEntity.angle
            }
            if (selectedEntity.angleX != undefined)
            {
                selectedEntity.angleX = GUI.dragNumber("AngleX", selectedEntity.angleX, 0.1)
                selectedEntity.mapObj.angleX = selectedEntity.angleX
            }
            if (selectedEntity.mapObj.radius != undefined)
                selectedEntity.mapObj.radius = GUI.dragNumber("Radius", selectedEntity.mapObj.radius, 0.1)
            if (selectedEntity.mapObj.color)
                selectedEntity.mapObj.color = GUI.colorPickerRGBA("Color", selectedEntity.mapObj.color)
            if (selectedEntity.mapObj.model)
            {
                selectedEntity.mapObj.model = GUI.inputText("Model", selectedEntity.mapObj.model)
                selectedEntity.model = getModel(selectedEntity.mapObj.model)
            }
        }
    }
    GUI.end()
}
