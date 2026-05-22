import { useState } from 'react'
import './App.css'

function App() {
    const [username, setUsername] = useState('')
    const [playerData, setPlayerData] = useState(null)
    const [playerRank, setPlayerRank] = useState(null)
    const [loading, setLoading] = useState(false)
    const [matchList, setMatchList] = useState(null)
    const platform = "pc"
    
    const searchPlayer = async () => {
	setLoading(true)
	setPlayerData(null)
	setPlayerRank(null)
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

	const matchListResponse = await fetch (
	    `https://api.henrikdev.xyz/valorant/v3/matches/${region}/${name}/${tag}`,
	    {
		headers: {
		    Authorization: apiKey
		}
	    }
	)

	const matchListData = await matchListResponse.json()
	setMatchList(matchListData)
	console.log(matchListData)
	setLoading(false)
    }

    return (
	<div>
	    <h1>Valorant Tracker</h1>
	    <input
		type="text"
		placeholder="username#NA1"
		value={username}
		onChange={(e) => setUsername(e.target.value)}
		onKeyDown={(e) => e.key === 'Enter' && searchPlayer()}
	    />
	    <button onClick={searchPlayer}>search</button>

	    {loading && (
		<div className="circle">
		    <div className="loader"></div>
		</div>
	    )}
	    
	    {playerData && playerRank && matchList && (
		<>
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
			<br />
		    </div>
		</div>
		    {matchList.data.map(match => {
			
			/*
			  currently only showing most recent scorelines, want to add
			  feature to choose what game mode to show.
			*/
			
			const playersInBlue = match.players.blue.find(p =>
			    p.name === playerData.data.name && p.tag === playerData.data.tag
			)
			return (
			    <div key={match.metadata.matchid}>{match.metadata.map}
				{" "}
				{playersInBlue
				 ? `${match.teams.blue.rounds_won}:${match.teams.blue.rounds_lost}`
				 : `${match.teams.red.rounds_won}:${match.teams.red.rounds_lost}`
				}
			    </div>
			)
		    })}
		</>
	    )}
	</div>
    )
}

export default App
