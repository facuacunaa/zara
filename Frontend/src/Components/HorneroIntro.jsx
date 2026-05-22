import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/* ── Generador pseudo-aleatorio determinista ────────────────────────────── */
function seededRng(seed) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

/* ── Diapositivas de texto ──────────────────────────────────────────────── */
const SLIDES = [
  { from: 0,    to: 0.25, eyebrow: '— El Gran Chaco',     headline: 'El monte\nchaqueño',    body: '' },
  { from: 0.25, to: 0.5,  eyebrow: '— Quiénes somos',     headline: 'Arte desde\nel corazón', body: 'Somos una tienda de arte chaqueña que conecta a los artistas de nuestra región con el mundo.' },
  { from: 0.5,  to: 0.75, eyebrow: '— Nuestra misión',    headline: 'Impulsamos\nla región',  body: 'Cada compra apoya directamente a los creadores del Chaco, preservando la cultura y el talento local.' },
  { from: 0.75, to: 1.01, eyebrow: '— Nuestros artistas', headline: 'Descubrí\nel arte',      body: 'Conocé las obras y las historias de quienes dan vida a esta galería.' },
]

/* ── Keyframes de cámara ────────────────────────────────────────────────── */
// p=0.00 → vista aérea del monte (y=22, mirando abajo)
// p=0.22 → descendiendo entre las copas (y=7)
// p=0.34 → casi al ras del suelo, apuntando a la entrada de la galería
// p=1.00 → dentro de la galería
const KEYFRAMES = [
  { p: 0,    pos: [0, 22,  1],   look: [0, 0,   0] },
  { p: 0.22, pos: [0,  7,  1],   look: [0, 0,   0] },
  { p: 0.34, pos: [0,  2.5, 7],  look: [0, 1.8, -3] },
  { p: 1,    pos: [0,  1.7, -26],look: [0, 1.7, -44] },
]

function lerp(a, b, t) { return a + (b - a) * t }
function clamp01(v) { return Math.max(0, Math.min(1, v)) }
function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2 }

function getCamState(prog) {
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const a = KEYFRAMES[i], b = KEYFRAMES[i+1]
    if (prog >= a.p && prog <= b.p) {
      const t = easeInOut(clamp01((prog - a.p) / (b.p - a.p)))
      return {
        pos:  a.pos.map((v, j)  => lerp(v, b.pos[j],  t)),
        look: a.look.map((v, j) => lerp(v, b.look[j], t)),
      }
    }
  }
  const last = KEYFRAMES[KEYFRAMES.length - 1]
  return { pos: [...last.pos], look: [...last.look] }
}

/* ── Paleta de colores de copas ─────────────────────────────────────────── */
const CANOPY_COLORS = [
  0x1a4d10, 0x245c15, 0x2f6e1c, 0x3a8224, 0x1d5512,
  0x4a9630, 0x153b0b, 0x558c2a, 0x3d7020, 0x274f0e,
]

export default function HorneroIntro() {
  const mountRef    = useRef(null)
  const sectionRef  = useRef(null)
  const progressRef = useRef(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    /* ── Renderer ─────────────────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    /* ── Escena ───────────────────────────────────────────────────────────── */
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#060e05')
    scene.fog = new THREE.FogExp2('#060e05', 0.035)

    /* ── Cámara ───────────────────────────────────────────────────────────── */
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200)
    camera.position.set(0, 22, 1)
    camera.lookAt(0, 0, 0)

    /* ── Luz solar cálida desde arriba ────────────────────────────────────── */
    const sun = new THREE.DirectionalLight(0xfff3c0, 1.8)
    sun.position.set(8, 30, 10)
    sun.castShadow = true
    sun.shadow.mapSize.setScalar(1024)
    sun.shadow.camera.near = 1
    sun.shadow.camera.far  = 80
    sun.shadow.camera.left = -25
    sun.shadow.camera.right = 25
    sun.shadow.camera.top   = 25
    sun.shadow.camera.bottom = -25
    scene.add(sun)

    scene.add(new THREE.AmbientLight(0x8fbf8f, 0.4))

    /* ── Suelo (tierra del monte) ─────────────────────────────────────────── */
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x2a1a0a })
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.02
    ground.receiveShadow = true
    scene.add(ground)

    /* ── Monte: árboles generados ─────────────────────────────────────────── */
    const rng = seededRng(7331)
    const sharedTrunkMat = new THREE.MeshLambertMaterial({ color: 0x3b2206 })

    // Materiales de copa (uno por color para compartir)
    const canopyMats = CANOPY_COLORS.map(c => new THREE.MeshLambertMaterial({ color: c }))

    // Geometrías de copa de 3 tamaños para reutilizar
    const cGeoSm = new THREE.SphereGeometry(1, 7, 6)
    const cGeoMd = new THREE.SphereGeometry(1, 7, 6)
    const cGeoLg = new THREE.SphereGeometry(1, 7, 6)

    const TREE_COUNT = 220
    const SPREAD = 32          // radio del bosque
    const CLEAR_RADIUS = 5    // claro central para la entrada de galería

    for (let i = 0; i < TREE_COUNT; i++) {
      let x, z
      // Evitar el claro central y un pasillo estrecho hacia la galería
      do {
        const angle = rng() * Math.PI * 2
        const dist  = rng() * SPREAD
        x = Math.cos(angle) * dist
        z = Math.sin(angle) * dist
      } while (
        (x*x + z*z < CLEAR_RADIUS * CLEAR_RADIUS) ||
        (Math.abs(x) < 2.5 && z > -6 && z < 4)  // pasillo de entrada
      )

      const scale  = 0.55 + rng() * 1.45
      const trunkH = 1.2 + rng() * 1.8
      const ci     = Math.floor(rng() * CANOPY_COLORS.length)
      const ci2    = Math.floor(rng() * CANOPY_COLORS.length)

      // Tronco
      const trunkGeo = new THREE.CylinderGeometry(0.07 * scale, 0.13 * scale, trunkH * scale, 5)
      const trunk = new THREE.Mesh(trunkGeo, sharedTrunkMat)
      trunk.position.set(x, trunkH * scale * 0.5 - 0.02, z)
      trunk.castShadow = true
      scene.add(trunk)

      // Copa principal
      const canopy = new THREE.Mesh(cGeoMd, canopyMats[ci])
      canopy.scale.setScalar(scale * 0.95)
      canopy.position.set(x, trunkH * scale + scale * 0.4, z)
      canopy.castShadow = true
      scene.add(canopy)

      // Copa secundaria (offset, color diferente)
      if (rng() > 0.35) {
        const canopy2 = new THREE.Mesh(cGeoSm, canopyMats[ci2])
        const s2 = scale * (0.55 + rng() * 0.25)
        canopy2.scale.setScalar(s2)
        canopy2.position.set(
          x + (rng() - 0.5) * scale * 1.0,
          trunkH * scale + scale * 0.8 + rng() * scale * 0.4,
          z + (rng() - 0.5) * scale * 1.0,
        )
        scene.add(canopy2)
      }

      // Copa terciaria (solo árboles grandes)
      if (scale > 1.4 && rng() > 0.5) {
        const canopy3 = new THREE.Mesh(cGeoLg, canopyMats[Math.floor(rng() * CANOPY_COLORS.length)])
        const s3 = scale * 0.45
        canopy3.scale.setScalar(s3)
        canopy3.position.set(
          x + (rng() - 0.5) * scale * 0.6,
          trunkH * scale + scale * 1.2,
          z + (rng() - 0.5) * scale * 0.6,
        )
        scene.add(canopy3)
      }
    }

    /* ── Galería de arte ──────────────────────────────────────────────────── */
    const HALL_Z  = -4
    const HALL_LEN = 52
    const GW = 7, GH = 5

    const wallMat  = new THREE.MeshLambertMaterial({ color: 0x141010, side: THREE.FrontSide })
    const floorGalMat = new THREE.MeshLambertMaterial({ color: 0x1c1510 })
    const ceilMat  = new THREE.MeshLambertMaterial({ color: 0x0f0d0c })
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x7a5c20 })

    // Paredes
    const wallL = new THREE.Mesh(new THREE.PlaneGeometry(HALL_LEN, GH), wallMat)
    wallL.rotation.y = Math.PI / 2
    wallL.position.set(-GW/2, GH/2, HALL_Z - HALL_LEN/2)
    scene.add(wallL)

    const wallR = new THREE.Mesh(new THREE.PlaneGeometry(HALL_LEN, GH), wallMat)
    wallR.rotation.y = -Math.PI / 2
    wallR.position.set(GW/2, GH/2, HALL_Z - HALL_LEN/2)
    scene.add(wallR)

    const wallBack = new THREE.Mesh(new THREE.PlaneGeometry(GW, GH), wallMat)
    wallBack.position.set(0, GH/2, HALL_Z - HALL_LEN)
    scene.add(wallBack)

    // Suelo de galería (cubre y oculta el suelo del monte en esa zona)
    const floorGal = new THREE.Mesh(new THREE.PlaneGeometry(GW, HALL_LEN), floorGalMat)
    floorGal.rotation.x = -Math.PI / 2
    floorGal.position.set(0, 0.01, HALL_Z - HALL_LEN/2)
    scene.add(floorGal)

    // Techo
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(GW, HALL_LEN), ceilMat)
    ceil.rotation.x = Math.PI / 2
    ceil.position.set(0, GH, HALL_Z - HALL_LEN/2)
    scene.add(ceil)

    // Luces de techo de la galería
    for (let z = HALL_Z - 1; z > HALL_Z - HALL_LEN + 2; z -= 8) {
      const pt = new THREE.PointLight(0xffe8c0, 0.9, 12)
      pt.position.set(0, GH - 0.3, z)
      scene.add(pt)
    }

    /* ── Cuadros ────────────────────────────────────────────────────────────── */
    const ARTWORKS = [
      { z: HALL_Z - 3,  side: -1, color: 0xc47a35, w: 1.7, h: 2.1 },
      { z: HALL_Z - 3,  side:  1, color: 0x2a4a7a, w: 1.9, h: 1.5 },
      { z: HALL_Z - 11, side: -1, color: 0x7a2a2a, w: 1.5, h: 1.9 },
      { z: HALL_Z - 11, side:  1, color: 0x2a7a4a, w: 1.7, h: 1.7 },
      { z: HALL_Z - 19, side: -1, color: 0x4a2a7a, w: 1.6, h: 2.2 },
      { z: HALL_Z - 19, side:  1, color: 0x7a6a1a, w: 2.1, h: 1.5 },
    ]
    ARTWORKS.forEach(({ z, side, color, w, h }) => {
      const x = side * (GW/2 - 0.06)
      const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.18, h + 0.18, 0.07), frameMat)
      frame.position.set(x, 2.5, z)
      frame.rotation.y = side === -1 ? Math.PI/2 : -Math.PI/2
      scene.add(frame)

      const canvas = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshLambertMaterial({ color })
      )
      canvas.position.set(x + side * 0.07, 2.5, z)
      canvas.rotation.y = side === -1 ? Math.PI/2 : -Math.PI/2
      scene.add(canvas)

      const spot = new THREE.SpotLight(0xfff5e0, 12, 9, Math.PI / 9, 0.35)
      spot.position.set(x * 0.25, GH - 0.2, z)
      spot.target.position.set(x * 0.9, 2.5, z)
      scene.add(spot)
      scene.add(spot.target)
    })

    /* ── Scroll ─────────────────────────────────────────────────────────────── */
    const onScroll = () => {
      const sect = sectionRef.current
      if (!sect) return
      const rect = sect.getBoundingClientRect()
      const scrollable = sect.offsetHeight - window.innerHeight
      const p = clamp01(-rect.top / scrollable)
      progressRef.current = p
      setProgress(p)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    /* ── Resize ─────────────────────────────────────────────────────────────── */
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    /* ── Loop ───────────────────────────────────────────────────────────────── */
    let raf
    const animate = () => {
      raf = requestAnimationFrame(animate)
      const { pos, look } = getCamState(progressRef.current)
      camera.position.set(pos[0], pos[1], pos[2])
      camera.lookAt(look[0], look[1], look[2])
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <section ref={sectionRef} style={{ height: '380vh', position: 'relative' }}>
      {/* Canvas sticky */}
      <div
        ref={mountRef}
        style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflow: 'hidden' }}
      >
        {/* Texto superpuesto */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
          justifyContent: 'center', padding: '0 8vw',
        }}>
          {SLIDES.map((s, i) => {
            const active = progress >= s.from && progress < s.to
            return (
              <div key={i} style={{
                position: 'absolute',
                opacity:   active ? 1 : 0,
                transform: active ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.55s ease, transform 0.55s ease',
                maxWidth: 500,
              }}>
                <p style={{
                  color: 'rgba(140,210,100,0.8)', margin: '0 0 14px',
                  fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
                  fontSize: '9px', letterSpacing: '0.45em', textTransform: 'uppercase',
                }}>
                  {s.eyebrow}
                </p>
                <h2 style={{
                  color: '#fff', margin: '0 0 18px', whiteSpace: 'pre-line',
                  fontFamily: "'Cormorant Garamond',Georgia,serif",
                  fontSize: 'clamp(2.2rem,5.5vw,5rem)',
                  fontWeight: 500, fontStyle: 'normal', lineHeight: 1.1,
                }}>
                  {s.headline}
                </h2>
                {s.body && (
                  <p style={{
                    color: 'rgba(255,255,255,0.55)', margin: 0,
                    fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
                    fontSize: 'clamp(12px,1.4vw,15px)', lineHeight: 1.85,
                    letterSpacing: '0.03em', maxWidth: 400,
                  }}>
                    {s.body}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Indicadores de progreso */}
        <div style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {SLIDES.map((s, i) => {
              const active = progress >= s.from && progress < s.to
              return (
                <div key={i} style={{
                  width: active ? 22 : 5, height: 2,
                  background: active ? 'rgba(140,210,100,0.9)' : 'rgba(255,255,255,0.2)',
                  borderRadius: 2, transition: 'all 0.4s ease',
                }} />
              )
            })}
          </div>
          {progress < 0.88 && (
            <p style={{
              color: 'rgba(255,255,255,0.25)', margin: 0,
              fontFamily: "'DM Sans',sans-serif",
              fontSize: '8px', letterSpacing: '0.4em', textTransform: 'uppercase',
            }}>
              Scroll ↓
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
