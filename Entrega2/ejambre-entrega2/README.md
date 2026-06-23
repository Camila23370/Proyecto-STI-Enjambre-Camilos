# Enjambre — Entrega 2

**Integración: T1 + T2 + T4 + T5**

## Cómo ejecutar

```bash
# Opción A — Python
python -m http.server 8080
# Abrir: http://localhost:8080

# Opción B — Node (npx serve)
npx serve .

# Opción C — VS Code Live Server
# Click derecho → Open with Live Server
```

> ⚠️ **No abrir con `file://`** — los shaders requieren servidor HTTP por CORS.

---

## Requisitos cumplidos

| Requisito | Implementación |
|-----------|---------------|
| ≥ 100 agentes con InstancedMesh | ✅ Slider 50–500 agentes (default 100) |
| VAT / boneVAT (T5) | ✅ DataTexture RGBA Float32 (VERT×64 frames), vertex shader puro GPU |
| Shader avanzado T4 | ✅ Toon/Cel-shading con bandas cuantizadas + contorno back-face inflate |
| Shader adicional T4 | ✅ Vertex Wobble (deformación senoidal en tiempo) |
| Movimiento coherente | ✅ Movimiento orbital + alineación suave de velocidad (flocking parcial T2) |
| 30 FPS con 100 agentes | ✅ 1 draw call para todos los agentes (InstancedMesh) |
| FPS en pantalla | ✅ HUD con FPS, Draw Calls, Triángulos, Shader activo |

---

## Arquitectura técnica

### T5 — InstancedMesh + VAT
- **InstancedMesh**: todos los agentes = 1 sola draw call a la GPU.
- **VAT (Vertex Animation Texture)**: animación de caminar horneada en `DataTexture` `RGBA Float32` de dimensiones `VERT_COUNT × 64 frames`.  
  Cada texel guarda `(offsetX, offsetY, offsetZ, squash)`.  
  El vertex shader samplea con `gl_VertexID` y un `aTimeOffset` por instancia para desincronizar las animaciones.

### T4 — Toon Shader
- **Cel-shading**: cuantiza la difusa con `floor(diff * bands) / bands` → transiciones abruptas estilo anime.
- **Specular**: mancha especular discreta con `step()`.
- **Contorno (Outline)**: segundo `InstancedMesh` con `side: BackSide` que infla los vértices por la normal (`back-face inflate`).

### T4 — Vertex Wobble
- Deformación senoidal `A·sin(freq·pos.y − speed·time)` aplicada en el vertex shader sobre la posición animada por VAT.

### T1 + T2 — Enjambre
- Cada agente tiene posición orbital + alineación de velocidad promedio (cohesión suave).
- Movimiento determinístico: `sin/cos` con phase offset individual → fácil de escalar a miles.

---

## Controles

| Control | Descripción |
|---------|-------------|
| **Agentes** | Slider 50–500; reconstruye el InstancedMesh |
| **Shader** | Toon / Vertex Wobble / Normal debug |
| **Bandas Toon** | Cuantización de luz (2–8 bandas) |
| **Grosor contorno** | Inflado de normales para outline |
| **Amplitud wobble** | Intensidad de la deformación senoidal |
| **Velocidad swarm** | Multiplicador de velocidad del enjambre |
| **VAT frames** | Velocidad de reproducción de la animación horneada |
| **Contorno** | Toggle del outline oscuro |
| **Cámara orbital** | Activa/desactiva rotación automática |
