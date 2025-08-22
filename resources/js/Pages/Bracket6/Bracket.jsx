import React, { useState, useRef, useLayoutEffect } from "react";

export default function SixTeamDoubleElimination() {
    const [teamsInput, setTeamsInput] = useState(["", "", "", "", "", ""]);
    const [matches, setMatches] = useState({
        UB1: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB2: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB3: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB4: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB5: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null }, // New Round 3
        LB1: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB2: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB3: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB4: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        GF: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
    });

    const [champion, setChampion] = useState(null);
    const boxRefs = useRef({});
    const [lines, setLines] = useState([]);

    const handleTeamChange = (index, value) => {
        const newTeams = [...teamsInput];
        newTeams[index] = value;
        setTeamsInput(newTeams);
    };

    const applyTeams = () => {
        const updated = { ...matches };
        updated.UB1.p1.name = teamsInput[0] || "TBD";
        updated.UB1.p2.name = teamsInput[1] || "TBD";
        updated.UB2.p1.name = teamsInput[2] || "TBD";
        updated.UB2.p2.name = teamsInput[3] || "TBD";
        updated.UB3.p1.name = teamsInput[4] || "TBD"; // bye
        updated.UB4.p1.name = teamsInput[5] || "TBD"; // bye
        setMatches(updated);
        setChampion(null);
    };

    const handleClick = (matchId, playerKey) => {
        const updated = { ...matches };
        updated[matchId][playerKey].score += 1;

        const { p1, p2 } = updated[matchId];
        if (p1.name !== "TBD" && p2.name !== "TBD") {
            if (p1.score !== p2.score) {
                const winnerKey = p1.score > p2.score ? "p1" : "p2";
                const loserKey = winnerKey === "p1" ? "p2" : "p1";

                const winnerName = updated[matchId][winnerKey].name;
                const loserName = updated[matchId][loserKey].name;

                updated[matchId].winner = winnerName;
                updated[matchId].loser = loserName;

                // Upper Bracket propagation
                switch (matchId) {
                    case "UB1":
                        updated.UB3.p2.name = winnerName;
                        updated.LB1.p1.name = loserName;
                        break;
                    case "UB2":
                        updated.UB4.p2.name = winnerName;
                        updated.LB1.p2.name = loserName;
                        break;
                    case "UB3":
                        updated.UB5.p1.name = winnerName;
                        updated.LB2.p1.name = loserName;
                        break;
                    case "UB4":
                        updated.UB5.p2.name = winnerName;
                        updated.LB3.p2.name = loserName;
                        break;
                    case "UB5": // Round 3 UB
                        updated.GF.p1.name = winnerName;
                        updated.LB4.p2.name = loserName;
                        break;
                }

                // Lower Bracket propagation
                switch (matchId) {
                    case "LB1":
                        updated.LB2.p2.name = winnerName;
                        break;
                    case "LB2":
                        updated.LB3.p1.name = winnerName;
                        break;
                    case "LB3":
                        updated.LB4.p1.name = winnerName;
                        break;
                    case "LB4":
                        updated.GF.p2.name = winnerName;
                        break;
                    case "GF":
                        setChampion(winnerName);
                        break;
                }
            }
        }

        setMatches(updated);
    };

    const renderMatch = (id) => {
        const m = matches[id];
        return (
            <div
                id={id}
                ref={(el) => (boxRefs.current[id] = el)}
                className="p-3 border rounded-lg bg-gray-800 text-white mb-6 w-44 relative"
            >
                <p className="font-bold mb-1">{id}</p>
                {["p1", "p2"].map((key) => (
                    <button
                        key={key}
                        onClick={() => handleClick(id, key)}
                        disabled={m[key].name === "TBD"}
                        className={`flex justify-between items-center w-full px-2 py-1 mb-1 rounded text-left ${m.winner === m[key].name ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"}`}
                    >
                        <span>{m[key].name}</span>
                        <span className="ml-2 px-2 py-1 bg-gray-900 rounded border border-white w-8 text-center">{m[key].score}</span>
                    </button>
                ))}
            </div>
        );
    };

    useLayoutEffect(() => {
        const updateLines = () => {
            const container = document.getElementById("bracket-container");
            if (!container) return;

            const connections = [
                ["UB1", "UB3"],
                ["UB2", "UB4"],
                ["UB3", "UB5"],
                ["UB4", "UB5"],
                ["UB5", "GF"],
                ["LB1", "LB2"],
                ["LB2", "LB3"],
                ["LB3", "LB4"],
                ["LB4", "GF"],
            ];

            const newLines = [];
            connections.forEach(([fromId, toId]) => {
                const from = boxRefs.current[fromId];
                const to = boxRefs.current[toId];
                if (from && to) {
                    const fromBox = from.getBoundingClientRect();
                    const toBox = to.getBoundingClientRect();
                    const containerBox = container.getBoundingClientRect();

                    const startX = fromBox.right - containerBox.left;
                    const startY = fromBox.top + fromBox.height / 2 - containerBox.top;
                    const endX = toBox.left - containerBox.left;
                    const endY = toBox.top + toBox.height / 2 - containerBox.top;

                    const midX = startX + 20;
                    const midY = endY;

                    const path = `M${startX},${startY} H${midX} V${midY} H${endX}`;
                    newLines.push(path);
                }
            });

            setLines(newLines);
        };

        requestAnimationFrame(updateLines);
    }, [matches]);

    return (
        <div className="bg-gray-900 min-h-screen p-6 text-white">
            <h1 className="text-2xl font-bold text-center mb-6">
                6-Team Double Elimination Bracket
            </h1>

            {/* Team Inputs */}
            <div className="flex gap-4 justify-center mb-6">
                {teamsInput.map((team, i) => (
                    <input
                        key={i}
                        type="text"
                        value={team}
                        onChange={(e) => handleTeamChange(i, e.target.value)}
                        placeholder={`Team ${i + 1}`}
                        className="px-2 py-1 rounded text-black"
                    />
                ))}
                <button onClick={applyTeams} className="px-4 py-1 bg-blue-600 rounded text-white font-bold">
                    Apply Teams
                </button>
            </div>

            <div id="bracket-container" className="relative">
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {lines.map((d, i) => (
                        <path key={i} d={d} stroke="white" strokeWidth="2" fill="none" />
                    ))}
                </svg>

                {/* Upper Bracket */}
                <div>
                    <h2 className="font-bold mb-2">Upper Bracket</h2>
                    <div className="flex gap-12 mb-10">
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-center">Round 1</h3>
                            {renderMatch("UB1")}
                            {renderMatch("UB2")}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-center">Round 2</h3>
                            {renderMatch("UB3")}
                            {renderMatch("UB4")}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-center">Round 3</h3>
                            {renderMatch("UB5")}
                        </div>
                    </div>
                </div>

                {/* Lower Bracket */}
                <div>
                    <h2 className="font-bold mb-2">Lower Bracket</h2>
                    <div className="flex gap-12 mb-10">
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-center">Round 1</h3>
                            {renderMatch("LB1")}
                            {renderMatch("LB2")}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-center">Round 2</h3>
                            {renderMatch("LB3")}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-center">Round 3</h3>
                            {renderMatch("LB4")}
                        </div>
                    </div>
                </div>

                {/* Grand Final */}
                <div className="flex flex-col justify-center items-center" style={{ position: "absolute", left: "45%", top: "50%", transform: "translateY(-50%)" }}>
                    <h2 className="font-bold mb-2 text-center">Grand Final</h2>
                    {renderMatch("GF")}
                </div>
            </div>

            {/* Champion */}
            {champion && (
                <div className="flex flex-col justify-center items-center" style={{ position: "absolute", left: "60%", top: "55%", transform: "translateY(-50%)" }}>
                    <h2 className="text-3xl font-bold text-yellow-400">
                        🏆 Champion: {champion}
                    </h2>
                </div>
            )}
        </div>
    );
}
