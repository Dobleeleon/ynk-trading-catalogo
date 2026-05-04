// src/components/admin/CurrencyConverter.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { DollarSign, RefreshCw, TrendingUp, TrendingDown, AlertCircle, Send, Phone, FileText, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// API gratuita para tasas de cambio (ExchangeRate-API tiene tier gratuito)
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD'

// Tarifas estimadas de Western Union (basadas en datos reales de mercado)
// Estos valores son aproximados y se pueden ajustar
const WESTERN_UNION_FEES = {
  // Tarifa fija por transacción (en USD)
  fixedFee: 4.99,
  // Margen sobre la tasa de cambio (porcentaje)
  exchangeMargin: 0.015, // 1.5%
  // Tarifa por retiro en efectivo
  cashWithdrawalFee: 3.00,
  // Tarifa por transferencia a cuenta bancaria
  bankTransferFee: 0.00,
  // Impuesto por transacción internacional (4x1000 en Colombia)
  taxPercent: 0.004, // 0.4%
}

export function CurrencyConverter() {
  const [amount, setAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('COP')
  const [exchangeRate, setExchangeRate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [deliveryMethod, setDeliveryMethod] = useState('bank') // 'bank' or 'cash'
  const [conversionResult, setConversionResult] = useState(null)

  // Monedas soportadas
  const currencies = [
    { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', flag: '🇺🇸' },
    { code: 'COP', name: 'Peso Colombiano', symbol: '$', flag: '🇨🇴' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$', flag: '🇲🇽' },
  ]

  // Obtener tasa de cambio actual
  const fetchExchangeRate = useCallback(async () => {
    if (fromCurrency === toCurrency) {
      setExchangeRate(1)
      return
    }

    setLoading(true)
    try {
      // Usar API gratuita de exchange rates
      const response = await fetch(`${EXCHANGE_API_URL}`)
      const data = await response.json()
      
      if (data.rates) {
        const rate = data.rates[toCurrency] / data.rates[fromCurrency]
        setExchangeRate(rate)
        setLastUpdate(new Date())
        toast.success('Tasa de cambio actualizada')
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error)
      // Fallback: tasa aproximada si falla la API
      if (fromCurrency === 'USD' && toCurrency === 'COP') {
        setExchangeRate(3650)
        toast.warning('Usando tasa de respaldo (aproximada)')
      } else {
        toast.error('Error al obtener tasa de cambio')
      }
    } finally {
      setLoading(false)
    }
  }, [fromCurrency, toCurrency])

  // Cargar tasa al inicio y cuando cambien las monedas
  useEffect(() => {
    fetchExchangeRate()
  }, [fetchExchangeRate])

  // Calcular conversión y desglose
  const calculateConversion = () => {
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Ingresa un monto válido')
      return
    }

    if (!exchangeRate) {
      toast.error('Esperando tasa de cambio...')
      return
    }

    // 1. Monto base
    const baseAmount = amountNum
    
    // 2. Tarifa fija de Western Union
    const fixedFee = WESTERN_UNION_FEES.fixedFee
    
    // 3. Margen sobre la tasa de cambio (lo que gana Western Union)
    const exchangeMarginAmount = baseAmount * WESTERN_UNION_FEES.exchangeMargin
    
    // 4. Tasa real aplicada (con margen)
    const effectiveRate = exchangeRate * (1 - WESTERN_UNION_FEES.exchangeMargin)
    
    // 5. Monto después de tarifa fija y margen
    const afterFeesUSD = baseAmount - fixedFee - exchangeMarginAmount
    
    // 6. Conversión a moneda destino
    const convertedAmount = afterFeesUSD * effectiveRate
    
    // 7. Tarifa por método de entrega
    let deliveryFee = 0
    if (deliveryMethod === 'cash') {
      deliveryFee = WESTERN_UNION_FEES.cashWithdrawalFee
    }
    
    // 8. Impuestos (4x1000 para Colombia)
    let taxAmount = 0
    if (toCurrency === 'COP') {
      taxAmount = convertedAmount * WESTERN_UNION_FEES.taxPercent
    }
    
    // 9. Monto final a recibir
    const finalAmount = convertedAmount - deliveryFee - taxAmount
    
    // 10. Total de cargos
    const totalFees = fixedFee + exchangeMarginAmount + deliveryFee + taxAmount
    const totalFeesUSD = (totalFees / effectiveRate)

    setConversionResult({
      baseAmount,
      baseCurrency: fromCurrency,
      targetCurrency: toCurrency,
      marketRate: exchangeRate,
      effectiveRate,
      convertedAmount,
      finalAmount,
      totalFees,
      totalFeesUSD,
      breakdown: {
        westernUnionFixedFee: fixedFee,
        exchangeMargin: exchangeMarginAmount,
        deliveryFee,
        tax: taxAmount,
      }
    })
  }

  // Resetear resultado cuando cambian los inputs
  useEffect(() => {
    setConversionResult(null)
  }, [amount, fromCurrency, toCurrency, deliveryMethod])

  // Formatear número como moneda
  const formatCurrency = (value, currency = 'USD') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeInUp 0.4s ease-out;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '1.8rem', 
          fontWeight: '700', 
          color: '#1a2332',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <DollarSign size={32} style={{ color: '#c47d3e' }} />
          Conversor de Moneda y Simulador Western Union
        </h1>
        <p style={{ color: '#6b7280' }}>
          Simula tus envíos de dinero con tasas de cambio actualizadas y desglose completo de comisiones
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: '2rem'
      }}>
        {/* Panel izquierdo - Inputs */}
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          border: '1px solid #e5dfd7',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ 
            fontSize: '1.2rem', 
            fontWeight: '600', 
            marginBottom: '1.5rem',
            color: '#1a2332'
          }}>
            Datos del Envío
          </h2>

          {/* Monto a enviar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.8rem', 
              fontWeight: '600', 
              color: '#1a2332',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Monto a enviar
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                style={{
                  padding: '0.9rem',
                  border: '1.5px solid #e5dfd7',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'white',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} - {c.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  flex: 1,
                  padding: '0.9rem',
                  border: '1.5px solid #e5dfd7',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#c47d3e'}
                onBlur={(e) => e.target.style.borderColor = '#e5dfd7'}
              />
            </div>
          </div>

          {/* Moneda de destino */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.8rem', 
              fontWeight: '600', 
              color: '#1a2332',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Moneda a recibir
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              style={{
                width: '100%',
                padding: '0.9rem',
                border: '1.5px solid #e5dfd7',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Método de entrega */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.8rem', 
              fontWeight: '600', 
              color: '#1a2332',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Método de entrega
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setDeliveryMethod('bank')}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  borderRadius: '12px',
                  border: `1.5px solid ${deliveryMethod === 'bank' ? '#c47d3e' : '#e5dfd7'}`,
                  background: deliveryMethod === 'bank' ? 'rgba(196,125,62,0.05)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <Send size={18} style={{ marginBottom: '0.3rem', color: deliveryMethod === 'bank' ? '#c47d3e' : '#9a8f84' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>Cuenta Bancaria</div>
                <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>Sin tarifa extra</div>
              </button>
              <button
                onClick={() => setDeliveryMethod('cash')}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  borderRadius: '12px',
                  border: `1.5px solid ${deliveryMethod === 'cash' ? '#c47d3e' : '#e5dfd7'}`,
                  background: deliveryMethod === 'cash' ? 'rgba(196,125,62,0.05)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <FileText size={18} style={{ marginBottom: '0.3rem', color: deliveryMethod === 'cash' ? '#c47d3e' : '#9a8f84' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>Retiro en Efectivo</div>
                <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>+$3.00 USD</div>
              </button>
            </div>
          </div>

          {/* Tasa actual */}
          <div style={{
            background: '#f8f4ef',
            borderRadius: '16px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#9a8f84', marginBottom: '0.25rem' }}>
                Tasa de mercado actual
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1a2332' }}>
                1 {fromCurrency} = {exchangeRate ? exchangeRate.toFixed(2) : '---'} {toCurrency}
              </div>
            </div>
            <button
              onClick={fetchExchangeRate}
              disabled={loading}
              style={{
                background: 'transparent',
                border: '1.5px solid #e5dfd7',
                borderRadius: '40px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#c47d3e'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5dfd7'}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>

          {/* Última actualización */}
          {lastUpdate && (
            <div style={{ fontSize: '0.65rem', color: '#9a8f84', textAlign: 'center', marginTop: '0.5rem' }}>
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </div>
          )}

          {/* Botón calcular */}
          <button
            onClick={calculateConversion}
            disabled={!amount || !exchangeRate}
            style={{
              width: '100%',
              background: '#1a2332',
              color: 'white',
              padding: '1rem',
              border: 'none',
              borderRadius: '40px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: (!amount || !exchangeRate) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '1rem'
            }}
            onMouseEnter={(e) => {
              if (amount && exchangeRate) {
                e.currentTarget.style.background = '#c47d3e'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1a2332'
            }}
          >
            Calcular Envío
          </button>

          {/* Nota importante */}
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(196,125,62,0.08)',
            borderRadius: '12px',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-start'
          }}>
            <AlertCircle size={16} style={{ color: '#c47d3e', marginTop: '0.1rem' }} />
            <div style={{ fontSize: '0.7rem', color: '#6b7280', lineHeight: '1.5' }}>
              Las tarifas son aproximadas y pueden variar según el monto, país de destino y promociones vigentes. 
              Para montos mayores, consulta tarifas personalizadas con tu asesor.
            </div>
          </div>
        </div>

        {/* Panel derecho - Resultados */}
        <div className="animate-fade-in">
          {conversionResult ? (
            <div style={{
              background: '#fff',
              borderRadius: '24px',
              border: '1px solid #e5dfd7',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
            }}>
              {/* Header del resultado */}
              <div style={{
                background: '#1a2332',
                padding: '1.5rem',
                textAlign: 'center',
                color: 'white'
              }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                  RECIBIRÁ APROXIMADAMENTE
                </div>
                <div style={{ 
                  fontSize: '2.2rem', 
                  fontWeight: '700',
                  fontFamily: "'Playfair Display', serif"
                }}>
                  {formatCurrency(conversionResult.finalAmount, conversionResult.targetCurrency)}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>
                  Basado en tasas y tarifas actuales
                </div>
              </div>

              {/* Desglose detallado */}
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <TrendingUp size={16} style={{ color: '#c47d3e' }} />
                  Desglose del Envío
                </h3>

                <div style={{ marginBottom: '1rem' }}>
                  {/* Monto enviado */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5dfd7' }}>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Monto enviado</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{formatCurrency(conversionResult.baseAmount, conversionResult.baseCurrency)}</span>
                  </div>
                  
                  {/* Tarifa Western Union */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5dfd7' }}>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Tarifa Western Union</span>
                    <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>
                      -{formatCurrency(conversionResult.breakdown.westernUnionFixedFee, conversionResult.baseCurrency)}
                    </span>
                  </div>
                  
                  {/* Margen de cambio */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5dfd7' }}>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      Margen sobre tasa (1.5%)
                      <span style={{ fontSize: '0.7rem', marginLeft: '0.3rem', color: '#9a8f84' }}>(diferencia de cambio)</span>
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>
                      -{formatCurrency(conversionResult.breakdown.exchangeMargin, conversionResult.baseCurrency)}
                    </span>
                  </div>

                  {/* Tasa aplicada */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5dfd7', background: '#f8f4ef' }}>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      Tasa aplicada
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#c47d3e' }}>
                      1 USD = {conversionResult.effectiveRate.toFixed(2)} COP
                    </span>
                  </div>

                  {/* Tasa de mercado vs aplicada */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5dfd7' }}>
                    <span style={{ fontSize: '0.75rem', color: '#9a8f84' }}>
                      vs Tasa de mercado
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      1 USD = {conversionResult.marketRate.toFixed(2)} COP <TrendingDown size={12} style={{ color: '#ef4444', display: 'inline', marginLeft: '0.2rem' }} />
                    </span>
                  </div>

                  {/* Tarifa de entrega */}
                  {conversionResult.breakdown.deliveryFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5dfd7' }}>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Tarifa por retiro en efectivo</span>
                      <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>
                        -{formatCurrency(conversionResult.breakdown.deliveryFee, conversionResult.baseCurrency)}
                      </span>
                    </div>
                  )}

                  {/* Impuestos */}
                  {conversionResult.breakdown.tax > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5dfd7' }}>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Impuesto 4x1000 (Colombia)</span>
                      <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>
                        -{formatCurrency(conversionResult.breakdown.tax, conversionResult.targetCurrency)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total de cargos */}
                <div style={{
                  background: '#f8f4ef',
                  borderRadius: '16px',
                  padding: '1rem',
                  marginTop: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1a2332' }}>
                      Total en cargos
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ef4444' }}>
                      {formatCurrency(conversionResult.totalFeesUSD, 'USD')} USD
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                      Equivalente a {conversionResult.totalFees.toFixed(2)} COP
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                      {((conversionResult.totalFeesUSD / conversionResult.baseAmount) * 100).toFixed(1)}% del envío
                    </span>
                  </div>
                </div>

                {/* CTA de contacto */}
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #c47d3e15 0%, #c47d3e05 100%)',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    ¿Necesitas enviar un monto mayor o cotización personalizada?
                  </p>
                  <button
                    onClick={() => window.location.href = '/contacto'}
                    style={{
                      background: '#1a2332',
                      color: 'white',
                      padding: '0.5rem 1.5rem',
                      border: 'none',
                      borderRadius: '40px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#c47d3e'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#1a2332'}
                  >
                    Consultar con Asesor
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: '#f8f4ef',
              borderRadius: '24px',
              padding: '3rem',
              textAlign: 'center',
              border: '1px solid #e5dfd7'
            }}>
              <DollarSign size={48} style={{ color: '#c47d3e', marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Ingresa los datos del envío y haz clic en "Calcular Envío"
              </p>
              <p style={{ fontSize: '0.75rem', color: '#9a8f84' }}>
                Obtendrás un desglose completo de comisiones y el monto final a recibir
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}