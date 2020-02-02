var shaders = {
    outsideSolidVS: getShader("outsideSolid.vs"),
    outsideSolidPS: getShader("outsideSolid.ps"),
    flagsVS: getShader("flags.vs"),
    flagsPS: getShader("flags.ps"),
    windowsVS: getShader("windows.vs"),
    windowsPS: getShader("windows.ps"),
    blowVS: getShader("blow.vs"),
    blowPS: getShader("blow.ps"),

    // gbuffer
    diffuseVS: getShader("diffuse.vs"),
    diffusePS: getShader("diffuse.ps"),
    normalVS: getShader("normal.vs"),
    normalPS: getShader("normal.ps"),
    depthVS: getShader("depth.vs"),
    depthPS: getShader("depth.ps"),
    depthOnlyVS: getShader("depthOnly.vs"),
    depthOnlyPS: getShader("depthOnly.ps"),

    // Lighting pass
    ambiantPS: getShader("ambiant.ps"),
    omniPS: getShader("omni.ps"),
    projectorPS: getShader("projector.ps"),

    // Edit
    entityVS: getShader("entity.vs"),
    entityPS: getShader("entity.ps"),
}

var models = {
    entity: getModel("entity.model"),
    windows: getModel("windows.model"),
    blow: getModel("blow.model"),
    flags: getModel("flags.model"),
    hangar: getModel("hangar.model"),
}

function loadResources()
{
}
