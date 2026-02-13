
export interface Flight {
  ident: string;
  registration: string;
  aircraft_type: string;
  origin: {
    code: string;
    city?: string;
  };
  destination: {
    code: string;
  };
  scheduled_on?: string;
  estimated_on?: string;
  actual_on?: string;
  direction: 'Arrival' | 'Departure';
}

export interface FlightEnriched extends Flight {
  airlineName: string;
  aircraftName: string;
  originFull: string;
  destFull: string;
  localTime: string;
  scoop?: string;
  scoopSources?: Array<{ web: { title: string; uri: string } }>;
  loadingScoop: boolean;
  isScoopError?: boolean;
  isFallback?: boolean;
  isStatic?: boolean;
  imageUrl?: string;
  loadingImage: boolean;
  imageError?: string;
  distanceFromUser?: number; // in miles
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}
