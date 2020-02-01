var staticOutsideModel = null
var staticInsideModel = null
var outsideDrawables = []
var insideDrawables = []
var updatables = []
var map = []
var player = null

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

function loadMap()
{
    var reader = new BinaryFileReader("map.json")
    map = JSON.parse(reader.readString())
    reader = null

    var outsideStaticEntities = []
    var insideStaticEntities = []

    for (var i = 0; i < map.length; ++i)
    {
        var mapObj = map[i]
        var entity = {
            mapObj: mapObj,
            pos: new Vector3(mapObj.pos.x, mapObj.pos.y, mapObj.pos.z),
            angle: mapObj.angle
        }

        if (mapObj.model) entity.model = getModel(mapObj.model)

        switch (mapObj.type)
        {
            case "spinner": createEntity_spinner(entity); break;
        }

        if (entity.update) updatables.push(entity)
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
}

function renderWorld()
{
    var clearColor = Color.fromHexRGB(0xadbccd)
    Renderer.clear(clearColor)
    Renderer.clearDepth()

    // Setup camera
    var cam = player
    cam.target = new Vector3(
        cam.pos.x + Math.sin(cam.angle * Math.PI / 180) * Math.cos(cam.angleX * Math.PI / 180),
        cam.pos.y + Math.cos(cam.angle * Math.PI / 180) * Math.cos(cam.angleX * Math.PI / 180),
        cam.pos.z + Math.sin(cam.angleX * Math.PI / 180)
    )
    Renderer.setupFor3D(cam.pos, cam.target, Vector3.UNIT_Z, cam.fov)

    // Draw outside solids
    Renderer.setVertexShader(shaders.outsideSolidVS)
    Renderer.setPixelShader(shaders.outsideSolidPS)
    shaders.outsideSolidPS.setVector3("skyColor", clearColor.toVector3())
    staticOutsideModel.render();
    for (var i = 0; i < outsideDrawables.length; ++i)
    {
        var entity = outsideDrawables[i]
        entity.model.render(getEntityTransform(entity))
    }

    // Draw inside solids
    Renderer.setVertexShader(shaders.insideSolidVS)
    Renderer.setPixelShader(shaders.insideSolidPS)
    staticInsideModel.render();
    for (var i = 0; i < insideDrawables.length; ++i)
    {
        var entity = insideDrawables[i]
        entity.model.render(getEntityTransform(entity))
    }
}
