import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pb } from '../lib/pocketbase'


export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()


    async function handleSubmit(e) {
        e.preventDefault()
        try {
            await pb.collection('users').authWithPassword(email, password)
            // opción: await pb.collection('users').authRefresh()
            navigate('/')
        } catch (err) {
            console.error(err)
            alert('Error al autenticar')
        }
    }


    return (
        <div className="min-h-screen flex items-center justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-white rounded shadow">
                <h2 className="text-xl font-semibold mb-4">Iniciar sesión</h2>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" className="w-full p-2 mb-2 border rounded" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="contraseña" className="w-full p-2 mb-4 border rounded" />
                <button className="w-full py-2 bg-sky-600 text-white rounded">Entrar</button>
            </form>
        </div>
    )
}