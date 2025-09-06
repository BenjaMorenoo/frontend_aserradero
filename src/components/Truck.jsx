import React, { useEffect, useRef, useState } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'

export const truckRef = React.createRef() 

function Particle({ id }) {
  return (
    <motion.div
      key={id}
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{ y: -20, opacity: 0, scale: 0.5 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute w-2 h-2 bg-yellow-400 rounded-full"
    />
  )
}

export default function Truck() {
  const controls = useAnimation()
  const [queueCount, setQueueCount] = useState(0)
  const queueRef = useRef([])
  const busyRef = useRef(false)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    let isMounted = true

    const processQueue = async () => {
      if (busyRef.current || queueRef.current.length === 0) return
      busyRef.current = true
      setQueueCount(queueRef.current.length)
      const item = queueRef.current.shift()

      // lanzar partícula dentro del camión
      const id = Date.now()
      setParticles(prev => [...prev, { id }])
      setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 600)

      // animación del camión hacia la izquierda
      await controls.start({
        x: ['0vw', '-30vw', '-120vw'],
        rotate: [0, -2, -6],
        opacity: [1, 1, 0],
        transition: { duration: 1, ease: 'easeInOut' }
      })
      await controls.set({ x: '0vw', opacity: 1, rotate: 0 })

      busyRef.current = false
      setQueueCount(queueRef.current.length)

      if (queueRef.current.length > 0)
        setTimeout(() => { if (isMounted) processQueue() }, 150)
    }

    function onSend(e) {
      queueRef.current.push(e?.detail ?? { id: null, ts: Date.now() })
      setQueueCount(queueRef.current.length)
      processQueue()
    }

    window.addEventListener('aserradero:send', onSend)
    return () => { window.removeEventListener('aserradero:send', onSend); isMounted = false }
  }, [controls])

  return (
    <div className="fixed bottom-4 right-4 pointer-events-none">
      <motion.div
        animate={controls}
        initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
        className="w-28 h-14 rounded-2xl  flex items-center justify-center text-white shadow-2xl relative"
      >
        <span className="text-2xl select-none">🚚</span>
        <AnimatePresence>
          {particles.map(p => <Particle key={p.id} id={p.id} />)}
        </AnimatePresence>
      </motion.div>
      {queueCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow pointer-events-none">
          {queueCount}
        </div>
      )}
    </div>
  )
}
