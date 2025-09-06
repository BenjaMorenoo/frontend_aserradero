// OrderCard.jsx mejorado con control de flujo de producción
import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { pb } from '../lib/pocketbase'

export default function OrderCard({ pedido, onUpdate, tab, onFlyToTruck }) {
    const [loading, setLoading] = useState(false)
    const cardRef = useRef(null)

    const estadoColor = {
        pendiente: 'bg-red-100 text-red-800',
        enviado: 'bg-blue-100 text-blue-800',
        en_preparacion: 'bg-yellow-100 text-yellow-800',
        completado: 'bg-green-100 text-green-800'
    }

    async function handleEnviar() {
        setLoading(true)
        try {
            if (cardRef.current) {
                const rect = cardRef.current.getBoundingClientRect()
                onFlyToTruck(rect, pedido)
            }
            const newEstado = tab === 'pedidos' ? 'enviado' : pedido.estado
            await pb.collection('pedidos').update(pedido.id, { estado: newEstado })
            if (tab === 'pedidos') window.dispatchEvent(new CustomEvent('aserradero:send', { detail: { id: pedido.id } }))
            onUpdate()
        } catch (err) {
            console.error(err)
            alert('Error al actualizar estado')
        } finally {
            setLoading(false)
        }
    }

    async function handleCambioEstado(nuevoEstado) {
        setLoading(true)
        try {
            await pb.collection('pedidos').update(pedido.id, { estado: nuevoEstado })
            onUpdate()
        } catch (err) {
            console.error(err)
            alert('Error al actualizar estado')
        } finally {
            setLoading(false)
        }
    }

    if (tab === 'produccion' && pedido.estado === 'completado') return null

    return (
        <motion.div
            ref={cardRef}
            layout
            initial={{ opacity: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className={`p-4 rounded-xl shadow-lg border-l-4 ${estadoColor[pedido.estado]} bg-white`}
        >
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">{pedido.cliente}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${estadoColor[pedido.estado]}`}>
                    {pedido.estado === 'pendiente' ? '🕒 Pendiente' :
                        pedido.estado === 'enviado' ? '📦 Enviado' :
                            pedido.estado === 'en_preparacion' ? '⚙️ En Preparación' : '✅ Completado'}
                </span>
            </div>
            <p className="text-sm mb-1 font-medium">{pedido.producto} — Cantidad: {pedido.cantidad}</p>
            {pedido.observaciones && <p className="text-xs text-gray-600 mb-2">{pedido.observaciones}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
                {tab === 'pedidos' && pedido.estado === 'pendiente' && (
                    <button
                        onClick={handleEnviar}
                        disabled={loading}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                    >
                        {loading ? 'Enviando...' : 'Enviar a Producción'}
                    </button>
                )}
                {tab === 'produccion' && (
                    <>
                        {/* Botón "En Preparación", solo si el pedido está en "enviado" */}
                        {pedido.estado === 'enviado' && (
                            <button
                                onClick={() => handleCambioEstado('en_preparacion')}
                                disabled={loading}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition"
                            >
                                {loading ? '...' : 'En Preparación'}
                            </button>
                        )}

                        {/* Botón "Completar", solo habilitado si el pedido ya está en preparación */}
                        <button
                            onClick={() => handleCambioEstado('completado')}
                            disabled={loading || pedido.estado !== 'en_preparacion'}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${
                                pedido.estado === 'en_preparacion'
                                    ? 'bg-gray-500 hover:bg-gray-600 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {loading ? '...' : 'Completar'}
                        </button>
                    </>
                )}
            </div>
        </motion.div>
    )
}
