import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import axios from 'axios'

const API = process.env.REACT_APP_BACKEND_URL || 'https://zara-backend.vercel.app'

const emptyForm = {
    name: '', price: '', image: '', image1: '', image2: '',
    quanty: '', size: '', materialdesc: '', materialtype: '',
    care: '', origin: '', color: '', producttitle: ''
}

const AdminPage = () => {
    const [token, setToken] = useState(localStorage.getItem('adminToken') || '')
    const [loginData, setLoginData] = useState({ email: '', password: '' })
    const [loginError, setLoginError] = useState('')
    const [products, setProducts] = useState([])
    const [form, setForm] = useState(emptyForm)
    const [editingId, setEditingId] = useState(null)
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(false)
    const [tab, setTab] = useState('products') // 'products' | 'add' | 'artists' | 'home'
    const [searchTerm, setSearchTerm] = useState('')
    const [artistForm, setArtistForm] = useState({ name: '', slug: '', email: '', password: '' })
    const [artists, setArtists] = useState([])
    const [homeVideo, setHomeVideo] = useState('')
    const [homeVideoFile, setHomeVideoFile] = useState(null)
    const [homeVideoProgress, setHomeVideoProgress] = useState(0)
    const homeVideoRef = React.useRef()

    const headers = { Authorization: `Bearer ${token}` }

    // ── Fetch products ──────────────────────────────────────────────────────
    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API}/admin/products`, { headers })
            setProducts(res.data)
        } catch {
            setProducts([])
        }
    }

    // ── Fetch settings ──────────────────────────────────────────────────────
    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${API}/settings`)
            setHomeVideo(res.data.heroVideo || '')
        } catch {}
    }

    useEffect(() => {
        if (token) { fetchProducts(); fetchSettings() }
    }, [token])

    // ── Upload home video ───────────────────────────────────────────────────
    const uploadHomeVideo = async () => {
        if (!homeVideoFile) return
        setLoading(true); setHomeVideoProgress(0); setMsg('')
        const fd = new FormData()
        fd.append('video', homeVideoFile)
        try {
            const res = await axios.post(`${API}/settings/home-video`, fd, {
                headers: { ...headers, 'Content-Type': 'multipart/form-data' },
                onUploadProgress: e => setHomeVideoProgress(Math.round(e.loaded * 100 / e.total))
            })
            setHomeVideo(res.data.url)
            setHomeVideoFile(null)
            if (homeVideoRef.current) homeVideoRef.current.value = ''
            setMsg('✅ Video del home actualizado')
        } catch {
            setMsg('❌ Error subiendo video')
        }
        setLoading(false); setHomeVideoProgress(0)
        setTimeout(() => setMsg(''), 4000)
    }

    // ── Login ───────────────────────────────────────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setLoginError('')
        try {
            const res = await axios.post(`${API}/admin/login`, loginData)
            localStorage.setItem('adminToken', res.data.token)
            setToken(res.data.token)
        } catch {
            setLoginError('Credenciales incorrectas o sin acceso admin.')
        }
        setLoading(false)
    }

    const handleLogout = () => {
        localStorage.removeItem('adminToken')
        setToken('')
        setProducts([])
    }

    // ── Form ────────────────────────────────────────────────────────────────
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMsg('')
        try {
            if (editingId) {
                await axios.put(`${API}/admin/products/${editingId}`, form, { headers })
                setMsg('✅ Producto actualizado')
            } else {
                await axios.post(`${API}/admin/products`, form, { headers })
                setMsg('✅ Producto creado')
            }
            setForm(emptyForm)
            setEditingId(null)
            setTab('products')
            fetchProducts()
        } catch {
            setMsg('❌ Error al guardar')
        }
        setLoading(false)
        setTimeout(() => setMsg(''), 3000)
    }

    const handleEdit = (product) => {
        setForm({ ...emptyForm, ...product })
        setEditingId(product._id)
        setTab('add')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este producto?')) return
        try {
            await axios.delete(`${API}/admin/products/${id}`, { headers })
            setMsg('✅ Producto eliminado')
            fetchProducts()
            setTimeout(() => setMsg(''), 3000)
        } catch {
            setMsg('❌ Error al eliminar')
        }
    }

    const handleCancel = () => {
        setForm(emptyForm)
        setEditingId(null)
        setTab('products')
    }

    const filtered = products.filter(p =>
        (p.name || p.producttitle || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    // ── LOGIN SCREEN ────────────────────────────────────────────────────────
    if (!token) {
        return (
            <PageWrapper>
                <LoginBox>
                    <Logo>
                        <svg viewBox="0 0 132 55" xmlns="http://www.w3.org/2000/svg" width="100">
                            <path fillRule="evenodd" d="M105.673.035l19.557 53.338 6.77.002v.383h-21.548v-.383h6.344l-6.431-17.54H97.311v.007l.07.204c.521 1.548.78 3.17.764 4.803v6.575c0 3.382 1.494 6.81 4.347 6.81 1.675 0 3.012-.59 4.604-2.046l.227.211C105.594 54.224 103.5 55 100.36 55c-2.37 0-4.398-.57-6.03-1.693l-.309-.222c-2.148-1.624-3.542-4.278-4.142-7.89l-.096-.583-.1-.882-.01-.152-3.599 9.792h5.107v.384H80.496v-.384h5.162l3.951-10.753v-.023a34.924 34.924 0 0 1-.075-1.906v-4.693c0-5.77-4.29-9.08-11.771-9.08H70.41v26.458h6.371v.383h-24.9v-.383h6.345l-6.431-17.54H33.948l-6.371 17.346.266-.044c8.366-1.442 12.213-7.827 12.265-14.55h.388v15.171H0L30.06 2.185H17.972C7.954 2.185 3.42 9.922 3.35 17.635h-.387V1.8h36.488l-.222.385L9.396 53.373h15.695c.39 0 .778-.019 1.169-.05.26-.018.522-.044.788-.077l.095-.01L46.703 0h.387l.013.035 15.369 41.916V2.185h-6.328v-.39h21.778c10.467 0 17.774 5.372 17.774 13.068 0 5.612-5.005 10.27-12.45 11.595l-1.367.174 1.377.14c4.515.517 8.1 1.906 10.641 4.127l.017.016L105.273 0h.386l.014.035zm-8.552 35.32l.038.094h13.061l-8.773-23.928-7.221 19.67.039.037.367.364a11.876 11.876 0 0 1 2.489 3.762zM70.415 26.53V2.185h5.611c7.496 0 11.454 4.414 11.454 12.76 0 8.877-2.272 11.585-9.717 11.585h-7.348zM42.882 11.521L34.09 35.45h17.565L42.882 11.52z" />
                        </svg>
                    </Logo>
                    <h2>Panel de Administración</h2>
                    <form onSubmit={handleLogin}>
                        <input
                            type="email" placeholder="Email" required
                            value={loginData.email}
                            onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                        />
                        <input
                            type="password" placeholder="Contraseña" required
                            value={loginData.password}
                            onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                        />
                        {loginError && <ErrorMsg>{loginError}</ErrorMsg>}
                        <button type="submit" disabled={loading}>
                            {loading ? 'Ingresando...' : 'INGRESAR'}
                        </button>
                    </form>
                </LoginBox>
            </PageWrapper>
        )
    }

    // ── DASHBOARD ───────────────────────────────────────────────────────────
    return (
        <DashWrapper>
            {/* SIDEBAR */}
            <Sidebar>
                <SidebarLogo>
                    <svg viewBox="0 0 132 55" xmlns="http://www.w3.org/2000/svg" width="80">
                        <path fill="white" fillRule="evenodd" d="M105.673.035l19.557 53.338 6.77.002v.383h-21.548v-.383h6.344l-6.431-17.54H97.311v.007l.07.204c.521 1.548.78 3.17.764 4.803v6.575c0 3.382 1.494 6.81 4.347 6.81 1.675 0 3.012-.59 4.604-2.046l.227.211C105.594 54.224 103.5 55 100.36 55c-2.37 0-4.398-.57-6.03-1.693l-.309-.222c-2.148-1.624-3.542-4.278-4.142-7.89l-.096-.583-.1-.882-.01-.152-3.599 9.792h5.107v.384H80.496v-.384h5.162l3.951-10.753v-.023a34.924 34.924 0 0 1-.075-1.906v-4.693c0-5.77-4.29-9.08-11.771-9.08H70.41v26.458h6.371v.383h-24.9v-.383h6.345l-6.431-17.54H33.948l-6.371 17.346.266-.044c8.366-1.442 12.213-7.827 12.265-14.55h.388v15.171H0L30.06 2.185H17.972C7.954 2.185 3.42 9.922 3.35 17.635h-.387V1.8h36.488l-.222.385L9.396 53.373h15.695c.39 0 .778-.019 1.169-.05.26-.018.522-.044.788-.077l.095-.01L46.703 0h.387l.013.035 15.369 41.916V2.185h-6.328v-.39h21.778c10.467 0 17.774 5.372 17.774 13.068 0 5.612-5.005 10.27-12.45 11.595l-1.367.174 1.377.14c4.515.517 8.1 1.906 10.641 4.127l.017.016L105.273 0h.386l.014.035zm-8.552 35.32l.038.094h13.061l-8.773-23.928-7.221 19.67.039.037.367.364a11.876 11.876 0 0 1 2.489 3.762zM70.415 26.53V2.185h5.611c7.496 0 11.454 4.414 11.454 12.76 0 8.877-2.272 11.585-9.717 11.585h-7.348zM42.882 11.521L34.09 35.45h17.565L42.882 11.52z" />
                    </svg>
                    <span>ADMIN</span>
                </SidebarLogo>
                <SidebarNav>
                    <SidebarItem active={tab === 'products'} onClick={() => setTab('products')}>
                        📦 Productos ({products.length})
                    </SidebarItem>
                    <SidebarItem active={tab === 'add'} onClick={() => { setForm(emptyForm); setEditingId(null); setTab('add') }}>
                        ➕ Nuevo Producto
                    </SidebarItem>
                    <SidebarItem active={tab === 'artists'} onClick={() => setTab('artists')}>
                        🎨 Artistas
                    </SidebarItem>
                    <SidebarItem active={tab === 'home'} onClick={() => setTab('home')}>
                        🎬 Inicio
                    </SidebarItem>
                </SidebarNav>
                <LogoutBtn onClick={handleLogout}>Cerrar sesión</LogoutBtn>
            </Sidebar>

            {/* MAIN */}
            <Main>
                {msg && <Toast>{msg}</Toast>}

                {/* ── PRODUCTS LIST ── */}
                {tab === 'products' && (
                    <>
                        <PageTitle>Productos</PageTitle>
                        <SearchBar
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <ProductGrid>
                            {filtered.map(p => (
                                <ProductCard key={p._id}>
                                    <CardImg src={p.image || 'https://via.placeholder.com/200x250?text=Sin+imagen'} alt={p.name} />
                                    <CardBody>
                                        <CardTitle>{p.producttitle || p.name || 'Sin nombre'}</CardTitle>
                                        <CardPrice>{p.price}</CardPrice>
                                        <CardColor>{p.color}</CardColor>
                                        <CardActions>
                                            <EditBtn onClick={() => handleEdit(p)}>Editar</EditBtn>
                                            <DeleteBtn onClick={() => handleDelete(p._id)}>Eliminar</DeleteBtn>
                                        </CardActions>
                                    </CardBody>
                                </ProductCard>
                            ))}
                        </ProductGrid>
                        {filtered.length === 0 && <Empty>No hay productos aún. ¡Creá el primero!</Empty>}
                    </>
                )}

                {/* ── ARTISTS ── */}
                {tab === 'artists' && (
                    <>
                        <PageTitle>Gestión de Artistas</PageTitle>
                        <Form onSubmit={async (e) => {
                            e.preventDefault(); setLoading(true); setMsg('')
                            try {
                                await axios.post(`${API}/artist/create`, artistForm, { headers })
                                setMsg('✅ Artista creado. Ya puede ingresar al portal.')
                                setArtistForm({ name: '', slug: '', email: '', password: '' })
                            } catch (err) {
                                setMsg('❌ ' + (err.response?.data?.msg || 'Error'))
                            }
                            setLoading(false)
                            setTimeout(() => setMsg(''), 4000)
                        }}>
                            <PageTitle style={{fontSize:'12px'}}>Crear nueva cuenta de artista</PageTitle>
                            <FormGrid>
                                <FormGroup>
                                    <label>Nombre del artista *</label>
                                    <input value={artistForm.name} required
                                        onChange={e => setArtistForm({...artistForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')})}
                                        placeholder="Ej: Natalia Gomez" />
                                </FormGroup>
                                <FormGroup>
                                    <label>Slug (URL) *</label>
                                    <input value={artistForm.slug} required
                                        onChange={e => setArtistForm({...artistForm, slug: e.target.value})}
                                        placeholder="Ej: natalia-gomez" />
                                </FormGroup>
                                <FormGroup>
                                    <label>Email *</label>
                                    <input type="email" value={artistForm.email} required
                                        onChange={e => setArtistForm({...artistForm, email: e.target.value})}
                                        placeholder="artista@email.com" />
                                </FormGroup>
                                <FormGroup>
                                    <label>Contraseña *</label>
                                    <input type="password" value={artistForm.password} required
                                        onChange={e => setArtistForm({...artistForm, password: e.target.value})}
                                        placeholder="Contraseña inicial" />
                                </FormGroup>
                            </FormGrid>
                            <FormActions>
                                <SubmitBtn type="submit" disabled={loading}>
                                    {loading ? 'Creando...' : 'CREAR ARTISTA'}
                                </SubmitBtn>
                            </FormActions>
                            <p style={{fontSize:'11px',color:'#999',marginTop:'12px'}}>
                                El artista accede en: <strong>/artist-portal</strong> con su email y contraseña.
                            </p>
                        </Form>
                    </>
                )}

                {/* ── HOME ── */}
                {tab === 'home' && (
                    <>
                        <PageTitle>Video del Inicio</PageTitle>
                        <Form as="div">
                            <p style={{ fontSize: '11px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px' }}>
                                Este video aparece en la sección "No somos una tienda, somos arte" del homepage.
                            </p>

                            {/* Preview actual */}
                            {homeVideo && (
                                <div style={{ marginBottom: '28px' }}>
                                    <p style={{ fontSize: '10px', color: '#aaa', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '10px' }}>Video actual</p>
                                    <video
                                        src={homeVideo} controls muted
                                        style={{ width: '100%', maxWidth: '560px', maxHeight: '315px', objectFit: 'cover', display: 'block', background: '#000' }}
                                    />
                                </div>
                            )}

                            {/* Upload */}
                            <FormGroup style={{ maxWidth: '480px' }}>
                                <label>Subir nuevo video (mp4, mov, webm — máx 200MB)</label>
                                <input
                                    ref={homeVideoRef}
                                    type="file" accept="video/*"
                                    onChange={e => setHomeVideoFile(e.target.files[0])}
                                    style={{ border: 'none', borderBottom: '1px solid #ddd', padding: '8px 0', fontSize: '12px' }}
                                />
                            </FormGroup>

                            {homeVideoFile && (
                                <p style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                                    Seleccionado: {homeVideoFile.name}
                                </p>
                            )}

                            {homeVideoProgress > 0 && homeVideoProgress < 100 && (
                                <div style={{ marginTop: '16px', background: '#f0f0f0', height: '4px', borderRadius: '2px', maxWidth: '480px' }}>
                                    <div style={{ height: '100%', background: '#000', borderRadius: '2px', width: `${homeVideoProgress}%`, transition: 'width 0.3s' }} />
                                </div>
                            )}

                            <FormActions style={{ marginTop: '28px' }}>
                                <SubmitBtn type="button" disabled={loading || !homeVideoFile} onClick={uploadHomeVideo}>
                                    {loading ? `Subiendo... ${homeVideoProgress}%` : 'SUBIR VIDEO'}
                                </SubmitBtn>
                            </FormActions>
                        </Form>
                    </>
                )}

                {/* ── FORM ── */}
                {tab === 'add' && (
                    <>
                        <PageTitle>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</PageTitle>
                        <Form onSubmit={handleSubmit}>
                            <FormGrid>
                                <FormGroup>
                                    <label>Título del producto *</label>
                                    <input name="producttitle" value={form.producttitle} onChange={handleChange} placeholder="Ej: VESTIDO MIDI FLUIDO" required />
                                </FormGroup>
                                <FormGroup>
                                    <label>Nombre interno</label>
                                    <input name="name" value={form.name} onChange={handleChange} placeholder="Ej: vestido-midi-fluido" />
                                </FormGroup>
                                <FormGroup>
                                    <label>Precio *</label>
                                    <input name="price" value={form.price} onChange={handleChange} placeholder="Ej: $29.99" required />
                                </FormGroup>
                                <FormGroup>
                                    <label>Color</label>
                                    <input name="color" value={form.color} onChange={handleChange} placeholder="Ej: Negro" />
                                </FormGroup>
                                <FormGroup>
                                    <label>Talle</label>
                                    <input name="size" value={form.size} onChange={handleChange} placeholder="Ej: XS/S/M/L/XL" />
                                </FormGroup>
                                <FormGroup>
                                    <label>Stock</label>
                                    <input name="quanty" type="number" value={form.quanty} onChange={handleChange} placeholder="Ej: 50" />
                                </FormGroup>
                                <FormGroup span={2}>
                                    <label>Imagen principal (URL) *</label>
                                    <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." required />
                                </FormGroup>
                                <FormGroup span={2}>
                                    <label>Imagen 2 (URL)</label>
                                    <input name="image1" value={form.image1} onChange={handleChange} placeholder="https://..." />
                                </FormGroup>
                                <FormGroup span={2}>
                                    <label>Imagen 3 (URL)</label>
                                    <input name="image2" value={form.image2} onChange={handleChange} placeholder="https://..." />
                                </FormGroup>
                                <FormGroup span={2}>
                                    <label>Descripción del material</label>
                                    <textarea name="materialdesc" value={form.materialdesc} onChange={handleChange} placeholder="Ej: 100% algodón orgánico..." rows={3} />
                                </FormGroup>
                                <FormGroup>
                                    <label>Tipo de material</label>
                                    <input name="materialtype" value={form.materialtype} onChange={handleChange} placeholder="Ej: Tela" />
                                </FormGroup>
                                <FormGroup>
                                    <label>Cuidado</label>
                                    <input name="care" value={form.care} onChange={handleChange} placeholder="Ej: Lavar a 30°C" />
                                </FormGroup>
                                <FormGroup>
                                    <label>Origen</label>
                                    <input name="origin" value={form.origin} onChange={handleChange} placeholder="Ej: España" />
                                </FormGroup>
                            </FormGrid>

                            {form.image && (
                                <PreviewSection>
                                    <p>Vista previa:</p>
                                    <PreviewImg src={form.image} alt="preview" />
                                </PreviewSection>
                            )}

                            <FormActions>
                                <SubmitBtn type="submit" disabled={loading}>
                                    {loading ? 'Guardando...' : editingId ? 'ACTUALIZAR PRODUCTO' : 'CREAR PRODUCTO'}
                                </SubmitBtn>
                                <CancelBtn type="button" onClick={handleCancel}>Cancelar</CancelBtn>
                            </FormActions>
                        </Form>
                    </>
                )}
            </Main>
        </DashWrapper>
    )
}

export default AdminPage

// ── STYLES ──────────────────────────────────────────────────────────────────

const PageWrapper = styled.div`
    min-height: 100vh;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
`

const LoginBox = styled.div`
    background: white;
    padding: 50px 40px;
    width: 360px;
    box-shadow: 0 4px 30px rgba(0,0,0,0.08);
    text-align: center;
    h2 { font-size: 13px; font-weight: 400; letter-spacing: 0.3em; margin: 20px 0 30px; text-transform: uppercase; }
    form { display: flex; flex-direction: column; gap: 14px; }
    input { border: none; border-bottom: 1px solid #ccc; padding: 10px 4px; font-size: 13px; outline: none; background: transparent; }
    input:focus { border-bottom-color: #000; }
    button { margin-top: 10px; background: #000; color: #fff; border: none; padding: 14px; font-size: 12px; letter-spacing: 0.2em; cursor: pointer; }
    button:hover { background: #333; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
`

const Logo = styled.div`
    display: flex; justify-content: center; margin-bottom: 10px;
    svg path { fill: #000; }
`

const ErrorMsg = styled.p`
    color: red; font-size: 12px; margin: 0;
`

const DashWrapper = styled.div`
    display: flex; min-height: 100vh; background: #f5f5f5;
`

const Sidebar = styled.aside`
    width: 240px; min-width: 240px; background: #111; color: white;
    display: flex; flex-direction: column; padding: 30px 0;
    position: sticky; top: 0; height: 100vh;
    @media (max-width: 768px) { width: 60px; min-width: 60px; }
`

const SidebarLogo = styled.div`
    display: flex; flex-direction: column; align-items: center;
    gap: 8px; padding: 0 20px 30px; border-bottom: 1px solid #333;
    span { font-size: 10px; letter-spacing: 0.3em; color: #aaa; }
    @media (max-width: 768px) { span { display: none; } svg { width: 30px; } }
`

const SidebarNav = styled.nav`
    display: flex; flex-direction: column; padding: 20px 0; flex: 1;
`

const SidebarItem = styled.div`
    padding: 14px 24px; font-size: 12px; letter-spacing: 0.1em;
    cursor: pointer; color: ${p => p.active ? 'white' : '#888'};
    background: ${p => p.active ? '#222' : 'transparent'};
    border-left: 3px solid ${p => p.active ? 'white' : 'transparent'};
    transition: all 0.2s;
    &:hover { background: #222; color: white; }
    @media (max-width: 768px) { padding: 14px; font-size: 18px; }
`

const LogoutBtn = styled.button`
    margin: 20px; background: transparent; border: 1px solid #444;
    color: #888; padding: 10px; font-size: 11px; cursor: pointer;
    letter-spacing: 0.1em; transition: all 0.2s;
    &:hover { border-color: white; color: white; }
    @media (max-width: 768px) { font-size: 9px; padding: 8px 4px; }
`

const Main = styled.main`
    flex: 1; padding: 40px; overflow-y: auto;
    @media (max-width: 768px) { padding: 20px; }
`

const PageTitle = styled.h1`
    font-size: 14px; font-weight: 400; letter-spacing: 0.3em;
    text-transform: uppercase; margin-bottom: 30px; color: #111;
`

const SearchBar = styled.input`
    border: none; border-bottom: 1px solid #ccc; padding: 10px 4px;
    font-size: 13px; outline: none; margin-bottom: 30px;
    width: 300px; background: transparent;
    &:focus { border-bottom-color: #000; }
`

const Toast = styled.div`
    position: fixed; top: 20px; right: 20px; z-index: 100;
    background: #111; color: white; padding: 14px 24px;
    font-size: 13px; letter-spacing: 0.05em;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2); animation: fadeIn 0.3s;
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; } }
`

const ProductGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
`

const ProductCard = styled.div`
    background: white; overflow: hidden;
    box-shadow: 0 1px 8px rgba(0,0,0,0.06);
    transition: box-shadow 0.2s;
    &:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
`

const CardImg = styled.img`
    width: 100%; height: 260px; object-fit: cover; display: block;
`

const CardBody = styled.div`
    padding: 14px;
`

const CardTitle = styled.p`
    font-size: 11px; font-weight: 500; letter-spacing: 0.05em;
    text-transform: uppercase; margin: 0 0 4px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`

const CardPrice = styled.p`
    font-size: 12px; color: #555; margin: 0 0 2px;
`

const CardColor = styled.p`
    font-size: 11px; color: #999; margin: 0 0 12px; text-transform: uppercase;
`

const CardActions = styled.div`
    display: flex; gap: 8px;
`

const EditBtn = styled.button`
    flex: 1; padding: 8px; background: #000; color: white;
    border: none; font-size: 10px; letter-spacing: 0.1em; cursor: pointer;
    &:hover { background: #333; }
`

const DeleteBtn = styled.button`
    flex: 1; padding: 8px; background: white; color: #c00;
    border: 1px solid #c00; font-size: 10px; letter-spacing: 0.1em; cursor: pointer;
    &:hover { background: #c00; color: white; }
`

const Empty = styled.p`
    text-align: center; color: #999; font-size: 13px; margin-top: 60px;
`

const Form = styled.form`
    background: white; padding: 40px;
    box-shadow: 0 1px 8px rgba(0,0,0,0.06); max-width: 900px;
`

const FormGrid = styled.div`
    display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
    @media (max-width: 600px) { grid-template-columns: 1fr; }
`

const FormGroup = styled.div`
    display: flex; flex-direction: column; gap: 6px;
    grid-column: ${p => p.span ? `span ${p.span}` : 'span 1'};
    label { font-size: 10px; letter-spacing: 0.2em; color: #888; text-transform: uppercase; }
    input, textarea {
        border: none; border-bottom: 1px solid #ddd; padding: 8px 4px;
        font-size: 13px; outline: none; font-family: inherit; resize: vertical;
    }
    input:focus, textarea:focus { border-bottom-color: #000; }
`

const PreviewSection = styled.div`
    margin-top: 24px;
    p { font-size: 11px; color: #888; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 10px; }
`

const PreviewImg = styled.img`
    width: 160px; height: 200px; object-fit: cover; display: block;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`

const FormActions = styled.div`
    display: flex; gap: 16px; margin-top: 36px;
`

const SubmitBtn = styled.button`
    padding: 14px 40px; background: #000; color: white; border: none;
    font-size: 11px; letter-spacing: 0.2em; cursor: pointer;
    &:hover { background: #333; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const CancelBtn = styled.button`
    padding: 14px 30px; background: white; color: #000;
    border: 1px solid #ccc; font-size: 11px; letter-spacing: 0.2em; cursor: pointer;
    &:hover { border-color: #000; }
`
