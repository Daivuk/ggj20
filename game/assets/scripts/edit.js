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
var transform = Matrix.IDENTITY
var newType = ""

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

function map_rayPick(rayFrom, rayDir, maxDistance, extend)
{
    var d = maxDistance ? maxDistance : 1000
    extend = extend ? extend : 0
    var prevDist = d * d; // Squared
    var ret = null;

    for (var i = 0; i < entities.length; ++i)
    {
        var entity = entities[i]
        if (entity.mapObj && entity.mapObj.unpickable) continue
        var bmin = entity.model ? entity.model.getMin() : new Vector3(.05, .05, .05)
        var bmax = entity.model ? entity.model.getMax() : new Vector3(-.05, -.05, -.05)
        bmin = bmin.add(entity.pos).sub(extend)
        bmax = bmax.add(entity.pos).add(extend)
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
    if (!GUI.wantCaptureMouse())
    {
        var camFront = getEntityFront(editCam)
        var camPos = getEntityCamPos(editCam)

        var mousePos = Input.getMousePos()
        var invTransform = transform.invert()
        var mouseScreenFrom = new Vector4(mousePos.x / res.x * 2 - 1, -(mousePos.y / res.y * 2 - 1), 0, 1)
        var mouseScreenTo = new Vector4(mouseScreenFrom.x, mouseScreenFrom.y, 1, 1)
        var from = mouseScreenFrom.transform(invTransform)
        var to = mouseScreenTo.transform(invTransform)
        var from3 = new Vector3(from.x / from.w, from.y / from.w, from.z / from.w)
        var to3 = new Vector3(to.x / to.w, to.y / to.w, to.z / to.w)

        hoverEntity = map_rayPick(from3, to3.sub(from3).normalize())
    }

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
    transform = Renderer.getView().mul(Renderer.getProjection())
    Renderer.setDepthEnabled(false)

    // Draw entities that don't have mesh
    Renderer.setVertexShader(shaders.entityVS)
    Renderer.setPixelShader(shaders.entityPS)
    for (var i = 0; i < editDrawables.length; ++i)
    {
        var entity = editDrawables[i]
        var color = entity.color ? entity.color : Color.WHITE
        shaders.entityPS.setVector4("entityColor", color.toVector4())
        models.entity.render(getEntityTransform(entity))
    }

    // Hovered entity
    if (hoverEntity)
    {
        Renderer.pushBlendMode(BlendMode.ALPHA)
        shaders.entityPS.setVector4("entityColor", new Vector4(1, 1, 0, 0.5))
        models.entity.render(getEntityTransform(hoverEntity))
        Renderer.popBlendMode()
    }
    if (selectedEntity)
    {
        Renderer.pushBlendMode(BlendMode.ALPHA)
        shaders.entityPS.setVector4("entityColor", new Vector4(1, 0, 0, 0.5))
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
        newType = GUI.inputText("new type", newType)
        GUI.sameLine()
        if (GUI.button("Create"))
        {
            selectedEntity = createEntity({type:newType}, editCam.pos.add(getEntityFront(editCam)))
        }
        GUI.separator()
        if (selectedEntity)
        {
            if (GUI.button("Delete"))
            {
                deleteEntity(selectedEntity)
                selectedEntity = null
            }
            GUI.sameLine()
            if (GUI.button("Duplicate"))
            {
                selectedEntity = createEntity(JSON.parse(JSON.stringify(selectedEntity.mapObj)), selectedEntity.pos)
            }
        }
        if (selectedEntity)
        {
            if (!selectedEntity.mapObj.name) selectedEntity.mapObj.name = ""
            selectedEntity.mapObj.name = GUI.inputText("Name", selectedEntity.mapObj.name)
            if (!selectedEntity.mapObj.type) selectedEntity.mapObj.type = ""
            selectedEntity.type = GUI.inputText("Type", selectedEntity.mapObj.type)
            selectedEntity.pos = GUI.dragVector3("Position", selectedEntity.pos, 0.01)
            selectedEntity.mapObj.pos.x = selectedEntity.pos.x
            selectedEntity.mapObj.pos.y = selectedEntity.pos.y
            selectedEntity.mapObj.pos.z = selectedEntity.pos.z
            if (selectedEntity.angle != undefined)
            {
                selectedEntity.angle = GUI.dragNumber("Angle", selectedEntity.angle, 1)
                selectedEntity.mapObj.angle = selectedEntity.angle
            }
            if (selectedEntity.angleX != undefined)
            {
                selectedEntity.angleX = GUI.dragNumber("AngleX", selectedEntity.angleX, 1)
                selectedEntity.mapObj.angleX = selectedEntity.angleX
            }
            if (selectedEntity.mapObj.radius != undefined)
                selectedEntity.mapObj.radius = GUI.dragNumber("Radius", selectedEntity.mapObj.radius, 0.1)
            if (selectedEntity.mapObj.intensity != undefined)
                selectedEntity.mapObj.intensity = GUI.dragNumber("Intensity", selectedEntity.mapObj.intensity, 0.01)
            if (selectedEntity.mapObj.color)
                selectedEntity.mapObj.color = GUI.colorPickerRGBA("Color", selectedEntity.mapObj.color)
            if (selectedEntity.mapObj.flicker != undefined)
                selectedEntity.mapObj.flicker = Math.round(GUI.dragInt("Flickering", selectedEntity.mapObj.flicker, 1, 0, flickers.length - 1))
            if (selectedEntity.mapObj.model)
            {
                selectedEntity.mapObj.model = GUI.inputText("Model", selectedEntity.mapObj.model)
                selectedEntity.model = getModel(selectedEntity.mapObj.model)
            }
            if (selectedEntity.mapObj.texture)
            {
                selectedEntity.mapObj.texture = GUI.inputText("Texture", selectedEntity.mapObj.texture)
                selectedEntity.texture = getTexture(selectedEntity.mapObj.texture)
            }
            if (selectedEntity.mapObj.target)
            {
                selectedEntity.mapObj.target = GUI.inputText("Target", selectedEntity.mapObj.target)
            }
        }
    }
    GUI.end()
}
