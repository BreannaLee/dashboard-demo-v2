'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const CATS: Record<string, { name: string; short: string; color: string; tint: string; fg: string; sub: string }> = {
  violence:  { name: 'Violence & Scariness',      short: 'Violence & scariness', color: '#BD081C', tint: '#FBE9EC', fg: '#BD081C', sub: 'Scary imagery and suspense' },
  language:  { name: 'Language',                   short: 'Language',             color: '#423FE1', tint: '#FDE7F1', fg: '#E41177', sub: 'Vulgarity and swear words' },
  sex:       { name: 'Sex, Romance & Nudity',      short: 'Sex & romance',        color: '#E41177', tint: '#FDE7F1', fg: '#E41177', sub: 'Romantic or sexual content' },
  drugs:     { name: 'Drinking, Drugs & Smoking',  short: 'Drinking & drugs',     color: '#8848C1', tint: '#F3EAFB', fg: '#8848C1', sub: 'Alcohol, drugs, or smoking' },
  products:  { name: 'Product & Purchases',        short: 'Product & purchases',  color: '#D8690E', tint: '#FDF0E2', fg: '#D8690E', sub: 'Ads and brand promotion' },
  attention: { name: 'Attention Capture',          short: 'Attention capture',    color: '#FFC60B', tint: '#FFF6DA', fg: '#8A6D00', sub: 'Fast pacing and sensory intensity' },
};

const LEVELS: Record<string, { label: string; bg: string; fg: string }> = {
  veryhigh: { label: 'Very high', bg: '#BD081C', fg: '#fff' },
  high:     { label: 'High',      bg: '#D8690E', fg: '#fff' },
  moderate: { label: 'Moderate',  bg: '#FFC60B', fg: '#222' },
  lower:    { label: 'Lower',     bg: '#33A544', fg: '#fff' },
};

interface Analysis {
  id: string; title: string; channel: string; duration: string; durS: number;
  views: string; age: string; overall: string; thumbBg: string; thumb?: string;
  when: string; commentCount: number; blurb: string; summary: string;
  moments: { t: number; cat: string; label: string }[];
  cats: { key: string; count: number; note: string }[];
  genre?: string;
}

// Map creator/video names to real analysis URLs
const REAL_ANALYSIS_URLS: Record<string, string> = {
  // Only creators with THEIR OWN real analysis — no cross-mapping
  'blippi': 'https://video-analyzer-dev.commonsense.org/video/analysis/694f3995-c81e-4281-b576-84230a49e964',
  'ms rachel': 'https://video-analyzer-dev.commonsense.org/video/analysis/23515007-12b7-4d39-97ba-75c2e45f9bf8',
  'ms. rachel': 'https://video-analyzer-dev.commonsense.org/video/analysis/23515007-12b7-4d39-97ba-75c2e45f9bf8',
  'fairy tales and stories for kids': 'https://video-analyzer-dev.commonsense.org/video/analysis/0ca8d77f-8117-4de4-b5bc-e9b3390ecb8a',
  'gibi asmr': 'https://video-analyzer-dev.commonsense.org/video/analysis/d6f8bd9a-0aca-45d5-8e98-01ec021ff804',
  'james charles': 'https://video-analyzer-dev.commonsense.org/video/analysis/5a271fce-fe1d-45b0-becb-8d64eaa3ce48',
  "grace's room": 'https://video-analyzer-dev.commonsense.org/video/analysis/e8212b04-49fb-49d9-807f-2e26f106b4bd',
  'mrbeast': 'https://video-analyzer-dev.commonsense.org/video/analysis/a254d0b9-aa4c-42f8-abe3-97b1db37b25f',
  'chris and jack': 'https://video-analyzer-dev.commonsense.org/video/analysis/6467b933-cbef-4997-a6ed-c3791774e8fa',
  'kreekcraft': 'https://video-analyzer-dev.commonsense.org/video/analysis/b2fc81d2-10eb-4fd8-8341-fb7fc3a0d065',
  'backrooms': 'https://video-analyzer-dev.commonsense.org/video/analysis/69c8286e-25c1-4df2-82ff-7fc6ea226897',
  'kane pixels': 'https://video-analyzer-dev.commonsense.org/video/analysis/69c8286e-25c1-4df2-82ff-7fc6ea226897',
};

function getRealAnalysisUrl(channelOrId: string): string | null {
  const key = channelOrId.toLowerCase().trim();
  if (REAL_ANALYSIS_URLS[key]) return REAL_ANALYSIS_URLS[key];
  for (const [k, v] of Object.entries(REAL_ANALYSIS_URLS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

const ANALYSES: Analysis[] = [
  {
    id: 'backrooms', title: 'The Backrooms (Found Footage)', channel: 'Kane Pixels',
    duration: '9:14', durS: 554, views: '84M views', age: '13+', overall: 'high',
    thumbBg: '#B8A94A', thumb: '/thumb-backrooms.png', when: '2 hours ago', commentCount: 12,
    blurb: 'Intense sustained horror and repeated strong profanity in the viral short that inspired the movie.',
    summary: 'The fast-paced video creates fear through suspense, unsettling environments, and feelings of isolation rather than graphic violence. Viewers encounter dark maze-like environments, ominous messages, shadowy figures, and occasional startling moments that may be frightening for kids. Frequent strong profanity, with repeated uses of "f--k" and "s--t" throughout.',
    moments: [
      { t: 18, cat: 'attention', label: 'Rapid cuts and shaky camera from the start \u2014 high sensory intensity' },
      { t: 47, cat: 'violence', label: 'Ominous handwritten message discovered on wall' },
      { t: 92, cat: 'language', label: 'Strong profanity ("f--k") in reaction to surroundings' },
      { t: 125, cat: 'violence', label: 'Shadowy figure glimpsed at end of hallway' },
      { t: 164, cat: 'language', label: 'Profanity ("s--t") repeated under breath' },
      { t: 178, cat: 'violence', label: 'Sudden loud noise \u2014 first jump scare' },
      { t: 221, cat: 'language', label: 'Strong profanity during panicked whispering' },
      { t: 252, cat: 'violence', label: 'Entity chase sequence begins \u2014 sustained running and screaming' },
      { t: 320, cat: 'violence', label: 'Long sequence of dread in dark, empty maze corridors' },
      { t: 363, cat: 'language', label: 'Repeated profanity while hiding' },
      { t: 407, cat: 'violence', label: 'Distorted figure shown in close-up' },
      { t: 449, cat: 'violence', label: 'Character falls through collapsing floor' },
      { t: 495, cat: 'violence', label: 'Final jump scare with distorted audio' },
      { t: 520, cat: 'language', label: 'Profanity in final panicked moments' },
    ],
    cats: [
      { key: 'attention', count: 1, note: 'Fast visual pacing \u2014 can be overstimulating for younger kids.' },
      { key: 'violence', count: 8, note: 'Intense sustained fear in dark, maze-like hallways; isolation and separation anxiety themes.' },
      { key: 'language', count: 5, note: 'Frequent strong profanity, often expressing shock or distress.' },
      { key: 'sex', count: 0, note: "We didn't find anything of concern for this topic." },
      { key: 'drugs', count: 0, note: "We didn't find anything of concern for this topic." },
      { key: 'products', count: 0, note: "We didn't find anything of concern for this topic." },
    ],
  },
  {
    id: 'mrbeast', title: 'Last To Leave Grocery Store, Wins $250,000', channel: 'MrBeast',
    duration: '16:24', durS: 984, views: '143M views', age: '9+', overall: 'veryhigh',
    thumbBg: '#2E6FB0', thumb: '/thumb-mrbeast.webp', when: 'Yesterday', commentCount: 31,
    blurb: 'Very fast pacing throughout, frequent mild profanity, and heavy brand and prize promotion.',
    summary: 'Very fast pacing throughout with constant cuts, sound effects, and on-screen counters designed to hold attention. Frequent brand promotion \u2014 from sponsor shout-outs to constant prize and product placement \u2014 plus occasional mild profanity. Competition framing is exciting but centers money as the reward for everything.',
    moments: [
      { t: 8, cat: 'attention', label: 'Rapid-fire intro \u2014 14 cuts in the first 20 seconds' },
      { t: 55, cat: 'products', label: 'Sponsor shout-out with on-screen buy prompt' },
      { t: 130, cat: 'language', label: 'Mild profanity (bleeped) during challenge' },
      { t: 245, cat: 'attention', label: 'Loud sound effects and flashing prize counter' },
      { t: 388, cat: 'products', label: 'Merchandise plug with discount code' },
      { t: 470, cat: 'language', label: 'Mild profanity in contestant reaction' },
      { t: 610, cat: 'products', label: 'Brand-name product handed out as prize, logo close-up' },
      { t: 733, cat: 'attention', label: 'Countdown pressure sequence with strobing graphics' },
      { t: 850, cat: 'products', label: 'Subscribe-to-win prompt tied to cash giveaway' },
      { t: 940, cat: 'attention', label: 'Cliffhanger tease for next video' },
    ],
    cats: [
      { key: 'attention', count: 4, note: 'Very fast pacing, loud effects, countdowns and cliffhangers throughout.' },
      { key: 'products', count: 4, note: 'Heavy brand promotion with direct buy/subscribe prompts.' },
      { key: 'language', count: 2, note: 'Occasional mild (bleeped) profanity.' },
      { key: 'violence', count: 0, note: "We didn't find anything of concern for this topic." },
      { key: 'sex', count: 0, note: "We didn't find anything of concern for this topic." },
      { key: 'drugs', count: 0, note: "We didn't find anything of concern for this topic." },
    ],
  },
  {
    id: 'blippi', title: "Blippi\u2019s Jurassic Puppy Show!", channel: 'Blippi',
    duration: '12:06', durS: 726, views: '38M views', age: '4+', overall: 'moderate',
    thumbBg: '#E88A2E', thumb: '/thumb-blippi.webp', when: '2 days ago', commentCount: 7,
    blurb: 'Very fast visual pacing that may overstimulate young kids, plus constant brand presence.',
    summary: 'Content is friendly and educational, but the visual pacing is very fast for the preschool audience \u2014 quick cuts, zooms, and sound effects roughly every 3 seconds. The Blippi logo is on screen throughout, with end-of-video prompts to search for more Blippi content.',
    moments: [
      { t: 15, cat: 'attention', label: 'Quick cuts and zoom effects from the opening' },
      { t: 210, cat: 'attention', label: 'Sound-effect burst sequence \u2014 9 effects in 30 seconds' },
      { t: 430, cat: 'products', label: 'Blippi-branded merchandise visible in scene' },
      { t: 690, cat: 'products', label: '"Search for more Blippi!" end-screen prompt' },
    ],
    cats: [
      { key: 'attention', count: 2, note: 'Very fast pacing for the target age group.' },
      { key: 'products', count: 2, note: 'Persistent branding and search prompts.' },
      { key: 'violence', count: 0, note: "We didn't find anything of concern for this topic." },
      { key: 'language', count: 0, note: "We didn't find anything of concern for this topic." },
      { key: 'sex', count: 0, note: "We didn't find anything of concern for this topic." },
      { key: 'drugs', count: 0, note: "We didn't find anything of concern for this topic." },
    ],
  },
  {
    id: 'msrachel', title: 'Toddler Learning with Ms Rachel', channel: 'Ms Rachel',
    duration: '28:14', durS: 1694, views: '372M views', age: '2+', overall: 'lower',
    thumbBg: '#4AAE7C', thumb: '/thumb-msrachel.webp', when: '2 days ago', commentCount: 4,
    blurb: 'Gentle, age-appropriate learning content. The only flag: her own branded toys appear.',
    summary: 'Gentle, age-appropriate learning content with slow pacing, repetition, and direct-to-camera speech that supports language development. The only concern is that several of her own branded toys are featured throughout.',
    moments: [
      { t: 340, cat: 'products', label: 'Ms Rachel branded plush toy featured in segment' },
      { t: 1210, cat: 'products', label: 'Second branded toy used as teaching prop' },
    ],
    cats: [
      { key: 'products', count: 2, note: 'Her own branded toys are featured throughout.' },
      { key: 'attention', count: 0, note: 'Slow, deliberate pacing \u2014 appropriate for age.' },
      { key: 'violence', count: 0, note: "We didn't find anything of concern for this topic." },
      { key: 'language', count: 0, note: "We didn't find anything of concern for this topic." },
      { key: 'sex', count: 0, note: "We didn't find anything of concern for this topic." },
      { key: 'drugs', count: 0, note: "We didn't find anything of concern for this topic." },
    ],
  },
  {
    id: 'kreekcraft', title: 'So.. Roblox lied..', channel: 'KreekCraft',
    duration: '16:07', durS: 967, views: '4.2M views', age: '10+', overall: 'high',
    thumbBg: '#E8843A', thumb: '/thumb-kreekcraft.webp', when: '3 days ago', commentCount: 15,
    blurb: 'Strong language throughout plus intense Roblox gameplay with jump scares and rapid pacing.',
    summary: 'A Roblox gaming video that includes frequent strong language, rapid-fire editing, and intense gameplay moments including jump scares. The creator discusses controversial Roblox platform decisions with heated commentary.',
    moments: [
      { t: 22, cat: 'language', label: 'Strong profanity in opening rant' },
      { t: 95, cat: 'attention', label: 'Rapid cuts between gameplay clips' },
      { t: 180, cat: 'language', label: 'Repeated mild profanity during gameplay' },
      { t: 290, cat: 'violence', label: 'Jump scare moment in horror game' },
      { t: 410, cat: 'language', label: 'Strong profanity reacting to game event' },
      { t: 520, cat: 'attention', label: 'Fast-paced montage sequence' },
      { t: 630, cat: 'violence', label: 'Intense chase sequence in-game' },
      { t: 750, cat: 'language', label: 'Profanity during frustrated gameplay' },
      { t: 860, cat: 'products', label: 'Roblox merch plug with link' },
    ],
    cats: [
      { key: 'language', count: 4, note: 'Frequent strong and mild profanity throughout.' },
      { key: 'attention', count: 2, note: 'Fast editing and rapid gameplay transitions.' },
      { key: 'violence', count: 2, note: 'Jump scares and intense chase moments in horror games.' },
      { key: 'products', count: 1, note: 'Merch promotion with purchase link.' },
      { key: 'sex', count: 0, note: "We didn't find anything of concern for this topic." },
      { key: 'drugs', count: 0, note: "We didn't find anything of concern for this topic." },
    ],
  },
];

const TRENDING = [
  { id: 'mrbeast', viewers: '4.2K' },
  { id: 'backrooms', viewers: '2.8K' },
  { id: 'kreekcraft', viewers: '1.9K' },
  { id: 'msrachel', viewers: '1.1K' },
];

interface Creator {
  name: string; age: string; views: string; level: string;
  avatarBg: string; avatarTint: string; avatarFg: string; avatarImg?: string;
  genres: string[]; seen: boolean; blurb: string; tags: string[];
}

const CREATORS: Creator[] = [
  { name: 'James Charles', age: '16+', views: '754K views', level: 'veryhigh', avatarBg: '#8848C1', avatarTint: '#F3EAFB', avatarFg: '#8848C1', avatarImg: '/creator-james-charles.webp', genres: ['Beauty / Makeup / ASMR'], seen: false,
    blurb: 'Constant strong profanity, repeated sexual innuendo, alcohol references, and heavy advertising with direct buy/subscribe prompts.',
    tags: ['Language', 'Sex & romance', 'Drinking & drugs', 'Product & purchases'] },
  { name: 'MrBeast', age: '9+', avatarImg: '/creator-mrbeast.webp', views: '143.8M views \u00b7 2 videos analyzed', level: 'veryhigh', avatarBg: '#2E6FB0', avatarTint: '#FBE9EC', avatarFg: '#BD081C', genres: ['Challenge, Stunt & Comedy Entertainment'], seen: true,
    blurb: 'Very fast pacing throughout, frequent profanity, and heavy brand promotion \u2014 from shop-and-click prompts to constant prize/product placement.',
    tags: ['Attention capture', 'Language', 'Product & purchases'] },
  { name: 'Kane Pixels', age: '13+', avatarImg: '/creator-kane-pixels.webp', views: '~50M views', level: 'high', avatarBg: '#B8A94A', avatarTint: '#F5F0DC', avatarFg: '#8A7A2E', genres: ['Gaming'], seen: false,
    blurb: 'A horror short built on intense, sustained scares and unsettling imagery, with repeated strong profanity.',
    tags: ['Violence & scariness', 'Language'] },
  { name: 'Gibi ASMR', age: '13+', avatarImg: '/creator-gibi-asmr.webp', views: '438K views', level: 'high', avatarBg: '#E41177', avatarTint: '#FDE7F1', avatarFg: '#E41177', genres: ['Beauty / Makeup / ASMR'], seen: false,
    blurb: 'A flirtatious, intimate roleplay with suggestive undertones, plus frequent luxury-brand placement and some alcohol and medication.',
    tags: ['Sex & romance', 'Product & purchases', 'Drinking & drugs'] },
  { name: 'Sony Pictures (Resident Evil)', age: '17+', avatarImg: '/creator-sony-pictures-resident-evil-.webp', views: '4M views', level: 'moderate', avatarBg: '#6B2B2B', avatarTint: '#F2E4E4', avatarFg: '#6B2B2B', genres: ['Challenge, Stunt & Comedy Entertainment'], seen: false,
    blurb: 'An intense, scary movie trailer rated for ages 17+, with brief mild profanity and on-screen text pushing the paid release.',
    tags: ['Violence & scariness', 'Language', 'Product & purchases'] },
  { name: 'Blippi', age: '4+', avatarImg: '/creator-blippi.webp', views: '254K views', level: 'moderate', avatarBg: '#E88A2E', avatarTint: '#FDF0E2', avatarFg: '#D8690E', genres: ['Pretend Play, Toys & Family Adventure'], seen: false,
    blurb: 'Very fast visual pacing that may overstimulate young kids, plus the Blippi logo on screen throughout and prompts to search for more.',
    tags: ['Attention capture', 'Product & purchases'] },
  { name: 'Ms Rachel', age: '2+', avatarImg: '/creator-ms-rachel.webp', views: '372M views', level: 'lower', avatarBg: '#4AAE7C', avatarTint: '#E9F7EF', avatarFg: '#1A7E22', genres: ['Music & Nursery Rhymes'], seen: true,
    blurb: 'Gentle, age-appropriate learning content. The only concern is that several of her own branded toys are featured throughout.',
    tags: ['Product & purchases'] },
  { name: 'KreekCraft', age: '10+', avatarImg: '/creator-kreekcraft.webp', views: '4.2M views', level: 'high', avatarBg: '#E8843A', avatarTint: '#FDF0E2', avatarFg: '#D8690E', genres: ['Gaming'], seen: false,
    blurb: 'Strong language throughout plus intense Roblox gameplay with jump scares and rapid pacing.',
    tags: ['Language', 'Attention capture', 'Violence & scariness'] },
  { name: 'Chris and Jack', age: '8+', avatarImg: '/creator-chris-and-jack.webp', views: '2.1M views', level: 'moderate', avatarBg: '#423FE1', avatarTint: '#EEF0FE', avatarFg: '#423FE1', genres: ['Challenge, Stunt & Comedy Entertainment'], seen: false,
    blurb: 'Upbeat comedy with mostly clean content. Some fast pacing and attention-grabbing editing but low on other concerns.',
    tags: ['Attention capture'] },
  { name: "Grace's Room", age: '13+', avatarImg: '/creator-graces-room.webp', views: '1.6M views', level: 'high', avatarBg: '#D8690E', avatarTint: '#FDF0E2', avatarFg: '#D8690E', genres: ['Beauty / Makeup / ASMR'], seen: false,
    blurb: 'A lifestyle vlog with frequent product placement, brand deals, and casual language throughout.',
    tags: ['Product & purchases', 'Language'] },
  { name: 'Fairy Tales and Stories for Kids', age: '4+', avatarImg: '/creator-fairy-tales.webp', views: '8.2M views', level: 'moderate', avatarBg: '#D8690E', avatarTint: '#FDF0E2', avatarFg: '#D8690E', genres: ['Music & Nursery Rhymes'], seen: false,
    blurb: 'Animated fairy tales with some mildly scary moments and fast-paced visuals that may startle younger viewers.',
    tags: ['Attention capture', 'Violence & scariness'] },
];

const COMMENTS = [
  { id: 'c1', name: 'Dana M.', initial: 'D', avatarBg: '#423FE1', meta: 'Parent of two \u00b7 3h ago', type: 'note', age: '5\u20138', video: 'The Backrooms (Found Footage)', videoId: 'backrooms', ts: '2:58', moment: 'jump scare', volume: 14, volumeLabel: 'parents flagged the pacing on this one', tags: ['Watched together', 'Skipped a part'], likes: 24,
    text: 'Thank you for the timestamp on the 2:58 jump scare \u2014 my 8-year-old had been asking about this one because friends at school were talking about it. We watched the first two minutes together and talked about why it felt creepy. Skipped the rest.' },
  { id: 'c4', name: 'Jon K.', initial: 'J', avatarBg: '#8848C1', meta: 'Parent of three \u00b7 yesterday', type: 'headsup', age: '9\u201312', video: 'So.. Roblox lied..', videoId: 'kreekcraft', ts: '', moment: '', volume: 6, volumeLabel: 'parents flagged the language', tags: ['Blocked the channel'], likes: 9,
    text: 'Heads up: the language in this one is pretty strong for a Roblox video. My 11-year-old picked up some words I was not happy about. Worth previewing before letting younger kids watch.' },
  { id: 'c2', name: 'Marcus T.', initial: 'M', avatarBg: '#1A7E22', meta: 'Parent of a 10-year-old \u00b7 6h ago', type: 'note', age: '9\u201312', video: 'Last To Leave Grocery Store, Wins $250,000', videoId: 'mrbeast', ts: '14:10', moment: '"subscribe to win" prompt', volume: 9, volumeLabel: 'parents flagged the giveaway prompt', tags: ['Talked about it'], likes: 41,
    text: 'The "subscribe to win" flag at 14:10 is the one to talk about. My son genuinely believed he might win money. Good conversation starter about how giveaways are designed to farm subscriptions.' },
  { id: 'c3', name: 'Priya S.', initial: 'P', avatarBg: '#D8690E', meta: 'Parent of a 4-year-old \u00b7 yesterday', type: 'note', age: 'Under 5', video: 'Blippi\u2019s Jurassic Puppy Show!', videoId: 'blippi', ts: '', moment: '', volume: 22, volumeLabel: 'parents flagged fast pacing', tags: ['Wired after watching'], likes: 17,
    text: 'Did not expect Blippi to get flagged for pacing but honestly it tracks \u2014 my daughter is wired after every episode. We switched to slower shows before bedtime and it made a real difference.' },
  { id: 'c5', name: 'Elena R.', initial: 'E', avatarBg: '#33A544', meta: 'Parent of a 2-year-old \u00b7 2 days ago', type: 'note', age: 'Under 5', video: 'Toddler Learning with Ms Rachel', videoId: 'msrachel', ts: '', moment: '', volume: 0, volumeLabel: '', tags: ['Watched together', 'Felt fine'], likes: 33,
    text: 'Reassuring analysis. The toy placement flag is fair \u2014 my toddler now points at the plush in stores. Otherwise this is the one channel I feel fully comfortable with.' },
];

const QUESTIONS = [
  { id: 'q2', title: 'Blippi flagged for very fast pacing \u2014 has anyone noticed it at home?', anchor: 'Blippi\u2019s Jurassic Puppy Show!', videoId: 'blippi', age: 'Under 5', seeded: true, replies: 12, topReply: { name: 'Priya S.', text: 'Yes \u2014 mine is wired after every episode. Slower shows before bed helped a lot.' }, expert: false },
  { id: 'q1', title: "Anyone else's 8yo asking about The Backrooms because of school?", anchor: 'The Backrooms (Found Footage)', videoId: 'backrooms', age: '5\u20138', seeded: false, replies: 6, topReply: { name: 'Dana M.', text: 'We watched the first 2 min together and talked about why it felt creepy, then skipped the rest.' }, expert: false },
  { id: 'q4', title: 'My 6yo has had nightmares after a few horror trailers \u2014 is this something to worry about?', anchor: 'Ages 5\u20138', videoId: '', age: '5\u20138', seeded: false, replies: 4, topReply: { name: 'Dr. Lena Ortiz', text: 'Occasional nightmares after scary content are common at this age. Keep a calm wind-down routine and revisit exposure gradually \u2014 reach out if it persists past two weeks.' }, expert: true },
  { id: 'q3', title: 'How do you handle MrBeast-style "subscribe to win" prompts with older kids?', anchor: 'Last To Leave Grocery Store, Wins $250,000', videoId: 'mrbeast', age: '9\u201312', seeded: false, replies: 8, topReply: { name: 'Kim H.', text: 'We turned it into a media-literacy chat about how giveaways farm subscriptions. Worked better than blocking.' }, expert: false },
];

const CIRCLES = [
  { id: 'circle1', name: 'Elwood District Preschool Parents', place: 'Elwood, VIC', age: '5\u20137', members: 14, watchlist: ['Ms. Rachel', 'Super Simple Songs', 'Blippi (slow eps)'], color: '#33A544' },
  { id: 'circle2', name: 'Grade 3 Class Parents \u2014 Northcote', place: 'Northcote, VIC', age: '8\u20139', members: 9, watchlist: ['Dude Perfect', 'Zach King', 'MrBeast (skip giveaways)'], color: '#423FE1' },
  { id: 'circle3', name: 'Sensitive-to-scares Crew', place: 'Virtual', age: 'All ages', members: 27, watchlist: ['Low-scare starter pack', 'Ms. Rachel', 'Super Simple Songs'], color: '#8848C1' },
];

const PANEL_STACK = [
  { i: 'JM', bg: '#E9F7EF', fg: '#1A7E22' },
  { i: 'DR', bg: '#EEF0FE', fg: '#423FE1' },
  { i: 'AK', bg: '#FDF0E2', fg: '#D8690E' },
  { i: 'MT', bg: '#F3EAFB', fg: '#8848C1' },
  { i: 'PS', bg: '#FDE7F1', fg: '#E41177' },
];

const PANEL_CHIPS = ['What should parents watch for?', 'Is it worth the screen time?', 'What age is this really for?'];

const PANEL_COMMENTS = [
  { id: 'p1', name: 'Jenna M.', initial: 'JM', badge: 'Mom of an 8-year-old', bg: '#E9F7EF', fg: '#1A7E22', time: '2d', helpful: 22, canReply: true,
    text: 'My 8-year-old loved the challenge format, but kept asking me to buy Coca-Cola for days after \u2014 the product placement is relentless. We used it to talk about how ads work.' },
  { id: 'p2', name: 'Priya S.', initial: 'PS', badge: 'Mom of a 7-year-old', bg: '#E9F7EF', fg: '#1A7E22', time: '1d', helpful: 5, canReply: false,
    text: 'Same here! We started pausing to count how many brands we could spot. Turned the ads into a little game and it actually helped.' },
  { id: 'p3', name: 'Tom B.', initial: 'TB', badge: 'Dad of a 9-year-old', bg: '#F3EAFB', fg: '#8848C1', time: '1d', helpful: 3, canReply: false,
    text: 'The Coca-Cola push was wild. Glad I\u2019m not the only one who clocked it.' },
  { id: 'p4', name: 'David R.', initial: 'DR', badge: 'Dad of a 6-year-old', bg: '#EEF0FE', fg: '#423FE1', time: '4d', helpful: 16, canReply: true,
    text: 'The pacing is intense. Mine was wired for a solid hour after one video. We now watch one MrBeast and then switch to something slower to wind down.' },
  { id: 'p5', name: 'Aisha K.', initial: 'AK', badge: 'Mom of a 10-year-old', bg: '#FDF0E2', fg: '#D8690E', time: '1w', helpful: 9, canReply: true,
    text: 'Honestly fine for my older one \u2014 she caught the sponsorship stuff on her own and rolled her eyes at it. I\u2019d be more careful with younger kids who take it at face value.' },
];

const PATTERNS = [
  { name: 'Rapid Swiping', score: 78, color: '#BD081C', desc: 'Skipped 47 videos in under 3 seconds this week. This is the pattern most worth addressing first.', dark: 'YouTube treats every split-second pause as a signal, then serves more eye-catching thumbnails to keep the swiping going.' },
  { name: 'Endless Shorts', score: 65, color: '#D8690E', desc: 'Long sessions of short clips can create a passive loop \u2014 20+ minutes without a natural stopping point.', dark: 'Shorts autoplay instantly with no "are you still watching?" \u2014 the feed is designed to never end.' },
  { name: 'Late-Night Sessions', score: 42, color: '#FFC60B', desc: '3 viewing sessions past 9 PM this week, competing directly with sleep.', dark: 'Autoplay has no bedtime. With no natural stopping point, a dark room becomes a rabbit hole.' },
  { name: 'Thumbnail Roulette', score: 31, color: '#33A544', desc: 'Channel variety looks healthy \u2014 hopping between channels is within the normal range.', dark: 'Bright, exaggerated thumbnails are optimized to trigger impulsive taps over intentional choices.' },
];

const CHANNELS = [
  { name: 'Mark Rober', mins: 45, badge: 'E', badgeBg: '#F2FEEE', badgeFg: '#1A7E22' },
  { name: 'SmarterEveryDay', mins: 32, badge: 'E', badgeBg: '#F2FEEE', badgeFg: '#1A7E22' },
  { name: 'Veritasium', mins: 28, badge: 'E', badgeBg: '#F2FEEE', badgeFg: '#1A7E22' },
  { name: 'MrBeast', mins: 52, badge: 'N', badgeBg: '#ECFAFF', badgeFg: '#423FE1' },
  { name: 'Dude Perfect', mins: 24, badge: 'N', badgeBg: '#ECFAFF', badgeFg: '#423FE1' },
  { name: '5-Minute Crafts', mins: 18, badge: 'J', badgeBg: '#FFF3E0', badgeFg: '#D8690E' },
];

const FIXES = [
  { name: 'Remove Shorts from Home', helps: 'rapid swiping, endless shorts' },
  { name: 'Make a Waiting-Time Kit', helps: 'rapid swiping, thumbnail roulette' },
  { name: 'Build a watchlist', helps: 'endless shorts, thumbnail roulette' },
  { name: 'Set screen-time downtime', helps: 'late-night sessions' },
];

const QUICK_TAGS = ['Wired after watching', 'Watched together', 'Skipped a part', 'Talked about it', 'Felt fine'];

const GENRE_VIDEO_SEEDS: Record<string, { name: string; age: string; color: string; vids: { ch: string; title: string; dur: string; overall: string; views: string; color: string; tags: string[] }[] }> = {
  music: { name: 'Music & Nursery Rhymes', age: '2+', color: '#3FA9D6', vids: [
    { ch: 'Ms. Rachel', title: 'Toddler Learning with Ms Rachel', dur: '28:14', overall: 'lower', views: '372M views', color: '#4AAE7C', tags: ['products'] },
    { ch: 'Fairy Tales and Stories for Kids', title: 'Mangita and Larina: A Magical Story', dur: '12:30', overall: 'moderate', views: '8.2M views', color: '#D8690E', tags: ['attention', 'violence'] },
    { ch: 'Cocomelon', title: 'Wheels on the Bus | Nursery Rhymes', dur: '3:42', overall: 'moderate', views: '312M views', color: '#2E8BC0', tags: ['attention', 'products'] },
    { ch: 'Pinkfong', title: 'Baby Shark Dance | Sing & Dance', dur: '2:17', overall: 'moderate', views: '13B views', color: '#F4A3C0', tags: ['attention'] },
    { ch: 'Super Simple Songs', title: 'Bath Song | Bedtime Routine', dur: '2:55', overall: 'lower', views: '2.1B views', color: '#7BC043', tags: ['attention'] },
  ] },
  challenge: { name: 'Challenge, Stunt & Comedy', age: '9+', color: '#E8843A', vids: [
    { ch: 'MrBeast', title: 'Last To Leave Grocery Store, Wins $250,000', dur: '16:24', overall: 'veryhigh', views: '143M views', color: '#2E6FB0', tags: ['attention', 'language', 'products'] },
    { ch: 'Chris and Jack', title: 'A vital message from your future self', dur: '8:07', overall: 'moderate', views: '2.1M views', color: '#423FE1', tags: ['attention'] },
    { ch: 'Dude Perfect', title: 'World Record Trick Shots Battle', dur: '12:03', overall: 'moderate', views: '61M views', color: '#1E88A8', tags: ['attention', 'products'] },
    { ch: 'LazarBeam', title: 'I Broke Minecraft With $10,000', dur: '10:41', overall: 'high', views: '18M views', color: '#3A7D2C', tags: ['language', 'attention'] },
    { ch: 'Zach King', title: 'Best Magic Tricks of 2026', dur: '8:12', overall: 'moderate', views: '44M views', color: '#D8690E', tags: ['attention', 'products'] },
  ] },
  gaming: { name: 'Gaming', age: '7+', color: '#8848C1', vids: [
    { ch: 'KreekCraft', title: 'So.. Roblox lied..', dur: '16:07', overall: 'high', views: '4.2M views', color: '#E8843A', tags: ['language', 'attention', 'violence'] },
    { ch: 'DanTDM', title: 'Minecraft Hardcore \u2014 The Final Boss', dur: '18:22', overall: 'moderate', views: '9.4M views', color: '#8848C1', tags: ['violence', 'attention'] },
    { ch: 'SSundee', title: "Among Us But I'm the Impostor", dur: '14:07', overall: 'moderate', views: '12M views', color: '#2E7D32', tags: ['language', 'attention'] },
    { ch: 'Aphmau', title: 'My Roommate is a VAMPIRE!', dur: '11:55', overall: 'moderate', views: '7.8M views', color: '#5E35B1', tags: ['violence', 'attention'] },
    { ch: 'LankyBox', title: 'Roblox DOORS \u2014 Full Playthrough', dur: '22:30', overall: 'high', views: '15M views', color: '#E8843A', tags: ['violence', 'attention', 'products'] },
  ] },
  pretend: { name: 'Pretend Play & Toys', age: '4+', color: '#43A047', vids: [
    { ch: 'Blippi', title: 'Blippi\u2019s Jurassic Puppy Show!', dur: '12:06', overall: 'moderate', views: '38M views', color: '#E88A2E', tags: ['attention', 'products'] },
    { ch: 'Kids Diana Show', title: 'Diana and Roma Pretend Play Shopping', dur: '9:14', overall: 'moderate', views: '89M views', color: '#43A047', tags: ['attention', 'products'] },
    { ch: "Ryan's World", title: 'Giant Egg Surprise Toy Hunt!', dur: '12:48', overall: 'moderate', views: '54M views', color: '#FBC02D', tags: ['products', 'attention'] },
    { ch: 'Vlad and Niki', title: 'Hide and Seek at the Playground', dur: '8:33', overall: 'moderate', views: '76M views', color: '#D8690E', tags: ['attention', 'products'] },
  ] },
  beauty: { name: 'Beauty, Makeup & ASMR', age: '13+', color: '#E41177', vids: [
    { ch: 'Gibi ASMR', title: 'A Very Important Private Jet Flight | Luxury Flight Attendant', dur: '27:40', overall: 'high', views: '2.4M views', color: '#8E24AA', tags: ['sex', 'products', 'drugs'] },
    { ch: 'James Charles', title: 'COME WITH ME TO COACHELLA 2026!', dur: '18:33', overall: 'veryhigh', views: '4.1M views', color: '#E41177', tags: ['language', 'sex', 'products'] },
    { ch: "Grace's Room", title: 'A Simple Day in My Life | Vlog', dur: '14:22', overall: 'high', views: '1.6M views', color: '#D8690E', tags: ['products', 'language'] },
    { ch: 'Bailey Sarian', title: 'Murder, Mystery & Makeup Monday', dur: '34:11', overall: 'high', views: '3.2M views', color: '#C2185B', tags: ['violence', 'language', 'products'] },
    { ch: 'Bretman Rock', title: 'Full Face Using ONLY Drugstore Makeup', dur: '19:02', overall: 'moderate', views: '5.1M views', color: '#D8690E', tags: ['language', 'products'] },
    { ch: 'Tati Westbrook', title: 'My Everyday Glam Routine 2026', dur: '22:15', overall: 'moderate', views: '1.8M views', color: '#5C6BC0', tags: ['products', 'drugs'] },
  ] },
};

const GENRE_PROFILES: Record<string, Record<string, number>> = {
  music:     { attention: 80, language: 6,  violence: 8,  sex: 4,  drugs: 3,  products: 58 },
  challenge: { attention: 88, language: 46, violence: 42, sex: 12, drugs: 16, products: 82 },
  gaming:    { attention: 72, language: 54, violence: 56, sex: 10, drugs: 12, products: 48 },
  pretend:   { attention: 82, language: 8,  violence: 15, sex: 5,  drugs: 4,  products: 74 },
  beauty:    { attention: 42, language: 40, violence: 6,  sex: 54, drugs: 32, products: 86 },
};

// ─── CATEGORY DATA ───────────────────────────────────────────────────────────

// Channels with real analyses available
const ANALYZED_CHANNELS = new Set([
  'blippi', 'ms. rachel', 'ms rachel', 'gibi asmr', 'mrbeast', 'james charles',
  'kreekcraft', 'chris and jack', 'grace\'s room', 'fairy tales and stories for kids',
  'kane pixels',
]);
function isAnalyzed(name: string) { return ANALYZED_CHANNELS.has(name.toLowerCase()); }

const CATEGORY_DATA = [
  { id: 'music', eyebrow: 'ages 2-4', name: 'Music & Nursery Rhymes', sample: 'Use these analyses to create Whitelist for YouTube Kids',
    accent: '#423FE1', tiles: [
      { name: 'Ms. Rachel', color: '#33A544', img: '/chan-music-2.webp' },
      { name: 'Fairy Tales and Stories for Kids', color: '#D8690E', img: '/cat-music-fairytales.webp' },
      { name: 'Cocomelon', color: '#423FE1', img: '/cat-music-0.webp' },
      { name: 'Pinkfong', color: '#1A7E22', img: '/cat-music-1.webp' },
      { name: 'Super Simple Songs', color: '#2B3A8E', img: '/cat-music-2.webp' },
      { name: 'ChuChu TV', color: '#D8690E', img: '/chan-music-0.webp' },
      { name: 'Little Baby Bum', color: '#FFC60B', img: '/chan-music-1.webp' },
    ] },
  { id: 'challenge', eyebrow: 'ages 8-11+', name: 'Challenge, Stunt & Comedy Entertainment', sample: 'Challenge videos, Stunts, Pranks & Comedy content popular among tweens',
    accent: '#D8690E', tiles: [
      { name: 'MrBeast', color: '#D8690E', img: '/cat-challenge-0.webp' },
      { name: 'Chris and Jack', color: '#423FE1', img: '/cat-challenge-chrisandjack.webp' },
      { name: 'Dude Perfect', color: '#FFC60B', img: '/cat-challenge-1.webp' },
      { name: 'LazarBeam', color: '#8848C1', img: '/cat-challenge-2.webp' },
      { name: 'Unspeakable', color: '#423FE1', img: '/chan-challenge-0.webp' },
      { name: '5-Minute Crafts', color: '#1A7E22', img: '/chan-challenge-1.webp' },
      { name: 'Zach King', color: '#E8843A', img: '/chan-challenge-2.webp' },
    ] },
  { id: 'gaming', eyebrow: 'ages 8-11+', name: 'Gaming', sample: 'Roblox, Minecraft, Gaming Streaming content popular among teens & pre-teens',
    accent: '#8848C1', tiles: [
      { name: 'KreekCraft', color: '#E8843A', img: '/cat-gaming-kreekcraft.webp' },
      { name: 'DanTDM', color: '#8848C1', img: '/cat-gaming-0.webp' },
      { name: 'Aphmau', color: '#423FE1', img: '/cat-gaming-1.webp' },
      { name: 'LankyBox', color: '#D8690E', img: '/cat-gaming-2.webp' },
      { name: 'SSundee', color: '#1A7E22', img: '/cat-gaming-ssundee.webp' },
      { name: 'Grian', color: '#FFC60B', img: '/cat-gaming-grian.webp' },
      { name: 'MrBeast Gaming', color: '#D8690E', img: '/cat-gaming-mrbeastgaming.webp' },
    ] },
  { id: 'pretend', eyebrow: 'ages 5-7, 8-11+', name: 'Pretend Play, Toys & Family Adventure', sample: 'Toy-Unboxing, Kids Pranks, Family creators content',
    accent: '#1A7E22', tiles: [
      { name: 'Blippi', color: '#E8843A', img: '/cat-pretend-blippi.webp' },
      { name: 'Kids Diana Show', color: '#1A7E22', img: '/cat-pretend-0.webp' },
      { name: 'Vlad and Niki', color: '#D8690E', img: '/cat-pretend-1.webp' },
      { name: 'Toy-Unboxing', color: '#423FE1', img: '/cat-pretend-2.webp' },
      { name: "Ryan's World", color: '#FFC60B', img: '/cat-pretend-ryansworld.webp' },
      { name: 'Toys and Colors', color: '#8848C1', img: '/cat-pretend-toysandcolors.webp' },
    ] },
  { id: 'beauty', eyebrow: 'ages 5-7, 8-11+', name: 'Beauty / Makeup / ASMR', sample: 'Makeup tutorials, GRWM, Shopping Hauls, ASMR, Beauty Vloggers content',
    accent: '#E41177', tiles: [
      { name: 'Gibi ASMR', color: '#8848C1', img: '/cat-beauty-2.webp' },
      { name: 'James Charles', color: '#E41177', img: '/cat-beauty-jamescharies.webp' },
      { name: "Grace's Room", color: '#D8690E', img: '/cat-beauty-gracesroom.webp' },
      { name: 'Bailey Sarian', color: '#E41177', img: '/cat-beauty-0.webp' },
      { name: 'Bretman Rock', color: '#D8690E', img: '/cat-beauty-1.webp' },
      { name: 'Tati Westbrook', color: '#423FE1', img: '/cat-beauty-tatiwestbrook.webp' },
      { name: 'Carli Bybel', color: '#FFC60B', img: '/cat-beauty-carlibybel.webp' },
      { name: 'GentleWhispering', color: '#1A7E22', img: '/cat-beauty-gentlewhispering.webp' },
    ] },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function hashStr(str: string) { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }

function fmt(s: number) { const m = Math.floor(s / 60); const sec = s % 60; return m + ':' + String(sec).padStart(2, '0'); }

function chipStyle(level: string) {
  const l = LEVELS[level];
  return { display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' as const, background: l.bg, color: l.fg };
}

function navStyle(active: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: '11px', width: '100%', padding: '10px 12px',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Lato',sans-serif",
    fontSize: '14px', textAlign: 'left', transition: 'background 120ms',
    background: active ? '#F2FEEE' : 'transparent', color: active ? '#1A7E22' : '#3B3B3C',
    fontWeight: active ? 700 : 500,
  };
}

function wlChipStyle(active: boolean): React.CSSProperties {
  return {
    border: '1px solid ' + (active ? '#33A544' : '#CCCCCC'), padding: '7px 14px', borderRadius: '999px',
    fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '13px', cursor: 'pointer',
    background: active ? '#33A544' : '#fff', color: active ? '#fff' : '#222',
  };
}

function segStyle(active: boolean): React.CSSProperties {
  return {
    border: 'none', padding: '8px 16px', borderRadius: '8px', fontFamily: "'Lato',sans-serif",
    fontWeight: 700, fontSize: '13px', cursor: 'pointer',
    background: active ? '#222222' : 'transparent', color: active ? '#fff' : '#222',
  };
}

function buildGenreVideos() {
  const labels: Record<string, string[]> = {
    attention: ['Rapid cuts and bright flashing colors', 'Loud sound effects and quick scene changes', 'Constant on-screen motion with no visual rest', 'Hyper-saturated colors and fast zooms'],
    language: ['Mild insult played for laughs', 'Brief crude word slips through', 'Name-calling between characters', 'Unbleeped mild profanity'],
    violence: ['Cartoon peril / mild scare moment', 'Tense chase sequence', 'Jump-scare style sound sting', 'Character in sudden danger'],
    sex: ['Flirtatious, suggestive tone', 'Whispered intimate roleplay framing', 'Mild innuendo in dialogue', 'Close personal-attention framing'],
    drugs: ['Adult drink visible in frame', 'Casual reference to going out drinking', 'Medication shown up close', 'Wine glass on the table'],
    products: ['Branded toy featured prominently', '"Link in description" purchase prompt', 'Sponsor read mid-video', 'Merch shown with a buy prompt'],
  };
  const catNotes: Record<string, string> = {
    attention: 'Fast pacing and sensory intensity younger kids may find overstimulating.',
    language: 'Occasional crude or insulting language.',
    violence: 'Scary or mildly violent moments.',
    sex: 'Suggestive or romantic framing.',
    drugs: 'Alcohol, medication, or substance references.',
    products: 'Brand promotion and purchase prompts.',
  };
  const out: Record<string, Analysis[]> = {};
  Object.entries(GENRE_VIDEO_SEEDS).forEach(([gid, g]) => {
    out[gid] = g.vids.map((v, vi) => {
      const durParts = v.dur.split(':');
      const durS = durParts.reduce((a, b) => a * 60 + Number(b), 0);
      const moments: { t: number; cat: string; label: string }[] = [];
      v.tags.forEach((k, ti) => {
        const n = 2 + (hashStr(v.ch + k) % 2);
        for (let j = 0; j < n; j++) {
          let t = Math.round(durS * ((ti + 1) / (v.tags.length + 1)) + j * 19);
          t = Math.max(6, Math.min(durS - 4, t));
          moments.push({ t, cat: k, label: labels[k][(hashStr(v.ch + k) + j) % labels[k].length] });
        }
      });
      moments.sort((a, b) => a.t - b.t);
      const cats = ['attention', 'language', 'violence', 'sex', 'drugs', 'products'].map(k => ({
        key: k, count: moments.filter(m => m.cat === k).length,
        note: catNotes[k] || "We didn't find anything of concern for this topic.",
      }));
      const tagShorts = v.tags.map(k => CATS[k]?.short || k);
      const summary = 'This ' + g.name.toLowerCase() + ' video from ' + v.ch + ' was flagged mainly for ' + tagShorts.slice(0, 2).join(' and ').toLowerCase() + '. ' + moments.length + ' moments were timestamped across the video so you can review or skip them.';
      // Map available thumbnail images by genre+index
      const thumbMap: Record<string, string> = {
        'music-0': '/vidthumb-music-v0.webp', 'music-1': '/vidthumb-music-v1.webp',
        'music-2': '/vidthumb-music-v2.webp', 'music-3': '/vidthumb-music-v3.webp',
        'music-4': '/vidthumb-music-v4.webp',
        'challenge-0': '/vidthumb-challenge-v0.webp', 'challenge-1': '/vidthumb-challenge-v1.webp',
        'challenge-2': '/vidthumb-challenge-v2.webp', 'challenge-3': '/vidthumb-challenge-v3.webp',
        'challenge-4': '/vidthumb-challenge-v4.webp',
        'gaming-0': '/vidthumb-gaming-v0.webp', 'gaming-1': '/vidthumb-gaming-v1.webp',
        'gaming-2': '/vidthumb-gaming-v2.webp', 'gaming-3': '/vidthumb-gaming-v3.webp',
        'gaming-4': '/vidthumb-gaming-v4.webp',
        'pretend-0': '/vidthumb-pretend-v0.webp', 'pretend-1': '/vidthumb-pretend-v1.webp',
        'pretend-2': '/vidthumb-pretend-v2.webp', 'pretend-3': '/vidthumb-pretend-v3.webp',
        'beauty-0': '/vidthumb-beauty-v0.webp', 'beauty-1': '/vidthumb-beauty-v1.webp',
        'beauty-2': '/vidthumb-beauty-v2.webp', 'beauty-3': '/vidthumb-beauty-v3.webp',
        'beauty-4': '/vidthumb-beauty-v4.webp', 'beauty-5': '/vidthumb-beauty-v5.webp',
      };
      const thumbKey = gid + '-' + vi;
      const thumb = thumbMap[thumbKey];
      return {
        id: gid + '-v' + vi, genre: gid, title: v.title, channel: v.ch,
        duration: v.dur, durS, views: v.views, age: g.age, overall: v.overall,
        thumbBg: v.color || g.color, thumb, when: 'recently', commentCount: 2 + (hashStr(v.title) % 20),
        blurb: 'Flagged for ' + tagShorts.slice(0, 2).join(' & ').toLowerCase() + '.',
        summary, moments, cats,
      };
    });
  });
  return out;
}

function catScores(name: string, genreId: string) {
  const base = GENRE_PROFILES[genreId] || { attention: 50, language: 30, violence: 30, sex: 20, drugs: 15, products: 50 };
  const out: Record<string, number> = {};
  ['attention', 'language', 'violence', 'sex', 'drugs', 'products'].forEach(k => {
    out[k] = Math.max(2, Math.min(100, (base[k] || 50) + ((hashStr(name + k) % 41) - 20)));
  });
  return out;
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function Dashboard() {
  const [screen, setScreenRaw] = useState('home');
  const [prevScreen, setPrevScreen] = useState('home');
  const screenRef = useRef('home');
  const setScreen = useCallback((s: string) => { setPrevScreen(screenRef.current); screenRef.current = s; setScreenRaw(s); }, []);
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [currentId, setCurrentId] = useState('backrooms');
  const [anSel, setAnSel] = useState<string[]>([]);
  const [childAdded, setChildAdded] = useState(false);
  const [obStep, setObStep] = useState(0);
  const [obName, setObName] = useState('');
  const [obAge, setObAge] = useState('');
  const [wlOpen, setWlOpen] = useState(false);
  const [wlGenres, setWlGenres] = useState<string[]>(['All genres']);
  const [wlOrder, setWlOrder] = useState('concern');
  const [wlAge, setWlAge] = useState('5\u20138');
  const [wlEmph, setWlEmph] = useState<string[]>([]);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [actTab, setActTab] = useState('feed');
  const [feedAge, setFeedAge] = useState('All ages');
  const [reacted, setReacted] = useState<Record<string, boolean>>({});
  const [joined, setJoined] = useState<Record<string, boolean>>({ circle1: true });
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [panelRec, setPanelRec] = useState<string | null>(null);
  const [panelLiked, setPanelLiked] = useState<Record<string, boolean>>({});
  const [composeActive, setComposeActive] = useState(false);
  const [currentGenre, setCurrentGenre] = useState('music');
  const [currentChannel, setCurrentChannel] = useState<{ name: string; color: string; genreName: string; genreId: string } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const genreVideosRef = useRef<Record<string, Analysis[]> | null>(null);
  if (!genreVideosRef.current) genreVideosRef.current = buildGenreVideos();
  const genreVideos = genreVideosRef.current;

  const allAnalyses = [...ANALYSES, ...Object.values(genreVideos).flat()];

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const analyze = useCallback(() => {
    if (analyzing) return;
    setAnalyzing(true);
    setScanStep(0);
    let step = 0;
    timerRef.current = setInterval(() => {
      step += 1;
      if (step >= 4) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setAnalyzing(false);
        setScreen('analysis');
        setCurrentId('backrooms');
        setUrl('');
      } else {
        setScanStep(step);
      }
    }, 750);
  }, [analyzing]);

  const goScreen = useCallback((s: string) => { setScreen(s); setMobileMenuOpen(false); }, []);

  // ─── Derived data ──────────────────────────────────────────────────────────

  const an = allAnalyses.find(a => a.id === currentId) || ANALYSES[0];
  const childName = childAdded ? (obName || 'Liam') : 'Liam';
  const childInitial = childName.charAt(0);
  const childAgeVal = obAge || '9';

  const titles: Record<string, string> = { home: 'Kids Safe Video Analyzer', analysis: 'Video Analysis', tedio: 'Watch History', watchlist: 'Creator Leaderboard', activity: 'Community', genre: 'Category', channel: 'Channel', allvideos: 'All Analyzed Videos', addchild: 'Add a Child' };

  const decorate = (a: Analysis) => ({
    ...a,
    overallLabel: LEVELS[a.overall]?.label || 'Moderate',
    chipSt: chipStyle(a.overall),
    flagCount: a.moments.length,
    initial: a.thumb ? '' : a.channel.charAt(0),
    hasThumb: !!a.thumb,
    tagsList: a.cats.filter(c => c.count > 0).map(c => CATS[c.key]?.short || c.key),
    bgStyle: a.thumb ? `url("${a.thumb}") center/cover no-repeat, ${a.thumbBg}` : a.thumbBg,
  });

  const recent = ['backrooms', 'blippi', 'msrachel', 'kreekcraft'].map(id => decorate(ANALYSES.find(a => a.id === id)!));
  const trending = TRENDING.map(t => ({ ...decorate(ANALYSES.find(a => a.id === t.id)!), viewers: t.viewers }));

  const curGenreData = CATEGORY_DATA.find(c => c.id === currentGenre) || CATEGORY_DATA[0];
  const curGenreVideos = (genreVideos[curGenreData.id] || []).map(decorate);

  const legendLevels = (['veryhigh', 'high', 'moderate', 'lower'] as const).map(k => ({ name: LEVELS[k].label, color: LEVELS[k].bg }));

  const CAT_ORDER = ['attention', 'sex', 'language', 'drugs', 'products', 'violence'];

  const anMoments = an.moments.map((m) => {
    const c = CATS[m.cat];
    return {
      ...m, time: fmt(m.t),
      pct: Math.round((m.t / an.durS) * 1000) / 10,
      color: c.color, catName: c.name, catSub: c.sub,
      catChipSt: { display: 'inline-flex', alignItems: 'center', padding: '4px 11px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, background: c.tint, color: c.fg } as React.CSSProperties,
    };
  });

  const anFind = CAT_ORDER.map(k => {
    const cat = CATS[k];
    const entry = an.cats.find(c => c.key === k) || { count: 0, note: "We didn't find anything of concern for this topic." };
    return {
      key: k, name: cat.name,
      nameColor: k === 'attention' ? '#222222' : cat.color,
      note: entry.note,
      countLabel: entry.count + (entry.count === 1 ? ' moment' : ' moments'),
      isNew: k === 'attention',
      levelTag: (k === 'attention' && entry.count > 0) ? LEVELS[an.overall]?.label.toUpperCase() : null,
    };
  });

  const anCatChecks = CAT_ORDER.map(k => {
    const count = an.moments.filter(m => m.cat === k).length;
    const checked = anSel.includes(k);
    return {
      key: k, name: CATS[k].name + ' (' + count + ')',
      checked,
      boxSt: {
        width: '22px', height: '22px', flex: '0 0 22px', borderRadius: '6px',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: 900,
        ...(checked ? { background: '#33A544', color: '#fff' } : { background: '#fff', color: 'transparent', border: '2px solid #CCCCCC' }),
      } as React.CSSProperties,
    };
  });

  const anShown = anMoments.filter(m => !anSel.length || anSel.includes(m.cat));

  const scanLabels = ['Fetching video and transcript', 'Scanning frames for flagged content', 'Scoring against the six-category rubric', 'Writing the parent summary'];
  const scanSteps = scanLabels.map((label, i) => ({
    label,
    mark: i < scanStep ? '\u2713' : (i === scanStep ? '\u2022' : '\u25CB'),
    color: i < scanStep ? '#1A7E22' : (i === scanStep ? '#222222' : '#999999'),
  }));

  // Creator leaderboard
  const rankVal: Record<string, number> = { veryhigh: 4, high: 3, moderate: 2, lower: 1 };
  const genreList = ['All genres', 'Music & Nursery Rhymes', 'Challenge, Stunt & Comedy Entertainment', 'Gaming', 'Pretend Play, Toys & Family Adventure', 'Beauty / Makeup / ASMR'];
  const emphList = ['Attention capture', 'Language', 'Sex & romance', 'Drinking & drugs', 'Violence & scariness', 'Product & purchases'];

  const emphScore = (c: Creator) => c.tags.filter(t => wlEmph.some(e => e.toLowerCase() === t.toLowerCase())).length;

  const creators = CREATORS
    .filter(c => wlGenres.includes('All genres') || c.genres.some(g => wlGenres.includes(g)))
    .slice()
    .sort((a, b) => (wlEmph.length ? emphScore(b) - emphScore(a) : 0) || (wlOrder === 'concern' ? (rankVal[b.level] || 0) - (rankVal[a.level] || 0) : (rankVal[a.level] || 0) - (rankVal[b.level] || 0)))
    .map((c, i) => {
      const l = LEVELS[c.level];
      const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return { ...c, rank: i + 1, slug, initial: c.name.charAt(0), levelLabel: l.label, pillSt: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: l.bg, color: l.fg } as React.CSSProperties };
    });

  const watchlistTop = creators.slice(0, 5);

  const toggleGenre = (g: string) => {
    if (g === 'All genres') { setWlGenres(['All genres']); return; }
    setWlGenres(prev => {
      let gs = prev.filter(x => x !== 'All genres');
      gs = gs.includes(g) ? gs.filter(x => x !== g) : [...gs, g];
      return gs.length ? gs : ['All genres'];
    });
  };

  const toggleEmph = (g: string) => {
    setWlEmph(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  // Comments
  const commentsList = COMMENTS.map(cm => ({
    ...cm,
    likesCount: cm.likes + (liked[cm.id] ? 1 : 0),
    likeColor: liked[cm.id] ? '#1A7E22' : '#757575',
    isHeadsUp: cm.type === 'headsup',
    hasMoment: !!cm.ts,
    hasVolume: cm.volume > 0,
    volumeText: cm.volume + ' ' + cm.volumeLabel,
    cardBorder: cm.type === 'headsup' ? '#D8690E' : '#EFEFEF',
    cardBg: cm.type === 'headsup' ? '#FFF9F2' : '#fff',
  }));
  const feedSorted = [...commentsList].sort((a, b) => (b.type === 'headsup' ? 1 : 0) - (a.type === 'headsup' ? 1 : 0));
  const feed = feedSorted.filter(cm => feedAge === 'All ages' || cm.age === feedAge);
  const feedAgeOptions = ['All ages', 'Under 5', '5\u20138', '9\u201312', '13+'];

  // Panel comments
  const panelCommentsList = PANEL_COMMENTS.map(pc => ({
    ...pc,
    helpfulCount: pc.helpful + (panelLiked[pc.id] ? 1 : 0),
    helpfulColor: panelLiked[pc.id] ? '#1A7E22' : '#757575',
  }));

  const recBtn = (val: string): React.CSSProperties => ({
    width: '44px', height: '44px', flex: '0 0 44px', borderRadius: '999px',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', background: '#fff',
    border: '1px solid ' + (panelRec === val ? '#33A544' : '#CCCCCC'),
    color: panelRec === val ? '#1A7E22' : '#757575',
  });

  const tedioTeaser = childAdded ? '2 of 4 patterns need your attention.' : 'Too many videos to vet one by one?';
  const tedioTeaserBody = childAdded ? 'Rapid Swiping is at 78% \u2014 worth a conversation this week.' : "Add your kid's watch history and we'll flag channels, videos, and activity that may need a closer look.";
  const tedioTeaserCta = childAdded ? `See ${childName}'s report` : 'Set up Watch History';

  // Channel detail
  let channelMaster: {
    name: string; age: string; views: string; initial: string; levelLabel: string;
    avatarTint: string; avatarFg: string; blurb: string; summary: string;
    pillSt: React.CSSProperties; catStats: { key: string; label: string; color: string; score: number; avg: number; ratio: number; vs: string; vsColor: string; avgPct: number }[];
    genreName: string;
  } | null = null;
  let channelVideosList: ReturnType<typeof decorate>[] = [];

  if (currentChannel) {
    const cc = currentChannel;
    const match = CREATORS.find(cr => cr.name.toLowerCase() === cc.name.toLowerCase());
    const base = match || { name: cc.name, age: '', views: 'Channel analysis \u00b7 YouTube', level: 'moderate', avatarTint: '#F1F1F1', avatarFg: '#3B3B3C', blurb: 'We reviewed this channel against our six-category content rubric.', tags: [] };
    const l = LEVELS[base.level];
    const genreObj = CATEGORY_DATA.find(c => c.id === cc.genreId) || CATEGORY_DATA[0];
    const keys: [string, string][] = [['attention', 'Attention capture'], ['language', 'Language'], ['violence', 'Violence & scariness'], ['sex', 'Sexual content'], ['drugs', 'Drinking & drugs'], ['products', 'Product placement']];
    const mine = catScores(cc.name, cc.genreId);
    const avg: Record<string, number> = {};
    keys.forEach(([k]) => { avg[k] = Math.round(genreObj.tiles.reduce((sum, t) => sum + catScores(t.name, cc.genreId)[k], 0) / genreObj.tiles.length); });
    const catStats = keys.map(([k, label]) => {
      const score = mine[k], a = avg[k] || 1, ratio = score / a;
      let vs: string, vsColor: string;
      if (ratio >= 1.4) { vs = (Math.round(ratio * 10) / 10) + '\u00d7 category avg'; vsColor = '#BD081C'; }
      else if (ratio <= 0.7) { vs = 'below category avg'; vsColor = '#1A7E22'; }
      else { vs = 'near category avg'; vsColor = '#757575'; }
      return { key: k, label, color: CATS[k]?.color || '#999', score, avg: a, ratio, vs, vsColor, avgPct: Math.min(100, a) };
    });
    const sorted = [...catStats].sort((x, y) => y.ratio - x.ratio);
    const top = sorted[0], low = sorted[sorted.length - 1];
    const summary = 'Across its analyzed videos, ' + cc.name + ' runs highest on ' + top.label.toLowerCase() + ' \u2014 ' + (Math.round(top.ratio * 10) / 10) + '\u00d7 the average ' + genreObj.name.toLowerCase() + ' channel \u2014 while ' + low.label.toLowerCase() + ' stays well below the pack.';

    channelMaster = {
      name: base.name, age: base.age, views: base.views, initial: cc.name.charAt(0),
      levelLabel: l.label, genreName: cc.genreName,
      avatarTint: match ? (match as Creator).avatarTint : (cc.color || '#F1F1F1'),
      avatarFg: match ? (match as Creator).avatarFg : '#fff',
      blurb: base.blurb, summary, catStats,
      pillSt: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: l.bg, color: l.fg } as React.CSSProperties,
    };

    let vids = allAnalyses.filter(a => a.channel.toLowerCase() === cc.name.toLowerCase().trim());
    if (!vids.length) {
      // Generate fake videos attributed to this specific creator
      const genreVids = genreVideos[cc.genreId] || [];
      vids = genreVids.slice(0, 4).map((v, i) => ({
        ...v,
        id: cc.name.toLowerCase().replace(/\s+/g, '-') + '-v' + i,
        channel: cc.name,
      }));
    }
    channelVideosList = vids.map(decorate);
  }

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="csm-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F7F7F7', fontFamily: "var(--font-lato),'Lato',-apple-system,sans-serif", color: '#222222' }}>

      {/* ============ SIDEBAR ============ */}
      <nav className={`csm-sidebar${mobileMenuOpen ? ' csm-sidebar--open' : ''}`} style={{ width: '236px', flex: '0 0 236px', background: '#FFFFFF', borderRight: '1px solid #EFEFEF', display: 'flex', flexDirection: 'column', padding: '20px 14px 16px' }}>
        <button className="csm-mobile-bar" onClick={() => setMobileMenuOpen(false)} style={{ alignSelf: 'flex-end', border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer', padding: '4px 8px', color: '#757575' }}>&times;</button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/horizontal-fullcolor.svg" alt="Common Sense Media" onClick={() => goScreen('home')} style={{ width: '170px', margin: '4px 8px 6px', cursor: 'pointer' }} />
        <div style={{ margin: '2px 8px 22px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#33A544' }}>YouTube Family Dashboard</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <button onClick={() => goScreen('home')} style={navStyle(screen === 'home' || screen === 'analysis' || screen === 'genre' || screen === 'channel')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path><polygon points="9 8.5 14 11 9 13.5 9 8.5" fill="currentColor" stroke="none"></polygon></svg>
            Video Analyzer
          </button>
          <button onClick={() => goScreen('watchlist')} style={navStyle(screen === 'watchlist')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path></svg>
            Creator Leaderboard
          </button>
          <button onClick={() => goScreen('tedio')} style={navStyle(screen === 'tedio')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Watch History
          </button>
        </div>

        <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid #EFEFEF' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#757575', padding: '0 10px 8px' }}>My Kids</div>
          {childAdded ? (
            <button onClick={() => goScreen('tedio')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 10px', border: 'none', background: 'transparent', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: '30px', height: '30px', borderRadius: '999px', background: '#33A544', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>{childInitial}</span>
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#222' }}>{childName}</span>
                <span style={{ fontSize: '12px', color: '#757575' }}>Age {childAgeVal} \u00b7 YouTube</span>
              </span>
            </button>
          ) : (
            <button onClick={() => goScreen('addchild')} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', border: '1px dashed #CCCCCC', background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#757575', fontFamily: "'Lato',sans-serif" }}>
              <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span> Add a child profile
            </button>
          )}
        </div>

        <div style={{ marginTop: 'auto', padding: '12px 10px 0', borderTop: '1px solid #EFEFEF', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '12px', color: '#757575', lineHeight: 1.5 }}>Every analysis you run helps other parents, too.</div>
          <a href="#" style={{ fontSize: '13px', fontWeight: 700, color: '#222' }}>How we rate videos</a>
        </div>
      </nav>

      {/* ============ MAIN COLUMN ============ */}
      <div className="csm-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header className="csm-header" style={{ height: '60px', flex: '0 0 60px', background: '#FFFFFF', borderBottom: '1px solid #EFEFEF', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 28px' }}>
          <button className="csm-mobile-bar" onClick={() => setMobileMenuOpen(true)} style={{ border: 'none', background: 'transparent', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"></path></svg>
          </button>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#222' }}>{titles[screen] || 'Dashboard'}</div>
          <div style={{ marginLeft: 'auto' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '32px', height: '32px', borderRadius: '999px', background: '#222222', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>P</span>
          </div>
        </header>

        {/* Scrollable content */}
        <main ref={mainRef} style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

          {/* ================= HOME / ANALYZER ================= */}
          {screen === 'home' && (
            <div>
              {/* VARIANT A: FOCUS */}
              <section className="csm-hero-section" style={{ background: '#F2FEEE', padding: '44px 40px 40px', borderBottom: '1px solid #EFEFEF', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                  <img src="/hero-banner.webp" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(255,255,255,0.78), rgba(255,255,255,0.62))', pointerEvents: 'none' }}></div>
                <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                  <h1 className="csm-hero-title" style={{ fontFamily: "var(--font-source-serif),'Source Serif Pro',Georgia,serif", fontWeight: 400, fontSize: '42px', lineHeight: 1.15, letterSpacing: '-0.5px', color: '#33A544', margin: 0 }}>Know what&apos;s in it before they press play.</h1>
                  <p className="csm-hero-desc" style={{ fontSize: '16px', lineHeight: '24px', color: '#3B3B3C', maxWidth: '560px', margin: 0 }}>Paste any YouTube link. We&apos;ll flag every scene worth knowing about &mdash; violence, language, ads, overstimulation &mdash; with exact timestamps.</p>
                  <div className="csm-hero-input-row" style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '640px', marginTop: '8px' }}>
                    <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste a YouTube link — e.g. youtube.com/watch?v=…" style={{ flex: 1, height: '50px', borderRadius: '12px', background: '#fff', border: '1px solid #CCCCCC', padding: '0 16px', fontFamily: "'Lato',sans-serif", fontSize: '14px', color: '#222', outline: 'none' }} />
                    <button onClick={analyze} style={{ height: '50px', padding: '0 28px', borderRadius: '12px', background: '#1A7E22', color: '#fff', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer', transition: 'background 120ms' }}>Analyze Video</button>
                  </div>
                  <div style={{ fontSize: '12px', color: '#757575' }}>Free for families · Results shared with the parent community</div>
                </div>
              </section>

              <div className="csm-home-grid" style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 40px 48px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(260px,320px)', gap: '28px', alignItems: 'start' }}>
                <section>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <h5 style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#222', margin: 0 }}>Trending Categories</h5>
                    <a href="#" onClick={(e) => { e.preventDefault(); setScreen('allvideos'); }} style={{ fontSize: '13px', fontWeight: 700 }}>View all</a>
                  </div>
                  <p style={{ fontSize: '13px', color: '#757575', margin: '0 0 16px' }}>The content types kids are watching most, grouped by age and creator.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {CATEGORY_DATA.map(cat => (
                      <div key={cat.id} onClick={() => { setCurrentGenre(cat.id); setScreen('genre'); }} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', alignItems: 'center', background: '#ECFAFF', borderRadius: '12px', overflow: 'hidden', border: '1px solid #EFEFEF', cursor: 'pointer' }}>
                        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '200px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, padding: 0, borderRadius: '4px', overflow: 'hidden' }}>
                          {cat.tiles.slice(0, 3).map((tile, ti) => (
                            <div key={ti} style={{ position: 'relative', height: '140px', display: 'flex', alignItems: 'flex-end', padding: '6px 7px', overflow: 'hidden', background: tile.color }}>
                              {(tile as {img?: string}).img && <img src={(tile as {img?: string}).img} alt={tile.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                              <span style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0) 75%)' }}></span>
                              <span style={{ position: 'relative', zIndex: 2, pointerEvents: 'none', color: '#fff', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '10px', lineHeight: 1.15, textShadow: '0 1px 2px rgba(0,0,0,.5)' }}>{tile.name}</span>
                            </div>
                          ))}
                          <span style={{ position: 'absolute', top: '9px', left: '9px', zIndex: 3, display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '999px', color: '#fff', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '9px', letterSpacing: '.04em', textTransform: 'uppercase', boxShadow: '0 2px 6px rgba(0,0,0,.2)', background: cat.accent }}>On Demand</span>
                        </div>
                        <div style={{ flex: '1 1 200px', minWidth: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '5px', padding: '14px 18px' }}>
                          <div style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: cat.accent }}>{cat.eyebrow}</div>
                          <div style={{ fontFamily: "var(--font-source-serif),'Source Serif Pro',Georgia,serif", fontWeight: 700, fontSize: '19px', lineHeight: 1.15, color: '#222' }}>{cat.name}</div>
                          <div style={{ fontSize: '12px', color: '#757575', lineHeight: 1.45 }}>{cat.sample}</div>
                        </div>
                      </div>
                    ))}
                  </div>
{/* "See all categories" removed per design update */}
                </section>

                <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <section style={{ background: '#222222', borderRadius: '12px', padding: '20px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h5 style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FFC60B', margin: 0 }}>Watch History</h5>
                    <div style={{ fontFamily: "var(--font-source-serif),'Source Serif Pro',Georgia,serif", fontSize: '22px', lineHeight: 1.25 }}>{tedioTeaser}</div>
                    <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'rgba(255,255,255,0.75)', margin: 0 }}>{tedioTeaserBody}</p>
                    <button onClick={() => goScreen('tedio')} style={{ alignSelf: 'flex-start', marginTop: '4px', padding: '8px 20px', borderRadius: '8px', background: '#33A544', color: '#fff', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer' }}>{tedioTeaserCta}</button>
                  </section>
                </aside>
              </div>
            </div>
          )}

          {/* ================= ANALYSIS DETAIL ================= */}
          {screen === 'analysis' && (() => {
            const an = allAnalyses.find(a => a.id === currentId) || allAnalyses[0];
            const realUrl = getRealAnalysisUrl(an.channel) || getRealAnalysisUrl(an.id);
            return realUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ padding: '12px 40px 0' }}>
                <button onClick={() => { const dest = prevScreen === 'genre' || prevScreen === 'channel' || prevScreen === 'allvideos' ? prevScreen : 'home'; setScreen(dest); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', fontFamily: "'Lato',sans-serif", fontSize: '13px', fontWeight: 700, color: '#757575', cursor: 'pointer', padding: '0 0 8px' }}>&larr; {prevScreen === 'genre' ? `Back to ${curGenreData.name}` : prevScreen === 'channel' && currentChannel ? `Back to ${currentChannel.name}` : prevScreen === 'allvideos' ? 'Back to All Videos' : 'Back to Analyzer'}</button>
              </div>
              <iframe src={realUrl} style={{ flex: 1, width: '100%', border: 'none', minHeight: 'calc(100vh - 120px)' }} title="Video Analysis" />
              <div style={{ display: 'none' }}>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '28px', alignItems: 'start', marginBottom: '28px' }}>
                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '6px', background: decorate(an).bgStyle, position: 'relative', overflow: 'hidden' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3B3B3C' }}>
                    <svg width="22" height="16" viewBox="0 0 24 17" fill="none"><rect width="24" height="17" rx="4" fill="#FF0000"></rect><polygon points="9.5 4.5 16.5 8.5 9.5 12.5" fill="#fff"></polygon></svg>
                    <span>YouTube Video</span>
                    <span style={{ color: '#CCCCCC' }}>|</span>
                    <span>{an.duration}</span>
                    <span style={{ color: '#CCCCCC' }}>|</span>
                    <span>{an.views}</span>
                  </div>
                  <h1 style={{ fontFamily: "'Lato',sans-serif", fontWeight: 800, fontSize: 'clamp(24px, 3.4vw, 38px)', lineHeight: 1.15, color: '#222', margin: 0 }}>{an.title}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"></path></svg>
                    <a href="#" style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#423FE1', textDecoration: 'none' }}>{an.channel}</a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <span style={chipStyle(an.overall)}>{LEVELS[an.overall]?.label}&nbsp;concern</span>
                    <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '8px', border: '1px solid #CCCCCC', fontSize: '12px', fontWeight: 700, color: '#222' }}>Rated for ages {an.age}</span>
                  </div>
                </div>
              </div>

              {/* Social proof bar */}
              <button onClick={() => setPanelOpen(true)} style={{ width: '100%', textAlign: 'left', background: '#F2FEEE', border: '1px solid #CDEBC6', borderRadius: '999px', padding: '14px 18px', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', cursor: 'pointer', fontFamily: "'Lato',sans-serif" }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {PANEL_STACK.map((p, i) => (
                    <span key={i} style={{ width: '34px', height: '34px', borderRadius: '999px', background: p.bg, color: p.fg, border: '2px solid #F2FEEE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px', marginRight: '-10px' }}>{p.i}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: '1 1 240px', minWidth: 0 }}>
                  <span style={{ fontSize: '17px', fontWeight: 700, color: '#1A5E24' }}>You&apos;re not the first parent to land here &mdash; 10,572 families checked this.</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#33A544' }}><span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#33A544' }}></span>95 parents reading this with you right now</span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#1A7E22', color: '#fff', fontWeight: 700, fontSize: '15px', padding: '12px 24px', borderRadius: '999px', whiteSpace: 'nowrap' }}>See what other parents said next
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px', alignItems: 'start', marginBottom: '20px' }}>
                {/* Parents Need to Know */}
                <section style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '8px', padding: '28px 30px' }}>
                  <h3 style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '22px', color: '#222', margin: 0 }}>Parents Need to Know</h3>
                  <div style={{ height: '1px', background: '#EFEFEF', margin: '16px 0 18px' }}></div>
                  <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#222', margin: 0 }}>{an.summary}</p>
                  <button onClick={() => setPanelOpen(true)} style={{ marginTop: '18px', border: 'none', background: 'transparent', padding: 0, fontFamily: "'Lato',sans-serif", fontSize: '13px', fontStyle: 'italic', color: '#3B3B3C', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>See what other parents said ({an.commentCount})</button>
                </section>

                {/* What Did We Find? */}
                <section style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ padding: '24px 28px 14px' }}>
                    <h3 style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '22px', color: '#222', margin: 0 }}>What Did We Find?</h3>
                  </div>
                  {anFind.map(f => {
                    const isExpanded = anSel.includes(f.key);
                    const moments = anMoments.filter(m => m.cat === f.key);
                    const isAttention = f.key === 'attention';
                    return (
                    <div key={f.key} style={{ borderTop: '1px solid #EFEFEF', background: isAttention && moments.length > 0 ? CATS.attention.tint : 'transparent' }}>
                      <button onClick={() => setAnSel(prev => prev.includes(f.key) ? prev.filter(x => x !== f.key) : [...prev, f.key])} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '16px', alignItems: 'start', width: '100%', textAlign: 'left', border: 'none', background: 'transparent', padding: isAttention && moments.length > 0 ? '16px 28px 12px' : '16px 28px', cursor: 'pointer', fontFamily: "'Lato',sans-serif" }}>
                        <span style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isAttention && moments.length > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: CATS.attention.color, flexShrink: 0 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></span>}
                            <span style={{ fontSize: '17px', fontWeight: 700, color: f.nameColor }}>{f.name}</span>
                            {f.isNew && <span style={{ background: '#423FE1', color: '#fff', fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em', padding: '2px 7px', borderRadius: '5px' }}>NEW</span>}
                          </span>
                          <span style={{ fontSize: '13px', lineHeight: 1.5, color: '#3B3B3C' }}>{f.note}</span>
                        </span>
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          {f.levelTag && <span style={{ color: '#D8690E', fontWeight: 800, fontSize: '12px', letterSpacing: '0.06em' }}>{f.levelTag}</span>}
                          <span style={{ fontSize: '12px', color: '#757575', whiteSpace: 'nowrap' }}>{f.countLabel}</span>
                          <span style={{ color: '#999999', fontSize: '16px', lineHeight: 1, transition: 'transform 150ms', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>&rsaquo;</span>
                        </span>
                      </button>
                      {isExpanded && moments.length > 0 && (
                        <div style={{ padding: '0 28px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {moments.map((m, mi) => (
                            <div key={mi} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 14px', background: '#fff', borderRadius: '8px', border: '1px solid #E8E8E8' }}>
                              <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '3px 8px', borderRadius: '6px', background: CATS[f.key]?.tint || '#F2F2F2', color: CATS[f.key]?.fg || '#222', fontSize: '12px', fontWeight: 700, fontFamily: "'Lato',sans-serif" }}>{m.time}</span>
                              <span style={{ fontSize: '13px', lineHeight: 1.5, color: '#222' }}>{m.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    );
                  })}
                </section>
              </div>

              <div style={{ background: '#ECFAFF', border: '1px solid #D5EEF9', borderRadius: '8px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#423FE1"><path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z"></path></svg>
                <span style={{ fontSize: '13px', color: '#222' }}>This is an experimental AI analysis based on childhood development research. <a href="#" style={{ color: '#423FE1' }}>Give us feedback.</a></span>
              </div>

              {/* Flagged Moments */}
              <section style={{ background: '#F7F7F7', border: '1px solid #E8E8E8', borderRadius: '12px', padding: '22px 24px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#423FE1"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><rect x="3" y="2" width="2" height="20" rx="1"></rect></svg>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#423FE1' }}>{an.moments.length} Flagged Moments</span>
                  <button onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} style={{ marginLeft: 'auto', border: 'none', background: 'transparent', fontFamily: "'Lato',sans-serif", fontSize: '13px', fontWeight: 700, color: '#3B3B3C', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>&uarr; Back to top</button>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {anCatChecks.map(t => (
                    <button key={t.key} onClick={() => setAnSel(prev => prev.includes(t.key) ? prev.filter(x => x !== t.key) : [...prev, t.key])} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', border: '1px solid #E0E0E0', borderRadius: '10px', padding: '12px 16px', cursor: 'pointer', fontFamily: "'Lato',sans-serif", fontSize: '14px', fontWeight: 600, color: '#222' }}>
                      <span>{t.name}</span>
                      <span style={t.boxSt}>{t.checked ? '\u2713' : ''}</span>
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px', alignItems: 'start' }}>
                  {/* Player mock */}
                  <div>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', borderRadius: '12px', overflow: 'hidden', background: an.thumbBg }}>
                      {an.thumb && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={an.thumb} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0) 35%)', pointerEvents: 'none' }}></div>
                      <div style={{ position: 'absolute', top: '14px', left: '16px', color: '#fff' }}>
                        <div style={{ fontSize: '17px', fontWeight: 700 }}>{an.title}</div>
                        <div style={{ fontSize: '12px', opacity: 0.85 }}>{an.channel}</div>
                      </div>
                      <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '64px', height: '46px', borderRadius: '12px', background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><polygon points="7 4 21 12 7 20"></polygon></svg></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '16px' }}>
                      <span style={{ width: '36px', height: '36px', flex: '0 0 36px', borderRadius: '999px', background: '#222222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><polygon points="7 4 21 12 7 20"></polygon></svg></span>
                      <div style={{ position: 'relative', flex: 1, height: '28px' }}>
                        <div style={{ position: 'absolute', left: 0, right: 0, top: '18px', height: '7px', borderRadius: '999px', background: '#E0E0E0' }}></div>
                        {anShown.map((m, i) => (
                          <button key={i} title={`${m.time} \u2014 ${m.label}`} style={{ position: 'absolute', top: 0, left: `${m.pct}%`, transform: 'translateX(-50%)', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ display: 'block', width: '14px', height: '14px', borderRadius: '999px', background: m.color }}></span>
                            <span style={{ display: 'block', width: '3px', height: '8px', background: m.color, borderRadius: '0 0 2px 2px' }}></span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Moment cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <button style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#423FE1', color: '#fff', border: 'none', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><polygon points="7 4 21 12 7 20"></polygon></svg> Play All Moments
                    </button>
                    {anShown.map((m, i) => (
                      <div key={i} style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: '#222' }}>1 flagged moment</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1A7E22', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '5px 13px', borderRadius: '999px', fontVariantNumeric: 'tabular-nums' }}><svg width="9" height="9" viewBox="0 0 24 24" fill="#fff"><polygon points="7 4 21 12 7 20"></polygon></svg>{m.time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flexWrap: 'wrap' }}>
                          <span style={m.catChipSt}>{m.catName}</span>
                          <span style={{ fontSize: '13px', color: '#3B3B3C' }}>{m.catSub}</span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#222', lineHeight: 1.5 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              </div>
            </div>
            ) : (
            <div style={{ maxWidth: '560px', margin: '80px auto', padding: '0 24px' }}>
              <div style={{ padding: '12px 0 0' }}>
                <button onClick={() => { const dest = prevScreen === 'genre' || prevScreen === 'channel' || prevScreen === 'allvideos' ? prevScreen : 'home'; setScreen(dest); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', fontFamily: "'Lato',sans-serif", fontSize: '13px', fontWeight: 700, color: '#757575', cursor: 'pointer', padding: '0 0 16px' }}>&larr; {prevScreen === 'genre' ? `Back to ${curGenreData.name}` : prevScreen === 'channel' && currentChannel ? `Back to ${currentChannel.name}` : prevScreen === 'allvideos' ? 'Back to All Videos' : 'Back to Analyzer'}</button>
              </div>
              <section style={{ background: '#fff', border: '1px solid #33A544', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', padding: '40px 36px 36px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', alignItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '999px', background: '#F2FEEE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#33A544" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                </div>
                <h2 style={{ fontFamily: "var(--font-source-serif),'Source Serif Pro',Georgia,serif", fontWeight: 400, fontSize: '28px', lineHeight: 1.2, color: '#222', margin: 0 }}>This video hasn&apos;t been analyzed yet</h2>
                <p style={{ fontSize: '15px', lineHeight: 1.55, color: '#3B3B3C', margin: 0, maxWidth: '380px' }}>
                  <strong>{an.title}</strong> by {an.channel} is in our queue. Be the first parent to request a full analysis.
                </p>
                <button onClick={() => goScreen('home')} style={{ height: '48px', padding: '0 28px', borderRadius: '12px', background: '#1A7E22', color: '#fff', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer' }}>Analyze this video</button>
                <div style={{ fontSize: '12px', color: '#757575' }}>Paste the YouTube link on the home screen to start.</div>
              </section>
            </div>
            );
          })()}

          {/* ================= GENRE DETAIL ================= */}
          {screen === 'genre' && (
            <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '24px 40px 56px' }}>
              <button onClick={() => goScreen('home')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', fontFamily: "'Lato',sans-serif", fontSize: '13px', fontWeight: 700, color: '#3B3B3C', cursor: 'pointer', padding: 0, marginBottom: '18px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
                All categories
              </button>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <div style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: curGenreData.accent }}>{curGenreData.eyebrow}</div>
              </div>
              <h1 style={{ fontFamily: "var(--font-source-serif),'Source Serif Pro',Georgia,serif", fontWeight: 400, fontSize: '34px', lineHeight: 1.2, color: '#222', margin: '0 0 6px' }}>{curGenreData.name}</h1>
              <p style={{ fontSize: '14px', color: '#757575', margin: '0 0 32px', maxWidth: '640px' }}>{curGenreData.sample}</p>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h5 style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#222', margin: 0 }}>Popular video analyses</h5>
                <span style={{ fontSize: '13px', color: '#757575' }}>{curGenreVideos.length} analyzed</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '22px', marginBottom: '44px' }}>
                {curGenreVideos.map(v => {
                  const hasAnalysis = isAnalyzed(v.channel);
                  return (
                  <button key={v.id} onClick={() => { if (hasAnalysis) { setCurrentId(v.id); setAnSel([]); setScreen('analysis'); } }} style={{ textAlign: 'left', background: '#fff', border: hasAnalysis ? '2px solid #33A544' : '1px solid #EFEFEF', borderRadius: '12px', padding: '10px 10px 14px', fontFamily: "'Lato',sans-serif", cursor: hasAnalysis ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', gap: '9px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', opacity: hasAnalysis ? 1 : 0.5 }}>
                    <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', background: v.thumbBg }}>
                      {v.thumb && <img src={v.thumb} alt={v.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                      <span style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 2, background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>{v.duration}</span>
                      {hasAnalysis && (
                        <span style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: '#33A544', color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: "'Lato',sans-serif" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          Analyzed
                        </span>
                      )}
                      {!hasAnalysis && (
                        <span style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 3, display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.55)', color: '#ccc', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: "'Lato',sans-serif" }}>Example</span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#757575' }}>YouTube Video</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ width: '22px', height: '22px', flex: '0 0 22px', borderRadius: '999px', background: v.thumbBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '11px', overflow: 'hidden' }}>{v.channel.charAt(0)}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#423FE1' }}>{v.channel}</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 400, color: '#222', lineHeight: 1.35 }}>{v.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px 10px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 700, color: '#423FE1' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="#423FE1"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><rect x="3" y="2" width="2" height="20" rx="1"></rect></svg>
                        {v.flagCount} Flagged Moments
                      </span>
                      {v.tagsList.map((tag, ti) => (
                        <span key={ti} style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: '#F2F2F2', color: '#3B3B3C' }}>{tag}</span>
                      ))}
                    </div>
                  </button>
                  );
                })}
              </div>

              <h5 style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#222', margin: '0 0 6px' }}>Browse by channel</h5>
              <p style={{ fontSize: '13px', color: '#757575', margin: '0 0 16px' }}>Jump into every analysis from a specific creator in this category.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                {curGenreData.tiles.map((ch, i) => {
                  const hasAnalysis = isAnalyzed(ch.name);
                  return (
                  <div key={i} onClick={() => { if (hasAnalysis) { setCurrentChannel({ name: ch.name, color: ch.color, genreName: curGenreData.name, genreId: curGenreData.id }); setScreen('channel'); } }} style={{ position: 'relative', aspectRatio: '2/3', borderRadius: '10px', overflow: 'hidden', cursor: hasAnalysis ? 'pointer' : 'default', background: ch.color, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', opacity: hasAnalysis ? 1 : 0.5, filter: hasAnalysis ? 'none' : 'grayscale(0.4)' }}>
                    {(ch as {img?: string}).img && <img src={(ch as {img?: string}).img} alt={ch.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <span style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0) 68%)' }}></span>
                    {hasAnalysis ? (
                      <span style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: '#33A544', color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: "'Lato',sans-serif" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Analyzed
                      </span>
                    ) : (
                      <span style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 3, display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', color: '#ccc', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: "'Lato',sans-serif" }}>Coming soon</span>
                    )}
                    <span style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', zIndex: 2, pointerEvents: 'none', color: '#fff', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '15px', lineHeight: 1.2, textShadow: '0 1px 3px rgba(0,0,0,.5)' }}>{ch.name}</span>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= CHANNEL DETAIL ================= */}
          {screen === 'channel' && channelMaster && (
            <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '24px 40px 56px' }}>
              <button onClick={() => setScreen('genre')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', fontFamily: "'Lato',sans-serif", fontSize: '13px', fontWeight: 700, color: '#3B3B3C', cursor: 'pointer', padding: 0, marginBottom: '18px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
                Back to {channelMaster.genreName}
              </button>
              <div style={{ marginBottom: '10px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#33A544' }}>Creator analysis</div>

              <section style={{ background: '#fff', border: '1px solid #33A544', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', padding: '24px 26px', marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '90px minmax(0,1fr) 130px', gap: '20px', alignItems: 'center' }}>
                  <span style={{ width: '84px', height: '84px', borderRadius: '999px', background: channelMaster.avatarTint, border: '1px solid rgba(0,0,0,0.08)', color: channelMaster.avatarFg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '32px' }}>{channelMaster.initial}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h1 style={{ fontFamily: "var(--font-source-serif),'Source Serif Pro',Georgia,serif", fontWeight: 700, fontSize: '30px', lineHeight: 1.1, color: '#222', margin: 0 }}>{channelMaster.name}</h1>
                      {channelMaster.age && <span style={{ background: '#FDECEC', color: '#BD081C', fontSize: '10px', fontWeight: 800, letterSpacing: '0.04em', padding: '3px 7px', borderRadius: '5px', textTransform: 'uppercase' }}>Rated for ages {channelMaster.age}</span>}
                    </div>
                    <span style={{ fontSize: '13px', color: '#757575' }}>{channelMaster.views} \u00b7 {channelVideosList.length} videos analyzed</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={channelMaster.pillSt}>{channelMaster.levelLabel}</span>
                    <span style={{ fontSize: '12px', color: '#999999' }}>concern</span>
                  </div>
                </div>

                <div style={{ background: '#F2FEEE', borderRadius: '10px', padding: '14px 18px', display: 'flex', gap: '11px', alignItems: 'flex-start' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A7E22" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: '0 0 18px', marginTop: '2px' }}><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"></path></svg>
                  <p style={{ fontSize: '15px', lineHeight: 1.5, color: '#222', margin: 0, fontWeight: 700 }}>{channelMaster.summary}</p>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#757575', marginBottom: '12px' }}>How this channel scores vs the category</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px 26px' }}>
                    {channelMaster.catStats.map(cs => (
                      <div key={cs.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#222' }}>{cs.label}</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: cs.vsColor }}>{cs.vs}</span>
                        </div>
                        <div style={{ position: 'relative', height: '8px', borderRadius: '999px', background: '#EFEFEF', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${cs.score}%`, background: cs.color, borderRadius: '999px' }}></div>
                          <div style={{ position: 'absolute', top: '-2px', bottom: '-2px', left: `${cs.avgPct}%`, width: '2px', background: '#222' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', fontSize: '11px', color: '#757575' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '14px', height: '8px', borderRadius: '999px', background: '#8848C1' }}></span>This channel</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '2px', height: '12px', background: '#222' }}></span>Category average</span>
                  </div>
                </div>
              </section>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h5 style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#222', margin: 0 }}>Analyzed videos from this channel</h5>
                <span style={{ fontSize: '13px', color: '#757575' }}>{channelVideosList.length} analyzed</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '22px' }}>
                {channelVideosList.map(v => (
                  <button key={v.id} onClick={() => { setCurrentId(v.id); setAnSel([]); setScreen('analysis'); }} style={{ textAlign: 'left', background: '#fff', border: '1px solid #EFEFEF', borderRadius: '12px', padding: '10px 10px 14px', fontFamily: "'Lato',sans-serif", cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '9px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', background: v.thumbBg }}>
                      {v.thumb && <img src={v.thumb} alt={v.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                      <span style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 2, background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>{v.duration}</span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#757575' }}>YouTube Video</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ width: '22px', height: '22px', flex: '0 0 22px', borderRadius: '999px', background: v.thumbBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '11px' }}>{v.channel.charAt(0)}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#423FE1' }}>{v.channel}</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 400, color: '#222', lineHeight: 1.35 }}>{v.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px 10px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 700, color: '#423FE1' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="#423FE1"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><rect x="3" y="2" width="2" height="20" rx="1"></rect></svg>
                        {v.flagCount} Flagged Moments
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= ALL ANALYZED VIDEOS ================= */}
          {screen === 'allvideos' && (() => {
            const allVids = Object.values(genreVideos).flat();
            const catOptions = ['All categories', ...CATEGORY_DATA.map(c => c.name)];
            return (
            <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '24px 40px 56px' }}>
              <button onClick={() => goScreen('home')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', fontFamily: "'Lato',sans-serif", fontSize: '13px', fontWeight: 700, color: '#757575', cursor: 'pointer', padding: '0 0 16px' }}>&larr; Back to Analyzer</button>
              <div style={{ marginBottom: '10px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#33A544' }}>All Analyses</div>
              <h1 style={{ fontFamily: "var(--font-source-serif),'Source Serif Pro',Georgia,serif", fontWeight: 700, fontSize: '36px', lineHeight: 1.15, color: '#222', margin: '0 0 14px' }}>Every video we&apos;ve analyzed</h1>
              <p style={{ fontSize: '15px', lineHeight: 1.55, color: '#3B3B3C', margin: '0 0 24px', maxWidth: '660px' }}>Browse all analyzed videos across every category. Use the filters to find what matters to your family.</p>

              {/* Filter bar — reuses leaderboard filter style */}
              <section style={{ border: '1px solid #CCCCCC', borderRadius: '12px', background: '#fff', marginBottom: '14px', padding: '15px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                  <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#222' }}>Filter by category</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {catOptions.map(opt => {
                      const active = (wlGenres[0] === 'All genres' && opt === 'All categories') || wlGenres.includes(opt);
                      return (
                        <button key={opt} onClick={() => setWlGenres(opt === 'All categories' ? ['All genres'] : [opt])} style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '0.02em', border: active ? '1px solid #33A544' : '1px solid #D9D9D9', cursor: 'pointer', padding: '7px 14px', borderRadius: '999px', background: active ? '#33A544' : '#fff', color: active ? '#fff' : '#54565A', whiteSpace: 'nowrap' }}>
                          {active && opt !== 'All categories' ? '\u2713 ' : ''}{opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Concern legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', background: '#F7F7F7', borderRadius: '12px', padding: '13px 20px', marginBottom: '20px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#222' }}>Concern level</span>
                <span style={{ width: '1px', height: '16px', background: '#CCCCCC' }}></span>
                {Object.values(LEVELS).map(l => (
                  <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '14px', fontWeight: 700, color: '#222' }}>
                    <span style={{ width: '13px', height: '13px', borderRadius: '3px', background: l.bg }}></span>{l.label}
                  </span>
                ))}
              </div>

              {/* Video grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '22px' }}>
                {allVids
                  .filter(v => wlGenres[0] === 'All genres' || CATEGORY_DATA.some(c => c.name === wlGenres[0] && v.genre === c.id))
                  .map(v => {
                    const lev = LEVELS[v.overall] || LEVELS.moderate;
                    const hasAnalysis = isAnalyzed(v.channel);
                    return (
                      <button key={v.id} onClick={() => { if (hasAnalysis) { setCurrentId(v.id); setScreen('analysis'); } }} style={{ textAlign: 'left', background: '#fff', border: hasAnalysis ? '2px solid #33A544' : '1px solid #EFEFEF', borderRadius: '12px', padding: '10px 10px 14px', fontFamily: "'Lato',sans-serif", cursor: hasAnalysis ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', gap: '9px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', opacity: hasAnalysis ? 1 : 0.5 }}>
                        <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', background: v.thumb ? 'transparent' : '#ddd' }}>
                          {v.thumb && <img src={v.thumb} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          <span style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 2, background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>{v.duration || '0:00'}</span>
                          {hasAnalysis && (
                            <span style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: '#33A544', color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: "'Lato',sans-serif" }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              Analyzed
                            </span>
                          )}
                          {!hasAnalysis && (
                            <span style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 3, display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.55)', color: '#ccc', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: "'Lato',sans-serif" }}>Example</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, background: lev.bg, color: lev.fg }}>{lev.label}</span>
                          <span style={{ fontSize: '12px', color: '#757575' }}>Ages {v.age}</span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#222', lineHeight: 1.35 }}>{v.title}</div>
                        <div style={{ fontSize: '13px', color: '#757575' }}>{v.channel} &middot; {v.moments.length} flagged moments</div>
                      </button>
                    );
                  })}
              </div>
            </div>
            );
          })()}

          {/* ================= ADD CHILD PROFILE ================= */}
          {screen === 'addchild' && (
            <div style={{ maxWidth: '480px', margin: '60px auto', padding: '0 24px' }}>
              {obStep < 2 ? (
              <section style={{ background: '#fff', border: '1px solid #33A544', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '44px 40px 40px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '999px', background: '#F2FEEE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#33A544" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <h1 style={{ fontFamily: "var(--font-source-serif),'Source Serif Pro',Georgia,serif", fontWeight: 400, fontSize: '28px', color: '#222', margin: 0, textAlign: 'center' }}>Add a child profile</h1>
                <p style={{ fontSize: '14px', color: '#757575', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>We&apos;ll personalize the dashboard based on your child&apos;s age.</p>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#222', fontFamily: "'Lato',sans-serif" }}>Name or nickname</label>
                    <input value={obName} onChange={e => setObName(e.target.value)} placeholder="e.g. Liam, Bug, Kiddo" style={{ height: '48px', borderRadius: '10px', border: '1px solid #CCCCCC', padding: '0 16px', fontFamily: "'Lato',sans-serif", fontSize: '15px', color: '#222', outline: 'none', background: '#FAFAFA' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#222', fontFamily: "'Lato',sans-serif" }}>Age</label>
                    <input value={obAge} onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); if (v === '' || (Number(v) >= 1 && Number(v) <= 18)) setObAge(v); }} placeholder="e.g. 9" inputMode="numeric" style={{ height: '48px', width: '100px', borderRadius: '10px', border: '1px solid #CCCCCC', padding: '0 16px', fontFamily: "'Lato',sans-serif", fontSize: '15px', color: '#222', outline: 'none', background: '#FAFAFA' }} />
                  </div>
                </div>

                <button onClick={() => { if (obName.trim() && obAge) { setChildAdded(true); setObStep(2); } }} disabled={!obName.trim() || !obAge} style={{ width: '100%', height: '50px', borderRadius: '12px', border: 'none', background: obName.trim() && obAge ? '#1A7E22' : '#CCCCCC', color: '#fff', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '16px', cursor: obName.trim() && obAge ? 'pointer' : 'default', marginTop: '8px', transition: 'background 150ms' }}>Add {obName.trim() || 'child'} to dashboard</button>
              </section>
              ) : (
              <section style={{ background: '#fff', border: '1px solid #33A544', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '52px 40px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '999px', background: '#33A544', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h1 style={{ fontFamily: "var(--font-source-serif),'Source Serif Pro',Georgia,serif", fontWeight: 400, fontSize: '28px', color: '#222', margin: 0 }}>Welcome, {obName}!</h1>
                <p style={{ fontSize: '15px', color: '#757575', margin: 0, lineHeight: 1.5 }}>We&apos;ve added {obName} (age {obAge}) to your dashboard.</p>
                <button onClick={() => { setObStep(0); setScreen('home'); }} style={{ width: '100%', height: '50px', borderRadius: '12px', border: 'none', background: '#1A7E22', color: '#fff', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '16px', cursor: 'pointer', marginTop: '8px' }}>Go to dashboard</button>
              </section>
              )}
            </div>
          )}

          {/* ================= TEDIO / WATCH HISTORY ================= */}
          {screen === 'tedio' && (
            <div style={{ maxWidth: '560px', margin: '80px auto', padding: '0 24px' }}>
              <section className="csm-tedio-card" style={{ background: '#fff', border: '1px solid #33A544', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', padding: '40px 36px 36px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', alignItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '999px', background: '#F2FEEE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#33A544" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#33A544' }}>Coming soon</div>
                <h2 className="csm-tedio-title" style={{ fontFamily: "var(--font-source-serif),'Source Serif Pro',Georgia,serif", fontWeight: 400, fontSize: '32px', lineHeight: 1.15, color: '#222', margin: 0 }}>Watch History is in beta</h2>
                <p style={{ fontSize: '15px', lineHeight: 1.55, color: '#3B3B3C', margin: 0, maxWidth: '420px' }}>We&apos;re building a tool that analyzes your child&apos;s YouTube history to flag channels, videos, and activity that may need a closer look.</p>
                <p style={{ fontSize: '14px', lineHeight: 1.5, color: '#757575', margin: 0 }}>Be the first to know when it&apos;s ready.</p>
                <div className="csm-tedio-email-row" style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '400px' }}>
                  <input placeholder="Your email address" style={{ flex: 1, height: '48px', borderRadius: '12px', background: '#fff', border: '1px solid #CCCCCC', padding: '0 16px', fontFamily: "'Lato',sans-serif", fontSize: '14px', color: '#222', outline: 'none' }} />
                  <button style={{ height: '48px', padding: '0 24px', borderRadius: '12px', background: '#1A7E22', color: '#fff', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Join waitlist</button>
                </div>
                <div style={{ fontSize: '12px', color: '#757575' }}>No spam — just one email when we launch.</div>
              </section>
            </div>
          )}

          {/* ================= CREATOR WATCH LIST ================= */}
          {screen === 'watchlist' && (
            <div className="csm-wl-page" style={{ maxWidth: '980px', margin: '0 auto', padding: '28px 40px 56px' }}>
              <div style={{ marginBottom: '10px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#33A544' }}>The Watch List</div>
              <h1 className="csm-wl-title" style={{ fontFamily: "var(--font-source-serif),'Source Serif Pro',Georgia,serif", fontWeight: 700, fontSize: '42px', lineHeight: 1.15, color: '#222', margin: '0 0 14px', maxWidth: '780px' }}>The channels most kids see &mdash; and how concerning they are.</h1>
              <p className="csm-wl-desc" style={{ fontSize: '16px', lineHeight: 1.55, color: '#3B3B3C', margin: '0 0 26px', maxWidth: '660px' }}>We reviewed each channel against our content rubric. Every channel gets a single <strong>concern level</strong>. The list is ordered so the channels that reach the most kids <em>and</em> raise the most concern come first &mdash; those are the ones worth knowing about.</p>

              <section style={{ border: '1px solid #CCCCCC', borderRadius: '12px', background: '#fff', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                  <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#222' }}>Tune for your family</span>
                  <span style={{ fontSize: '14px', color: '#757575' }}>{(wlOrder === 'concern' ? 'Most concerning first' : 'Safest first') + ' \u00b7 Age ' + wlAge}</span>
                  <button onClick={() => setWlOpen(p => !p)} style={{ marginLeft: 'auto', padding: '8px 20px', borderRadius: '999px', background: '#222222', color: '#fff', border: 'none', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>{wlOpen ? 'Hide' : 'Show filters'}</button>
                </div>
                {wlOpen && (
                  <div style={{ borderTop: '1px solid #EFEFEF', background: '#FBFBFB', borderRadius: '0 0 12px 12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div className="csm-filter-grid" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', alignItems: 'start' }}>
                      <div><div style={{ fontSize: '14px', fontWeight: 700, color: '#222' }}>Genre</div><div style={{ fontSize: '12px', color: '#999999' }}>Pick any number</div></div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {genreList.map(g => (
                          <button key={g} onClick={() => toggleGenre(g)} style={wlChipStyle(wlGenres.includes(g))}>{g}</button>
                        ))}
                      </div>
                    </div>
                    <div className="csm-filter-grid" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', alignItems: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#222' }}>Order</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'inline-flex', background: '#EFEFEF', borderRadius: '10px', padding: '3px' }}>
                          {[{ key: 'concern', label: 'Most concerning first' }, { key: 'safest', label: 'Safest first' }].map(o => (
                            <button key={o.key} onClick={() => setWlOrder(o.key)} style={segStyle(wlOrder === o.key)}>{o.label}</button>
                          ))}
                        </div>
                        <span style={{ fontSize: '13px', color: '#757575' }}>See which channels to watch out for.</span>
                      </div>
                    </div>
                    <div className="csm-filter-grid" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', alignItems: 'start' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#222' }}>Child&apos;s age</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'inline-flex', background: '#EFEFEF', borderRadius: '10px', padding: '3px', alignSelf: 'flex-start' }}>
                          {['Under 5', '5\u20138', '9\u201312', '13+'].map(a => (
                            <button key={a} onClick={() => setWlAge(a)} style={segStyle(wlAge === a)}>{a}</button>
                          ))}
                        </div>
                        <span style={{ fontSize: '13px', color: '#757575' }}>Younger ages weigh pacing &amp; ads more; older ages weigh mature themes.</span>
                      </div>
                    </div>
                    <div className="csm-filter-grid" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', alignItems: 'start' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#222' }}>Emphasize</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {emphList.map(g => (
                          <button key={g} onClick={() => toggleEmph(g)} style={wlChipStyle(wlEmph.includes(g))}>{g}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <div className="csm-legend-bar" style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', background: '#F7F7F7', borderRadius: '12px', padding: '13px 20px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#222' }}>Concern level</span>
                <span style={{ width: '1px', height: '16px', background: '#CCCCCC' }}></span>
                {legendLevels.map(l => (
                  <span key={l.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '14px', fontWeight: 700, color: '#222' }}><span style={{ width: '13px', height: '13px', borderRadius: '3px', background: l.color }}></span>{l.name}</span>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {creators.map(c => (
                  <div key={c.slug} onClick={() => {
                    const cat = CATEGORY_DATA.find(k => c.genres.includes(k.name));
                    setCurrentChannel({ name: c.name, color: c.avatarBg, genreName: cat ? cat.name : c.genres[0], genreId: cat ? cat.id : 'challenge' });
                    setScreen('channel');
                  }} className="csm-wl-creator-row" style={{ display: 'grid', gridTemplateColumns: '36px 110px minmax(0,1fr) 110px', gap: '20px', alignItems: 'center', padding: '22px 8px', borderBottom: '1px solid #EFEFEF', cursor: 'pointer' }}>
                    <span style={{ fontFamily: "var(--font-source-serif),'Source Serif Pro',Georgia,serif", fontSize: '26px', fontWeight: 700, color: '#BBBBBB', textAlign: 'center' }}>{c.rank}</span>
                    <span className="csm-wl-avatar" style={{ width: '100px', height: '100px', borderRadius: '999px', background: c.avatarTint, border: '1px solid rgba(0,0,0,0.08)', color: c.avatarFg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '34px', overflow: 'hidden', position: 'relative' }}>
                      {c.avatarImg ? <img src={c.avatarImg} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : c.initial}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '17px', fontWeight: 700, color: '#222' }}>{c.name}</span>
                        {c.age && <span style={{ background: '#FDECEC', color: '#BD081C', fontSize: '10px', fontWeight: 800, letterSpacing: '0.04em', padding: '3px 7px', borderRadius: '5px', textTransform: 'uppercase' }}>Rated for ages {c.age}</span>}
                        {c.seen && <span style={{ background: '#FFF3E0', color: '#D8690E', fontSize: '10px', fontWeight: 800, letterSpacing: '0.04em', padding: '3px 7px', borderRadius: '5px', textTransform: 'uppercase' }}>Seen by millions</span>}
                      </div>
                      <span style={{ fontSize: '13px', color: '#757575' }}>{c.views}</span>
                      <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#222', margin: 0 }}>{c.blurb}</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {c.tags.map((tag, ti) => (
                          <span key={ti} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', color: '#3B3B3C', background: '#F1F1F1', borderRadius: '5px', padding: '4px 8px', textTransform: 'uppercase' }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={c.pillSt}>{c.levelLabel}</span>
                      <span style={{ fontSize: '12px', color: '#999999' }}>concern</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= PARENT ACTIVITY ================= */}
          {screen === 'activity' && (
            <div style={{ maxWidth: '820px', margin: '0 auto', padding: '28px 40px 56px' }}>
              <h1 style={{ fontFamily: "var(--font-source-serif),'Source Serif Pro',Georgia,serif", fontWeight: 400, fontSize: '34px', lineHeight: 1.2, color: '#222', margin: '0 0 6px' }}>Parent community</h1>
              <p style={{ fontSize: '14px', color: '#3B3B3C', margin: '0 0 4px' }}>Everything here is anchored to a video or an age band &mdash; real notes from parents with kids like yours.</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#1A7E22', background: '#F2FEEE', borderRadius: '999px', padding: '5px 12px', marginBottom: '18px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                A no-judgment space &mdash; we share tools, not rules.
              </div>

              <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #EFEFEF', marginBottom: '22px' }}>
                {[{ key: 'feed', label: 'Activity feed' }, { key: 'questions', label: 'Questions & topics' }, { key: 'circles', label: 'Community' }].map(t => (
                  <button key={t.key} onClick={() => setActTab(t.key)} style={{ border: 'none', padding: '11px 18px', background: 'transparent', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '14px', cursor: 'pointer', borderBottom: '2px solid ' + (actTab === t.key ? '#33A544' : 'transparent'), color: actTab === t.key ? '#1A7E22' : '#757575' }}>{t.label}</button>
                ))}
              </div>

              {/* FEED TAB */}
              {actTab === 'feed' && (
                <div>
                  {!promptDismissed && (
                    <section style={{ background: '#F2FEEE', border: '1px solid #33A544', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: '#222' }}>You just finished the Blippi analysis &mdash; help other parents?</span>
                          <span style={{ fontSize: '13px', color: '#3B3B3C' }}>One tap is enough. Add a note only if something concerned you. Takes 30 seconds.</span>
                        </div>
                        <button onClick={() => setPromptDismissed(true)} style={{ marginLeft: 'auto', border: 'none', background: 'transparent', fontSize: '20px', lineHeight: 1, color: '#999', cursor: 'pointer', padding: 0 }}>&times;</button>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {QUICK_TAGS.map(t => (
                          <button key={t} onClick={() => setReacted(prev => ({ ...prev, [t]: !prev[t] }))} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '999px', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: '1px solid ' + (reacted[t] ? '#33A544' : '#CCCCCC'), background: reacted[t] ? '#F2FEEE' : '#fff', color: reacted[t] ? '#1A7E22' : '#3B3B3C' }}>{t}</button>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button style={{ border: 'none', background: '#1A7E22', color: '#fff', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '13px', padding: '9px 20px', borderRadius: '8px', cursor: 'pointer' }}>Share with parents</button>
                        <a href="#" style={{ fontSize: '13px', fontWeight: 700 }}>Add a note (optional)</a>
                      </div>
                    </section>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#757575' }}>Kids my age</span>
                    {feedAgeOptions.map(a => (
                      <button key={a} onClick={() => setFeedAge(a)} style={wlChipStyle(feedAge === a)}>{a === 'All ages' ? a : 'Ages ' + a}</button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {feed.map(cm => (
                      <div key={cm.id} style={{ background: cm.cardBg, border: '1px solid ' + cm.cardBorder, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
                        {cm.isHeadsUp && (
                          <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#D8690E', color: '#fff', fontSize: '11px', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '6px' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            Heads-up
                          </span>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ width: '34px', height: '34px', flex: '0 0 34px', borderRadius: '999px', background: cm.avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>{cm.initial}</span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#222' }}>{cm.name}</span>
                            <span style={{ fontSize: '12px', color: '#757575' }}>{cm.meta} \u00b7 Ages {cm.age}</span>
                          </div>
                          <button onClick={() => { setCurrentId(cm.videoId); setScreen('analysis'); }} style={{ marginLeft: 'auto', border: 'none', background: '#F2FEEE', color: '#1A7E22', fontFamily: "'Lato',sans-serif", fontSize: '12px', fontWeight: 700, padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>on: {cm.video}</button>
                        </div>
                        {cm.hasMoment && (
                          <button onClick={() => { setCurrentId(cm.videoId); setScreen('analysis'); }} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '7px', border: '1px solid #E8E8E8', background: '#fff', borderRadius: '8px', padding: '6px 11px', fontFamily: "'Lato',sans-serif", fontSize: '12px', fontWeight: 700, color: '#423FE1', cursor: 'pointer' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="#423FE1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            Jump to {cm.ts} &mdash; {cm.moment}
                          </button>
                        )}
                        <p style={{ fontSize: '14px', lineHeight: 1.55, color: '#222', margin: 0 }}>{cm.text}</p>
                        {cm.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {cm.tags.map((tag, ti) => (
                              <span key={ti} style={{ fontSize: '11px', fontWeight: 700, color: '#1A7E22', background: '#F2FEEE', borderRadius: '999px', padding: '4px 11px' }}>{tag}</span>
                            ))}
                          </div>
                        )}
                        {cm.hasVolume && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: 700, color: '#3B3B3C', background: '#F7F7F7', borderRadius: '8px', padding: '7px 11px', alignSelf: 'flex-start' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            {cm.volumeText}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderTop: '1px solid #EFEFEF', paddingTop: '11px' }}>
                          <button onClick={() => setLiked(prev => ({ ...prev, [cm.id]: !prev[cm.id] }))} style={{ border: 'none', background: 'transparent', fontFamily: "'Lato',sans-serif", fontSize: '13px', fontWeight: 700, color: cm.likeColor, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"></path></svg>
                            Helpful \u00b7 {cm.likesCount}
                          </button>
                          <button style={{ border: 'none', background: 'transparent', fontFamily: "'Lato',sans-serif", fontSize: '13px', fontWeight: 700, color: '#757575', cursor: 'pointer', padding: 0 }}>Reply</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QUESTIONS TAB */}
              {actTab === 'questions' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '13px', color: '#757575', margin: 0, maxWidth: '460px' }}>Ask other parents about a specific video or age band. Peers answer by default &mdash; tag a question for a Common Sense expert when it&apos;s about development or behavior.</p>
                    <button style={{ border: 'none', background: '#1A7E22', color: '#fff', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '13px', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Ask a question</button>
                  </div>
                  <div style={{ position: 'relative', marginBottom: '18px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                    <input placeholder="Search questions by channel, video, or age band" style={{ width: '100%', height: '44px', borderRadius: '10px', border: '1px solid #CCCCCC', background: '#fff', padding: '0 14px 0 40px', fontFamily: "'Lato',sans-serif", fontSize: '14px', color: '#222', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {QUESTIONS.map(q => (
                      <div key={q.id} style={{ background: '#fff', border: '1px solid #EFEFEF', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#423FE1', background: '#EEF0FE', borderRadius: '999px', padding: '4px 11px' }}>{q.anchor}</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#3B3B3C', background: '#F1F1F1', borderRadius: '999px', padding: '4px 11px' }}>Ages {q.age}</span>
                          {q.seeded && <span style={{ fontSize: '11px', fontWeight: 700, color: '#8A6D00', background: '#FFF6DA', borderRadius: '999px', padding: '4px 11px' }}>From analysis data</span>}
                          {q.expert && <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.03em', color: '#fff', background: '#33A544', borderRadius: '999px', padding: '4px 11px' }}>CSM expert answered</span>}
                        </div>
                        <h4 style={{ fontFamily: "var(--font-source-serif),'Source Serif Pro',Georgia,serif", fontWeight: 700, fontSize: '19px', lineHeight: 1.3, color: '#222', margin: 0 }}>{q.title}</h4>
                        <div style={{ background: '#F7F7F7', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                            {q.expert ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 800, color: '#1A7E22' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="#33A544"><path d="M12 2 3 7v6c0 5 3.8 8.5 9 9 5.2-.5 9-4 9-9V7z"></path></svg>
                                {q.topReply.name}
                              </span>
                            ) : (
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#3B3B3C' }}>{q.topReply.name}</span>
                            )}
                          </div>
                          <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#222', margin: 0 }}>{q.topReply.text}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#757575' }}>{q.replies} replies</span>
                          <button onClick={() => { if (q.videoId) { setCurrentId(q.videoId); setScreen('analysis'); } }} style={{ border: 'none', background: 'transparent', fontFamily: "'Lato',sans-serif", fontSize: '13px', fontWeight: 700, color: '#1A7E22', cursor: 'pointer', padding: 0 }}>View thread</button>
                          {!q.expert && <button style={{ marginLeft: 'auto', border: '1px solid #33A544', background: '#fff', fontFamily: "'Lato',sans-serif", fontSize: '12px', fontWeight: 700, color: '#1A7E22', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px' }}>Ask a CSM expert</button>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CIRCLES TAB */}
              {actTab === 'circles' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '13px', color: '#757575', margin: 0, maxWidth: '460px' }}>Small groups by place and age &mdash; like the class group chat you already have, but every share is anchored to an analysis. Join with an invite link.</p>
                    <button style={{ border: 'none', background: '#1A7E22', color: '#fff', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '13px', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Create a group</button>
                  </div>
                  <div style={{ position: 'relative', marginBottom: '18px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                    <input placeholder="Search groups by name, place, or age band" style={{ width: '100%', height: '44px', borderRadius: '10px', border: '1px solid #CCCCCC', background: '#fff', padding: '0 14px 0 40px', fontFamily: "'Lato',sans-serif", fontSize: '14px', color: '#222', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {CIRCLES.map(c => {
                      const isJoined = !!joined[c.id];
                      return (
                        <div key={c.id} style={{ background: '#fff', border: '1px solid #EFEFEF', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ width: '44px', height: '44px', flex: '0 0 44px', borderRadius: '12px', background: c.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '19px' }}>{c.name.charAt(0)}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                              <span style={{ fontSize: '16px', fontWeight: 700, color: '#222' }}>{c.name}</span>
                              <span style={{ fontSize: '12px', color: '#757575' }}>{c.place} \u00b7 Ages {c.age} \u00b7 {c.members} parents</span>
                            </div>
                            <button onClick={() => setJoined(prev => ({ ...prev, [c.id]: !prev[c.id] }))} style={{ marginLeft: 'auto', padding: '9px 16px', borderRadius: '999px', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: '1px solid ' + (isJoined ? '#33A544' : '#222'), background: isJoined ? '#F2FEEE' : '#222', color: isJoined ? '#1A7E22' : '#fff' }}>{isJoined ? 'Joined \u2713' : 'Join with invite link'}</button>
                          </div>
                          <div style={{ background: '#F7F7F7', borderRadius: '10px', padding: '13px 15px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#757575' }}>Shared watchlist</span>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {c.watchlist.map((w, wi) => (
                                <span key={wi} style={{ fontSize: '12px', fontWeight: 700, color: '#222', background: '#fff', border: '1px solid #E8E8E8', borderRadius: '8px', padding: '6px 11px' }}>{w}</span>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#757575' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                            Invite link ready &mdash; share it to bring your group over.
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ================= PARENT COMMENTS PANEL ================= */}
      {panelOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={() => setPanelOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(34,34,34,0.4)' }}></div>
          <div style={{ position: 'relative', width: 'min(560px, 92vw)', height: '100%', background: '#fff', boxShadow: '-8px 0 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px 24px', borderBottom: '1px solid #EFEFEF' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {PANEL_STACK.map((p, i) => (
                  <span key={i} style={{ width: '32px', height: '32px', borderRadius: '999px', background: p.bg, color: p.fg, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '10px', marginRight: '-9px' }}>{p.i}</span>
                ))}
              </div>
              <span style={{ background: '#F2FEEE', color: '#1A7E22', fontSize: '13px', fontWeight: 700, padding: '6px 14px', borderRadius: '999px' }}>Parents talking about this one</span>
              <button onClick={() => setPanelOpen(false)} style={{ marginLeft: 'auto', width: '36px', height: '36px', borderRadius: '999px', border: 'none', background: '#F1F1F1', color: '#555', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{'\u2715'}</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <h2 style={{ fontFamily: "var(--font-source-serif),'Source Serif Pro',Georgia,serif", fontWeight: 700, fontSize: '30px', lineHeight: 1.15, color: '#222', margin: '0 0 12px' }}>What other parents want you to know.</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.55, color: '#3B3B3C', margin: '0 0 20px' }}>{PANEL_COMMENTS.length + 32} parents have weighed in on this one. Read what they flagged, then add your take to help the next parent decide.</p>

              <div style={{ background: '#F2FEEE', border: '1px solid #CDEBC6', borderRadius: '12px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '26px' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#222', flex: 1 }}>Would you recommend this to other parents?</span>
                <button onClick={() => { setPanelRec(prev => prev === 'up' ? null : 'up'); setComposeActive(true); }} style={recBtn('up')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"></path></svg>
                </button>
                <button onClick={() => { setPanelRec(prev => prev === 'down' ? null : 'down'); setComposeActive(true); }} style={recBtn('down')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2"></path><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"></path></svg>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '17px', color: '#222', margin: 0 }}>What parents are saying</h3>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#3B3B3C' }}>Most helpful &#x25BE;</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {panelCommentsList.map(pc => (
                  <div key={pc.id} style={{ display: 'grid', gridTemplateColumns: '40px minmax(0,1fr)', gap: '14px', alignItems: 'start' }}>
                    <span style={{ width: '40px', height: '40px', borderRadius: '999px', background: pc.bg, color: pc.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>{pc.initial}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#222' }}>{pc.name}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: pc.fg, background: pc.bg, borderRadius: '6px', padding: '3px 9px' }}>{pc.badge}</span>
                        <span style={{ fontSize: '13px', color: '#999' }}>\u00b7 {pc.time}</span>
                      </div>
                      <p style={{ fontSize: '15px', lineHeight: 1.55, color: '#222', margin: 0 }}>{pc.text}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => setPanelLiked(prev => ({ ...prev, [pc.id]: !prev[pc.id] }))} style={{ border: 'none', background: 'transparent', fontFamily: "'Lato',sans-serif", fontSize: '13px', fontWeight: 700, color: pc.helpfulColor, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>{'\uD83D\uDC4D'} Helpful \u00b7 {pc.helpfulCount}</button>
                        {pc.canReply && <button style={{ border: 'none', background: 'transparent', fontFamily: "'Lato',sans-serif", fontSize: '13px', fontWeight: 700, color: '#757575', cursor: 'pointer', padding: 0 }}>{'\u21A9'} Reply</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {composeActive && (
              <div style={{ borderTop: '1px solid #EFEFEF', padding: '16px 24px 6px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {PANEL_CHIPS.map((ch, i) => (
                    <button key={i} style={{ border: '1px solid #CDEBC6', background: '#fff', color: '#1A7E22', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '13px', padding: '9px 14px', borderRadius: '999px', cursor: 'pointer' }}>{ch}</button>
                  ))}
                </div>
                <textarea autoFocus placeholder="What should other parents know before pressing play?" style={{ width: '100%', minHeight: '92px', boxSizing: 'border-box', border: '1.5px solid #33A544', borderRadius: '12px', padding: '12px 14px', fontFamily: "'Lato',sans-serif", fontSize: '15px', color: '#222', outline: 'none', resize: 'vertical', boxShadow: '0 0 0 3px rgba(51,165,68,0.15)' }}></textarea>
              </div>
            )}

            <div style={{ borderTop: '1px solid #EFEFEF', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '34px', height: '34px', flex: '0 0 34px', borderRadius: '999px', background: '#E9F7EF', color: '#1A7E22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>You</span>
              <input onFocus={() => setComposeActive(true)} onClick={() => setComposeActive(true)} placeholder="A sentence or two is plenty." style={{ flex: 1, height: '44px', border: '1px solid #CCCCCC', borderRadius: '10px', padding: '0 14px', fontFamily: "'Lato',sans-serif", fontSize: '14px', color: '#222', outline: 'none' }} />
              <button style={{ border: 'none', background: '#1A7E22', color: '#fff', fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '14px', padding: '11px 22px', borderRadius: '8px', cursor: 'pointer' }}>Post</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ANALYZING OVERLAY ================= */}
      {analyzing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(34,34,34,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ width: '420px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 32px rgba(0,0,0,0.2)', padding: '32px 32px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '999px', border: '3px solid #EFEFEF', borderTopColor: '#33A544', animation: 'csm-spin 0.8s linear infinite' }}></span>
              <h3 style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: '17px', color: '#222', margin: 0 }}>Analyzing this video&hellip;</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {scanSteps.map((st, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: st.color }}>
                  <span style={{ width: '18px', textAlign: 'center', fontWeight: 900 }}>{st.mark}</span>{st.label}
                </div>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: '#757575' }}>Usually takes under a minute. Your result joins the public library so other parents benefit too.</div>
          </div>
        </div>
      )}
    </div>
  );
}
