import React, {useState, useEffect} from 'react';
import {TabType, TimelineItem, EchoItem, TimeCapsuleItem} from './types';
import {
  INITIAL_TIMELINE,
  INITIAL_ECHOES,
  INITIAL_TIME_CAPSULES,
} from './data/initialData';
import {
  timelineApi,
  echoesApi,
  capsulesApi,
  draftApi,
  checkBackendHealth,
} from './api';
import {Header} from './components/Header';
import {Navbar} from './components/Navbar';
import {DatabaseStatusModal} from './components/DatabaseStatusModal';
import {TimelineScreen} from './screens/TimelineScreen';
import {GalaxyScreen} from './screens/GalaxyScreen';
import {ComposeScreen} from './screens/ComposeScreen';
import {EchoesScreen} from './screens/EchoesScreen';
import {SanctuaryScreen} from './screens/SanctuaryScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('timeline');

  // Initial state with local fallback
  const [timeline, setTimeline] = useState<TimelineItem[]>(() => {
    try {
      const saved = localStorage.getItem('murmur_timeline');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TIMELINE;
  });

  const [echoes, setEchoes] = useState<EchoItem[]>(() => {
    try {
      const saved = localStorage.getItem('murmur_echoes');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ECHOES;
  });

  const [timeCapsules, setTimeCapsules] = useState<TimeCapsuleItem[]>(() => {
    try {
      const saved = localStorage.getItem('murmur_capsules');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TIME_CAPSULES;
  });

  const [savedDraft, setSavedDraft] = useState<string>(() => {
    return localStorage.getItem('murmur_draft') || '';
  });

  const [composeInitialText, setComposeInitialText] = useState<string>('');
  const [composeInitialMood, setComposeInitialMood] = useState<string>('');
  const [draftToast, setDraftToast] = useState<boolean>(false);

  // Database Connection Status & Modal
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  const [dbConnected, setDbConnected] = useState<boolean>(false);

  // 1. Initial Load from Backend API / Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadDataFromBackend() {
      try {
        const [remoteTimeline, remoteEchoes, remoteCapsules, remoteDraft, health] =
          await Promise.all([
            timelineApi.getAll(),
            echoesApi.getAll(),
            capsulesApi.getAll(),
            draftApi.get(),
            checkBackendHealth(),
          ]);

        if (!isMounted) return;

        if (Array.isArray(remoteTimeline) && remoteTimeline.length > 0) {
          setTimeline(remoteTimeline);
        }
        if (Array.isArray(remoteEchoes) && remoteEchoes.length > 0) {
          setEchoes(remoteEchoes);
        }
        if (Array.isArray(remoteCapsules) && remoteCapsules.length > 0) {
          setTimeCapsules(remoteCapsules);
        }
        if (typeof remoteDraft === 'string') {
          setSavedDraft(remoteDraft);
        }
        if (health?.database?.connected) {
          setDbConnected(true);
        }
      } catch (err) {
        console.warn('[App] 初始数据加载异常，继续以本地缓存提供服务:', err);
      }
    }

    loadDataFromBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Sync to LocalStorage as offline mirror
  useEffect(() => {
    try {
      localStorage.setItem('murmur_timeline', JSON.stringify(timeline));
    } catch (e) {
      console.warn('Failed to save timeline to localStorage', e);
    }
  }, [timeline]);

  useEffect(() => {
    try {
      localStorage.setItem('murmur_echoes', JSON.stringify(echoes));
    } catch (e) {
      console.warn('Failed to save echoes to localStorage', e);
    }
  }, [echoes]);

  useEffect(() => {
    try {
      localStorage.setItem('murmur_capsules', JSON.stringify(timeCapsules));
    } catch (e) {
      console.warn('Failed to save capsules to localStorage', e);
    }
  }, [timeCapsules]);

  const handleSelectTab = (tab: TabType) => {
    setCurrentTab(tab);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleOpenCompose = (defaultText?: string, defaultMood?: string) => {
    setComposeInitialText(defaultText || '');
    setComposeInitialMood(defaultMood || '');
    setCurrentTab('compose');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleSaveDraftToBox = async (draftText: string) => {
    setSavedDraft(draftText);
    setDraftToast(true);
    setTimeout(() => setDraftToast(false), 2000);
    await draftApi.save(draftText);
  };

  const handleRestoreDraft = (draft: string) => {
    setComposeInitialText(draft);
    setCurrentTab('compose');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleClearDraft = async () => {
    setSavedDraft('');
    await draftApi.clear();
  };

  const handleResetData = async () => {
    const [t, e, c] = await Promise.all([
      timelineApi.reset(),
      echoesApi.reset(),
      capsulesApi.reset(),
      draftApi.clear(),
    ]);
    setTimeline(t);
    setEchoes(e);
    setTimeCapsules(c);
    setSavedDraft('');
  };

  const handleUnsealCapsule = async (id: string) => {
    setTimeCapsules((prev) =>
      prev.map((c) => (c.id === id ? {...c, unsealed: true} : c)),
    );
    await capsulesApi.unseal(id);
  };

  const handleUpdateTimelineItem = async (updated: TimelineItem) => {
    setTimeline((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    await timelineApi.update(updated);
  };

  const handleAddEcho = async (newEcho: EchoItem) => {
    setEchoes((prev) => [newEcho, ...prev]);
    await echoesApi.create(newEcho);
  };

  const handleUpdateEcho = async (updated: EchoItem) => {
    setEchoes((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    await echoesApi.update(updated);
  };

  // When user releases a thought from ComposeScreen
  const handleReleaseThought = async (entry: {
    text: string;
    destination: 'private' | 'ocean' | 'future';
    moodAura: string;
    tags: string[];
    imageUrl?: string;
    hasVoiceMemo?: boolean;
    futureDays?: number;
  }) => {
    const now = new Date();
    const timeStr = `今天 ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    // 1. If destination is future
    if (entry.destination === 'future') {
      const days = entry.futureDays || 30;
      const deliver = new Date();
      deliver.setDate(deliver.getDate() + days);

      const newCapsule: TimeCapsuleItem = {
        id: `capsule-${Date.now()}`,
        content: entry.text,
        sealedDate: now.toISOString().slice(0, 10),
        deliverDate: deliver.toISOString().slice(0, 10),
        daysRemaining: days,
        unsealed: false,
      };

      setTimeCapsules((prev) => [newCapsule, ...prev]);
      setCurrentTab('sanctuary');
      await capsulesApi.create(newCapsule);
      return;
    }

    // 2. If destination is ocean
    if (entry.destination === 'ocean') {
      let warmReply = '愿晚风抚平你所有的褶皱，今晚好好休息，梦里有漫天繁星。';
      try {
        const resp = await fetch('/api/echo-resonance', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            thought: entry.text,
            mood: entry.moodAura,
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.reply) warmReply = data.reply;
        }
      } catch (err) {
        console.warn('Echo fetch error:', err);
      }

      const newEcho: EchoItem = {
        id: `echo-${Date.now()}`,
        author: '心海放舟的旅人',
        locationAndTime: '星海某处 · 刚刚',
        tag: entry.moodAura,
        tagEmoji: '🌊',
        category: 'daily',
        text: `“${entry.text}”`,
        imageUrl: entry.imageUrl,
        reactions: {hugs: 0, lights: 1, tea: 0},
        userReactions: {light: true},
        warmNotes: [
          {
            id: `reply-${Date.now()}`,
            text: warmReply,
            author: '远方旅人的回音',
            isAi: true,
          },
        ],
      };

      setEchoes((prev) => [newEcho, ...prev]);
      setCurrentTab('echoes');
      await echoesApi.create(newEcho);
      return;
    }

    // 3. Otherwise private / timeline
    const newTimelineItem: TimelineItem = {
      id: `timeline-${Date.now()}`,
      timestamp: timeStr,
      weatherCondition: '晴空心绪',
      moodBadge: entry.moodAura,
      moodEmoji: '🌿',
      text: entry.text,
      imageUrl: entry.imageUrl,
      imageCaption: entry.imageUrl ? '心绪留存' : undefined,
      audioMemo: entry.hasVoiceMemo
        ? {
            title: '微光轻声耳语',
            duration: '0:08',
            waveforms: [20, 60, 40, 80, 50, 70, 30],
          }
        : undefined,
      tags: entry.tags,
      reactions: {
        flares: 1,
        hasFlared: true,
        warmBlanket: false,
      },
      visibility: entry.destination === 'private' ? 'private' : 'public',
      createdDate: now.toISOString(),
    };

    setTimeline((prev) => [newTimelineItem, ...prev]);
    // Clear draft if it matched
    if (savedDraft === entry.text) {
      handleClearDraft();
    }
    setCurrentTab('timeline');
    await timelineApi.create(newTimelineItem);
  };

  return (
    <div className="min-h-screen bg-[#fcf9f3] text-[#1c1c18] flex justify-center selection:bg-[#ffdbd2] selection:text-[#341108]">
      {/* Container simulating high-fidelity smartphone canvas on mobile, centered book spread on desktop */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative bg-[#fcf9f3] shadow-[0_0_50px_rgba(62,59,58,0.06)] border-x border-[#e5e2dc]/40">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          onSaveDraft={() => handleSaveDraftToBox(composeInitialText)}
          draftSavedToast={draftToast}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative w-full pt-16">
          {currentTab === 'timeline' && (
            <TimelineScreen
              timeline={timeline}
              onOpenCompose={handleOpenCompose}
              onUpdateTimelineItem={handleUpdateTimelineItem}
            />
          )}

          {currentTab === 'galaxy' && <GalaxyScreen />}

          {currentTab === 'compose' && (
            <ComposeScreen
              initialText={composeInitialText}
              initialMoodPrompt={composeInitialMood}
              onReleaseThought={handleReleaseThought}
              onSaveDraftToBox={handleSaveDraftToBox}
              onReturnToTimeline={() => handleSelectTab('timeline')}
            />
          )}

          {currentTab === 'echoes' && (
            <EchoesScreen
              echoes={echoes}
              onAddEcho={handleAddEcho}
              onUpdateEcho={handleUpdateEcho}
            />
          )}

          {currentTab === 'sanctuary' && (
            <SanctuaryScreen
              timeline={timeline}
              timeCapsules={timeCapsules}
              savedDraft={savedDraft}
              onRestoreDraft={handleRestoreDraft}
              onClearDraft={handleClearDraft}
              onResetData={handleResetData}
              onUnsealCapsule={handleUnsealCapsule}
              onOpenDbModal={() => setIsDbModalOpen(true)}
              dbConnected={dbConnected}
            />
          )}
        </main>

        {/* Floating Bottom Navbar */}
        <Navbar currentTab={currentTab} onSelectTab={handleSelectTab} />

        {/* Supabase Database Status / Config Modal */}
        <DatabaseStatusModal
          isOpen={isDbModalOpen}
          onClose={() => setIsDbModalOpen(false)}
        />
      </div>
    </div>
  );
}
