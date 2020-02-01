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
