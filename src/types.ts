export type TabType = 'timeline' | 'galaxy' | 'compose' | 'echoes' | 'sanctuary';

export interface TimelineAudioMemo {
  title: string;
  duration: string;
  waveforms?: number[];
}

export interface TimelineEchoReply {
  author: string;
  time: string;
  text: string;
}

export interface TimelineItem {
  id: string;
  timestamp: string;
  weatherCondition: string;
  moodBadge: string;
  moodEmoji: string;
  text: string;
  imageUrl?: string;
  imageCaption?: string;
  audioMemo?: TimelineAudioMemo;
  tags?: string[];
  reactions: {
    flares: number;
    hasFlared?: boolean;
    warmBlanket: boolean;
  };
  echoReply?: TimelineEchoReply;
  visibility: 'private' | 'public';
  isQuoteCard?: boolean;
  quoteAuthorNote?: string;
  createdDate: string;
}

export interface GalaxyPlanet {
  id: string;
  name: string;
  percentage: string;
  sublabel: string;
  description: string;
  emoji: string;
  colorHex: string;
  badgeLabel: string;
}

export interface GalaxyWavePoint {
  day: string;
  value: number; // 0 - 100
  annotation?: string;
  isMilestone?: boolean;
  highlightColor?: string;
}

export interface EchoWarmNote {
  id: string;
  text: string;
  author?: string;
  isAi?: boolean;
}

export interface EchoItem {
  id: string;
  author: string;
  locationAndTime: string;
  tag: string;
  tagEmoji: string;
  category: 'all' | 'light' | 'hug' | 'daily' | 'night';
  text: string;
  imageUrl?: string;
  ambientSoundTitle?: string;
  reactions: {
    hugs: number;
    lights: number;
    tea: number;
  };
  userReactions: {
    hug?: boolean;
    light?: boolean;
    tea?: boolean;
  };
  warmNotes: EchoWarmNote[];
  caressedCount?: number;
}

export interface TimeCapsuleItem {
  id: string;
  content: string;
  sealedDate: string;
  deliverDate: string;
  daysRemaining: number;
  unsealed: boolean;
}
