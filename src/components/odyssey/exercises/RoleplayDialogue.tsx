import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Check, AlertCircle, Volume2, Mic } from 'lucide-react';
import type { RoleplayDialoguePayload } from '../../../types/Course';
import { odysseyAudio } from '../../../services/odysseyAudio';

interface RoleplayDialogueProps {
  payload: RoleplayDialoguePayload;
  onSuccess: () => void;
  onError: (mistake: string) => void;
}

interface ChatMessage {
  speaker: 'agent' | 'user';
  text: string;
}

export const RoleplayDialogue: React.FC<RoleplayDialogueProps> = ({ payload, onSuccess, onError }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { speaker: 'agent', text: payload.initialPrompt }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);

  // Speak initial prompt
  useEffect(() => {
    odysseyAudio.speakChinese(payload.initialPrompt);
  }, [payload.initialPrompt]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isCompleted) return;

    const currentText = userInput.trim();
    const updatedMessages: ChatMessage[] = [
      ...messages,
      { speaker: 'user', text: currentText }
    ];
    setMessages(updatedMessages);
    setUserInput('');

    // Check communicative goals: are required keywords included?
    const missing = payload.requiredKeywords.filter(kw => !currentText.includes(kw));
    setMissingKeywords(missing);

    if (missing.length === 0) {
      // Success! Agent responds positively
      const reply = '好的，没问题！马上为您准备，请稍等片刻。';
      setTimeout(() => {
        setMessages(prev => [...prev, { speaker: 'agent', text: reply }]);
        odysseyAudio.speakChinese(reply);
        odysseyAudio.playCorrectChord();
        setIsCompleted(true);
        onSuccess();
      }, 600);
    } else {
      // Incomplete communicative objective
      const promptRetry = `不好意思，我没有听清。请记得说明：${missing.join(' 和 ')}。`;
      setTimeout(() => {
        setMessages(prev => [...prev, { speaker: 'agent', text: promptRetry }]);
        odysseyAudio.speakChinese(promptRetry);
        odysseyAudio.playErrorChime();
        onError(`Communicative goal missed keywords: ${missing.join(', ')}`);
      }, 600);
    }
  };

  const handleQuickInsertSample = (reply: string) => {
    setUserInput(reply);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '560px', margin: '0 auto' }}>
      {/* Scenario Context & Objectives Header */}
      <div style={{
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={16} color="var(--accent-indigo)" />
          <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{payload.scenarioTitle}</strong>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
          {payload.contextDescription}
        </p>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Required keywords:</span>
          {payload.requiredKeywords.map(kw => (
            <span
              key={kw}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--accent-indigo)'
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div style={{
        minHeight: '200px',
        maxHeight: '280px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-base)',
        border: '1px solid var(--border-subtle)'
      }}>
        {messages.map((m, idx) => {
          const isAgent = m.speaker === 'agent';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: isAgent ? 'flex-start' : 'flex-end',
                width: '100%'
              }}
            >
              <div style={{
                maxWidth: '82%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isAgent ? 'var(--bg-surface)' : 'var(--border-strong)',
                color: 'var(--text-primary)',
                border: `1px solid ${isAgent ? 'var(--border-subtle)' : 'transparent'}`,
                fontSize: '15px',
                fontFamily: 'var(--font-serif-zh)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>{m.text}</span>
                {isAgent && (
                  <button
                    type="button"
                    onClick={() => odysseyAudio.speakChinese(m.text)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-muted)' }}
                    title="Hear line"
                  >
                    <Volume2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sample quick reply chips */}
      {payload.sampleReplies && payload.sampleReplies.length > 0 && !isCompleted && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center', whiteSpace: 'nowrap' }}>Idea:</span>
          {payload.sampleReplies.map((reply, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickInsertSample(reply)}
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '3px 8px', whiteSpace: 'nowrap' }}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={`Type your reply using ${payload.requiredKeywords.join(' and ')}...`}
          className="form-input"
          style={{ flex: 1, fontSize: '15px', fontFamily: 'var(--font-serif-zh)' }}
          disabled={isCompleted}
          autoFocus
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ padding: '0 16px' }}
          disabled={!userInput.trim() || isCompleted}
        >
          <Send size={16} />
        </button>
      </form>

      {/* Communicative completion banner */}
      {isCompleted && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(56, 161, 105, 0.1)',
          border: '1px solid rgba(56, 161, 105, 0.3)',
          color: '#38a169',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px'
        }}>
          <Check size={18} />
          <span><strong>Communicative Goal Achieved!</strong> You successfully completed the interaction.</span>
        </div>
      )}
    </div>
  );
};
