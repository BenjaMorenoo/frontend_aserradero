import React, { useEffect, useState } from 'react'
import { pb } from '../lib/pocketbase'
import OrdersBoard from '../components/OrdersBoard'
import Truck, { truckRef } from '../components/Truck'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import CreateOrder from '../components/CreateOrder'

export default function Dashboard() {
    const [tab, setTab] = useState('pedidos')
    const [pedidos, setPedidos] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [flyers, setFlyers] = useState([])
    const [user, setUser] = useState(null)
    const [rol, setRole] = useState('')
    const [visibleTabs, setVisibleTabs] = useState([])
    const navigate = useNavigate()

    // cargar usuario y rol
    useEffect(() => {
        const currentUser = pb.authStore.model
        if (currentUser) {
            setUser(currentUser)
            setRole(currentUser.rol)

            const tabs = []
            if (currentUser.rol === 'pedidos') tabs.push('pedidos', 'crear_pedido')
            if (currentUser.rol === 'produccion') tabs.push('produccion')
            if (currentUser.rol === 'admin') tabs.push('pedidos', 'crear_pedido', 'produccion', 'usuarios')
            setVisibleTabs(tabs)

            if (!tabs.includes(tab)) setTab(tabs[0])
        } else {
            navigate('/login')
        }
    }, [])

    // obtener pedidos
    async function fetchPedidos(signal) {
        try {
            const res = await pb.collection('pedidos').getList(1, 50, { sort: '-created', signal })
            setPedidos(res.items)
        } catch (err) {
            if (err.name !== 'AbortError') console.error(err)
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        fetchPedidos(controller.signal)
        return () => controller.abort()
    }, [])

    useEffect(() => {
        let isMounted = true
        const setup = async () => {
            await pb.collection('pedidos').subscribe('*', () => {
                if (isMounted) fetchPedidos()
            })
        }
        setup()
        return () => {
            isMounted = false
            pb.collection('pedidos').unsubscribe()
        }
    }, [])

    // obtener usuarios (solo admin)
    async function fetchUsuarios(signal) {
        try {
            const res = await pb.collection("users").getList(1, 50, { sort: "name", signal })
            setUsuarios(res.items)
        } catch (err) {
            if (err.name !== 'AbortError') console.error(err)
        }
    }

    useEffect(() => {
        if (rol === 'admin') {
            const controller = new AbortController()
            fetchUsuarios(controller.signal)
            return () => controller.abort()
        }
    }, [rol])

    // cambiar rol de usuario
    const handleRoleChange = async (userId, newRole) => {
        try {
            await pb.collection("users").update(userId, { rol: newRole })
            setUsuarios(prev =>
                prev.map(u => (u.id === userId ? { ...u, rol: newRole } : u))
            )
        } catch (err) {
            console.error(err)
            alert("Error al actualizar rol")
        }
    }

    function handleFlyToTruck(cardRect, pedido) {
        if(!truckRef.current) return
        const truckRect = truckRef.current.getBoundingClientRect()
        const id = Date.now()
        setFlyers(prev => [...prev, { id, cardRect, truckRect, pedido }])
        setTimeout(() => setFlyers(prev => prev.filter(f => f.id !== id)), 900)
    }

    function handleLogout() {
        pb.authStore.clear()
        navigate('/login')
    }

    return (
        <div className="bg-gray-50 min-h-screen p-6">
            {/* HEADER */}
            <div className="mb-6 p-4 bg-white rounded-xl shadow-md flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Panel de Pedidos</h1>
                    {user && <p className="text-sm text-gray-600 mt-1">{user.name} — {user.email}</p>}
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
                >
                    Cerrar sesión
                </button>
            </div>

            {/* TABS */}
            <div className="flex gap-2 mb-6">
                {visibleTabs.includes('pedidos') && (
                    <button className={`px-4 py-2 rounded-lg font-semibold ${tab === 'pedidos' ? 'bg-sky-600 text-white shadow' : 'bg-white border hover:bg-sky-100'}`} onClick={() => setTab('pedidos')}>Pedidos</button>
                )}
                {visibleTabs.includes('crear_pedido') && (
                    <button className={`px-4 py-2 rounded-lg font-semibold ${tab === 'crear_pedido' ? 'bg-green-600 text-white shadow' : 'bg-white border hover:bg-green-100'}`} onClick={() => setTab('crear_pedido')}>Crear Pedido</button>
                )}
                {visibleTabs.includes('produccion') && (
                    <button className={`px-4 py-2 rounded-lg font-semibold ${tab === 'produccion' ? 'bg-sky-600 text-white shadow' : 'bg-white border hover:bg-sky-100'}`} onClick={() => setTab('produccion')}>Producción</button>
                )}
                {visibleTabs.includes('usuarios') && (
                    <button className={`px-4 py-2 rounded-lg font-semibold ml-auto ${tab === 'usuarios' ? 'bg-purple-600 text-white shadow' : 'bg-white border hover:bg-purple-100'}`} onClick={() => setTab('usuarios')}>
                        Usuarios
                    </button>
                )}
            </div>

            {/* PANEL DE TARJETAS */}
            <div className="relative p-4 bg-gray-100 rounded-xl shadow-inner min-h-[60vh]">
                {tab === 'pedidos' && (
                    <OrdersBoard
                        tab="pedidos"
                        pedidos={pedidos.filter(p => p.estado === 'pendiente')}
                        refresh={() => fetchPedidos()}
                        onFlyToTruck={handleFlyToTruck}
                    />
                )}
                {tab === 'crear_pedido' && <CreateOrder onCreated={() => fetchPedidos()} />}
                {tab === 'produccion' && (
                    <OrdersBoard
                        tab="produccion"
                        pedidos={pedidos.filter(p => p.estado === 'enviado' || p.estado === 'en_preparacion')}
                        refresh={() => fetchPedidos()}
                        onFlyToTruck={handleFlyToTruck}
                    />
                )}
                {tab === 'usuarios' && (
                    <div className="grid grid-cols-3 gap-4">
                        {usuarios.map(u => (
                            <div key={u.id} className="flex flex-col gap-2 p-4 bg-white shadow rounded">
                                <p className="font-semibold">{u.name}</p>
                                <p className="text-sm text-gray-600">{u.email}</p>
                                <select
                                    value={u.rol}
                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="pedidos">Pedidos</option>
                                    <option value="produccion">Producción</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        ))}
                    </div>
                )}

                <Truck />
                <AnimatePresence>
                    {flyers.map(f => (
                        <motion.div
                            key={f.id}
                            initial={{
                                left: f.cardRect.left,
                                top: f.cardRect.top,
                                width: f.cardRect.width,
                                height: f.cardRect.height,
                                position: 'fixed',
                                zIndex: 1000
                            }}
                            animate={{
                                left: f.truckRect.left,
                                top: f.truckRect.top,
                                width: f.truckRect.width,
                                height: f.truckRect.height,
                                opacity: 0,
                                scale: 0.5
                            }}
                            transition={{ duration: 0.8, ease: 'easeInOut' }}
                            className="bg-white rounded-xl shadow-lg border-l-4 p-4"
                        >
                            <h3 className="font-semibold text-gray-800">{f.pedido.cliente}</h3>
                            <p className="text-sm text-gray-700">{f.pedido.producto} — {f.pedido.cantidad}</p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
