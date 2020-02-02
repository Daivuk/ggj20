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
    if (!voxel || voxel.solid) return true
    for (var i = 0; i < collisionEntities.length; ++i)
    {
        var entity = collisionEntities[i]
        if (entity.model)
        {
            var bmin = new Vector3(0)
            var bmax = new Vector3(0)
            getEntityBB(entity, bmin, bmax)

            if (pos.x >= bmin.x && pos.y >= bmin.y && pos.z >= bmin.z &&
                pos.x <= bmax.x && pos.y <= bmax.y && pos.z <= bmax.z)
            {
                return true
            }
        }
    }
    return false
}

function setSolidAt(pos, solid)
{
    getOrCreateVoxelAt(pos).solid = solid
}

function voxelCollision(entity, dt)
{
    var height = entity.height ? entity.height : entity.size
    //var feet = 0.3

    // X
   /* if (getSolidAt(new Vector3(entity.pos.x + entity.vel.x * dt - entity.size, entity.pos.y - entity.size, entity.pos.z + feet)))
    {
        entity.vel.x = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x + entity.vel.x * dt - entity.size, entity.pos.y + entity.size, entity.pos.z + feet)))
    {
        entity.vel.x = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x + entity.vel.x * dt + entity.size, entity.pos.y + entity.size, entity.pos.z + feet)))
    {
        entity.vel.x = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x + entity.vel.x * dt + entity.size, entity.pos.y - entity.size, entity.pos.z + feet)))
    {
        entity.vel.x = 0
    }
    else*/ if (getSolidAt(new Vector3(entity.pos.x + entity.vel.x * dt - entity.size, entity.pos.y - entity.size, entity.pos.z + height)))
    {
        entity.vel.x = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x + entity.vel.x * dt - entity.size, entity.pos.y + entity.size, entity.pos.z + height)))
    {
        entity.vel.x = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x + entity.vel.x * dt + entity.size, entity.pos.y + entity.size, entity.pos.z + height)))
    {
        entity.vel.x = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x + entity.vel.x * dt + entity.size, entity.pos.y - entity.size, entity.pos.z + height)))
    {
        entity.vel.x = 0
    }

    // Y
  /*  if (getSolidAt(new Vector3(entity.pos.x - entity.size, entity.pos.y + entity.vel.y * dt - entity.size, entity.pos.z + feet)))
    {
        entity.vel.y = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x - entity.size, entity.pos.y + entity.vel.y * dt + entity.size, entity.pos.z + feet)))
    {
        entity.vel.y = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x + entity.size, entity.pos.y + entity.vel.y * dt + entity.size, entity.pos.z + feet)))
    {
        entity.vel.y = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x + entity.size, entity.pos.y + entity.vel.y * dt - entity.size, entity.pos.z + feet)))
    {
        entity.vel.y = 0
    }
    else*/ if (getSolidAt(new Vector3(entity.pos.x - entity.size, entity.pos.y + entity.vel.y * dt - entity.size, entity.pos.z + height)))
    {
        entity.vel.y = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x - entity.size, entity.pos.y + entity.vel.y * dt + entity.size, entity.pos.z + height)))
    {
        entity.vel.y = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x + entity.size, entity.pos.y + entity.vel.y * dt + entity.size, entity.pos.z + height)))
    {
        entity.vel.y = 0
    }
    else if (getSolidAt(new Vector3(entity.pos.x + entity.size, entity.pos.y + entity.vel.y * dt - entity.size, entity.pos.z + height)))
    {
        entity.vel.y = 0
    }

    // if (getSolidAt(new Vector3(vel.x * dt, 0, 0)))
    // {
    //     vel.x = 0
    // }
}
