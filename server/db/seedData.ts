import {TimelineItem, EchoItem, TimeCapsuleItem} from '../../src/types';

export const SEED_TIMELINE: TimelineItem[] = [
  {
    id: 'timeline-1',
    timestamp: '今天 15:42',
    weatherCondition: '晴空微温',
    moodBadge: '微小确幸',
    moodEmoji: '🫧',
    text: '路过转角咖啡店，门前的小黄猫正把肚皮摊在日光下打盹。突然觉得哪怕生活有再多琐碎，这一刻的阳光也是真的。',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD8KNmKqMEhXJJm_XJAfmUZuLsPkW3FMn3S8OPdp5TdXDMWONDyGgsdaRq7m4746ba-5IKBAQ0-EO5fOxb-tr2f1eaWKWGCkB-22Fzkm9oB1Oz2IDUJg-CzstZpWB3xMN_veW7oDJS9Nid2Nxh-oA9SZhcvMKrbGIXrJqPNqHdur-alO-JT_XlqGfkgT7vUeoxVW5zSD_ZJsa79lWLX-m8iKjNigx4JNuQ1wH3qqW5iXT30YCbX8Ao',
    imageCaption: '随手留存',
    audioMemo: {
      title: '午后风铃微语',
      duration: '0:12',
      waveforms: [20, 45, 80, 50, 95, 30, 70, 40],
    },
    reactions: {
      flares: 3,
      hasFlared: false,
      warmBlanket: true,
    },
    visibility: 'public',
    createdDate: '2026-10-17T15:42:00',
  },
  {
    id: 'timeline-2',
    timestamp: '昨天 22:18',
    weatherCondition: '夜雨微凉',
    moodBadge: '湿漉漉的雨',
    moodEmoji: '🌧️',
    text: '汇报没有想象中顺利，走在地铁通道里有一瞬间差点掉眼泪。不过在便利店买到了最后一只热腾腾的烤红薯，热气扑在手心的时候，好像原谅了全世界。',
    tags: ['#放过自己', '#治愈碳水', '#晚安世界'],
    reactions: {
      flares: 7,
      hasFlared: true,
      warmBlanket: false,
    },
    echoReply: {
      author: '远方旅人的回音',
      time: '昨天 23:04',
      text: '“给你递一张干燥柔软的纸巾。今天辛苦啦，热气腾腾的红薯会替生活拥抱你。”',
    },
    visibility: 'public',
    createdDate: '2026-10-16T22:18:00',
  },
  {
    id: 'timeline-3',
    timestamp: '10月24日',
    weatherCondition: '散步时',
    moodBadge: '舒展的嫩芽',
    moodEmoji: '🌿',
    text: '“允许自己做一颗偶尔停下来的齿轮，不赶路，去感受路。”',
    isQuoteCard: true,
    reactions: {
      flares: 12,
      hasFlared: false,
      warmBlanket: false,
    },
    visibility: 'private',
    createdDate: '2026-10-15T18:30:00',
  },
];

export const SEED_ECHOES: EchoItem[] = [
  {
    id: 'echo-1',
    author: '一位在等红绿灯的旅人',
    locationAndTime: '约 1.2 公里外 · 2小时前',
    tag: '渴望抱抱',
    tagEmoji: '🌧️',
    category: 'hug',
    text: '“一个人在大城市租房的第三年，今天自己换了顶灯的灯泡，突然站在梯子上发呆了很久。希望有人能拍拍我的肩说句你已经做得很棒了。”',
    reactions: {
      hugs: 128,
      lights: 42,
      tea: 19,
    },
    userReactions: {},
    warmNotes: [
      {
        id: 'note-1',
        text: '抱抱你！能在陌生的城市把属于自己的光拧亮，你已经比想象中更加独立坚强了。',
      },
      {
        id: 'note-2',
        text: '灯亮起来的那一刻，你也照亮了自己呀。今晚睡个暖暖的觉吧，晚安！',
      },
    ],
  },
  {
    id: 'echo-2',
    author: '看云的人',
    locationAndTime: '静海某处 · 昨天夜里',
    tag: '平静碎片',
    tagEmoji: '☕',
    category: 'daily',
    text: '“窗外下起暴雨，关掉所有大灯，只留一盏暖黄床头灯，听着雨声看小说，这一刻感觉整个世界都与我无关，真好。”',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSwRtB1ccfQ_mbYausFKwTGy65pmidAMFD-AA1ZyVgymJaJzIEYtTA0MF4gDpR886hz_rNM9z_bKzpJfccanhY9tZ_3T_UI4X6AwiBr5zhBaDr8VYTYJy9ULWTv-O-42-Q3K8wDBIE9YJsw6oRuxZOJ6Y5gQVJ1qmSXp1CkqdDsW-YSwOFVBktvnIr9P5pYmoBWCwC2CJBRFnZZ5dI3k05aHKc83a9tB0x6NkKVf5vLxw5DadT2dI',
    ambientSoundTitle: '伴随白噪音：窗外深沉夜雨声',
    reactions: {
      hugs: 16,
      lights: 342,
      tea: 48,
    },
    userReactions: {
      light: true,
    },
    warmNotes: [
      {
        id: 'note-3',
        text: '被暴雨隔离的世界，恰是最好的庇护所。',
      },
    ],
    caressedCount: 86,
  },
  {
    id: 'echo-3',
    author: '森林里的风',
    locationAndTime: '风拂过山谷 · 3天前',
    tag: '释怀与放晴',
    tagEmoji: '🍃',
    category: 'light',
    text: '“终于放下了那件纠结两个月的选择题。原来做决定并不是有多勇敢，只是想对自己诚实一点。”',
    reactions: {
      hugs: 89,
      lights: 104,
      tea: 33,
    },
    userReactions: {},
    warmNotes: [
      {
        id: 'note-4',
        text: '对自己坦诚的瞬间，就是自由的开始。',
      },
    ],
  },
];

export const SEED_CAPSULES: TimeCapsuleItem[] = [
  {
    id: 'capsule-1',
    content: '希望那个时候的你，已经去了想看的海，吃到了想念的桂花糕，心里不再慌慌张张。',
    sealedDate: '2026-10-01',
    deliverDate: '2026-10-31',
    daysRemaining: 14,
    unsealed: false,
  },
  {
    id: 'capsule-2',
    content: '今天写下了这句：允许一切发生。不知道未来的你看到时，是不是嘴角会扬起微笑呢？',
    sealedDate: '2026-07-20',
    deliverDate: '2026-10-20',
    daysRemaining: 3,
    unsealed: false,
  },
];
