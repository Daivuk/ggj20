Texture0 texWeight;

input float3 inPosition;
input float3 inNormal;
input float4 inColor;
input float2 inTexCoord;

output float3 outNormal;
output float2 outTexCoord;
output float outDistance;

extern float3 camPos;
extern float anim;

void main()
{
    float offset = sin(anim + inPosition.x) * texWeight(inTexCoord).r * 0.25;
    oPosition = mul(float4(inPosition.x, inPosition.y, inPosition.z + offset, 1.0), oViewProjection);
    outNormal = normalize(mul(oModel, float4(inNormal, 0.0)).xyz);
    float3 worldPos = mul(oModel, float4(inPosition, 1.0)).xyz;
    outDistance = distance(worldPos, camPos);
    outTexCoord = inTexCoord;
}
