import { useState } from 'react'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [playerData, setPlayerData] = useState(null)

  const searchPlayer = async () => {
    const [name, tag] = username.split('#')
    const apiKey = import.meta.env.VITE_HENRIK_API_KEY

    const response = await fetch (
      `https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`,
      {
        headers: {
          Authorization: apiKey
        }
      }
    )

    const data = await response.json()
    setPlayerData(data)
  }

    return (
    <div>
      <h1>Valorant Tracker</h1>
      <input
        type="text"
        placeholder="username#NA1"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={searchPlayer}>search</button>

	{playerData && (
	    <div className="player-card">
		<img src={playerData.data.card.small} />
		<div>
		    {playerData.data.name}
		    #
		    {playerData.data.tag}
		    <br />
		    {playerData.data.region}
		    <br />
		    {playerData.data.account_level}
		</div>
	    </div>
	)}
    </div>
  )
}

export default App
