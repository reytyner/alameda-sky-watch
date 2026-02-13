
import React from 'react';
import { FlightEnriched } from '../types';

interface FlightCardProps {
  flight: FlightEnriched;
  isPriority?: boolean;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, isPriority }) => {
  const isClose = flight.distanceFromUser !== undefined && flight.distanceFromUser < 2.0;
  const isArrival = flight.direction === 'Arrival';

  // Generate a tailored search query that is likely to trigger Google's AI Overview or rich results
  const intelligenceSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`spotter trivia and interesting fun facts for ${flight.airlineName} ${flight.aircraftName} aircraft`)}`;
  const googleImagesUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${flight.airlineName} ${flight.aircraftName} ${flight.registration}`)}`;
  const jetPhotosUrl = `https://www.jetphotos.com/registration/${flight.registration}`;

  // Local static intel for immediate "flavor" text
  const getInstantIntel = () => {
    if (flight.airlineName.includes("Southwest")) return "OAK is a major Southwest base; look for special liveries like 'Freedom One' or 'California One'.";
    if (flight.airlineName.includes("FedEx")) return "The 'OAK Push' usually sees heavy MD-11 and 777 traffic during late-night and early-morning hub operations.";
    if (flight.airlineName.includes("Alaska")) return "Alaska often runs specialized E175 or 737 routes connecting OAK to the Pacific Northwest.";
    return `The ${flight.aircraftName} is a staple of ${flight.airlineName}'s medium-haul fleet servicing the East Bay.`;
  };

  const renderDistance = () => {
    if (flight.distanceFromUser === undefined) return null;
    if (flight.distanceFromUser < 0.5) {
      const feet = Math.round(flight.distanceFromUser * 5280);
      return (
        <div className="text-right">
          <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Proximity</div>
          <div className="text-2xl font-black mono text-amber-400 animate-pulse">
            {feet.toLocaleString()} <span className="text-[10px] tracking-normal">FT</span>
          </div>
        </div>
      );
    }
    return (
      <div className="text-right">
        <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Distance</div>
        <div className={`text-2xl font-black mono ${isClose ? 'text-amber-400' : 'text-slate-300'}`}>
          {flight.distanceFromUser.toFixed(1)} <span className="text-[10px] tracking-normal">MI</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-slate-800/30 border-2 ${isPriority ? 'border-emerald-500/30 ring-2 ring-emerald-500/5' : 'border-white/5'} ${isClose ? 'border-amber-500/40 bg-slate-800/50' : ''} rounded-[2.5rem] overflow-hidden shadow-3xl transition-all hover:scale-[1.02] hover:bg-slate-800/60 flex flex-col h-full relative group`}>
      {/* Direction Badge */}
      <div className={`absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-2xl border ${isArrival ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isArrival ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />}
        </svg>
        {flight.direction}
      </div>

      {isPriority && (
        <div className="absolute top-6 right-6 z-30 flex items-center gap-2.5 px-4 py-1.5 bg-emerald-500 text-slate-950 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-2xl shadow-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
          PRIORITY
        </div>
      )}

      {/* Radar Visualization Area */}
      <a 
        href={googleImagesUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="relative h-48 overflow-hidden bg-slate-950 flex items-center justify-center cursor-pointer"
        title="View Real Photos of this Aircraft"
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="absolute w-[300%] h-[300%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(16,185,129,0.1)_180deg,transparent_360deg)] animate-[spin_4s_linear_infinite] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center group-hover:scale-110 transition-transform duration-500">
           <svg className={`w-12 h-12 ${isArrival ? 'text-emerald-500' : 'text-blue-500'} transition-all`} fill="currentColor" viewBox="0 0 24 24">
             <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
           </svg>
        </div>
        <div className="absolute bottom-4 left-8 right-8 flex justify-between items-end z-20">
          <div>
            <div className="text-3xl font-black text-white mono leading-none mb-1 tracking-tighter">{flight.ident}</div>
            <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">{flight.airlineName}</div>
          </div>
          {renderDistance()}
        </div>
      </a>

      <div className="p-8 flex-grow space-y-6">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-1.5">
             <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Flight Path</div>
             <div className="text-slate-100 text-[13px] font-bold truncate">{isArrival ? `FROM ${flight.originFull}` : `TO ${flight.destFull}`}</div>
          </div>
          <div className="space-y-1.5 text-right">
             <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{isArrival ? 'EXPECTED ON' : 'DEP TIME'}</div>
             <div className="text-emerald-400 text-[13px] font-black mono">{flight.localTime}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-all">
           <div className="overflow-hidden w-full">
              <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Equipment</div>
              <div className="text-slate-200 text-xs font-bold leading-tight truncate">{flight.aircraftName}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="mono text-[10px] text-slate-500">{flight.registration}</span>
                <a href={jetPhotosUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-tighter transition-colors">JetPhotos Info</a>
              </div>
           </div>
        </div>

        <div className="relative pt-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-grow bg-slate-800"></div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Intelligence Report</span>
              <div className="h-px flex-grow bg-slate-800"></div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
                 <div className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest mb-1.5">Instant Insight</div>
                 <p className="text-[11px] leading-relaxed italic text-slate-400">
                   "{getInstantIntel()}"
                 </p>
              </div>

              <a 
                href={intelligenceSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`group/scan px-6 py-4 border rounded-xl transition-all w-full flex items-center justify-center gap-3 no-underline ${isPriority ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xl shadow-emerald-500/20' : 'bg-white/5 text-slate-500 border-white/5 hover:border-emerald-500/40 hover:text-emerald-400'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isPriority ? 'bg-slate-950 animate-ping' : 'bg-slate-600 group-hover/scan:bg-emerald-500 group-hover/scan:animate-ping'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deep Scan Intel</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              
              <div className="text-center">
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Targeted search optimized for AI Overview</span>
              </div>
            </div>
        </div>
      </div>
      
      <div className="px-8 py-4 bg-slate-950/40 flex justify-center border-t border-white/5">
        <div className="text-[9px] font-black text-slate-800 uppercase tracking-[0.5em] group-hover:text-slate-700 transition-colors">Sector: Alameda Airspace</div>
      </div>
    </div>
  );
};

export default FlightCard;
