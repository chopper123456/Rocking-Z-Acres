import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MarketingCorn() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/marketing/corn/projection', { replace: true }) }, [])
  return null
}
