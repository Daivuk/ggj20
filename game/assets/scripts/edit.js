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

    // if (tzmin > tmin)
    //     tmin = tzmin;

    // if (tzmax < tmax)
    //     tmax = tzmax;

    return true;
}

function map_rayPick(rayFrom, rayDir, maxDistance, extend, typeFilter)
{
    var d = maxDistance ? maxDistance : 1000 * 1000
    extend = extend ? extend : 0
    var prevDist = d * d; // Squared
    var ret = null;

    for (var i = 0; i < entities.length; ++i)
    {
        var entity = entities[i]
        if (entity.mapObj && entity.mapObj.unpickable) continue
        if (typeFilter && typeFilter != entity.mapObj.type) continue

        var bmin = new Vector3(-.05, -.05, -.05).add(entity.pos)
        var bmax = new Vector3(.05, .05, .05).add(entity.pos)
        getEntityBB(entity, bmin, bmax)
        bmin = bmin.sub(extend)
        bmax = bmax.add(extend)
        
        if (intersect(bmin, bmax, rayFrom, rayDir))
        {
            var dist = Vector3.distanceSquared(rayFrom, entity.pos)
            if (dist < prevDist)
            {
                var toEnt = entity.pos.sub(rayFrom)
                if (toEnt.dot(rayDir) > 0)
                {
                    prevDist = dist;
                    ret = entity;
                }
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
    
    var camFront = getEntityFront(editCam)
    Audio.set3DListener(editCam.pos, camFront, Vector3.UNIT_Z);

    {
        for (var i = 0; i < emiters.length; ++i)
        {
            var entity = emiters[i]
            entity.update(entity, dt)
        }

        smokes_update(camFront, dt)
    }

    // Mouse picking (View picking...)
    if (!GUI.wantCaptureMouse() && !GUI.wantCaptureKeyboard())
    {
        var camFront = getEntityFront(editCam)

        var mousePos = Input.getMousePos()
        var invTransform = transform.invert()
        var mouseScreenFrom = new Vector4(mousePos.x / res.x * 2 - 1, -(mousePos.y / res.y * 2 - 1), 0, 1)
        var mouseScreenTo = new Vector4(mouseScreenFrom.x, mouseScreenFrom.y, 1, 1)
        var from = mouseScreenFrom.transform(invTransform)
        var to = mouseScreenTo.transform(invTransform)
        var from3 = new Vector3(from.x / from.w, from.y / from.w, from.z / from.w)
        var to3 = new Vector3(to.x / to.w, to.y / to.w, to.z / to.w)

        hoverEntity = map_rayPick(from3, to3.sub(from3).normalize())

        if (hoverEntity && Input.isJustDown(Key.MOUSE_1))
        {
            selectedEntity = hoverEntity
        }
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
    Renderer.setDepthEnabled(true)

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

    if (GUI.begin("Voxel"))
    {
        var voxel = getVoxelAt(editCam.pos)
        if (voxel)
        {
            voxel.solid = GUI.checkbox("Solid", voxel.solid)

            voxel.stairsLowY = GUI.checkbox("Stairs Low +Y", voxel.stairsLowY)
            if (!voxel.stairsLowY) delete voxel.stairsLowY

            voxel.stairsHiY = GUI.checkbox("Stairs High +Y", voxel.stairsHiY)
            if (!voxel.stairsHiY) delete voxel.stairsHiY

            voxel.stairsLowNegY = GUI.checkbox("Stairs Low -Y", voxel.stairsLowNegY)
            if (!voxel.stairsLowNegY) delete voxel.stairsLowNegY

            voxel.stairsHiNegY = GUI.checkbox("Stairs High -Y", voxel.stairsHiNegY)
            if (!voxel.stairsHiNegY) delete voxel.stairsHiNegY
        }
    }
    GUI.end()

    if (GUI.begin("Settings"))
    {
        if (GUI.button("Mute Music"))
        {
            music.pause()
            wind.pause()
        }
    }
    GUI.end()

    if (GUI.begin("Inspector"))
    {
        if (GUI.button("Create spinner"))
            selectedEntity = createEntity({type:"spinner"}, editCam.pos.add(getEntityFront(editCam)))
        if (GUI.button("Create omni"))
            selectedEntity = createEntity({type:"omni"}, editCam.pos.add(getEntityFront(editCam)))
        if (GUI.button("Create projector"))
            selectedEntity = createEntity({type:"projector"}, editCam.pos.add(getEntityFront(editCam)))
        if (GUI.button("Create model"))
            selectedEntity = createEntity({type:"model"}, editCam.pos.add(getEntityFront(editCam)))
        if (GUI.button("Create door"))
            selectedEntity = createEntity({type:"door"}, editCam.pos.add(getEntityFront(editCam)))
        if (GUI.button("Create controlPanel"))
            selectedEntity = createEntity({type:"controlPanel"}, editCam.pos.add(getEntityFront(editCam)))
        if (GUI.button("Create computer"))
            selectedEntity = createEntity({type:"computer"}, editCam.pos.add(getEntityFront(editCam)))
        if (GUI.button("Create ladder"))
            selectedEntity = createEntity({type:"ladder"}, editCam.pos.add(getEntityFront(editCam)))
        if (GUI.button("Create emiter"))
            selectedEntity = createEntity({type:"emiter"}, editCam.pos.add(getEntityFront(editCam)))
        if (GUI.button("Create sound"))
            selectedEntity = createEntity({type:"sound"}, editCam.pos.add(getEntityFront(editCam)))
        if (GUI.button("Create item"))
            selectedEntity = createEntity({type:"item"}, editCam.pos.add(getEntityFront(editCam)))
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
            selectedEntity.mapObj.damage = GUI.sliderNumber("Damage", selectedEntity.mapObj.damage, 0, 1)
            selectedEntity.damage = GUI.sliderNumber("Damage", selectedEntity.damage, 0, 1)
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
            if (selectedEntity.mapObj.volume != undefined)
                selectedEntity.mapObj.volume = GUI.sliderNumber("Volume", selectedEntity.mapObj.volume, 0, 5)
            if (selectedEntity.mapObj.pitch != undefined)
                selectedEntity.mapObj.pitch = GUI.sliderNumber("Pitch", selectedEntity.mapObj.pitch, 0, 5)
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
            if (selectedEntity.mapObj.sound)
            {
                var prevSound = selectedEntity.mapObj.sound
                selectedEntity.mapObj.sound = GUI.inputText("Sound", selectedEntity.mapObj.sound)
                if (prevSound != selectedEntity.mapObj.sound)
                {
                    selectedEntity.sound = createSoundInstance(selectedEntity.mapObj.sound)
                    if (selectedEntity.sound)
                    {
                        selectedEntity.sound.set3D(true, selectedEntity.pos, selectedEntity.mapObj.radius)
                        selectedEntity.sound.setLoop(true)
                        selectedEntity.sound.play();
                    }
                }
            }
            if (selectedEntity.mapObj.texture)
            {
                selectedEntity.mapObj.texture = GUI.inputText("Texture", selectedEntity.mapObj.texture)
                selectedEntity.texture = getTexture(selectedEntity.mapObj.texture)
            }
            if (selectedEntity.mapObj.target != undefined)
            {
                selectedEntity.mapObj.target = GUI.inputText("Target", selectedEntity.mapObj.target)
            }

            if (selectedEntity.mapObj.duration != undefined)
                selectedEntity.mapObj.duration = GUI.dragNumber("Duration", selectedEntity.mapObj.duration, 0.1)
            if (selectedEntity.mapObj.speedF != undefined)
                selectedEntity.mapObj.speedF = GUI.dragNumber("Min Speed", selectedEntity.mapObj.speedF, 0.1)
            if (selectedEntity.mapObj.speedT != undefined)
                selectedEntity.mapObj.speedT = GUI.dragNumber("Max Speed", selectedEntity.mapObj.speedT, 0.1)
            if (selectedEntity.mapObj.sizeF != undefined)
                selectedEntity.mapObj.sizeF = GUI.dragNumber("Size Start", selectedEntity.mapObj.sizeF, 0.1)
            if (selectedEntity.mapObj.sizeT != undefined)
                selectedEntity.mapObj.sizeT = GUI.dragNumber("Size End", selectedEntity.mapObj.sizeT, 0.1)
            if (selectedEntity.mapObj.spawnAreaSize != undefined)
                selectedEntity.mapObj.spawnAreaSize = GUI.dragNumber("Spawn Area Size", selectedEntity.mapObj.spawnAreaSize, 0.1)
            if (selectedEntity.mapObj.spread != undefined)
                selectedEntity.mapObj.spread = GUI.dragNumber("Spread", selectedEntity.mapObj.radius, 0.1)
            if (selectedEntity.mapObj.freq != undefined)
                selectedEntity.mapObj.freq = GUI.dragNumber("Frequency", selectedEntity.mapObj.freq, 0.01)
        }
    }
    GUI.end()

    if (GUI.begin("Rendering"))
    {
        if (GUI.collapsingHeader("Game Settings"))
        {
            renderingSettings.aoEnabled = GUI.checkbox("Ambient Occlusion", renderingSettings.aoEnabled)
        }
        if (GUI.collapsingHeader("Debug Settings"))
        {
            debugSettings.gbuffer = GUI.checkbox("GBuffer", debugSettings.gbuffer)
            debugSettings.ao = GUI.checkbox("Ambient Occlusion", debugSettings.ao)
            GUI.indent()
                debugSettings.aoSamples = GUI.sliderNumber("Samples", debugSettings.aoSamples, 1, 64)
                debugSettings.aoScale = GUI.sliderNumber("Scale", debugSettings.aoScale, 0.01, 10)
                debugSettings.aoBias = GUI.sliderNumber("Bias", debugSettings.aoBias, 0.001, 1.0)
                debugSettings.aoRadius = GUI.sliderNumber("Radius", debugSettings.aoRadius, 0.001, 1)
                debugSettings.aoMaxDistance = GUI.sliderNumber("Max Distance", debugSettings.aoMaxDistance, 0.01, 1)
                debugSettings.aoIntensity = GUI.sliderNumber("Intensity", debugSettings.aoIntensity, 0.0, 10)
            GUI.unindent()
        }
    }
    GUI.end()
}
