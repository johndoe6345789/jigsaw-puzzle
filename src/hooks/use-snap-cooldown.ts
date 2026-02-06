import { useState, useEffect } from 'react'
import { SNAP_COOLDOWN_MS } from '@/lib/puzzle-utils'

export function useSnapCooldown(lastDisconnectedTime?: number) {
  const [isInCooldown, setIsInCooldown] = useState(false)

  useEffect(() => {
    if (lastDisconnectedTime) {
      const now = Date.now()
      const timeSinceDisconnect = now - lastDisconnectedTime

      if (timeSinceDisconnect < SNAP_COOLDOWN_MS) {
        setIsInCooldown(true)
        const remainingTime = SNAP_COOLDOWN_MS - timeSinceDisconnect

        const timer = setTimeout(() => {
          setIsInCooldown(false)
        }, remainingTime)

        return () => clearTimeout(timer)
      } else {
        setIsInCooldown(false)
      }
    } else {
      setIsInCooldown(false)
    }
  }, [lastDisconnectedTime])

  return isInCooldown
}
