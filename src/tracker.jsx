/*
  this application can access accounts which are privated so before using please have consent
  of the users of being search (if privated)
  - need to fix error being produced when choosing game modes amongst privated accounts
  - if no recent game mode data display error or could not fetch message
  - ultimately fix ui to my liking
  - fix data to split into the different teams, then organize based on ACS

  - update: added player data (K A D)
 */

import { useState, Fragment } from 'react'
import './tracker.css'

function Tracker() {
    const [username, setUsername] = useState('')
    
    const [playerData, setPlayerData] = useState(null)
    const [playerRank, setPlayerRank] = useState(null)
    const [matchList, setMatchList] = useState(null)
    const [region, setRegion] = useState(null)
    const [error, setError] = useState(null)
    const [expandMatch, setExpandMatch] = useState(null)
    
    const [loading, setLoading] = useState(false)
    const [matchLoad, setMatchLoad] = useState(false)
    
    const [gameMode, setGameMode] = useState('Competitive')
    const platform = "pc"

    const fetchMatches = async (region, name, tag, mode) => {
	setMatchLoad(true)
	const matchListResponse = await fetch (
	    `https://api.henrikdev.xyz/valorant/v3/matches/${region}/${name}/${tag}?mode=${mode.toLowerCase()}&size=10`,
	    { headers: {
		Authorization: import.meta.env.VITE_HENRIK_API_KEY } }
	)
	const matchListData = await matchListResponse.json()
	setMatchList(matchListData)
	setMatchLoad(false)
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

	if(!accountData.data) {
	    setError('Player not  found')
	    setLoading(false)
	    return
	}

	const rankResponse = await fetch (
	    `https://api.henrikdev.xyz/valorant/v3/mmr/${accountData.data.region}/${platform}/${name}/${tag}`,
	    {
		headers: {
		    Authorization: apiKey
		}
	    }
	)

	const rankData = await rankResponse.json()

	await fetchMatches(accountData.data.region, name, tag, 'Competitive')
	
	setPlayerRank(rankData)
	setRegion(accountData.data.region)
	setPlayerData(accountData)
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

	    {error && <p style={{ color: 'red' }}>{error}</p>}
	    
	    {playerData && playerRank && matchList && (
		<>
		<div className="player-card">
		    <img src={playerData.data.card.small} />
		    <div>
			level: {playerData.data.account_level}
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
				setMatchLoad(true)
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

		    {matchLoad && (
			<div className="circle">
			    <div className="loader"></div>
			</div>
		    )}

		    {!matchLoad && (
			<table>
			    <thead>
				<tr>
				    <th>Map</th>
				    <th>Score</th>
				</tr>
			    </thead>
			    
			    <tbody>
				{matchList.data.filter(match => match.metadata && match.metadata.mode === gameMode).map(match => {
				    if(!match.players) return null

				    if(gameMode === 'Deathmatch') {
					const player = match.players.all?.find(p =>
					    p.name === playerData.data.name && p.tag === playerData.data.tag
					)

					const won = player?.stats?.placement === 1

					return (
					    <Fragment key={match.metadata.matchid}>
						<tr
						    onClick={() => setExpandMatch (
							expandMatch === match.metadata.matchid ? null : match.metadata.matchid
						    )}
						    style={{ cursor: 'pointer' }}
						>
						    <td>{match.metadata.map}</td>
						    <td>{won ? 'W' : 'L'}</td>
						</tr>
						{expandMatch === match.metadata.matchid && (
						    <tr>
							<td colSpan="2">data</td>
						    </tr>
						)}
					    </Fragment>
					)}
					
				    const playersInBlue = match.players.blue.find(p =>
					p.name === playerData.data.name && p.tag === playerData.data.tag
				    )
					
				    return (
					<Fragment key={match.metadata.matchid}>
					    <tr
						onClick={() => setExpandMatch (
						    expandMatch === match.metadata.matchid ? null : match.metadata.matchid
						)}
						style={{ cursor: 'pointer' }}
					    >
						<td>{match.metadata.map}</td>
						<td>
						    {" "}
						    {playersInBlue
						     ? `${match.teams.blue.rounds_won}:${match.teams.blue.rounds_lost}`
						     : `${match.teams.red.rounds_won}:${match.teams.red.rounds_lost}`
						    }
						</td>
					    </tr>
					    {expandMatch === match.metadata.matchid && (
						<tr>
						    <td colSpan="2">
							{/* added table to display match data i.e. players K A D */}
							<table>
							    <thead>
								<tr>
								    <th>Player</th>
								    <th>ACS</th>
								    <th>K</th>
								    <th>A</th>
								    <th>D</th>
								</tr>
							    </thead>
							    <tbody>
								{match.players.blue.concat(match.players.red).map(player => {
								    const acs = Math.round(player.stats.score / match.metadata.rounds_played)
								    return (
									<tr key={player.puuid}>
									    <td>{player.name}</td>
									    <td>{acs}</td>
									    <td>{player.stats.kills}</td>
									    <td>{player.stats.assists}</td>
									    <td>{player.stats.deaths}</td>
									</tr>
								    )})}
							    </tbody>
							</table>
						    </td>
						</tr>
					    )}
					</Fragment>
				    )})}
			    </tbody>
			</table>
		    )}
		</>
	    )}
	</div>
    )
}

export default Tracker
