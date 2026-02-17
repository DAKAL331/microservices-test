import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import './App.css'

interface Alert {
  city: string
  aqi: number
  category: string
  timestamp: string
}

function App() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001')

    socket.on('new_alert', (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 20))
    })

    return () => { socket.disconnect() }
  }, [])

  const fetchAlerts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/alerts')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setAlerts(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Air Quality Alerts</h1>
      <button onClick={fetchAlerts} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Alerts'}
      </button>

      {error && <p className="error">{error}</p>}

      {alerts.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>City</th>
              <th>AQI</th>
              <th>Category</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, i) => (
              <tr key={i}>
                <td>{alert.city}</td>
                <td>{alert.aqi}</td>
                <td>{alert.category}</td>
                <td>{new Date(alert.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !error && alerts.length === 0 && (
        <p className="hint">Click the button to load alerts from the API.</p>
      )}
    </div>
  )
}

export default App
