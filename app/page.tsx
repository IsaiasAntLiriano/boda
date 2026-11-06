'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ExternalLink, MapPin } from 'lucide-react'

const API_URL = '/api/invitacion'

type Guest = { id: string; titulo_invitacion?: string; invitado_principal: string; dependientes: string[]; cantidad_personas: number; principal_asiste?: string; dependientes_asisten?: number | string; mensaje?: string }
type Notice = { tone: 'success' | 'info' | 'error'; text: string; detail?: string }

const churchExteriorImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/El%20Buen%20Pastor-vvhameNG3kaWZIA3MPKQqtbZdR0Yvp.jpeg'
const churchInteriorImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/altar%20de%20la%20iglesia-IQ3lRYc769EmahqltPJl2HJQ2JMERd.jpeg'
const invitationAudio = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Audio%20Invitacio%CC%81n-d7QVwp4ajC0k2NvDRk3Zt6dytw5dV2.mp3'
const coverEnvelope = '/sobre_botanico_MI_correcto.png'
const coverBranchTop = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rama_eucalipto_4-UDzKaPhh55QkkBWIUgujkOxknpZ8qE.png'
const coverBranchLeft = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rama_eucalipto_1-7kbrrVyRP79UXJlh8lCkDqooE7AEjw.png'
const coverBranchRight = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rama_exacta_1-LtRBG5mqahMtXAzyZdmBdAsnP1bzAA.png'
const heroGarden = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fondo-jardin-GoMKv0JaPbEj34AchAsO7iVVNaQcn4.jpg'

const ceremonyMap = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3942.165107027097!2d-69.94472402463478!3d18.461972482620222!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ea5620863a9b535%3A0x23e22c41c177ea6a!2sParroquia%20El%20Buen%20Pastor!5e1!3m2!1ses!2sdo!4v1792948828219!5m2!1ses!2sdo'
const receptionMap = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3942.158238349917!2d-69.89982870000001!3d18.462271499999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eaf8829a31364e5%3A0xabe5b14bcd1f354b!2sRenaissance%20Santo%20Domingo%20Jaragua%20Hotel%20%26%20Casino!5e1!3m2!1ses!2sdo!4v1792948589506!5m2!1ses!2sdo'
const hotelBookingLink = 'https://www.marriott.com/es/event-reservations/reservation-link.mi?id=1786128172706&key=GRP&app=resvlink&_branch_match_id=1560374761125822978&_branch_referrer=H4sIAAAAAAAAA8soKSkottLXTywo0MtNLCrKzC8p0UvOz9UvSi3OyczLts9MsTU0tzAzNLIwNDcyNzBTy06ttHUPClBLLCiwLUotLgOpUqsrSk1LLSrKzEuPTyrKLy9OLbJ1zijKz00FAF8UmuxgAAAA'

function Countdown() {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const target = new Date('2027-01-02T19:30:00-04:00').getTime()
    const update = () => {
      const distance = Math.max(0, target - Date.now())
      setRemaining({
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance % 86400000) / 3600000),
        minutes: Math.floor((distance % 3600000) / 60000),
        seconds: Math.floor((distance % 60000) / 1000),
      })
    }
    update()
    const interval = window.setInterval(update, 1000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="countdown-grid" aria-label="Cuenta regresiva">
      {Object.entries(remaining).map(([label, value]) => (
        <div className="countdown-item" key={label}>
          <span>{String(value).padStart(2, '0')}</span>
          <small>{{ days: 'Días', hours: 'Horas', minutes: 'Minutos', seconds: 'Segundos' }[label]}</small>
        </div>
      ))}
    </div>
  )
}

export default function Page() {
  const [guest, setGuest] = useState<Guest | null>(null)
  const [dependientesAsisten, setDependientesAsisten] = useState<(boolean | null)[]>([])
  const [message, setMessage] = useState('')
  const [principalAsiste, setPrincipalAsiste] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [invitationOpened, setInvitationOpened] = useState(false)
  const [loadingGuest, setLoadingGuest] = useState(true)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [opening, setOpening] = useState(false)
  const [guestId, setGuestId] = useState<string | null>(null)
  const displayGuest = guest ? { name: guest.invitado_principal, people: guest.cantidad_personas, companions: guest.dependientes } : { name: '', people: 0, companions: [] as string[] }

  useEffect(() => {
    setGuestId(new URLSearchParams(window.location.search).get('id'))
  }, [])

  useEffect(() => {
    if (!guestId) {
      setLoadingGuest(false)
      return
    }

    fetch(`${API_URL}?id=${encodeURIComponent(guestId)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error || !data.invitado_principal) throw new Error('Invitación no encontrada')
        const dependientes = Array.isArray(data.dependientes) ? data.dependientes : []
        const nextGuest: Guest = { id: data.id || guestId, titulo_invitacion: data.titulo_invitacion, invitado_principal: data.invitado_principal, dependientes, cantidad_personas: Number(data.cantidad_personas) || dependientes.length + 1, principal_asiste: data.principal_asiste, dependientes_asisten: data.dependientes_asisten, mensaje: data.mensaje || '' }
        setGuest(nextGuest)
        setPrincipalAsiste(data.principal_asiste === 'Sí' ? true : data.principal_asiste === 'No' ? false : null)
        const dependentCount = data.dependientes_asisten === '' || data.dependientes_asisten == null ? null : Number(data.dependientes_asisten)
        setDependientesAsisten(dependentCount == null || Number.isNaN(dependentCount) ? dependientes.map(() => null) : dependientes.map((_name: string, index: number) => index < dependentCount))
        setMessage(data.mensaje || '')
      })
      .catch(() => setGuest(null))
      .finally(() => setLoadingGuest(false))
  }, [guestId])

  function openInvitation() {
    setOpening(true)
    audioRef.current?.play().catch(() => {})
    window.setTimeout(() => setInvitationOpened(true), 900)
  }

  async function copyValue(key: string, value: string) {
    await navigator.clipboard.writeText(value)
    setCopiedKey(key)
    window.setTimeout(() => setCopiedKey(null), 1800)
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!guest || principalAsiste === null || dependientesAsisten.some((answer) => answer === null)) {
      setNotice({ tone: 'error', text: 'Indica la respuesta de cada persona.' })
      return
    }
    setIsSubmitting(true)
    setNotice(null)
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: guest.id, principal_asiste: principalAsiste ? 'Sí' : 'No', dependientes_asisten: dependientesAsisten.filter(Boolean).length, mensaje: message }),
      })
      const data = await response.json()
      if (!response.ok || data.error || data.success !== true) throw new Error('No se pudo registrar')
      const dependentCount = dependientesAsisten.filter(Boolean).length
      const attending = principalAsiste || dependentCount > 0
      setSubmitted(true)
      setNotice({ tone: 'success', text: '¡Confirmación registrada con éxito!', detail: `${guest.invitado_principal}: ${principalAsiste ? 'Asiste' : 'No asiste'} · Acompañantes que llegan: ${dependentCount} de ${guest.dependientes.length}` })
      setMessage(message)
      if (!attending) setNotice({ tone: 'success', text: '¡Confirmación registrada con éxito!', detail: `${guest.invitado_principal}: No asiste · Acompañantes que llegan: ${dependentCount} de ${guest.dependientes.length}` })
    } catch {
      setSubmitted(false)
      setNotice({ tone: 'error', text: 'No se pudo enviar. Inténtalo de nuevo.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <audio ref={audioRef} src={invitationAudio} preload="none" aria-label="Música de la invitación" />
      {!invitationOpened && (
        <button type="button" className={`cover ${opening ? 'cover-open' : ''}`} onClick={openInvitation} aria-label="Toque para abrir la invitación">
          <img className="cover-branch cover-branch-top" src={coverBranchTop} alt="" aria-hidden="true" />
          <img className="cover-branch cover-branch-left" src={coverBranchLeft} alt="" aria-hidden="true" />
          <img className="cover-branch cover-branch-right" src={coverBranchRight} alt="" aria-hidden="true" />
          <span className="cover-envelope-wrap">
            <img className="cover-envelope" src={coverEnvelope} alt="Sobre botánico cerrado" />
          </span>
          <span className="cover-tap"> Toque para abrir </span>
        </button>
      )}
      <header className="hero">
        <img className="hero-bg" src={heroGarden} alt="" aria-hidden="true" />
        <div className="hero-content">
  <div className="hero-parents">
    <p>Francisco Rafael Collado Vargas</p>
    <p>Marilú Expósito González</p>
    <p className="hero-parents-amp">&amp;</p>
    <p>Isidro Antonio Liriano Santana</p>
    <p>Reyna Claribel Madera Torres</p>
  </div>
  <p className="hero-blessing">Tienen el placer de invitarles al matrimonio de sus hijos</p>
  <img className="hero-medallion" src="/pareja-medallon.jpg" alt="María Mabel e Isaías en acuarela" />
  <h1 className="hero-names">María Mabel <span>&amp;</span> Isaías Antonio</h1>
          <div className="hero-ceremony-details">
            <p>A celebrarse el sábado dos de enero del dos mil veintisiete,</p>
            <p>a las siete y media de la noche,</p>
            <p>en la Parroquia El Buen Pastor.</p>
            <p className="hero-ceremony-location">Santo Domingo, República Dominicana.</p>
          </div>
          <div className="hero-divider" aria-hidden="true"><i /><b>♥</b><i /></div>
  <div className="invite-card-arch">
  <div className="invite-card">
  <p className="invite-label">Invitación especial para</p>
  <h2>{guest?.titulo_invitacion?.trim() || displayGuest.name}</h2>
  {guest?.titulo_invitacion?.trim() && <p className="invite-guest-name">{displayGuest.name}</p>}
  {displayGuest.companions.length > 0 && <p className="invite-companions">Acompañantes: {displayGuest.companions.join(', ')}</p>}
  <span className="invite-pass">Pase válido para {displayGuest.people} persona{displayGuest.people === 1 ? '' : 's'}</span>
  </div>
  </div>
        </div>
      </header>


<section id="detalles" className="section countdown-section">
  <div className="countdown-botanical" aria-hidden="true">
  <img src="/rama_eucalipto_1.png" alt="" loading="lazy" className="countdown-botanical-one" />
  <img src="/rama_eucalipto_2.png" alt="" loading="lazy" className="countdown-botanical-two" />
  <img src="/rama_eucalipto_3.png" alt="" loading="lazy" className="countdown-botanical-three" />
  <img src="/rama_eucalipto_4.png" alt="" loading="lazy" className="countdown-botanical-four" />
  <img src="/rama_exacta_1.png" alt="" loading="lazy" className="countdown-botanical-five" />
  <img src="/rama_exacta_2.png" alt="" loading="lazy" className="countdown-botanical-six" />
  <img src="/rama_exacta_3.png" alt="" loading="lazy" className="countdown-botanical-seven" />
  </div>
  <div className="countdown-content">
  <p className="eyebrow">El gran día</p>
  <h2 className="section-title">Faltan solo...</h2>
  <Countdown />
  </div>
  </section>

      <section className="section rsvp-section" aria-labelledby="rsvp-title">
        <div className="rsvp-card rsvp-card-soft">
          <div className="rsvp-header">
            <h2 id="rsvp-title" className="rsvp-script-title">CONFIRMACIÓN DE ASISTENCIA</h2>
            <p className="section-copy"> Favor confirmar su asistencia antes del 2 de diciembre de 2026</p>
          </div>
          {loadingGuest ? <p className="rsvp-status">Cargando tu invitación...</p> : !guest ? <p className="invalid-invitation">Usa el enlace personal que te enviamos para confirmar.</p> : (
            <form onSubmit={submit} className="rsvp-form rsvp-form-redesigned" noValidate>
              {notice?.tone === 'error' && <p className="rsvp-status error" role="alert">{notice.text}</p>}
              <div className="rsvp-person-card">
                <span className="rsvp-label">INVITACIÓN A NOMBRE DE</span>
                <strong>{guest.invitado_principal}</strong>
                <span className="rsvp-label">¿Asistirá? *</span>
                <div className="rsvp-radio-row">
                  <label><input required type="radio" name="attendance" checked={principalAsiste === true} onChange={() => setPrincipalAsiste(true)} /> Asistiré con gusto</label>
                  <label className="rsvp-radio-no"><input required type="radio" name="attendance" checked={principalAsiste === false} onChange={() => setPrincipalAsiste(false)} /> Lamento no poder asistir</label>
                </div>
              </div>
              {guest.dependientes.length > 0 && <fieldset className="companions-fieldset"><legend><span>PERSONAS INCLUIDAS EN SU INVITACIÓN</span><small>Por favor, confirme quiénes asistirán</small></legend><div className="companions-list">{guest.dependientes.map((dependiente, index) => <div className="companion-card" key={`${dependiente}-${index}`}><span className="rsvp-label">ACOMPAÑANTE {index + 1}</span><strong>{dependiente}</strong><div className="rsvp-radio-row"><label><input required type="radio" name={`companion-${index}`} checked={dependientesAsisten[index] === true} onChange={() => setDependientesAsisten((current) => current.map((answer, answerIndex) => answerIndex === index ? true : answer))} /> Asistirá</label><label className="rsvp-radio-no"><input required type="radio" name={`companion-${index}`} checked={dependientesAsisten[index] === false} onChange={() => setDependientesAsisten((current) => current.map((answer, answerIndex) => answerIndex === index ? false : answer))} /> No asistirá</label></div></div>)}</div></fieldset>}
              <div className="rsvp-summary">Total de personas confirmadas <strong>{(principalAsiste === true ? 1 : 0) + dependientesAsisten.filter(Boolean).length} de {guest.cantidad_personas} persona{guest.cantidad_personas === 1 ? '' : 's'}</strong></div>
              <label htmlFor="message" className="rsvp-label">Mensaje para los novios</label>
              <textarea id="message" rows={3} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escribe un mensaje para María Mabel e Isaías Antonio" />
              {notice?.tone === 'success' && <div className="success-message"><Check aria-hidden="true" /><strong>{notice.text}</strong><span>{notice.detail}</span><span>{(principalAsiste === true || dependientesAsisten.includes(true)) ? '¡Gracias! Te esperamos con mucho cariño.' : 'Gracias por avisarnos. Te llevaremos en el corazón.'}</span></div>}
              <button className="rsvp-submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enviando…' : 'Enviar confirmación'}</button>
            </form>
          )}
        </div>
      </section>

      <img className="hero-hug-photo" src="/pareja-abrazo.jpg" alt="María Mabel e Isaías abrazados en acuarela" />

      <section className="section watercolor-section" aria-labelledby="watercolor-title">
        <blockquote className="watercolor-quote">
          <p>Si a uno solo pueden vencerle, dos juntos resistirán. Una cuerda de tres cabos no es fácil de romper.</p>
          <cite>— Eclesiastés 4,12</cite>
        </blockquote>
        <div className="watercolor-event">
          <p className="watercolor-event-description"><strong>Ceremonia:</strong> Donde, con Dios en el centro, nos diremos sí para toda la vida</p>
          <p className="watercolor-event-time">7:30 PM</p>
          <div className="watercolor-grid">
            <img src={churchExteriorImage} alt="Ilustración en acuarela del exterior de la Parroquia El Buen Pastor" />
            <img src={churchInteriorImage} alt="Ilustración en acuarela del altar de la Parroquia El Buen Pastor" />
          </div>
          <h2 id="watercolor-title" className="watercolor-venue-title">Parroquia El Buen Pastor</h2>
          <div className="map-frame watercolor-map-frame">
            <iframe title="Mapa de la Parroquia El Buen Pastor" src={ceremonyMap} loading="lazy" allowFullScreen />
          </div>
          <a className="watercolor-location-link" href="https://maps.app.goo.gl/1GqpF5gDYTNcH5tt6" target="_blank" rel="noreferrer"><MapPin aria-hidden="true" /> Cómo llegar <ExternalLink aria-hidden="true" /></a>
        </div>
        <div className="watercolor-event watercolor-reception">
          <p className="watercolor-event-description"><strong>Recepción:</strong> Donde brindaremos por el comienzo de nuestra vida juntos</p>
          <p className="watercolor-event-time">9:00 PM</p>
          <img className="watercolor-hotel-image" src="/acuarela_hotel_2K.png" alt="Ilustración en acuarela del Renaissance Santo Domingo Jaragua Hotel & Casino" />
          <h2 className="watercolor-venue-title">Renaissance Santo Domingo Jaragua Hotel &amp; Casino</h2>
          <div className="map-frame watercolor-map-frame">
            <iframe title="Mapa del Renaissance Santo Domingo Jaragua Hotel & Casino" src={receptionMap} loading="lazy" allowFullScreen />
          </div>
          <a className="watercolor-location-link" href="https://maps.app.goo.gl/Fs7PkiSuE7hTUHAM8" target="_blank" rel="noreferrer"><MapPin aria-hidden="true" /> Cómo llegar <ExternalLink aria-hidden="true" /></a>
        </div>
      </section>

      <section className="section hotel-section" aria-labelledby="hotel-title">
        <div className="hotel-card">
          <div className="hotel-content">
            <p className="eyebrow">Si vienen de lejos tendrán</p>
            <h2 id="hotel-title" className="section-title">Renaissance Santo Domingo Jaragua</h2>
            <p className="hotel-lead">Para quienes vienen de fuera, reservamos habitaciones en el hotel de la celebración. Usando nuestro enlace, tendrás acceso a una tarifa especial para la boda.</p>
  <a className="primary-button hotel-button" href={hotelBookingLink} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" /> Ver habitaciones y reservar</a>
          </div>
        </div>
      </section>

      <section className="section extras-section" aria-label="Información adicional">
        <div className="extras-grid">
<article className="info-card dress-card dress-card-expanded">
  <h2 className="dress-heading">Código de vestimenta</h2>
  <p className="dress-formality">Formal</p>
  <div className="dress-suggestions">
    <p>♀ Vestido largo o midi elegante</p>
    <p>♂ Traje oscuro</p>
  </div>
  <div className="dress-color-content">
  <p className="dress-avoid-label">Le pedimos evitar estos colores</p>
  <div className="dress-color-grid" aria-label="Colores que no se pueden usar">
  <div className="dress-color-item"><div className="dress-color-circle dress-color-white forbidden" aria-hidden="true"><i /></div><span>Blanco</span></div>
  <div className="dress-color-item"><div className="dress-color-circle dress-color-green forbidden" aria-hidden="true"><i /></div><span>Verde</span></div>
  <div className="dress-color-item"><div className="dress-color-circle dress-color-yellow forbidden" aria-hidden="true"><i /></div><span>Amarillo</span></div>
  <div className="dress-color-item"><div className="dress-color-circle dress-color-red forbidden" aria-hidden="true"><i /></div><span>Rojo</span></div>
  </div>
  <p className="dress-explanation">El blanco está reservado para la novia y el verde eucalipto es el color de nuestro cortejo. Te pedimos evitar también los tonos muy llamativos, como el rojo y el amarillo vivo.</p>
  <p className="dress-adults-note">🤍 Esta celebración está pensada para adultos. Con cariño les pedimos que esta noche sea solo para ellos.</p>
  </div>
          </article>

        <div className="gifts-card">
          <p className="eyebrow">Con cariño</p>
          <h2 id="gifts-title" className="section-title">Regalos</h2>
          <p className="gifts-intro">Nos llena de ilusión compartir este día con ustedes, rodeados de su cariño. Si deseas hacernos llegar algún detalle, debajo te dejamos las opciones.</p>
          <div className="gift-accordion">
            <details>
              <summary>Dólares (USD) · Zelle</summary>
              <div className="gift-details"><p><strong>Zelle:</strong> 401-492-7036 <button type="button" onClick={() => copyValue('zelle', '401-492-7036')}>{copiedKey === 'zelle' ? 'Copiado ✓' : 'Copiar'}</button></p><p><strong>Titular:</strong> María Mabel Collado Expósito</p></div>
            </details>
            <details>
              <summary>Pesos (DOP) $$ Banco BHD</summary>
              <div className="gift-details">
                {[['Banco', 'Banco BHD'], ['Nombre', 'ISAIAS LIRIANO'], ['Documento de identidad', '40222485977'], ['Cuenta de ahorros RD$', '29028340033'], ['Cuenta estándar', 'DO39BCBH00000000029028340033'], ['Correo', 'liriano0717@hotmail.com']].map(([label, value]) => <p key={label}><strong>{label}:</strong> {value} <button type="button" onClick={() => copyValue(label, value)}>{copiedKey === label ? 'Copiado ✓' : 'Copiar'}</button></p>)}
              </div>
            </details>
            <details>
              <summary>Regalos para el hogar</summary>
              <div className="gift-links gift-links-accordion"><a href="https://listaderegalos.casacuesta.com/Event/MariaMabel-IsaiasAntonio?utm_source=share" target="_blank" rel="noreferrer">Casa Cuesta <ExternalLink aria-hidden="true" /></a><a href="https://www.myregistry.com/wedding-registry/mar-a-mabel-collado-exp-sito-and-isa-as-antonio-liriano-madera-santo-domingo-/5631853" target="_blank" rel="noreferrer">Corripio o Amazon <ExternalLink aria-hidden="true" /></a></div>
            </details>
          </div>
        </div>
        </div>
      </section>

      <footer className="footer">
  <img className="footer-couple-photo" src="/pareja-beso.jpg" alt="María Mabel e Isaías besándose en acuarela" />
  <span>Mabel & Isaías</span>
  <small>2 · 01 · 2027</small>
</footer>
    </main>
  )
}
