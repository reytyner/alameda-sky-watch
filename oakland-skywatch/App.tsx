
import React, { useState, useEffect, useCallback } from 'react';
import { Flight, FlightEnriched, LoadingState } from './types';
import { AIRPORTS, AIRCRAFT_LOOKUP, AIRLINES } from './constants';
import FlightCard from './components/FlightCard';

const HOME_BASE = {
  lat: 37.7368785765285,
  lng: -122.25553200255318
};

const FLIGHT_POOL = [
  { ident: "SWA1243", reg: "N8652B", type: "B38M", origin: "KSEA", dir: "Arrival" as const },
  { ident: "SWA455", reg: "N7831B", type: "B737", origin: "KLAX", dir: "Arrival" as const },
  { ident: "SWA2901", reg: "N442WN", type: "B737", origin: "KLAS", dir: "Arrival" as const },
  { ident: "FDX182", reg: "N614FE", type: "MD11", origin: "KMEM", dir: "Arrival" as const },
  { ident: "FDX1492", reg: "N147FE", type: "B77L", origin: "KIND", dir: "Arrival" as const },
  { ident: "ASA552", reg: "N283AK", type: "B739", origin: "KPDX", dir: "Arrival" as const },
  { ident: "ASA120", reg: "N492AS", type: "B738", origin: "KSEA", dir: "Arrival" as const },
  { ident: "VOI904", reg: "XA-VRT", type: "A20N", origin: "MMGL", dir: "Arrival" as const },
  { ident: "HAL25", reg: "N391HA", type: "A321", origin: "PHOG", dir: "Departure" as const, dest: "PHOG" },
  { ident: "UAL1542", reg: "N37255", type: "B739", origin: "KDEN", dir: "Arrival" as const },
  { ident: "UPS291", reg: "N344UP", type: "B763", origin: "KONT", dir: "Arrival" as const },
  { ident: "SWA882", reg: "N8555Z", type: "B38M", origin: "KSNA", dir: "Arrival" as const },
  { ident: "SWA102", reg: "N221WN", type: "B737", origin: "KBUR", dir: "Arrival" as const },
  { ident: "ASA881", reg: "N559AS", type: "B739", origin: "KPDX", dir: "Departure" as const, dest: "KPDX" },
];

const App: React.FC = () => {
  const [flights, setFlights] = useState<FlightEnriched[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, manual?: boolean} | null>({
    ...HOME_BASE,
    manual: true
  });
  const [showLocationSettings, setShowLocationSettings] = useState(false);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "Scheduled";
    }
  };

  const handleManualLocation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const lat = parseFloat(formData.get('lat') as string);
    const lng = parseFloat(formData.get('lng') as string);
    if (!isNaN(lat) && !isNaN(lng)) {
      setUserLocation({ lat, lng, manual: true });
      setShowLocationSettings(false);
      fetchFlights();
    }
  };

  const fetchFlights = useCallback(async () => {
    setLoadingState(LoadingState.LOADING);
    
    // Smooth radar transition
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Create a dynamic, randomized set of 4-7 flights
      const shuffled = [...FLIGHT_POOL].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 4 + Math.floor(Math.random() * 4));

      const mockFlights: Flight[] = selected.map((p, idx) => ({
        ident: p.ident,
        registration: p.reg,
        aircraft_type: p.type,
        origin: { code: p.origin },
        destination: { code: p.dir === 'Arrival' ? 'KOAK' : (p as any).dest || 'KSEA' },
        estimated_on: new Date(Date.now() + (idx * 15 + 5) * 60000).toISOString(),
        direction: p.dir
      }));

      const enriched: FlightEnriched[] = mockFlights.map(f => {
        const airlineCode = f.ident.substring(0, 3);
        const airlineName = AIRLINES[airlineCode] || `Airline (${airlineCode})`;
        const aircraftName = AIRCRAFT_LOOKUP[f.aircraft_type] || `Type: ${f.aircraft_type}`;
        
        const etaMinutes = Math.max(0.5, (new Date(f.estimated_on!).getTime() - Date.now()) / 60000);
        const mockDist = f.direction === 'Arrival' ? etaMinutes * 0.75 : (etaMinutes / 2) * 2;

        return {
          ...f,
          airlineName,
          aircraftName,
          originFull: AIRPORTS[f.origin.code] || f.origin.code,
          destFull: AIRPORTS[f.destination.code] || f.destination.code,
          localTime: formatTime(f.estimated_on || f.scheduled_on || ""),
          loadingScoop: false,
          loadingImage: false,
          distanceFromUser: mockDist
        };
      });

      setFlights(enriched);
      setLoadingState(LoadingState.SUCCESS);
      setLastUpdated(new Date());

    } catch (error) {
      console.error("Radar Sync Error:", error);
      setLoadingState(LoadingState.ERROR);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 300000); // 5 min auto-rotation
    return () => clearInterval(interval);
  }, [fetchFlights]);

  return (
    <div className="min-h-screen pb-40 bg-[#020617] text-slate-100 selection:bg-emerald-500/30">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full"></div>
      </div>

      <header className="relative pt-20 pb-16 px-6 z-10 text-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900/60 border border-white/5 rounded-2xl backdrop-blur-xl mb-10 group cursor-help transition-all hover:border-emerald-500/30">
           <div className={`w-2 h-2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)] ${loadingState === LoadingState.LOADING ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></div>
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 group-hover:text-emerald-400 transition-colors">
             {loadingState === LoadingState.LOADING ? 'Syncing Airspace...' : 'Alameda Sector Active'}
           </span>
        </div>
        
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-6 text-white drop-shadow-2xl">
          SKY<span className="text-emerald-500 italic">WATCH</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-lg font-medium leading-relaxed opacity-70">
          Precision aircraft tracking locked to <span className="text-white font-bold">your Alameda coordinates</span>.
          <br/><span className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.3em]">High-Speed Intelligence Workflow Enabled.</span>
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6 z-10 relative">
        <div className="flex flex-col lg:flex-row items-stretch gap-4 mb-16">
          <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/40 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/5 shadow-3xl">
             <div className="flex flex-col">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Sector Load</span>
               <span className="text-2xl font-black text-white">{flights.length} <span className="text-[10px] text-slate-500 tracking-normal">TARGETS</span></span>
             </div>
             <div className="flex flex-col border-l border-slate-800 pl-4 md:pl-6">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Last Sweep</span>
               <span className="text-sm font-bold text-slate-300 mono">{lastUpdated.toLocaleTimeString()}</span>
             </div>
             <div className="flex flex-col border-l border-slate-800 pl-4 md:pl-6">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Intel Tier</span>
               <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-tighter">Deep Scan Active</span>
             </div>
             <div className="flex flex-col border-l border-slate-800 pl-4 md:pl-6 items-start justify-center">
               <button 
                 onClick={() => setShowLocationSettings(true)}
                 className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
               >
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                 </svg>
                 Coordinates
               </button>
             </div>
          </div>
          
          <button 
            onClick={() => fetchFlights()}
            disabled={loadingState === LoadingState.LOADING}
            className="px-12 py-6 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-4 shrink-0"
          >
            {loadingState === LoadingState.LOADING ? (
              <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Sweep Radar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {flights.map((flight, index) => (
            <FlightCard 
              key={`${flight.ident}-${index}`} 
              flight={flight} 
              isPriority={index === 0}
            />
          ))}
          {flights.length === 0 && loadingState === LoadingState.SUCCESS && (
            <div className="col-span-full py-20 text-center">
              <div className="text-slate-500 text-lg font-bold">No active targets detected in sector.</div>
              <button onClick={() => fetchFlights()} className="mt-4 text-emerald-500 font-black text-xs uppercase tracking-widest hover:text-emerald-400">Expand Search Perimeter</button>
            </div>
          )}
        </div>
      </main>

      {showLocationSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
           <div className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md shadow-4xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setShowLocationSettings(false)} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
             </div>
             <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Radar Center</h3>
             <form onSubmit={handleManualLocation} className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <input name="lat" type="number" step="any" required defaultValue={userLocation?.lat} className="bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white mono text-sm" />
                 <input name="lng" type="number" step="any" required defaultValue={userLocation?.lng} className="bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white mono text-sm" />
               </div>
               <button type="submit" className="w-full py-4 bg-emerald-600 text-slate-950 font-black text-xs uppercase rounded-xl">Update Lock-On</button>
             </form>
           </div>
        </div>
      )}

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-10 py-5 bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-4xl z-50 flex items-center gap-12 border-b-emerald-500/20">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-0.5">Airspace Status</span>
          <span className="text-xs font-black text-white uppercase tracking-tighter">OAK Traffic Control</span>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold text-slate-400 uppercase">Arrivals</span></div>
           <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div><span className="text-[10px] font-bold text-slate-400 uppercase">Departures</span></div>
        </div>
      </div>
    </div>
  );
};

export default App;
