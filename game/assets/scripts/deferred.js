var gbuffer = {
    diffuse: Texture.createScreenRenderTarget(),
    normal: Texture.createScreenRenderTarget(),
    depth: Texture.createScreenRenderTarget(RenderTargetFormat.R32),
    ao: Texture.createScreenRenderTarget()
}
