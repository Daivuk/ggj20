var shaders = {
    outsideSolidVS: getShader("outsideSolid.vs"),
    outsideSolidPS: getShader("outsideSolid.ps"),

    // gbuffer
    diffuseVS: getShader("diffuse.vs"),
    diffusePS: getShader("diffuse.ps"),
    normalVS: getShader("normal.vs"),
    normalPS: getShader("normal.ps"),
    depthVS: getShader("depth.vs"),
    depthPS: getShader("depth.ps"),

    // Lighting pass
    ambiantPS: getShader("ambiant.ps"),
    omniPS: getShader("omni.ps"),

    // Edit
    entityVS: getShader("entity.vs"),
    entityPS: getShader("entity.ps"),
}

var models = {
    entity: getModel("entity.model"),
}

function loadResources()
{
}
