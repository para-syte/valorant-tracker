/*
  current version fixed the blank screen when choosing unrated
  - need to fix deathmatch scorelines, currently displaying null:null
  - need to fix error being produced when choosing game modes amongst privated accounts
  - if no recent game mode data display error or could not fetch message
  - currently displaying stats and still loading with the loading bar, fix it so that
    everything loads (loading bar) first then display everything
 */

import { useState } from 'react'
import './tracker.css'

function Tracker() {
    const [username, setUsername] = useState('')
    const [playerData, setPlayerData] = useState(null)
    const [playerRank, setPlayerRank] = useState(null)
    const [loading, setLoading] = useState(false)
    const [matchList, setMatchList] = useState(null)
    const [region, setRegion] = useState(null)
    const [error, setError] = useState(null)
    const [gameMode, setGameMode] = useState('Competitive')
    const platform = "pc"

    const fetchMatches = async (region, name, tag, mode) => {
	const matchListResponse = await fetch (
	    `https://api.henrikdev.xyz/valorant/v3/matches/${region}/${name}/${tag}?mode=${mode.toLowerCase()}&size=10`,
	    { headers: {
		Authorization: import.meta.env.VITE_HENRIK_API_KEY } }
	)
	const matchListData = await matchListResponse.json()
	setMatchList(matchListData)
	setLoading(false)
    }
    
    const searchPlayer = async () => {
	setGameMode('Competitive')
	setLoading(true)
	setPlayerData(null)
	setPlayerRank(null)
	setError(null)
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

	if(!accountData.data) {
	    setError('Player not  found')
	    setLoading(false)
	    return
	}

	setRegion(accountData.data.region)

	const rankResponse = await fetch (
	    `https://api.henrikdev.xyz/valorant/v3/mmr/${accountData.data.region}/${platform}/${name}/${tag}`,
	    {
		headers: {
		    Authorization: apiKey
		}
	    }
	)

	const rankData = await rankResponse.json()
	setPlayerRank(rankData)

	await fetchMatches(accountData.data.region, name, tag, 'Competitive')
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

	    {error && <p style={{ color: 'red' }}>{error}</p>}
	    
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
		    <label htmlFor="game-mode-select"></label>
		    <select name="gamemodes"
			    id="game-mode-select"
			    onChange={(e) => {
				setGameMode(e.target.value)
				const [name, tag] = username.split('#')
				fetchMatches(region, name, tag, e.target.value)
			    }}
			    value={gameMode}
		    >
			<option value="">--Game mode--</option>
			<option value="Competitive">Competitive</option>
			<option value="Swiftplay">Switfplay</option>
			<option value="Deathmatch">Deathmatch</option>
			<option value="Unrated">Unrated</option>
		    </select>
		    {matchList.data.filter(match => match.metadata && match.metadata.mode === gameMode).map(match => {
			if(!match.players) return null

			if(gameMode === 'Deathmatch') {
			    const player = match.players.all?.find(p =>
				p.name === playerData.data.name && p.tag === playerData.data.tag
			    )

			    const won = player?.stats?.placement === 1

			    return (
				<div key={match.metadata.matchid}>
				    {match.metadata.map}: {won ? 'W' : 'L'}
				</div>
			    )
			}
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

export default Tracker
