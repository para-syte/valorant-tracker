import { useState } from 'react'
import './App.css'

function App() {
    const [username, setUsername] = useState('')
    const [playerData, setPlayerData] = useState(null)
    const [playerRank, setPlayerRank] = useState(null)
    const platform = "pc"
    
    const searchPlayer = async () => {
	const [name, tag] = username.split('#')
	const apiKey = import.meta.env.VITE_HENRIK_API_KEY

	const accountResponse = await fetch (
	    `https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`,
	    {
		headers: {
		    Authorization: apiKey
		}
	    }
	)

	const accountData = await accountResponse.json()
	setPlayerData(accountData)
	const region = accountData.data.region

	const rankResponse = await fetch (
	    `https://api.henrikdev.xyz/valorant/v3/mmr/${region}/${platform}/${name}/${tag}`,
	    {
		headers: {
		    Authorization: apiKey
		}
	    }
	)

	const rankData = await rankResponse.json()
	setPlayerRank(rankData)
	console.log(rankData)
	
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

	    {playerData && playerRank && (
		<div className="player-card">
		    <img src={playerData.data.card.small} />
		    <div>
			{playerData.data.account_level}
			<br />
			{playerData.data.name}
			#
			{playerData.data.tag}
			<br />
			{playerData.data.region}
			<br />
			{`${playerRank.data.current.tier.name}: ${playerRank.data.current.rr}rr`}
		    </div>
		</div>
	    )}
	</div>
    )
}

export default App
