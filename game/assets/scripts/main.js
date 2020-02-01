var res = Renderer.getResolution()

loadResources()
loadMap()

function update(dt)
{
    res = Renderer.getResolution()
    updateWorld(dt)
}

function render()
{
    res = Renderer.getResolution()
    renderWorld()
}

function renderUI()
{
    res = Renderer.getResolution()
}
