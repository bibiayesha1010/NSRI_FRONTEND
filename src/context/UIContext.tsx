import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface UIContextValue {
  journalOpen: boolean;
  journalPrefillPrompt: string | undefined;
  openJournal: (prefillPrompt?: string) => void;
  closeJournal: () => void;

  chatOpen: boolean;
  chatInitialMessage: string | undefined;
  openChat: (initialMessage?: string) => void;
  closeChat: () => void;

  breathingOpen: boolean;
  openBreathing: () => void;
  closeBreathing: () => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalPrefillPrompt, setJournalPrefillPrompt] = useState<string | undefined>();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>();
  const [breathingOpen, setBreathingOpen] = useState(false);

  const openJournal = useCallback((prefillPrompt?: string) => {
    setJournalPrefillPrompt(prefillPrompt);
    setJournalOpen(true);
  }, []);
  const closeJournal = useCallback(() => setJournalOpen(false), []);

  const openChat = useCallback((initialMessage?: string) => {
    setChatInitialMessage(initialMessage);
    setChatOpen(true);
  }, []);
  const closeChat = useCallback(() => setChatOpen(false), []);

  const openBreathing = useCallback(() => setBreathingOpen(true), []);
  const closeBreathing = useCallback(() => setBreathingOpen(false), []);

  const value = useMemo(
    () => ({
      journalOpen,
      journalPrefillPrompt,
      openJournal,
      closeJournal,
      chatOpen,
      chatInitialMessage,
      openChat,
      closeChat,
      breathingOpen,
      openBreathing,
      closeBreathing,
    }),
    [journalOpen, journalPrefillPrompt, openJournal, closeJournal, chatOpen, chatInitialMessage, openChat, closeChat, breathingOpen, openBreathing, closeBreathing]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within a UIProvider');
  return ctx;
}