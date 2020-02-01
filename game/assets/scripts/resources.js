var shaders = {
    outsideSolidVS: getShader("outsideSolid.vs"),
    outsideSolidPS: getShader("outsideSolid.ps"),
    insideSolidVS: getShader("insideSolid.vs"),
    insideSolidPS: getShader("insideSolid.ps"),

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
}

function loadResources()
{
}
