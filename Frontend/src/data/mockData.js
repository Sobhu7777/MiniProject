// ============================================================
// MOCK DATA — Replace each fetch function body with real API calls
// ============================================================

// ── Region → State mapping ──────────────────────────────────
export const REGIONS = [
  { id: 'north',     name: 'North India',     icon: '🏔️', description: 'Himalayas & plains' },
  { id: 'south',     name: 'South India',     icon: '🌴', description: 'Coasts & backwaters' },
  { id: 'east',      name: 'East India',      icon: '🌿', description: 'Deltas & forests' },
  { id: 'west',      name: 'West India',      icon: '🏜️', description: 'Deserts & coastline' },
  { id: 'central',   name: 'Central India',   icon: '🏛️', description: 'Heritage & wildlife' },
  { id: 'northeast', name: 'Northeast India', icon: '🌄', description: 'Hills & biodiversity' },
];

const STATES_BY_REGION = {
  north:     ['Himachal Pradesh', 'Uttarakhand', 'Jammu & Kashmir', 'Punjab', 'Haryana'],
  south:     ['Kerala', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Telangana'],
  east:      ['West Bengal', 'Odisha', 'Bihar', 'Jharkhand'],
  west:      ['Rajasthan', 'Gujarat', 'Maharashtra', 'Goa'],
  central:   ['Madhya Pradesh', 'Chhattisgarh'],
  northeast: ['Assam', 'Meghalaya', 'Sikkim', 'Arunachal Pradesh', 'Nagaland'],
};

// ── State → Places mapping ──────────────────────────────────
const PLACES_BY_STATE = {
  'Himachal Pradesh': ['Manali', 'Shimla', 'Dharamshala', 'Kasol', 'Spiti Valley'],
  'Uttarakhand':      ['Rishikesh', 'Mussoorie', 'Nainital', 'Valley of Flowers', 'Auli'],
  'Jammu & Kashmir':  ['Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg', 'Leh'],
  'Punjab':           ['Amritsar', 'Chandigarh', 'Patiala'],
  'Haryana':          ['Kurukshetra', 'Panchkula', 'Surajkund'],
  'Kerala':           ['Munnar', 'Alleppey', 'Kochi', 'Wayanad', 'Kuttanad'],
  'Tamil Nadu':       ['Ooty', 'Kodaikanal', 'Mahabalipuram', 'Rameswaram'],
  'Karnataka':        ['Coorg', 'Hampi', 'Mysore', 'Gokarna'],
  'Andhra Pradesh':   ['Visakhapatnam', 'Tirupati', 'Araku Valley'],
  'Telangana':        ['Hyderabad', 'Warangal', 'Nagarjunasagar'],
  'West Bengal':      ['Darjeeling', 'Sundarbans', 'Kolkata', 'Shantiniketan'],
  'Odisha':           ['Puri', 'Konark', 'Chilika Lake', 'Bhubaneswar'],
  'Bihar':            ['Bodh Gaya', 'Rajgir', 'Nalanda'],
  'Jharkhand':        ['Ranchi', 'Jamshedpur', 'Netarhat'],
  'Rajasthan':        ['Jaipur', 'Udaipur', 'Jaisalmer', 'Jodhpur', 'Mount Abu'],
  'Gujarat':          ['Gir Forest', 'Rann of Kutch', 'Dwarka', 'Somnath'],
  'Maharashtra':      ['Mumbai', 'Lonavala', 'Mahabaleshwar', 'Ajanta & Ellora'],
  'Goa':              ['Panaji', 'Calangute', 'Palolem', 'Dudhsagar Falls'],
  'Madhya Pradesh':   ['Khajuraho', 'Pachmarhi', 'Kanha National Park'],
  'Chhattisgarh':     ['Chitrakote Falls', 'Barnawapara', 'Tirathgarh Falls'],
  'Assam':            ['Kaziranga', 'Majuli', 'Guwahati'],
  'Meghalaya':        ['Shillong', 'Cherrapunji', 'Mawlynnong'],
  'Sikkim':           ['Gangtok', 'Pelling', 'Tsomgo Lake'],
  'Arunachal Pradesh':['Tawang', 'Ziro Valley', 'Bomdila'],
  'Nagaland':         ['Kohima', 'Dimapur', 'Dzukou Valley'],
};

// ── Month names ─────────────────────────────────────────────
export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ── Disaster risk mock data generator ───────────────────────
function generateRiskData(place, monthIndex) {
  // Deterministic seed from place + month
  const seed = (place.length * 7 + monthIndex * 13) % 100;
  const thunderstorm = Math.min(0.95, Math.max(0.05, (seed + 20) / 100));
  const windstorm    = Math.min(0.95, Math.max(0.05, ((seed * 3 + 10) % 100) / 100));
  const flood        = Math.min(0.95, Math.max(0.05, ((seed * 2 + 30) % 100) / 100));
  const landslide    = Math.min(0.95, Math.max(0.05, ((seed * 5 + 50) % 100) / 100));

  const riskLevel = (val) => val < 0.3 ? 'Low' : val < 0.6 ? 'Medium' : 'High';

  return {
    thunderstorm: { probability: thunderstorm, level: riskLevel(thunderstorm) },
    windstorm:    { probability: windstorm,    level: riskLevel(windstorm) },
    flood:        { probability: flood,        level: riskLevel(flood) },
    landslide:    { probability: landslide,    level: riskLevel(landslide) },
    cumulative:   {
      probability: (thunderstorm + windstorm + flood + landslide) / 4,
      level: riskLevel((thunderstorm + windstorm + flood + landslide) / 4),
    },
  };
}

// ── Safety measures ─────────────────────────────────────────
const SAFETY_MEASURES = {
  thunderstorm: {
    Low:    ['Carry a light raincoat.', 'Check weather updates before outdoor treks.'],
    Medium: ['Avoid open fields during afternoon hours.', 'Stay near shelter-equipped areas.', 'Keep electronic devices charged.'],
    High:   ['Do NOT venture outdoors without local guidance.', 'Avoid hilltops and isolated trees.', 'Carry an emergency kit with first-aid supplies.', 'Register with local authorities before trekking.'],
  },
  windstorm: {
    Low:    ['Secure loose belongings while travelling.', 'Keep windows closed during evening hours.'],
    Medium: ['Avoid long drives on exposed highways.', 'Stay indoors during peak wind hours.', 'Follow local weather advisories.'],
    High:   ['Postpone travel if possible.', 'Avoid coastal and elevated areas.', 'Keep an emergency communication device.', 'Seek reinforced shelter immediately.'],
  },
  flood: {
    Low:    ['Stay on elevated roads and trails.', 'Keep important documents waterproofed.'],
    Medium: ['Identify evacuation routes at your destination.', 'Avoid camping near riverbanks.', 'Carry waterproof bags for electronics.'],
    High:   ['Do NOT travel to flood-prone zones during this period.', 'Register with NDRF helpline before visiting.', 'Carry life jackets if near water bodies.', 'Keep 3-day emergency supplies ready.'],
  },
  landslide: {
    Low:    ['Stick to well-maintained roads.', 'Avoid steep trail shortcuts.'],
    Medium: ['Monitor local news for road closures.', 'Travel only during daylight hours.', 'Carry GPS and offline maps.'],
    High:   ['Avoid all hill routes unless absolutely necessary.', 'Do NOT park near cliff edges or steep slopes.', 'Hire local guides familiar with terrain.', 'Have an evacuation plan ready at all times.'],
  },
};

// ── 16-day weather mock generator ───────────────────────────
function generateWeatherData(place) {
  const seed = place.length * 11;
  return Array.from({ length: 16 }, (_, i) => {
    const daySeed = (seed + i * 7) % 100;
    return {
      day: i + 1,
      date: new Date(Date.now() + i * 86400000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      tempMax: Math.round(22 + (daySeed % 15)),
      tempMin: Math.round(12 + (daySeed % 10)),
      precipitation: Math.round(((daySeed * 3) % 100) / 10),
      condition: daySeed < 30 ? 'Sunny' : daySeed < 60 ? 'Cloudy' : daySeed < 80 ? 'Rainy' : 'Stormy',
      humidity: 40 + (daySeed % 40),
      windSpeed: 5 + (daySeed % 25),
    };
  });
}

// ── Place info mock ─────────────────────────────────────────
const PLACE_INFO = {
  default: {
    description: 'A beautiful tourist destination known for its scenic landscapes and rich cultural heritage. Visitors flock here every year to experience the unique blend of nature and tradition.',
    topSpots: [
      { name: 'Heritage Walk Trail',        url: 'https://www.incredibleindia.org' },
      { name: 'Sunset Viewpoint',           url: 'https://www.incredibleindia.org' },
      { name: 'Local Market Square',        url: 'https://www.incredibleindia.org' },
      { name: 'Ancient Temple Complex',     url: 'https://www.incredibleindia.org' },
      { name: 'Botanical Gardens',          url: 'https://www.incredibleindia.org' },
      { name: 'Adventure Sports Hub',       url: 'https://www.incredibleindia.org' },
    ],
    highlights: ['Cultural heritage', 'Natural beauty', 'Local cuisine', 'Adventure activities'],
    bestTime: 'October – March',
    elevation: '~1,200 m',
  },
  Manali: {
    description: 'Manali is a high-altitude Himalayan resort town in Himachal Pradesh, renowned for its snow-capped peaks, lush green valleys, and adventure sports. The town sits at the northern end of the Kullu Valley along the Beas River.',
    topSpots: [
      { name: 'Rohtang Pass',              url: 'https://en.wikipedia.org/wiki/Rohtang_Pass' },
      { name: 'Solang Valley',             url: 'https://en.wikipedia.org/wiki/Solang_Valley' },
      { name: 'Hadimba Temple',            url: 'https://en.wikipedia.org/wiki/Hadimba_Temple' },
      { name: 'Old Manali',                url: 'https://en.wikipedia.org/wiki/Manali,_Himachal_Pradesh' },
      { name: 'Jogini Waterfall',          url: 'https://en.wikipedia.org/wiki/Jogini_Waterfall' },
      { name: 'Vashisht Hot Springs',      url: 'https://en.wikipedia.org/wiki/Vashisht' },
      { name: 'Manu Temple',               url: 'https://en.wikipedia.org/wiki/Manu_Temple,_Manali' },
    ],
    highlights: ['Skiing & snowboarding', 'River rafting', 'Trekking', 'Tibetan culture'],
    bestTime: 'October – June',
    elevation: '2,050 m',
  },
  Munnar: {
    description: 'Munnar is a town in the Western Ghats mountain range of Kerala, famous for its sprawling tea plantations, exotic flora, and misty hills. It was once the summer resort of the British Raj.',
    topSpots: [
      { name: 'Eravikulam National Park',  url: 'https://en.wikipedia.org/wiki/Eravikulam_National_Park' },
      { name: 'Tea Museum',                url: 'https://en.wikipedia.org/wiki/Munnar' },
      { name: 'Mattupetty Dam',            url: 'https://en.wikipedia.org/wiki/Mattupetty_Dam' },
      { name: 'Top Station',               url: 'https://en.wikipedia.org/wiki/Top_Station' },
      { name: 'Attukal Waterfalls',        url: 'https://en.wikipedia.org/wiki/Attukad_Waterfalls' },
      { name: 'Kundala Lake',              url: 'https://en.wikipedia.org/wiki/Kundala_Dam' },
    ],
    highlights: ['Tea plantations', 'Nilgiri Tahr sighting', 'Trekking trails', 'Spice gardens'],
    bestTime: 'September – March',
    elevation: '1,532 m',
  },
};

// ============================================================
// PUBLIC API — mock fetch functions (swap with real fetch later)
// ============================================================

/**
 * Fetch states for a given region.
 * TODO: Replace with → fetch(`/api/states?region=${regionId}`)
 */
export function fetchStates(regionId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(STATES_BY_REGION[regionId] || []);
    }, 400);
  });
}

/**
 * Fetch tourist places for a given state.
 * TODO: Replace with → fetch(`/api/places?state=${encodeURIComponent(stateName)}`)
 */
export function fetchPlaces(stateName) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(PLACES_BY_STATE[stateName] || []);
    }, 400);
  });
}

/**
 * Fetch disaster risk predictions for a place + month.
 * TODO: Replace with → fetch(`/api/predict?place=${place}&month=${month}`)
 */
export function fetchPredictions(place, monthIndex) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        risks: generateRiskData(place, monthIndex),
        safety: {
          thunderstorm: SAFETY_MEASURES.thunderstorm[generateRiskData(place, monthIndex).thunderstorm.level],
          windstorm:    SAFETY_MEASURES.windstorm[generateRiskData(place, monthIndex).windstorm.level],
          flood:        SAFETY_MEASURES.flood[generateRiskData(place, monthIndex).flood.level],
          landslide:    SAFETY_MEASURES.landslide[generateRiskData(place, monthIndex).landslide.level],
        },
      });
    }, 600);
  });
}

/**
 * Fetch 16-day weather forecast for a place.
 * TODO: Replace with → fetch(`/api/weather/16day?place=${place}`)
 */
export function fetchWeatherForecast(place) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateWeatherData(place));
    }, 500);
  });
}

/**
 * Fetch place information.
 * TODO: Replace with → fetch(`/api/place-info?place=${place}`)
 */
export function fetchPlaceInfo(place) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(PLACE_INFO[place] || PLACE_INFO.default);
    }, 400);
  });
}
