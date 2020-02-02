input float3 inPosition;
input float3 inNormal;
input float4 inColor;
input float2 inTexCoord;

output float2 outTexCoord;
output float3 outWorldPos;

void main()
{
    oPosition = mul(float4(inPosition, 1.0), oViewProjection);
    outWorldPos = mul(oModel, float4(inPosition, 1.0)).xyz;
    outTexCoord = inTexCoord;
}
