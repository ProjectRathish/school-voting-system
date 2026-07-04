export interface ElectionSymbol {
  id: string;
  name: string;
  iconName: string;
  colorStart: string;
  colorEnd: string;
}

export const ELECTION_SYMBOLS: ElectionSymbol[] = [
  // Nature & Weather
  { id: "101", name: "Leaf", iconName: "eco", colorStart: "#2e7d32", colorEnd: "#4caf50" },
  { id: "102", name: "Sun", iconName: "light_mode", colorStart: "#f57c00", colorEnd: "#ffeb3b" },
  { id: "103", name: "Flower", iconName: "local_florist", colorStart: "#c2185b", colorEnd: "#ff4081" },
  { id: "104", name: "Tree", iconName: "nature", colorStart: "#1b5e20", colorEnd: "#4caf50" },
  { id: "105", name: "Forest", iconName: "forest", colorStart: "#1b5e20", colorEnd: "#81c784" },
  { id: "106", name: "Cloud", iconName: "cloud", colorStart: "#1976d2", colorEnd: "#90caf9" },
  { id: "107", name: "Water Drop", iconName: "water_drop", colorStart: "#0288d1", colorEnd: "#29b6f6" },
  { id: "108", name: "Flame", iconName: "local_fire_department", colorStart: "#d84315", colorEnd: "#ff8f00" },
  { id: "109", name: "Snowflake", iconName: "ac_unit", colorStart: "#0097a7", colorEnd: "#80deea" },

  // Objects & Tools
  { id: "201", name: "Book", iconName: "menu_book", colorStart: "#4a148c", colorEnd: "#ab47bc" },
  { id: "202", name: "Pen", iconName: "edit", colorStart: "#0d47a1", colorEnd: "#29b6f6" },
  { id: "203", name: "Lightbulb", iconName: "lightbulb", colorStart: "#ff8f00", colorEnd: "#ffd54f" },
  { id: "204", name: "Key", iconName: "key", colorStart: "#f57f17", colorEnd: "#ffeb3b" },
  { id: "205", name: "Lock", iconName: "lock", colorStart: "#37474f", colorEnd: "#90a4ae" },
  { id: "206", name: "Umbrella", iconName: "umbrella", colorStart: "#c62828", colorEnd: "#ef5350" },
  { id: "207", name: "Clock", iconName: "schedule", colorStart: "#1565c0", colorEnd: "#64b5f6" },
  { id: "208", name: "Bell", iconName: "notifications_active", colorStart: "#ef6c00", colorEnd: "#ffd54f" },
  { id: "209", name: "Anchor", iconName: "anchor", colorStart: "#002171", colorEnd: "#1e88e5" },
  { id: "210", name: "Flag", iconName: "flag", colorStart: "#d50000", colorEnd: "#ff5252" },
  { id: "211", name: "Map", iconName: "map", colorStart: "#2e7d32", colorEnd: "#81c784" },
  { id: "212", name: "Globe", iconName: "public", colorStart: "#0d47a1", colorEnd: "#00e5ff" },
  { id: "213", name: "Shield", iconName: "shield", colorStart: "#0f2027", colorEnd: "#203a43" },
  { id: "214", name: "Gavel", iconName: "gavel", colorStart: "#4e342e", colorEnd: "#8d6e63" },
  { id: "215", name: "Wrench", iconName: "build", colorStart: "#424242", colorEnd: "#bdbdbd" },
  { id: "216", name: "Hammer", iconName: "construction", colorStart: "#e65100", colorEnd: "#ffb74d" },
  { id: "217", name: "Scissors", iconName: "content_cut", colorStart: "#b71c1c", colorEnd: "#ff5252" },
  { id: "218", name: "Microscope", iconName: "biotech", colorStart: "#006064", colorEnd: "#4dd0e1" },
  { id: "219", name: "Calculator", iconName: "calculate", colorStart: "#212121", colorEnd: "#757575" },
  { id: "220", name: "Scale / Balance", iconName: "balance", colorStart: "#ff8f00", colorEnd: "#ffe082" },
  { id: "221", name: "Paint Palette", iconName: "palette", colorStart: "#8e24aa", colorEnd: "#ff4081" },
  { id: "222", name: "Paint Brush", iconName: "brush", colorStart: "#5d4037", colorEnd: "#00bcd4" },
  { id: "223", name: "Spectacles", iconName: "eyeglasses", colorStart: "#212121", colorEnd: "#616161" },
  { id: "224", name: "Eye", iconName: "visibility", colorStart: "#006064", colorEnd: "#00e5ff" },

  // Sports & Music
  { id: "301", name: "Football", iconName: "sports_soccer", colorStart: "#2e7d32", colorEnd: "#4caf50" },
  { id: "302", name: "Cricket Bat", iconName: "sports_cricket", colorStart: "#8d6e63", colorEnd: "#d7ccc8" },
  { id: "303", name: "Tennis Racket", iconName: "sports_tennis", colorStart: "#aeea00", colorEnd: "#f4ff81" },
  { id: "304", name: "Basketball", iconName: "sports_basketball", colorStart: "#e65100", colorEnd: "#ffab40" },
  { id: "305", name: "Trophy", iconName: "emoji_events", colorStart: "#ff6f00", colorEnd: "#ffd54f" },
  { id: "306", name: "Medal", iconName: "military_tech", colorStart: "#0d47a1", colorEnd: "#ffd54f" },
  { id: "307", name: "Whistle", iconName: "sports", colorStart: "#455a64", colorEnd: "#cfd8dc" },
  { id: "308", name: "Music Note", iconName: "music_note", colorStart: "#6a1b9a", colorEnd: "#e040fb" },
  { id: "309", name: "Mic / Microphone", iconName: "mic", colorStart: "#212121", colorEnd: "#b0bec5" },
  { id: "310", name: "Headphones", iconName: "headphones", colorStart: "#e65100", colorEnd: "#ff3d00" },
  { id: "311", name: "Piano", iconName: "piano", colorStart: "#000000", colorEnd: "#424242" },
  { id: "312", name: "Guitar / Lute", iconName: "music_video", colorStart: "#bf360c", colorEnd: "#ffb74d" },

  // Transportation
  { id: "401", name: "Bicycle", iconName: "pedal_bike", colorStart: "#d50000", colorEnd: "#ff5252" },
  { id: "402", name: "Scooter", iconName: "electric_scooter", colorStart: "#00c853", colorEnd: "#b2ff59" },
  { id: "403", name: "Car", iconName: "directions_car", colorStart: "#0d47a1", colorEnd: "#1565c0" },
  { id: "404", name: "Bus", iconName: "directions_bus", colorStart: "#ff8f00", colorEnd: "#ffd54f" },
  { id: "405", name: "Truck", iconName: "local_shipping", colorStart: "#4e342e", colorEnd: "#a1887f" },
  { id: "406", name: "Aeroplane", iconName: "flight", colorStart: "#1565c0", colorEnd: "#00b0ff" },
  { id: "407", name: "Rocket", iconName: "rocket", colorStart: "#b71c1c", colorEnd: "#ff9100" },
  { id: "408", name: "Sailing Boat", iconName: "sailing", colorStart: "#006064", colorEnd: "#00e5ff" },
  { id: "409", name: "Jeep", iconName: "local_taxi", colorStart: "#33691e", colorEnd: "#8bc34a" },

  // Buildings & Living
  { id: "501", name: "House", iconName: "home", colorStart: "#5d4037", colorEnd: "#d7ccc8" },
  { id: "502", name: "Store", iconName: "store", colorStart: "#004d40", colorEnd: "#4db6ac" },
  { id: "503", name: "School", iconName: "school", colorStart: "#880e4f", colorEnd: "#ff4081" },
  { id: "504", name: "Graduation Cap", iconName: "school", colorStart: "#0d47a1", colorEnd: "#007afc" },
  { id: "505", name: "Hospital / Clinic", iconName: "local_hospital", colorStart: "#00796b", colorEnd: "#4db6ac" },
  { id: "506", name: "Chair", iconName: "chair", colorStart: "#795548", colorEnd: "#ffe0b2" },
  { id: "507", name: "Stethoscope", iconName: "medical_services", colorStart: "#006064", colorEnd: "#00acc1" },

  // Daily Items & Icons
  { id: "601", name: "Camera", iconName: "photo_camera", colorStart: "#263238", colorEnd: "#78909c" },
  { id: "602", name: "Laptop", iconName: "laptop", colorStart: "#37474f", colorEnd: "#eceff1" },
  { id: "603", name: "Smartphone", iconName: "smartphone", colorStart: "#4a148c", colorEnd: "#ea80fc" },
  { id: "604", name: "Cup / Mug", iconName: "local_cafe", colorStart: "#4e342e", colorEnd: "#bcaaa4" },
  { id: "605", name: "Shopping Bag", iconName: "shopping_bag", colorStart: "#c2185b", colorEnd: "#ff80ab" },
  { id: "606", name: "Briefcase", iconName: "work", colorStart: "#5d4037", colorEnd: "#ffe0b2" },
  { id: "607", name: "Gift Box", iconName: "card_giftcard", colorStart: "#b71c1c", colorEnd: "#ff5252" },
  { id: "608", name: "Fastfood / Burger", iconName: "fastfood", colorStart: "#ff6f00", colorEnd: "#ffd54f" },
  { id: "609", name: "Cake", iconName: "cake", colorStart: "#ad1457", colorEnd: "#ff80ab" },
  { id: "610", name: "Balloon", iconName: "celebration", colorStart: "#0288d1", colorEnd: "#4fc3f7" },
  { id: "611", name: "Diamond", iconName: "diamond", colorStart: "#006064", colorEnd: "#80deea" },
  { id: "612", name: "Handshake", iconName: "handshake", colorStart: "#e65100", colorEnd: "#ffeb3b" },
  { id: "613", name: "Thumb Up", iconName: "thumb_up", colorStart: "#2e7d32", colorEnd: "#a5d6a7" }
];
