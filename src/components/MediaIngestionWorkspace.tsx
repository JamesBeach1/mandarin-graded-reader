import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Upload, FileText, Video, Image, CheckCircle, BarChart2,
  ClipboardPaste, Bookmark, Trash2, Sparkles, Check, RotateCcw
} from 'lucide-react';
import { EpubParser, type ParsedEpubBook, type EpubChapter } from '../services/epubParser';
import { PdfParser, type ParsedPdfDocument, type PdfPage } from '../services/pdfParser';
import { OcrService } from '../services/ocrService';
import { SubtitleParser, type SubtitleCue } from '../services/subtitleParser';
import { analyzeLexicalDensity, type LexicalAnalysisReport } from '../utils/lexicalDensity';
import { extractTargetVocabulary, type ExtractedVocabItem } from '../utils/vocabExtractor';
import { tokenizeStory } from '../utils/tokenizer';
import type { HanziItem } from '../types/HanziItem';
import { addCard, batchAddCards } from '../services/srsStore';
import { ToastStore } from '../services/toastStore';
import { saveStory } from '../services/libraryStore';
import { SynonymLadderEngine, type SubstitutionRecord } from '../utils/synonymLadder';

const SAMPLE_CHINESE_TEXTS = [
  {
    title: '咖啡馆与燕麦奶拿铁 (Ordering Oat Milk Latte)',
    level: 'HSK 2-3',
    text: `今天下午阳光很好，我走进街角的一家独立咖啡馆。
店员热情地和我打招呼：“您好，请问今天想喝点什么？”
我说：“我要一杯热拿铁，可以把牛奶换成燕麦奶吗？微糖，谢谢。”
店员微笑着点头：“没问题，燕麦奶拿铁微糖，堂食还是带走？”
“在店里喝。”
不一会儿，一杯冒着香气的燕麦奶拿铁就端到了我的桌前。上面的拉花像一片漂亮的羽毛，入口非常丝滑香醇。`
  },
  {
    title: '逛北京胡同与胡同小吃 (Beijing Hutong Culture)',
    level: 'HSK 3-4',
    text: `北京的胡同是这座历史古城最生动的心跳。
漫步在窄窄的巷子里，两旁是古朴的灰墙青瓦，门前种着高大的槐树。老人坐在树荫下摇着蒲扇下象棋，小猫懒洋洋地躺在院门边晒太阳。
拐角处有一家开了三十年的老字号小吃店，锅里正冒着滚滚热气。芝麻烧饼外酥里嫩，羊杂汤香气四溢。
在这里，时间仿佛变慢了，现代城市的喧嚣被隔绝在青砖红门之外。`
  },
  {
    title: '人工智能与语言学习 (AI & Modern Learning)',
    level: 'HSK 4-5',
    text: `随着人工智能大语言模型的飞速发展，外语学习的方式正在经历一场前所未有的深刻变革。
过去，学习者往往受限于语言环境匮乏和师资成本高昂，难以获得即时的发音纠正与语境沉浸。如今，智能分级阅读系统可以根据学习者的具体词汇掌握度，动态解析每一个汉字、成语和多字词。
无论是在咖啡馆阅读长篇文章，还是在日常通勤中练习听力，科技都让高效的自主学习成为触手可及的现实。`
  }
];

interface MediaIngestionWorkspaceProps {
  hanziData: HanziItem[];
  vocabData: HanziItem[];
  overridesMap: Record<string, { pinyin: string; definition: string }>;
  onLoadIntoReader: (title: string, tokens: HanziItem[], rawText: string) => void;
}

export const MediaIngestionWorkspace: React.FC<MediaIngestionWorkspaceProps> = ({
  hanziData,
  vocabData,
  overridesMap,
  onLoadIntoReader
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'paste' | 'epub' | 'pdf' | 'ocr' | 'subtitles'>('paste');
  
  // Free text paste state
  const [pastedText, setPastedText] = useState('');
  const [pastedTitle, setPastedTitle] = useState('');
  const [isSavingToLibrary, setIsSavingToLibrary] = useState(false);
  const [adapterSubstitutions, setAdapterSubstitutions] = useState<SubstitutionRecord[]>([]);

  const handleAdaptDifficulty = (targetHsk: number) => {
    if (!pastedText.trim()) return;
    const { scaledText, substitutions } = SynonymLadderEngine.scaleDifficulty(pastedText, targetHsk);
    if (substitutions.length > 0) {
      setPastedText(scaledText);
      setAdapterSubstitutions(substitutions);
      ToastStore.success(`Adapted text to HSK ${targetHsk}: swapped ${substitutions.length} vocabulary items!`);
    } else {
      ToastStore.info(`Text is already optimal for HSK ${targetHsk} ladder.`);
    }
  };

  const [parsedBook, setParsedBook] = useState<ParsedEpubBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<EpubChapter | null>(null);

  // PDF state
  const [parsedPdf, setParsedPdf] = useState<ParsedPdfDocument | null>(null);
  const [selectedPdfPage, setSelectedPdfPage] = useState<PdfPage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Subtitle state
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);
  const [subtitleFileName, setSubtitleFileName] = useState('');

  // Analysis state
  const [lexicalReport, setLexicalReport] = useState<LexicalAnalysisReport | null>(null);
  const [extractedVocab, setExtractedVocab] = useState<ExtractedVocabItem[]>([]);
  const [knownHskFilter, setKnownHskFilter] = useState<number>(2);

  // Live lexical analysis for pasted text
  const pastedAnalysis = useMemo(() => {
    const trimmed = pastedText.trim();
    if (!trimmed) return null;
    const tokens = tokenizeStory(trimmed, hanziData, vocabData, overridesMap);
    const report = analyzeLexicalDensity(tokens);
    const targetVocab = extractTargetVocabulary(tokens, knownHskFilter);
    const hanziCount = (trimmed.match(/[\u4E00-\u9FFF]/g) || []).length;
    return {
      tokens,
      report,
      targetVocab,
      charCount: trimmed.length,
      hanziCount
    };
  }, [pastedText, hanziData, vocabData, overridesMap, knownHskFilter]);

  const handleReadPastedText = () => {
    if (!pastedText.trim()) {
      ToastStore.warning('Please paste or enter some Chinese text first.');
      return;
    }
    const tokens = pastedAnalysis?.tokens || tokenizeStory(pastedText, hanziData, vocabData, overridesMap);
    let title = pastedTitle.trim();
    if (!title) {
      const firstLine = pastedText.split('\n').map(l => l.trim()).find(l => l.length > 0) || '';
      title = firstLine.length > 24 ? firstLine.slice(0, 24) + '...' : firstLine || 'Custom Chinese Text';
    }
    onLoadIntoReader(title, tokens, pastedText);
    ToastStore.success(`Opened "${title}" in Graded Reader!`);
  };

  const handleSavePastedTextToLibrary = async () => {
    if (!pastedText.trim()) {
      ToastStore.warning('Please paste or enter some Chinese text first.');
      return;
    }
    let title = pastedTitle.trim();
    if (!title) {
      const firstLine = pastedText.split('\n').map(l => l.trim()).find(l => l.length > 0) || '';
      title = firstLine.length > 24 ? firstLine.slice(0, 24) + '...' : firstLine || 'Custom Chinese Text';
    }
    setIsSavingToLibrary(true);
    try {
      const estimatedHsk = pastedAnalysis?.report.estimatedHSKLevel ? String(pastedAnalysis.report.estimatedHSKLevel) : '3';
      await saveStory({
        title,
        text: pastedText,
        hskLevel: estimatedHsk
      });
      ToastStore.success(`Saved "${title}" to your offline story library!`);
    } catch (err) {
      console.error('Failed to save to library:', err);
      ToastStore.error('Failed to save story to library.');
    } finally {
      setIsSavingToLibrary(false);
    }
  };

  const handleLoadSampleText = (sample: typeof SAMPLE_CHINESE_TEXTS[0]) => {
    setPastedTitle(sample.title);
    setPastedText(sample.text);
    ToastStore.info(`Loaded sample: ${sample.title}`);
  };

  // EPUB file upload
  const handleEpubUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const book = await EpubParser.parseEpub(buffer);
      setParsedBook(book);
      if (book.chapters.length > 0) {
        selectChapter(book.chapters[0]);
      }
    } catch (err) {
      console.error('Failed to parse EPUB:', err);
      ToastStore.error('Error parsing EPUB file. Please ensure it is a valid, unencrypted EPUB archive.');
    } finally {
      setIsProcessing(false);
    }
  };

  // PDF file upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PdfParser.parsePdf(buffer, file.name);
      setParsedPdf(pdf);
      if (pdf.pages.length > 0) {
        selectPdfPage(pdf.pages[0]);
      }
    } catch (err) {
      console.error('Failed to parse PDF:', err);
      ToastStore.error('Error parsing PDF file. Please ensure it is an unencrypted PDF document with extractable text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectPdfPage = (page: PdfPage) => {
    setSelectedPdfPage(page);
    const tokens = tokenizeStory(page.text, hanziData, vocabData, overridesMap);

    // Compute analytics
    const report = analyzeLexicalDensity(tokens);
    setLexicalReport(report);

    const targetVocab = extractTargetVocabulary(tokens, knownHskFilter);
    setExtractedVocab(targetVocab);
  };

  const handleOpenPdfPageInReader = () => {
    if (!selectedPdfPage || !parsedPdf) return;
    const tokens = tokenizeStory(selectedPdfPage.text, hanziData, vocabData, overridesMap);
    onLoadIntoReader(`${parsedPdf.title} - Page ${selectedPdfPage.pageNumber}`, tokens, selectedPdfPage.text);
  };

  const handleOpenEntirePdfInReader = () => {
    if (!parsedPdf) return;
    const tokens = tokenizeStory(parsedPdf.fullText, hanziData, vocabData, overridesMap);
    onLoadIntoReader(parsedPdf.title, tokens, parsedPdf.fullText);
  };

  // OCR file upload
  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const ocrResult = await OcrService.recognizeImage(file);
      const tokens = tokenizeStory(ocrResult.text, hanziData, vocabData, overridesMap);
      
      const report = analyzeLexicalDensity(tokens);
      setLexicalReport(report);

      const targetVocab = extractTargetVocabulary(tokens, knownHskFilter);
      setExtractedVocab(targetVocab);

      onLoadIntoReader(`OCR: ${file.name}`, tokens, ocrResult.text);
    } catch (err) {
      console.error('OCR Error:', err);
      ToastStore.error('Failed to process image OCR.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Subtitle file upload
  const handleSubtitleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const cues = SubtitleParser.parse(text);
      setSubtitleCues(cues);
      setSubtitleFileName(file.name);

      const fullText = cues.map(c => c.text).join('\n');
      const tokens = tokenizeStory(fullText, hanziData, vocabData, overridesMap);
      
      const report = analyzeLexicalDensity(tokens);
      setLexicalReport(report);

      const targetVocab = extractTargetVocabulary(tokens, knownHskFilter);
      setExtractedVocab(targetVocab);
    } catch (err) {
      console.error('Subtitle parse error:', err);
      ToastStore.error('Failed to parse subtitle file.');
    }
  };

  const selectChapter = (chapter: EpubChapter) => {
    setSelectedChapter(chapter);
    const tokens = tokenizeStory(chapter.rawText, hanziData, vocabData, overridesMap);
    
    // Compute analytics
    const report = analyzeLexicalDensity(tokens);
    setLexicalReport(report);

    const targetVocab = extractTargetVocabulary(tokens, knownHskFilter);
    setExtractedVocab(targetVocab);
  };

  const handleOpenInReader = () => {
    if (!selectedChapter) return;
    const tokens = tokenizeStory(selectedChapter.rawText, hanziData, vocabData, overridesMap);
    onLoadIntoReader(selectedChapter.title, tokens, selectedChapter.rawText);
  };

  const handleAddAllTargetVocabToSRS = async () => {
    const cardsToAdd = extractedVocab.map(item => {
      let sentenceContext: string | undefined;
      if (selectedChapter?.rawText) {
        const sentenceMatch = selectedChapter.rawText.split(/[。！？\n]/).find(s => s.includes(item.character));
        if (sentenceMatch) sentenceContext = sentenceMatch.trim() + '。';
      }
      return {
        character: item.character,
        pinyin: item.pinyin,
        definition: item.definition,
        hsk_level: item.hsk_level,
        exampleSentence: sentenceContext
      };
    });

    await batchAddCards(cardsToAdd);
    ToastStore.success(`Added ${extractedVocab.length} words exceeding HSK ${knownHskFilter} to your flashcards queue!`, 'Vocabulary Ingested');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '20px 24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'none'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>
            Media Ingestion & Extensive Reading
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Paste custom Chinese text, or import EPUB novels, Chinese PDF documents, OCR scans, and video subtitles with automated lexical analysis.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-base)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
          <button
            onClick={() => setActiveMediaTab('paste')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeMediaTab === 'paste' ? 'var(--border-strong)' : 'transparent',
              color: activeMediaTab === 'paste' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <ClipboardPaste size={13} /> Paste Text
          </button>
          <button
            onClick={() => setActiveMediaTab('epub')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeMediaTab === 'epub' ? 'var(--border-strong)' : 'transparent',
              color: activeMediaTab === 'epub' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <BookOpen size={13} /> EPUB Books
          </button>
          <button
            onClick={() => setActiveMediaTab('pdf')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeMediaTab === 'pdf' ? 'var(--border-strong)' : 'transparent',
              color: activeMediaTab === 'pdf' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={13} /> PDF Documents
          </button>
          <button
            onClick={() => setActiveMediaTab('ocr')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeMediaTab === 'ocr' ? 'var(--border-strong)' : 'transparent',
              color: activeMediaTab === 'ocr' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <Image size={13} /> OCR Scans
          </button>
          <button
            onClick={() => setActiveMediaTab('subtitles')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeMediaTab === 'subtitles' ? 'var(--border-strong)' : 'transparent',
              color: activeMediaTab === 'subtitles' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <Video size={13} /> Video Subtitles
          </button>
        </div>
      </div>

      {/* Free Text Paste Mode */}
      {activeMediaTab === 'paste' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            padding: '24px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardPaste size={18} color="var(--accent-bamboo)" /> Paste or Type Chinese Text
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Paste any Chinese article, dialogue, book excerpt, or news story. Moyun will instantly segment words, analyze HSK level, and launch the interactive Graded Reader.
                </p>
              </div>

              {pastedText && (
                <button
                  type="button"
                  onClick={() => {
                    setPastedText('');
                    setPastedTitle('');
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <Trash2 size={12} /> Clear Text
                </button>
              )}
            </div>

            {/* Quick Sample Text Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} color="var(--accent-gold)" /> Quick Samples:
              </span>
              {SAMPLE_CHINESE_TEXTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSampleText(sample)}
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '3px 9px', borderRadius: 'var(--radius-pill)' }}
                  title={`Load "${sample.title}"`}
                >
                  {sample.title.split(' ')[0]} ({sample.level})
                </button>
              ))}
            </div>

            {/* Title Input */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Story / Article Title <span style={{ color: 'var(--text-muted)' }}>(Optional — defaults to first line)</span>
              </label>
              <input
                type="text"
                value={pastedTitle}
                onChange={(e) => setPastedTitle(e.target.value)}
                placeholder="e.g. Ordering Coffee in Chengdu, or leave blank to auto-detect title..."
                className="form-input"
                style={{ width: '100%', fontSize: '13px' }}
              />
            </div>

            {/* Textarea Area */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', margin: 0 }}>
                  Chinese Text Content
                </label>
                {/* 1-Click Offline Story Adapter Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    ⚡ 1-Click Adapter:
                  </span>
                  {[1, 2, 3, 4, 5, 6].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      disabled={!pastedText.trim()}
                      onClick={() => handleAdaptDifficulty(lvl)}
                      className="btn btn-secondary"
                      style={{
                        padding: '2px 7px',
                        fontSize: '11px',
                        borderRadius: 'var(--radius-pill)',
                        opacity: pastedText.trim() ? 1 : 0.5
                      }}
                      title={`Adapt pasted text vocabulary to HSK ${lvl} without LLM`}
                    >
                      HSK {lvl}
                    </button>
                  ))}
                  {adapterSubstitutions.length > 0 && (
                    <span style={{ fontSize: '10px', color: 'var(--accent-bamboo)', fontWeight: 600 }}>
                      ({adapterSubstitutions.length} swapped)
                    </span>
                  )}
                </div>
              </div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={"Paste your Chinese text here... \n\n例如：\n今天下午阳光很好，我走进街角的一家咖啡馆。\n店员热情地问：“您好，请问想喝点什么？”\n我说：“我要一杯燕麦奶拿铁，微糖，谢谢。”"}
                rows={11}
                className="form-input"
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-serif-zh)',
                  fontSize: '16px',
                  lineHeight: 1.8,
                  padding: '14px 16px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Live Stats Bar & Main Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              {/* Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)'
                }}>
                  📝 <strong>{pastedAnalysis?.charCount || 0}</strong> chars ({pastedAnalysis?.hanziCount || 0} Hanzi)
                </span>

                {pastedAnalysis && (
                  <>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'rgba(88, 204, 2, 0.1)',
                      border: '1px solid rgba(88, 204, 2, 0.3)',
                      color: 'var(--accent-bamboo)',
                      fontWeight: 600
                    }}>
                      📊 Est. HSK {pastedAnalysis.report.estimatedHSKLevel}
                    </span>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--bg-base)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-muted)'
                    }}>
                      🎯 {pastedAnalysis.targetVocab.length} Target Words (&gt; HSK {knownHskFilter})
                    </span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleSavePastedTextToLibrary}
                  disabled={!pastedText.trim() || isSavingToLibrary}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  title="Save to your local offline library"
                >
                  <Bookmark size={14} /> {isSavingToLibrary ? 'Saving...' : 'Save to Library'}
                </button>

                <button
                  type="button"
                  onClick={handleReadPastedText}
                  disabled={!pastedText.trim()}
                  className="btn btn-primary"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    padding: '8px 22px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: pastedText.trim() ? 1 : 0.6
                  }}
                  title="Open this text in the Graded Reading Theater"
                >
                  <BookOpen size={15} /> Open in Graded Reader
                </button>
              </div>
            </div>
          </div>

          {/* Lexical Analysis & Vocabulary Extraction Cards for Pasted Text */}
          {pastedAnalysis && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Card 1: Lexical Density Report */}
              <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <BarChart2 size={18} color="var(--accent-bamboo)" />
                  <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>Lexical Density & Level</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Estimated Level:</span>
                    <strong style={{ color: 'var(--accent-bamboo)' }}>HSK {pastedAnalysis.report.estimatedHSKLevel}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Type-Token Ratio (TTR):</span>
                    <strong>{pastedAnalysis.report.typeTokenRatio} ({pastedAnalysis.report.lexicalDensityPercentage}%)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Unique / Total Hanzi:</span>
                    <span>{pastedAnalysis.report.uniqueCharacters} / {pastedAnalysis.report.totalCharacters}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Target Vocabulary Extraction */}
              <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>
                    Target Words (&gt; HSK {knownHskFilter})
                  </h4>
                  {pastedAnalysis.targetVocab.length > 0 && (
                    <button
                      onClick={async () => {
                        const cardsToAdd = pastedAnalysis.targetVocab.map(item => {
                          let sentenceContext: string | undefined;
                          if (pastedText) {
                            const sentenceMatch = pastedText.split(/[。！？\n]/).find(s => s.includes(item.character));
                            if (sentenceMatch) sentenceContext = sentenceMatch.trim() + '。';
                          }
                          return {
                            character: item.character,
                            pinyin: item.pinyin,
                            definition: item.definition,
                            hsk_level: item.hsk_level,
                            exampleSentence: sentenceContext
                          };
                        });
                        await batchAddCards(cardsToAdd);
                        ToastStore.success(`Added ${pastedAnalysis.targetVocab.length} words to flashcards!`, 'Vocabulary Ingested');
                      }}
                      className="btn btn-bamboo"
                      style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <CheckCircle size={12} /> Add All ({pastedAnalysis.targetVocab.length})
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {pastedAnalysis.targetVocab.length === 0 ? (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      All words in this text are within HSK {knownHskFilter} or common vocabulary.
                    </span>
                  ) : (
                    pastedAnalysis.targetVocab.slice(0, 10).map(v => (
                      <div key={v.character} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span><strong style={{ fontFamily: 'var(--font-serif-zh)' }}>{v.character}</strong> ({v.pinyin}): {v.definition.slice(0, 24)}...</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>x{v.occurrenceCount}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EPUB Ingestion Mode */}
      {activeMediaTab === 'epub' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!parsedBook ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--border-strong)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px'
            }}>
              <BookOpen size={48} color="var(--accent-indigo)" />
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Upload Chinese EPUB E-Book</h3>
              <p style={{ margin: 0, maxWidth: '440px', fontSize: '13px', color: 'var(--text-muted)' }}>
                Select any unencrypted .epub file. The engine will unpack the archive, extract chapters, and tokenize all text with dictionary popups.
              </p>
              <label className="btn btn-primary" style={{ marginTop: '8px', cursor: 'pointer' }}>
                <Upload size={16} /> {isProcessing ? 'Unpacking EPUB...' : 'Select .epub File'}
                <input
                  type="file"
                  accept=".epub"
                  onChange={handleEpubUpload}
                  style={{ display: 'none' }}
                  disabled={isProcessing}
                />
              </label>
            </div>
          ) : (
            <div className="media-workspace-grid">
              {/* Left Column: Table of Contents Drawer */}
              <div className="toc-sidebar">
                <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)', fontFamily: 'var(--font-serif-zh)' }}>
                    {parsedBook.title}
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{parsedBook.author}</span>
                </div>

                <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Table of Contents ({parsedBook.chapters.length} Sections)
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {parsedBook.chapters.map(chap => (
                    <div
                      key={chap.id}
                      onClick={() => selectChapter(chap)}
                      className={`toc-item ${selectedChapter?.id === chap.id ? 'active' : ''}`}
                    >
                      {chap.title}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Reading Preview & Lexical Density Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {selectedChapter && (
                  <div className="reading-theater" style={{ minHeight: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
                      <h3 style={{ margin: 0, fontFamily: 'var(--font-serif-zh)', fontSize: '20px', color: 'var(--text-main)' }}>
                        {selectedChapter.title}
                      </h3>
                      <button onClick={handleOpenInReader} className="btn btn-primary">
                        <BookOpen size={16} /> Open in Reading Theater
                      </button>
                    </div>

                    <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '10px 0', fontSize: '16px', lineHeight: 1.8, color: 'var(--text-main)', fontFamily: 'var(--font-serif-zh)' }}>
                      {selectedChapter.rawText.slice(0, 800)}...
                    </div>
                  </div>
                )}

                {/* Lexical Analysis & Vocabulary Extraction Cards */}
                {lexicalReport && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {/* Card 1: Lexical Density Report */}
                    <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <BarChart2 size={18} color="var(--accent-indigo)" />
                        <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)' }}>Lexical Density & Level</h4>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Estimated Level:</span>
                          <strong>HSK {lexicalReport.estimatedHSKLevel}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Type-Token Ratio (TTR):</span>
                          <strong>{lexicalReport.typeTokenRatio} ({lexicalReport.lexicalDensityPercentage}%)</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Unique / Total Hanzi:</span>
                          <span>{lexicalReport.uniqueCharacters} / {lexicalReport.totalCharacters}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Target Vocabulary Extraction */}
                    <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)' }}>Target Words (&gt; HSK {knownHskFilter})</h4>
                        <button onClick={handleAddAllTargetVocabToSRS} className="btn btn-bamboo" style={{ padding: '4px 10px', fontSize: '11px' }}>
                          <CheckCircle size={12} /> Add All ({extractedVocab.length})
                        </button>
                      </div>

                      <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {extractedVocab.slice(0, 8).map(v => (
                          <div key={v.character} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                            <span><strong>{v.character}</strong> ({v.pinyin}): {v.definition.slice(0, 20)}...</span>
                            <span style={{ color: 'var(--text-muted)' }}>x{v.occurrenceCount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PDF Ingestion Mode */}
      {activeMediaTab === 'pdf' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!parsedPdf ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--border-strong)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px'
            }}>
              <FileText size={48} color="var(--accent-indigo)" />
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Upload Chinese PDF Document</h3>
              <p style={{ margin: 0, maxWidth: '440px', fontSize: '13px', color: 'var(--text-muted)' }}>
                Select any PDF graded reader, article, or document. The engine decodes CJK CMaps, extracts page-by-page text, and provides instant lexical profiling.
              </p>
              <label className="btn btn-primary" style={{ marginTop: '8px', cursor: 'pointer' }}>
                <Upload size={16} /> {isProcessing ? 'Parsing PDF Document...' : 'Select .pdf File'}
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfUpload}
                  style={{ display: 'none' }}
                  disabled={isProcessing}
                />
              </label>
            </div>
          ) : (
            <div className="media-workspace-grid">
              {/* Left Column: Page Navigation Sidebar */}
              <div className="toc-sidebar">
                <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)', fontFamily: 'var(--font-serif-zh)' }}>
                        {parsedPdf.title}
                      </h4>
                      {parsedPdf.author && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{parsedPdf.author}</span>
                      )}
                    </div>
                    <label className="btn btn-secondary" style={{ fontSize: '11px', padding: '3px 8px', cursor: 'pointer' }} title="Upload another PDF">
                      <span>Replace</span>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handlePdfUpload}
                        style={{ display: 'none' }}
                        disabled={isProcessing}
                      />
                    </label>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {parsedPdf.totalPages} Total Pages • {parsedPdf.fullText.length} Characters
                  </div>
                </div>

                <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Pages ({parsedPdf.pages.length})
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '420px', overflowY: 'auto' }}>
                  {parsedPdf.pages.map(page => (
                    <div
                      key={page.pageNumber}
                      onClick={() => selectPdfPage(page)}
                      className={`toc-item ${selectedPdfPage?.pageNumber === page.pageNumber ? 'active' : ''}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>{page.title}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{page.text.length} chars</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
                  <button
                    onClick={handleOpenEntirePdfInReader}
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '12px', padding: '6px 10px', justifyContent: 'center' }}
                  >
                    Open Entire PDF ({parsedPdf.totalPages} Pgs)
                  </button>
                </div>
              </div>

              {/* Right Column: Reading Preview & Lexical Density Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {selectedPdfPage && (
                  <div className="reading-theater" style={{ minHeight: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontFamily: 'var(--font-serif-zh)', fontSize: '20px', color: 'var(--text-main)' }}>
                          {selectedPdfPage.title}
                        </h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {selectedPdfPage.text.length} characters • Page {selectedPdfPage.pageNumber} of {parsedPdf.totalPages}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleOpenPdfPageInReader} className="btn btn-primary">
                          <BookOpen size={16} /> Open Page in Reading Theater
                        </button>
                      </div>
                    </div>

                    <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '10px 0', fontSize: '16px', lineHeight: 1.8, color: 'var(--text-main)', fontFamily: 'var(--font-serif-zh)' }}>
                      {selectedPdfPage.text.length > 0 ? (
                        selectedPdfPage.text.slice(0, 1000) + (selectedPdfPage.text.length > 1000 ? '...' : '')
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No extractable text found on this page (scanned image page or empty).
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Lexical Analysis & Vocabulary Extraction Cards */}
                {lexicalReport && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {/* Card 1: Lexical Density Report */}
                    <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <BarChart2 size={18} color="var(--accent-indigo)" />
                        <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)' }}>Lexical Density & Level</h4>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Estimated Level:</span>
                          <strong>HSK {lexicalReport.estimatedHSKLevel}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Type-Token Ratio (TTR):</span>
                          <strong>{lexicalReport.typeTokenRatio} ({lexicalReport.lexicalDensityPercentage}%)</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Unique / Total Hanzi:</span>
                          <span>{lexicalReport.uniqueCharacters} / {lexicalReport.totalCharacters}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Target Vocabulary Extraction */}
                    <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)' }}>Target Words (&gt; HSK {knownHskFilter})</h4>
                        <button onClick={handleAddAllTargetVocabToSRS} className="btn btn-bamboo" style={{ padding: '4px 10px', fontSize: '11px' }}>
                          <CheckCircle size={12} /> Add All ({extractedVocab.length})
                        </button>
                      </div>

                      <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {extractedVocab.slice(0, 8).map(v => (
                          <div key={v.character} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                            <span><strong>{v.character}</strong> ({v.pinyin}): {v.definition.slice(0, 20)}...</span>
                            <span style={{ color: 'var(--text-muted)' }}>x{v.occurrenceCount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* OCR Ingestion Mode */}
      {activeMediaTab === 'ocr' && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '2px dashed var(--border-strong)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px'
        }}>
          <Image size={48} color="var(--accent-cinnabar)" />
          <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Scan Images, Screenshots, or Menus (OCR)</h3>
          <p style={{ margin: 0, maxWidth: '440px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Upload an image containing Chinese text. The in-browser OCR engine will extract the characters and launch the interactive reader.
          </p>
          <label className="btn btn-primary" style={{ marginTop: '8px', cursor: 'pointer' }}>
            <Upload size={16} /> {isProcessing ? 'Processing Image OCR...' : 'Upload Image (PNG/JPG)'}
            <input
              type="file"
              accept="image/*"
              onChange={handleOcrUpload}
              style={{ display: 'none' }}
              disabled={isProcessing}
            />
          </label>
        </div>
      )}

      {/* Subtitles Mode */}
      {activeMediaTab === 'subtitles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {subtitleCues.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--border-strong)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px'
            }}>
              <Video size={48} color="var(--accent-bamboo)" />
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Upload Chinese Subtitles (.srt / .vtt)</h3>
              <p style={{ margin: 0, maxWidth: '440px', fontSize: '13px', color: 'var(--text-muted)' }}>
                Load timed subtitle files from movies or TV dramas to read dialogue cues with instant hover translations.
              </p>
              <label className="btn btn-bamboo" style={{ marginTop: '8px', cursor: 'pointer' }}>
                <Upload size={16} /> Select .srt / .vtt File
                <input
                  type="file"
                  accept=".srt,.vtt"
                  onChange={handleSubtitleUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          ) : (
            <div className="pitch-studio-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)' }}>{subtitleFileName}</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtitleCues.length} Timed Dialogue Cues</span>
                </div>
                <button
                  onClick={() => {
                    const fullText = subtitleCues.map(c => c.text).join('\n');
                    const tokens = tokenizeStory(fullText, hanziData, vocabData, overridesMap);
                    onLoadIntoReader(subtitleFileName, tokens, fullText);
                  }}
                  className="btn btn-primary"
                >
                  Open Subtitles in Reading Theater
                </button>
              </div>

              <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {subtitleCues.map(cue => (
                  <div key={cue.id} style={{ display: 'flex', gap: '16px', padding: '8px 12px', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-sm)', fontSize: '14px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {cue.startFormatted}
                    </span>
                    <span style={{ fontFamily: 'var(--font-serif-zh)', fontSize: '16px', color: 'var(--text-main)' }}>
                      {cue.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
