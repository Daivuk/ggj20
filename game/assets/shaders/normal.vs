input float3 inPosition;
input float3 inNormal;
input float4 inColor;
input float2 inTexCoord;

output float3 outNormal;

void main()
{
    oPosition = mul(float4(inPosition, 1.0), oViewProjection);
    outNormal = normalize(mul(oModel, float4(inNormal, 0.0)).xyz);
}
