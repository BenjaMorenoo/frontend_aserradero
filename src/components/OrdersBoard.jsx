import React from 'react'
import OrderCard from './OrderCard'

export default function OrdersBoard({ tab, pedidos, refresh, onFlyToTruck }) {
  let list = []

  if(tab === 'pedidos') {
    list = pedidos.filter(p => p.estado === 'pendiente')
  } else if(tab === 'produccion') {
    list = pedidos.filter(p => p.estado === 'enviado' || p.estado === 'en_preparacion')
  }

  // si el rol del usuario no corresponde al tab, no mostrar nada
  if(list.length === 0) return <p className="text-gray-500 text-center mt-4">No hay pedidos disponibles.</p>

  return (
    <div className="grid grid-cols-3 gap-4">
      {list.map(p => (
        <OrderCard key={p.id} pedido={p} onUpdate={refresh} tab={tab} onFlyToTruck={onFlyToTruck} />
      ))}
    </div>
  )
}
