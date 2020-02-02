input float3 inPosition;
input float3 inNormal;
input float4 inColor;
input float2 inTexCoord;

output float2 outTexCoord;

extern float offset;

void main()
{
    oPosition = mul(float4(inPosition, 1.0), oViewProjection);
    outTexCoord = inTexCoord;
    outTexCoord.x -= offset;
}
