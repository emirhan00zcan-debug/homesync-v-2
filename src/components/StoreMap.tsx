import React from 'react';

export const SNAZZY_SILVER_THEME = [
  { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
  { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }
];

export default function StoreMap() {
    return (
        <div className="w-full h-full min-h-[500px] lg:min-h-[600px] relative rounded-[40px] overflow-hidden shadow-anti-gravity border border-black/10 dark:border-white/10">
            <div className="absolute inset-0 bg-[#f5f5f5] dark:bg-[#222] flex items-center justify-center overflow-hidden">
                {/* Simulated silver map grid/lines placeholder */}
                <div className="absolute inset-0 opacity-20 dark:opacity-5" style={{
                    backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }} />
                
                {/* Gold/Yellow Map Pins */}
                <div className="absolute top-[30%] left-[40%] w-8 h-8 rounded-full bg-radiant-amber shadow-lg border-4 border-white dark:border-[#222] flex items-center justify-center z-10 before:content-[''] before:absolute before:-bottom-3 before:border-l-[6px] before:border-r-[6px] before:border-t-8 before:border-l-transparent before:border-r-transparent before:border-t-radiant-amber">
                    <div className="w-2 h-2 rounded-full bg-white dark:bg-[#222]" />
                </div>
                
                <div className="absolute top-[60%] left-[65%] w-8 h-8 rounded-full bg-radiant-amber shadow-lg border-4 border-white dark:border-[#222] flex items-center justify-center z-10 before:content-[''] before:absolute before:-bottom-3 before:border-l-[6px] before:border-r-[6px] before:border-t-8 before:border-l-transparent before:border-r-transparent before:border-t-radiant-amber">
                    <div className="w-2 h-2 rounded-full bg-white dark:bg-[#222]" />
                </div>

                <div className="relative z-20 text-center px-6 mt-40 mix-blend-difference pointer-events-none opacity-50">
                    <h3 className="text-2xl font-black text-white tracking-[0.2em] uppercase">Interaktif Harita</h3>
                    <p className="text-white/80 mt-2 font-medium max-w-sm mx-auto text-sm">Gümüş temalı harita & Sarı Pinler</p>
                </div>
            </div>
        </div>
    );
}
