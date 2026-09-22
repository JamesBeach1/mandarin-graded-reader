/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, Play, Pause } from 'lucide-react';
import type { HanziWriterInstance } from './types/hanzi-writer';

interface HanziPracticeModalProps {
  character: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  characterData?: {
    pinyin?: string;
    definition?: string;
    hsk_level?: string;
  };
  inline?: boolean;
}

export const HanziPracticeModal: React.FC<HanziPracticeModalProps> = ({
  character,
  isOpen,
  onClose,
  onSuccess,
  characterData,
  inline = false
}) => {
  const writerRef = useRef<HTMLDivElement>(null);
  const hanziWriterRef = useRef<HanziWriterInstance | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [strokeCount, setStrokeCount] = useState(0);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load HanziWriter script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.HanziWriter) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js';
      script.onload = () => {
        setIsScriptLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load HanziWriter script');
      };
      document.head.appendChild(script);
    } else if (window.HanziWriter) {
      setIsScriptLoaded(true);
    }
  }, []);

  const [activeChar, setActiveChar] = useState('');

  useEffect(() => {
    if (character) {
      setActiveChar(character[0] || '');
    }
  }, [character]);

  // Initialize writer when modal opens and script is loaded
  useEffect(() => {
    if (isOpen && isScriptLoaded && activeChar) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        initializeWriter();
      }, 100);
    }

    return () => {
      if (hanziWriterRef.current) {
        try {
          hanziWriterRef.current.cancelQuiz();
        } catch (e) {
          // Ignore cleanup errors
        }
        hanziWriterRef.current = null;
      }
    };
  }, [isOpen, isScriptLoaded, activeChar]);

  const initializeWriter = () => {
    if (!writerRef.current || !window.HanziWriter) return;

    // Clear previous writer
    writerRef.current.innerHTML = '';

    try {
      hanziWriterRef.current = window.HanziWriter.create(writerRef.current, activeChar, {
        width: 300,
        height: 300,
        padding: 20,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 200,
        strokeColor: '#555',
        radicalColor: '#168F16',
        highlightColor: '#AAF',
        outlineColor: showHints ? '#DDD' : 'rgba(0,0,0,0)',
        drawingColor: '#333',
        showOutline: showHints,
        showCharacter: false
      });

      // Get stroke count
      if (window.HanziWriter && window.HanziWriter.loadCharacterData) {
        window.HanziWriter.loadCharacterData(activeChar).then((charData: any) => {
          if (charData && charData.strokes) {
            setStrokeCount(charData.strokes.length);
          }
        }).catch((err: any) => {
          console.error('Error loading character data:', err);
        });
      }

    } catch (error) {
      console.error('Error initializing Hanzi Writer:', error);
    }
  };

  const animateCharacter = () => {
    if (hanziWriterRef.current && !isAnimating) {
      setIsAnimating(true);
      hanziWriterRef.current.animateCharacter({
        onComplete: () => setIsAnimating(false)
      });
    }
  };

  const startQuiz = () => {
    if (hanziWriterRef.current) {
      hanziWriterRef.current.quiz({
        showHintAfterMisses: showHints ? 2 : false,
        highlightOnComplete: true,
        onComplete: () => {
          // Character completed successfully
          if (onSuccess) {
            onSuccess();
          }
          setTimeout(() => {
            if (hanziWriterRef.current) {
              hanziWriterRef.current.hideCharacter();
            }
          }, 1500);
        }
      });
    }
  };

  const resetPractice = () => {
    if (hanziWriterRef.current) {
      hanziWriterRef.current.cancelQuiz();
      hanziWriterRef.current.hideCharacter();
      setIsAnimating(false);
    }
  };

  const toggleHints = () => {
    setShowHints(!showHints);
    if (hanziWriterRef.current) {
      hanziWriterRef.current.updateColor('outlineColor', !showHints ? '#DDD' : 'rgba(0,0,0,0)');
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (inline) {
    return (
      <div 
        style={{ 
          background: 'var(--bg-card)', 
          padding: '20px', 
          borderRadius: '15px', 
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '10px'
        }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: 'var(--text-main)' }}>Writing Practice</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '5px' }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent-color)' }}>{character}</span>
              {characterData?.pinyin && (
                <div>
                  <div style={{ fontSize: '15px', color: 'var(--accent-color)', fontFamily: 'monospace', fontWeight: '600' }}>{characterData.pinyin}</div>
                  {characterData.definition && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{characterData.definition}</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              background: 'none',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          {!isScriptLoaded && <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading drawing canvas...</div>}
          
          {isScriptLoaded && (
            <>
              {character.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '10px' }}>
                  {character.split('').map((char, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveChar(char)}
                      className="control-button"
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        padding: '6px 12px',
                        borderColor: activeChar === char ? 'var(--accent-color)' : undefined,
                        background: activeChar === char ? 'var(--accent-glow)' : undefined,
                        color: activeChar === char ? 'var(--accent-color)' : undefined
                      }}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div 
                  ref={writerRef}
                  style={{
                    border: '2px solid var(--border-color)',
                    borderRadius: '12px',
                    background: '#f7fafc',
                    width: '300px',
                    height: '300px'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                width: '100%',
                textAlign: 'center'
              }}>
                <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Strokes</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-color)' }}>{strokeCount || '...'}</div>
                </div>
                {characterData?.hsk_level && (
                  <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>HSK Level</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#38a169' }}>{characterData.hsk_level}</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button onClick={animateCharacter} disabled={isAnimating} className="control-button" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '8px' }}>
                    {isAnimating ? <Pause size={14} /> : <Play size={14} />} {isAnimating ? 'Demo' : 'Demo'}
                  </button>
                  <button onClick={resetPractice} className="control-button" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '8px' }}>
                    <RotateCcw size={14} /> Clear
                  </button>
                </div>
                
                <button onClick={startQuiz} className="generate-button" style={{ fontSize: '13px', padding: '10px 16px' }}>
                  Start Practice Quiz
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <input type="checkbox" id="hints" checked={showHints} onChange={toggleHints} style={{ cursor: 'pointer' }} />
                  <label htmlFor="hints" style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>Show stroke hints</label>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="settings-overlay" onClick={handleBackdropClick}>
      <div 
        className="settings-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '500px', 
          width: '90%', 
          maxHeight: '90vh', 
          overflowY: 'auto',
          padding: '0'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '30px 30px 20px 30px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#2d3748',
              margin: '0 0 10px 0'
            }}>Practice Writing</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ 
                fontSize: '40px', 
                fontWeight: 'bold', 
                color: '#667eea' 
              }}>{character}</span>
              {characterData?.pinyin && (
                <div>
                  <div style={{ 
                    fontSize: '18px', 
                    color: '#667eea', 
                    fontFamily: 'monospace',
                    fontWeight: '600'
                  }}>{characterData.pinyin}</div>
                  {characterData.definition && (
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#718096' 
                    }}>{characterData.definition}</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              background: 'none',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={24} color="#718096" />
          </button>
        </div>

        {/* Practice Area */}
        <div style={{ padding: '30px' }}>
          {/* Loading state */}
          {!isScriptLoaded && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '300px',
              color: '#718096'
            }}>
              Loading Hanzi Writer...
            </div>
          )}
          
          {/* Writer Canvas */}
          {isScriptLoaded && (
            <>
              {character.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '15px' }}>
                  {character.split('').map((char, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveChar(char)}
                      className="control-button"
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        padding: '6px 12px',
                        borderColor: activeChar === char ? 'var(--accent-color)' : undefined,
                        background: activeChar === char ? 'var(--accent-glow)' : undefined,
                        color: activeChar === char ? 'var(--accent-color)' : undefined
                      }}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '24px' 
              }}>
                <div 
                  ref={writerRef}
                  style={{
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    background: '#f7fafc',
                    width: '300px',
                    height: '300px'
                  }}
                />
              </div>

              {/* Character Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <div style={{
                  background: '#ebf8ff',
                  padding: '12px',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '14px', color: '#718096' }}>Strokes</div>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: '#667eea' 
                  }}>{strokeCount || '...'}</div>
                </div>
                {characterData?.hsk_level && (
                  <div style={{
                    background: '#f0fff4',
                    padding: '12px',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '14px', color: '#718096' }}>HSK Level</div>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold', 
                      color: '#38a169' 
                    }}>{characterData.hsk_level}</div>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '12px' 
                }}>
                  <button
                    onClick={animateCharacter}
                    disabled={isAnimating}
                    className="generate-button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      opacity: isAnimating ? 0.5 : 1,
                      cursor: isAnimating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isAnimating ? <Pause size={18} /> : <Play size={18} />}
                    {isAnimating ? 'Playing...' : 'Animation'}
                  </button>
                  <button
                    onClick={resetPractice}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      background: '#718096',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#4a5568'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#718096'}
                  >
                    <RotateCcw size={18} />
                    Reset
                  </button>
                </div>
                
                <button
                  onClick={startQuiz}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(72, 187, 120, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  Start Practice Quiz
                </button>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px'
                }}>
                  <input
                    type="checkbox"
                    id="hints"
                    checked={showHints}
                    onChange={toggleHints}
                    style={{ borderRadius: '4px' }}
                  />
                  <label 
                    htmlFor="hints" 
                    style={{ 
                      fontSize: '14px', 
                      color: '#718096',
                      cursor: 'pointer'
                    }}
                  >
                    Show stroke hints
                  </label>
                </div>
              </div>

              {/* Instructions */}
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: '#fffbeb',
                borderRadius: '8px',
                borderLeft: '4px solid #f6ad55'
              }}>
                <h4 style={{
                  fontWeight: '600',
                  color: '#c05621',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>How to practice:</h4>
                <ul style={{
                  fontSize: '13px',
                  color: '#c05621',
                  lineHeight: '1.5',
                  paddingLeft: '16px'
                }}>
                  <li style={{ marginBottom: '4px' }}>Click "Animation" to see the stroke order</li>
                  <li style={{ marginBottom: '4px' }}>Click "Start Practice Quiz" to begin drawing</li>
                  <li style={{ marginBottom: '4px' }}>Draw each stroke in the correct order</li>
                  <li style={{ marginBottom: '4px' }}>Use your mouse or touch to draw on the gray area</li>
                  <li>Press Escape or click outside to close</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// HARDCODED USAGE EXAMPLE - Just paste this into your component!
const HardcodedExample = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState('你');
  const [currentCharacterData, setCurrentCharacterData] = useState({
    pinyin: 'nǐ',
    definition: 'you (informal)',
    hsk_level: 'HSK1'
  });

  const openModal = (char: string, data: any) => {
    setCurrentCharacter(char);
    setCurrentCharacterData(data);
    setShowModal(true);
  };

  return (
    <div>
      <div className="header">
        <div className="logo">文</div>
        <h1>Hanzi Writing Practice Demo</h1>
        <p className="subtitle">
          Click any character below to start practicing writing with guided stroke order.
        </p>
      </div>
      
      {/* Test buttons for different characters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <button
          onClick={() => openModal('你', { pinyin: 'nǐ', definition: 'you (informal)', hsk_level: 'HSK1' })}
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)'
            e.currentTarget.style.borderColor = '#667eea'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = '#e2e8f0'
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>你</div>
          <div style={{ color: '#667eea', fontFamily: 'monospace' }}>nǐ</div>
          <div style={{ color: '#718096', fontSize: '14px' }}>you (informal)</div>
        </button>

        <button
          onClick={() => openModal('好', { pinyin: 'hǎo', definition: 'good, well', hsk_level: 'HSK1' })}
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)'
            e.currentTarget.style.borderColor = '#667eea'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = '#e2e8f0'
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>好</div>
          <div style={{ color: '#667eea', fontFamily: 'monospace' }}>hǎo</div>
          <div style={{ color: '#718096', fontSize: '14px' }}>good, well</div>
        </button>

        <button
          onClick={() => openModal('中', { pinyin: 'zhōng', definition: 'middle, center', hsk_level: 'HSK1' })}
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)'
            e.currentTarget.style.borderColor = '#667eea'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = '#e2e8f0'
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>中</div>
          <div style={{ color: '#667eea', fontFamily: 'monospace' }}>zhōng</div>
          <div style={{ color: '#718096', fontSize: '14px' }}>middle, center</div>
        </button>

        <button
          onClick={() => openModal('国', { pinyin: 'guó', definition: 'country, nation', hsk_level: 'HSK1' })}
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)'
            e.currentTarget.style.borderColor = '#667eea'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = '#e2e8f0'
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>国</div>
          <div style={{ color: '#667eea', fontFamily: 'monospace' }}>guó</div>
          <div style={{ color: '#718096', fontSize: '14px' }}>country, nation</div>
        </button>

        <button
          onClick={() => openModal('人', { pinyin: 'rén', definition: 'person, people', hsk_level: 'HSK1' })}
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)'
            e.currentTarget.style.borderColor = '#667eea'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = '#e2e8f0'
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>人</div>
          <div style={{ color: '#667eea', fontFamily: 'monospace' }}>rén</div>
          <div style={{ color: '#718096', fontSize: '14px' }}>person, people</div>
        </button>

        <button
          onClick={() => openModal('大', { pinyin: 'dà', definition: 'big, large, great', hsk_level: 'HSK1' })}
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)'
            e.currentTarget.style.borderColor = '#667eea'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = '#e2e8f0'
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>大</div>
          <div style={{ color: '#667eea', fontFamily: 'monospace' }}>dà</div>
          <div style={{ color: '#718096', fontSize: '14px' }}>big, large, great</div>
        </button>
      </div>

      <div className="feature-highlight">
        <div className="feature-icon">✍️</div>
        <div className="feature-text">
          This modal now uses the same CSS classes as your working settings modal to ensure proper overlay behavior.
        </div>
      </div>

      {/* The modal component */}
      <HanziPracticeModal
        character={currentCharacter}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        characterData={currentCharacterData}
      />
    </div>
  );
};

export default HardcodedExample;