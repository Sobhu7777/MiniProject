const API_BASE_URL = 'http://localhost:8000/api';

export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const REGIONS = [
    { id: 'north', name: 'North', icon: '🏔️', description: 'Northern India and Himalayas' },
    { id: 'west', name: 'West', icon: '🌅', description: 'Western landscapes and coasts' },
    { id: 'east', name: 'East', icon: '🏛️', description: 'Eastern plains and heritage' },
    { id: 'northeast', name: 'Northeast', icon: '🌿', description: 'Lush green peaks and forests' },
    { id: 'south', name: 'South', icon: '🌴', description: 'Tropical coasts and heritage' },
];

const STATES_BY_REGION = {
    'north': [
        "Uttarakhand", "Himachal Pradesh", "Jammu and Kashmir", "Uttar Pradesh"
    ],
    'west': [
        "Maharashtra", "Rajasthan", "Goa"
    ],
    'east': [
        "West Bengal", "Odisha", "Bihar", "Jharkhand"
    ],
    'northeast': [
        "Sikkim", "Meghalaya", "Assam"
    ],
    'south': [
        "Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh"
    ],
};

const PLACES_BY_STATE = {
    // Northern States
    'Uttarakhand': ['Mussoorie', 'Chamoli', 'Pithoragarh', 'Kedarnath'],
    'Himachal Pradesh': ['Shimla', 'Manali'],
    'Jammu and Kashmir': ['Srinagar'],
    'Uttar Pradesh': ['Varanasi'],

    // Western States
    'Maharashtra': ['Mumbai'],
    'Rajasthan': ['Udaipur'],
    'Goa': ['Panaji'],

    // Eastern States
    'West Bengal': ['Kolkata', 'Darjeeling'],
    'Odisha': ['Bhubaneswar', 'Puri'],
    'Bihar': ['Patna'],
    'Jharkhand': ['Ranchi'],

    // Northeast States
    'Sikkim': ['Gangtok'],
    'Meghalaya': ['Shillong'],
    'Assam': ['Guwahati'],

    // Southern States
    'Kerala': ['Munnar', 'Wayanad', 'Kochi', 'Idukki', 'Thiruvananthapuram'],
    'Tamil Nadu': ['Chennai', 'Nilgiris'],
    'Karnataka': ['Coorg'],
    'Andhra Pradesh': ['Visakhapatnam']
};

export async function fetchStates(regionId) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(STATES_BY_REGION[regionId] || []), 300);
    });
}

export async function fetchPlaces(stateName) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(PLACES_BY_STATE[stateName] || []), 300);
    });
}

export async function fetchPredictions(place, month) {
    try {
        const response = await fetch(`${API_BASE_URL}/predict?place=${encodeURIComponent(place)}&month=${month}`);
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data;
    } catch (error) {
        console.error('Error fetching predictions:', error);
        throw error;
    }
}

export async function fetchWeatherForecast(place) {
    return new Promise((resolve) => {
        const data = Array.from({ length: 16 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            return {
                day: i + 1,
                date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                tempMax: 25 + Math.floor(Math.random() * 5),
                tempMin: 18 + Math.floor(Math.random() * 5),
                precipitation: (Math.random() * 10).toFixed(1),
                windSpeed: 10 + Math.floor(Math.random() * 10),
                condition: ['Sunny', 'Cloudy', 'Rainy', 'Stormy'][Math.floor(Math.random() * 4)]
            };
        });
        setTimeout(() => resolve(data), 400);
    });
}

export async function fetchPlaceInfo(place) {
    return new Promise((resolve) => {
        const data = {
            description: `${place} is a beautiful destination known for its stunning landscapes, local culture, and tourist attractions.`,
            bestTime: 'October to March',
            elevation: 'Variable',
            highlights: ['Natural Beauty', 'Local Culture', 'Adventure', 'Heritage'],
            topSpots: [
                { name: 'Main Highlight', url: '#' },
                { name: 'Scenic Point', url: '#' },
                { name: 'Historical Site', url: '#' }
            ]
        };
        setTimeout(() => resolve(data), 300);
    });
}
