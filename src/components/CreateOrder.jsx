import React, { useState } from 'react'
import { pb } from '../lib/pocketbase'

export default function CreateOrder({ onCreated }) {
    const [cliente, setCliente] = useState('')
    const [producto, setProducto] = useState('')
    const [cantidad, setCantidad] = useState('')
    const [observaciones, setObservaciones] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            await pb.collection('pedidos').create({
                cliente,
                producto,
                cantidad: parseInt(cantidad),
                observaciones,
                estado: 'pendiente'
            })
            onCreated()
            setCliente('')
            setProducto('')
            setCantidad('')
            setObservaciones('')
        } catch(err) {
            console.error(err)
            alert('Error al crear pedido')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto flex flex-col gap-4">
            <h2 className="text-xl font-bold">Crear Nuevo Pedido</h2>
            <input value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Cliente" className="p-2 border rounded"/>
            <input value={producto} onChange={e => setProducto(e.target.value)} placeholder="Producto" className="p-2 border rounded"/>
            <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="Cantidad" className="p-2 border rounded"/>
            <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Observaciones" className="p-2 border rounded"/>
            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Pedido'}
            </button>
        </form>
    )
}
