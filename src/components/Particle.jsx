import { motion, AnimatePresence } from 'framer-motion'
import React, { useEffect, useState } from 'react'

function Particle({ id }) {
  return (
    <motion.div
      key={id}
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{ y: -20, opacity: 0, scale: 0.5 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute w-2 h-2 bg-yellow-400 rounded-full"
      style={{ left: '10%', bottom: '50%' }}
    />
  )
}
