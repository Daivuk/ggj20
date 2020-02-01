var staticOutsideModel = null
var outsideDrawables = []
var updatables = []
var map = []

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
    }

    staticOutsideModel = Model.createFromBatch(outsideStaticEntities)
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

    cameraMenu.target = new Vector3(
        cameraMenu.pos.x + Math.sin(cameraMenu.angleZ * Math.PI / 180) * Math.cos(cameraMenu.angleX * Math.PI / 180),
        cameraMenu.pos.y + Math.cos(cameraMenu.angleZ * Math.PI / 180) * Math.cos(cameraMenu.angleX * Math.PI / 180),
        cameraMenu.pos.z + Math.sin(cameraMenu.angleX * Math.PI / 180)
    )
    Renderer.setupFor3D(cameraMenu.pos, cameraMenu.target, Vector3.UNIT_Z, cameraMenu.fov)
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
