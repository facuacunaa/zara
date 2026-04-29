import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import styled from 'styled-components'

const API = process.env.REACT_APP_BACKEND_URL || 'https://zara-backend.vercel.app'

/* ── Etiquetas de los slots de imágenes ───────────────────────────────────── */
const IMAGE_SLOTS = [
  { label: 'Imagen hero',           hint: 'Aparece de fondo en el hero si no hay video' },
  { label: 'Imagen junto al texto', hint: 'Sección 3 – imagen a la derecha del texto'   },
  { label: 'Imagen par izquierda',  hint: 'Sección 4 – primera imagen lado a lado'      },
  { label: 'Imagen par derecha',    hint: 'Sección 4 – segunda imagen lado a lado'      },
]

/* ── Estado inicial de textos ─────────────────────────────────────────────── */
const EMPTY_TEXTS = {
  subtitle:              '',
  editorialLabel:        '',
  editorialQuote:        '',
  editorialDescription:  '',
  bioTitle:              '',
  bioText:               '',
  bioGoals:              '',
  bioQuote:              '',
  blockTitle:            '',
  blockBody:             '',
  shopTitle:             '',
  shopDescription:       '',
  footerLabel:           '',
  footerWord:            '',
}

/* ── Hotspot vacío ────────────────────────────────────────────────────────── */
const EMPTY_HOTSPOT = { x: 50, y: 50, name: '', price: '' }

export default function ArtistPortal() {
  const [token,    setToken]   = useState(localStorage.getItem('artistToken') || '')
  const [artist,   setArtist]  = useState(JSON.parse(localStorage.getItem('artistData') || 'null'))
  const [login,    setLogin]   = useState({ email: '', password: '' })
  const [loginErr, setLoginErr]= useState('')
  const [tab,      setTab]     = useState('hero')   // hero | images | texts | shop
  const [msg,      setMsg]     = useState('')
  const [loading,  setLoading] = useState(false)

  // Progress
  const [videoProgress,   setVideoProgress]   = useState(0)
  const [slotProgress,    setSlotProgress]    = useState({})   // { slotIdx: 0-100 }
  const [shopProgress,    setShopProgress]    = useState(0)
  const [productProgress, setProductProgress] = useState(0)

  // Nuevo producto para Shop the Look
  const [newProduct, setNewProduct] = useState({ name: '', price: '', file: null, preview: null })

  // Textos editables
  const [texts, setTexts] = useState(EMPTY_TEXTS)

  // Hotspots editor
  const [hotspots, setHotspots] = useState([])
  const [newHotspot, setNewHotspot] = useState({ ...EMPTY_HOTSPOT })

  const videoRef      = useRef(null)
  const slotRefs      = useRef({})
  const shopRef       = useRef(null)
  const productImgRef = useRef(null)

  const headers = { Authorization: `Bearer ${token}` }

  /* ── Sincronizar textos y hotspots desde artista ─────────────────────── */
  useEffect(() => {
    if (!artist) return
    setTexts({
      subtitle:             artist.subtitle             || '',
      editorialLabel:       artist.editorialLabel       || '',
      editorialQuote:       artist.editorialQuote       || '',
      editorialDescription: artist.editorialDescription || '',
      bioTitle:             artist.bioTitle             || '',
      bioText:              artist.bioText              || '',
      bioGoals:             artist.bioGoals             || '',
      bioQuote:             artist.bioQuote             || '',
      blockTitle:           artist.blockTitle           || '',
      blockBody:            artist.blockBody            || '',
      shopTitle:            artist.shopTitle            || '',
      shopDescription:      artist.shopDescription      || '',
      footerLabel:          artist.footerLabel          || '',
      footerWord:           artist.footerWord           || '',
    })
    setHotspots(artist.hotspots || [])
  }, [artist])

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500) }

  /* ── Login ──────────────────────────────────────────────────────────── */
  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setLoginErr('')
    try {
      const res = await axios.post(`${API}/artist/login`, login)
      localStorage.setItem('artistToken', res.data.token)
      localStorage.setItem('artistData',  JSON.stringify(res.data.artist))
      setToken(res.data.token)
      setArtist(res.data.artist)
    } catch {
      setLoginErr('Credenciales incorrectas.')
    }
    setLoading(false)
  }

  const logout = () => {
    localStorage.removeItem('artistToken')
    localStorage.removeItem('artistData')
    setToken(''); setArtist(null)
  }

  /* ── Refresh artista ─────────────────────────────────────────────────── */
  const refreshArtist = async () => {
    try {
      const res = await axios.get(`${API}/artist/${artist.slug}`)
      setArtist(res.data)
      localStorage.setItem('artistData', JSON.stringify(res.data))
    } catch {}
  }

  /* ── Subir video ─────────────────────────────────────────────────────── */
  const uploadVideo = async (file) => {
    if (!file) return
    if (!file.type.startsWith('video/')) return flash('❌ Seleccioná un archivo de video')
    if (file.size > 200 * 1024 * 1024) return flash('❌ El video supera 200MB')
    setLoading(true); setVideoProgress(0)
    const form = new FormData()
    form.append('video', file)
    try {
      await axios.post(`${API}/artist/video/upload`, form, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setVideoProgress(Math.round((e.loaded * 100) / e.total))
      })
      await refreshArtist()
      flash('✅ Video subido correctamente')
    } catch {
      flash('❌ Error al subir el video')
    }
    setLoading(false); setVideoProgress(0)
  }

  /* ── Subir imagen a slot específico ─────────────────────────────────── */
  const uploadSlot = async (file, slot) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) return flash('❌ La imagen supera 10MB')
    setSlotProgress(p => ({ ...p, [slot]: 0 }))
    const form = new FormData()
    form.append('image', file)
    try {
      await axios.post(`${API}/artist/images/slot/${slot}`, form, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setSlotProgress(p => ({ ...p, [slot]: Math.round((e.loaded * 100) / e.total) }))
      })
      await refreshArtist()
      flash(`✅ Imagen ${slot + 1} actualizada`)
    } catch {
      flash('❌ Error al subir imagen')
    }
    setSlotProgress(p => { const n = {...p}; delete n[slot]; return n })
  }

  /* ── Subir imagen shop ───────────────────────────────────────────────── */
  const uploadShopImage = async (file) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) return flash('❌ La imagen supera 10MB')
    setShopProgress(0)
    const form = new FormData()
    form.append('image', file)
    try {
      await axios.post(`${API}/artist/images/shop`, form, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setShopProgress(Math.round((e.loaded * 100) / e.total))
      })
      await refreshArtist()
      flash('✅ Imagen Shop the Look actualizada')
    } catch {
      flash('❌ Error al subir imagen')
    }
    setShopProgress(0)
  }

  /* ── Guardar textos ──────────────────────────────────────────────────── */
  const saveTexts = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await axios.put(`${API}/artist/content/update`, texts, { headers })
      await refreshArtist()
      flash('✅ Textos guardados')
    } catch { flash('❌ Error al guardar') }
    setLoading(false)
  }

  /* ── Agregar producto al Shop the Look ──────────────────────────────── */
  const addShopProduct = async () => {
    if (!newProduct.name || !newProduct.price) return flash('❌ Completá nombre y precio')
    if (!newProduct.file) return flash('❌ Seleccioná una imagen para el producto')
    setLoading(true); setProductProgress(0)
    const form = new FormData()
    form.append('image', newProduct.file)
    form.append('name',  newProduct.name)
    form.append('price', newProduct.price)
    try {
      await axios.post(`${API}/artist/shop-products`, form, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setProductProgress(Math.round((e.loaded * 100) / e.total))
      })
      await refreshArtist()
      setNewProduct({ name: '', price: '', file: null, preview: null })
      flash('✅ Producto agregado')
    } catch {
      flash('❌ Error al agregar producto')
    }
    setLoading(false); setProductProgress(0)
  }

  /* ── Eliminar producto del Shop the Look ─────────────────────────────── */
  const deleteShopProduct = async (idx) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    try {
      await axios.delete(`${API}/artist/shop-products/${idx}`, { headers })
      await refreshArtist()
      flash('✅ Producto eliminado')
    } catch { flash('❌ Error al eliminar') }
  }

  /* ── Guardar hotspots ────────────────────────────────────────────────── */
  const saveHotspots = async () => {
    setLoading(true)
    try {
      await axios.put(`${API}/artist/hotspots`, { hotspots }, { headers })
      await refreshArtist()
      flash('✅ Hotspots guardados')
    } catch { flash('❌ Error al guardar hotspots') }
    setLoading(false)
  }

  const addHotspot = () => {
    if (!newHotspot.name || !newHotspot.price)
      return flash('❌ Completá nombre y precio')
    setHotspots(hs => [...hs, { ...newHotspot }])
    setNewHotspot({ ...EMPTY_HOTSPOT })
  }

  const removeHotspot = (idx) => setHotspots(hs => hs.filter((_, i) => i !== idx))

  const updateHotspot = (idx, field, value) => {
    setHotspots(hs => hs.map((h, i) =>
      i === idx ? { ...h, [field]: field === 'x' || field === 'y' ? Number(value) : value } : h
    ))
  }

  /* ── LOGIN SCREEN ────────────────────────────────────────────────────── */
  if (!token || !artist) return (
    <PageWrapper>
      <LoginCard>
        <Logo>✦ ARTISTA</Logo>
        <h2>Portal de Artista</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" required
            value={login.email} onChange={e => setLogin({...login, email: e.target.value})} />
          <input type="password" placeholder="Contraseña" required
            value={login.password} onChange={e => setLogin({...login, password: e.target.value})} />
          {loginErr && <Err>{loginErr}</Err>}
          <button type="submit" disabled={loading}>{loading ? 'Ingresando...' : 'INGRESAR'}</button>
        </form>
      </LoginCard>
    </PageWrapper>
  )

  /* ── DASHBOARD ───────────────────────────────────────────────────────── */
  return (
    <DashWrap>
      {/* SIDEBAR */}
      <Side>
        <SideName>{artist.name}</SideName>
        <SideSlug>/{artist.slug}</SideSlug>
        <SideNav>
          <SideItem active={tab === 'hero'}    onClick={() => setTab('hero')}>🎬 Hero</SideItem>
          <SideItem active={tab === 'bio'}    onClick={() => setTab('bio')}>📖 Mi Historia</SideItem>
          <SideItem active={tab === 'images'} onClick={() => setTab('images')}>🖼️ Imágenes</SideItem>
          <SideItem active={tab === 'texts'}  onClick={() => setTab('texts')}>✏️ Textos</SideItem>
          <SideItem active={tab === 'shop'}   onClick={() => setTab('shop')}>🛍️ Productos</SideItem>
        </SideNav>
        <PreviewLink href={`/${artist.slug}`} target="_blank">Ver página ↗</PreviewLink>
        <LogoutBtn onClick={logout}>Cerrar sesión</LogoutBtn>
      </Side>

      {/* MAIN */}
      <Main>
        {msg && <Toast>{msg}</Toast>}

        {/* ══════════════════════ TAB: HERO ══════════════════════════════ */}
        {tab === 'hero' && (
          <>
            <PageTitle>Hero de la página</PageTitle>

            {/* Video */}
            <Section>
              <SectionTitle>Video hero</SectionTitle>
              <SectionSub>Se reproduce automáticamente al entrar a tu página. MP4, MOV o WEBM · Máx. 200MB</SectionSub>
              <HeroPreviewBox>
                {artist.heroVideo
                  ? <HeroVideo src={artist.heroVideo} autoPlay muted loop playsInline />
                  : <HeroPlaceholder>🎬 Sin video — subí uno abajo</HeroPlaceholder>
                }
              </HeroPreviewBox>
              <VideoDropZone
                onClick={() => !loading && videoRef.current?.click()}
                uploading={loading && videoProgress > 0}
              >
                {loading && videoProgress > 0 ? (
                  <>
                    <DropIcon>⏳</DropIcon>
                    <DropText>Subiendo video… {videoProgress}%</DropText>
                    <ProgressBar><ProgressFill style={{ width: `${videoProgress}%` }} /></ProgressBar>
                  </>
                ) : (
                  <>
                    <DropIcon>🎬</DropIcon>
                    <DropText>{artist.heroVideo ? 'Reemplazar video' : 'Subir video hero'}</DropText>
                    <DropHint>MP4 · MOV · WEBM · Máx. 200MB</DropHint>
                  </>
                )}
                <input ref={videoRef} type="file" accept="video/*" hidden
                  onChange={e => uploadVideo(e.target.files[0])} />
              </VideoDropZone>
            </Section>

            {/* Subtítulo del hero */}
            <Section>
              <SectionTitle>Subtítulo del hero</SectionTitle>
              <SectionSub>Aparece sobre el nombre en el hero. Ej: COLECCIÓN EXCLUSIVA · 2024</SectionSub>
              <InfoInput
                value={texts.subtitle}
                onChange={e => setTexts({...texts, subtitle: e.target.value})}
                placeholder="COLECCIÓN EXCLUSIVA · 2024"
              />
              <SaveBtn
                style={{ marginTop: 16 }}
                disabled={loading}
                onClick={async () => {
                  setLoading(true)
                  try {
                    await axios.put(`${API}/artist/content/update`, { ...texts }, { headers })
                    await refreshArtist()
                    flash('✅ Subtítulo guardado')
                  } catch { flash('❌ Error al guardar') }
                  setLoading(false)
                }}
              >
                {loading ? 'Guardando…' : 'GUARDAR SUBTÍTULO'}
              </SaveBtn>
            </Section>
          </>
        )}

        {/* ══════════════════════ TAB: HISTORIA ══════════════════════════ */}
        {tab === 'bio' && (
          <>
            <PageTitle>Mi Historia</PageTitle>
            <form onSubmit={saveTexts}>

              <Section>
                <SectionTitle>Título de la sección</SectionTitle>
                <SectionSub>Aparece como etiqueta pequeña antes de tu historia. Por defecto: "Mi historia"</SectionSub>
                <InfoGroup full>
                  <InfoLabel>Título (ej: Mi historia · Sobre mí · Quién soy)</InfoLabel>
                  <InfoInput
                    value={texts.bioTitle}
                    onChange={e => setTexts({...texts, bioTitle: e.target.value})}
                    placeholder="Mi historia"
                  />
                </InfoGroup>
              </Section>

              <Section>
                <SectionTitle>Tu historia</SectionTitle>
                <SectionSub>Contá quién sos, de dónde venís, qué te llevó a la moda y al arte.</SectionSub>
                <InfoGroup full>
                  <InfoLabel>Texto libre (podés usar saltos de línea)</InfoLabel>
                  <InfoTextarea
                    value={texts.bioText}
                    onChange={e => setTexts({...texts, bioText: e.target.value})}
                    placeholder={"Nací en Buenos Aires y desde pequeña sentí que la ropa era más que tela.\nEmpecé diseñando para mis amigas con telas que encontraba en los mercados del Once…"}
                    rows={8}
                  />
                </InfoGroup>
              </Section>

              <Section>
                <SectionTitle>Tus metas y lo que intentás retratar</SectionTitle>
                <SectionSub>Contá cuál es tu visión, qué emoción o mensaje querés transmitir con cada colección.</SectionSub>
                <InfoGroup full>
                  <InfoLabel>Metas y visión</InfoLabel>
                  <InfoTextarea
                    value={texts.bioGoals}
                    onChange={e => setTexts({...texts, bioGoals: e.target.value})}
                    placeholder={"Mi meta es que cada prenda sea una conversación entre quien la lleva y el mundo.\nIntento retratar la identidad latinoamericana sin filtros — cruda, vibrante y en movimiento."}
                    rows={6}
                  />
                </InfoGroup>
              </Section>

              <Section>
                <SectionTitle>Tu frase personal</SectionTitle>
                <SectionSub>Una cita tuya que defina tu filosofía. Aparece destacada al final de tu historia.</SectionSub>
                <InfoGroup full>
                  <InfoLabel>Frase (sin comillas, las agrega automático)</InfoLabel>
                  <InfoInput
                    value={texts.bioQuote}
                    onChange={e => setTexts({...texts, bioQuote: e.target.value})}
                    placeholder="La moda es política cuando la lleva quien quiere cambiar el mundo."
                  />
                </InfoGroup>
              </Section>

              <SaveBtn type="submit" disabled={loading}>
                {loading ? 'Guardando…' : 'GUARDAR HISTORIA'}
              </SaveBtn>
            </form>
          </>
        )}

        {/* ══════════════════════ TAB: IMÁGENES ══════════════════════════ */}
        {tab === 'images' && (
          <>
            <PageTitle>Imágenes de la página</PageTitle>
            <SectionSub style={{ marginBottom: 24 }}>
              Cada slot corresponde a una posición específica en la editorial. Hacé click en el slot para subir o reemplazar la foto.
            </SectionSub>
            <SlotsGrid>
              {IMAGE_SLOTS.map((slot, i) => {
                const currentImg = artist.images?.[i]
                const progress   = slotProgress[i]
                const uploading  = progress !== undefined
                return (
                  <SlotCard key={i} onClick={() => !uploading && slotRefs.current[i]?.click()}>
                    <SlotNum>{i + 1}</SlotNum>
                    <SlotLabel>{slot.label}</SlotLabel>
                    <SlotHint>{slot.hint}</SlotHint>

                    {uploading ? (
                      <SlotUploading>
                        <div>
                          <span>Subiendo… {progress}%</span>
                          <ProgressBar style={{ maxWidth: '100%', marginTop: 8 }}>
                            <ProgressFill style={{ width: `${progress}%` }} />
                          </ProgressBar>
                        </div>
                      </SlotUploading>
                    ) : currentImg ? (
                      <SlotPreview>
                        <img src={currentImg} alt={`slot ${i+1}`} />
                        <SlotOverlay>
                          <span>Reemplazar</span>
                        </SlotOverlay>
                      </SlotPreview>
                    ) : (
                      <SlotEmpty>
                        <div><span>+</span><p>Subir foto</p></div>
                      </SlotEmpty>
                    )}

                    <input
                      ref={el => slotRefs.current[i] = el}
                      type="file" accept="image/*" hidden
                      onChange={e => uploadSlot(e.target.files[0], i)}
                    />
                  </SlotCard>
                )
              })}
            </SlotsGrid>
          </>
        )}

        {/* ══════════════════════ TAB: TEXTOS ════════════════════════════ */}
        {tab === 'texts' && (
          <>
            <PageTitle>Textos de la página</PageTitle>
            <form onSubmit={saveTexts}>

              {/* ── Hero ── */}
              <Section>
                <SectionTitle>Hero</SectionTitle>
                <SectionSub>Texto que aparece sobre el nombre en la pantalla de inicio.</SectionSub>
                <InfoGrid>
                  <InfoGroup full>
                    <InfoLabel>Subtítulo</InfoLabel>
                    <InfoInput value={texts.subtitle}
                      onChange={e => setTexts({...texts, subtitle: e.target.value})}
                      placeholder="COLECCIÓN EXCLUSIVA · 2024" />
                  </InfoGroup>
                </InfoGrid>
              </Section>

              {/* ── Statement ── */}
              <Section>
                <SectionTitle>Frase editorial</SectionTitle>
                <SectionSub>Aparece centrada debajo del hero. Si dejás vacío, no se muestra.</SectionSub>
                <InfoGrid>
                  <InfoGroup>
                    <InfoLabel>Etiqueta pequeña (ej: — La colección)</InfoLabel>
                    <InfoInput value={texts.editorialLabel}
                      onChange={e => setTexts({...texts, editorialLabel: e.target.value})}
                      placeholder="— La colección" />
                  </InfoGroup>
                  <InfoGroup full>
                    <InfoLabel>Frase principal</InfoLabel>
                    <InfoTextarea value={texts.editorialQuote}
                      onChange={e => setTexts({...texts, editorialQuote: e.target.value})}
                      placeholder={`"Una conversación entre la forma y el silencio."`} rows={3} />
                  </InfoGroup>
                  <InfoGroup full>
                    <InfoLabel>Descripción (texto chico debajo)</InfoLabel>
                    <InfoTextarea value={texts.editorialDescription}
                      onChange={e => setTexts({...texts, editorialDescription: e.target.value})}
                      placeholder="Tejidos naturales. Siluetas sin género…" rows={2} />
                  </InfoGroup>
                </InfoGrid>
              </Section>

              {/* ── Bloque Texto + Imagen ── */}
              <Section>
                <SectionTitle>Texto junto a la imagen</SectionTitle>
                <SectionSub>Este texto aparece a la izquierda, con la "Imagen junto al texto" a la derecha.</SectionSub>
                <InfoGrid>
                  <InfoGroup full>
                    <InfoLabel>Título (itálica grande)</InfoLabel>
                    <InfoInput value={texts.blockTitle}
                      onChange={e => setTexts({...texts, blockTitle: e.target.value})}
                      placeholder="El cuerpo como arquitectura." />
                  </InfoGroup>
                  <InfoGroup full>
                    <InfoLabel>Párrafo de texto</InfoLabel>
                    <InfoTextarea value={texts.blockBody}
                      onChange={e => setTexts({...texts, blockBody: e.target.value})}
                      placeholder={"Cada costura es una decisión.\nCada doblez, una intención."} rows={5} />
                  </InfoGroup>
                </InfoGrid>
              </Section>

              {/* ── Productos ── */}
              <Section>
                <SectionTitle>Sección de productos</SectionTitle>
                <SectionSub>Encabezado que aparece arriba del grid de todos los productos.</SectionSub>
                <InfoGrid>
                  <InfoGroup full>
                    <InfoLabel>Título de la sección</InfoLabel>
                    <InfoInput value={texts.shopTitle}
                      onChange={e => setTexts({...texts, shopTitle: e.target.value})}
                      placeholder="La Colección" />
                  </InfoGroup>
                  <InfoGroup full>
                    <InfoLabel>Descripción</InfoLabel>
                    <InfoTextarea value={texts.shopDescription}
                      onChange={e => setTexts({...texts, shopDescription: e.target.value})}
                      placeholder="Explorá cada prenda de la colección." rows={2} />
                  </InfoGroup>
                </InfoGrid>
              </Section>

              {/* ── Footer ── */}
              <Section>
                <SectionTitle>Footer</SectionTitle>
                <InfoGrid>
                  <InfoGroup full>
                    <InfoLabel>Texto pequeño del footer</InfoLabel>
                    <InfoInput value={texts.footerLabel}
                      onChange={e => setTexts({...texts, footerLabel: e.target.value})}
                      placeholder="Natalia Gomez × Zara · Colección Exclusiva 2024" />
                  </InfoGroup>
                  <InfoGroup>
                    <InfoLabel>Palabra final (grande, itálica)</InfoLabel>
                    <InfoInput value={texts.footerWord}
                      onChange={e => setTexts({...texts, footerWord: e.target.value})}
                      placeholder="Fin." />
                  </InfoGroup>
                </InfoGrid>
              </Section>

              <SaveBtn type="submit" disabled={loading}>
                {loading ? 'Guardando…' : 'GUARDAR TODOS LOS TEXTOS'}
              </SaveBtn>
            </form>
          </>
        )}

        {/* ══════════════════════ TAB: SHOP THE LOOK ═════════════════════ */}
        {tab === 'shop' && (
          <>
            <PageTitle>Shop the Look</PageTitle>

            {/* ── Imagen ── */}
            <Section>
              <SectionTitle>Imagen de fondo</SectionTitle>
              <SectionSub>Esta imagen aparece con los hotspots superpuestos.</SectionSub>
              <ShopImgPreview>
                {artist.shopImage
                  ? <img src={artist.shopImage} alt="shop" />
                  : <ShopImgEmpty>Sin imagen — hacé click para subir</ShopImgEmpty>
                }
                {shopProgress > 0 && (
                  <ShopImgOverlay>
                    <span>Subiendo… {shopProgress}%</span>
                    <ProgressBar style={{ maxWidth: 200, margin: '8px auto 0' }}>
                      <ProgressFill style={{ width: `${shopProgress}%` }} />
                    </ProgressBar>
                  </ShopImgOverlay>
                )}
              </ShopImgPreview>
              <UploadBtn onClick={() => shopRef.current?.click()}>
                {artist.shopImage ? '↑ Reemplazar imagen' : '↑ Subir imagen'}
              </UploadBtn>
              <input ref={shopRef} type="file" accept="image/*" hidden
                onChange={e => uploadShopImage(e.target.files[0])} />
            </Section>

            {/* ── Hotspots ── */}
            <Section>
              <SectionTitle>Hotspots (puntos interactivos)</SectionTitle>
              <SectionSub>
                Definí los puntos que aparecen sobre la imagen. X e Y son porcentajes desde la esquina
                superior izquierda (0–100). Los hotspots se guardan con el botón de abajo.
              </SectionSub>

              {/* Lista de hotspots existentes */}
              {hotspots.length > 0 ? (
                <HotspotList>
                  {hotspots.map((h, i) => (
                    <HotspotRow key={i}>
                      <HsField>
                        <label>X %</label>
                        <input type="number" min="0" max="100" value={h.x}
                          onChange={e => updateHotspot(i, 'x', e.target.value)} />
                      </HsField>
                      <HsField>
                        <label>Y %</label>
                        <input type="number" min="0" max="100" value={h.y}
                          onChange={e => updateHotspot(i, 'y', e.target.value)} />
                      </HsField>
                      <HsField grow>
                        <label>Nombre del producto</label>
                        <input value={h.name}
                          onChange={e => updateHotspot(i, 'name', e.target.value)}
                          placeholder="OVERSIZE COAT" />
                      </HsField>
                      <HsField>
                        <label>Precio</label>
                        <input value={h.price}
                          onChange={e => updateHotspot(i, 'price', e.target.value)}
                          placeholder="$249" />
                      </HsField>
                      <HsDelete onClick={() => removeHotspot(i)}>✕</HsDelete>
                    </HotspotRow>
                  ))}
                </HotspotList>
              ) : (
                <Empty>No hay hotspots. Añadí uno abajo.</Empty>
              )}

              {/* Agregar nuevo hotspot */}
              <AddHotspotBox>
                <SectionTitle style={{ marginBottom: 12 }}>Agregar hotspot</SectionTitle>
                <HotspotRow>
                  <HsField>
                    <label>X %</label>
                    <input type="number" min="0" max="100" value={newHotspot.x}
                      onChange={e => setNewHotspot({...newHotspot, x: Number(e.target.value)})} />
                  </HsField>
                  <HsField>
                    <label>Y %</label>
                    <input type="number" min="0" max="100" value={newHotspot.y}
                      onChange={e => setNewHotspot({...newHotspot, y: Number(e.target.value)})} />
                  </HsField>
                  <HsField grow>
                    <label>Nombre del producto</label>
                    <input value={newHotspot.name}
                      onChange={e => setNewHotspot({...newHotspot, name: e.target.value})}
                      placeholder="OVERSIZE COAT" />
                  </HsField>
                  <HsField>
                    <label>Precio</label>
                    <input value={newHotspot.price}
                      onChange={e => setNewHotspot({...newHotspot, price: e.target.value})}
                      placeholder="$249" />
                  </HsField>
                  <AddHsBtn onClick={addHotspot}>+ Agregar</AddHsBtn>
                </HotspotRow>
              </AddHotspotBox>

              <SaveBtn style={{ marginTop: 24 }} disabled={loading} onClick={saveHotspots}>
                {loading ? 'Guardando…' : 'GUARDAR HOTSPOTS'}
              </SaveBtn>
            </Section>

            {/* ── Productos del look ── */}
            <Section>
              <SectionTitle>Productos del look</SectionTitle>
              <SectionSub>Estos productos aparecen como tarjetas debajo del Shop the Look. Subí la foto, nombre y precio de cada prenda.</SectionSub>

              {/* Grid de productos existentes */}
              {artist.shopProducts?.length > 0 ? (
                <ProductGrid>
                  {artist.shopProducts.map((p, i) => (
                    <ProductItem key={i}>
                      <ProductItemImg>
                        {p.image ? <img src={p.image} alt={p.name} /> : <span>Sin imagen</span>}
                      </ProductItemImg>
                      <ProductItemInfo>
                        <strong>{p.name}</strong>
                        <span>{p.price}</span>
                      </ProductItemInfo>
                      <ProductItemDelete onClick={() => deleteShopProduct(i)}>✕ Eliminar</ProductItemDelete>
                    </ProductItem>
                  ))}
                </ProductGrid>
              ) : (
                <Empty>No hay productos aún. Agregá el primero abajo.</Empty>
              )}

              {/* Formulario para agregar producto */}
              <AddProductBox>
                <SectionTitle style={{ marginBottom: 16 }}>Agregar producto</SectionTitle>

                {/* Preview de imagen seleccionada */}
                <ProductImgPicker onClick={() => productImgRef.current?.click()}>
                  {newProduct.preview ? (
                    <img src={newProduct.preview} alt="preview" />
                  ) : (
                    <div className="placeholder">
                      <span>+</span>
                      <p>Seleccionar foto</p>
                    </div>
                  )}
                  {productProgress > 0 && (
                    <ProductImgUploading>
                      <span>{productProgress}%</span>
                    </ProductImgUploading>
                  )}
                  <input
                    ref={productImgRef}
                    type="file" accept="image/*" hidden
                    onChange={e => {
                      const f = e.target.files[0]
                      if (!f) return
                      setNewProduct(p => ({ ...p, file: f, preview: URL.createObjectURL(f) }))
                    }}
                  />
                </ProductImgPicker>

                <ProductFormFields>
                  <InfoGroup full>
                    <InfoLabel>Nombre del producto</InfoLabel>
                    <InfoInput
                      value={newProduct.name}
                      onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                      placeholder="OVERSIZE COAT"
                    />
                  </InfoGroup>
                  <InfoGroup>
                    <InfoLabel>Precio</InfoLabel>
                    <InfoInput
                      value={newProduct.price}
                      onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
                      placeholder="$249"
                    />
                  </InfoGroup>
                </ProductFormFields>

                <SaveBtn
                  style={{ marginTop: 20 }}
                  disabled={loading}
                  onClick={addShopProduct}
                >
                  {loading && productProgress > 0
                    ? `Subiendo… ${productProgress}%`
                    : '+ AGREGAR PRODUCTO'}
                </SaveBtn>
              </AddProductBox>
            </Section>
          </>
        )}
      </Main>
    </DashWrap>
  )
}

/* ── STYLES ─────────────────────────────────────────────────────────────── */
const PageWrapper  = styled.div`min-height:100vh;background:#f5f5f5;display:flex;align-items:center;justify-content:center;`
const LoginCard    = styled.div`background:white;padding:50px 40px;width:360px;box-shadow:0 4px 30px rgba(0,0,0,.08);text-align:center;
  h2{font-size:13px;font-weight:400;letter-spacing:.3em;margin:16px 0 30px;text-transform:uppercase;}
  form{display:flex;flex-direction:column;gap:14px;}
  input{border:none;border-bottom:1px solid #ccc;padding:10px 4px;font-size:13px;outline:none;}
  input:focus{border-bottom-color:#000;}
  button{margin-top:10px;background:#000;color:#fff;border:none;padding:14px;font-size:12px;letter-spacing:.2em;cursor:pointer;}
  button:hover{background:#333;}
  button:disabled{opacity:.5;cursor:not-allowed;}`
const Logo         = styled.div`font-size:22px;color:#111;`
const Err          = styled.p`color:red;font-size:12px;margin:0;`
const DashWrap     = styled.div`display:flex;min-height:100vh;background:#f5f5f5;`
const Side         = styled.aside`width:220px;min-width:220px;background:#111;color:white;display:flex;flex-direction:column;padding:30px 0;position:sticky;top:0;height:100vh;`
const SideName     = styled.div`font-size:13px;font-weight:500;padding:0 24px 4px;color:white;`
const SideSlug     = styled.div`font-size:10px;padding:0 24px 20px;color:#666;border-bottom:1px solid #222;`
const SideNav      = styled.nav`display:flex;flex-direction:column;padding:20px 0;flex:1;`
const SideItem     = styled.div`padding:13px 24px;font-size:12px;letter-spacing:.08em;cursor:pointer;
  color:${p=>p.active?'white':'#888'};background:${p=>p.active?'#222':'transparent'};
  border-left:3px solid ${p=>p.active?'white':'transparent'};transition:all .2s;
  &:hover{background:#222;color:white;}`
const LogoutBtn    = styled.button`margin:8px 16px 20px;background:transparent;border:1px solid #444;color:#888;padding:10px;font-size:11px;cursor:pointer;letter-spacing:.1em;
  &:hover{border-color:white;color:white;}`
const PreviewLink  = styled.a`display:block;text-align:center;font-size:11px;color:#888;letter-spacing:.05em;padding:8px 16px;text-decoration:none;&:hover{color:white;}`
const Main         = styled.main`flex:1;padding:40px;overflow-y:auto;`
const PageTitle    = styled.h1`font-size:14px;font-weight:400;letter-spacing:.3em;text-transform:uppercase;margin-bottom:24px;color:#111;`
const Toast        = styled.div`position:fixed;top:20px;right:20px;z-index:9999;background:#111;color:white;padding:14px 24px;font-size:13px;box-shadow:0 4px 20px rgba(0,0,0,.2);border-radius:2px;`
const Section      = styled.div`background:white;padding:28px 32px;margin-bottom:20px;box-shadow:0 1px 8px rgba(0,0,0,.05);`
const SectionTitle = styled.h3`font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:#111;font-weight:500;margin:0 0 6px;`
const SectionSub   = styled.p`font-size:11px;color:#999;margin:0 0 18px;`

/* Hero */
const HeroPreviewBox  = styled.div`position:relative;width:100%;height:280px;background:#111;overflow:hidden;margin-bottom:14px;`
const HeroVideo       = styled.video`width:100%;height:100%;object-fit:cover;`
const HeroPlaceholder = styled.div`width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#555;font-size:13px;`
const VideoDropZone   = styled.div`border:2px dashed ${p=>p.uploading?'#000':'#ddd'};padding:28px;text-align:center;cursor:pointer;transition:all .2s;
  background:${p=>p.uploading?'#f8f8f8':'transparent'};&:hover{border-color:#999;background:#fafafa;}`
const ProgressBar     = styled.div`width:100%;max-width:300px;height:3px;background:#eee;margin:10px auto 0;`
const ProgressFill    = styled.div`height:100%;background:#000;transition:width .3s;`
const DropIcon        = styled.div`font-size:28px;color:#ccc;margin-bottom:8px;`
const DropText        = styled.p`font-size:12px;color:#555;margin:0 0 4px;`
const DropHint        = styled.p`font-size:10px;color:#bbb;margin:0;letter-spacing:.05em;text-transform:uppercase;`

/* Image slots */
const SlotsGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;`
const SlotCard  = styled.div`background:white;border:1px solid #eee;cursor:pointer;overflow:hidden;
  box-shadow:0 1px 6px rgba(0,0,0,.04);transition:box-shadow .2s;
  &:hover{box-shadow:0 4px 16px rgba(0,0,0,.1);}`
const SlotNum   = styled.div`font-size:10px;letter-spacing:.2em;color:#888;padding:12px 14px 4px;`
const SlotLabel = styled.div`font-size:12px;font-weight:500;padding:0 14px 2px;`
const SlotHint  = styled.div`font-size:10px;color:#bbb;padding:0 14px 10px;`
const SlotPreview = styled.div`position:relative;width:100%;padding-bottom:150%;background:#f0f0f0;overflow:hidden;
  img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}
  &:hover > div{opacity:1;}`
const SlotOverlay = styled.div`position:absolute;inset:0;background:rgba(0,0,0,.45);opacity:0;transition:.2s;
  display:flex;align-items:center;justify-content:center;
  span{color:white;font-size:11px;letter-spacing:.15em;text-transform:uppercase;}`
const SlotEmpty = styled.div`width:100%;padding-bottom:150%;position:relative;background:#f8f8f8;
  &>div{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;}
  span{font-size:28px;color:#ccc;}
  p{font-size:10px;color:#bbb;margin:0;letter-spacing:.1em;text-transform:uppercase;}`
const SlotUploading = styled.div`width:100%;padding-bottom:150%;position:relative;background:#f8f8f8;
  &>div{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;}
  span{font-size:11px;color:#555;margin-bottom:6px;}`

/* Texts */
const InfoGrid     = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:16px 20px;@media(max-width:700px){grid-template-columns:1fr;}`
const InfoGroup    = styled.div`display:flex;flex-direction:column;gap:6px;grid-column:${p=>p.full?'span 2':'span 1'};`
const InfoLabel    = styled.label`font-size:10px;letter-spacing:.2em;color:#888;text-transform:uppercase;`
const InfoInput    = styled.input`border:none;border-bottom:1px solid #ddd;padding:8px 4px;font-size:13px;outline:none;width:100%;
  &:focus{border-bottom-color:#000;}`
const InfoTextarea = styled.textarea`border:1px solid #ddd;padding:10px;font-size:13px;outline:none;font-family:inherit;resize:vertical;width:100%;
  &:focus{border-color:#000;}`
const SaveBtn      = styled.button`background:#000;color:white;border:none;padding:14px 40px;font-size:11px;letter-spacing:.2em;cursor:pointer;display:block;
  &:hover{background:#333;}&:disabled{opacity:.5;cursor:not-allowed;}`

/* Shop */
const ShopImgPreview  = styled.div`position:relative;width:100%;max-width:460px;aspect-ratio:3/4;background:#f0f0f0;overflow:hidden;margin-bottom:12px;
  img{width:100%;height:100%;object-fit:cover;}`
const ShopImgEmpty    = styled.div`width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:12px;text-align:center;padding:20px;`
const ShopImgOverlay  = styled.div`position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;
  span{color:white;font-size:13px;}`
const UploadBtn       = styled.button`background:transparent;border:1px solid #000;padding:10px 24px;font-size:11px;letter-spacing:.15em;cursor:pointer;margin-bottom:0;
  &:hover{background:#000;color:white;}`

/* Hotspots */
const HotspotList     = styled.div`display:flex;flex-direction:column;gap:10px;margin-bottom:20px;`
const HotspotRow      = styled.div`display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;`
const HsField         = styled.div`display:flex;flex-direction:column;gap:4px;flex:${p=>p.grow?'1':'0 0 70px'};
  label{font-size:9px;letter-spacing:.15em;color:#999;text-transform:uppercase;}
  input{border:none;border-bottom:1px solid #ddd;padding:7px 4px;font-size:12px;outline:none;width:100%;
    &:focus{border-bottom-color:#000;}}`
const HsDelete        = styled.button`background:transparent;border:1px solid #ddd;color:#c00;width:32px;height:32px;cursor:pointer;font-size:12px;
  flex-shrink:0;align-self:flex-end;&:hover{background:#c00;color:white;border-color:#c00;}`
const AddHotspotBox   = styled.div`background:#f9f9f9;border:1px dashed #ddd;padding:20px;`
const AddHsBtn        = styled.button`background:#000;color:white;border:none;padding:8px 18px;font-size:10px;letter-spacing:.15em;cursor:pointer;
  flex-shrink:0;align-self:flex-end;&:hover{background:#333;}`
const Empty           = styled.p`text-align:center;color:#bbb;font-size:13px;padding:24px 0;`

/* Shop Products */
const ProductGrid      = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;margin-bottom:24px;`
const ProductItem      = styled.div`background:#fafafa;border:1px solid #eee;overflow:hidden;`
const ProductItemImg   = styled.div`aspect-ratio:2/3;background:#f0f0f0;overflow:hidden;position:relative;
  img{width:100%;height:100%;object-fit:cover;display:block;}
  span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;color:#bbb;}`
const ProductItemInfo  = styled.div`padding:10px 12px 6px;display:flex;flex-direction:column;gap:2px;
  strong{font-size:11px;font-weight:500;letter-spacing:.05em;}
  span{font-size:12px;color:#888;font-family:Georgia,serif;}`
const ProductItemDelete= styled.button`width:100%;background:transparent;border:none;border-top:1px solid #eee;
  padding:8px;font-size:10px;color:#c00;cursor:pointer;letter-spacing:.1em;
  &:hover{background:#c00;color:white;}`
const AddProductBox    = styled.div`background:#f9f9f9;border:1px dashed #ddd;padding:24px;`
const ProductImgPicker = styled.div`width:140px;aspect-ratio:2/3;background:#f0f0f0;border:2px dashed #ddd;
  cursor:pointer;overflow:hidden;position:relative;margin-bottom:16px;
  img{width:100%;height:100%;object-fit:cover;display:block;}
  .placeholder{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
    span{font-size:28px;color:#ccc;}
    p{font-size:10px;color:#bbb;margin:0;letter-spacing:.1em;text-transform:uppercase;}}
  &:hover{border-color:#999;}`
const ProductImgUploading = styled.div`position:absolute;inset:0;background:rgba(0,0,0,.5);
  display:flex;align-items:center;justify-content:center;
  span{color:white;font-size:13px;font-weight:500;}`
const ProductFormFields= styled.div`display:grid;grid-template-columns:1fr 1fr;gap:14px;`
