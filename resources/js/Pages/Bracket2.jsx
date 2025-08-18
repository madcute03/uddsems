import React, { useState, useRef, useEffect } from "react";

export default function DoubleEliminationBracket4Teams() {
    const boxW = 120;
    const boxH = 60;
    const hSpace = 70;
    const vSpace = 20;

    const containerRef = useRef(null);

    const [teams, setTeams] = useState(Array(4).fill(""));
    const [upper, setUpper] = useState([]);
    const [lower, setLower] = useState([]);
    const [grandFinal, setGrandFinal] = useState({
        id: "gf",
        team1: "TBD",
        team2: "TBD",
        winner: null,
        loser: null,
    });
    const [champion, setChampion] = useState(null);
    const [lines, setLines] = useState([]);

    const handleTeamChange = (i, val) => {
        const t = [...teams];
        t[i] = val;
        setTeams(t);
    };

    const initializeBracket = () => {
        if (teams.some((t) => t.trim() === "")) return alert("All 4 teams must be entered!");

        setUpper([
            [
                { id: "u1-0", team1: teams[0], team2: teams[1], winner: null, loser: null },
                { id: "u1-1", team1: teams[2], team2: teams[3], winner: null, loser: null },
            ],
            [{ id: "u2-0", team1: "TBD", team2: "TBD", winner: null, loser: null }],
        ]);

        setLower([
            [{ id: "l1-0", team1: "TBD", team2: "TBD", winner: null, loser: null }],
            [{ id: "l2-0", team1: "TBD", team2: "TBD", winner: null, loser: null }],
        ]);

        setGrandFinal({ id: "gf", team1: "TBD", team2: "TBD", winner: null, loser: null });
        setChampion(null);
        setLines([]);
    };

    const handleUpperWin = (rIdx, mIdx, winner) => {
        const u = upper.map((r) => r.map((m) => ({ ...m })));
        const match = u[rIdx][mIdx];
        match.winner = winner;
        match.loser = match.team1 === winner ? match.team2 : match.team1;

        if (rIdx === 0) {
            const next = u[1][0];
            if (next.team1 === "TBD") next.team1 = winner;
            else next.team2 = winner;
        } else {
            setGrandFinal((prev) => ({ ...prev, team1: winner }));
        }

        setUpper(u);
        sendToLower(match.loser, rIdx);
    };

    const sendToLower = (loser, rIdx) => {
        const l = lower.map((r) => r.map((m) => ({ ...m })));
        if (rIdx === 0) {
            const slot = l[0][0];
            if (slot.team1 === "TBD") slot.team1 = loser;
            else slot.team2 = loser;
        } else if (rIdx === 1) {
            l[1][0].team2 = loser;
        }
        setLower(l);
    };

    const handleLowerWin = (rIdx, mIdx, winner) => {
        const l = lower.map((r) => r.map((m) => ({ ...m })));
        const match = l[rIdx][mIdx];
        match.winner = winner;
        match.loser = match.team1 === winner ? match.team2 : match.team1;

        if (rIdx === 0) {
            const next = l[1][0];
            if (next.team1 === "TBD") next.team1 = winner;
            else next.team2 = winner;
        } else if (rIdx === 1) {
            setGrandFinal((prev) => ({ ...prev, team2: winner }));
        }

        setLower(l);
    };

    const handleGrandWin = (winner) => {
        setGrandFinal((prev) => ({
            ...prev,
            winner,
            loser: prev.team1 === winner ? prev.team2 : prev.team1,
        }));
        setChampion(winner);
    };

    const Box = ({ match, onWin, bracket, id }) => {
        const getBg = () => {
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
                        background: getBg(),
                        border: "2px solid #2b6cb0",
                        borderRadius: 15,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 5,
                    }}
                >
                    <div style={{ fontWeight: 600, fontSize: 14, textDecoration: match.loser === match.team1 ? "line-through" : "none" }}>{match.team1}</div>
                    <div style={{ fontSize: 12, margin: "2px 0", fontWeight: 500 }}>vs</div>
                    <div style={{ fontWeight: 600, fontSize: 14, textDecoration: match.loser === match.team2 ? "line-through" : "none" }}>{match.team2}</div>
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

    // Draw lines only after DOM updates
    useEffect(() => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newLines = [];

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

        const drawH = (from, to) => {
            if (!from || !to) return;
            const r = from.getBoundingClientRect();
            const rTo = to.getBoundingClientRect();
            const y = r.top + r.height / 2 - containerRect.top;
            const xStart = r.right - containerRect.left;
            const xEnd = rTo.left - containerRect.left;
            newLines.push(<div key={`h-${newLines.length}`} style={{ position: "absolute", top: y, left: xStart, width: xEnd - xStart, height: 2, background: "#000" }} />);
        };

        // Upper lines
        const upperCols = containerRef.current.querySelectorAll(".upper > div");
        if (upperCols.length > 1) {
            const first = upperCols[0].querySelectorAll(".box");
            const second = upperCols[1].querySelectorAll(".box");
            if (first.length === 2 && second.length === 1) drawY(first[0], first[1], second[0]);
        }

        // Lower lines
        const lowerCols = containerRef.current.querySelectorAll(".lower > div");
        if (lowerCols.length > 1) {
            const first = lowerCols[0].querySelectorAll(".box");
            const second = lowerCols[1].querySelectorAll(".box");
            if (first.length === 1 && second.length === 1) drawH(first[0], second[0]);
        }

        // Connect to grand final
        const grandBox = containerRef.current.querySelector("#GrandFinalBox");
        if (grandBox && upper.length > 1 && lower.length > 1) {
            const upperFinal = containerRef.current.querySelector(`#${upper[1][0].id}`);
            const lowerFinal = containerRef.current.querySelector(`#${lower[1][0].id}`);
            drawY(upperFinal, lowerFinal, grandBox);
        }

        setLines(newLines);
    }, [upper, lower, grandFinal]);

    return (
        <div style={{ padding: 20, position: "relative" }} ref={containerRef}>
            {upper.length === 0 ? (
                <div style={{ marginBottom: 20, textAlign: "center", display: "flex", flexDirection: "column", gap: 5 }}>
                    {teams.map((t, i) => <input key={i} type="text" value={t} onChange={(e) => handleTeamChange(i, e.target.value)} placeholder={`Team ${i + 1}`} style={{ width: 200, alignSelf: "center" }} />)}
                    <button style={{ marginTop: 10 }} onClick={initializeBracket}>Start Bracket</button>
                </div>
            ) : (
                <>
                    <div style={{ fontWeight: "bold", fontSize: 18, textAlign: "center", marginBottom: 5 }}>Upper Bracket</div>
                    <div className="upper" style={{ display: "flex", gap: hSpace }}>
                        {upper.map((r, i) => <div key={i} style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: vSpace }}>{r.map((m, idx) => <Box key={m.id} match={m} onWin={(w) => handleUpperWin(i, idx, w)} bracket="Upper" />)}</div>)}
                    </div>

                    <div style={{ fontWeight: "bold", fontSize: 18, textAlign: "center", margin: "20px 0 5px 0" }}>Lower Bracket</div>
                    <div className="lower" style={{ display: "flex", gap: hSpace }}>
                        {lower.map((r, i) => <div key={i} style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: vSpace }}>{r.map((m, idx) => <Box key={m.id} match={m} onWin={(w) => handleLowerWin(i, idx, w)} bracket="Lower" />)}</div>)}
                    </div>

                    <div style={{ position: "absolute", left: "70%", top: "45%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                        <h4>Grand Final</h4>
                        <Box match={grandFinal} onWin={handleGrandWin} bracket="GrandFinal" id="GrandFinalBox" />
                        {champion && <div style={{ marginTop: 10, color: "#e53e3e", fontWeight: "bold" }}>🏆 Champion: {champion} 🏆</div>}
                    </div>

                    {lines}
                </>
            )}
        </div>
    );
}
