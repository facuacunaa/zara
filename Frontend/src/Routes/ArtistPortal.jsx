import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import styled from 'styled-components'

const API = process.env.REACT_APP_BACKEND_URL || 'https://zara-backend.vercel.app'

export default function ArtistPortal() {
    const [token,   setToken]   = useState(localStorage.getItem('artistToken') || '')
    const [artist,  setArtist]  = useState(JSON.parse(localStorage.getItem('artistData') || 'null'))
    const [login,   setLogin]   = useState({ email: '', password: '' })
    const [loginErr,setLoginErr]= useState('')
    const [tab,     setTab]     = useState('images') // images | info
    const [msg,     setMsg]     = useState('')
    const [loading, setLoading] = useState(false)
    const [info,    setInfo]    = useState({ heroVideo: '', description: '', subtitle: '', quote: '' })
    const [dragging,setDragging]= useState(false)
    const fileRef    = useRef(null)
    const heroRef    = useRef(null)

    const headers = { Authorization: `Bearer ${token}` }

    useEffect(() => {
        if (artist) setInfo({
            heroVideo:   artist.heroVideo   || '',
            description: artist.description || '',
            subtitle:    artist.subtitle    || '',
            quote:       artist.quote       || '',
        })
    }, [artist])

    const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500) }

    // ── Login ──────────────────────────────────────────────────────────────
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

    // ── Refresh artist data ────────────────────────────────────────────────
    const refreshArtist = async () => {
        try {
            const res = await axios.get(`${API}/artist/${artist.slug}`)
            setArtist(res.data)
            localStorage.setItem('artistData', JSON.stringify(res.data))
        } catch {}
    }

    // ── Upload image ───────────────────────────────────────────────────────
    const uploadImage = async (file, isHero = false) => {
        if (!file) return
        if (file.size > 10 * 1024 * 1024) return flash('❌ La imagen supera 10MB')
        setLoading(true)
        const form = new FormData()
        form.append('image', file)
        try {
            const endpoint = isHero ? '/artist/images/hero' : '/artist/images/upload'
            await axios.post(`${API}${endpoint}`, form, {
                headers: { ...headers, 'Content-Type': 'multipart/form-data' }
            })
            await refreshArtist()
            flash(`✅ ${isHero ? 'Imagen hero' : 'Imagen'} subida correctamente`)
        } catch {
            flash('❌ Error al subir la imagen')
        }
        setLoading(false)
    }

    // ── Delete image ───────────────────────────────────────────────────────
    const deleteImage = async (idx) => {
        if (!window.confirm('¿Eliminar esta imagen?')) return
        try {
            await axios.delete(`${API}/artist/images/${idx}`, { headers })
            await refreshArtist()
            flash('✅ Imagen eliminada')
        } catch { flash('❌ Error al eliminar') }
    }

    // ── Save info ──────────────────────────────────────────────────────────
    const saveInfo = async (e) => {
        e.preventDefault(); setLoading(true)
        try {
            await axios.put(`${API}/artist/content/update`, info, { headers })
            await refreshArtist()
            flash('✅ Información actualizada')
        } catch { flash('❌ Error al guardar') }
        setLoading(false)
    }

    // ── Drag & Drop ────────────────────────────────────────────────────────
    const onDrop = (e) => {
        e.preventDefault(); setDragging(false)
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
        files.forEach(f => uploadImage(f))
    }

    /* ── LOGIN SCREEN ──────────────────────────────────────────────────── */
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

    /* ── DASHBOARD ─────────────────────────────────────────────────────── */
    return (
        <DashWrap>
            {/* SIDEBAR */}
            <Side>
                <SideName>{artist.name}</SideName>
                <SideSlug>/{artist.slug}</SideSlug>
                <SideNav>
                    <SideItem active={tab === 'images'} onClick={() => setTab('images')}>🖼️ Imágenes</SideItem>
                    <SideItem active={tab === 'info'}   onClick={() => setTab('info')}>✏️ Contenido</SideItem>
                </SideNav>
                <LogoutBtn onClick={logout}>Cerrar sesión</LogoutBtn>
            </Side>

            {/* MAIN */}
            <Main>
                {msg && <Toast>{msg}</Toast>}

                {/* ── IMÁGENES ── */}
                {tab === 'images' && (
                    <>
                        <PageTitle>Gestión de Imágenes</PageTitle>

                        {/* Hero image */}
                        <Section>
                            <SectionTitle>Imagen Hero (portada)</SectionTitle>
                            <SectionSub>Esta imagen aparece como fondo principal de tu página.</SectionSub>
                            <HeroPreviewBox>
                                {artist.heroImage
                                    ? <HeroPreview src={artist.heroImage} alt="hero" />
                                    : <HeroPlaceholder>Sin imagen hero</HeroPlaceholder>
                                }
                                <HeroOverlay>
                                    <UploadBtn onClick={() => heroRef.current?.click()} disabled={loading}>
                                        {loading ? 'Subiendo...' : '📷 Cambiar imagen hero'}
                                    </UploadBtn>
                                </HeroOverlay>
                            </HeroPreviewBox>
                            <input ref={heroRef} type="file" accept="image/*" hidden
                                onChange={e => uploadImage(e.target.files[0], true)} />
                        </Section>

                        {/* Gallery images */}
                        <Section>
                            <SectionTitle>Galería editorial ({artist.images?.length || 0} imágenes)</SectionTitle>
                            <SectionSub>Estas imágenes aparecen una debajo de la otra en tu página. Arrastrá o hacé click para agregar.</SectionSub>

                            {/* Drop zone */}
                            <DropZone
                                dragging={dragging}
                                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={onDrop}
                                onClick={() => fileRef.current?.click()}
                            >
                                <DropIcon>{loading ? '⏳' : '+'}</DropIcon>
                                <DropText>{loading ? 'Subiendo...' : 'Arrastrá imágenes aquí o hacé click'}</DropText>
                                <DropHint>JPG, PNG, WEBP · Máx. 10MB por imagen</DropHint>
                                <input ref={fileRef} type="file" accept="image/*" multiple hidden
                                    onChange={e => Array.from(e.target.files).forEach(f => uploadImage(f))} />
                            </DropZone>

                            {/* Gallery grid */}
                            {artist.images?.length > 0 && (
                                <GalleryGrid>
                                    {artist.images.map((url, i) => (
                                        <GalleryItem key={i}>
                                            <GalleryImg src={url} alt={`img ${i+1}`} />
                                            <GalleryOverlay>
                                                <GalleryNum>#{i+1}</GalleryNum>
                                                <DeleteImgBtn onClick={() => deleteImage(i)}>✕ Eliminar</DeleteImgBtn>
                                            </GalleryOverlay>
                                        </GalleryItem>
                                    ))}
                                </GalleryGrid>
                            )}
                            {(!artist.images || artist.images.length === 0) && (
                                <Empty>No hay imágenes aún. ¡Subí la primera!</Empty>
                            )}
                        </Section>
                    </>
                )}

                {/* ── INFO ── */}
                {tab === 'info' && (
                    <>
                        <PageTitle>Contenido de la Página</PageTitle>
                        <Section>
                            <form onSubmit={saveInfo}>
                                <InfoGrid>
                                    <InfoGroup>
                                        <InfoLabel>Subtítulo (aparece bajo el nombre)</InfoLabel>
                                        <InfoInput
                                            value={info.subtitle}
                                            onChange={e => setInfo({...info, subtitle: e.target.value})}
                                            placeholder="Ej: COLECCIÓN EXCLUSIVA · 2024"
                                        />
                                    </InfoGroup>
                                    <InfoGroup>
                                        <InfoLabel>Video hero (URL de YouTube o directo)</InfoLabel>
                                        <InfoInput
                                            value={info.heroVideo}
                                            onChange={e => setInfo({...info, heroVideo: e.target.value})}
                                            placeholder="https://..."
                                        />
                                        {info.heroVideo && (
                                            <VideoHint>✅ Video configurado. Se mostrará si no hay imagen hero.</VideoHint>
                                        )}
                                    </InfoGroup>
                                    <InfoGroup full>
                                        <InfoLabel>Descripción / texto editorial</InfoLabel>
                                        <InfoTextarea
                                            value={info.description}
                                            onChange={e => setInfo({...info, description: e.target.value})}
                                            placeholder="Escribí sobre tu colección..."
                                            rows={4}
                                        />
                                    </InfoGroup>
                                    <InfoGroup full>
                                        <InfoLabel>Frase / cita (aparece sobre imágenes)</InfoLabel>
                                        <InfoTextarea
                                            value={info.quote}
                                            onChange={e => setInfo({...info, quote: e.target.value})}
                                            placeholder={`"Una conversación entre la forma y el silencio..."`}
                                            rows={2}
                                        />
                                    </InfoGroup>
                                </InfoGrid>
                                <SaveBtn type="submit" disabled={loading}>
                                    {loading ? 'Guardando...' : 'GUARDAR CAMBIOS'}
                                </SaveBtn>
                            </form>
                        </Section>

                        {/* Preview */}
                        <Section>
                            <SectionTitle>Vista previa de tu página</SectionTitle>
                            <PreviewLink href={`/natalia-gomez`} target="_blank">
                                Ver página → zara.vercel.app/natalia-gomez ↗
                            </PreviewLink>
                        </Section>
                    </>
                )}
            </Main>
        </DashWrap>
    )
}

/* ── STYLES ────────────────────────────────────────────────────────────── */
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
const Side         = styled.aside`width:240px;min-width:240px;background:#111;color:white;display:flex;flex-direction:column;padding:30px 0;position:sticky;top:0;height:100vh;`
const SideName     = styled.div`font-size:13px;font-weight:500;padding:0 24px 4px;color:white;`
const SideSlug     = styled.div`font-size:10px;padding:0 24px 24px;color:#666;border-bottom:1px solid #222;`
const SideNav      = styled.nav`display:flex;flex-direction:column;padding:20px 0;flex:1;`
const SideItem     = styled.div`padding:14px 24px;font-size:12px;letter-spacing:.1em;cursor:pointer;
  color:${p=>p.active?'white':'#888'};background:${p=>p.active?'#222':'transparent'};
  border-left:3px solid ${p=>p.active?'white':'transparent'};transition:all .2s;
  &:hover{background:#222;color:white;}`
const LogoutBtn    = styled.button`margin:20px;background:transparent;border:1px solid #444;color:#888;padding:10px;font-size:11px;cursor:pointer;letter-spacing:.1em;
  &:hover{border-color:white;color:white;}`
const Main         = styled.main`flex:1;padding:40px;overflow-y:auto;`
const PageTitle    = styled.h1`font-size:14px;font-weight:400;letter-spacing:.3em;text-transform:uppercase;margin-bottom:30px;color:#111;`
const Toast        = styled.div`position:fixed;top:20px;right:20px;z-index:100;background:#111;color:white;padding:14px 24px;font-size:13px;box-shadow:0 4px 20px rgba(0,0,0,.2);`
const Section      = styled.div`background:white;padding:32px;margin-bottom:24px;box-shadow:0 1px 8px rgba(0,0,0,.05);`
const SectionTitle = styled.h3`font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:#111;font-weight:500;margin:0 0 6px;`
const SectionSub   = styled.p`font-size:11px;color:#999;margin:0 0 20px;`
const HeroPreviewBox=styled.div`position:relative;width:100%;height:280px;background:#f0f0f0;overflow:hidden;`
const HeroPreview  = styled.img`width:100%;height:100%;object-fit:cover;`
const HeroPlaceholder=styled.div`width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:13px;`
const HeroOverlay  = styled.div`position:absolute;bottom:16px;left:50%;transform:translateX(-50%);`
const UploadBtn    = styled.button`background:white;border:none;padding:12px 24px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,.15);
  &:hover{background:#f0f0f0;} &:disabled{opacity:.5;cursor:not-allowed;}`
const DropZone     = styled.div`border:2px dashed ${p=>p.dragging?'#000':'#ddd'};padding:40px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:24px;
  background:${p=>p.dragging?'#f8f8f8':'transparent'};&:hover{border-color:#999;background:#fafafa;}`
const DropIcon     = styled.div`font-size:32px;color:#ccc;margin-bottom:8px;`
const DropText     = styled.p`font-size:12px;color:#555;margin:0 0 4px;`
const DropHint     = styled.p`font-size:10px;color:#bbb;margin:0;letter-spacing:.05em;text-transform:uppercase;`
const GalleryGrid  = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;`
const GalleryItem  = styled.div`position:relative;aspect-ratio:2/3;overflow:hidden;background:#f0f0f0;
  &:hover > div{opacity:1;}`
const GalleryImg   = styled.img`width:100%;height:100%;object-fit:cover;`
const GalleryOverlay=styled.div`position:absolute;inset:0;background:rgba(0,0,0,.5);opacity:0;transition:.2s;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;`
const GalleryNum   = styled.span`color:white;font-size:11px;letter-spacing:.1em;`
const DeleteImgBtn = styled.button`background:white;color:#c00;border:none;padding:8px 16px;font-size:10px;cursor:pointer;letter-spacing:.1em;
  &:hover{background:#c00;color:white;}`
const Empty        = styled.p`text-align:center;color:#bbb;font-size:13px;padding:40px 0;`
const InfoGrid     = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:20px;@media(max-width:600px){grid-template-columns:1fr;}`
const InfoGroup    = styled.div`display:flex;flex-direction:column;gap:6px;grid-column:${p=>p.full?'span 2':'span 1'};`
const InfoLabel    = styled.label`font-size:10px;letter-spacing:.2em;color:#888;text-transform:uppercase;`
const InfoInput    = styled.input`border:none;border-bottom:1px solid #ddd;padding:8px 4px;font-size:13px;outline:none;&:focus{border-bottom-color:#000;}`
const InfoTextarea = styled.textarea`border:1px solid #ddd;padding:10px;font-size:13px;outline:none;font-family:inherit;resize:vertical;&:focus{border-color:#000;}`
const VideoHint    = styled.p`font-size:10px;color:green;margin:4px 0 0;`
const SaveBtn      = styled.button`margin-top:24px;background:#000;color:white;border:none;padding:14px 40px;font-size:11px;letter-spacing:.2em;cursor:pointer;
  &:hover{background:#333;}&:disabled{opacity:.5;cursor:not-allowed;}`
const PreviewLink  = styled.a`font-size:12px;color:#000;text-decoration:underline;letter-spacing:.05em;`
