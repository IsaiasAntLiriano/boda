import { NextResponse } from 'next/server'

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx0Zp889Oq4-1HFvJsd3lX-sRpwa7aSE2flAMeYS3GiS_E1m62xU8OnDl_sQ56Zffhc/exec';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id') || searchParams.get('i')

  if (!APPS_SCRIPT_URL) {
    return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })
  }

  if (!id) {
    return NextResponse.json({ ok: false, error: 'Falta el código de invitación' }, { status: 400 })
  }

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?id=${encodeURIComponent(id)}`, {
      cache: 'no-store',
      redirect: 'follow',
    })
    const data: unknown = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json({ error: 'Error al conectar con la base de datos' }, { status: 502 })
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()

    if (!APPS_SCRIPT_URL) {
      return NextResponse.json({ success: false, error: 'Configuración incompleta' }, { status: 500 })
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      redirect: 'follow',
      cache: 'no-store',
    })
    const data: unknown = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json({ success: false, error: 'Error al actualizar la asistencia' }, { status: 502 })
  }
}
