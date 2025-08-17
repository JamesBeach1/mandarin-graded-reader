/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react'
import type { HanziItem } from './types/HanziItem'
import type { TooltipContent } from './types/ToolTip'
import Papa from 'papaparse'
import './App.css'
import { GoogleGenerativeAI } from '@google/generative-ai'

function App() {

  const [storyIdea, setStoryIdea] = useState('')
  const [hskLevel, setHskLevel] = useState('')
  const [loading, setLoading] = useState(false)
  const [hanziData, setHanziData] = useState<HanziItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [generatedStory, setGeneratedStory] = useState<HanziItem[]>([]);
  const [showPinyin, setShowPinyin] = useState(true);
  const [apiKey, setApiKey] = useState('FAKE API KEY');
  const [showSettings, setShowSettings] = useState(false)
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: TooltipContent | null;
    x: number;
    y: number;
  }>({
    visible: false,
    content: null,
    x: 0,
    y: 0
  });


  const loadHanziData = useCallback(async () => {
    try {
      setIsLoadingData(true)
      const response = await fetch('/src/assets/hanziDB.csv')
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status}`)
      }
      const csvText = await response.text()
      Papa.parse<HanziItem>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setHanziData(results.data)
          console.log('Loaded', results.data.length, 'hanzi entries')
          setIsLoadingData(false)
        },
        error: (error: unknown) => {
          console.error('Error parsing CSV:', error)
          setIsLoadingData(false)
        }
      })
    } catch (error) {
      console.error('Error loading hanzi data:', error)
      setIsLoadingData(false)
    }
  }, [])

  useEffect(() => {
    loadHanziData();
  }, []);

  const isChinese = (char: string) => /[\u4E00-\u9FFF]/.test(char)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!storyIdea.trim()) {
      alert('Please enter a story idea or theme.')
      return
    }
    if (!hskLevel) {
      alert('Please select your HSK level.')
      return
    }
    if (!apiKey || apiKey === 'FAKE API KEY') {
      alert('Please set a valid API key in settings first.')
      setShowSettings(true)
      return
    }

    setLoading(true)

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })

      const prompt = `Write me a HSK ${hskLevel} story using only simplified mandarin based on the idea: ${storyIdea}. Do not provide anything pinyin or english.`

      const request = await model.generateContent(prompt)
      const text = request.response.text()

      const hanziArray: HanziItem[] = []

      text.split('').forEach((char: string) => {
        if (isChinese(char)) {
          const entry = hanziData.find(item => item.character === char)
          if (entry) {
            hanziArray.push({
              ...entry,
              isNonChinese: false
            })
          } else {
            hanziArray.push({
              frequency_rank: '',
              character: char,
              pinyin: 'Unknown',
              definition: 'Definition not found',
              radical: '',
              radical_code: '',
              stroke_count: '',
              hsk_level: 'N/A',
              general_standard_num: '',
              isNonChinese: false
            })
          }
        } else {
          hanziArray.push({
            frequency_rank: '',
            character: char,
            pinyin: '',
            definition: '',
            radical: '',
            radical_code: '',
            stroke_count: '',
            hsk_level: '',
            general_standard_num: '',
            isNonChinese: true
          })
        }
      })

      setGeneratedStory(hanziArray)
    } catch (error) {
      console.error('Error generating story:', error)
      alert('Error generating story. Please check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStoryIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStoryIdea(e.target.value)
  }

  const handleMouseEnter = (event: React.MouseEvent, item: HanziItem) => {
    if (!item.isNonChinese && item.pinyin) {
      const rect = (event.target as HTMLElement).getBoundingClientRect()
      setTooltip({
        visible: true,
        content: {
          pinyin: item.pinyin,
          definition: item.definition,
          hskLevel: item.hsk_level,
          frequency: item.frequency_rank,
          radical: item.radical,
          strokes: item.stroke_count
        },
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      })
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (tooltip.visible) {
      setTooltip(prev => ({
        ...prev,
        x: event.pageX + 10,
        y: event.pageY + 10
      }))
    }
  }

  const handleMouseLeave = () => {
    setTooltip({ visible: false, content: null, x: 0, y: 0 })
  }

  if (isLoadingData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <h2>Loading Hanzi Database...</h2>
          <p>Please wait while we load the vocabulary data</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-overlay">
          <div className="settings-panel">
            <h3>Settings</h3>
            <div className="form-group">
              <label htmlFor="apiKey">Gemini API Key</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="text-input"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => setShowSettings(false)}
                  className="generate-button"
                  style={{ padding: '10px 20px', fontSize: '14px' }}
                >
                  Save
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Get your API key from Google AI Studio
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="header">
          <div className="logo">文</div>
          <h1>AI Mandarin Reader</h1>
          <p className="subtitle">
            Generate personalized Chinese stories tailored to your HSK level. Practice reading with content that matches your interests and proficiency.
          </p>
        </div>

        {/* Controls Bar */}
        <div className="controls-bar">
          <div className="controls-left">
            <button
              onClick={() => setShowPinyin(!showPinyin)}
              className="control-button"
            >
              {showPinyin ? '👁️ Hide Pinyin' : '👁️‍🗨️ Show Pinyin'}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="control-button"
            >
              ⚙️ {apiKey === 'FAKE API KEY' ? 'Set API Key' : 'Settings'}
            </button>
            <div className="status-text">
              📚 Vocabulary: {hanziData.length.toLocaleString()} characters loaded
            </div>
          </div>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="storyIdea">Story Idea or Theme</label>
              <textarea
                id="storyIdea"
                name="storyIdea"
                className="text-input"
                placeholder="Describe the story you'd like to read... e.g., 'A young person starting their first job in Beijing' or 'A family trip to the Great Wall' or 'Learning to cook traditional Chinese dishes'"
                required
                value={storyIdea}
                onChange={handleStoryIdeaChange}
                style={{
                  borderColor: storyIdea.length > 200 ? '#f56565' : '#e2e8f0'
                }}
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="hskLevel">HSK Level</label>
              <select
                id="hskLevel"
                name="hskLevel"
                className="select-input"
                required
                value={hskLevel}
                onChange={e => setHskLevel(e.target.value)}
              >
                <option value="">Select your HSK level</option>
                <option value="1">HSK 1 - Beginner (150 characters)</option>
                <option value="2">HSK 2 - Elementary (300 characters)</option>
                <option value="3">HSK 3 - Intermediate (600 characters)</option>
                <option value="4">HSK 4 - Upper Intermediate (1,200 characters)</option>
                <option value="5">HSK 5 - Advanced (2,500 characters)</option>
                <option value="6">HSK 6 - Proficient (5,000+ characters)</option>
              </select>

              <div className="hsk-info">
                <h4>HSK Level Guide</h4>
                <div className="hsk-levels">
                  <div className="hsk-level">HSK 1-2: Basic daily topics</div>
                  <div className="hsk-level">HSK 3-4: Complex situations</div>
                  <div className="hsk-level">HSK 5-6: Abstract concepts</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button type="submit" className="generate-button" disabled={loading}>
                {loading ? 'Generating Story...' : 'Generate Story'}
              </button>
            </div>
          </form>
        </div>

        {/* Generated Story Display */}
        {generatedStory.length > 0 && (
          <div className="story-container">
            <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>Your Generated Story</h3>
            <div className="story-text">
              {generatedStory.map((item, index) => (
                <span key={index} style={{ position: 'relative', display: 'inline-block' }}>
                  {item.isNonChinese ? (
                    <span style={{ color: '#718096' }}>{item.character}</span>
                  ) : (
                    <span
                      className="hanzi-character"
                      onMouseEnter={(e) => handleMouseEnter(e, item)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      {item.character}
                      {showPinyin && item.pinyin && item.pinyin !== 'Unknown' && (
                        <span className="pinyin-display">
                          {item.pinyin}
                        </span>
                      )}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="feature-highlight">
          <div className="feature-icon">AI</div>
          <div className="feature-text">
            <strong>Powered by advanced AI</strong> - Each story is uniquely crafted to match your chosen HSK level with appropriate vocabulary, grammar patterns, and cultural context.
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && tooltip.content && (
        <div
          className="tooltip-popup"
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div><strong>Pinyin:</strong> {tooltip.content.pinyin}</div>
          <div><strong>Definition:</strong> {tooltip.content.definition}</div>
          <div><strong>HSK Level:</strong> {tooltip.content.hskLevel}</div>
          {tooltip.content.frequency && (
            <div><strong>Frequency Rank:</strong> {tooltip.content.frequency}</div>
          )}
          {tooltip.content.radical && (
            <div><strong>Radical:</strong> {tooltip.content.radical}</div>
          )}
          {tooltip.content.strokes && (
            <div><strong>Strokes:</strong> {tooltip.content.strokes}</div>
          )}
        </div>
      )}
    </>
  )
}

export default App