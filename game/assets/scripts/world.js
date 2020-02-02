var staticOutsideModel = null
var staticInsideModel = null
var outsideDrawables = []
var insideDrawables = []
var updatables = []
var editDrawables = []
var postDrawables = []
var map = []
var entities = []
var player = null
var showGBuffer = false
var omnis = []
var projectors = []
var saveOverlay = new ColorAnim(Color.TRANSPARENT)
var outsideStaticEntities = []
var insideStaticEntities = []
var interractables = []
var collisionEntities = []
var blowAnim = new NumberAnim()
blowAnim.playSingle(0, 1, 1, Tween.LINEAR, Loop.LOOP)

var cameraMenu = {
    pos: new Vector3(30.37, -18.681, 3.8761),
    angleX: 87.6 - 90,
    angleZ: 67.2 + 180 + 45,
    fov: 40
}

function getEntityBB(entity, out_bmin, out_bmax)
{
    if (!entity.model) return
    var T = getEntityTransform(entity)
    var bmin = entity.model.getMin()
    var bmax = entity.model.getMax()

    // Recalculate bounding box
    var pts = [
        new Vector4( bmin.x, bmin.y, bmin.z, 1.0),
        new Vector4( bmax.x, bmin.y, bmin.z, 1.0),
        new Vector4( bmin.x, bmax.y, bmin.z, 1.0),
        new Vector4( bmax.x, bmax.y, bmin.z, 1.0),
        new Vector4( bmin.x, bmin.y, bmax.z, 1.0),
        new Vector4( bmax.x, bmin.y, bmax.z, 1.0),
        new Vector4( bmin.x, bmax.y, bmax.z, 1.0),
        new Vector4( bmax.x, bmax.y, bmax.z, 1.0)
    ]
    var pts2 = [null, null, null, null, null, null, null, null]
    for (var i = 0; i < 8; ++i)
    {
        pts2[i] = pts[i].transform(T)
    }
    bmax.x = bmin.x = pts2[0].x;
    bmax.y = bmin.y = pts2[0].y;
    bmax.z = bmin.z = pts2[0].z;
    for (var i = 1; i < 8; ++i)
    {
        out_bmin.x = Math.min(pts2[i].x, bmin.x);
        out_bmin.y = Math.min(pts2[i].y, bmin.y);
        out_bmin.z = Math.min(pts2[i].z, bmin.z);
        out_bmax.x = Math.max(pts2[i].x, bmax.x);
        out_bmax.y = Math.max(pts2[i].y, bmax.y);
        out_bmax.z = Math.max(pts2[i].z, bmax.z);
    }
}

function getEntityTransform(entity)
{
    var angleX = entity.angleX ? entity.angleX : 0
    var angle = entity.angle ? entity.angle : 0
    return Matrix.createRotationX(angleX).mul(Matrix.createRotationZ(angle)).mul(Matrix.createTranslation(entity.pos))
}

function findEntity(name)
{
    for (var i = 0; i < entities.length; ++i)
    {
        var entity = entities[i]
        if (entity.mapObj && entity.mapObj.name == name) return entity
    }
    return null
}

function getEntityFront(entity)
{
    var angleX = entity.angleX ? entity.angleX : 0
    return new Vector3(
        Math.sin(entity.angle * Math.PI / 180) * Math.cos(angleX * Math.PI / 180),
        Math.cos(entity.angle * Math.PI / 180) * Math.cos(angleX * Math.PI / 180),
        Math.sin(angleX * Math.PI / 180)
    )
}

function getEntityCamPos(entity)
{
    var headOffset = entity.headOffset ? entity.headOffset : Vector3.ZERO
    return entity.pos.add(headOffset)
}

function saveMap()
{
    var writer = new BinaryFileWriter("map.json")
    writer.writeString(JSON.stringify(map, null, 2))
    writer = null
    saveOverlay.playSingle(Color.WHITE, Color.TRANSPARENT, 0.2)
}

function removeFromArray(arr, item)
{
    var i = arr.indexOf(item)
    if (i != -1) arr.splice(i, 1)
}

function deleteEntity(entity)
{
    removeFromArray(entities, entity)
    removeFromArray(outsideDrawables, entity)
    removeFromArray(insideDrawables, entity)
    removeFromArray(updatables, entity)
    removeFromArray(editDrawables, entity)
    removeFromArray(postDrawables, entity)
    removeFromArray(collisionEntities, entity)
    removeFromArray(omnis, entity)
    removeFromArray(projectors, entity)
    removeFromArray(map.entities, entity.mapObj)
}

function createEntity(mapObj, pos)
{
    var entity = {
        mapObj: mapObj,
        pos: new Vector3(pos)
    }

    mapObj.pos = {x: pos.x, y: pos.y, z: pos.z}
    if (mapObj.angle) entity.angle = mapObj.angle
    if (mapObj.angleX) entity.angleX = mapObj.angleX

    switch (mapObj.type)
    {
        case "spinner":
            createEntity_spinner(entity)
            break
        case "omni":
            createEntity_omni(entity)
            break
        case "projector":
            createEntity_projector(entity)
            break
        case "model":
            createEntity_model(entity)
            break
        case "door":
            createEntity_door(entity)
            break
        case "controlPanel":
            createEntity_controlPanel(entity)
            break
    }

    if (entity.update) updatables.push(entity)
    if (entity.interract) interractables.push(entity)
    if (entity.postDraw) postDrawables.push(entity)
    if (entity.collision) collisionEntities.push(entity)

    entities.push(entity)
    if (mapObj.model)
    {
        if (mapObj.outside)
        {
            if (mapObj.static)
            {
                outsideStaticEntities.push({
                    model: entity.model,
                    transform: getEntityTransform(entity)
                })
            }
            else outsideDrawables.push(entity)
        }
        else
        {
            if (mapObj.static)
            {
                insideStaticEntities.push({
                    model: entity.model,
                    transform: getEntityTransform(entity)
                })
            }
            else insideDrawables.push(entity)
        }
    }
    else
    {
        editDrawables.push(entity)
    }

    if (map.entities.indexOf(mapObj) == -1)
        map.entities.push(mapObj)

    return entity
}

function loadMap()
{
    var reader = new BinaryFileReader("map.json")
    map = JSON.parse(reader.readString())
    reader = null

    for (var i = 0; i < map.entities.length; ++i)
    {
        var mapObj = map.entities[i]
        createEntity(mapObj, new Vector3(mapObj.pos.x, mapObj.pos.y, mapObj.pos.z))
    }

    staticOutsideModel = Model.createFromBatch(outsideStaticEntities)
    staticInsideModel = Model.createFromBatch(insideStaticEntities)

    // Add our character
    {
        var entity = {
            pos: new Vector3(0, 0, 0),
            angle: 0
        }
        createEntity_player(entity)
        updatables.push(entity)
        postDrawables.push(entity)
        player = entity
    }
}

function updateWorld(dt)
{
    for (var i = 0; i < updatables.length; ++i)
    {
        var entity = updatables[i]
        entity.update(entity, dt)
    }

    if (Input.isJustDown(Key.F1)) showGBuffer = !showGBuffer
}

function renderWorld(cam)
{
    var clearColor = Color.fromHexRGB(0xadbccd)
    Renderer.clear(clearColor)
    Renderer.clearDepth()

    // Setup camera
    var camFront = getEntityFront(cam)
    var camPos = getEntityCamPos(cam)
    Renderer.setupFor3D(camPos, camPos.add(camFront), Vector3.UNIT_Z, cam.fov)

    // Draw deferred crap first


    // Draw inside solids into the gbuffer
    {
        Renderer.pushRenderTarget(gbuffer.depth)
        Renderer.clear(Color.BLACK)
        Renderer.clearDepth()
        Renderer.setVertexShader(shaders.depthVS)
        Renderer.setPixelShader(shaders.depthPS)
        staticInsideModel.render();
        for (var i = 0; i < insideDrawables.length; ++i)
        {
            var entity = insideDrawables[i]
            if (!entity.model) continue
            entity.model.render(getEntityTransform(entity))
        }
        Renderer.popRenderTarget()
    }
    {
        Renderer.pushRenderTarget(gbuffer.diffuse)
        Renderer.clear(Color.TRANSPARENT)
        Renderer.clearDepth()
        Renderer.setVertexShader(shaders.diffuseVS)
        Renderer.setPixelShader(shaders.diffusePS)
        staticInsideModel.render();
        for (var i = 0; i < insideDrawables.length; ++i)
        {
            var entity = insideDrawables[i]
            if (!entity.model) continue
            entity.model.render(getEntityTransform(entity))
        }
        Renderer.popRenderTarget()
    }
    {
        Renderer.pushRenderTarget(gbuffer.normal)
        Renderer.clearDepth()
        Renderer.setVertexShader(shaders.normalVS)
        Renderer.setPixelShader(shaders.normalPS)
        staticInsideModel.render();
        for (var i = 0; i < insideDrawables.length; ++i)
        {
            var entity = insideDrawables[i]
            if (!entity.model) continue
            entity.model.render(getEntityTransform(entity))
        }
        Renderer.popRenderTarget()
    }

    // Draw outside solids
    {
        Renderer.setBlendMode(BlendMode.OPAQUE)
        Renderer.setVertexShader(shaders.outsideSolidVS)
        Renderer.setPixelShader(shaders.outsideSolidPS)
        shaders.outsideSolidPS.setVector3("skyColor", clearColor.toVector3())
        staticOutsideModel.render();
        for (var i = 0; i < outsideDrawables.length; ++i)
        {
            var entity = outsideDrawables[i]
            if (!entity.model) continue
            entity.model.render(getEntityTransform(entity))
        }
    }

    // Blow
    {
        Renderer.setDepthEnabled(false)
        Renderer.setBlendMode(BlendMode.ALPHA)
        Renderer.setVertexShader(shaders.blowVS)
        Renderer.setPixelShader(shaders.blowPS)
        shaders.blowVS.setNumber("offset", blowAnim.get())
        models.blow.render();
        Renderer.setDepthEnabled(true)
    }

    // Draw the interior meshes into buffer only
    {
        Renderer.setVertexShader(shaders.depthOnlyVS)
        Renderer.setPixelShader(shaders.depthOnlyPS)
        Renderer.setBlendMode(BlendMode.ALPHA)
        staticInsideModel.render();
        for (var i = 0; i < insideDrawables.length; ++i)
        {
            var entity = insideDrawables[i]
            if (!entity.model) continue
            entity.model.render(getEntityTransform(entity))
        }
    }

    // First, draw the ambiant
    {
        SpriteBatch.begin(Matrix.IDENTITY, shaders.ambiantPS)
        Renderer.setBlendMode(BlendMode.ALPHA)
        SpriteBatch.drawRect(gbuffer.diffuse, screenRect)
        SpriteBatch.end()
    }

    // Draw omni lights (This is extremely ineficient, but if it runs for the jam, gg?)
    {
        for (var i = 0; i < omnis.length; ++i)
        {
            SpriteBatch.begin(Matrix.IDENTITY, shaders.omniPS)
            Renderer.setTexture(gbuffer.normal, 1)
            Renderer.setTexture(gbuffer.depth, 2)
            Renderer.setBlendMode(BlendMode.ADD)
            var entity = omnis[i]
            shaders.omniPS.setVector3("lPos", entity.pos)
            shaders.omniPS.setVector4("lColor", new Vector4(
                entity.mapObj.color.r, entity.mapObj.color.g, entity.mapObj.color.b,
                entity.mapObj.intensity * flickers[entity.mapObj.flicker].get()))
            shaders.omniPS.setNumber("lRadius", entity.mapObj.radius)
            SpriteBatch.drawRect(gbuffer.diffuse, screenRect)
            SpriteBatch.end()
        }
        Renderer.setBlendMode(BlendMode.ALPHA)
    }

    // Projector lights
    {
        for (var i = 0; i < projectors.length; ++i)
        {
            var entity = projectors[i]
            SpriteBatch.begin(Matrix.IDENTITY, shaders.projectorPS)
            Renderer.setTexture(gbuffer.normal, 1)
            Renderer.setTexture(gbuffer.depth, 2)
            Renderer.setTexture(entity.texture, 3)
            Renderer.setBlendMode(BlendMode.ADD)
            shaders.projectorPS.setVector3("lPos", entity.pos)
            shaders.projectorPS.setVector3("lColor", new Vector3(entity.mapObj.color.r, entity.mapObj.color.g, entity.mapObj.color.b).mul(flickers[entity.mapObj.flicker].get()))
            shaders.projectorPS.setNumber("lRadius", entity.mapObj.radius)
            shaders.projectorPS.setMatrix("transform", getEntityTransform(entity))
            SpriteBatch.drawRect(gbuffer.diffuse, screenRect)
            SpriteBatch.end()
        }
        Renderer.setTexture(null, 1)
        Renderer.setTexture(null, 2)
        Renderer.setTexture(null, 3)
        Renderer.setBlendMode(BlendMode.ALPHA)
    }

    // Post draw stuff
    {
        // Setup camera
        Renderer.setupFor3D(camPos, camPos.add(camFront), Vector3.UNIT_Z, cam.fov)
        Renderer.setVertexShader(shaders.windowsVS)
        Renderer.setPixelShader(shaders.windowsPS)
        Renderer.setBlendMode(BlendMode.ALPHA)
        models.windows.render()

        Renderer.setDepthEnabled(false)
        Renderer.setVertexShader(shaders.entityVS)
        Renderer.setPixelShader(shaders.entityPS)
        Renderer.setBlendMode(BlendMode.ALPHA)
        for (var i = 0; i < postDrawables.length; ++i)
        {
            var entity = postDrawables[i]
            entity.postDraw(entity)
        }
    }

    if (showGBuffer)
    {
        SpriteBatch.begin()
        SpriteBatch.drawRect(gbuffer.diffuse, new Rect(0, 0, res.x / 2, res.y / 2))
        SpriteBatch.drawRect(gbuffer.normal, new Rect(res.x / 2, 0, res.x / 2, res.y / 2))
        SpriteBatch.drawRect(gbuffer.depth, new Rect(0, res.y / 2, res.x / 2, res.y / 2))
        SpriteBatch.end()
    }
}
