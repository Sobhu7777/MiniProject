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
    'Kerala': ['Munnar', 'Wayanad', 'Kochi', 'Thiruvananthapuram'],
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
    try {
        const response = await fetch(`${API_BASE_URL}/predict_16day?place=${encodeURIComponent(place)}`);
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        return data.forecast.map((item, i) => {
            const dateObj = new Date(item.date);
            return {
                day: i + 1,
                date: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                fullDate: item.date,
                weather: {
                    tempMax: item.weather.tempMax,
                    tempMin: item.weather.tempMin,
                    precipitation: item.weather.precipitation,
                    rain_3day: item.weather.rain_3day,
                    windSpeed: item.weather.windSpeed,
                    humidity: item.weather.humidity,
                    dewpoint: item.weather.dewpoint,
                    pressure: item.weather.pressure,
                    cape: item.weather.cape,
                    condition: item.weather.condition
                },
                risks: item.risks
            };
        });
    } catch (error) {
        console.error('Error fetching weather forecast:', error);
        throw error;
    }
}

const PLACE_DATA = {
    'Munnar': {
        description: 'Munnar is a stunning hill station in Kerala, famous for its sprawling tea plantations, rolling hills, and diverse wildlife. It is home to the Neelakurinji flower which blooms once in 12 years.',
        bestTime: 'September to March',
        elevation: '1,532m',
        highlights: ['Tea Gardens', 'Mist-covered Peaks', 'Waterfalls', 'Wildlife'],
        topSpots: [
            { name: 'Eravikulam National Park', description: 'Home to the endangered Nilgiri Tahr and beautiful valley views.', openingTime: '08:00 AM', closingTime: '04:00 PM', rating: '4.6', url: '#' },
            { name: 'Mattupetty Dam', description: 'A concrete gravity dam perfect for boating and sightseeing.', openingTime: '09:30 AM', closingTime: '05:00 PM', rating: '4.4', url: '#' },
            { name: 'Top Station', description: 'The highest point in Munnar offering a panoramic view of the Western Ghats.', openingTime: '06:00 AM', closingTime: '06:00 PM', rating: '4.5', url: '#' },
            { name: 'Attukad Waterfalls', description: 'A scenic waterfall located between Munnar and Pallivasal.', openingTime: '09:00 AM', closingTime: '06:00 PM', rating: '4.4', url: '#' },
            { name: 'Tea Museum', description: 'Learn about the history and processing of tea in the region.', openingTime: '09:00 AM', closingTime: '05:00 PM', rating: '4.3', url: '#' }
        ]
    },
    'Wayanad': {
        description: 'Wayanad is known for its spice plantations, lush forests, and rich tribal heritage. It offers a perfect blend of adventure and serenity with its caves, peaks, and wildlife sanctuaries.',
        bestTime: 'October to May',
        elevation: '700m - 2,100m',
        highlights: ['Spice Plantations', 'Ancient Caves', 'Waterfalls', 'Wildlife'],
        topSpots: [
            { name: 'Edakkal Caves', description: 'Prehistoric stone carvings dating back to the Neolithic era.', openingTime: '09:00 AM', closingTime: '04:30 PM', rating: '4.4', url: '#' },
            { name: 'Banasura Sagar Dam', description: 'The largest earth dam in India and the second largest in Asia.', openingTime: '09:00 AM', closingTime: '05:00 PM', rating: '4.5', url: '#' },
            { name: 'Chembra Peak', description: 'Highest peak in Wayanad, famous for its heart-shaped lake.', openingTime: '07:00 AM', closingTime: '05:00 PM', rating: '4.6', url: '#' },
            { name: 'Soochipara Waterfalls', description: 'A spectacular three-tiered waterfall surrounded by deciduous forests.', openingTime: '08:00 AM', closingTime: '05:00 PM', rating: '4.4', url: '#' },
            { name: 'Wayanad Wildlife Sanctuary', description: 'Part of the Nilgiri Biosphere Reserve, rich in biodiversity.', openingTime: '07:00 AM', closingTime: '05:00 PM', rating: '4.4', url: '#' }
        ]
    },
    'Coorg': {
        description: 'Coorg, also known as the Scotland of India, is famous for its coffee plantations, waterfalls, and brave Kodava culture.',
        bestTime: 'October to April',
        elevation: '1,150m',
        highlights: ['Coffee Estates', 'River Rafting', 'Tibetan Settlements', 'Trekking'],
        topSpots: [
            { name: 'Abbey Falls', description: 'Beautiful waterfall tucked away inside spice and coffee plantations.', openingTime: '09:00 AM', closingTime: '05:00 PM', rating: '4.4', url: '#' },
            { name: 'Talacauvery', description: 'The source of the river Kaveri, located on the Brahmagiri Hills.', openingTime: '06:00 AM', closingTime: '06:00 PM', rating: '4.6', url: '#' },
            { name: 'Raja Seat', description: 'A seasonal garden with fountains where kings used to watch sunsets.', openingTime: '05:30 AM', closingTime: '08:00 PM', rating: '4.5', url: '#' },
            { name: 'Dubare Elephant Camp', description: 'Eco-tourism project where visitors can interact with elephants.', openingTime: '09:00 AM', closingTime: '11:00 AM', rating: '4.2', url: '#' },
            { name: 'Nagarhole National Park', description: 'One of the best tiger reserves in India, rich in flora and fauna.', openingTime: '06:00 AM', closingTime: '06:00 PM', rating: '4.5', url: '#' }
        ]
    },
    'Nilgiris': {
        description: 'The Nilgiris or Blue Mountains are home to India\'s most famous hill station, Ooty. Expect lush green valleys and colonial charm.',
        bestTime: 'October to June',
        elevation: '2,240m',
        highlights: ['Toy Train', 'Botanical Gardens', 'Lake Views', 'Tea Estates'],
        topSpots: [
            { name: 'Ooty Lake', description: 'Artificial lake perfect for boating and picnics.', openingTime: '09:00 AM', closingTime: '06:00 PM', rating: '4.1', url: '#' },
            { name: 'Nilgiri Mountain Railway', description: 'UNESCO World Heritage toy train ride with scenic views.', openingTime: '07:00 AM', closingTime: '06:00 PM', rating: '4.6', url: '#' },
            { name: 'Doddabetta Peak', description: 'The highest peak in the Nilgiris offering majestic views.', openingTime: '07:00 AM', closingTime: '06:00 PM', rating: '4.4', url: '#' },
            { name: 'Government Botanical Garden', description: 'Sprawling garden with thousands of species of plants.', openingTime: '07:00 AM', closingTime: '06:30 PM', rating: '4.5', url: '#' },
            { name: 'Pykara Lake', description: 'Serene lake surrounded by dense forests and waterfalls.', openingTime: '08:30 AM', closingTime: '05:30 PM', rating: '4.5', url: '#' }
        ]
    },
    'Darjeeling': {
        description: 'Darjeeling is world-famous for its tea and the stunning views of Mount Kanchenjunga. The toy train is a major attraction.',
        bestTime: 'April to June, October to December',
        elevation: '2,042m',
        highlights: ['Sunrise at Tiger Hill', 'Tea Estates', 'Himalayan Railway', 'Monasteries'],
        topSpots: [
            { name: 'Tiger Hill', description: 'Famous for spectacular sunrise views over Mt. Kanchenjunga.', openingTime: '04:00 AM', closingTime: '06:00 PM', rating: '4.6', url: '#' },
            { name: 'Batasia Loop', description: 'A spiral railway track with a memorial and beautiful gardens.', openingTime: '05:00 AM', closingTime: '06:00 PM', rating: '4.5', url: '#' },
            { name: 'Peace Pagoda', description: 'A Buddhist stupa offering serenity and great Himalayan views.', openingTime: '04:30 AM', closingTime: '07:00 PM', rating: '4.6', url: '#' },
            { name: 'Happy Valley Tea Estate', description: 'One of the oldest tea estates offering guided factory tours.', openingTime: '08:00 AM', closingTime: '04:00 PM', rating: '4.4', url: '#' },
            { name: 'Darjeeling Himalayan Railway', description: 'The iconic "Toy Train" ride through scenic mountain paths.', openingTime: '06:00 AM', closingTime: '05:00 PM', rating: '4.5', url: '#' }
        ]
    },
    'Gangtok': {
        description: 'Gangtok, the capital of Sikkim, is a modern town steeped in Tibetan Buddhist culture and surrounded by snow-capped peaks.',
        bestTime: 'March to May, October to mid-December',
        elevation: '1,650m',
        highlights: ['High Altitude Lakes', 'Passes', 'Monasteries', 'Cleaner Streets'],
        topSpots: [
            { name: 'Tsomgo Lake', description: 'A glacial lake at high altitude, sacred and beautiful.', openingTime: '07:30 AM', closingTime: '03:00 PM', rating: '4.7', url: '#' },
            { name: 'Nathula Pass', description: 'Border pass between India and China at high altitude.', openingTime: '08:00 AM', closingTime: '03:00 PM', rating: '4.6', url: '#' },
            { name: 'Rumtek Monastery', description: 'One of the largest and most significant monasteries in Sikkim.', openingTime: '06:00 AM', closingTime: '06:00 PM', rating: '4.6', url: '#' },
            { name: 'MG Marg', description: 'The central pedestrian-only shopping and cultural street.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.6', url: '#' },
            { name: 'Hanuman Tok', description: 'A hilltop temple dedicated to Lord Hanuman with great views.', openingTime: '05:00 AM', closingTime: '07:00 PM', rating: '4.7', url: '#' }
        ]
    },
    'Shillong': {
        description: 'Known as the "Scotland of the East", Shillong features rolling hills, waterfalls, and a vibrant local music scene.',
        bestTime: 'March to June, October to November',
        elevation: '1,525m',
        highlights: ['Lakes', 'Canyons', 'Rock Music', 'Waterfalls'],
        topSpots: [
            { name: 'Umiam Lake', description: 'A massive man-made reservoir offering water sports and beauty.', openingTime: '09:00 AM', closingTime: '05:00 PM', rating: '4.5', url: '#' },
            { name: 'Elephant Falls', description: 'Iconic three-step waterfall surrounded by greenery.', openingTime: '09:00 AM', closingTime: '05:00 PM', rating: '4.4', url: '#' },
            { name: 'Shillong Peak', description: 'The highest point in Shillong offering a bird\'s-eye view.', openingTime: '09:00 AM', closingTime: '03:30 PM', rating: '4.3', url: '#' },
            { name: 'Ward Lake', description: 'A shoe-shaped lake popular for garden walks and boating.', openingTime: '08:30 AM', closingTime: '05:30 PM', rating: '4.3', url: '#' },
            { name: 'Laitlum Canyon', description: 'Dramatic cliffside views overlooking deep valleys.', openingTime: '06:00 AM', closingTime: '05:00 PM', rating: '4.7', url: '#' }
        ]
    },
    'Guwahati': {
        description: 'The gateway to Northeast India, Guwahati is situated on the banks of the Brahmaputra and is famous for its ancient temples.',
        bestTime: 'October to March',
        elevation: '55m',
        highlights: ['River Banks', 'Ancient Temples', 'Silks', 'Wildlife'],
        topSpots: [
            { name: 'Kamakhya Temple', description: 'One of the most sacred Shakti Peethas in India.', openingTime: '05:30 AM', closingTime: '10:30 PM', rating: '4.7', url: '#' },
            { name: 'Umananda Temple', description: 'Located on the smallest inhabited river island in the world.', openingTime: '05:30 AM', closingTime: '05:30 PM', rating: '4.6', url: '#' },
            { name: 'Assam State Museum', description: 'Showcasing the rich history and culture of Assam.', openingTime: '10:00 AM', closingTime: '05:00 PM', rating: '4.2', url: '#' },
            { name: 'Pobitora Wildlife Sanctuary', description: 'Dense population of the Great Indian One-horned Rhinoceros.', openingTime: '07:00 AM', closingTime: '05:00 PM', rating: '4.4', url: '#' },
            { name: 'Brahmaputra River Cruise', description: 'Experience the majesty of the river at sunset with dinner.', openingTime: '05:00 PM', closingTime: '08:00 PM', rating: '4.5', url: '#' }
        ]
    },
    'Srinagar': {
        description: 'Srinagar is famous for its houseboats, Mughal gardens, and the iconic Dal Lake. It is the summer capital of Jammu and Kashmir.',
        bestTime: 'April to October',
        elevation: '1,585m',
        highlights: ['Shikara Rides', 'Walled Gardens', 'Apple Orchards', 'Houseboats'],
        topSpots: [
            { name: 'Dal Lake', description: 'The jewel of Srinagar, famous for houseboats and shikaras.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.7', url: '#' },
            { name: 'Shalimar Bagh', description: 'A beautiful Mughal garden built by Emperor Jahangir.', openingTime: '09:00 AM', closingTime: '07:00 PM', rating: '4.5', url: '#' },
            { name: 'Nishat Bagh', description: 'The "Garden of Bliss", another grand Mughal garden by the lake.', openingTime: '09:00 AM', closingTime: '07:00 PM', rating: '4.6', url: '#' },
            { name: 'Shankaracharya Temple', description: 'An ancient Hindu temple on a hilltop with valley views.', openingTime: '07:30 AM', closingTime: '04:30 PM', rating: '4.7', url: '#' },
            { name: 'Gulmarg', description: 'Meadow of flowers and a world-class skiing destination.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.8', url: '#' }
        ]
    },
    'Manali': {
        description: 'Manali is a popular adventure hub in Himachal Pradesh, providing access to Rohtang Pass and Solang Valley.',
        bestTime: 'October to June',
        elevation: '2,050m',
        highlights: ['Snow Sports', 'Old Town Charm', 'Temples', 'Rivers'],
        topSpots: [
            { name: 'Solang Valley', description: 'Adventure valley famous for paragliding and zorbing.', openingTime: '09:00 AM', closingTime: '06:00 PM', rating: '4.5', url: '#' },
            { name: 'Rohtang Pass', description: 'Gateway to Lahaul and Spiti, famous for year-round snow.', openingTime: '06:00 AM', closingTime: '06:00 PM', rating: '4.6', url: '#' },
            { name: 'Hadimba Temple', description: 'Ancient wooden temple surrounded by cedar forests.', openingTime: '08:00 AM', closingTime: '06:00 PM', rating: '4.6', url: '#' },
            { name: 'Old Manali', description: 'Quaint village feel with cafes and river views.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.5', url: '#' },
            { name: 'Jogini Waterfalls', description: 'A scenic hike leading to a beautiful waterfall.', openingTime: '06:00 AM', closingTime: '06:00 PM', rating: '4.6', url: '#' }
        ]
    },
    'Shimla': {
        description: 'The former British summer capital, Shimla is known for its neo-Gothic architecture and bustling Mall Road.',
        bestTime: 'October to June',
        elevation: '2,276m',
        highlights: ['Heritage Buildings', 'Ridge Walks', 'Toy Train', 'Shopping'],
        topSpots: [
            { name: 'Mall Road', description: 'Bustling heart of Shimla with shops, cafes, and restaurants.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.5', url: '#' },
            { name: 'Jakhoo Temple', description: 'Hilltop temple dedicated to Lord Hanuman with a giant statue.', openingTime: '05:00 AM', closingTime: '09:00 PM', rating: '4.6', url: '#' },
            { name: 'Christ Church', description: 'One of the oldest churches in North India, an architectural icon.', openingTime: '08:00 AM', closingTime: '06:00 PM', rating: '4.5', url: '#' },
            { name: 'Kufri', description: 'A small hill station near Shimla famous for trekking and skiing.', openingTime: '09:00 AM', closingTime: '06:00 PM', rating: '4.2', url: '#' },
            { name: 'The Ridge', description: 'Open space in the center of Shimla with cultural value.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.6', url: '#' }
        ]
    },
    'Mussoorie': {
        description: 'The "Queen of the Hills", Mussoorie offers stunning views of the Shivalik range and the Doon Valley.',
        bestTime: 'April to June, September to November',
        elevation: '2,005m',
        highlights: ['Waterfall Baths', 'Viewpoints', 'Colonial History', 'Mal'],
        topSpots: [
            { name: 'Kempty Falls', description: 'Popular waterfall where visitors can enjoy a refreshing bath.', openingTime: '08:00 AM', closingTime: '06:00 PM', rating: '4.1', url: '#' },
            { name: 'Gun Hill', description: 'Second highest peak in Mussoorie accessible by ropeway.', openingTime: '10:00 AM', closingTime: '06:00 PM', rating: '4.2', url: '#' },
            { name: 'Lal Tibba', description: 'The highest point in Mussoorie offering a panoramic view.', openingTime: '06:00 AM', closingTime: '06:00 PM', rating: '4.5', url: '#' },
            { name: 'Camel’s Back Road', description: 'A peaceful nature walk named after its natural rock formation.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.4', url: '#' },
            { name: 'Company Garden', description: 'Beautifully manicured garden with a small artificial lake.', openingTime: '09:00 AM', closingTime: '06:00 PM', rating: '4.1', url: '#' }
        ]
    },
    'Thiruvananthapuram': {
        description: 'The capital of Kerala, known for its mix of architectural styles, cultural heritage, and pristine beaches.',
        bestTime: 'October to February',
        elevation: '10m',
        highlights: ['Rich Temples', 'Beach Resorts', 'Museums', 'Palaces'],
        topSpots: [
            { name: 'Padmanabhaswamy Temple', description: 'Iconic temple known for its architectural grandeur and mystery.', openingTime: '03:30 AM', closingTime: '07:30 PM', rating: '4.8', url: '#' },
            { name: 'Kovalam Beach', description: 'A globally famous crescent beach perfect for surfing.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.5', url: '#' },
            { name: 'Poovar Island', description: 'Scenic island where lake, river, and sea meet.', openingTime: '09:00 AM', closingTime: '05:00 PM', rating: '4.6', url: '#' },
            { name: 'Napier Museum', description: 'Art and Natural History museum in a grand structure.', openingTime: '10:00 AM', closingTime: '05:00 PM', rating: '4.4', url: '#' },
            { name: 'Varkala Cliff', description: 'Unique cliffs adjacent to the Arabian Sea.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.7', url: '#' }
        ]
    },
    'Mumbai': {
        description: 'The "City of Dreams", Mumbai is a vibrant metropolis, financial capital, and home to Bollywood.',
        bestTime: 'October to March',
        elevation: '14m',
        highlights: ['Colonial Landmarks', 'Street Food', 'Ocean Views', 'Bollywood'],
        topSpots: [
            { name: 'Gateway of India', description: 'Iconic arch monument built during the British Raj.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.7', url: '#' },
            { name: 'Marine Drive', description: 'Arc-shaped boulevard by the sea, known as Queen\'s Necklace.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.7', url: '#' },
            { name: 'Elephanta Caves', description: 'UNESCO site with rock-cut temples dedicated to Shiva.', openingTime: '09:00 AM', closingTime: '05:00 PM', rating: '4.5', url: '#' },
            { name: 'Chhatrapati Shivaji Terminus', description: 'Historic railway station and a UNESCO World Heritage Site.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.7', url: '#' },
            { name: 'Juhu Beach', description: 'Wide sandy beach popular with locals and tourists alike.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.2', url: '#' }
        ]
    },
    'Chennai': {
        description: 'The "Gateway to South India", Chennai is known for its cultural traditions, classical music, and long beaches.',
        bestTime: 'November to February',
        elevation: '6m',
        highlights: ['Classical Music', 'Temples', 'Churches', 'Longest Beach'],
        topSpots: [
            { name: 'Marina Beach', description: 'One of the longest urban beaches in the world.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.4', url: '#' },
            { name: 'Kapaleeshwarar Temple', description: 'Ancient spiritual center with vibrant Dravidian architecture.', openingTime: '05:00 AM', closingTime: '09:30 PM', rating: '4.7', url: '#' },
            { name: 'Fort St George', description: 'Historical fort and the first British fortress in India.', openingTime: '09:00 AM', closingTime: '05:00 PM', rating: '4.3', url: '#' },
            { name: 'San Thome Basilica', description: 'Cathedral built over the tomb of St. Thomas the Apostle.', openingTime: '06:00 AM', closingTime: '09:00 PM', rating: '4.6', url: '#' },
            { name: 'Mahabalipuram Shore Temple', description: 'Ancient rock-cut structural temple with oceanic backdrop.', openingTime: '06:00 AM', closingTime: '06:00 PM', rating: '4.7', url: '#' }
        ]
    },
    'Kochi': {
        description: 'Kochi or Cochin is a historic port city where European influences blend with traditional Kerala culture.',
        bestTime: 'October to February',
        elevation: '2m',
        highlights: ['Backwaters', 'Heritage Walks', 'Art Cafes', 'Fish Markets'],
        topSpots: [
            { name: 'Chinese Fishing Nets', description: 'Fixed land installations used for fishing, a Kochi symbol.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.4', url: '#' },
            { name: 'Mattancherry Palace', description: 'Also known as the Dutch Palace, with beautiful murals.', openingTime: '10:00 AM', closingTime: '05:00 PM', rating: '4.4', url: '#' },
            { name: 'St. Francis Church', description: 'One of the oldest European churches in India.', openingTime: '07:00 AM', closingTime: '06:00 PM', rating: '4.5', url: '#' },
            { name: 'Jew Town', description: 'Center of spice trade with antique shops and a synagogue.', openingTime: '10:00 AM', closingTime: '07:00 PM', rating: '4.5', url: '#' },
            { name: 'Cherai Beach', description: 'Peaceful beach known for calmness and shallow waters.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.6', url: '#' }
        ]
    },
    'Chamoli': {
        description: 'Chamoli is the second largest district of Uttarakhand, known for its temples, trekking trails, and the world-famous Valley of Flowers.',
        bestTime: 'May to June, September to October',
        elevation: '2,502m',
        highlights: ['Valley of Flowers', 'Hemkund Sahib', 'Trekking', 'Pilgrimage'],
        topSpots: [
            { name: 'Valley of Flowers', description: 'A UNESCO World Heritage site known for its meadows of endemic alpine flowers.', openingTime: '07:00 AM', closingTime: '05:00 PM', rating: '4.8', url: '#' },
            { name: 'Badrinath Temple', description: 'One of the Char Dham pilgrimage sites dedicated to Lord Vishnu.', openingTime: '04:30 AM', closingTime: '09:00 PM', rating: '4.9', url: '#' },
            { name: 'Auli', description: 'A premier ski destination with panoramic views of the Himalayas.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.7', url: '#' }
        ]
    },
    'Pithoragarh': {
        description: 'Pithoragarh is the easternmost district of Uttarakhand, often called "Little Kashmir" for its scenic beauty.',
        bestTime: 'April to June, September to November',
        elevation: '1,645m',
        highlights: ['Panchachuli Peaks', 'Pithoragarh Fort', 'Lakes', 'Valley Views'],
        topSpots: [
            { name: 'Pithoragarh Fort', description: 'A historic fort offering a panoramic view of the valley.', openingTime: '09:00 AM', closingTime: '06:00 PM', rating: '4.2', url: '#' },
            { name: 'Chandak Hill', description: 'A beautiful hilltop offering stunning views of the Himalayas.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.3', url: '#' }
        ]
    },
    'Kedarnath': {
        description: 'Kedarnath is a sacred town in the Himalayas, home to the ancient Kedarnath Temple, one of the holiest shrines in Hinduism.',
        bestTime: 'May to June, September to October',
        elevation: '3,583m',
        highlights: ['Ancient Temple', 'Glacial Views', 'Spirituality', 'Trekking'],
        topSpots: [
            { name: 'Kedarnath Temple', description: 'A revered Shiva temple with extreme spiritual significance.', openingTime: '04:00 AM', closingTime: '09:00 PM', rating: '5.0', url: '#' },
            { name: 'Vasuki Tal', description: 'A high-altitude glacial lake with crystal clear waters.', openingTime: '07:00 AM', closingTime: '04:00 PM', rating: '4.8', url: '#' }
        ]
    },
    'Varanasi': {
        description: 'One of the oldest continuously inhabited cities in the world, Varanasi is the spiritual capital of India.',
        bestTime: 'October to March',
        elevation: '81m',
        highlights: ['Ganga Aarti', 'Ancient Ghats', 'Temples', 'Silk Weaving'],
        topSpots: [
            { name: 'Dashashwamedh Ghat', description: 'The main and most spectacular ghat on the Ganges.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.8', url: '#' },
            { name: 'Kashi Vishwanath Temple', description: 'One of the most famous Hindu temples dedicated to Lord Shiva.', openingTime: '03:00 AM', closingTime: '11:00 PM', rating: '4.7', url: '#' }
        ]
    },
    'Udaipur': {
        description: 'Udaipur, the "City of Lakes", is a historic capital of the Mewar kingdom, known for its grand palaces and lakes.',
        bestTime: 'September to March',
        elevation: '423m',
        highlights: ['Lake Pichola', 'City Palace', 'Heritage Hotels', 'Royal History'],
        topSpots: [
            { name: 'City Palace', description: 'A grand complex of palaces overlooking Lake Pichola.', openingTime: '09:30 AM', closingTime: '05:30 PM', rating: '4.6', url: '#' },
            { name: 'Lake Pichola', description: 'An artificial freshwater lake with island palaces.', openingTime: '09:00 AM', closingTime: '06:00 PM', rating: '4.7', url: '#' }
        ]
    },
    'Panaji': {
        description: 'The capital of Goa, Panaji is known for its Portuguese colonial architecture, riverside walks, and relaxed vibe.',
        bestTime: 'October to April',
        elevation: '7m',
        highlights: ['Colonial Architecture', 'Riverside', 'Casinos', 'Art Galleries'],
        topSpots: [
            { name: 'Our Lady of the Immaculate Conception Church', description: 'A beautiful white baroque church in the heart of the city.', openingTime: '09:00 AM', closingTime: '05:00 PM', rating: '4.5', url: '#' },
            { name: 'Fontainhas', description: 'The Latin Quarter of Panaji with colorful old houses.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.6', url: '#' }
        ]
    },
    'Kolkata': {
        description: 'The "City of Joy", Kolkata is the cultural capital of India, known for its grand colonial architecture and festivals.',
        bestTime: 'October to March',
        elevation: '9m',
        highlights: ['Victoria Memorial', 'Howrah Bridge', 'Street Food', 'Arts'],
        topSpots: [
            { name: 'Victoria Memorial', description: 'A massive white marble building dedicated to Queen Victoria.', openingTime: '10:00 AM', closingTime: '05:00 PM', rating: '4.6', url: '#' },
            { name: 'Howrah Bridge', description: 'An iconic cantilever bridge over the Hooghly River.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.7', url: '#' }
        ]
    },
    'Bhubaneswar': {
        description: 'The "Temple City of India", Bhubaneswar is an ancient city known for its hundreds of Hindu temples.',
        bestTime: 'October to March',
        elevation: '45m',
        highlights: ['Ancient Temples', 'Caves', 'Zoo', 'Odissi Dance'],
        topSpots: [
            { name: 'Lingaraj Temple', description: 'The largest and most prominent temple in Bhubaneswar.', openingTime: '05:00 AM', closingTime: '09:00 PM', rating: '4.7', url: '#' },
            { name: 'Udayagiri and Khandagiri Caves', description: 'Partly natural and partly artificial caves of archaeological importance.', openingTime: '09:00 AM', closingTime: '06:00 PM', rating: '4.4', url: '#' }
        ]
    },
    'Puri': {
        description: 'Puri is a coastal city on the Bay of Bengal, famous for the Jagannath Temple and its golden beaches.',
        bestTime: 'October to March',
        elevation: '0m',
        highlights: ['Jagannath Temple', 'Golden Beach', 'Rath Yatra', 'Sand Art'],
        topSpots: [
            { name: 'Jagannath Temple', description: 'An important Hindu temple dedicated to Jagannath.', openingTime: '05:00 AM', closingTime: '11:00 PM', rating: '4.8', url: '#' },
            { name: 'Puri Beach', description: 'A popular beach destination with golden sands.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.4', url: '#' }
        ]
    },
    'Patna': {
        description: 'One of the oldest continuously inhabited places in the world, Patna is the capital of Bihar and a historical hub.',
        bestTime: 'October to March',
        elevation: '53m',
        highlights: ['Historical Sites', 'Museums', 'Ganges River', 'Pilgrimage'],
        topSpots: [
            { name: 'Golghar', description: 'A massive granary with a panoramic view of the city and the Ganges.', openingTime: '10:00 AM', closingTime: '05:00 PM', rating: '4.1', url: '#' },
            { name: 'Patna Museum', description: 'Showcasing artifacts from the Mauryan and Gupta periods.', openingTime: '10:30 AM', closingTime: '04:30 PM', rating: '4.2', url: '#' }
        ]
    },
    'Ranchi': {
        description: 'The "City of Waterfalls", Ranchi is the capital of Jharkhand and is surrounded by hills and forests.',
        bestTime: 'September to March',
        elevation: '651m',
        highlights: ['Waterfalls', 'Rock Garden', 'Temples', 'Hills'],
        topSpots: [
            { name: 'Hundru Falls', description: 'One of the most famous waterfalls in Jharkhand.', openingTime: '08:00 AM', closingTime: '05:00 PM', rating: '4.5', url: '#' },
            { name: 'Rock Garden', description: 'A beautiful garden carved out of rocks with sculptures.', openingTime: '09:00 AM', closingTime: '07:00 PM', rating: '4.3', url: '#' }
        ]
    },
    'Visakhapatnam': {
        description: 'The "Jewel of the East Coast", Visakhapatnam is a port city known for its beaches, hillocks, and submarine museum.',
        bestTime: 'October to March',
        elevation: '900m',
        highlights: ['Beaches', 'Submarine Museum', 'Hill Views', 'Port city'],
        topSpots: [
            { name: 'Rishikonda Beach', description: 'A scenic beach known for its golden sands and water sports.', openingTime: '00:00 AM', closingTime: '11:59 PM', rating: '4.5', url: '#' },
            { name: 'INS Kursura Submarine Museum', description: 'A real submarine converted into a museum on the beach.', openingTime: '02:00 PM', closingTime: '08:00 PM', rating: '4.8', url: '#' }
        ]
    }
};

const GENERIC_DATA = {
    description: 'A beautiful destination known for its stunning landscapes, local culture, and tourist attractions.',
    bestTime: 'October to March',
    elevation: 'Variable',
    highlights: ['Natural Beauty', 'Local Culture', 'Adventure', 'Heritage'],
    topSpots: [
        { name: 'Scenic Point', description: 'A breathtaking spot offering panoramic views.', openingTime: '06:00 AM', closingTime: '06:00 PM', rating: '4.5', url: '#' },
        { name: 'Cultural Site', description: 'Experience the local heritage and traditions.', openingTime: '09:00 AM', closingTime: '05:00 PM', rating: '4.4', url: '#' },
        { name: 'Local Market', description: 'Perfect for shopping for local crafts and food.', openingTime: '10:00 AM', closingTime: '08:00 PM', rating: '4.3', url: '#' }
    ]
};

export async function fetchPlaceInfo(place) {
    return new Promise((resolve) => {
        // Normalize "Nilgiris (Ooty)" to "Nilgiris" for lookup if necessary
        const lookUpKey = place === 'Nilgiris' || place === 'Ooty' ? 'Nilgiris' : place;
        const rawData = PLACE_DATA[lookUpKey] || {
            ...GENERIC_DATA,
            description: `${place} is a premier destination known for its ${GENERIC_DATA.description.toLowerCase()}`
        };

        // Inject Google Maps search URLs for spots if they are '#'
        const data = {
            ...rawData,
            topSpots: rawData.topSpots.map(spot => ({
                ...spot,
                url: spot.url === '#'
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' ' + place)}`
                    : spot.url
            }))
        };

        setTimeout(() => resolve(data), 300);
    });
}
