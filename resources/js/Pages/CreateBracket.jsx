import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React, { useState, useRef, useEffect } from "react";

export default function Bracket() {
    const boxW = 120;
    const boxH = 60;
    const hSpace = 70;
    const vSpace = 10;

    const containerRef = useRef(null);

    const [teams, setTeams] = useState(Array(8).fill(""));
    const [upper, setUpper] = useState([]);
    const [lower, setLower] = useState([]);
    const [grandFinal, setGrandFinal] = useState({ id: "gf", team1: "TBD", team2: "TBD", winner: null, loser: null });
    const [champion, setChampion] = useState(null);
    const [lines, setLines] = useState([]);

    const handleTeamChange = (index, value) => {
        const updated = [...teams];
        updated[index] = value;
        setTeams(updated);
    };

    const initializeBracket = () => {
        if (teams.some((t) => t.trim() === "")) return alert("All 8 teams must be entered!");

        const u = [
            [
                { id: "u1-0", team1: teams[0], team2: teams[1], winner: null, loser: null },
                { id: "u1-1", team1: teams[2], team2: teams[3], winner: null, loser: null },
                { id: "u1-2", team1: teams[4], team2: teams[5], winner: null, loser: null },
                { id: "u1-3", team1: teams[6], team2: teams[7], winner: null, loser: null },
            ],
            [
                { id: "u2-0", team1: "TBD", team2: "TBD", winner: null, loser: null },
                { id: "u2-1", team1: "TBD", team2: "TBD", winner: null, loser: null },
            ],
            [{ id: "u3-0", team1: "TBD", team2: "TBD", winner: null, loser: null }],
        ];

        const l = [
            [
                { id: "l1-0", team1: "TBD", team2: "TBD", winner: null, loser: null },
                { id: "l1-1", team1: "TBD", team2: "TBD", winner: null, loser: null },
            ],
            [
                { id: "l2-0", team1: "TBD", team2: "TBD", winner: null, loser: null },
                { id: "l2-1", team1: "TBD", team2: "TBD", winner: null, loser: null },
            ],
            [{ id: "l3-0", team1: "TBD", team2: "TBD", winner: null, loser: null }],
            [{ id: "l4-0", team1: "TBD", team2: "TBD", winner: null, loser: null }],
        ];

        setUpper(u);
        setLower(l);
        setGrandFinal({ id: "gf", team1: "TBD", team2: "TBD", winner: null, loser: null });
        setChampion(null);
        setLines([]);
    };

    const handleUpperWin = (rIdx, mIdx, winner) => {
        const u = upper.map((r) => r.map((m) => ({ ...m })));
        const match = u[rIdx][mIdx];
        match.winner = winner;
        match.loser = match.team1 === winner ? match.team2 : match.team1;

        if (rIdx < u.length - 1) {
            const next = u[rIdx + 1][Math.floor(mIdx / 2)];
            if (next.team1 === "TBD") next.team1 = winner;
            else next.team2 = winner;
        } else {
            setGrandFinal((prev) => ({ ...prev, team1: winner }));
        }
        setUpper(u);
        sendToLower(match.loser, rIdx, mIdx);
    };

    const sendToLower = (loser, rIdx, mIdx) => {
        const l = lower.map((r) => r.map((m) => ({ ...m })));
        if (rIdx === 0) {
            const slot = l[0][Math.floor(mIdx / 2)];
            if (slot.team1 === "TBD") slot.team1 = loser;
            else slot.team2 = loser;
        } else if (rIdx === 1) {
            l[1][mIdx].team2 = loser;
        } else if (rIdx === 2) {
            l[3][0].team2 = loser;
        }
        setLower(l);
    };

    const handleLowerWin = (rIdx, mIdx, winner) => {
        const l = lower.map((r) => r.map((m) => ({ ...m })));
        const match = l[rIdx][mIdx];
        match.winner = winner;
        match.loser = match.team1 === winner ? match.team2 : match.team1;

        if (rIdx === 0) {
            const nextMatch = l[1][mIdx];
            if (nextMatch.team1 === "TBD") nextMatch.team1 = winner;
            else nextMatch.team2 = winner;
        } else if (rIdx === 1) {
            const nextMatch = l[2][0];
            if (nextMatch.team1 === "TBD") nextMatch.team1 = winner;
            else nextMatch.team2 = winner;
        } else if (rIdx === 2) {
            const nextMatch = l[3][0];
            if (nextMatch.team1 === "TBD") nextMatch.team1 = winner;
            else nextMatch.team2 = winner;
        } else if (rIdx === 3) {
            setGrandFinal((prev) => ({ ...prev, team2: winner }));
        }
        setLower(l);
    };

    const handleGrandWin = (winner) => {
        setGrandFinal((prev) => ({ ...prev, winner, loser: prev.team1 === winner ? prev.team2 : prev.team1 }));
        setChampion(winner);
    };

    const Box = ({ match, onWin, bracket, id }) => {
        const getBgColor = () => {
            if (match.winner) return "#4fd1c5";
            if (bracket === "Upper") return "#63b3ed";
            if (bracket === "Lower") return "#faf089";
            return "#fbb6ce";
        };
        return (
            <div style={{ position: "relative", marginBottom: 30, width: boxW }}>
                <div
                    id={id || match.id}
                    className="box"
                    style={{
                        width: "100%",
                        minHeight: boxH,
                        background: getBgColor(),
                        border: "2px solid #2b6cb0",
                        borderRadius: 15,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 5,
                        textAlign: "center",
                    }}
                >
                    <div style={{ fontWeight: "600", fontSize: 14, textDecoration: match.loser === match.team1 ? "line-through" : "none" }}>{match.team1}</div>
                    <div style={{ fontSize: 12, margin: "2px 0", fontWeight: 500 }}>vs</div>
                    <div style={{ fontWeight: "600", fontSize: 14, textDecoration: match.loser === match.team2 ? "line-through" : "none" }}>{match.team2}</div>
                </div>

                {!match.winner && match.team1 !== "TBD" && match.team2 !== "TBD" && (
                    <div style={{ position: "absolute", top: boxH + 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
                        <button onClick={() => onWin(match.team1)} style={{ padding: "4px 8px", borderRadius: 8, backgroundColor: "#3182ce", color: "#fff", fontWeight: "bold", fontSize: 12 }}>{match.team1} Wins</button>
                        <button onClick={() => onWin(match.team2)} style={{ padding: "4px 8px", borderRadius: 8, backgroundColor: "#3182ce", color: "#fff", fontWeight: "bold", fontSize: 12 }}>{match.team2} Wins</button>
                    </div>
                )}
            </div>
        );
    };

    // Draw lines after DOM updates
    useEffect(() => {
        if (!containerRef.current) return;
        const newLines = [];
        const containerRect = containerRef.current.getBoundingClientRect();

        const drawY = (from1, from2, to) => {
            if (!from1 || !from2 || !to) return;
            const r1 = from1.getBoundingClientRect();
            const r2 = from2.getBoundingClientRect();
            const rTo = to.getBoundingClientRect();
            const y1 = r1.top + r1.height / 2 - containerRect.top;
            const y2 = r2.top + r2.height / 2 - containerRect.top;
            const x1 = r1.right - containerRect.left;
            const x2 = r2.right - containerRect.left;
            const xTo = rTo.left - containerRect.left;
            const yTo = rTo.top + rTo.height / 2 - containerRect.top;
            const midX = xTo - 20;

            newLines.push(<div key={`h1-${newLines.length}`} style={{ position: "absolute", top: y1, left: x1, width: midX - x1, height: 2, background: "#000" }} />);
            newLines.push(<div key={`h2-${newLines.length}`} style={{ position: "absolute", top: y2, left: x2, width: midX - x2, height: 2, background: "#000" }} />);
            const yTop = Math.min(y1, y2);
            const yBottom = Math.max(y1, y2);
            newLines.push(<div key={`v-${newLines.length}`} style={{ position: "absolute", top: yTop, left: midX, width: 2, height: yBottom - yTop, background: "#000" }} />);
            newLines.push(<div key={`h3-${newLines.length}`} style={{ position: "absolute", top: yTo, left: midX, width: xTo - midX, height: 2, background: "#000" }} />);
        };

        const drawHorizontalOnly = (from, to) => {
            if (!from || !to) return;
            const rFrom = from.getBoundingClientRect();
            const rTo = to.getBoundingClientRect();
            const y = rFrom.top + rFrom.height / 2 - containerRect.top;
            const xStart = rFrom.right - containerRect.left;
            const xEnd = rTo.left - containerRect.left;
            newLines.push(<div key={`hline-${newLines.length}`} style={{ position: "absolute", top: y, left: xStart, width: xEnd - xStart, height: 2, background: "#000" }} />);
        };

        // Upper bracket lines
        const upperCols = containerRef.current.querySelectorAll(".upper > div");
        if (upperCols.length > 1) {
            for (let i = 0; i < upperCols.length - 1; i++) {
                const boxes = upperCols[i].querySelectorAll(".box");
                const nextBoxes = upperCols[i + 1].querySelectorAll(".box");
                for (let j = 0; j < nextBoxes.length; j++) {
                    drawY(boxes[j * 2], boxes[j * 2 + 1], nextBoxes[j]);
                }
            }
        }

        // Lower bracket lines
        const lowerCols = containerRef.current.querySelectorAll(".lower > div");
        if (lowerCols) {
            for (let i = 0; i < lowerCols.length - 1; i++) {
                const currentCol = lowerCols[i];
                const nextCol = lowerCols[i + 1];
                const boxes = currentCol.querySelectorAll(".box");
                const nextBoxes = nextCol.querySelectorAll(".box");

                for (let j = 0; j < nextBoxes.length; j++) {
                    const nextBox = nextBoxes[j];
                    if (!nextBox) continue;

                    if (i === 0) {
                        // Lower round 1 → round 2: horizontal only
                        drawHorizontalOnly(boxes[j], nextBox);
                    } else if (boxes.length === 1) {
                        drawHorizontalOnly(boxes[0], nextBox);
                    } else {
                        drawY(boxes[j * 2], boxes[j * 2 + 1], nextBox);
                    }
                }
            }
        }

        // Connect to Grand Final
        const grandBox = containerRef.current.querySelector("#GrandFinalBox");
        if (grandBox && upper[2] && upper[2][0] && lower[3] && lower[3][0]) {
            const upperBox = containerRef.current.querySelector(`#${upper[2][0].id}`);
            const lowerBox = containerRef.current.querySelector(`#${lower[3][0].id}`);
            drawY(upperBox, lowerBox, grandBox);
        }

        setLines(newLines);
    }, [upper, lower, grandFinal]);

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold">Create Bracket</h2>}>
            <div className="p-6 text-gray-900">
                <div style={{ padding: 20, position: "relative" }} ref={containerRef}>
                    {upper.length === 0 ? (
                        <div style={{ marginBottom: 20, textAlign: "center", display: "flex", flexDirection: "column", gap: 5 }}>
                            {teams.map((team, idx) => (
                                <input key={idx} type="text" value={team} onChange={(e) => handleTeamChange(idx, e.target.value)} placeholder={`Team ${idx + 1}`} style={{ width: 200, alignSelf: "center" }} />
                            ))}
                            <button style={{ marginTop: 10 }} onClick={initializeBracket}>Start Bracket</button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 18 }}>Upper Bracket</div>
                            <div className="upper" style={{ display: "flex", gap: hSpace }}>
                                {upper.map((round, rIdx) => (
                                    <div key={rIdx} style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: rIdx === 1 ? 120 : vSpace }}>
                                        {round.map((m, idx) => <Box key={m.id} match={m} onWin={(w) => handleUpperWin(rIdx, idx, w)} bracket="Upper" />)}
                                    </div>
                                ))}
                            </div>

                            <div style={{ margin: "20px 0 10px 0", textAlign: "center", fontWeight: "bold", fontSize: 18 }}>Lower Bracket</div>
                            <div className="lower" style={{ display: "flex", gap: hSpace }}>
                                {lower.map((round, rIdx) => (
                                    <div key={rIdx} style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: vSpace }}>
                                        {round.map((m, idx) => <Box key={m.id} match={m} onWin={(w) => handleLowerWin(rIdx, idx, w)} bracket="Lower" />)}
                                    </div>
                                ))}
                            </div>

                            <div style={{ position: "absolute", left: "70%", top: "45%", transform: "translate(-50%, -50%)" }}>
                                <h4 style={{ textAlign: "center" }}>Grand Final</h4>
                                <Box match={grandFinal} onWin={handleGrandWin} bracket="GrandFinal" id="GrandFinalBox" />
                                {champion && <div style={{ position: "absolute", top: "50%", left: "100%", transform: "translate(10px, -50%)", color: "#e53e3e", fontWeight: "bold", whiteSpace: "nowrap" }}>🏆 Champion: {champion} 🏆</div>}
                            </div>

                            {lines}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
