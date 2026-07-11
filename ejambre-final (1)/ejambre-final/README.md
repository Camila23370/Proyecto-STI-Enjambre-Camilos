# ENJAMBRE — Proyecto Final

**Integración completa: T1 + T2 + T4 + T5 + T6**

Sistema de enjambre con comportamiento **Boids real** (separación, alineación y cohesión con *spatial hashing*), render eficiente con **InstancedMesh + VAT**, y **shaders propios** (Toon/Cel-shading, Vertex Wobble, contorno) sobre una escena con iluminación coherente.

## Cómo ejecutar

```bash
# Opción A — Python
python -m http.server 8080
# Abrir: http://localhost:8080

# Opción B — Node (npx serve)
npx serve .

# Opción C — VS Code Live Server
# Click derecho sobre index.html → Open with Live Server
```

> ⚠️ **No abrir con `file://`** — los shaders y el DataTexture requieren servidor HTTP (CORS/WebGL2).

Todo vive en un único `index.html` autocontenido: no requiere `npm install` ni build step.

---

## Requisitos cumplidos

| Requisito | Implementación |
|---|---|
| Separación + alineación + cohesión funcionando | ✅ Boids real (T6), no solo alineación de velocidad promedio |
| 200 agentes simultáneos | ✅ Default 200, slider 50–500 |
| Parámetros ajustables en tiempo real (pesos, radio de percepción) | ✅ Sliders de radio de percepción, peso de separación, alineación, cohesión y velocidad máxima |
| InstancedMesh, VAT o boneVAT (T5) | ✅ InstancedMesh + VAT en `DataTexture` RGBA Float32 |
| 30 fps con 200 agentes — FPS en pantalla | ✅ HUD con FPS, draw calls, triángulos |
| Animaciones independientes por agente | ✅ `aTimeOffset` por instancia desincroniza la VAT; orientación individual según velocidad real de cada agente |
| Shader propio de T4 aplicado a los agentes | ✅ Toon/Cel-shading (bandas + specular) y Vertex Wobble, intercambiables en vivo |
| Iluminación coherente con el entorno (T1) | ✅ Misma PointLight + Ambient + Hemisphere que la escena base, niebla exponencial |
| Escena con contexto | ✅ Piso tipo grid, caja de límites del enjambre, campo de estrellas, cámara orbital |
| Repositorio limpio con README | ✅ Este archivo |

---

## Arquitectura técnica

### T6 — Flocking real con spatial hashing

Cada agente calcula sus 3 fuerzas de dirección (*steering*) clásicas de Craig Reynolds:

- **Separación**: se aleja de vecinos dentro de un radio corto (`perceptionRadius * 0.55`), ponderando más fuerte cuanto más cerca está.
- **Alineación**: intenta igualar la velocidad promedio de sus vecinos.
- **Cohesión**: se dirige hacia el centro de masa de sus vecinos.

Para no recorrer los N² pares de agentes en cada frame, se usa un **spatial hash grid** reconstruido cada frame:

- El espacio se divide en celdas de tamaño = radio de percepción.
- Cada agente se indexa en un `Map` por clave `"cx,cy,cz"`.
- Al buscar vecinos, solo se revisan las 27 celdas alrededor del agente (3×3×3), no todo el enjambre.
- Complejidad promedio **O(n)** en vez de O(n²), lo que permite escalar a 500 agentes manteniendo fps.

Además hay un "cerco invisible": cerca de los bordes de la caja de límites, se agrega una fuerza de dirección suave de regreso al centro (en vez de teletransportar/wrap), para que el enjambre se comporte como una bandada contenida y no como partículas que se recortan bruscamente.

### Geometría del agente

En vez del icosaedro ("bolita") de T1/T2, cada agente ahora es una forma tipo **pez/pájaro** construida a mano con triángulos sueltos: cuerpo alargado (bipirámide nariz-cola), dos aletas pectorales, aleta dorsal y cola en horquilla (~39 vértices, bajo poligonaje a propósito para que 200-500 instancias sigan siendo baratas). Al estar ya "no-indexed" por construcción, encaja directo en el pipeline de VAT con `gl_VertexID` sin pasos extra.

### T5 — InstancedMesh + VAT

- **InstancedMesh**: todos los agentes se dibujan en **2 draw calls** (cuerpo + contorno), sin importar cuántos sean.
- **VAT (Vertex Animation Texture)**: animación de "pulso" (ondulación de nado) horneada en un `DataTexture` `RGBA Float32` de `VERT_COUNT × 64 frames`. Cada texel guarda `(offsetX, offsetY, offsetZ, squash)`.
- El vertex shader samplea la VAT con `gl_VertexID` y un `aTimeOffset` por instancia, de modo que cada agente reproduce su animación en una fase distinta (no se ven sincronizados).
- La orientación de cada instancia se calcula con `Object3D.lookAt()` apuntando en la dirección real de su velocidad — otra fuente de independencia visual, ya que cada agente gira según su propio comportamiento de flocking.

### T4 — Shaders propios

- **Toon / Cel-shading**: cuantiza la componente difusa con `floor(diff * bands) / bands` (bandas ajustables) y agrega un specular discreto con `step()`.
- **Contorno (outline)**: segundo `InstancedMesh` con `side: BackSide` que infla los vértices a lo largo de la normal (*back-face inflate*).
- **Vertex Wobble**: deformación senoidal `A·sin(freq·pos.y − speed·time)` aplicada sobre la posición ya animada por la VAT, con gradiente de color propio.

### T1 — Escena base

- Iluminación: `PointLight` principal + `AmbientLight` fría + `HemisphereLight`, todas coherentes entre el modo toon y el modo wobble.
- Niebla exponencial (`FogExp2`) para dar profundidad.
- Contexto visual: grid de piso, caja de límites (toggle), campo de estrellas de fondo, cámara orbital automática.

---

## Controles

| Control | Descripción |
|---|---|
| **Agentes** | Slider 50–500; reconstruye el `InstancedMesh` |
| **Radio de percepción** | Distancia a la que un agente "ve" a sus vecinos (T6) |
| **Peso separación / alineación / cohesión** | Ajusta en vivo la influencia de cada regla de Boids |
| **Velocidad máxima** | Límite de rapidez del enjambre |
| **Shader activo** | Toon / Vertex Wobble / Normales debug |
| **Bandas Toon** | Cuantización de luz (2–8 bandas) |
| **Grosor contorno** | Inflado de normales para el outline |
| **Amplitud wobble** | Intensidad de la deformación senoidal |
| **Contorno oscuro** | Toggle del outline |
| **Cámara orbital** | Activa/desactiva rotación automática |
| **Mostrar límites** | Toggle de la caja de límites del enjambre |

---

## Notas de rendimiento

- Con 200 agentes el costo dominante ya no es el render (2 draw calls gracias a InstancedMesh) sino el cálculo de flocking en CPU. El spatial hash grid mantiene ese cálculo cercano a O(n), por lo que subir a 500 agentes sigue siendo fluido en hardware normal.
- Si se necesitara escalar mucho más allá (miles de agentes), el siguiente paso natural sería mover el cálculo de flocking a un compute/vertex shader (GPGPU con texturas de posición/velocidad), pero para el rango pedido (200, hasta 500) el enfoque en CPU + grid es suficiente y más simple de depurar/ajustar en vivo.

---

## Origen del código

Este proyecto integra y reemplaza partes de las entregas previas del semestre:

- **T1** — Escena base, iluminación, niebla.
- **T2** — Punto de partida del enjambre (posiciones/velocidades por agente).
- **T4** — Shaders propios (Toon/Cel-shading, Vertex Wobble, outline).
- **T5** — InstancedMesh + VAT.
- **T6** — Se reemplaza la alineación simplificada de la Entrega 2 (solo `velocity.lerp(avgVelocity)`) por el sistema de Boids completo (separación + alineación + cohesión) con spatial hashing desarrollado en la Tarea 6.
