import React, { useState, useRef, useEffect } from 'react'
import {
  Download, X, ChevronLeft, ChevronRight, Image as ImageIcon,
  Palette, Type, Eye, Upload, Save, Settings, Check, Square,
  Grid, Layout, Sliders, BookOpen, Phone, Star
} from 'lucide-react'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const san = (v) => {
  if (v == null) return ''
  return String(v)
    .replace(/[áàâä]/g,'a').replace(/[éèêë]/g,'e').replace(/[íìîï]/g,'i')
    .replace(/[óòôö]/g,'o').replace(/[úùûü]/g,'u')
    .replace(/Á/g,'A').replace(/É/g,'E').replace(/Í/g,'I').replace(/Ó/g,'O').replace(/Ú/g,'U')
    .replace(/ñ/g,'n').replace(/Ñ/g,'N')
    .replace(/[^\x20-\x7E]/g,'').trim()
}
const st = (v, fb = 'N/A') => { const s = san(v); return s.length ? s : fb }
const hexToRgb = (hex = '#000') => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : { r:0,g:0,b:0 }
}
const loadAndResizeImage = (url, maxWidth = 1200, quality = 0.92) => new Promise(resolve => {
  if (!url) return resolve(null)
  const img = new window.Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const c = document.createElement('canvas')
    let w = img.width, h = img.height
    if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth }
    c.width = w; c.height = h
    const ctx = c.getContext('2d')
    ctx.drawImage(img, 0, 0, w, h)
    const fmt = url.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'
    resolve(c.toDataURL(fmt, fmt === 'image/png' ? undefined : quality))
  }
  img.onerror = () => resolve(null)
  img.src = url
})
const fileToDataUrl = (file) => new Promise(resolve => {
  const r = new FileReader(); r.onload = e => resolve(e.target.result); r.readAsDataURL(file)
})

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_COLORS = {
  primary:   '#1A1A1A',
  accent:    '#E8C547',
  light:     '#F8F6F1',
  white:     '#FFFFFF',
  text:      '#2C2C2C',
  muted:     '#888888',
  border:    '#E0DDD5',
}

const DEFAULT_CFG = {
  brand:        'YNK TRADING',
  coleccion:    'NEW COLLECTION 2026',
  slogan:       'Optimizando su cadena de suministro con calidad garantizada.',
  tagline:      'MULTIPURPOSE PRODUCT CATALOG',
  coverImage:   null,
  logoImage:    null,
  colors:       { ...DEFAULT_COLORS },
  contacto: {
    nombre:      'Asesor Comercial',
    whatsapp:    '+507 XXXX-XXXX',
    email:       'comercial@ynktrading.com',
    ubicacion:   'Ciudad de Panama | Zona Libre',
    descripcion: 'Nuestro equipo esta listo para gestionar sus importaciones de alto volumen. Solicite asesoria personalizada para la configuracion y despacho de su proximo contenedor.',
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PREVIEW COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

function PortadaPreview({ config }) {
  const { colors, brand, coleccion, tagline, slogan, coverImage, logoImage } = config
  return (
    <div style={{ width:'100%', aspectRatio:'210/297', position:'relative', overflow:'hidden', background:'#1a1a1a', fontFamily:'"Georgia", serif' }}>
      {coverImage ? <img src={coverImage} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'65%', objectFit:'cover', objectPosition:'top' }} /> : <div style={{ position:'absolute', top:0, left:0, right:0, height:'65%', background:'linear-gradient(135deg,#2a2a2a 0%,#444 50%,#333 100%)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'6px' }}><ImageIcon size={32} color="#555" /><span style={{ color:'#444', fontSize:'7px', fontFamily:'sans-serif', letterSpacing:'0.12em' }}>IMAGEN DE PORTADA</span></div>}
      <div style={{ position:'absolute', top:0, left:0, width:'28px', height:'28px', background:colors.accent, zIndex:10 }} />
      <div style={{ position:'absolute', top:'4px', left:'4px', zIndex:11, background:'rgba(255,255,255,0.92)', padding:'3px 6px', borderRadius:'2px' }}>
        {logoImage ? <img src={logoImage} alt="logo" style={{ height:'18px', objectFit:'contain' }} /> : <span style={{ fontSize:'7px', fontWeight:'900', color:'#111', fontFamily:'sans-serif', letterSpacing:'0.05em' }}>{brand.slice(0,8)}</span>}
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'37%', background:colors.white, padding:'14px 16px 10px' }}>
        <div style={{ position:'absolute', top:0, left:'16px', width:'40px', height:'3px', background:colors.accent }} />
        <div style={{ marginTop:'6px' }}>
          <div style={{ fontSize:'7px', fontFamily:'sans-serif', letterSpacing:'0.18em', color:colors.muted, marginBottom:'4px', textTransform:'uppercase' }}>{tagline}</div>
          <div style={{ fontSize:'22px', fontWeight:'900', color:colors.text, lineHeight:1, letterSpacing:'-0.01em', textTransform:'uppercase' }}>PRODUCT</div>
          <div style={{ fontSize:'22px', fontWeight:'900', color:colors.text, lineHeight:1, letterSpacing:'-0.01em', textTransform:'uppercase' }}>CATALOG</div>
          <div style={{ display:'inline-block', background:colors.accent, padding:'3px 10px', borderRadius:'2px', marginTop:'8px', marginBottom:'8px' }}><span style={{ fontSize:'7px', fontWeight:'700', fontFamily:'sans-serif', letterSpacing:'0.1em', color:'#111' }}>{coleccion}</span></div>
          <div style={{ fontSize:'6px', color:colors.muted, fontFamily:'sans-serif', lineHeight:1.6, maxWidth:'160px' }}>{slogan}</div>
        </div>
        <div style={{ position:'absolute', bottom:'10px', right:'16px', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'2px' }}>
          <div style={{ fontSize:'5.5px', fontWeight:'700', fontFamily:'sans-serif', color:colors.accent, letterSpacing:'0.08em' }}>GET IN TOUCH!</div>
          <div style={{ fontSize:'5px', color:colors.muted, fontFamily:'sans-serif' }}>ynktrading.com</div>
        </div>
      </div>
    </div>
  )
}

function CategoriaPreview({ pagina, config, pageNum }) {
  const { colors } = config
  const catColor = pagina.color || colors.accent
  const { nombre, descripcion, heroImage, heroFooter, fondoImagen, fondoOpacity = 0.08, telas = [], headerBackground = colors.white } = pagina
  const restTelas = telas.slice(0, 9)

  return (
    <div style={{ width:'100%', aspectRatio:'210/297', position:'relative', overflow:'hidden', background:colors.white, fontFamily:'"Georgia",serif' }}>
      {fondoImagen && <img src={fondoImagen} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:fondoOpacity, zIndex:0 }} />}
      <div style={{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', height:'100%' }}>
        <div style={{ background: headerBackground, borderBottom:`3px solid ${catColor}`, padding:'8px 14px 7px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:'5px', fontFamily:'sans-serif', letterSpacing:'0.14em', color:colors.muted, textTransform:'uppercase' }}>{config.brand}</div>
            <div style={{ fontSize:'13px', fontWeight:'900', color:colors.text, textTransform:'uppercase', letterSpacing:'0.01em', lineHeight:1 }}>{nombre || 'Colección'}</div>
            <div style={{ fontSize:'5.5px', fontFamily:'sans-serif', letterSpacing:'0.1em', color:catColor, fontWeight:'700', marginTop:'1px' }}>COLLECTION</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'2px' }}>
            <div style={{ background:catColor, padding:'2px 7px', borderRadius:'2px' }}><span style={{ fontSize:'5px', fontWeight:'700', fontFamily:'sans-serif', color:'#fff' }}>{config.coleccion}</span></div>
            {descripcion && <div style={{ fontSize:'4.5px', color:colors.muted, fontFamily:'sans-serif', maxWidth:'90px', textAlign:'right', lineHeight:1.4 }}>{descripcion.slice(0,55)}</div>}
          </div>
        </div>
        <div style={{ flex:1, display:'flex', gap:0, overflow:'hidden' }}>
          <div style={{ width:'42%', display:'flex', flexDirection:'column', borderRight:`1px solid ${colors.border}` }}>
            <div style={{ flex:1, background:'#f5f5f0', position:'relative', overflow:'hidden' }}>
              {heroImage ? <img src={heroImage} alt="Hero" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', flexDirection:'column', gap:'4px' }}><Upload size={22} color="#ccc" /><span style={{ fontSize:'5px', color:'#ccc', fontFamily:'sans-serif', textAlign:'center', padding:'0 8px' }}>Sube una imagen</span></div>}
              <div style={{ position:'absolute', top:0, right:0, background:catColor, padding:'3px 6px' }}><Star size={7} color="#fff" fill="#fff" /></div>
            </div>
            <div style={{ padding:'7px 9px', background:colors.white, borderTop:`2px solid ${catColor}` }}>
              {heroFooter ? <div style={{ fontSize:'6px', fontFamily:'sans-serif', color:colors.text, fontWeight:'500', textAlign:'center', lineHeight:1.4 }}>{heroFooter}</div> : <div style={{ fontSize:'5px', fontFamily:'sans-serif', color:colors.muted, textAlign:'center', fontStyle:'italic' }}>Agrega una descripción</div>}
          </div>
          </div>
          <div style={{ flex:1, padding:'6px', display:'flex', flexDirection:'column', gap:'4px', overflow:'hidden' }}>
            {telas.length === 0 ? <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#ccc', fontSize:'8px' }}>Sin telas asignadas</div> : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'4px' }}>
                {restTelas.map((tela, i) => {
                  const img = tela.imagenes_tela?.find(x=>x.es_principal)?.imagen_url || tela.imagenes_tela?.[0]?.imagen_url
                  return (
                    <div key={i} style={{ background:'#fff', borderRadius:'2px', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', border:`1px solid ${colors.border}` }}>
                      <div style={{ aspectRatio:'1/1', background:'#f5f5f0', overflow:'hidden', position:'relative' }}>
                        {img ? <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}><ImageIcon size={12} color="#ddd" /></div>}
                        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'2px', background:catColor }} />
                      </div>
                      <div style={{ padding:'3px 4px', fontFamily:'sans-serif' }}>
                        <div style={{ fontSize:'3.5px', color:catColor, fontWeight:'700', letterSpacing:'0.05em' }}>{(tela.referencia||'REF').slice(0,12)}</div>
                        <div style={{ fontSize:'5px', fontWeight:'700', color:colors.text, lineHeight:1.2, marginTop:'1px' }}>{(tela.nombre||'Producto').slice(0,18)}</div>
                        <div style={{ fontSize:'3.5px', color:colors.muted, marginTop:'1px' }}>{(tela.composicion||'').slice(0,20)}</div>
                        <div style={{ display:'flex', gap:'2px', marginTop:'2px', flexWrap:'wrap' }}>{tela.tela_colores?.slice(0,5).map((tc,ci)=><div key={ci} style={{ width:5, height:5, borderRadius:'50%', background:tc.colores?.codigo_hex||'#ccc', border:'0.3px solid rgba(0,0,0,0.12)' }} />)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {telas.length > 9 && <div style={{ textAlign:'center', marginTop:'4px', fontSize:'5px', color:colors.muted }}>+{telas.length - 9} referencias adicionales</div>}
          </div>
        </div>
        <div style={{ background:colors.primary, padding:'4px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:'5px', color:'rgba(255,255,255,0.5)', fontFamily:'sans-serif', letterSpacing:'0.08em' }}>{config.brand} · {config.coleccion}</span>
          <span style={{ fontSize:'5px', color:catColor, fontFamily:'sans-serif', fontWeight:'700' }}>{String(pageNum).padStart(2,'0')}</span>
        </div>
      </div>
    </div>
  )
}

function ContactoPreview({ config }) {
  const { colors, brand, contacto, logoImage } = config
  return (
    <div style={{ width:'100%', aspectRatio:'210/297', overflow:'hidden', fontFamily:'"Georgia",serif', background:colors.white, display:'flex', flexDirection:'column', position:'relative' }}>
      <div style={{ background:colors.primary, padding:'24px 20px 20px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, right:0, width:'40px', height:'40px', background:colors.accent, opacity:0.9 }} />
        <div style={{ position:'absolute', bottom:'-15px', left:'20px', width:'80px', height:'80px', borderRadius:'50%', background:colors.accent, opacity:0.06 }} />
        <div style={{ position:'relative', zIndex:2 }}>
          {logoImage ? <img src={logoImage} alt="" style={{ height:'22px', objectFit:'contain', filter:'brightness(10)', marginBottom:'10px' }} /> : <div style={{ fontSize:'14px', fontWeight:'900', color:'#fff', letterSpacing:'0.06em', marginBottom:'8px' }}>{brand}</div>}
          <div style={{ fontSize:'6px', color:colors.accent, letterSpacing:'0.18em', fontFamily:'sans-serif', marginBottom:'10px' }}>SOLUCIONES TEXTILES A GRAN ESCALA</div>
          <div style={{ fontSize:'6px', color:'rgba(255,255,255,0.55)', fontFamily:'sans-serif', lineHeight:1.7, maxWidth:'150px' }}>{contacto.descripcion}</div>
        </div>
      </div>
      <div style={{ flex:1, padding:'20px', display:'flex', alignItems:'center', justifyContent:'center', background:colors.light }}>
        <div style={{ background:colors.white, border:`1px solid ${colors.border}`, borderTop:`3px solid ${colors.accent}`, borderRadius:'3px', padding:'18px 20px', width:'85%', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize:'5.5px', fontFamily:'sans-serif', letterSpacing:'0.15em', color:colors.muted, marginBottom:'8px', textTransform:'uppercase' }}>Atencion Directa</div>
          <div style={{ fontSize:'13px', fontWeight:'700', color:colors.text, marginBottom:'14px' }}>{contacto.nombre}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {[{ icon:'W', label:'WhatsApp', val: contacto.whatsapp },{ icon:'@', label:'Email', val: contacto.email },{ icon:'L', label:'Ubicacion', val: contacto.ubicacion }].map(({ icon, label, val }, i) => (
              <div key={i} style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                <div style={{ width:'16px', height:'16px', background:colors.accent, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:'5.5px', fontWeight:'900', color:'#111' }}>{icon}</span></div>
                <div><div style={{ fontSize:'4.5px', fontFamily:'sans-serif', color:colors.muted, letterSpacing:'0.08em' }}>{label.toUpperCase()}</div><div style={{ fontSize:'6.5px', fontFamily:'sans-serif', color:colors.text }}>{val}</div></div>
              </div>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${colors.border}`, marginTop:'12px', paddingTop:'8px', fontSize:'5px', color:colors.muted, fontFamily:'sans-serif', letterSpacing:'0.07em', textAlign:'center' }}>PROGRAME UNA VISITA O VIDEOLLAMADA</div>
        </div>
      </div>
      <div style={{ background:colors.primary, padding:'8px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'5px', color:'rgba(255,255,255,0.4)', fontFamily:'sans-serif', fontStyle:'italic' }}>{config.slogan}</span>
        <div style={{ width:'14px', height:'14px', background:colors.accent }} />
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PDF BUILDER CORREGIDO - Calidad de imágenes y márgenes mejorados
// ══════════════════════════════════════════════════════════════════════════════
async function buildPDF(paginas, config) {
  const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4', compress: false })
  const W = 210, H = 297
  const { colors, brand, coleccion, slogan, tagline, coverImage, logoImage, contacto } = config
  const rgb = (hex) => { const { r,g,b } = hexToRgb(hex); return [r,g,b] }
  const fill = (x,y,w,h,hex) => { pdf.setFillColor(...rgb(hex)); pdf.rect(x,y,w,h,'F') }
  const t = (text,x,y,opts={}) => { const s=san(text); if(s) pdf.text(s,x,y,opts) }

  let globalPage = 1

  for (let pi = 0; pi < paginas.length; pi++) {
    if (pi > 0) pdf.addPage()
    const pag = paginas[pi]

    // ─── PORTADA ───────────────────────────────────────────────────────────
    if (pag.tipo === 'portada') {
      // Imagen de portada con mayor calidad
      const imgData = coverImage ? await loadAndResizeImage(coverImage, 2000, 0.95) : null
      if (imgData) {
        pdf.addImage(imgData, 'JPEG', 0, 0, W, H * 0.65, undefined, 'FAST')
      } else {
        fill(0, 0, W, H * 0.65, '#2a2a2a')
      }

      fill(0, 0, 16, 16, colors.accent)

      if (logoImage) {
        const logoData = await loadAndResizeImage(logoImage, 400, 0.95)
        if (logoData) {
          fill(2, 2, 32, 12, 'rgba(255,255,255,0.92)')
          pdf.addImage(logoData, 'PNG', 3, 3, 30, 10, undefined, 'FAST')
        }
      } else {
        fill(2, 2, 32, 12, '#fff')
        pdf.setFont('helvetica','bold'); pdf.setFontSize(7); pdf.setTextColor(30,30,30)
        t(san(brand).slice(0,8), 18, 9, {align:'center'})
      }

      const panelY = H * 0.63
      fill(0, panelY, W, H - panelY, colors.white)
      fill(0, panelY, W, 2, colors.accent)
      fill(14, panelY + 8, 18, 2, colors.accent)

      pdf.setFont('helvetica','normal'); pdf.setFontSize(7); pdf.setTextColor(...rgb(colors.muted))
      t(san(tagline), 14, panelY + 16)
      pdf.setFont('helvetica','bold'); pdf.setFontSize(24); pdf.setTextColor(...rgb(colors.text))
      t('PRODUCT', 14, panelY + 30)
      t('CATALOG', 14, panelY + 43)

      fill(14, panelY + 47, 56, 8, colors.accent)
      pdf.setFont('helvetica','bold'); pdf.setFontSize(6); pdf.setTextColor(30,30,30)
      t(san(coleccion), 42, panelY + 53, {align:'center'})

      pdf.setFont('helvetica','normal'); pdf.setFontSize(6.5); pdf.setTextColor(...rgb(colors.muted))
      const sl = pdf.splitTextToSize(san(slogan), 110)
      sl.slice(0,2).forEach((line,i) => t(line, 14, panelY + 60 + i*7))

      pdf.setFont('helvetica','bold'); pdf.setFontSize(6); pdf.setTextColor(...rgb(colors.accent))
      t('GET IN TOUCH!', W - 14, panelY + 20, {align:'right'})
      pdf.setFont('helvetica','normal'); pdf.setFontSize(5.5); pdf.setTextColor(...rgb(colors.muted))
      t(san(contacto.whatsapp), W - 14, panelY + 27, {align:'right'})
      t(san(contacto.email), W - 14, panelY + 33, {align:'right'})
    }

    // ─── CATEGORÍA ─────────────────────────────────────────────────────────
    else if (pag.tipo === 'categoria') {
      const catColor = pag.color || colors.accent
      const heroImage = pag.heroImage
      const heroFooter = pag.heroFooter
      const telas = pag.telas || []
      const headerBg = pag.headerBackground || colors.white
      
      fill(0, 0, W, H, colors.white)
      
      if (pag.fondoImagen) {
        const fondoData = await loadAndResizeImage(pag.fondoImagen, 2000, 0.92)
        if (fondoData) { 
          pdf.saveGraphicsState()
          pdf.setGState(pdf.GState({opacity: pag.fondoOpacity || 0.08}))
          pdf.addImage(fondoData, 'JPEG', 0, 0, W, H, undefined, 'FAST')
          pdf.restoreGraphicsState()
        }
      }

      // ── HEADER ──
      const headerY = 8, headerX = 8, headerW = W - 16, headerH = 22
      fill(headerX, headerY, headerW, headerH, headerBg)
      pdf.setDrawColor(...rgb(catColor)); pdf.setLineWidth(1.5)
      pdf.line(headerX, headerY + headerH, headerX + headerW, headerY + headerH)
      
      pdf.setFont('helvetica','normal'); pdf.setFontSize(5); pdf.setTextColor(...rgb(colors.muted))
      t(san(brand), headerX + 4, headerY + 6)
      pdf.setFont('helvetica','bold'); pdf.setFontSize(13); pdf.setTextColor(...rgb(colors.text))
      t(san(pag.nombre || 'Colección').toUpperCase(), headerX + 4, headerY + 16)
      
      fill(headerX + headerW - 52, headerY + 4, 48, 7, catColor)
      pdf.setFont('helvetica','bold'); pdf.setFontSize(5.5); pdf.setTextColor(255,255,255)
      t(san(coleccion), headerX + headerW - 28, headerY + 9, {align:'center'})
      
      if (pag.descripcion) {
        pdf.setFont('helvetica','normal'); pdf.setFontSize(5.5); pdf.setTextColor(80,80,80)
        const dl = pdf.splitTextToSize(san(pag.descripcion), headerW - 58)
        dl.slice(0,2).forEach((l,i) => t(l, headerX + headerW - 52, headerY + 16 + i * 4.5))
      }

      const bodyY = headerY + headerH + 6
      const bodyH = H - bodyY - 14  // Leave space for footer
      const leftW = (W - 16) * 0.42
      const heroImgH = bodyH * 0.72

      // ── IMAGEN HERO (alta calidad) ──
      if (heroImage) {
        const heroData = await loadAndResizeImage(heroImage, 800, 0.95)
        if (heroData) {
          pdf.addImage(heroData, 'JPEG', headerX, bodyY, leftW, heroImgH, undefined, 'FAST')
        }
      } else {
        fill(headerX, bodyY, leftW, heroImgH, '#EFEFED')
        pdf.setFontSize(5); pdf.setTextColor(180,180,180)
        t('Sin imagen', headerX + leftW/2, bodyY + heroImgH/2, {align:'center'})
      }
      
      fill(headerX + leftW - 8, bodyY, 8, 8, catColor)

      // ── FOOTER DE IMAGEN HERO (con más espacio) ──
      const heroFooterY = bodyY + heroImgH + 5
      fill(headerX, heroFooterY - 2, leftW, 1.5, catColor)
      if (heroFooter) {
        pdf.setFont('helvetica','normal'); pdf.setFontSize(5); pdf.setTextColor(...rgb(colors.text))
        const fl = pdf.splitTextToSize(san(heroFooter), leftW - 8)
        fl.slice(0,3).forEach((l,i) => t(l, headerX + 4, heroFooterY + 4 + i * 5))
      } else {
        pdf.setFont('helvetica','italic'); pdf.setFontSize(4.5); pdf.setTextColor(150,150,150)
        t('Agrega una descripción', headerX + leftW/2, heroFooterY + 7, {align:'center'})
      }

      // ── DIVISOR ──
      pdf.setDrawColor(...rgb(colors.border)); pdf.setLineWidth(0.3)
      pdf.line(headerX + leftW + 4, bodyY, headerX + leftW + 4, bodyY + bodyH)

      // ── GRID DE TELAS (3 COLUMNAS) con mejor espaciado ──
      const gridX = headerX + leftW + 8
      const gridW = W - gridX - 8
      const GCOLS = 3
      const cellW = (gridW - (GCOLS - 1) * 4) / GCOLS
      const cellImgH = cellW * 0.85
      const cellH = cellImgH + 22  // Más espacio para texto
      const gridTelas = telas.slice(0, 9)

      for (let ti = 0; ti < gridTelas.length; ti++) {
        const tela = gridTelas[ti]
        const col = ti % GCOLS
        const row = Math.floor(ti / GCOLS)
        const cx = gridX + col * (cellW + 4)
        const cy = bodyY + row * (cellH + 4)
        if (cy + cellH > H - 12) continue

        // Imagen con alta calidad
        const imgUrl = tela.imagenes_tela?.find(x => x.es_principal)?.imagen_url || tela.imagenes_tela?.[0]?.imagen_url
        const imgData = await loadAndResizeImage(imgUrl, 600, 0.95)
        if (imgData) {
          pdf.addImage(imgData, 'JPEG', cx, cy, cellW, cellImgH, undefined, 'FAST')
        } else {
          fill(cx, cy, cellW, cellImgH, '#F0F0EC')
        }
        
        // Barra de color debajo de la imagen
        fill(cx, cy + cellImgH, cellW, 1.5, catColor)

        // Información de la tela con más espacio
        const infoY = cy + cellImgH + 4
        pdf.setFont('helvetica','bold'); pdf.setFontSize(4.5); pdf.setTextColor(...rgb(catColor))
        t('Ref: ' + st(tela.referencia).slice(0,14), cx, infoY)
        
        pdf.setFontSize(5.5); pdf.setTextColor(...rgb(colors.text))
        const nombre = san(tela.nombre || '')
        t(nombre.length > 22 ? nombre.slice(0,20)+'...' : nombre, cx, infoY + 5)
        
        pdf.setFont('helvetica','normal'); pdf.setFontSize(4.5); pdf.setTextColor(90,90,90)
        const comp = st(tela.composicion, '—')
        t(comp.length > 25 ? comp.slice(0,23)+'...' : comp, cx, infoY + 10)

        // Especificaciones de peso y ancho
        const specs = [tela.peso && `Peso: ${san(tela.peso)}`, tela.ancho && `Ancho: ${san(tela.ancho)}`].filter(Boolean).join('  ')
        if (specs) { 
          pdf.setFontSize(4); pdf.setTextColor(100,100,100)
          t(specs, cx, infoY + 14.5)
        }

        // Colores
        const coloresTela = tela.tela_colores || []
        if (coloresTela.length) {
          let dotX = cx
          coloresTela.slice(0,6).forEach(tc => {
            const { r, g, b } = hexToRgb(tc.colores?.codigo_hex || '#ccc')
            pdf.setFillColor(r, g, b); pdf.setDrawColor(150,150,150); pdf.setLineWidth(0.05)
            pdf.circle(dotX + 3, infoY + 19, 2.5, 'FD')
            dotX += 7
          })
        }
      }
      
      // Telas adicionales
      if (telas.length > 9) {
        pdf.setFont('helvetica','normal'); pdf.setFontSize(4.5); pdf.setTextColor(...rgb(colors.muted))
        t(`+${telas.length - 9} referencias adicionales`, gridX, bodyY + bodyH - 6)
      }

      // ── FOOTER DE PÁGINA (sin sobreescribir número) ──
      fill(0, H - 8, W, 8, colors.primary)
      pdf.setFont('helvetica','normal'); pdf.setFontSize(5); pdf.setTextColor(255,255,255,0.6)
      t(`${san(brand)} · ${san(pag.nombre || '')} · ${san(coleccion)}`, 8, H - 3)
      
      // Número de página en posición fija (sin sobreescribir)
      pdf.setFont('helvetica','bold'); pdf.setFontSize(7); pdf.setTextColor(...rgb(catColor))
      t(String(globalPage).padStart(2, '0'), W - 8, H - 3, {align:'right'})
    }

    // ─── CONTACTO ──────────────────────────────────────────────────────────
    else if (pag.tipo === 'contacto') {
      fill(0, 0, W, H, colors.primary)
      fill(W - 22, 0, 22, 22, colors.accent)
      
      if (logoImage) {
        const logoData = await loadAndResizeImage(logoImage, 400, 0.95)
        if (logoData) pdf.addImage(logoData, 'PNG', 14, 16, 44, 18, undefined, 'FAST')
      } else {
        pdf.setFont('helvetica','bold'); pdf.setFontSize(22); pdf.setTextColor(255,255,255)
        t(san(brand), 14, 34)
      }
      
      pdf.setFont('helvetica','normal'); pdf.setFontSize(7); pdf.setTextColor(...rgb(colors.accent))
      t('SOLUCIONES TEXTILES A GRAN ESCALA', 14, 45)
      
      pdf.setFontSize(7); pdf.setTextColor(200,200,200)
      const dl = pdf.splitTextToSize(san(contacto.descripcion), 160)
      dl.slice(0,4).forEach((l,i) => t(l, 14, 56 + i*6.5))
      
      const cardX = 25, cardY = 110, cardW = W - 50, cardH = 110
      fill(cardX, cardY, cardW, cardH, colors.white)
      pdf.setDrawColor(...rgb(colors.border)); pdf.setLineWidth(0.5)
      pdf.rect(cardX, cardY, cardW, cardH)
      fill(cardX, cardY, cardW, 3, colors.accent)
      
      pdf.setFont('helvetica','normal'); pdf.setFontSize(6); pdf.setTextColor(...rgb(colors.muted))
      t('ATENCION DIRECTA', W/2, cardY + 13, {align:'center'})
      pdf.setFont('helvetica','bold'); pdf.setFontSize(15); pdf.setTextColor(...rgb(colors.text))
      t(san(contacto.nombre), W/2, cardY + 25, {align:'center'})
      
      const rows = [
        { sym: 'W', val: contacto.whatsapp },
        { sym: '@', val: contacto.email },
        { sym: 'L', val: contacto.ubicacion }
      ]
      rows.forEach(({sym, val}, i) => {
        const ry = cardY + 40 + i * 20
        pdf.setFillColor(...rgb(colors.accent))
        pdf.circle(cardX + 16, ry - 2, 5, 'F')
        pdf.setFont('helvetica','bold'); pdf.setFontSize(6.5); pdf.setTextColor(30,30,30)
        t(sym, cardX + 16, ry + 0.5, {align:'center'})
        pdf.setFont('helvetica','normal'); pdf.setFontSize(9); pdf.setTextColor(40,40,40)
        t(san(val), cardX + 26, ry)
      })
      
      pdf.setDrawColor(...rgb(colors.border)); pdf.setLineWidth(0.4)
      pdf.line(cardX + 12, cardY + 102, cardX + cardW - 12, cardY + 102)
      pdf.setFont('helvetica','bold'); pdf.setFontSize(5.5); pdf.setTextColor(120,120,120)
      t('PROGRAME UNA VISITA O VIDEOLLAMADA', W/2, cardY + 109, {align:'center'})
      
      fill(0, H - 18, W, 18, colors.light)
      pdf.setFont('helvetica','oblique'); pdf.setFontSize(8); pdf.setTextColor(100,100,100)
      t(san(slogan), W/2, H - 8, {align:'center'})
      
      fill(0, H - 8, W, 8, colors.primary)
    }

    // Número de página general (solo se aplica si no se colocó ya)
    if (pag.tipo !== 'categoria') {
      pdf.setFont('helvetica','normal'); pdf.setFontSize(7); pdf.setTextColor(160,160,160)
      t(`${globalPage} / ${paginas.length}`, W - 10, H - 5, {align:'right'})
    }
    
    // Para categorías, el número ya se puso en el footer
    globalPage++
  }
  
  return pdf
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export function CatalogoEditorFashion({ telas = [], categorias = [], onClose }) {
  const [cfg, setCfg] = useState(DEFAULT_CFG)
  const [categoriasDisponibles, setCD] = useState([])
  const [categoriasSeleccionadas, setCS] = useState({})
  const [paginas, setPaginas] = useState([])
  const [pagIdx, setPagIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [panel, setPanel] = useState('categorias')
  const heroInputRef = useRef()
  const coverRef = useRef()
  const logoRef = useRef()
  const fondoRef = useRef()

  useEffect(() => {
    try {
      const saved = localStorage.getItem('catalogo_ynk_v2')
      if (saved) {
        const parsed = JSON.parse(saved)
        setCfg(prev => ({ ...prev, ...parsed }))
        if (parsed.cs) setCS(parsed.cs)
        toast.success('Configuración cargada', { icon:'💾' })
      }
    } catch(e) { console.error(e) }
  }, [])

  const saveConfig = () => {
    localStorage.setItem('catalogo_ynk_v2', JSON.stringify({ ...cfg, cs: categoriasSeleccionadas }))
    toast.success('Configuración guardada', { icon:'💾' })
  }

  useEffect(() => {
    const bycat = {}
    telas.forEach(tl => {
      const id = tl.categoria_id || '__sin__'
      const nom = tl.categorias?.nombre || 'General'
      if (!bycat[id]) {
        bycat[id] = {
          id,
          nombre: nom,
          telas: [],
          descripcion: tl.categorias?.descripcion || '',
          color: tl.categorias?.color || DEFAULT_COLORS.accent,
          headerBackground: tl.categorias?.headerBackground || DEFAULT_COLORS.white,
          fondoImagen: tl.categorias?.fondoImagen || null,
          fondoOpacity: tl.categorias?.fondoOpacity || 0.08,
          heroImage: tl.categorias?.heroImage || null,
          heroFooter: tl.categorias?.heroFooter || '',
        }
      }
      bycat[id].telas.push(tl)
    })
    setCD(Object.values(bycat))
    setCS(prev => {
      const next = { ...prev }
      Object.values(bycat).forEach(c => { if (next[c.id] === undefined) next[c.id] = true })
      return next
    })
  }, [telas])

  useEffect(() => {
    const filtered = categoriasDisponibles.filter(c => categoriasSeleccionadas[c.id]).map(c => ({
      tipo:'categoria', id:c.id, nombre:c.nombre, descripcion:c.descripcion, telas:c.telas,
      color:c.color, headerBackground:c.headerBackground, fondoImagen:c.fondoImagen,
      fondoOpacity:c.fondoOpacity, heroImage:c.heroImage, heroFooter:c.heroFooter
    }))
    setPaginas([{ tipo:'portada' }, ...filtered, { tipo:'contacto' }])
  }, [categoriasDisponibles, categoriasSeleccionadas])

  const upd = (path, val) => setCfg(prev => { const next = JSON.parse(JSON.stringify(prev)); const keys = path.split('.'); let cur = next; keys.slice(0,-1).forEach(k => cur = cur[k]); cur[keys[keys.length-1]] = val; return next })
  const updPag = (idx, key, val) => setPaginas(prev => { const next = [...prev]; next[idx] = { ...next[idx], [key]:val }; return next })
  const updCategoria = (id, key, val) => setCD(prev => prev.map(c => c.id === id ? { ...c, [key]:val } : c))
  const handleCatChange = (id, key, val) => { updCategoria(id, key, val); updPag(pagIdx, key, val) }
  const handleImgUpload = async (e, cb) => { const f = e.target.files[0]; if (!f) return; const data = await fileToDataUrl(f); const sized = await loadAndResizeImage(data, 1600, 0.92); cb(sized); e.target.value = '' }
  const toggleCat = (id) => setCS(prev => ({ ...prev, [id]: !prev[id] }))
  const exportPDF = async () => { setLoading(true); toast.loading('Generando PDF...', { id:'pdf' }); try { const pdf = await buildPDF(paginas, cfg); pdf.save(`catalogo_ynk_${Date.now()}.pdf`); toast.success('PDF listo ✓', { id:'pdf' }); } catch(e) { console.error(e); toast.error('Error al generar PDF', { id:'pdf' }); } finally { setLoading(false); } }

  const pag = paginas[pagIdx]
  const isCat = pag?.tipo === 'categoria'
  const catEditando = isCat ? categoriasDisponibles.find(c => c.id === pag.id) : null

  const IS = { background:'#181818', border:'1px solid #2A2A2A', borderRadius:'4px', color:'#D0D0D0', fontSize:'11px', padding:'6px 9px', width:'100%', outline:'none', boxSizing:'border-box' }
  const NB = { background:'#181818', border:'1px solid #2A2A2A', borderRadius:'4px', color:'#666', cursor:'pointer', padding:'4px 8px', display:'flex', alignItems:'center' }
  const panels = [
    { id:'diseno', icon:<Palette size={11}/>, label:'Global' },
    { id:'categorias', icon:<Settings size={11}/>, label:'Categ.' },
    { id:'pagina', icon:<Eye size={11}/>, label:'Editar' },
    { id:'contacto', icon:<Phone size={11}/>, label:'Contacto' },
  ]

  return (
    <div style={{ position:'fixed', inset:0, background:'#090909', display:'flex', flexDirection:'column', zIndex:50, fontFamily:'system-ui,sans-serif', paddingTop:'80px' }}>
      <div style={{ background:'#111', borderBottom:'1px solid #1E1E1E', padding:'9px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}><div style={{ width:'8px', height:'8px', background:'#E8C547', borderRadius:'1px' }} /><span style={{ color:'#E8C547', fontWeight:'800', fontSize:'11px', letterSpacing:'0.14em' }}>YNK CATALOG EDITOR</span><span style={{ background:'#1A1A1A', color:'#444', fontSize:'8px', padding:'2px 8px', borderRadius:'3px', letterSpacing:'0.05em' }}>{paginas.length} PÁGINAS</span></div>
        <div style={{ display:'flex', gap:'7px' }}><button onClick={saveConfig} style={{ background:'#1A1A1A', color:'#E8C547', border:'1px solid #E8C547', borderRadius:'4px', padding:'7px 13px', fontWeight:'600', fontSize:'10px', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px' }}><Save size={11}/> Guardar</button><button onClick={exportPDF} disabled={loading} style={{ background:loading?'#555':'#E8C547', color:'#111', border:'none', borderRadius:'4px', padding:'7px 16px', fontWeight:'800', fontSize:'10px', cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:'5px', opacity:loading?0.7:1 }}><Download size={11}/>{loading ? 'Generando...' : 'Exportar PDF'}</button><button onClick={onClose} style={{ background:'transparent', color:'#555', border:'1px solid #222', borderRadius:'4px', padding:'7px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px', fontSize:'10px' }}><X size={11}/> Cerrar</button></div>
      </div>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        {/* LEFT PANEL */}
        <div style={{ width:'292px', background:'#0E0E0E', borderRight:'1px solid #1A1A1A', display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' }}>
          <div style={{ display:'flex', borderBottom:'1px solid #1A1A1A', flexShrink:0 }}>{panels.map(tb => (<button key={tb.id} onClick={() => setPanel(tb.id)} style={{ flex:1, padding:'10px 2px', border:'none', background:panel===tb.id?'#161616':'transparent', color:panel===tb.id?'#E8C547':'#3A3A3A', fontSize:'8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'3px', borderBottom:panel===tb.id?'2px solid #E8C547':'2px solid transparent', transition:'all 0.15s' }}>{tb.icon}{tb.label}</button>))}</div>
          <div style={{ flex:1, overflowY:'auto', padding:'14px 12px' }}>
            {panel==='diseno' && (<div style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
              <PF label="Marca"><input value={cfg.brand} onChange={e=>upd('brand',e.target.value)} style={IS}/></PF>
              <PF label="Colección"><input value={cfg.coleccion} onChange={e=>upd('coleccion',e.target.value)} style={IS}/></PF>
              <PF label="Tagline"><input value={cfg.tagline} onChange={e=>upd('tagline',e.target.value)} style={IS}/></PF>
              <PF label="Slogan"><input value={cfg.slogan} onChange={e=>upd('slogan',e.target.value)} style={IS}/></PF>
              <ST>Paleta de Colores</ST>
              {[['colors.primary','Color primario'],['colors.accent','Acento'],['colors.light','Fondo claro'],['colors.text','Texto'],['colors.muted','Texto secundario'],['colors.border','Bordes']].map(([key,label]) => { const val = key.split('.').reduce((o,k)=>o[k], cfg); return (<PF key={key} label={label}><div style={{ display:'flex', gap:'6px', alignItems:'center' }}><input type="color" value={val} onChange={e=>upd(key,e.target.value)} style={{ width:'30px', height:'26px', border:'1px solid #2A2A2A', borderRadius:'3px', cursor:'pointer', padding:0, background:'transparent' }}/><input value={val} onChange={e=>upd(key,e.target.value)} style={{ ...IS, flex:1 }}/></div></PF>) })}
              <ST>Imágenes Globales</ST>
              <PF label="Logo">{cfg.logoImage ? <div style={{ position:'relative', borderRadius:'3px', overflow:'hidden', background:'#1A1A1A', padding:'6px' }}><img src={cfg.logoImage} alt="" style={{ height:'28px', objectFit:'contain' }}/><button onClick={()=>upd('logoImage',null)} style={{ position:'absolute',top:4,right:4,background:'rgba(0,0,0,0.8)',border:'none',borderRadius:'50%',width:'16px',height:'16px',color:'#fff',cursor:'pointer' }}><X size={8}/></button></div> : <UB onClick={()=>logoRef.current.click()} label="Subir logo"/>}<input ref={logoRef} type="file" accept="image/*" onChange={e=>handleImgUpload(e, d=>upd('logoImage',d))} style={{ display:'none' }}/></PF>
              <PF label="Imagen de Portada">{cfg.coverImage ? <div style={{ position:'relative', borderRadius:'3px', overflow:'hidden' }}><img src={cfg.coverImage} alt="" style={{ width:'100%', height:'90px', objectFit:'cover' }}/><button onClick={()=>upd('coverImage',null)} style={{ position:'absolute',top:4,right:4,background:'rgba(0,0,0,0.8)',border:'none',borderRadius:'50%',width:'18px',height:'18px',color:'#fff',cursor:'pointer' }}><X size={9}/></button></div> : <UB onClick={()=>coverRef.current.click()} label="Subir imagen portada"/>}<input ref={coverRef} type="file" accept="image/*" onChange={e=>handleImgUpload(e, d=>upd('coverImage',d))} style={{ display:'none' }}/></PF>
            </div>)}
            {panel==='categorias' && (<div style={{ display:'flex', flexDirection:'column', gap:'10px' }}><ST>Categorías del Catálogo</ST><div style={{ fontSize:'8.5px', color:'#555', lineHeight:1.5 }}>Selecciona las categorías a incluir. El orden en el catálogo sigue la lista.</div>{categoriasDisponibles.length === 0 ? <div style={{ color:'#444', fontSize:'9px', textAlign:'center', padding:'20px', background:'#141414', borderRadius:'4px' }}>No hay telas cargadas.<br/>Las categorías aparecerán aquí.</div> : categoriasDisponibles.map(cat => (<button key={cat.id} onClick={()=>toggleCat(cat.id)} style={{ background:'#141414', border:`1px solid ${categoriasSeleccionadas[cat.id]?'#E8C547':'#222'}`, borderRadius:'5px', padding:'9px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', width:'100%', transition:'border-color 0.15s' }}>{categoriasSeleccionadas[cat.id] ? <Check size={12} color="#E8C547"/> : <Square size={12} color="#444"/>}<div style={{ flex:1, textAlign:'left' }}><div style={{ color:categoriasSeleccionadas[cat.id]?'#E8C547':'#777', fontSize:'10px', fontWeight:'600' }}>{cat.nombre}</div><div style={{ color:'#444', fontSize:'8px', marginTop:'1px' }}>{cat.telas.length} telas · {Math.ceil(cat.telas.length/9)} pág.</div></div><div style={{ width:'10px', height:'10px', borderRadius:'50%', background:cat.color, border:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }} /></button>))}</div>)}
            {panel==='pagina' && (<div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>{isCat && catEditando ? (<>
              <div style={{ background:'#141414', borderRadius:'4px', padding:'8px 10px', display:'flex', alignItems:'center', gap:'6px' }}><div style={{ width:'8px', height:'8px', borderRadius:'50%', background:catEditando.color, flexShrink:0 }} /><span style={{ color:'#E8C547', fontSize:'9px', fontWeight:'700', letterSpacing:'0.08em' }}>{pag.nombre?.toUpperCase()}</span></div>
              <ST>Imagen Principal de Categoría</ST>
              <PF label="Subir imagen personalizada (hero)">{catEditando.heroImage ? <div style={{ position:'relative', borderRadius:'3px', overflow:'hidden' }}><img src={catEditando.heroImage} alt="Hero" style={{ width:'100%', height:'75px', objectFit:'cover' }}/><button onClick={()=>handleCatChange(catEditando.id,'heroImage',null)} style={{ position:'absolute',top:4,right:4,background:'rgba(0,0,0,0.8)',border:'none',borderRadius:'50%',width:'18px',height:'18px',color:'#fff',cursor:'pointer' }}><X size={9}/></button></div> : <UB onClick={()=>heroInputRef.current && heroInputRef.current.click()} label="Subir imagen hero"/>}<input ref={heroInputRef} type="file" accept="image/*" onChange={e=>handleImgUpload(e, d=>handleCatChange(catEditando.id,'heroImage',d))} style={{ display:'none' }}/></PF>
              <PF label="Texto pie de foto (debajo de la imagen)"><textarea value={catEditando.heroFooter || ''} onChange={e=>handleCatChange(catEditando.id,'heroFooter',e.target.value)} placeholder="Describe esta categoría..." rows={2} style={{ ...IS, resize:'vertical', lineHeight:1.4 }} /><div style={{ fontSize:'7px', color:'#777', marginTop:'4px' }}>Este texto aparecerá debajo de la imagen principal</div></PF>
              <ST>Diseño de Página</ST>
              <PF label="Color de acento"><div style={{ display:'flex', gap:'6px', alignItems:'center' }}><input type="color" value={catEditando.color||'#E8C547'} onChange={e=>handleCatChange(catEditando.id,'color',e.target.value)} style={{ width:'30px',height:'26px',border:'1px solid #2A2A2A',borderRadius:'3px',cursor:'pointer',padding:0 }}/><input value={catEditando.color||'#E8C547'} onChange={e=>handleCatChange(catEditando.id,'color',e.target.value)} style={{ ...IS, flex:1 }}/></div></PF>
              <PF label="Color fondo del encabezado"><div style={{ display:'flex', gap:'6px', alignItems:'center' }}><input type="color" value={catEditando.headerBackground||'#ffffff'} onChange={e=>handleCatChange(catEditando.id,'headerBackground',e.target.value)} style={{ width:'30px',height:'26px',border:'1px solid #2A2A2A',borderRadius:'3px',cursor:'pointer',padding:0 }}/><input value={catEditando.headerBackground||'#ffffff'} onChange={e=>handleCatChange(catEditando.id,'headerBackground',e.target.value)} style={{ ...IS, flex:1 }}/></div></PF>
              <PF label="Imagen de fondo de página">{catEditando.fondoImagen ? <div style={{ position:'relative', borderRadius:'3px', overflow:'hidden' }}><img src={catEditando.fondoImagen} alt="" style={{ width:'100%', height:'75px', objectFit:'cover' }}/><button onClick={()=>handleCatChange(catEditando.id,'fondoImagen',null)} style={{ position:'absolute',top:4,right:4,background:'rgba(0,0,0,0.8)',border:'none',borderRadius:'50%',width:'18px',height:'18px',color:'#fff',cursor:'pointer' }}><X size={9}/></button></div> : <UB onClick={()=>fondoRef.current.click()} label="Subir fondo de página"/>}<input ref={fondoRef} type="file" accept="image/*" onChange={e=>handleImgUpload(e, d=>handleCatChange(catEditando.id,'fondoImagen',d))} style={{ display:'none' }}/></PF>
              <PF label={`Opacidad del fondo: ${Math.round((catEditando.fondoOpacity||0.08)*100)}%`}><input type="range" min="0" max="0.5" step="0.01" value={catEditando.fondoOpacity||0.08} onChange={e=>handleCatChange(catEditando.id,'fondoOpacity',parseFloat(e.target.value))} style={{ width:'100%', cursor:'pointer', accentColor:'#E8C547' }}/></PF>
              <PF label="Descripción breve"><textarea value={pag.descripcion||''} onChange={e=>updPag(pagIdx,'descripcion',e.target.value)} rows={3} style={{ ...IS, resize:'vertical', lineHeight:1.5 }}/></PF>
              <div style={{ background:'#141414', borderRadius:'4px', padding:'8px 10px', fontSize:'9px', color:'#555', display:'flex', gap:'12px' }}><span>Telas: <strong style={{ color:'#E8C547' }}>{pag.telas?.length||0}</strong></span><span>Páginas: <strong style={{ color:'#E8C547' }}>{Math.ceil((pag.telas?.length||0)/9)||1}</strong></span></div>
            </>) : pag?.tipo === 'portada' ? <div style={{ color:'#555', fontSize:'9px', textAlign:'center', padding:'20px', lineHeight:1.7 }}>La portada se edita en la pestaña <strong style={{ color:'#E8C547' }}>Global</strong> (imagen, marca, slogan)</div> : <div style={{ color:'#555', fontSize:'9px', textAlign:'center', padding:'20px' }}>Navega hasta una <strong style={{ color:'#E8C547' }}>categoría</strong> en la vista central para editarla aquí.</div>}</div>)}
            {panel==='contacto' && (<div style={{ display:'flex', flexDirection:'column', gap:'11px' }}><ST>Página de Contacto</ST>{[['contacto.nombre','Nombre del asesor'],['contacto.whatsapp','WhatsApp'],['contacto.email','Email'],['contacto.ubicacion','Ubicación']].map(([key,label]) => { const val = key.split('.').reduce((o,k)=>o[k], cfg); return <PF key={key} label={label}><input value={val} onChange={e=>upd(key,e.target.value)} style={IS}/></PF> })}<PF label="Descripción"><textarea value={cfg.contacto.descripcion} onChange={e=>upd('contacto.descripcion',e.target.value)} rows={5} style={{ ...IS, resize:'vertical', lineHeight:1.5 }}/></PF></div>)}
          </div>
        </div>

        {/* CENTER PREVIEW */}
        <div style={{ flex:1, background:'#0A0A0A', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ background:'#111', borderBottom:'1px solid #1A1A1A', padding:'7px 14px', display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
            <button onClick={()=>setPagIdx(p=>Math.max(0,p-1))} disabled={pagIdx===0} style={NB}><ChevronLeft size={13}/></button>
            <span style={{ color:'#333', fontSize:'9px', minWidth:'60px', textAlign:'center' }}>{pagIdx+1} / {paginas.length}</span>
            <button onClick={()=>setPagIdx(p=>Math.min(paginas.length-1,p+1))} disabled={pagIdx===paginas.length-1} style={NB}><ChevronRight size={13}/></button>
            <span style={{ color:'#2A2A2A', fontSize:'8.5px', marginLeft:'6px', letterSpacing:'0.06em' }}>{pag?.tipo==='portada' ? '📖 PORTADA' : pag?.tipo==='categoria' ? `📂 ${(pag.nombre||'').toUpperCase()}` : pag?.tipo==='contacto' ? '📞 CONTACTO' : ''}</span>
            {isCat && <button onClick={()=>setPanel('pagina')} style={{ marginLeft:'auto', background:'#1A1A1A', border:'1px solid #2A2A2A', borderRadius:'3px', padding:'4px 10px', color:'#E8C547', fontSize:'8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px' }}><Sliders size={9}/> Editar página</button>}
          </div>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', overflow:'auto' }}>
            <div style={{ width:'min(440px,80%)', boxShadow:'0 24px 80px rgba(0,0,0,0.9)', borderRadius:'1px' }}>
              {pag?.tipo==='portada' && <PortadaPreview config={cfg}/>}
              {pag?.tipo==='categoria' && <CategoriaPreview pagina={pag} config={cfg} pageNum={pagIdx+1}/>}
              {pag?.tipo==='contacto' && <ContactoPreview config={cfg}/>}
            </div>
          </div>
        </div>

        {/* RIGHT THUMBNAILS */}
        <div style={{ width:'100px', background:'#0C0C0C', borderLeft:'1px solid #181818', overflowY:'auto', padding:'6px 4px', display:'flex', flexDirection:'column', gap:'4px', flexShrink:0 }}>
          {paginas.map((p, idx) => {
            const isActive = pagIdx === idx
            const icon = p.tipo==='portada' ? '📖' : p.tipo==='categoria' ? '📂' : '📞'
            const label = p.tipo==='portada' ? 'Portada' : p.tipo==='categoria' ? (p.nombre||'Cat.').slice(0,10) : 'Contacto'
            const catColor = p.tipo==='categoria' ? (p.color||'#E8C547') : null
            return (<button key={idx} onClick={()=>setPagIdx(idx)} style={{ border:isActive?`2px solid #E8C547`:'1px solid #1A1A1A', borderRadius:'3px', padding:0, cursor:'pointer', background:isActive?'#181818':'#111', overflow:'hidden', flexShrink:0, position:'relative' }}>{catColor && <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:catColor }} />}<div style={{ width:'100%', aspectRatio:'210/297', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'3px', padding:'4px' }}><span style={{ fontSize:'14px' }}>{icon}</span><span style={{ fontSize:'6px', color:isActive?'#E8C547':'#3A3A3A', textAlign:'center', lineHeight:1.3, fontWeight:isActive?'700':'400' }}>{label}</span></div></button>)
          })}
        </div>
      </div>
    </div>
  )
}

// UI Helpers
function PF({ label, children }) { return <div><div style={{ color:'#3A3A3A', fontSize:'8.5px', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'5px' }}>{label}</div>{children}</div> }
function ST({ children }) { return <div style={{ color:'#E8C547', fontSize:'8.5px', fontWeight:'700', letterSpacing:'0.1em', borderBottom:'1px solid #1A1A1A', paddingBottom:'5px', marginTop:'4px' }}>{children}</div> }
function UB({ onClick, label }) { return <button onClick={onClick} style={{ width:'100%', border:'1px dashed #252525', borderRadius:'4px', padding:'11px 8px', color:'#3A3A3A', fontSize:'8.5px', cursor:'pointer', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}><Upload size={11}/>{label}</button> }