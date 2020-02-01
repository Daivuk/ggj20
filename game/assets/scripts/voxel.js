function getVoxelId(pos)
{
    return Math.floor(pos.x) + "." + Math.floor(pos.y) + "." + Math.floor(pos.z)
}

function getVoxelAt(pos)
{
    var enc = getVoxelId(pos)
    if (map.voxels.hasOwnProperty(enc)) return map.voxels[enc]
    return null
}

function getOrCreateVoxelAt(pos)
{
    var enc = getVoxelId(pos)
    if (map.voxels.hasOwnProperty(enc))
    {
        return map.voxels[enc]
    }
    else
    {
        var voxel = {
            solid: true
        }
        map.voxels[enc] = voxel
        return voxel
    }
}

function getSolidAt(pos)
{
    var voxel = getVoxelAt(pos)
    if (!voxel) return true
    return voxel.solid
}

function setSolidAt(pos, solid)
{
    getOrCreateVoxelAt(pos).solid = solid
}

function voxelCollision(entity, dt)
{
    // X
    if (getSolidAt(new Vector3(entity.pos.x + entity.vel.x * dt - entity.size, entity.pos.y - entity.size, entity.pos.z)))
    {
        entity.vel.x = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x + entity.vel.x * dt - entity.size, entity.pos.y + entity.size, entity.pos.z)))
    {
        entity.vel.x = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x + entity.vel.x * dt + entity.size, entity.pos.y + entity.size, entity.pos.z)))
    {
        entity.vel.x = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x + entity.vel.x * dt + entity.size, entity.pos.y - entity.size, entity.pos.z)))
    {
        entity.vel.x = 0
    }

    // Y
    if (getSolidAt(new Vector3(entity.pos.x - entity.size, entity.pos.y + entity.vel.y * dt - entity.size, entity.pos.z)))
    {
        entity.vel.y = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x - entity.size, entity.pos.y + entity.vel.y * dt + entity.size, entity.pos.z)))
    {
        entity.vel.y = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x + entity.size, entity.pos.y + entity.vel.y * dt + entity.size, entity.pos.z)))
    {
        entity.vel.y = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x + entity.size, entity.pos.y + entity.vel.y * dt - entity.size, entity.pos.z)))
    {
        entity.vel.y = 0
    }

    // if (getSolidAt(new Vector3(vel.x * dt, 0, 0)))
    // {
    //     vel.x = 0
    // }
}
