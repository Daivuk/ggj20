var smokes = []

var SMOKE_TEXTURE = getTexture("smoke.png")
var SMOKE_VS = getShader("smoke.vs")
var SMOKE_PS = getShader("smoke.ps")

var SMOKE_SIZE = 1.5
var SMOKE_LIFE = 0.5

var shotsVB = null
var shotsVertCount = 0

var SHOT_VEL = 45
var SHOT_SIZE = 0.1
var SHOT_LIFE = 0.5

var vertBuffer = new Float32Array([
    -SHOT_SIZE / 2, 0,  SHOT_SIZE / 2, 0, 0,
    -SHOT_SIZE / 2, 0, -SHOT_SIZE / 2, 0, 1,
        SHOT_SIZE / 2, 0, -SHOT_SIZE / 2, 1, 1,
    -SHOT_SIZE / 2, 0,  SHOT_SIZE / 2, 0, 0,
        SHOT_SIZE / 2, 0, -SHOT_SIZE / 2, 1, 1,
        SHOT_SIZE / 2, 0,  SHOT_SIZE / 2, 1, 0,
])
shotsVB = VertexBuffer.createStatic(vertBuffer)
shotsVertCount = vertBuffer.length / 2

function smoke_create(position, vel, dur, sizeF, sizeT, color)
{
    var smoke = {
        position: new Vector3(position),
        world: new Matrix(),
        vel: vel,
        dur: dur,
        sizeF: sizeF,
        sizeT: sizeT,
        color: color,
        life: 0
    }

    smokes.push(smoke)
}

function smokes_update(camFront, dt)
{
    var len = smokes.length
    var camRight = camFront.cross(Vector3.UNIT_Z)
    var camUp = camRight.cross(camFront).normalize()
    var world = Matrix.createWorld(Vector3.ZERO, camFront, camUp)
    for (var i = 0; i < len; ++i)
    {
        var smoke = smokes[i]
        var lifef = smoke.life / smoke.dur
        var size = smoke.sizeF + (smoke.sizeT - smoke.sizeF) * lifef
        smoke.position = smoke.position.add(smoke.vel.mul(dt))
        smoke.world._11 = world._11 * size
        smoke.world._12 = world._12 * size
        smoke.world._13 = world._13 * size
        smoke.world._21 = world._21 * size
        smoke.world._22 = world._22 * size
        smoke.world._23 = world._23 * size
        smoke.world._31 = world._31 * size
        smoke.world._32 = world._32 * size
        smoke.world._33 = world._33 * size
        smoke.world._41 = smoke.position.x
        smoke.world._42 = smoke.position.y
        smoke.world._43 = smoke.position.z
        smoke.life += dt
        if (smoke.life >= smoke.dur)
        {
            smokes.splice(i, 1)
            --i
            len = smokes.length
        }
    }
}

function smokes_render()
{
    Renderer.setFilterMode(FilterMode.LINEAR)
    Renderer.setBackFaceCull(false)
    Renderer.setDepthEnabled(true)
    Renderer.setDepthWrite(false)
    Renderer.setPrimitiveMode(PrimitiveMode.TRIANGLE_LIST)
    Renderer.setVertexShader(SMOKE_VS)
    Renderer.setPixelShader(SMOKE_PS)
    Renderer.setBlendMode(BlendMode.ALPHA);
    Renderer.setTexture(SMOKE_TEXTURE, 0)

    var len = smokes.length
    for (var i = 0; i < len; ++i)
    {
        var smoke = smokes[i]
        var alpha = smoke.life / smoke.dur
        if (alpha < 0.5)
        {
            alpha = 1 - (1 - alpha) * (1 - alpha)
        }
        else
        {
            alpha *= alpha
            alpha = 1 - alpha
        }
        alpha *= 2
        SMOKE_PS.setVector4("color", smoke.color.toVector4().mul(alpha))
        Renderer.setWorld(smoke.world)
        Renderer.setVertexBuffer(shotsVB)
        Renderer.draw(shotsVertCount)
    }
}
