import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MarketingSoybeans() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/marketing/soybeans/projection', { replace: true }) }, [])
  return null
}
