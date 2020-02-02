var PLAYER_WALK_SPEED = 2
var PLAYER_RUN_SPEED = 4

var walkSnd = createSoundInstance("FootStep.wav")
walkSnd.setVolume(1.0)
walkSnd.setLoop(true)

function wrapAngle(n)
{
    return ((n % 360) + 360) % 360;
}

function toRad(a)
{
    return a * Math.PI / 180
}

function createEntity_player(entity)
{
    entity.update = player_update
    entity.pos.x = 2
    entity.pos.y = 4.5
    entity.pos.z = 1
    entity.angle = 180
    entity.angleX = 0
    entity.fov = 70
    entity.vel = new Vector3(0)
    entity.headOffset = new Vector3(0, 0, 0.5)
    entity.height = 0.73
    entity.size = 0.2
    entity.hoverObject = null
    entity.postDraw = player_postDraw
    entity.headBob = 0
    entity.items = []
    entity.mapObj = {}
    entity.mapObj.color = new Color(.5, 1, 1, 1);
    entity.mapObj.radius = 1
    entity.mapObj.flicker = 0
    entity.mapObj.intensity = 0
    omnis.push(entity)
}

function player_update(entity, dt)
{
    entity.angle = wrapAngle(entity.angle + Input.getMouseDelta().x * 0.3)
    entity.angleX -= Input.getMouseDelta().y * 0.3
    if (entity.angleX > 80) entity.angleX = 80
    if (entity.angleX < -80) entity.angleX = -80

    var dir = new Vector3(
        Math.sin(toRad(entity.angle)),
        Math.cos(toRad(entity.angle)), 0)
    var right = new Vector3(dir.y, -dir.x, 0)
    var maxSpeed = Input.isDown(Key.LEFT_SHIFT) ? PLAYER_RUN_SPEED : PLAYER_WALK_SPEED

    if (Input.isDown(Key.W))
    {
        entity.vel = entity.vel.add(dir.mul(dt * maxSpeed * 50))
    }
    if (Input.isDown(Key.S))
    {
        entity.vel = entity.vel.sub(dir.mul(dt * maxSpeed * 50))
    }
    if (Input.isDown(Key.D))
    {
        entity.vel = entity.vel.add(right.mul(dt * maxSpeed * 50))
    }
    if (Input.isDown(Key.A))
    {
        entity.vel = entity.vel.sub(right.mul(dt * maxSpeed * 50))
    }
    var velLen = entity.vel.length()
    if (velLen > maxSpeed)
    {
        if (!walkSnd.isPlaying())
            walkSnd.play()
        if (maxSpeed == PLAYER_WALK_SPEED)
            walkSnd.setPitch(1.0)
        else
            walkSnd.setPitch(1.20)
        entity.vel = entity.vel.normalize().mul(maxSpeed)
    }
    else
    {
        if (walkSnd.isPlaying())
            walkSnd.stop()
    }

    if (velLen > 0.1)
    {
        entity.headBob -= dt * 3
        while (entity.headBob < 0) entity.headBob += 1
        entity.headOffset = new Vector3(0, 0, 0.5 + Math.sin(toRad(entity.headBob * 180)) * 0.025)
    }

    // Collisions
    voxelCollision(entity, dt)

    // Put feet on floor (FREAKING HACKY, NO TIME TO FIX)
    voxel = null
    var voxel = getVoxelAt(entity.pos)
    var voxelUnder = getVoxelAt(entity.pos.add(new Vector3(0, 0, -.5)))
    var voxelAbove = getVoxelAt(entity.pos.add(new Vector3(0, 0, 1)))
    var zAbs = Math.floor(entity.pos.z)
    var zAbsUnder = Math.floor(entity.pos.z -.5)
    var onStairs = false
    if (voxelUnder)
    {
        if (voxelUnder.stairsLowY)
        {
            var yAbs = Math.floor(entity.pos.y)
            var yRem = entity.pos.y - yAbs
            entity.pos.z = zAbs - 1 + yRem / 2
            onStairs = true
        }
        else if (voxelUnder.stairsHiY)
        {
            var yAbs = Math.floor(entity.pos.y)
            var yRem = entity.pos.y - yAbs
            entity.pos.z = zAbs - 1 + yRem / 2 + 0.5
            onStairs = true
        }
        else if (voxelUnder.stairsLowNegY)
        {
            var yAbs = Math.floor(entity.pos.y)
            var yRem = 1 - (entity.pos.y - yAbs)
            entity.pos.z = zAbs - 1 + yRem / 2
            onStairs = true
        }
        else if (voxelUnder.stairsHiNegY)
        {
            var yAbs = Math.floor(entity.pos.y)
            var yRem = 1 - (entity.pos.y - yAbs)
            entity.pos.z = zAbs - 1 + yRem / 2 + 0.5
            onStairs = true
        }
    }
    if (voxelAbove)
    {
        if (voxelAbove.stairsLowY)
        {
            var yAbs = Math.floor(entity.pos.y)
            var yRem = entity.pos.y - yAbs
            entity.pos.z = zAbs + 1 + yRem / 2
            onStairs = true
        }
        else if (voxelAbove.stairsHiY)
        {
            var yAbs = Math.floor(entity.pos.y)
            var yRem = entity.pos.y - yAbs
            entity.pos.z = zAbs + 1 + yRem / 2 + 0.5
            onStairs = true
        }
        else if (voxelAbove.stairsLowNegY)
        {
            var yAbs = Math.floor(entity.pos.y)
            var yRem = 1 - (entity.pos.y - yAbs)
            entity.pos.z = zAbs + 1 + yRem / 2
            onStairs = true
        }
        else if (voxelAbove.stairsHiNegY)
        {
            var yAbs = Math.floor(entity.pos.y)
            var yRem = 1 - (entity.pos.y - yAbs)
            entity.pos.z = zAbs + 1 + yRem / 2 + 0.5
            onStairs = true
        }
    }
    if (voxel)
    {
        if (voxel.stairsLowY)
        {
            var yAbs = Math.floor(entity.pos.y)
            var yRem = entity.pos.y - yAbs
            entity.pos.z = zAbs + yRem / 2
            onStairs = true
        }
        else if (voxel.stairsHiY)
        {
            var yAbs = Math.floor(entity.pos.y)
            var yRem = entity.pos.y - yAbs
            entity.pos.z = zAbs + yRem / 2 + 0.5
            onStairs = true
        }
        else if (voxel.stairsLowNegY)
        {
            var yAbs = Math.floor(entity.pos.y)
            var yRem = 1 - (entity.pos.y - yAbs)
            entity.pos.z = zAbs + yRem / 2
            onStairs = true
        }
        else if (voxel.stairsHiNegY)
        {
            var yAbs = Math.floor(entity.pos.y)
            var yRem = 1 - (entity.pos.y - yAbs)
            entity.pos.z = zAbs + yRem / 2 + 0.5
            onStairs = true
        }
    }
    if (!onStairs && (!voxelUnder || voxelUnder.solid))
    {
        entity.pos.z = zAbsUnder + 1
    }

    entity.pos = entity.pos.add(entity.vel.mul(dt))
    entity.vel = entity.vel.mul(Math.max(0, 1 - dt * 10))

    // Mouse pick
    {
        entity.hoverObject = null
        var camFront = getEntityFront(entity)
        var camPos = getEntityCamPos(entity)
        var pick = map_rayPick(camPos, camFront, 1, 0.1, null)
        if (!pick) pick = map_rayPick(camPos, camFront, 2, 0.2, "ladder")
        if (pick)
        {
            if (pick.damage)
            {
                if (entity.item && entity.item.mapObj.target == "welder")
                    entity.hoverObject = pick
            }
            else if (pick.interract)
            {
                entity.hoverObject = pick
            }
        }
    }

    entity.mapObj.intensity = 0
    if (entity.hoverObject && Input.isJustDown(Key.MOUSE_1))
    {
        if (entity.hoverObject.damage)
        {
        }
        else if (entity.hoverObject.interract)
            entity.hoverObject.interract(entity.hoverObject, entity)
    }
    if (entity.hoverObject && Input.isDown(Key.MOUSE_1))
    {
        if (entity.hoverObject.damage)
        {
            if (entity.item && entity.item.mapObj.target == "welder")
            {
                entity.mapObj.intensity = Random.randNumber(1, 10)
                entity.weldSound = createSoundInstance("Welder.wav")
                entity.weldSound.setLoop(true)
                entity.weldSound.play()
                entity.hoverObject.damage = Math.max(0, entity.hoverObject.damage - dt / 4)
            }
        }
    }
    if (Input.isJustUp(Key.MOUSE_1))
    {
        if (entity.weldSound) entity.weldSound = null
    }
}

function player_drawItem(entity)
{
    if (entity.item)
    {
        // var mat = getEntityTransform(entity)
        var front = getEntityFront(entity)
        var right = front.cross(Vector3.UNIT_Z).normalize()
        var up = right.cross(front)
        var pos = getEntityCamPos(entity).add(front.mul(0.2)).add(right.mul(0.1)).add(up.mul(-0.15))
        // mat._41 += front.x
        // mat._42 += front.y
        // mat._43 += front.z
        var mat = Matrix.createWorld(pos, front, up)
        entity.item.inHandModel.render(mat)
    }
}

function player_postDraw(entity)
{
    if (entity.hoverObject)
    {
        Renderer.pushBlendMode(BlendMode.ALPHA)
        if (entity.hoverObject.model)
        {
            shaders.entityPS.setVector4("entityColor", new Vector4(1, 1, 0, 0.5))
            entity.hoverObject.model.render(getEntityTransform(entity.hoverObject));
        }
        Renderer.popBlendMode()
    }
}
