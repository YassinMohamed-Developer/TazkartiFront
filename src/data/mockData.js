export const MOCK_MATCHES = [
  {
    id: "match-1",
    title: "Al Ahly vs Zamalek",
    league: "Egyptian Premier League",
    round: "Matchday 27 - Cairo Derby",
    homeTeam: {
      name: "Al Ahly SC",
      shortName: "AHL",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Al_Ahly_SC_logo.svg/1200px-Al_Ahly_SC_logo.svg.png",
      color: "#b90015"
    },
    awayTeam: {
      name: "Zamalek SC",
      shortName: "ZAM",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/ZamalekSC.png/1200px-ZamalekSC.png",
      color: "#ffffff"
    },
    date: "15 Oct 2026",
    time: "20:00 CLT",
    venue: "Cairo International Stadium",
    city: "Cairo, Egypt",
    gateOpen: "16:00 CLT",
    availability: "High Availability",
    availabilityPercent: 85,
    minPrice: 150,
    bannerImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
    categories: [
      { id: "cat-1", name: "Category 1 - Block 102 (Pitch View)", price: 450, color: "#e21e26", available: true },
      { id: "cat-2", name: "Category 2 - Block 204 (Upper Tier)", price: 300, color: "#00618d", available: true },
      { id: "cat-3", name: "Category 3 - Block 301 (Curva)", price: 150, color: "#1DA95E", available: true },
      { id: "cat-vip", name: "VIP Royal Box & Hospitality", price: 1500, color: "#AF7928", available: true },
    ]
  },
  {
    id: "match-2",
    title: "Egypt vs Senegal",
    league: "FIFA World Cup Qualifiers",
    round: "Final Decider",
    homeTeam: {
      name: "Egypt",
      shortName: "EGY",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/Egypt_national_football_team_badge.png/220px-Egypt_national_football_team_badge.png",
      color: "#b90015"
    },
    awayTeam: {
      name: "Senegal",
      shortName: "SEN",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Senegal_FA.svg/200px-Senegal_FA.svg.png",
      color: "#1DA95E"
    },
    date: "22 Nov 2026",
    time: "21:00 CLT",
    venue: "New Administrative Capital Stadium",
    city: "New Cairo, Egypt",
    gateOpen: "17:00 CLT",
    availability: "Fast Selling",
    availabilityPercent: 92,
    minPrice: 200,
    bannerImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    categories: [
      { id: "cat-1", name: "Category 1 - Lower Central", price: 600, color: "#e21e26", available: true },
      { id: "cat-2", name: "Category 2 - Mid Tier", price: 350, color: "#00618d", available: true },
      { id: "cat-3", name: "Category 3 - Goal End", price: 200, color: "#1DA95E", available: true },
      { id: "cat-vip", name: "VIP Presidential Lounge", price: 2500, color: "#AF7928", available: true },
    ]
  },
  {
    id: "match-3",
    title: "Pyramids FC vs Modern Sport",
    league: "Egyptian Premier League",
    round: "Matchday 28",
    homeTeam: {
      name: "Pyramids FC",
      shortName: "PYR",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/ee/Pyramids_FC_logo.svg/1200px-Pyramids_FC_logo.svg.png",
      color: "#00618d"
    },
    awayTeam: {
      name: "Modern Sport FC",
      shortName: "MOD",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Future_FC_logo.png/220px-Future_FC_logo.png",
      color: "#e21e26"
    },
    date: "28 Oct 2026",
    time: "19:00 CLT",
    venue: "30 June Stadium",
    city: "Cairo, Egypt",
    gateOpen: "16:30 CLT",
    availability: "Available",
    availabilityPercent: 60,
    minPrice: 100,
    bannerImage: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
    categories: [
      { id: "cat-1", name: "Category 1 - Main Stand", price: 300, color: "#e21e26", available: true },
      { id: "cat-2", name: "Category 2 - Side Stands", price: 200, color: "#00618d", available: true },
      { id: "cat-3", name: "Category 3 - Fan End", price: 100, color: "#1DA95E", available: true }
    ]
  },
  {
    id: "match-4",
    title: "Al Ahly SC vs Mamelodi Sundowns",
    league: "CAF Champions League",
    round: "Semi-Final First Leg",
    homeTeam: {
      name: "Al Ahly SC",
      shortName: "AHL",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Al_Ahly_SC_logo.svg/1200px-Al_Ahly_SC_logo.svg.png",
      color: "#b90015"
    },
    awayTeam: {
      name: "Mamelodi Sundowns",
      shortName: "SUN",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Mamelodi_Sundowns_logo.svg/1200px-Mamelodi_Sundowns_logo.svg.png",
      color: "#AF7928"
    },
    date: "05 Nov 2026",
    time: "21:00 CLT",
    venue: "Cairo International Stadium",
    city: "Cairo, Egypt",
    gateOpen: "16:00 CLT",
    availability: "Almost Full",
    availabilityPercent: 96,
    minPrice: 175,
    bannerImage: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1200&q=80",
    categories: [
      { id: "cat-1", name: "Category 1 - VIP & Central", price: 500, color: "#e21e26", available: true },
      { id: "cat-2", name: "Category 2 - Upper Center", price: 300, color: "#00618d", available: true },
      { id: "cat-3", name: "Category 3 - Ultras Curve", price: 175, color: "#1DA95E", available: true }
    ]
  },
  {
    id: "match-5",
    title: "Al Ittihad Alexandria vs Ismaily SC",
    league: "Egyptian Premier League",
    round: "Matchday 29 - Coast vs Canal",
    homeTeam: {
      name: "Al Ittihad Alex",
      shortName: "ITH",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/83/Al_Ittihad_Alexandria_Club_logo.png/220px-Al_Ittihad_Alexandria_Club_logo.png",
      color: "#1DA95E"
    },
    awayTeam: {
      name: "Ismaily SC",
      shortName: "ISM",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/Ismaily_SC_logo.png/220px-Ismaily_SC_logo.png",
      color: "#AF7928"
    },
    date: "12 Nov 2026",
    time: "17:30 CLT",
    venue: "Alexandria Stadium",
    city: "Alexandria, Egypt",
    gateOpen: "14:30 CLT",
    availability: "Available",
    availabilityPercent: 70,
    minPrice: 120,
    bannerImage: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80",
    categories: [
      { id: "cat-1", name: "Category 1 - Main Cabin", price: 350, color: "#e21e26", available: true },
      { id: "cat-2", name: "Category 2 - Second Grade", price: 200, color: "#00618d", available: true },
      { id: "cat-3", name: "Category 3 - Third Grade", price: 120, color: "#1DA95E", available: true }
    ]
  }
];

export const MOCK_EVENTS = [
  {
    id: "event-1",
    title: "Amr Diab Live at New Alamein Arena",
    category: "Music & Concerts",
    tag: "Trending",
    artist: "Amr Diab (El Hadaba)",
    date: "20 Aug 2026",
    time: "22:00 CLT",
    venue: "New Alamein Arena",
    city: "New Alamein, Egypt",
    minPrice: 750,
    bannerImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    description: "Experience the biggest concert of the Mediterranean summer featuring Egypt's megastar Amr Diab with a world-class light and laser show.",
    tiers: [
      { id: "tier-regular", name: "Regular Standing Area", price: 750, perks: ["General Admission Access", "Food & Beverage Village Access"] },
      { id: "tier-fanpit", name: "Fan Pit (Front of Stage)", price: 1500, perks: ["Stage-Front Access", "Dedicated Fast-Track Entrance", "Exclusive Fan Badge"] },
      { id: "tier-vip", name: "VIP High Tables & Lounge", price: 3500, perks: ["Raised VIP Platform", "Complimentary Gourmet Catering", "Valet Parking", "VIP Restrooms"] },
      { id: "tier-royal", name: "Royal Lounges (Min 6 Pax)", price: 8000, perks: ["Private Luxury Booth", "Dedicated Butler Service", "Backstage Lounge Access"] }
    ]
  },
  {
    id: "event-2",
    title: "Omar Khairat Musical Symphony",
    category: "Classical & Orchestra",
    tag: "High Demand",
    artist: "Maestro Omar Khairat",
    date: "10 Sep 2026",
    time: "20:30 CLT",
    venue: "Grand Egyptian Museum (GEM)",
    city: "Giza, Egypt",
    minPrice: 600,
    bannerImage: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
    description: "An enchanting night amidst the ancient artifacts with Maestro Omar Khairat and the Cairo Symphony Orchestra.",
    tiers: [
      { id: "tier-bronze", name: "Bronze Seating", price: 600, perks: ["Upper Hall Seating", "GEM Evening Access"] },
      { id: "tier-silver", name: "Silver Seating", price: 1200, perks: ["Mid Hall Seating", "GEM Exhibition Tour Included"] },
      { id: "tier-gold", name: "Gold Royal Seating", price: 2200, perks: ["Front Rows Orchestra Seating", "Cocktail Reception", "Signed Souvenir Program"] }
    ]
  },
  {
    id: "event-3",
    title: "Cairokee - Empire 5 Arena Tour",
    category: "Rock & Indie",
    tag: "Selling Fast",
    artist: "Cairokee",
    date: "03 Oct 2026",
    time: "21:00 CLT",
    venue: "Zayed Central Park Arena",
    city: "Sheikh Zayed, Giza",
    minPrice: 500,
    bannerImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
    description: "Cairokee returns with their massive 'Empire 5' concert series featuring all their iconic anthems and brand-new tracks.",
    tiers: [
      { id: "tier-regular", name: "General Admission", price: 500, perks: ["Entry to Festival Grounds"] },
      { id: "tier-fanpit", name: "Golden Circle Wave", price: 1000, perks: ["Front of Stage Wave Access", "Festival Wristband"] },
      { id: "tier-vip", name: "VIP Lounge Deck", price: 2400, perks: ["Elevated Lounge", "Open Soft Drink Bar", "Fast Track Gate"] }
    ]
  },
  {
    id: "event-4",
    title: "The Elite Stand-Up Comedy Special",
    category: "Comedy & Theater",
    tag: "Limited Seats",
    artist: "The Elite Comedy Crew",
    date: "18 Sep 2026",
    time: "20:00 CLT",
    venue: "The Marquee - Cairo Festival City",
    city: "New Cairo, Egypt",
    minPrice: 350,
    bannerImage: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80",
    description: "Egypt's top standup comedy group with a 2-hour non-stop laughter show.",
    tiers: [
      { id: "tier-balcony", name: "Balcony Seating", price: 350, perks: ["Standard Theater View"] },
      { id: "tier-stalls", name: "Orchestra Stalls", price: 650, perks: ["Ground Floor Central Seating"] },
      { id: "tier-vip", name: "VIP Front Row", price: 1100, perks: ["First 3 Rows", "Meet & Greet After Show"] }
    ]
  }
];

export const MOCK_USER = {
  fullName: "Ahmed Hassan",
  fanId: "TZK-2026-8942",
  nationalId: "29012345678901",
  nationality: "Egyptian",
  dob: "1994-08-14",
  gender: "Male",
  phone: "+20 100 123 4567",
  email: "ahmed.hassan@example.com",
  governorate: "Cairo",
  tier: "Gold Tier Fan",
  attendancePoints: 4250,
  nextTierPointsNeeded: 3,
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfEi-JMbLcmZW_6rD67Pyr-uhdmKzgBTpCCFpqq5h4QJY0PnvkWWa8jUB1j9seQpGEWThxgEoTTG57SifuNQ__G7RbtqgJW5ck3gvsE3XkOldtTjl71rPOz5kUvhOSyvPOt_hS8GaYCvzTQUfukDGcQZ5toXnbC4pIfsmm1EAX5GojaZ_5Xv9lV0yDtJWRAEffhLeu-wAZNQrSr7Ynj2OmoruglCuLwkqBSDlsM5gWHVYTx95CJvtqXg",
  qrCode: "https://lh3.googleusercontent.com/aida-public/AB6AXuBer5HRCfR9UYy3WLm51yAkpxZEfvYzGP5J27c1CJMSJ7S0LLcbfSYef9s-yCbtOqiB1eG3R_yzDhpV4NX7N4hMJ3Q68SV6w_IZ_KD0lAfimhgv47pQk_8Jo2p7vyWugSEYnVQUd4Bijl6tDUfsyJt4YljoOQICaCcEfiDeQQtx4aWrg9Wd5V6k4c3fBEorNqG9CAMqFrcxCWJQY_uUAuV0o3lv_wviFWDu8xfQG9gPUitQd9jWeZaLkw",
  upcomingMatch: {
    title: "Cairo Derby Final",
    match: "Al Ahly vs Zamalek",
    date: "15 Oct 2026",
    time: "20:00",
    venue: "Cairo International Stadium",
    block: "Block A - Cat 1",
    seat: "Row B, Seat 14",
    gate: "Gate 4 (North)",
    soldPercent: 85
  }
};
