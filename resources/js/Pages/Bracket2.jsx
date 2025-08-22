import React, { useState } from "react";

export default function FourTeamDoubleElim() {
    const [teams, setTeams] = useState(["", "", "", ""]);
    const [submitted, setSubmitted] = useState(false);
    const [champion, setChampion] = useState(null);

    const [matches, setMatches] = useState({
        // Winners Bracket
        WSF1: { team1: null, team2: null, winner: null, loser: null },
        WSF2: { team1: null, team2: null, winner: null, loser: null },
        WF: { team1: null, team2: null, winner: null, loser: null },

        // Losers Bracket
        LBR1: { team1: null, team2: null, winner: null, loser: null },
        LBF: { team1: null, team2: null, winner: null, loser: null },

        // Grand Finals
        GF: { team1: null, team2: null, winner: null, loser: null },
        GFReset: { team1: null, team2: null, winner: null, loser: null },
    });

    const handleSubmitTeams = (e) => {
        e.preventDefault();
        if (teams.some((t) => !t.trim())) {
            alert("Please fill in all team names!");
            return;
        }

        const updated = { ...matches };
        updated.WSF1.team1 = teams[0];
        updated.WSF1.team2 = teams[1];
        updated.WSF2.team1 = teams[2];
        updated.WSF2.team2 = teams[3];
        setMatches(updated);

        setSubmitted(true);
    };

    const handleWinner = (matchId, winner) => {
        const match = matches[matchId];
        const loser = match.team1 === winner ? match.team2 : match.team1;

        const updated = { ...matches, [matchId]: { ...match, winner, loser } };

        // Winners Semis
        if (matchId === "WSF1") {
            updated.WF.team1 = winner;
            updated.LBR1.team1 = loser;
        }
        if (matchId === "WSF2") {
            updated.WF.team2 = winner;
            updated.LBR1.team2 = loser;
        }

        // Winners Final
        if (matchId === "WF") {
            updated.GF.team1 = winner; // to GF
            updated.LBF.team2 = loser; // loser to LB Final
        }

        // Losers Round 1
        if (matchId === "LBR1") {
            updated.LBF.team1 = winner;
        }

        // Losers Final
        if (matchId === "LBF") {
            updated.GF.team2 = winner;
        }

        // Grand Final
        if (matchId === "GF") {
            if (loser === updated.LBF.winner) {
                updated.GFReset.team1 = winner;
                updated.GFReset.team2 = loser;
            } else {
                setChampion(winner);
            }
        }

        // GF Reset
        if (matchId === "GFReset") {
            setChampion(winner);
        }

        setMatches(updated);
    };

    const renderMatch = (id, label) => {
        const match = matches[id];
        if (!match?.team1 || !match?.team2) return null;

        return (
            <div className="p-4 border rounded-xl shadow-md bg-white text-center">
                <h3 className="font-bold text-gray-700">{label}</h3>
                <div className="space-y-2 mt-3">
                    {[match.team1, match.team2].map((team, i) => (
                        <button
                            key={i}
                            className="block w-full px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
                            onClick={() => handleWinner(id, team)}
                        >
                            {team}
                        </button>
                    ))}
                </div>
                {match.winner && (
                    <p className="mt-3 text-green-600 font-semibold">
                        Winner: {match.winner}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="p-8 space-y-10 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-center text-gray-800">
                4-Team Double Elimination Bracket
            </h1>

            {!submitted ? (
                <form
                    onSubmit={handleSubmitTeams}
                    className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl space-y-4"
                >
                    <h2 className="text-xl font-semibold text-gray-700 text-center">
                        Enter Team Names
                    </h2>
                    {teams.map((team, idx) => (
                        <input
                            key={idx}
                            type="text"
                            placeholder={`Team ${idx + 1}`}
                            value={team}
                            onChange={(e) => {
                                const newTeams = [...teams];
                                newTeams[idx] = e.target.value;
                                setTeams(newTeams);
                            }}
                            className="w-full p-2 border rounded-lg"
                        />
                    ))}
                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
                    >
                        Start Tournament
                    </button>
                </form>
            ) : (
                <>
                    {/* Winners Bracket */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                            Winners Bracket
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            {renderMatch("WSF1", "Winners Semifinal 1")}
                            {renderMatch("WSF2", "Winners Semifinal 2")}
                        </div>
                        <div className="mt-6 max-w-md mx-auto">
                            {renderMatch("WF", "Winners Final")}
                        </div>
                    </div>

                    {/* Losers Bracket */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                            Losers Bracket
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            {renderMatch("LBR1", "Losers Round 1")}
                            {renderMatch("LBF", "Losers Final")}
                        </div>
                    </div>

                    {/* Grand Finals */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                            Grand Final
                        </h2>
                        <div className="max-w-md mx-auto space-y-6">
                            {renderMatch("GF", "Grand Final")}
                            {matches.GFReset.team1 &&
                                renderMatch("GFReset", "Grand Final Reset")}
                        </div>
                    </div>

                    {/* Champion */}
                    {champion && (
                        <div className="p-6 bg-green-300 text-center font-bold rounded-xl shadow-md text-xl">
                            🏆 Champion: {champion}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
import React, { useState } from "react";

export default function FourTeamDoubleElim() {
    const [teams, setTeams] = useState(["Team A", "Team B", "Team C", "Team D"]);
    const [submitted, setSubmitted] = useState(false);
    const [matches, setMatches] = useState({});
    const [champion, setChampion] = useState(null);

    const handleChange = (i, value) => {
        const copy = [...teams];
        copy[i] = value;
        setTeams(copy);
    };

    const startBracket = () => {
        setMatches({
            // Winners Bracket
            WSF1: { team1: teams[0], team2: teams[1], winner: null, loser: null },
            WSF2: { team1: teams[2], team2: teams[3], winner: null, loser: null },
            WF: { team1: null, team2: null, winner: null, loser: null },

            // Losers Bracket
            LBR1: { team1: null, team2: null, winner: null, loser: null },
            LBF: { team1: null, team2: null, winner: null, loser: null },

            // Grand Finals
            GF: { team1: null, team2: null, winner: null, loser: null },
            GFReset: { team1: null, team2: null, winner: null, loser: null },
        });
        setSubmitted(true);
        setChampion(null);
    };

    const handleWinner = (matchId, winner) => {
        const match = matches[matchId];
        const loser = match.team1 === winner ? match.team2 : match.team1;

        const updated = { ...matches, [matchId]: { ...match, winner, loser } };

        // Winners Semis
        if (matchId === "WSF1") {
            updated.WF.team1 = winner;
            updated.LBR1.team1 = loser;
        }
        if (matchId === "WSF2") {
            updated.WF.team2 = winner;
            updated.LBR1.team2 = loser;
        }

        // Winners Final
        if (matchId === "WF") {
            updated.GF.team1 = winner; // to GF
            updated.LBF.team2 = loser; // loser to LB Final
        }

        // Losers Round 1
        if (matchId === "LBR1") {
            updated.LBF.team1 = winner;
        }

        // Losers Final
        if (matchId === "LBF") {
            updated.GF.team2 = winner;
        }

        // Grand Final
        if (matchId === "GF") {
            if (loser === updated.LBF.winner) {
                updated.GFReset.team1 = winner;
                updated.GFReset.team2 = loser;
            } else {
                setChampion(winner);
            }
        }

        // GF Reset
        if (matchId === "GFReset") {
            setChampion(winner);
        }

        setMatches(updated);
    };

    const renderMatch = (id, label) => {
        const match = matches[id];
        if (!match?.team1 || !match?.team2) return null;

        return (
            <div className="p-4 border rounded-xl shadow-md bg-white text-center">
                <h3 className="font-bold text-gray-700">{label}</h3>
                <div className="space-y-2 mt-3">
                    {[match.team1, match.team2].map((team, i) => (
                        <button
                            key={i}
                            className="block w-full px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
                            onClick={() => handleWinner(id, team)}
                        >
                            {team}
                        </button>
                    ))}
                </div>
                {match.winner && (
                    <p className="mt-3 text-green-600 font-semibold">
                        Winner: {match.winner}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="p-8 space-y-10 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-center text-gray-800">
                4-Team Double Elimination Bracket
            </h1>

            {!submitted ? (
                <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Enter Team Names
                    </h2>
                    {teams.map((t, i) => (
                        <input
                            key={i}
                            type="text"
                            value={t}
                            onChange={(e) => handleChange(i, e.target.value)}
                            className="w-full mb-3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ))}
                    <button
                        onClick={startBracket}
                        className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Start Bracket
                    </button>
                </div>
            ) : (
                <>
                    {/* Winners Bracket */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Winners Bracket</h2>
                        <div className="grid grid-cols-2 gap-6">
                            {renderMatch("WSF1", "Winners Semifinal 1")}
                            {renderMatch("WSF2", "Winners Semifinal 2")}
                        </div>
                        <div className="mt-6 max-w-md mx-auto">{renderMatch("WF", "Winners Final")}</div>
                    </div>

                    {/* Losers Bracket */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Losers Bracket</h2>
                        <div className="grid grid-cols-2 gap-6">
                            {renderMatch("LBR1", "Losers Round 1")}
                            {renderMatch("LBF", "Losers Final")}
                        </div>
                    </div>

                    {/* Grand Finals */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Grand Final</h2>
                        <div className="max-w-md mx-auto space-y-6">
                            {renderMatch("GF", "Grand Final")}
                            {matches.GFReset.team1 && renderMatch("GFReset", "Grand Final Reset")}
                        </div>
                    </div>

                    {/* Champion */}
                    {champion && (
                        <div className="p-6 bg-green-300 text-center font-bold rounded-xl shadow-md text-xl">
                            🏆 Champion: {champion}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
