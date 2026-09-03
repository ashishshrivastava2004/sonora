// src/server/app.ts
import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import CryptoJS from "crypto-js";

// src/data/musicData.ts
var INITIAL_TRACKS = [
  {
    id: "track-1",
    title: "Midnight Horizon",
    artist: "Astral Echoes",
    artistId: "artist-1",
    album: "Neon Odyssey",
    albumId: "album-1",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    duration: 218,
    genre: "Synthwave / Retrowave",
    year: 2026,
    audioQuality: "HI_RES_LOSSLESS",
    formatInfo: {
      sampleRate: "192 kHz",
      bitDepth: "24-bit",
      bitrate: "9216 kbps ALAC",
      format: "Apple Lossless Audio Codec (ALAC)"
    },
    tempo: 118,
    key: "F# Minor",
    energy: 0.85,
    danceability: 0.76,
    mood: ["Atmospheric", "Driving", "Nostalgic", "Futuristic"],
    audioTheme: "synthwave",
    spatialSupport: true,
    plays: 1420800,
    liked: true,
    color: "#6366f1",
    notesDescription: "Recorded in 24-bit/192kHz analog tape emulation with analog Moog basslines and gated reverb snare drums.",
    lyrics: [
      { time: 0, text: "\u266A (Atmospheric analog synths fading in) \u266A" },
      { time: 14, text: "Chrome reflections beneath the violet rain" },
      { time: 22, text: "Speeding past the skyline, erasing all the pain" },
      { time: 30, text: "We chased the phantom signals into open night" },
      { time: 38, text: "Glowing in the halo of the dashboard light" },
      { time: 47, text: "Hold on tight to the midnight horizon", isChorus: true },
      { time: 55, text: "Where the shadows dissolve in the electric sky", isChorus: true },
      { time: 64, text: "No turning back, the city falls behind us", isChorus: true },
      { time: 73, text: "Breathing in the rhythm of a neon high", isChorus: true },
      { time: 82, text: "\u266A (Arpeggiated synth solo & analog drum fills) \u266A" },
      { time: 100, text: "Zero gravity pulling through our hands" },
      { time: 108, text: "Architects of silence in these glowing lands" },
      { time: 117, text: "When the dawn arrives we will still be free" },
      { time: 125, text: "Echoing forever in high fidelity" },
      { time: 134, text: "Hold on tight to the midnight horizon", isChorus: true },
      { time: 143, text: "Where the shadows dissolve in the electric sky", isChorus: true },
      { time: 152, text: "No turning back, the city falls behind us", isChorus: true },
      { time: 161, text: "Breathing in the rhythm of a neon high", isChorus: true },
      { time: 180, text: "\u266A (Hi-Res Spatial Audio outro with analog filter sweeps) \u266A" },
      { time: 210, text: "Midnight horizon... fading into sound." }
    ]
  },
  {
    id: "track-2",
    title: "Velvet Rain",
    artist: "Maya Lin & The Solace",
    artistId: "artist-2",
    album: "Silk & Shadows",
    albumId: "album-2",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    duration: 194,
    genre: "Neo-Soul / R&B",
    year: 2026,
    audioQuality: "DOLBY_ATMOS",
    formatInfo: {
      sampleRate: "96 kHz",
      bitDepth: "24-bit",
      bitrate: "4608 kbps Spatial",
      format: "Dolby Atmos Spatial Audio"
    },
    tempo: 84,
    key: "Eb Major",
    energy: 0.52,
    danceability: 0.68,
    mood: ["Sensual", "Smooth", "Intimate", "Warm"],
    audioTheme: "rnb",
    spatialSupport: true,
    plays: 980400,
    liked: true,
    color: "#ec4899",
    notesDescription: "Mastered for immersive 360-degree spatial sound with binaural acoustic guitar and lush Rhodes chords.",
    lyrics: [
      { time: 0, text: "\u266A (Warm Rhodes piano and gentle vinyl warmth) \u266A" },
      { time: 12, text: "Steam rises up from the quiet street below" },
      { time: 20, text: "Candlelight dancing in a slow golden glow" },
      { time: 28, text: "You whispered secrets that the thunder couldn\u2019t hide" },
      { time: 36, text: "Safe inside the sanctuary deep inside" },
      { time: 45, text: "Falling like velvet rain on glass", isChorus: true },
      { time: 54, text: "Moments we swore would never pass", isChorus: true },
      { time: 63, text: "Wrap me in silence, pull me near", isChorus: true },
      { time: 71, text: "Your heartbeat is the only sound I hear", isChorus: true },
      { time: 80, text: "\u266A (Silky bassline with acoustic fingerstyle guitar) \u266A" },
      { time: 98, text: "No rush tonight, let the tempo unwind" },
      { time: 107, text: "Leaving the weight of the world far behind" },
      { time: 116, text: "Falling like velvet rain on glass", isChorus: true },
      { time: 125, text: "Moments we swore would never pass", isChorus: true },
      { time: 135, text: "Wrap me in silence, pull me near", isChorus: true },
      { time: 145, text: "Your heartbeat is the only sound I hear", isChorus: true },
      { time: 165, text: "\u266A (Vocal harmonies in 3D surround sound) \u266A" },
      { time: 190, text: "Velvet rain... washing over me." }
    ]
  },
  {
    id: "track-3",
    title: "Cyber Drift",
    artist: "Kurogane Systems",
    artistId: "artist-3",
    album: "Sublevel 09",
    albumId: "album-3",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop",
    duration: 205,
    genre: "Cyberpunk Lo-Fi",
    year: 2025,
    audioQuality: "HI_RES_LOSSLESS",
    formatInfo: {
      sampleRate: "192 kHz",
      bitDepth: "24-bit",
      bitrate: "9216 kbps FLAC",
      format: "Direct Stream Digital FLAC"
    },
    tempo: 92,
    key: "C Minor",
    energy: 0.65,
    danceability: 0.81,
    mood: ["Focus", "Cyberpunk", "Nocturnal", "Chill"],
    audioTheme: "lofi",
    spatialSupport: true,
    plays: 231e4,
    liked: false,
    color: "#06b6d4",
    notesDescription: "Sub-bass tuned to 38Hz with tape saturation, sidechain compression, and subtle Tokyo transit ambience.",
    lyrics: [
      { time: 0, text: "\u266A (Lo-fi tape hiss and distant rain samples) \u266A" },
      { time: 16, text: "Terminal green glowing in the dark" },
      { time: 26, text: "Searching for a digital spark" },
      { time: 36, text: "Zeroes and ones flowing down the stream" },
      { time: 46, text: "Drifting away in a holographic dream" },
      { time: 57, text: "Lost in the frequency, found in the haze", isChorus: true },
      { time: 68, text: "Infinite loops in a cybernetic maze", isChorus: true },
      { time: 78, text: "Sub-bass humming like a beating heart", isChorus: true },
      { time: 89, text: "Where does the human end and machine start?", isChorus: true },
      { time: 100, text: "\u266A (Jazzy Rhodes breakdown & vinyl dust) \u266A" },
      { time: 120, text: "Sublevel nine, elevator down" },
      { time: 130, text: "Underneath the static of the sleepless town" },
      { time: 141, text: "Lost in the frequency, found in the haze", isChorus: true },
      { time: 152, text: "Infinite loops in a cybernetic maze", isChorus: true },
      { time: 165, text: "\u266A (Smooth lo-fi guitar lick with deep sub kicks) \u266A" },
      { time: 195, text: "System standby... audio buffer cleared." }
    ]
  },
  {
    id: "track-4",
    title: "Symphony of the Northern Auroras",
    artist: "Valeria Thorne & Nordic Philharmonic",
    artistId: "artist-4",
    album: "Crystalline Skies",
    albumId: "album-4",
    coverUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800&auto=format&fit=crop",
    duration: 254,
    genre: "Modern Classical / Cinematic",
    year: 2026,
    audioQuality: "HI_RES_LOSSLESS",
    formatInfo: {
      sampleRate: "192 kHz",
      bitDepth: "24-bit",
      bitrate: "9216 kbps Master",
      format: "Studio Master Uncompressed"
    },
    tempo: 72,
    key: "D Major",
    energy: 0.48,
    danceability: 0.28,
    mood: ["Ethereal", "Majestic", "Inspiring", "Peaceful"],
    audioTheme: "classical",
    spatialSupport: true,
    plays: 874e3,
    liked: true,
    color: "#10b981",
    notesDescription: "Captured live in Reykjavik Concert Hall with 48 discrete microphones for immaculate depth and dynamic range.",
    lyrics: [
      { time: 0, text: "\u266A (Subtle bowed strings and soft grand piano opening) \u266A" },
      { time: 24, text: "Over the fjords where the glacial winds blow" },
      { time: 38, text: "Ribbons of emerald illuminate the snow" },
      { time: 52, text: "Ancient celestial fires in the sky" },
      { time: 66, text: "Whispering timeless lullabies" },
      { time: 80, text: "Rise, light of the North, let the darkness awake", isChorus: true },
      { time: 96, text: "Reflections dancing on the frozen lake", isChorus: true },
      { time: 112, text: "A harmony written before time began", isChorus: true },
      { time: 128, text: "Breathed by the earth into the soul of man", isChorus: true },
      { time: 144, text: "\u266A (Full orchestral crescendo with French horns & timpani) \u266A" },
      { time: 176, text: "Crystalline skies holding silence profound" },
      { time: 192, text: "Every vibration an ocean of sound" },
      { time: 208, text: "Rise, light of the North, let the darkness awake", isChorus: true },
      { time: 224, text: "\u266A (Delicate solo cello fading into the starlight) \u266A" },
      { time: 248, text: "Pure stillness." }
    ]
  },
  {
    id: "track-5",
    title: "Solaris Pulse",
    artist: "Hyperion Club",
    artistId: "artist-5",
    album: "Kinetic Energy",
    albumId: "album-5",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
    duration: 210,
    genre: "Melodic Techno / Electronic",
    year: 2026,
    audioQuality: "LOSSLESS",
    formatInfo: {
      sampleRate: "96 kHz",
      bitDepth: "24-bit",
      bitrate: "4608 kbps ALAC",
      format: "Apple Lossless"
    },
    tempo: 126,
    key: "A Minor",
    energy: 0.94,
    danceability: 0.89,
    mood: ["Euphoric", "Energetic", "Club", "Hypnotic"],
    audioTheme: "electronic",
    spatialSupport: true,
    plays: 312e4,
    liked: false,
    color: "#f59e0b",
    notesDescription: "Analog modular synth patterns layered with punchy 909 kicks and rolling bass for festival sound systems.",
    lyrics: [
      { time: 0, text: "\u266A (Hypnotic synth sequence building up with filtered 4/4 kick) \u266A" },
      { time: 15, text: "Feel the frequency vibrating the floor" },
      { time: 23, text: "Open your eyes, unlock the hidden door" },
      { time: 31, text: "Current is flowing through every vein" },
      { time: 39, text: "Lost in the rush, we forget the pain" },
      { time: 46, text: "Ignite the pulse! Let the energy rise!", isChorus: true },
      { time: 54, text: "Solaris burning in your wild eyes!", isChorus: true },
      { time: 61, text: "We are the wave, we are the sound!", isChorus: true },
      { time: 69, text: "Lifting above the gravity bound!", isChorus: true },
      { time: 76, text: "\u266A (Massive club drop with modular synth lead & sub bass) \u266A" },
      { time: 106, text: "Resonance rising, frequency high" },
      { time: 114, text: "Electric storm painted in the sky" },
      { time: 122, text: "Ignite the pulse! Let the energy rise!", isChorus: true },
      { time: 130, text: "Solaris burning in your wild eyes!", isChorus: true },
      { time: 145, text: "\u266A (Acid bassline rolling with crisp hi-hats) \u266A" },
      { time: 175, text: "Never stop the pulse... feel it forever." },
      { time: 200, text: "\u266A (Filter sweep fadeout) \u266A" }
    ]
  },
  {
    id: "track-6",
    title: "Whispering Pines",
    artist: "Cedar & Stone",
    artistId: "artist-6",
    album: "Mountain Air",
    albumId: "album-6",
    coverUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop",
    duration: 188,
    genre: "Indie Folk / Acoustic",
    year: 2025,
    audioQuality: "HI_RES_LOSSLESS",
    formatInfo: {
      sampleRate: "192 kHz",
      bitDepth: "24-bit",
      bitrate: "9216 kbps Studio",
      format: "Hi-Res Studio Master"
    },
    tempo: 96,
    key: "G Major",
    energy: 0.44,
    danceability: 0.55,
    mood: ["Rustic", "Melancholic", "Peaceful", "Organic"],
    audioTheme: "acoustic",
    spatialSupport: true,
    plays: 642e3,
    liked: true,
    color: "#84cc16",
    notesDescription: "Custom Taylor acoustic guitar recorded with stereo ribbon microphones for intimate wood resonance.",
    lyrics: [
      { time: 0, text: "\u266A (Gentle acoustic fingerpicking & natural outdoor room tone) \u266A" },
      { time: 14, text: "Smoke rises slow from the cabin chimney stack" },
      { time: 23, text: "Walking the trail that will never lead me back" },
      { time: 32, text: "The pine needles soft underneath my worn out shoes" },
      { time: 41, text: "Leaving behind all the things I had to lose" },
      { time: 50, text: "Listen to the whispering pines in the breeze", isChorus: true },
      { time: 59, text: "Singing of memories caught in the trees", isChorus: true },
      { time: 68, text: "Simple as breath, honest as stone", isChorus: true },
      { time: 77, text: "Out in the wilderness, never alone", isChorus: true },
      { time: 86, text: "\u266A (Harmonica and double bass accompaniment) \u266A" },
      { time: 104, text: "River runs clear over pebbles cold and gray" },
      { time: 113, text: "Carrying yesterday\u2019s troubles far away" },
      { time: 122, text: "Listen to the whispering pines in the breeze", isChorus: true },
      { time: 131, text: "Singing of memories caught in the trees", isChorus: true },
      { time: 150, text: "\u266A (Acoustic guitar strumming softly to a peaceful sunset) \u266A" },
      { time: 180, text: "Safe at home in the pines." }
    ]
  },
  {
    id: "track-7",
    title: "Blue Horizon Lounge",
    artist: "Miles Davies Quintet 2026",
    artistId: "artist-7",
    album: "Late Night Sessions",
    albumId: "album-7",
    coverUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800&auto=format&fit=crop",
    duration: 230,
    genre: "Nu-Jazz / Ambient Jazz",
    year: 2026,
    audioQuality: "HI_RES_LOSSLESS",
    formatInfo: {
      sampleRate: "192 kHz",
      bitDepth: "24-bit",
      bitrate: "9216 kbps DSD",
      format: "Direct Stream Lossless"
    },
    tempo: 78,
    key: "Bb Minor",
    energy: 0.38,
    danceability: 0.62,
    mood: ["Sophisticated", "Late Night", "Relaxed", "Moody"],
    audioTheme: "jazz",
    spatialSupport: true,
    plays: 512e3,
    liked: false,
    color: "#3b82f6",
    notesDescription: "Muted trumpet lead with upright double bass, brushed drums, and subtle vinyl groove.",
    lyrics: [
      { time: 0, text: "\u266A (Brushed snare rhythm with walking upright bass) \u266A" },
      { time: 16, text: "\u266A (Muted trumpet enters with sultry jazz melody) \u266A" },
      { time: 40, text: "Dim lit booth with an amber cocktail glass" },
      { time: 54, text: "Watching the midnight boulevard traffic pass" },
      { time: 68, text: "Saxophone whispers through the velvet air" },
      { time: 82, text: "Time stands still when you are sitting there" },
      { time: 96, text: "\u266A (Smooth tenor saxophone improvisation) \u266A" },
      { time: 130, text: "A midnight cadence in blue and gold" },
      { time: 145, text: "Stories that only the darkness told" },
      { time: 160, text: "\u266A (Electric piano solo with delicate jazz chords) \u266A" },
      { time: 195, text: "\u266A (Trumpet and saxophone harmonizing to the fade) \u266A" },
      { time: 220, text: "Last call at the Blue Horizon." }
    ]
  },
  {
    id: "track-8",
    title: "Deep Stasis",
    artist: "Cosmic Ocean",
    artistId: "artist-8",
    album: "Voyage to Andromeda",
    albumId: "album-8",
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    duration: 245,
    genre: "Ambient / Space Drone",
    year: 2026,
    audioQuality: "DOLBY_ATMOS",
    formatInfo: {
      sampleRate: "96 kHz",
      bitDepth: "24-bit",
      bitrate: "4608 kbps Spatial",
      format: "Dolby Atmos Spatial Audio"
    },
    tempo: 60,
    key: "E Minor",
    energy: 0.22,
    danceability: 0.15,
    mood: ["Deep Focus", "Meditative", "Sleep", "Cosmic"],
    audioTheme: "ambient",
    spatialSupport: true,
    plays: 189e4,
    liked: true,
    color: "#8b5cf6",
    notesDescription: "Generative ambient pads designed to promote alpha brainwaves and deep restorative sleep.",
    lyrics: [
      { time: 0, text: "\u266A (Deep sub-harmonic drone sweeping across 360-degree space) \u266A" },
      { time: 30, text: "\u266A (Shimmering crystal chords floating like distant stars) \u266A" },
      { time: 60, text: "Breathe in the silence of the endless void" },
      { time: 85, text: "All restless thoughts quietly destroyed" },
      { time: 110, text: "Floating weightless between galaxy shores" },
      { time: 135, text: "Peace is the universe that is forever yours" },
      { time: 160, text: "\u266A (Warm binaural waves gently expanding) \u266A" },
      { time: 200, text: "Drift deeper into stasis." },
      { time: 235, text: "\u266A (Fade into serene white noise and celestial frequencies) \u266A" }
    ]
  },
  {
    id: "track-9",
    title: "Thunder & Rust",
    artist: "Valkyrie Overdrive",
    artistId: "artist-9",
    album: "Forged in Iron",
    albumId: "album-9",
    coverUrl: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?q=80&w=800&auto=format&fit=crop",
    duration: 198,
    genre: "Modern Alternative Rock",
    year: 2026,
    audioQuality: "HI_RES_LOSSLESS",
    formatInfo: {
      sampleRate: "192 kHz",
      bitDepth: "24-bit",
      bitrate: "9216 kbps Lossless",
      format: "Direct Hi-Res Master"
    },
    tempo: 138,
    key: "D Minor",
    energy: 0.96,
    danceability: 0.6,
    mood: ["Intense", "Adrenaline", "Raw", "Anthemic"],
    audioTheme: "rock",
    spatialSupport: true,
    plays: 124e4,
    liked: false,
    color: "#ef4444",
    notesDescription: "Overdriven tube amplifiers, heavy double-kick drumming, and searing dual-guitar harmonies.",
    lyrics: [
      { time: 0, text: "\u266A (Heavy distorted guitar riff roaring to life) \u266A" },
      { time: 14, text: "Black clouds gathering on the ridge ahead" },
      { time: 22, text: "Words of warning left completely unsaid" },
      { time: 30, text: "Foot on the pedal, iron in the blood" },
      { time: 38, text: "Rising up stronger through the fire and mud" },
      { time: 45, text: "Thunder and rust! Break through the chain!", isChorus: true },
      { time: 53, text: "Standing untouched inside the hurricane!", isChorus: true },
      { time: 61, text: "We won\u2019t surrender, we will not bow!", isChorus: true },
      { time: 69, text: "The lightning is striking right here, right now!", isChorus: true },
      { time: 76, text: "\u266A (High-octane drum breakdown and guitar squeals) \u266A" },
      { time: 94, text: "Engine screaming at the redline peak" },
      { time: 102, text: "This is the power that the fearless seek" },
      { time: 110, text: "Thunder and rust! Break through the chain!", isChorus: true },
      { time: 118, text: "Standing untouched inside the hurricane!", isChorus: true },
      { time: 135, text: "\u266A (Virtuoso dual guitar solo at lightning speed) \u266A" },
      { time: 170, text: "Thunder and rust!" },
      { time: 190, text: "\u266A (Heavy final cymbal crash and amplifier feedback) \u266A" }
    ]
  },
  {
    id: "track-10",
    title: "Neon Bloom",
    artist: "Tokyo Prism",
    artistId: "artist-10",
    album: "Shibuya Sunset",
    albumId: "album-10",
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop",
    duration: 212,
    genre: "Future Funk / City Pop",
    year: 2026,
    audioQuality: "HI_RES_LOSSLESS",
    formatInfo: {
      sampleRate: "192 kHz",
      bitDepth: "24-bit",
      bitrate: "9216 kbps ALAC",
      format: "Apple Lossless"
    },
    tempo: 120,
    key: "A Major",
    energy: 0.88,
    danceability: 0.92,
    mood: ["Joyful", "Upbeat", "Groovy", "Colorful"],
    audioTheme: "synthwave",
    spatialSupport: true,
    plays: 284e4,
    liked: true,
    color: "#a855f7",
    notesDescription: "Slap basslines, brass stabs, and sparkling Japanese 80s synth production remastered in high resolution.",
    lyrics: [
      { time: 0, text: "\u266A (Funky slap bass and shimmering disco synth intro) \u266A" },
      { time: 12, text: "Crossing Shibuya under pastel lights" },
      { time: 20, text: "Candy arcade sounds filling up our nights" },
      { time: 28, text: "Take my hand and let the rhythm start" },
      { time: 36, text: "A disco beat beating in your heart" },
      { time: 44, text: "Neon bloom in the summer air!", isChorus: true },
      { time: 52, text: "Sparkles and glitter everywhere!", isChorus: true },
      { time: 60, text: "Dance till the morning paints the sky!", isChorus: true },
      { time: 68, text: "You and I flying extra high!", isChorus: true },
      { time: 76, text: "\u266A (Energetic saxophone hook & funky rhythm guitar) \u266A" },
      { time: 96, text: "Vending machines glowing cool blue" },
      { time: 104, text: "Every melody reminds me of you" },
      { time: 112, text: "Neon bloom in the summer air!", isChorus: true },
      { time: 120, text: "Sparkles and glitter everywhere!", isChorus: true },
      { time: 140, text: "\u266A (Catchy dance breakdown with crowd cheers) \u266A" },
      { time: 180, text: "Neon bloom... forever sweet!" }
    ]
  },
  {
    id: "track-11",
    title: "Rain on the Rooftops",
    artist: "Lofi Coffee Club",
    artistId: "artist-11",
    album: "Sunday Morning Coffee",
    albumId: "album-11",
    coverUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop",
    duration: 182,
    genre: "Cozy Lo-Fi / Study Beats",
    year: 2026,
    audioQuality: "LOSSLESS",
    formatInfo: {
      sampleRate: "48 kHz",
      bitDepth: "24-bit",
      bitrate: "2304 kbps ALAC",
      format: "Lossless Audio"
    },
    tempo: 80,
    key: "F Major",
    energy: 0.35,
    danceability: 0.7,
    mood: ["Cozy", "Study", "Coffee", "Warm"],
    audioTheme: "lofi",
    spatialSupport: false,
    plays: 419e4,
    liked: true,
    color: "#d97706",
    notesDescription: "Real rain recordings outside a Kyoto coffee shop blended with warm acoustic piano and vintage tape wobble.",
    lyrics: [
      { time: 0, text: "\u266A (Coffee brewing sounds, gentle rain on glass, warm Rhodes) \u266A" },
      { time: 20, text: "A fresh warm cup in a ceramic mug" },
      { time: 40, text: "Wrapped tight in an old wool rug" },
      { time: 60, text: "Watching pages turn in the morning light" },
      { time: 80, text: "Everything is peaceful, everything is right" },
      { time: 100, text: "\u266A (Mellow trumpet melody with soft lofi snare) \u266A" },
      { time: 130, text: "Raindrops falling in a gentle song" },
      { time: 150, text: "Where all the quiet thoughts belong" },
      { time: 175, text: "\u266A (Soft acoustic guitar chords fade out) \u266A" }
    ]
  },
  {
    id: "track-12",
    title: "Chronos Paradox",
    artist: "Quantum Pulse",
    artistId: "artist-12",
    album: "Multiverse Theory",
    albumId: "album-12",
    coverUrl: "https://images.unsplash.com/photo-1507499739999-097706ad8914?q=80&w=800&auto=format&fit=crop",
    duration: 228,
    genre: "Cinematic Electronic",
    year: 2026,
    audioQuality: "DOLBY_ATMOS",
    formatInfo: {
      sampleRate: "96 kHz",
      bitDepth: "24-bit",
      bitrate: "4608 kbps Spatial",
      format: "Dolby Atmos Spatial Master"
    },
    tempo: 110,
    key: "B Minor",
    energy: 0.79,
    danceability: 0.58,
    mood: ["Epic", "Mysterious", "Sci-Fi", "Grand"],
    audioTheme: "cinematic",
    spatialSupport: true,
    plays: 95e4,
    liked: false,
    color: "#4f46e5",
    notesDescription: "Hans Zimmer inspired massive brass braams, granular synth arpeggios, and spatial binaural risers.",
    lyrics: [
      { time: 0, text: "\u266A (Ticking clock sound evolving into sub-bass pulses) \u266A" },
      { time: 20, text: "Tick, tock, the timeline bends and fractures" },
      { time: 35, text: "Beyond the reach of planetary actors" },
      { time: 50, text: "We stepped across the event horizon line" },
      { time: 65, text: "Outside the boundaries of mortal time" },
      { time: 80, text: "\u266A (Massive orchestral brass hit with soaring synth choir) \u266A" },
      { time: 110, text: "Past, present, future colliding into one" },
      { time: 125, text: "Revolving around an antimatter sun" },
      { time: 140, text: "\u266A (Deep spatial audio polyrhythms) \u266A" },
      { time: 180, text: "The paradox unfolds... infinity attained." }
    ]
  }
];
var INITIAL_ALBUMS = [
  {
    id: "album-1",
    title: "Neon Odyssey",
    artist: "Astral Echoes",
    artistId: "artist-1",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    releaseDate: "January 2026",
    genre: "Synthwave / Retrowave",
    trackIds: ["track-1", "track-10"],
    audioQuality: "HI_RES_LOSSLESS",
    description: "An exhilarating futuristic journey across neon skylines, recorded entirely in studio master 192kHz resolution.",
    gradient: "from-indigo-900 via-purple-900 to-black"
  },
  {
    id: "album-2",
    title: "Silk & Shadows",
    artist: "Maya Lin & The Solace",
    artistId: "artist-2",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    releaseDate: "February 2026",
    genre: "Neo-Soul / R&B",
    trackIds: ["track-2"],
    audioQuality: "DOLBY_ATMOS",
    description: "Intimate, warm soul melodies immersed in full Dolby Atmos 360-degree spatial acoustics.",
    gradient: "from-rose-950 via-pink-950 to-black"
  },
  {
    id: "album-3",
    title: "Sublevel 09",
    artist: "Kurogane Systems",
    artistId: "artist-3",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop",
    releaseDate: "November 2025",
    genre: "Cyberpunk Lo-Fi",
    trackIds: ["track-3"],
    audioQuality: "HI_RES_LOSSLESS",
    description: "Deep nocturnal bass and rainy Tokyo textures tailored for coding, gaming, and nocturnal focus.",
    gradient: "from-cyan-950 via-slate-900 to-black"
  },
  {
    id: "album-4",
    title: "Crystalline Skies",
    artist: "Valeria Thorne & Nordic Philharmonic",
    artistId: "artist-4",
    coverUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800&auto=format&fit=crop",
    releaseDate: "March 2026",
    genre: "Modern Classical / Cinematic",
    trackIds: ["track-4", "track-12"],
    audioQuality: "HI_RES_LOSSLESS",
    description: "Breathtaking Nordic orchestral symphonies recorded with pristine acoustic fidelity.",
    gradient: "from-emerald-950 via-teal-950 to-black"
  },
  {
    id: "album-5",
    title: "Kinetic Energy",
    artist: "Hyperion Club",
    artistId: "artist-5",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
    releaseDate: "April 2026",
    genre: "Melodic Techno",
    trackIds: ["track-5"],
    audioQuality: "LOSSLESS",
    description: "Pumping festival anthems and driving basslines tuned for maximum energy.",
    gradient: "from-amber-950 via-orange-950 to-black"
  },
  {
    id: "album-11",
    title: "Sunday Morning Coffee",
    artist: "Lofi Coffee Club",
    artistId: "artist-11",
    coverUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop",
    releaseDate: "May 2026",
    genre: "Cozy Lo-Fi",
    trackIds: ["track-11", "track-6"],
    audioQuality: "LOSSLESS",
    description: "Warm, comforting acoustic beats perfect for lazy mornings and productive work.",
    gradient: "from-yellow-950 via-amber-900 to-black"
  }
];
var INITIAL_ARTISTS = [
  {
    id: "artist-1",
    name: "Astral Echoes",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    headerImg: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
    bio: "Pioneering electronic duo merging vintage analog synthesis with ultra-modern 192kHz studio engineering.",
    monthlyListeners: 342e4,
    genres: ["Synthwave", "Retrowave", "Electronic"],
    popularTrackIds: ["track-1", "track-10"],
    albumIds: ["album-1"],
    verified: true
  },
  {
    id: "artist-2",
    name: "Maya Lin & The Solace",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop",
    headerImg: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
    bio: "Soulful multi-instrumentalist known for silky vocals and groundbreaking Dolby Atmos spatial productions.",
    monthlyListeners: 289e4,
    genres: ["Neo-Soul", "R&B", "Contemporary Soul"],
    popularTrackIds: ["track-2"],
    albumIds: ["album-2"],
    verified: true
  },
  {
    id: "artist-3",
    name: "Kurogane Systems",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    headerImg: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop",
    bio: "Tokyo-based sound architect specializing in sub-bass acoustics, generative beats, and cyberpunk atmospheres.",
    monthlyListeners: 412e4,
    genres: ["Cyberpunk Lo-Fi", "Dark Ambient", "Bass"],
    popularTrackIds: ["track-3"],
    albumIds: ["album-3"],
    verified: true
  },
  {
    id: "artist-4",
    name: "Valeria Thorne & Nordic Philharmonic",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    headerImg: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1200&auto=format&fit=crop",
    bio: "Internationally acclaimed composer and 90-piece orchestra capturing raw Nordic emotional landscapes.",
    monthlyListeners: 195e4,
    genres: ["Modern Classical", "Cinematic", "Ambient"],
    popularTrackIds: ["track-4", "track-12"],
    albumIds: ["album-4"],
    verified: true
  }
];
var INITIAL_PLAYLISTS = [
  {
    id: "playlist-spatial-showcase",
    title: "Spatial Audio: Immersive World",
    description: "Handpicked master tracks mixed in Dolby Atmos and high-fidelity binaural 3D sound.",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
    createdBy: "Sonora Editorial",
    trackIds: ["track-1", "track-2", "track-4", "track-8", "track-12"],
    createdAt: "2026-01-15",
    updatedAt: "2026-08-28",
    isPublic: true,
    isPinned: true,
    tags: ["Spatial Audio", "Hi-Res", "Dolby Atmos", "Flagship"],
    gradient: "from-violet-900 via-indigo-950 to-neutral-950"
  },
  {
    id: "playlist-chill-lofi",
    title: "Late Night Flow & Deep Code",
    description: "Smooth lo-fi rhythms, analog tape warmth, and rain drops for maximum focus and flow.",
    coverUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=800&auto=format&fit=crop",
    createdBy: "Sonora AI Discovery",
    trackIds: ["track-3", "track-11", "track-7", "track-8", "track-6"],
    createdAt: "2026-02-01",
    updatedAt: "2026-08-30",
    isPublic: true,
    isPinned: true,
    tags: ["Focus", "Coding", "Lo-Fi", "Late Night"],
    gradient: "from-cyan-950 via-teal-950 to-neutral-950"
  },
  {
    id: "playlist-hires-masters",
    title: "Pure Lossless 24-bit 192kHz Masters",
    description: "Experience every micro-detail, breath, and harmonic overtone with uncompressed audiophile masters.",
    coverUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800&auto=format&fit=crop",
    createdBy: "Sonora Audiophile Lab",
    trackIds: ["track-1", "track-3", "track-4", "track-6", "track-7", "track-9", "track-10"],
    createdAt: "2026-03-10",
    updatedAt: "2026-09-01",
    isPublic: true,
    isPinned: true,
    tags: ["Audiophile", "Hi-Res Lossless", "192kHz", "Master"],
    gradient: "from-amber-950 via-stone-900 to-neutral-950"
  },
  {
    id: "playlist-workout-surge",
    title: "High Voltage Cardio & Energy",
    description: "Hard-hitting electronic drops, modern rock anthems, and fast BPMs to push your limits.",
    coverUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
    createdBy: "Sonora Energy",
    trackIds: ["track-5", "track-9", "track-1", "track-10"],
    createdAt: "2026-04-12",
    updatedAt: "2026-08-25",
    isPublic: true,
    isPinned: false,
    tags: ["Workout", "Electronic", "High Energy", "Motivation"],
    gradient: "from-red-950 via-rose-950 to-neutral-950"
  }
];
var DEFAULT_EQUALIZER = {
  enabled: true,
  preset: "Acoustic / Spatial",
  bands: [
    { freq: 32, gain: 2.5, label: "32Hz" },
    { freq: 64, gain: 3, label: "64Hz" },
    { freq: 125, gain: 1.5, label: "125Hz" },
    { freq: 250, gain: 0, label: "250Hz" },
    { freq: 500, gain: -0.5, label: "500Hz" },
    { freq: 1e3, gain: 0.5, label: "1kHz" },
    { freq: 2e3, gain: 1.5, label: "2kHz" },
    { freq: 4e3, gain: 2, label: "4kHz" },
    { freq: 8e3, gain: 3.5, label: "8kHz" },
    { freq: 16e3, gain: 4, label: "16kHz" }
  ],
  bassBoost: 35,
  spatialAudio: true,
  spatialSpread: 65,
  crossfadeSec: 4,
  preamp: 0
};
var INITIAL_DEVICES = [
  {
    id: "device-web-current",
    name: "Sonora Web Studio (This Device)",
    type: "desktop",
    isActive: true,
    lastActive: "Just now",
    volume: 85
  },
  {
    id: "device-iphone-16",
    name: "iPhone 16 Pro Max \u2022 AirPlay",
    type: "mobile",
    isActive: false,
    lastActive: "2 mins ago",
    battery: 92,
    volume: 70
  },
  {
    id: "device-macbook",
    name: "MacBook Pro M3 Max (Studio)",
    type: "desktop",
    isActive: false,
    lastActive: "15 mins ago",
    battery: 100,
    volume: 60
  },
  {
    id: "device-sonos-living",
    name: "Living Room Sonos Arc + Sub 3D",
    type: "speaker",
    isActive: false,
    lastActive: "1 hour ago",
    volume: 50
  }
];

// src/server/app.ts
dotenv.config();
var app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
var tracksStore = [...INITIAL_TRACKS];
var playlistsStore = [...INITIAL_PLAYLISTS];
var devicesStore = [...INITIAL_DEVICES];
var cloudSyncState = {
  lastSynced: (/* @__PURE__ */ new Date()).toISOString(),
  activeDeviceId: "device-web-current",
  likedTrackIds: ["track-1", "track-2", "track-4", "track-6", "track-8", "track-10", "track-11"],
  customPlaylists: playlistsStore,
  recentlyPlayedTrackIds: ["track-1", "track-3", "track-5"],
  equalizer: DEFAULT_EQUALIZER
};
function decryptMediaUrl(encryptedUrl) {
  try {
    if (!encryptedUrl) return null;
    const key = CryptoJS.enc.Utf8.parse("38346591");
    const decrypted = CryptoJS.DES.decrypt(
      encryptedUrl,
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const raw = decrypted.toString(CryptoJS.enc.Utf8);
    if (!raw) return null;
    return raw.replace(/_96\./, "_320.").replace(/_160\./, "_320.");
  } catch (e) {
    return null;
  }
}
function formatSongToTrack(s) {
  const encUrl = s.more_info?.encrypted_media_url || s.encrypted_media_url;
  const decryptedUrl = encUrl ? decryptMediaUrl(encUrl) : null;
  const mediaUrl = decryptedUrl || s.media_url || (s.downloadUrl ? Array.isArray(s.downloadUrl) ? s.downloadUrl[s.downloadUrl.length - 1]?.url : s.downloadUrl : void 0);
  const durationSec = parseInt(s.more_info?.duration || s.duration || "210", 10) || 210;
  let cover = s.image || s.more_info?.image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800";
  if (Array.isArray(cover)) {
    cover = cover[cover.length - 1]?.url || cover[0]?.url || cover;
  }
  if (typeof cover === "string") {
    cover = cover.replace(/150x150/, "500x500").replace(/50x50/, "500x500");
  }
  const artistName = s.more_info?.artistMap?.primary_artists?.[0]?.name || s.more_info?.singers || s.subtitle || s.artist || (Array.isArray(s.artists?.primary) ? s.artists.primary.map((a) => a.name).join(", ") : "Unknown Artist");
  const cleanTitle = (s.title || s.song || s.name || "Untitled").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&").replace(/<[^>]*>?/gm, "");
  const albumName = (s.more_info?.album || s.album?.name || s.album || cleanTitle).replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&").replace(/<[^>]*>?/gm, "");
  const colors = ["#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#10b981", "#06b6d4", "#f43f5e"];
  const color = colors[Math.abs(cleanTitle.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length];
  return {
    id: `music-api-${s.id || Math.random().toString(36).substring(2, 9)}`,
    title: cleanTitle,
    artist: String(artistName).replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/<[^>]*>?/gm, ""),
    artistId: `art-${s.more_info?.artistMap?.primary_artists?.[0]?.id || "api"}`,
    album: albumName,
    albumId: `alb-${s.more_info?.album_id || "api"}`,
    coverUrl: cover,
    duration: durationSec,
    genre: s.language ? `${s.language.charAt(0).toUpperCase() + s.language.slice(1)} Global` : "Pop / Global",
    year: parseInt(s.year || s.more_info?.release_date?.substring(0, 4) || "2024", 10) || 2024,
    audioQuality: s.more_info?.["320kbps"] === "true" || s.more_info?.is_dolby_content ? "HI_RES_LOSSLESS" : "LOSSLESS",
    audioUrl: mediaUrl || void 0,
    source: "music-api",
    formatInfo: {
      sampleRate: "96 kHz",
      bitDepth: "24-bit",
      bitrate: s.more_info?.["320kbps"] === "true" ? "320 kbps Master (Hi-Res)" : "256 kbps ALAC Lossless",
      format: "AAC / ALAC Studio Master"
    },
    lyrics: [
      { time: 0, text: `\u266A ${cleanTitle} \u266A` },
      { time: 6, text: `Artist: ${artistName}` },
      { time: 14, text: "Streaming live master audio via Sonora API" },
      { time: 24, text: "Lossless bit-perfect playback" }
    ],
    tempo: 124,
    key: "C Major",
    energy: 0.85,
    danceability: 0.78,
    mood: ["Energetic", "Studio Master", "Atmospheric"],
    audioTheme: "electronic",
    notesDescription: "Live high-fidelity audio stream fetched directly via the Music API engine.",
    spatialSupport: true,
    plays: parseInt(s.play_count || "245000", 10) || 245e3,
    liked: false,
    color
  };
}
var geminiClient = null;
function getGemini() {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return geminiClient;
}
var api = express.Router();
api.get("/health", (req, res) => {
  res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString(), platform: process.env.VERCEL ? "vercel" : "standard" });
});
api.get("/catalog", (req, res) => {
  res.json({
    tracks: tracksStore,
    playlists: playlistsStore,
    albums: INITIAL_ALBUMS,
    artists: INITIAL_ARTISTS,
    aiRecommendations: [
      {
        id: "rec-1",
        title: "Studio Immersion Mix",
        tagline: "Precision mastered electronics and spatial synths",
        trackIds: ["track-1", "track-3", "track-8"],
        vibe: "Electronic Focus",
        reason: "Selected for pure dynamic range and spatial acoustics",
        coverGradient: "from-amber-500/30 via-neutral-900 to-black"
      },
      {
        id: "rec-2",
        title: "Analog Velvet Sessions",
        tagline: "Warm tape acoustics and intimate vocals",
        trackIds: ["track-2", "track-6", "track-11"],
        vibe: "Warm Acoustic",
        reason: "Matches calm listening sessions",
        coverGradient: "from-purple-500/30 via-neutral-900 to-black"
      }
    ]
  });
});
api.get("/sync/state", (req, res) => {
  res.json({
    devices: devicesStore,
    activeDeviceId: cloudSyncState.activeDeviceId,
    ...cloudSyncState
  });
});
api.get("/tracks", (req, res) => {
  res.json(tracksStore);
});
api.post("/tracks/like", (req, res) => {
  const { trackId } = req.body;
  const track = tracksStore.find((t) => t.id === trackId);
  if (track) {
    track.liked = !track.liked;
    if (track.liked) {
      if (!cloudSyncState.likedTrackIds.includes(trackId)) {
        cloudSyncState.likedTrackIds.push(trackId);
      }
    } else {
      cloudSyncState.likedTrackIds = cloudSyncState.likedTrackIds.filter((id) => id !== trackId);
    }
  }
  cloudSyncState.lastSynced = (/* @__PURE__ */ new Date()).toISOString();
  res.json({ success: true, trackId, liked: track?.liked ?? false });
});
api.post("/tracks/:id/like", (req, res) => {
  const { id } = req.params;
  const track = tracksStore.find((t) => t.id === id);
  if (!track) {
    return res.status(404).json({ error: "Track not found" });
  }
  track.liked = !track.liked;
  if (track.liked) {
    if (!cloudSyncState.likedTrackIds.includes(id)) {
      cloudSyncState.likedTrackIds.push(id);
    }
  } else {
    cloudSyncState.likedTrackIds = cloudSyncState.likedTrackIds.filter((tId) => tId !== id);
  }
  cloudSyncState.lastSynced = (/* @__PURE__ */ new Date()).toISOString();
  res.json({ id: track.id, liked: track.liked });
});
api.get("/albums", (req, res) => {
  res.json(INITIAL_ALBUMS);
});
api.get("/artists", (req, res) => {
  res.json(INITIAL_ARTISTS);
});
api.get("/playlists", (req, res) => {
  res.json(playlistsStore);
});
api.post("/playlists", (req, res) => {
  const { title, description, coverUrl, trackIds, isPublic, gradient } = req.body;
  const newPlaylist = {
    id: `playlist-${Date.now()}`,
    title: title || "New Playlist",
    description: description || "Created by you on Sonora",
    coverUrl: coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
    createdBy: "You",
    trackIds: Array.isArray(trackIds) ? trackIds : [],
    createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    updatedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    isPublic: !!isPublic,
    isPinned: false,
    gradient: gradient || "from-indigo-900 via-neutral-900 to-black"
  };
  playlistsStore.unshift(newPlaylist);
  cloudSyncState.customPlaylists = playlistsStore;
  cloudSyncState.lastSynced = (/* @__PURE__ */ new Date()).toISOString();
  res.status(201).json(newPlaylist);
});
api.put("/playlists/:id", (req, res) => {
  const { id } = req.params;
  const index = playlistsStore.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Playlist not found" });
  }
  playlistsStore[index] = {
    ...playlistsStore[index],
    ...req.body,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  };
  cloudSyncState.customPlaylists = playlistsStore;
  cloudSyncState.lastSynced = (/* @__PURE__ */ new Date()).toISOString();
  res.json(playlistsStore[index]);
});
api.delete("/playlists/:id", (req, res) => {
  const { id } = req.params;
  playlistsStore = playlistsStore.filter((p) => p.id !== id);
  cloudSyncState.customPlaylists = playlistsStore;
  cloudSyncState.lastSynced = (/* @__PURE__ */ new Date()).toISOString();
  res.json({ success: true, id });
});
api.get("/devices", (req, res) => {
  res.json(devicesStore);
});
api.post("/devices/handoff", (req, res) => {
  const { deviceId } = req.body;
  const targetDevice = devicesStore.find((d) => d.id === deviceId);
  if (!targetDevice) {
    return res.status(404).json({ error: "Device not found" });
  }
  devicesStore = devicesStore.map((d) => ({
    ...d,
    isActive: d.id === deviceId,
    lastActive: d.id === deviceId ? "Active now" : "Just now"
  }));
  cloudSyncState.activeDeviceId = deviceId;
  cloudSyncState.lastSynced = (/* @__PURE__ */ new Date()).toISOString();
  res.json({
    success: true,
    activeDevice: targetDevice,
    devices: devicesStore,
    message: `Playback seamlessly transferred to ${targetDevice.name}`
  });
});
api.post("/devices/transfer", (req, res) => {
  const { deviceId } = req.body;
  const targetDevice = devicesStore.find((d) => d.id === deviceId);
  if (!targetDevice) {
    return res.status(404).json({ error: "Device not found" });
  }
  devicesStore = devicesStore.map((d) => ({
    ...d,
    isActive: d.id === deviceId,
    lastActive: d.id === deviceId ? "Active now" : "Just now"
  }));
  cloudSyncState.activeDeviceId = deviceId;
  cloudSyncState.lastSynced = (/* @__PURE__ */ new Date()).toISOString();
  res.json({
    success: true,
    activeDevice: targetDevice,
    devices: devicesStore,
    message: `Playback seamlessly transferred to ${targetDevice.name}`
  });
});
api.get("/cloud-sync", (req, res) => {
  res.json(cloudSyncState);
});
api.post("/cloud-sync", (req, res) => {
  const { likedTrackIds, customPlaylists, equalizer, recentlyPlayedTrackIds, activeDeviceId } = req.body;
  if (Array.isArray(likedTrackIds)) cloudSyncState.likedTrackIds = likedTrackIds;
  if (Array.isArray(customPlaylists)) {
    cloudSyncState.customPlaylists = customPlaylists;
    playlistsStore = customPlaylists;
  }
  if (equalizer) cloudSyncState.equalizer = equalizer;
  if (Array.isArray(recentlyPlayedTrackIds)) cloudSyncState.recentlyPlayedTrackIds = recentlyPlayedTrackIds;
  if (activeDeviceId) cloudSyncState.activeDeviceId = activeDeviceId;
  cloudSyncState.lastSynced = (/* @__PURE__ */ new Date()).toISOString();
  res.json({
    success: true,
    lastSynced: cloudSyncState.lastSynced,
    state: cloudSyncState
  });
});
api.get("/music-api/search", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(parseInt(String(req.query.limit || "15"), 10) || 15, 30);
    if (!q) {
      return res.json({ songs: [], total: 0 });
    }
    const saavnUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=${limit}&p=1&q=${encodeURIComponent(q)}`;
    const saavnRes = await fetch(saavnUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "application/json"
      }
    });
    if (!saavnRes.ok) {
      throw new Error(`Music-API upstream error: ${saavnRes.statusText}`);
    }
    const data = await saavnRes.json();
    const rawResults = data.results || [];
    const songs = rawResults.map(formatSongToTrack);
    res.json({
      query: q,
      total: data.total || songs.length,
      songs
    });
  } catch (error) {
    console.error("Music-API search error:", error);
    const q = String(req.query.q || "").toLowerCase();
    const matched = tracksStore.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.album.toLowerCase().includes(q)
    );
    res.json({ query: q, total: matched.length, songs: matched, fallback: true });
  }
});
api.get("/music-api/trending", async (req, res) => {
  try {
    const queries = ["Top Global Hits", "Trending Today", "Billboard Hot 100"];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    const saavnUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=12&p=1&q=${encodeURIComponent(randomQuery)}`;
    const saavnRes = await fetch(saavnUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    if (saavnRes.ok) {
      const data = await saavnRes.json();
      const rawResults = data.results || [];
      const songs = rawResults.map(formatSongToTrack);
      if (songs.length > 0) {
        return res.json({ trending: songs });
      }
    }
    res.json({ trending: tracksStore.slice(0, 8) });
  } catch (err) {
    console.error("Trending fetch error:", err);
    res.json({ trending: tracksStore.slice(0, 8) });
  }
});
api.get("/music-api/song/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const saavnId = id.replace(/^music-api-/, "");
    const songUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&_format=json&_marker=0&api_version=4&ctx=web6dot0&pids=${encodeURIComponent(saavnId)}`;
    const response = await fetch(songUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (response.ok) {
      const data = await response.json();
      const songData = data[saavnId] || data.songs?.[0];
      if (songData) {
        const track = formatSongToTrack(songData);
        return res.json(track);
      }
    }
    const localTrack = tracksStore.find((t) => t.id === id);
    if (localTrack) return res.json(localTrack);
    res.status(404).json({ error: "Song not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
api.get("/music-api/stream", async (req, res) => {
  try {
    const streamUrl = String(req.query.url || "");
    if (!streamUrl || !streamUrl.startsWith("http://") && !streamUrl.startsWith("https://")) {
      return res.status(400).json({ error: "Valid audio stream URL is required" });
    }
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    };
    if (req.headers.range) {
      headers["Range"] = req.headers.range;
    }
    const upstream = await fetch(streamUrl, { headers });
    res.status(upstream.status);
    upstream.headers.forEach((value, name) => {
      const lower = name.toLowerCase();
      if (lower === "content-type" || lower === "content-length" || lower === "content-range" || lower === "accept-ranges") {
        res.setHeader(name, value);
      }
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=3600");
    if (!upstream.body) {
      return res.end();
    }
    const { Readable } = await import("stream");
    const nodeStream = Readable.fromWeb(upstream.body);
    nodeStream.pipe(res);
  } catch (err) {
    console.error("Audio stream proxy error:", err);
    if (!res.headersSent) {
      res.status(502).json({ error: "Failed to proxy audio stream" });
    }
  }
});
api.get("/musicbrainz/recording", async (req, res) => {
  try {
    const query = String(req.query.query || "").trim();
    if (!query) {
      return res.json({ recordings: [] });
    }
    const mbUrl = `https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(query)}&fmt=json&limit=5`;
    const response = await fetch(mbUrl, {
      headers: {
        "User-Agent": "SonoraMusicStudio/1.0.0 ( contact@sonoramusic.internal )",
        Accept: "application/json"
      }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: "MusicBrainz API rate limit or error" });
    }
    const data = await response.json();
    const recordings = (data.recordings || []).map((r) => ({
      id: r.id,
      title: r.title,
      artist: r["artist-credit"]?.map((a) => a.name).join(", ") || "Unknown",
      releases: (r.releases || []).map((rel) => ({
        id: rel.id,
        title: rel.title,
        date: rel.date,
        country: rel.country,
        trackCount: rel["track-count"]
      })),
      isrcs: r.isrcs || [],
      tags: (r.tags || []).map((t) => t.name),
      disambiguation: r.disambiguation
    }));
    res.json({ query, recordings });
  } catch (err) {
    console.error("MusicBrainz error:", err);
    res.json({ recordings: [], error: err.message });
  }
});
api.post("/gemini/recommendations", async (req, res) => {
  try {
    const { listeningHistory, favoriteGenres, currentMood } = req.body;
    const ai = getGemini();
    const catalogSummary = tracksStore.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      genre: t.genre,
      mood: t.mood,
      audioTheme: t.audioTheme,
      tempo: t.tempo
    }));
    const prompt = `You are the lead AI music curator for Sonora, a high-fidelity streaming platform like Apple Music.
Given the user's current mood "${currentMood || "Focus & Relax"}", preferred genres: "${favoriteGenres?.join(", ") || "Synthwave, Lo-Fi, Ambient"}", and listening history track IDs: "${listeningHistory?.join(", ") || "track-1, track-3"}", analyze which tracks from our catalog best match their vibe and create 3 personalized discovery mixes.

Here is the available catalog:
${JSON.stringify(catalogSummary)}

Return a JSON array of 3 recommendation mixes with the following schema:
- title: catchy editorial playlist title
- tagline: short poetic description explaining the sound vibe
- reason: specific AI explanation of why this was curated for the listener
- vibe: 2-3 word vibe label
- trackIds: array of 3-5 track IDs matching the theme from the catalog
- coverGradient: Tailwind gradient string (e.g. "from-indigo-900 via-purple-900 to-black")`;
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              tagline: { type: Type.STRING },
              reason: { type: Type.STRING },
              vibe: { type: Type.STRING },
              trackIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              coverGradient: { type: Type.STRING }
            },
            required: ["title", "tagline", "reason", "vibe", "trackIds", "coverGradient"]
          }
        }
      }
    });
    const parsed = JSON.parse(response.text || "[]");
    const formatted = parsed.map((item, idx) => ({
      id: `ai-mix-${Date.now()}-${idx}`,
      ...item
    }));
    res.json(formatted);
  } catch (error) {
    console.error("Gemini recommendations error:", error);
    res.json([
      {
        id: `ai-mix-fallback-1`,
        title: "Sonora Adaptive Deep Focus",
        tagline: "High-bitrate synthesized soundscapes tailored to keep your mental state in flow.",
        reason: "Selected based on your affinity for atmospheric synths and rhythmic lo-fi tempos.",
        vibe: "Focus & Electronic",
        trackIds: ["track-1", "track-3", "track-8", "track-10"],
        coverGradient: "from-cyan-900 via-indigo-900 to-slate-950"
      },
      {
        id: `ai-mix-fallback-2`,
        title: "Golden Sunset Acoustic Lounge",
        tagline: "Warm analog tape textures, velvety vocals, and intimate strings.",
        reason: "Curated for late afternoon relaxation and mindful unwinding.",
        vibe: "Organic & Warm",
        trackIds: ["track-2", "track-6", "track-11", "track-7"],
        coverGradient: "from-amber-800 via-rose-900 to-stone-950"
      }
    ]);
  }
});
api.post("/gemini/dj-commentary", async (req, res) => {
  try {
    const { currentTrackTitle, artistName, timeOfDay, userVibe, currentGenre } = req.body;
    const ai = getGemini();
    const prompt = `You are "Aura", the charismatic, ultra-knowledgeable host of Sonora Radio.
The current time is ${timeOfDay || "evening"}. The listener's current vibe is "${userVibe || "Chill"}" and they are about to hear "${currentTrackTitle}" by ${artistName} (${currentGenre || "Music"}).

Write a short, engaging, 2-3 sentence DJ radio host voice introduction.

Return JSON with:
- title: DJ intro title
- text: The spoken script
- mood: e.g. "Warm & Energetic"
- hostName: "Aura DJ"`;
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            text: { type: Type.STRING },
            mood: { type: Type.STRING },
            hostName: { type: Type.STRING }
          },
          required: ["title", "text", "mood", "hostName"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    res.json({
      id: `dj-${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ...parsed
    });
  } catch (error) {
    console.error("DJ commentary error:", error);
    res.json({
      id: `dj-${Date.now()}`,
      title: "Aura DJ Live \u2022 Studio Master Broadcast",
      text: `Welcome back to Sonora. Next up we're spinning "${req.body.currentTrackTitle || "this track"}" by ${req.body.artistName || "the artist"} in pure uncompressed fidelity. Sit back and enjoy the soundscape.`,
      mood: "Smooth & Warm",
      hostName: "Aura DJ",
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });
  }
});
api.post("/gemini/generate-playlist", async (req, res) => {
  try {
    const { prompt: userPrompt } = req.body;
    const ai = getGemini();
    const catalogSummary = tracksStore.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      genre: t.genre,
      mood: t.mood,
      audioTheme: t.audioTheme
    }));
    const prompt = `You are Sonora's AI Playlist Architect.
The user requested: "${userPrompt}"

Select 4-7 relevant track IDs from the catalog below that best fulfill this prompt.

Catalog:
${JSON.stringify(catalogSummary)}

Return JSON with:
- title: evocative playlist title
- description: description explaining the curation
- trackIds: array of matching track IDs
- tags: array of 3-4 tags
- gradient: Tailwind gradient
- coverUrl: Unsplash music image URL`;
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            trackIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            gradient: { type: Type.STRING },
            coverUrl: { type: Type.STRING }
          },
          required: ["title", "description", "trackIds", "tags", "gradient"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    const newPlaylist = {
      id: `ai-playlist-${Date.now()}`,
      title: parsed.title || "AI Generated Mix",
      description: parsed.description || `Curated for: "${userPrompt}"`,
      coverUrl: parsed.coverUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
      createdBy: "Sonora AI Genius",
      trackIds: parsed.trackIds?.length ? parsed.trackIds : ["track-1", "track-3", "track-8"],
      createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      updatedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      isPublic: true,
      tags: parsed.tags || ["AI Curated", "Custom Mix"],
      gradient: parsed.gradient || "from-violet-900 via-indigo-950 to-black"
    };
    playlistsStore.unshift(newPlaylist);
    cloudSyncState.customPlaylists = playlistsStore;
    cloudSyncState.lastSynced = (/* @__PURE__ */ new Date()).toISOString();
    res.status(201).json(newPlaylist);
  } catch (error) {
    console.error("AI Playlist generation error:", error);
    const fallbackPlaylist = {
      id: `ai-playlist-${Date.now()}`,
      title: `${req.body.prompt || "Custom"} Sonic Journey`,
      description: `Curated mix matching your prompt: "${req.body.prompt}"`,
      coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
      createdBy: "Sonora AI Genius",
      trackIds: ["track-1", "track-2", "track-4", "track-10"],
      createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      updatedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      isPublic: true,
      tags: ["AI Curated", "Discovery"],
      gradient: "from-blue-900 via-indigo-950 to-black"
    };
    playlistsStore.unshift(fallbackPlaylist);
    res.status(201).json(fallbackPlaylist);
  }
});
api.post("/gemini/lyrics-insights", async (req, res) => {
  try {
    const { trackTitle, artistName, lyrics, genre } = req.body;
    const ai = getGemini();
    const prompt = `Analyze this song for a high-end music streaming app (Sonora):
Track: "${trackTitle}" by ${artistName}
Genre: ${genre}
Lyrics:
${JSON.stringify(lyrics)}

Provide:
- poeticMeaning: A brief 2-sentence poetic breakdown of the emotional core
- keyThemes: Array of 3-4 key lyrical themes
- audioMasterNote: A note on how the instrumentation and mastering enhances the lyrical storytelling
- triviaFact: An interesting artistic fact or studio recording insight`;
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            poeticMeaning: { type: Type.STRING },
            keyThemes: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            audioMasterNote: { type: Type.STRING },
            triviaFact: { type: Type.STRING }
          },
          required: ["poeticMeaning", "keyThemes", "audioMasterNote", "triviaFact"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("Lyrics insight error:", error);
    res.json({
      poeticMeaning: `"${req.body.trackTitle}" explores the intersection of human longing and atmospheric space, contrasting intimate inner feelings with wide cinematic soundscapes.`,
      keyThemes: ["Immersion", "Transcendence", "Nocturnal Voyage"],
      audioMasterNote: "Mastered in high-resolution 24-bit audio to capture micro-dynamics, vocal breath, and sub-bass resonance without compression artifacts.",
      triviaFact: "The producers blended analog tube gear with modern binaural 3D panners for realistic spatial depth."
    });
  }
});
app.use("/api", api);
app.use(api);
var app_default = app;
export {
  app,
  app_default as default
};
