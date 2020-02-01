var staticOutsideModel = null
var staticInsideModel = null
var outsideDrawables = []
var insideDrawables = []
var updatables = []
var editDrawables = []
var map = []
var player = null
var showGBuffer = false
var omnis = []
var saveOverlay = new ColorAnim(Color.TRANSPARENT)

var cameraMenu = {
    pos: new Vector3(30.37, -18.681, 3.8761),
    angleX: 87.6 - 90,
    angleZ: 67.2 + 180 + 45,
    fov: 40
}

function getEntityTransform(entity)
{
    return Matrix.createRotationZ(entity.angle).mul(Matrix.createTranslation(entity.pos))
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

function loadMap()
{
    var reader = new BinaryFileReader("map.json")
    map = JSON.parse(reader.readString())
    reader = null

    var outsideStaticEntities = []
    var insideStaticEntities = []

    for (var i = 0; i < map.entities.length; ++i)
    {
        var mapObj = map.entities[i]
        var entity = {
            mapObj: mapObj,
            pos: new Vector3(mapObj.pos.x, mapObj.pos.y, mapObj.pos.z),
            angle: mapObj.angle
        }

        if (mapObj.model) entity.model = getModel(mapObj.model)

        switch (mapObj.type)
        {
            case "spinner": createEntity_spinner(entity); break;
            case "omni": omnis.push(entity); break;
        }

        if (entity.update) updatables.push(entity)

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
            entity.model.render(getEntityTransform(entity))
        }
    }

    // Draw inside solids into the gbuffer
    {
        Renderer.pushRenderTarget(gbuffer.depth)
        Renderer.setVertexShader(shaders.depthVS)
        Renderer.setPixelShader(shaders.depthPS)
        staticInsideModel.render();
        for (var i = 0; i < insideDrawables.length; ++i)
        {
            var entity = insideDrawables[i]
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
            entity.model.render(getEntityTransform(entity))
        }
        Renderer.popRenderTarget()
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
        Renderer.setTexture(null, 1) // This fixes a bug in Onut...
        Renderer.setTexture(null, 2)
        SpriteBatch.begin(Matrix.IDENTITY, shaders.omniPS)
        Renderer.setTexture(gbuffer.normal, 1)
        Renderer.setTexture(gbuffer.depth, 2)
        Renderer.setBlendMode(BlendMode.ADD)
        Renderer.setFilterMode(FilterMode.LINEAR)
        for (var i = 0; i < omnis.length; ++i)
        {
            var entity = omnis[i]
            shaders.omniPS.setVector3("lPos", entity.pos)
            shaders.omniPS.setVector3("lColor", new Vector3(entity.mapObj.color.r, entity.mapObj.color.g, entity.mapObj.color.b))
            shaders.omniPS.setNumber("lRadius", entity.mapObj.radius)
            SpriteBatch.drawRect(gbuffer.diffuse, screenRect)
        }
        SpriteBatch.end()
        Renderer.setTexture(null, 1)
        Renderer.setTexture(null, 2)
        Renderer.setBlendMode(BlendMode.ALPHA)
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
