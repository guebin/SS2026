import { useState, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from "recharts";

function initCar() { return Math.floor(Math.random() * 3); }

export default function MontyHall() {
  const [xrayMode, setXrayMode] = useState(false);
  const [carDoor, setCarDoor] = useState(initCar);
  const carRef = useRef(carDoor);

  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(null);
  const [finalDoor, setFinalDoor] = useState(null);
  const [phase, setPhase] = useState("select");
  const [strategy, setStrategy] = useState(null);

  const [sw, setSw] = useState({ wins: 0, total: 0 });
  const [st, setSt] = useState({ wins: 0, total: 0 });
  const [chartData, setChartData] = useState([]);

  const newGame = () => {
    const c = initCar();
    carRef.current = c;
    setCarDoor(c);
    setSelected(null); setRevealed(null); setFinalDoor(null);
    setStrategy(null); setPhase("select");
  };

  const pickDoor = (door) => {
    if (phase !== "select") return;
    setSelected(door);
    const opts = [0,1,2].filter(d => d !== door && d !== carRef.current);
    setRevealed(opts[Math.floor(Math.random() * opts.length)]);
    setPhase("decide");
  };

  const decide = (doSwitch) => {
    if (phase !== "decide") return;
    const fd = doSwitch ? [0,1,2].find(d => d !== selected && d !== revealed) : selected;
    const won = fd === carRef.current;
    setFinalDoor(fd); setStrategy(doSwitch ? "switch" : "stay"); setPhase("result");
    const nSw = doSwitch ? { wins: sw.wins+(won?1:0), total: sw.total+1 } : sw;
    const nSt = !doSwitch ? { wins: st.wins+(won?1:0), total: st.total+1 } : st;
    setSw(nSw); setSt(nSt);
    setChartData(prev => [...prev, {
      n: nSw.total + nSt.total,
      "바꿀 경우": nSw.total > 0 ? +(nSw.wins/nSw.total*100).toFixed(1) : undefined,
      "유지할 경우": nSt.total > 0 ? +(nSt.wins/nSt.total*100).toFixed(1) : undefined,
    }]);
  };

  const autoSim = (count) => {
    let nSw = { ...sw }, nSt = { ...st };
    const step = Math.max(1, Math.floor(count / 80));
    const newPts = [];
    for (let i = 0; i < count; i++) {
      const car = initCar(), sel = Math.floor(Math.random()*3);
      const opts = [0,1,2].filter(d => d !== sel && d !== car);
      const rev = opts[Math.floor(Math.random()*opts.length)];
      const doSwitch = Math.random() < 0.5;
      const fd = doSwitch ? [0,1,2].find(d => d !== sel && d !== rev) : sel;
      const won = fd === car;
      if (doSwitch) nSw = { wins: nSw.wins+(won?1:0), total: nSw.total+1 };
      else nSt = { wins: nSt.wins+(won?1:0), total: nSt.total+1 };
      if ((i+1) % step === 0 || i === count-1)
        newPts.push({ n: nSw.total+nSt.total,
          "바꿀 경우": nSw.total>0 ? +(nSw.wins/nSw.total*100).toFixed(1):undefined,
          "유지할 경우": nSt.total>0 ? +(nSt.wins/nSt.total*100).toFixed(1):undefined });
    }
    setSw(nSw); setSt(nSt);
    setChartData(prev => [...prev, ...newPts]);
  };

  // What emoji is behind each door
  const behindEmoji = (door) => door === carRef.current ? "🚗" : "🐐";

  // Determine visual state per door
  const getDoorState = (door) => {
    const isCar = door === carRef.current;
    const isRevealed = door === revealed;
    const isSelected = door === selected;
    const isFinal = door === finalDoor;

    // Always open in result phase, or if revealed by host
    const fullyOpen = phase === "result" || isRevealed;

    return { isCar, isRevealed, isSelected, isFinal, fullyOpen };
  };

  const won = phase === "result" && finalDoor === carRef.current;
  const swRate = sw.total > 0 ? (sw.wins/sw.total*100).toFixed(1) : "--";
  const stRate = st.total > 0 ? (st.wins/st.total*100).toFixed(1) : "--";
  const totalGames = sw.total + st.total;

  return (
    <div style={{ background:"#f4f5f7", color:"#222222", fontFamily:"system-ui,sans-serif", padding:"24px 16px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <h1 style={{ fontSize:26, fontWeight:800, color:"#dc3545", margin:0 }}>🎯 몬티 홀 문제</h1>
          <p style={{ color:"#555555", fontSize:12, marginTop:4 }}>Monty Hall Problem Simulator</p>
        </div>

        {/* Mode Toggle */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
          <div style={{ background:"#ffffff", borderRadius:14, padding:4, display:"flex", gap:4, border:"1px solid #e3e7ec" }}>
            <button
              onClick={() => setXrayMode(false)}
              style={{
                background: !xrayMode ? "#dc3545" : "transparent",
                border:"none", color: !xrayMode ? "#fff" : "#6b7480",
                borderRadius:10, padding:"8px 20px", fontSize:13, fontWeight:600,
                cursor:"pointer", transition:"all .2s"
              }}>
              🚪 일반 모드
            </button>
            <button
              onClick={() => setXrayMode(true)}
              style={{
                background: xrayMode ? "#222222" : "transparent",
                border:"none", color: xrayMode ? "#fff" : "#6b7480",
                borderRadius:10, padding:"8px 20px", fontSize:13, fontWeight:600,
                cursor:"pointer", transition:"all .2s"
              }}>
              🔍 X-Ray 모드
            </button>
          </div>
        </div>

        {/* Mode description */}
        <div style={{ textAlign:"center", marginBottom:20, fontSize:12,
          color: xrayMode ? "#222222" : "#6b7480" }}>
          {xrayMode
            ? "👁 문 뒤의 내용이 반투명하게 보입니다 — 확률의 흐름을 직관적으로 파악하세요"
            : "🙈 문 뒤가 가려져 있습니다 — 실제 게임과 동일한 상황입니다"}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

          {/* === LEFT: Game === */}
          <div style={{ background:"#ffffff", borderRadius:20, padding:24, display:"flex", flexDirection:"column", gap:18 }}>

            {/* Status */}
            <div style={{ background:"#f4f5f7", borderRadius:12, padding:"14px 16px", fontSize:13, minHeight:52, display:"flex", alignItems:"center" }}>
              {phase === "select" && <span style={{color:"#6b7480"}}>🚪 <strong style={{color:"#222222"}}>문을 하나 클릭</strong>해서 선택하세요.</span>}
              {phase === "decide" && <span style={{color:"#6b7480"}}>👀 진행자가 <strong style={{color:"#dc3545"}}>문 {(revealed??0)+1}번</strong>(🐐)을 열었습니다. 선택을 <strong style={{color:"#222222"}}>바꾸시겠습니까?</strong></span>}
              {phase === "result" && (
                <span style={{color: won?"#dc3545":"#6b7480"}}>
                  {won ? "🎉 당첨! 자동차!" : "😢 꽝! 염소..."}
                  <span style={{color:"#6b7480", fontSize:11, display:"block", marginTop:3}}>
                    전략: {strategy==="switch" ? "🔄 선택 변경" : "🙅 선택 유지"}
                  </span>
                </span>
              )}
            </div>

            {/* Doors */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              {[0,1,2].map(door => {
                const { isCar, isRevealed, isSelected, isFinal, fullyOpen } = getDoorState(door);

                // Border/bg color
                let borderColor = "#e3e7ec", bgColor = "#f4f5f7";
                if (phase === "select") { borderColor = "#555555"; bgColor = "#ffffff"; }
                if (isSelected && phase === "decide") { borderColor = "#dc3545"; bgColor = "rgba(220,53,69,.07)"; }
                if (isRevealed) { borderColor = "#e3e7ec"; bgColor = "#f4f5f7"; }
                if (phase === "result") {
                  if (isFinal && isCar) { borderColor = "#dc3545"; bgColor = "rgba(220,53,69,.10)"; }
                  else if (isFinal && !isCar) { borderColor = "#6b7480"; bgColor = "rgba(34,34,34,.05)"; }
                  else if (!isFinal && isCar) { borderColor = "#dc3545"; bgColor = "rgba(220,53,69,.12)"; }
                  else { borderColor = "#ffffff"; bgColor = "#f4f5f7"; }
                }

                const clickable = phase === "select";

                return (
                  <div key={door}
                    onClick={() => clickable && pickDoor(door)}
                    style={{
                      position:"relative", borderRadius:16, border:`2px solid ${borderColor}`,
                      background: bgColor, height:130,
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                      cursor: clickable ? "pointer" : "default",
                      transition:"all .25s",
                      overflow:"hidden",
                    }}>

                    {/* X-Ray ghost layer — always visible in xray mode, semi-transparent */}
                    {xrayMode && !fullyOpen && (
                      <div style={{
                        position:"absolute", inset:0,
                        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                        opacity: 0.18,
                        pointerEvents:"none",
                        background: isCar
                          ? "radial-gradient(circle, rgba(220,53,69,.13) 0%, transparent 70%)"
                          : "radial-gradient(circle, rgba(34,34,34,.10) 0%, transparent 70%)"
                      }}>
                        <div style={{ fontSize:40 }}>{behindEmoji(door)}</div>
                      </div>
                    )}

                    {/* Door front (shown when closed) */}
                    {!fullyOpen && (
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", position:"relative", zIndex:1 }}>
                        <div style={{ fontSize: 38 }}>🚪</div>
                        <div style={{ fontSize:11, color:"#555555", marginTop:2 }}>문 {door+1}</div>
                      </div>
                    )}

                    {/* Open state */}
                    {fullyOpen && (
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                        <div style={{ fontSize:38 }}>{behindEmoji(door)}</div>
                        <div style={{ fontSize:11, color: isCar?"#dc3545":"#6b7480", marginTop:2 }}>
                          {isCar ? "자동차!" : "염소"}
                        </div>
                      </div>
                    )}

                    {/* Badges */}
                    {isSelected && phase === "decide" && (
                      <div style={{ position:"absolute", top:-1, right:-1, background:"#dc3545", color:"#fff", fontSize:9, padding:"2px 7px", borderRadius:"0 14px 0 10px", fontWeight:700 }}>선택</div>
                    )}
                    {phase === "result" && isFinal && (
                      <div style={{ position:"absolute", top:-1, right:-1, background: isCar?"#dc3545":"#6b7480", color:"#fff", fontSize:9, padding:"2px 7px", borderRadius:"0 14px 0 10px", fontWeight:700 }}>최종</div>
                    )}
                    {phase === "result" && !isFinal && isCar && (
                      <div style={{ position:"absolute", top:-1, left:-1, background:"#dc3545", color:"#fff", fontSize:9, padding:"2px 7px", borderRadius:"14px 0 10px 0", fontWeight:700 }}>정답</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Decide buttons */}
            {phase === "decide" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <button onClick={() => decide(false)}
                  style={{ background:"#e3e7ec", border:"none", color:"#222222", borderRadius:12, padding:12, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                  🙅 유지하기
                </button>
                <button onClick={() => decide(true)}
                  style={{ background:"#dc3545", border:"none", color:"#fff", borderRadius:12, padding:12, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                  🔄 바꾸기
                </button>
              </div>
            )}

            {phase === "result" && (
              <button onClick={newGame}
                style={{ background:"#dc3545", border:"none", color:"#fff", borderRadius:12, padding:12, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                다음 게임 ▶
              </button>
            )}

            {/* Auto sim */}
            <div style={{ borderTop:"1px solid #e3e7ec", paddingTop:14 }}>
              <div style={{ color:"#6b7480", fontSize:11, marginBottom:8 }}>⚡ 자동 시뮬레이션 (각 전략 50:50)</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {[10,100,1000,10000].map(n => (
                  <button key={n} onClick={() => autoSim(n)}
                    style={{ background:"#f4f5f7", border:"1px solid #e3e7ec", color:"#6b7480", borderRadius:10, padding:"7px 0", fontSize:12, cursor:"pointer", fontWeight:500 }}>
                    +{n >= 1000 ? (n/1000)+"K" : n}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={{ background:"rgba(220,53,69,.07)", border:"1px solid rgba(220,53,69,.22)", borderRadius:14, padding:"12px 14px", textAlign:"center" }}>
                <div style={{ color:"#6b7480", fontSize:11, marginBottom:4 }}>바꿀 경우 승률</div>
                <div style={{ color:"#dc3545", fontSize:26, fontWeight:800 }}>{swRate}%</div>
                <div style={{ color:"#555555", fontSize:11 }}>{sw.wins}/{sw.total}회</div>
              </div>
              <div style={{ background:"#f4f5f7", border:"1px solid #e3e7ec", borderRadius:14, padding:"12px 14px", textAlign:"center" }}>
                <div style={{ color:"#6b7480", fontSize:11, marginBottom:4 }}>유지할 경우 승률</div>
                <div style={{ color:"#222222", fontSize:26, fontWeight:800 }}>{stRate}%</div>
                <div style={{ color:"#555555", fontSize:11 }}>{st.wins}/{st.total}회</div>
              </div>
            </div>
          </div>

          {/* === RIGHT: Chart === */}
          <div style={{ background:"#ffffff", borderRadius:20, padding:24, display:"flex", flexDirection:"column", gap:16 }}>
            <h2 style={{ margin:0, fontSize:15, fontWeight:700, color:"#222222" }}>📈 승률 수렴 그래프</h2>

            {chartData.length < 2 ? (
              <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:"#555555", fontSize:13, textAlign:"center" }}>
                게임을 진행하거나<br/>자동 시뮬레이션을 실행하면<br/>그래프가 표시됩니다
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={chartData} margin={{ top:8, right:16, left:0, bottom:36 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e7ec" />
                  <XAxis dataKey="n" stroke="#555555" tick={{ fontSize:10 }} height={44}
                    label={{ value:"게임 수", position:"insideBottom", offset:0, fill:"#6b7480", fontSize:11 }} />
                  <YAxis domain={[0,100]} stroke="#555555" tick={{ fontSize:10 }} tickFormatter={v=>`${v}%`} />
                  <Tooltip formatter={(v,n)=>[`${v}%`,n]} labelFormatter={l=>`게임 ${l}회`}
                    contentStyle={{ background:"#f4f5f7", border:"1px solid #e3e7ec", borderRadius:10, fontSize:12 }} />
                  <Legend wrapperStyle={{ fontSize:12, paddingTop:18 }} verticalAlign="bottom" />
                  <ReferenceLine y={66.7} stroke="#dc3545" strokeDasharray="5 3" strokeWidth={1.5}
                    label={{ value:"66.7%", position:"insideTopRight", fill:"#dc3545", fontSize:10 }} />
                  <ReferenceLine y={33.3} stroke="#222222" strokeDasharray="5 3" strokeWidth={1.5}
                    label={{ value:"33.3%", position:"insideTopRight", fill:"#222222", fontSize:10 }} />
                  <Line type="monotone" dataKey="바꿀 경우" stroke="#dc3545" strokeWidth={2.5} dot={false} connectNulls />
                  <Line type="monotone" dataKey="유지할 경우" stroke="#222222" strokeWidth={2.5} dot={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            )}

            <div style={{ background:"#f4f5f7", borderRadius:12, padding:"14px 16px", fontSize:12, color:"#6b7480", lineHeight:1.9 }}>
              <div>🔴 <strong style={{color:"#dc3545"}}>바꿀 경우</strong> 이론 승률: <strong style={{color:"#dc3545"}}>2/3 ≈ 66.7%</strong></div>
              <div>⚫ <strong style={{color:"#222222"}}>유지할 경우</strong> 이론 승률: <strong style={{color:"#444444"}}>1/3 ≈ 33.3%</strong></div>
            </div>

            {totalGames > 0 && (
              <div style={{ textAlign:"center", color:"#555555", fontSize:12 }}>
                누적 {totalGames.toLocaleString()}회 시뮬레이션
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
