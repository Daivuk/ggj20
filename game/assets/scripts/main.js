var DEBUG = true

var state = "game"
Input.setFpsMouse(true)

var res = Renderer.getResolution()
var screenRect = new Rect(0, 0, res.x, res.y)

loadResources()
loadMap()

function update(dt)
{
    res = Renderer.getResolution()
    screenRect = new Rect(0, 0, res.x, res.y)

    switch (state)
    {
        case "game":
            updateWorld(dt)
            if (Input.isJustDown(Key.ESCAPE))
            {
                state = "pause"
                Input.setFpsMouse(false)
            }
            if (Input.isJustDown(Key.F2))
            {
                state = "edit"
                Input.setFpsMouse(false)
                editCam.pos = new Vector3(player.pos)
                editCam.angle = player.angle
                editCam.angleX = player.angleX
            }
            break
        case "pause":
            if (Input.isJustDown(Key.ESCAPE))
            {
                state = "game"
                Input.setFpsMouse(true)
            }
            break
        case "edit":
            updateEdit(dt)
            if (Input.isJustDown(Key.ESCAPE))
            {
                state = "game"
                Input.setFpsMouse(true)
            }
            break
    }
}

function render()
{
    res = Renderer.getResolution()
    screenRect = new Rect(0, 0, res.x, res.y)

    switch (state)
    {
        case "game":
            renderWorld(player)
            break
        case "pause":
            renderWorld(player)
            SpriteBatch.begin()
            SpriteBatch.drawRect(null, screenRect, new Color(0, 0, 0, .5))
            SpriteBatch.end()
            break
        case "edit":
            renderWorld(editCam)
            break
    }
}

function renderUI()
{
    res = Renderer.getResolution()
    screenRect = new Rect(0, 0, res.x, res.y)

    switch (state)
    {
        case "edit":
            renderEditUI()
            break
    }
}
