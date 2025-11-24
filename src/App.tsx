import React, { useState } from 'react';
import { 
  Activity, RefreshCw, Zap, Search, Copy, Check, 
  Calendar, Globe, Wallet, TrendingUp, BarChart2, 
  ChevronRight, DollarSign, Shield, MousePointerClick, AlertTriangle
} from 'lucide-react';

// === CONFIGURACIÓN ===
const PYTHON_BACKEND_URL = "https://cerebro-apuestas.onrender.com"; 
// PEGA TUS LLAVES AQUÍ
const ODDS_API_KEYS = [
  "734f30d0866696cf90d5029ac106cfba",
  "10fb6d9d7b3240906d0acea646068535",
  "a9ff72549c4910f1fa9659e175a35cc0",
  "25e9d8872877f5110254ff6ef42056c6",
  "6205cdb2cfd889e6fc44518f950f7dad",
  "d39a6f31abf6412d46b2c7185a5dfffe",
  "fbd5dece2a99c992cfd783aedfcd2ef3",
  "687ba857bcae9c7f33545dcbe59aeb2b",
  "f9ff83040b9d2afc1862094694f53da2",
  "f730fa9137a7cd927554df334af916dc",
  "9091ec0ea25e0cdfc161b91603e31a9a",
  "c0f7d526dd778654dfee7c0686124a77",
  "61a015bc1506aac11ec62901a6189dc6",
  "d585a73190a117c1041ccc78b92b23d9",
  "4056628d07b0b900175cb332c191cda0",
  "ac4d3eb2d6df42030568eadeee906770",
  "3cebba62ff5330d1a409160e6870bfd6",
  "358644d442444f95bd0b0278e4d3ea22",
  "45dff0519cde0396df06fc4bc1f9bce1",
  "a4f585765036f57be0966b39125f87a0",
  "349f8eff303fa0963424c54ba181535b",
  "f54405559ba5aaa27a9687992a84ae2f",
  "24772de60f0ebe37a554b179e0dd819f",
  "b7bdefecc83235f7923868a0f2e3e114",
  "3a9d3110045fd7373875bdbc7459c82c",
  "d2aa9011f39bfcb309b3ee1da6328573",
  "107ad40390a24eb61ee02ff976f3d3ac",
  "8f6358efeec75d6099147764963ae0f8",
  "672962843293d4985d0bed1814d3b716",
  "4b1867baf919f992554c77f493d258c5",
  "b3fd66af803adc62f00122d51da7a0e6",
  "53ded39e2281f16a243627673ad2ac8c",
  "bf785b4e9fba3b9cd1adb99b9905880b",
  "60e3b2a9a7324923d78bfc6dd6f3e5d3",
  "cc16776a60e3eee3e1053577216b7a29",
  "a0cc233165bc0ed04ee42feeaf2c9d30",
  "d2afc749fc6b64adb4d8361b0fe58b4b",
  "b351eb6fb3f5e95b019c18117e93db1b",
  "74dbc42e50dd64687dc1fad8af59c490",
  "7b4a5639cbe63ddf37b64d7e327d3e71",
  "20cec1e2b8c3fd9bb86d9e4fad7e6081",
  "1352436d9a0e223478ec83aec230b4aa",
  "29257226d1c9b6a15c141d989193ef72",
  "24677adc5f5ff8401c6d98ea033e0f0b",
  "54e84a82251def9696ba767d6e2ca76c",
  "ff3e9e3a12c2728c6c4ddea087bc51a9",
  "f3ff0fb5d7a7a683f88b8adec904e7b8",
  "1e0ab1ff51d111c88aebe4723020946a",
  "6f74a75a76f42fabaa815c4461c59980",
  "86de2f86b0b628024ef6d5546b479c0f" 
];
// ======================

const LEAGUES = [
  { code: 'soccer_uefa_champs_league', name: 'Champions League', flag: '🏆' },
  { code: 'soccer_epl', name: 'Premier League', flag: '🇬🇧' },
  { code: 'soccer_spain_la_liga', name: 'La Liga', flag: '🇪🇸' },
  { code: 'soccer_germany_bundesliga', name: 'Bundesliga', flag: '🇩🇪' },
  { code: 'soccer_italy_serie_a', name: 'Serie A', flag: '🇮🇹' },
  { code: 'soccer_france_ligue_one', name: 'Ligue 1', flag: '🇫🇷' },
  { code: 'soccer_netherlands_eredivisie', name: 'Eredivisie', flag: '🇳🇱' },
  { code: 'soccer_portugal_primeira_liga', name: 'Primeira Liga', flag: '🇵🇹' }
];

const getRandomKey = () => {
    if (!ODDS_API_KEYS || ODDS_API_KEYS.length === 0) return null;
    return ODDS_API_KEYS[Math.floor(Math.random() * ODDS_API_KEYS.length)];
};

function App() {
  const [matches, setMatches] = useState<any[]>([]);
  const [status, setStatus] = useState("Sistema Listo");
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<{[key:string]: string}>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); 
  const [selectedLeague, setSelectedLeague] = useState<string>('soccer_epl');
  const [bankroll, setBankroll] = useState<string>("50000");

  // --- 1. MOTOR DE ESCANEO ROBUSTO (CON REINTENTOS) ---
  const escanear = async () => {
    setMatches([]); setGeneratedPrompts({});
    
    try {
      const apiKey = getRandomKey();
      if (!apiKey || apiKey.includes("PEGA_TU")) throw new Error("⚠️ Faltan las API Keys en el código");

      let data = [];
      let usedMarket = "Completo";

      // INTENTO 1: TODO (1X2 + Goles + BTTS)
      setStatus("Modo Full: Buscando 1X2, Goles y BTTS...");
      let url = `https://api.the-odds-api.com/v4/sports/${selectedLeague}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h,totals,btts&oddsFormat=decimal`;
      let res = await fetch(url);
      let rawData = await res.json();

      // Si falla el intento 1, probamos el 2
      if (!res.ok || rawData.message || !Array.isArray(rawData)) {
        console.warn("Fallo intento 1:", rawData.message);
        
        // INTENTO 2: MODO SEGURO (Solo 1X2 y Goles) - A veces BTTS falla en fechas lejanas
        setStatus("⚠️ BTTS no disponible. Reintentando sin BTTS...");
        url = `https://api.the-odds-api.com/v4/sports/${selectedLeague}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h,totals&oddsFormat=decimal`;
        res = await fetch(url);
        rawData = await res.json();
        usedMarket = "Parcial (Sin BTTS)";
      }

      // Si sigue fallando, mostramos el error real de la API
      if (rawData.message) throw new Error(`La API dice: ${rawData.message}`);
      if (!Array.isArray(rawData)) throw new Error("Error desconocido de conexión.");

      // FILTRADO POR FECHA
      const valid = rawData.filter((m:any) => m.commence_time.startsWith(selectedDate)).slice(0, 10);
      
      if (valid.length === 0) {
        setStatus(`✅ Conexión OK, pero no hay partidos el ${selectedDate} en esta liga.`);
        return;
      }

      // ENVIAR A PYTHON (CACHE)
      setStatus(`Analizando ${valid.length} partidos...`);
      await fetch(`${PYTHON_BACKEND_URL}/sincronizar-cache`, {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ partidos: valid })
      });
      
      setMatches(valid);
      setStatus(`✅ Éxito (${usedMarket}): ${valid.length} partidos.`);

    } catch (e: any) {
      setStatus(`❌ Error Crítico: ${e.message}`);
    }
  };

  // --- 2. GENERADOR DE PROMPTS ---
  const generarPrompt = async (match: any) => {
    setAnalyzingId(match.id);
    try {
      // A. EXTRAER CUOTAS (Soporta que falten datos)
      let oddHome = 0, oddDraw = 0, oddAway = 0;
      let over25 = "No disponible", under25 = "No disponible";
      let bttsYes = "No disponible", bttsNo = "No disponible";

      for (const bookie of match.bookmakers) {
        // 1x2
        const h2h = bookie.markets.find((m:any) => m.key === 'h2h');
        if (h2h && oddHome === 0) {
            oddHome = h2h.outcomes.find((o:any) => o.name === match.home_team)?.price;
            oddAway = h2h.outcomes.find((o:any) => o.name === match.away_team)?.price;
            oddDraw = h2h.outcomes.find((o:any) => o.name === 'Draw')?.price;
        }
        // Totals
        const totals = bookie.markets.find((m:any) => m.key === 'totals');
        if (totals && over25 === "No disponible") {
            over25 = totals.outcomes.find((o:any) => o.name === 'Over' && o.point === 2.5)?.price || "No disponible";
            under25 = totals.outcomes.find((o:any) => o.name === 'Under' && o.point === 2.5)?.price || "No disponible";
        }
        // BTTS
        const btts = bookie.markets.find((m:any) => m.key === 'btts');
        if (btts && bttsYes === "No disponible") {
            bttsYes = btts.outcomes.find((o:any) => o.name === 'Yes')?.price || "No disponible";
            bttsNo = btts.outcomes.find((o:any) => o.name === 'No')?.price || "No disponible";
        }
      }

      // B. PYTHON MATHS
      const res = await fetch(`${PYTHON_BACKEND_URL}/analizar_completo`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          home_team: match.home_team,
          away_team: match.away_team,
          odd_home: oddHome || 2.0,
          odd_draw: oddDraw || 3.0,
          odd_away: oddAway || 2.0
        })
      });
      const data = await res.json();
      
      // C. PROMPT MAESTRO
      const prompt = `Actúa como Analista de Inversiones Deportivas (BetSmart AI).
      
💰 **CAPITAL & STAKE:**
• Bankroll: $${bankroll} COP
• Stake Unidad (1/10): $${(parseInt(bankroll)/10).toFixed(0)} COP

⚽ **PARTIDO:** ${match.home_team} vs ${match.away_team}
🏆 **LIGA:** ${LEAGUES.find(l => l.code === selectedLeague)?.name}

📊 **CUOTAS DE MERCADO (Casas de Apuestas):**
• Ganador (1X2): 1[@${oddHome}] | X[@${oddDraw}] | 2[@${oddAway}]
• Goles (2.5): Over[@${over25}] | Under[@${under25}]
• Ambos Marcan (BTTS): Sí[@${bttsYes}] | No[@${bttsNo}]
*(Nota: Si alguna cuota dice "No disponible", usa tu estimación)*

🧮 **INTELIGENCIA MATEMÁTICA (Modelos Propios):**
• ELO: Local ${data.elo.home} vs Visita ${data.elo.away} (Diferencia: ${data.elo.home - data.elo.away})
• Stats Reales (5p): Local ${data.stats.home.shots} tiros/p, Visita ${data.stats.away.shots} tiros/p.
• 🤖 **PREDICCIÓN DEL MODELO:**
  - Probabilidad BTTS: ${data.model_result.btts_prob}%
  - Probabilidad Over 2.5: ${data.model_result.over_prob}%

**TU Veredicto:**
1. Compara las probabilidades de mi modelo con las cuotas disponibles. ¿Hay valor positivo?
2. Busca lesiones de última hora en internet.
3. **CONCLUSIÓN:** Dame la apuesta más rentable y el monto exacto ($) a jugar.`;

      setGeneratedPrompts(prev => ({...prev, [match.id]: prompt}));

    } catch (e) {
      alert("Error al generar análisis.");
    } finally {
      setAnalyzingId(null);
    }
  };

  const copiar = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-300 font-sans pb-32">
      <div className="relative z-10 max-w-3xl mx-auto p-4">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="text-emerald-500" /> BetSmart <span className="text-emerald-500">Ultra</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest ml-1">Intelligent Betting System</p>
          </div>
        </div>

        {/* PANEL DE CONTROL */}
        <div className="bg-[#121212] rounded-xl border border-white/10 p-5 mb-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1"><Wallet size={10}/> Bankroll</label>
                <div className="flex items-center bg-black/50 rounded-lg border border-white/10 px-3 py-2">
                    <DollarSign size={14} className="text-emerald-500 mr-2"/>
                    <input type="number" value={bankroll} onChange={(e) => setBankroll(e.target.value)} className="bg-transparent w-full text-white text-sm outline-none"/>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1"><Calendar size={10}/> Fecha</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white outline-none"/>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1"><Globe size={10}/> Liga</label>
                <div className="relative">
                  <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white outline-none appearance-none">
                    {LEAGUES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                  </select>
                  <ChevronRight size={12} className="absolute right-3 top-3 text-gray-500 rotate-90 pointer-events-none"/>
                </div>
              </div>
            </div>

            <button onClick={escanear} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20">
              {status.includes("...") ? <RefreshCw className="animate-spin" size={16}/> : <Search size={16}/>}
              {status.includes("...") ? "ANALIZANDO MERCADOS..." : "BUSCAR OPORTUNIDADES"}
            </button>
            
            {/* Status Bar */}
            <div className="mt-3 flex justify-center">
                <span className={`text-[10px] font-mono px-3 py-1 rounded-full border ${status.includes("Error") ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                    {status}
                </span>
            </div>
        </div>

        {/* RESULTADOS */}
        <div className="grid gap-4">
          {matches.map(m => (
            <div key={m.id} className="bg-[#121212] rounded-xl border border-white/10 overflow-hidden hover:border-emerald-500/30 transition-all duration-300">
              <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1">{LEAGUES.find(l => l.code === selectedLeague)?.name}</span>
                  <div className="flex items-center gap-3 text-sm font-bold text-white">
                    <span>{m.home_team}</span> <span className="text-gray-600 text-xs">VS</span> <span>{m.away_team}</span>
                  </div>
                </div>
                <div className="bg-white/5 px-2 py-1 rounded text-[10px] font-mono text-gray-400">{m.commence_time.split('T')[1].slice(0,5)}</div>
              </div>

              <div className="p-5">
                {!generatedPrompts[m.id] ? (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Shield size={14}/> Esperando ejecución de modelos...
                    </div>
                    <button onClick={() => generarPrompt(m)} disabled={analyzingId === m.id} className="px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 rounded-lg text-xs font-bold text-emerald-400 flex items-center gap-2 transition-all">
                      {analyzingId === m.id ? <RefreshCw className="animate-spin" size={14}/> : <Zap size={14}/>}
                      {analyzingId === m.id ? "PROCESANDO..." : "GENERAR ANÁLISIS"}
                    </button>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-gradient-to-r from-emerald-900/10 to-transparent p-4 rounded-lg border-l-2 border-emerald-500 mb-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 opacity-10"><TrendingUp size={50}/></div>
                      <h3 className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-2"><BarChart2 size={12}/> ESTRATEGIA LISTA</h3>
                      <p className="text-[10px] text-gray-400 italic max-w-[90%]">
                        El prompt incluye cuotas en vivo de {m.bookmakers[0]?.markets?.length || 1} mercados y predicciones matemáticas personalizadas.
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button onClick={() => copiar(m.id, generatedPrompts[m.id])} className={`flex-1 py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${copiedId === m.id ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                        {copiedId === m.id ? <Check size={14}/> : <Copy size={14}/>}
                        {copiedId === m.id ? "COPIADO" : "COPIAR ESTRATEGIA"}
                      </button>
                      <a href="https://chat.openai.com" target="_blank" className="w-12 flex items-center justify-center bg-[#1a1a1a] border border-white/10 rounded-lg hover:border-white/30 transition-colors text-gray-400 hover:text-white" title="Abrir ChatGPT">
                        <MousePointerClick size={16}/>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;