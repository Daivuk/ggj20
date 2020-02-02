var DEBUG = true

var state = "game"
Input.setFpsMouse(true)

var res = Renderer.getResolution()
var screenRect = new Rect(0, 0, res.x, res.y)
var font = getFont("font.fnt")

loadResources()
loadMap()

var music = playMusic("Theme1.ogg")
var wind = playMusic("WindLoop.ogg", true)
wind.setVolume(0.15)

function update(dt)
{
    res = Renderer.getResolution()
    screenRect = new Rect(0, 0, res.x, res.y)

    switch (state)
    {
        case "game":
            updateWorld(player, dt)
            if (Input.isJustDown(Key.ESCAPE))
            {
                state = "pause"
                Input.setFpsMouse(false)
            }
            if (DEBUG && Input.isJustDown(Key.F2))
            {
                state = "edit"
                Input.setFpsMouse(false)
                editCam.pos = getEntityCamPos(player)
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
            if (DEBUG)
            {
                SpriteBatch.begin()
                SpriteBatch.drawRect(null, new Rect(0, 0, 300, 20), new Color(0, 0, 0, .75))
                SpriteBatch.drawText(font, "Press F2 for edit mode", new Vector2(0, 10), Vector2.TOP_LEFT)
                SpriteBatch.end()
            }
            break
        case "pause":
            renderWorld(player)
            SpriteBatch.begin()
            SpriteBatch.drawRect(null, screenRect, new Color(0, 0, 0, .75))
            SpriteBatch.drawText(font, "PAUSED", res.div(2), Vector2.CENTER)
            SpriteBatch.end()
            break
        case "edit":
            renderWorld(editCam)
            renderEdit()
            if (DEBUG)
            {
                SpriteBatch.begin()
                SpriteBatch.drawRect(null, new Rect(0, 0, 300, 50), new Color(0, 0, 0, .75))
                SpriteBatch.drawText(font, "Middle mouse to move", new Vector2(0, 10), Vector2.TOP_LEFT)
                SpriteBatch.drawText(font, "Q to add solid", new Vector2(0, 20), Vector2.TOP_LEFT)
                SpriteBatch.drawText(font, "E to remove solid", new Vector2(0, 30), Vector2.TOP_LEFT)
                SpriteBatch.drawText(font, "Ctrl+S to save", new Vector2(0, 40), Vector2.TOP_LEFT)
                if (saveOverlay.isPlaying())
                {
                    SpriteBatch.drawRect(null, screenRect, saveOverlay.get())
                }
                SpriteBatch.end()
            }
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
