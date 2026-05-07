import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/* ── Puntos simplificados del contorno de la provincia del Chaco ─────────── */
const CHACO_OUTLINE = [
  [-3.8,  4.2], [-1.2,  5.0], [ 1.8,  5.1], [ 3.6,  4.4],
  [ 4.2,  2.8], [ 4.5,  0.8], [ 4.3, -1.2], [ 3.8, -3.0],
  [ 2.2, -4.4], [ 0.0, -4.8], [-2.0, -4.6], [-3.6, -3.8],
  [-4.2, -1.8], [-4.0,  0.8], [-3.8,  4.2],
]

/* ── Ciudades del Chaco ────────────────────────────────────────────────────── */
const CITIES = [
  { x:  0.1, z: -0.2, name: 'Resistencia' },
  { x: -1.5, z:  1.4, name: 'Presidencia Roque Sáenz Peña' },
  { x:  1.0, z:  2.2, name: 'Villa Ángela' },
  { x: -2.4, z: -1.0, name: 'Las Breñas' },
]

const SLIDES = [
  { from: 0,    to: 0.25, eyebrow: '— Nordeste Argentino', headline: 'Provincia\ndel Chaco', body: '' },
  { from: 0.25, to: 0.5,  eyebrow: '— Quiénes somos',      headline: 'Arte desde\nel corazón', body: 'Somos una tienda de arte chaqueña que conecta a los artistas de nuestra región con el mundo.' },
  { from: 0.5,  to: 0.75, eyebrow: '— Nuestra misión',     headline: 'Impulsamos\nla región',  body: 'Cada compra apoya directamente a los creadores del Chaco, preservando la cultura y el talento local.' },
  { from: 0.75, to: 1.01, eyebrow: '— Nuestros artistas',  headline: 'Descubrí\nel arte',      body: 'Conocé las obras y las historias de quienes dan vida a esta galería.' },
]

function lerp(a, b, t) { return a + (b - a) * t }
function clamp01(v) { return Math.max(0, Math.min(1, v)) }
function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2 }

export default function HorneroIntro() {
  const mountRef   = useRef(null)
  const sectionRef = useRef(null)
  const progressRef = useRef(0)
  const [progress, setProgress] = useState(0)

  /* ── Three.js ────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#07090f')
    scene.fog = new THREE.FogExp2('#07090f', 0.055)

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.05, 120)

    /* ── Suelo base ────────────────────────────────────────────────────────── */
    const floorMat = new THREE.MeshStandardMaterial({ color: '#0d1018', roughness: 1 })
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = 0
    floor.receiveShadow = true
    scene.add(floor)

    /* ── Mapa del Chaco (forma extruida) ───────────────────────────────────── */
    const chacoShape = new THREE.Shape()
    CHACO_OUTLINE.forEach(([x, z], i) => {
      if (i === 0) chacoShape.moveTo(x, z)
      else chacoShape.lineTo(x, z)
    })
    const chacoGeo = new THREE.ExtrudeGeometry(chacoShape, { depth: 0.12, bevelEnabled: false })
    const chacoMat = new THREE.MeshStandardMaterial({ color: '#1a2a4a', roughness: 0.8, metalness: 0.1 })
    const chacoMesh = new THREE.Mesh(chacoGeo, chacoMat)
    chacoMesh.rotation.x = -Math.PI / 2
    chacoMesh.position.set(0, 0, 0)
    scene.add(chacoMesh)

    // Borde luminoso del mapa
    const borderGeo = new THREE.EdgesGeometry(chacoGeo)
    const borderMat = new THREE.LineBasicMaterial({ color: '#4a8aff', transparent: true, opacity: 0.7 })
    const border = new THREE.LineSegments(borderGeo, borderMat)
    border.rotation.x = -Math.PI / 2
    border.position.set(0, 0.13, 0)
    scene.add(border)

    /* ── Puntos de ciudades ────────────────────────────────────────────────── */
    const dotGeo = new THREE.SphereGeometry(0.1, 10, 10)
    const dotMat = new THREE.MeshBasicMaterial({ color: '#ffffff' })
    CITIES.forEach(({ x, z }) => {
      const dot = new THREE.Mesh(dotGeo, dotMat)
      dot.position.set(x, 0.25, z)
      scene.add(dot)
      // Halo del punto
      const halo = new THREE.Mesh(
        new THREE.CircleGeometry(0.22, 32),
        new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.15 })
      )
      halo.rotation.x = -Math.PI / 2
      halo.position.set(x, 0.15, z)
      scene.add(halo)
    })

    /* ── Partículas / estrellas ────────────────────────────────────────────── */
    const starCount = 800
    const starPos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      starPos[i*3]   = (Math.random() - 0.5) * 80
      starPos[i*3+1] = Math.random() * 30 + 2
      starPos[i*3+2] = (Math.random() - 0.5) * 80
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    const starMat = new THREE.PointsMaterial({ color: '#ffffff', size: 0.06, transparent: true, opacity: 0.6 })
    scene.add(new THREE.Points(starGeo, starMat))

    /* ── Galería: corredor ─────────────────────────────────────────────────── */
    const HALL_LEN = 50, W = 7, H = 5
    const wallMat  = new THREE.MeshStandardMaterial({ color: '#131010', roughness: 0.9 })
    const ceilMat  = new THREE.MeshStandardMaterial({ color: '#0e0c0b', roughness: 1 })
    const frameMat = new THREE.MeshStandardMaterial({ color: '#7a5c20', roughness: 0.3, metalness: 0.6 })

    // Empieza a z=-6 (el mapa queda delante, la galería detrás)
    const HALL_Z = -6

    const wallL = new THREE.Mesh(new THREE.PlaneGeometry(HALL_LEN, H), wallMat)
    wallL.rotation.y = Math.PI / 2
    wallL.position.set(-W/2, H/2, HALL_Z - HALL_LEN/2)
    scene.add(wallL)

    const wallR = new THREE.Mesh(new THREE.PlaneGeometry(HALL_LEN, H), wallMat)
    wallR.rotation.y = -Math.PI / 2
    wallR.position.set(W/2, H/2, HALL_Z - HALL_LEN/2)
    scene.add(wallR)

    const wallBack = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat)
    wallBack.position.set(0, H/2, HALL_Z - HALL_LEN)
    scene.add(wallBack)

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, HALL_LEN), ceilMat)
    ceil.rotation.x = Math.PI / 2
    ceil.position.set(0, H, HALL_Z - HALL_LEN/2)
    scene.add(ceil)

    const galleryFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(W, HALL_LEN),
      new THREE.MeshStandardMaterial({ color: '#1a1410', roughness: 0.6, metalness: 0.1 })
    )
    galleryFloor.rotation.x = -Math.PI / 2
    galleryFloor.position.set(0, 0, HALL_Z - HALL_LEN/2)
    galleryFloor.receiveShadow = true
    scene.add(galleryFloor)

    /* ── Cuadros ─────────────────────────────────────────────────────────────── */
    const ARTWORKS = [
      { z: HALL_Z-2,  side: -1, color: '#c47a35', w: 1.6, h: 2.0 },
      { z: HALL_Z-2,  side:  1, color: '#2a4a7a', w: 1.8, h: 1.4 },
      { z: HALL_Z-9,  side: -1, color: '#7a2a2a', w: 1.4, h: 1.8 },
      { z: HALL_Z-9,  side:  1, color: '#2a7a4a', w: 1.6, h: 1.6 },
      { z: HALL_Z-16, side: -1, color: '#4a2a7a', w: 1.5, h: 2.1 },
      { z: HALL_Z-16, side:  1, color: '#7a6a1a', w: 2.0, h: 1.4 },
    ]
    ARTWORKS.forEach(({ z, side, color, w, h }) => {
      const x = side * (W/2 - 0.06)
      const frame = new THREE.Mesh(new THREE.BoxGeometry(w+0.16, h+0.16, 0.07), frameMat)
      frame.position.set(x, 2.2, z)
      frame.rotation.y = side === -1 ? Math.PI/2 : -Math.PI/2
      scene.add(frame)

      const canvas = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshStandardMaterial({ color, roughness: 0.85 })
      )
      canvas.position.set(x + side*0.07, 2.2, z)
      canvas.rotation.y = side === -1 ? Math.PI/2 : -Math.PI/2
      scene.add(canvas)

      const spot = new THREE.SpotLight('#fff5e0', 10, 8, Math.PI/9, 0.35)
      spot.position.set(x*0.3, H-0.1, z)
      spot.target.position.set(x*0.9, 2.2, z)
      scene.add(spot); scene.add(spot.target)
    })

    /* ── Luces ─────────────────────────────────────────────────────────────── */
    scene.add(new THREE.AmbientLight('#0a0a14', 5))

    // Luz sobre el mapa
    const mapLight = new THREE.PointLight('#2255cc', 6, 14)
    mapLight.position.set(0, 6, 0)
    scene.add(mapLight)

    // Luces del techo de la galería
    for (let z = HALL_Z; z > HALL_Z - HALL_LEN; z -= 7) {
      const pt = new THREE.PointLight('#ffe8c0', 0.8, 10)
      pt.position.set(0, H-0.3, z)
      scene.add(pt)
    }

    /* ── Keyframes de cámara ────────────────────────────────────────────────── */
    // p=0: arriba mirando el mapa
    // p=0.35: nivel ojo, frente a la galería
    // p=1: dentro de la galería
    const CAM_KF = [
      { p: 0,    pos: [0, 16, 4],            look: [0, 0, 0] },
      { p: 0.28, pos: [0, 2.5, 8],           look: [0, 2, HALL_Z-4] },
      { p: 1,    pos: [0, 1.7, HALL_Z-20],   look: [0, 1.7, HALL_Z-36] },
    ]
    function getCamState(prog) {
      for (let i = 0; i < CAM_KF.length - 1; i++) {
        const a = CAM_KF[i], b = CAM_KF[i+1]
        if (prog >= a.p && prog <= b.p) {
          const t = easeInOut(clamp01((prog - a.p) / (b.p - a.p)))
          return {
            pos:  a.pos.map((v, j) => lerp(v, b.pos[j], t)),
            look: a.look.map((v, j) => lerp(v, b.look[j], t)),
          }
        }
      }
      const last = CAM_KF[CAM_KF.length - 1]
      return { pos: last.pos, look: last.look }
    }

    /* ── Scroll ────────────────────────────────────────────────────────────── */
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

    /* ── Resize ────────────────────────────────────────────────────────────── */
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    /* ── Loop ────────────────────────────────────────────────────────────── */
    let raf, t = 0
    const animate = () => {
      raf = requestAnimationFrame(animate)
      t += 0.005

      // Pulso del borde del mapa
      border.material.opacity = 0.5 + Math.sin(t * 2) * 0.2
      mapLight.intensity = 5 + Math.sin(t * 1.5) * 1.5

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

  const activeSlide = SLIDES.find(s => progress >= s.from && progress < s.to) || SLIDES[SLIDES.length - 1]

  return (
    <section ref={sectionRef} style={{ height: '380vh', position: 'relative' }}>
      <div
        ref={mountRef}
        style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflow: 'hidden' }}
      >
        {/* Texto principal */}
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
                  color: 'rgba(100,160,255,0.75)', margin: '0 0 14px',
                  fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
                  fontSize: '9px', letterSpacing: '0.45em', textTransform: 'uppercase',
                }}>
                  {s.eyebrow}
                </p>
                <h2 style={{
                  color: '#fff', margin: '0 0 18px', whiteSpace: 'pre-line',
                  fontFamily: "'Playfair Display',Georgia,serif",
                  fontSize: 'clamp(2.2rem,5.5vw,5rem)',
                  fontWeight: 300, fontStyle: 'italic', lineHeight: 1.1,
                }}>
                  {s.headline}
                </h2>
                {s.body && (
                  <p style={{
                    color: 'rgba(255,255,255,0.5)', margin: 0,
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
                  background: active ? 'rgba(100,160,255,0.9)' : 'rgba(255,255,255,0.2)',
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
