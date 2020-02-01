input float3 inPosition;
input float3 inNormal;
input float4 inColor;
input float2 inTexCoord;

void main()
{
    oPosition = mul(float4(inPosition, 1.0), oViewProjection);
}
