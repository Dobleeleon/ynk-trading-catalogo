// src/components/admin/CurrencyConverter.jsx
import React, { useState, useEffect, useCallback } from 'react'
import {
  DollarSign,
  RefreshCw,
  TrendingDown,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'https://api.frankfurter.app/latest'

const FEES = {
  fixedUSD: 4.99,
  spread: 0.02,
  cashFeeUSD: 3,
  taxCO: 0.004,
}

export function CurrencyConverter() {
  const [amount, setAmount] = useState('')
  const [rate, setRate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [delivery, setDelivery] = useState('bank')
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchRate = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}?from=USD&to=COP`)
      const data = await res.json()

      if (data?.rates?.COP) {
        setRate(data.rates.COP)
        setLastUpdate(new Date())
      } else throw new Error()
    } catch {
      setRate(4000)
      toast('Usando tasa estimada', { icon: '⚠️' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRate()
  }, [fetchRate])

  const calculate = () => {
    const usd = parseFloat(amount)
    if (!usd || usd <= 0) return toast.error('Monto inválido')

    const fixedFee = FEES.fixedUSD
    const afterFixed = usd - fixedFee

    if (afterFixed <= 0)
      return toast.error('No cubre comisión')

    const effectiveRate = rate * (1 - FEES.spread)
    const grossCOP = afterFixed * effectiveRate

    const cashFeeCOP =
      delivery === 'cash'
        ? FEES.cashFeeUSD * effectiveRate
        : 0

    const taxCOP = grossCOP * FEES.taxCO
    const finalCOP = grossCOP - cashFeeCOP - taxCOP

    const idealCOP = usd * rate
    const lossCOP = idealCOP - finalCOP
    const lossUSD = lossCOP / rate

    setResult({
      usd,
      rate,
      effectiveRate,
      finalCOP,
      idealCOP,
      lossCOP,
      lossUSD,
      breakdown: {
        fixedFee,
        spreadLoss: (rate - effectiveRate) * usd,
        cashFeeCOP,
        taxCOP,
      },
    })
  }

  const format = (v, c) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: c,
    }).format(v)

  return (
    <div style={{ maxWidth: 1100, margin: 'auto', padding: 20 }}>
      {/* HEADER */}
      <h1 style={{ display: 'flex', gap: 10 }}>
        <DollarSign /> Simulador de Envíos
      </h1>

      {/* INPUT CARD */}
      <div style={card}>
        <h3>Datos del envío</h3>

        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="number"
            placeholder="Monto en USD"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={input}
          />

          <select
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            style={input}
          >
            <option value="bank">Cuenta</option>
            <option value="cash">Efectivo</option>
          </select>
        </div>

        {/* TASA */}
        <div style={rateBox}>
          <div>
            <small>Tasa mercado</small>
            <strong>
              1 USD = {rate?.toFixed(2) || '---'} COP
            </strong>
          </div>

          <button onClick={fetchRate} style={btnGhost}>
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>

        <button onClick={calculate} style={btnPrimary}>
          Calcular envío
        </button>
      </div>

      {/* RESULTADO */}
      {result && (
        <div style={card}>
          {/* RESULTADO GRANDE */}
          <div style={resultHeader}>
            <small>RECIBES</small>
            <h2>{format(result.finalCOP, 'COP')}</h2>
          </div>

          {/* TASAS */}
          <div style={row}>
            <span>Tasa mercado</span>
            <span>{result.rate.toFixed(2)}</span>
          </div>

          <div style={rowHighlight}>
            <span>Tasa aplicada</span>
            <span>
              {result.effectiveRate.toFixed(2)}{' '}
              <TrendingDown size={14} color="red" />
            </span>
          </div>

          {/* DESGLOSE */}
          <h4>Costos</h4>

          <div style={row}>
            <span>Comisión fija</span>
            <span>-{format(result.breakdown.fixedFee, 'USD')}</span>
          </div>

          <div style={row}>
            <span>Pérdida por cambio</span>
            <span>-{format(result.breakdown.spreadLoss, 'COP')}</span>
          </div>

          {delivery === 'cash' && (
            <div style={row}>
              <span>Retiro efectivo</span>
              <span>-{format(result.breakdown.cashFeeCOP, 'COP')}</span>
            </div>
          )}

          <div style={row}>
            <span>Impuesto</span>
            <span>-{format(result.breakdown.taxCOP, 'COP')}</span>
          </div>

          {/* ANALISIS */}
          <div style={analysisBox}>
            <p>
              Valor real sin comisiones:{' '}
              {format(result.idealCOP, 'COP')}
            </p>

            <p>
              Total perdido:{' '}
              <strong>
                {format(result.lossCOP, 'COP')} (
                {format(result.lossUSD, 'USD')})
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={note}>
        <AlertCircle size={14} />
        Simulación basada en tasas reales. Western Union aplica
        variaciones dinámicas.
      </div>

      {lastUpdate && (
        <div style={{ fontSize: 12 }}>
          Actualizado: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}

/* 🎨 ESTILOS */

const card = {
  background: '#fff',
  padding: 20,
  borderRadius: 16,
  marginTop: 20,
  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
}

const input = {
  padding: 10,
  borderRadius: 10,
  border: '1px solid #ddd',
  flex: 1,
}

const btnPrimary = {
  marginTop: 15,
  padding: 12,
  width: '100%',
  background: '#1a2332',
  color: '#fff',
  border: 'none',
  borderRadius: 20,
  cursor: 'pointer',
}

const btnGhost = {
  border: '1px solid #ddd',
  padding: 6,
  borderRadius: 20,
  background: 'transparent',
  cursor: 'pointer',
}

const rateBox = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 15,
  alignItems: 'center',
}

const resultHeader = {
  background: '#1a2332',
  color: 'white',
  padding: 20,
  borderRadius: 12,
  textAlign: 'center',
}

const row = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
}

const rowHighlight = {
  ...row,
  background: '#f5f5f5',
  padding: 10,
  borderRadius: 10,
}

const analysisBox = {
  marginTop: 15,
  padding: 10,
  background: '#fff4e5',
  borderRadius: 10,
}

const note = {
  marginTop: 20,
  fontSize: 12,
  display: 'flex',
  gap: 5,
  color: '#666',
}