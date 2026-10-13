import { BDDContext } from './bddRunner';
import { runTokenizerAcceptanceTests } from './tokenizer.spec';
import { runScriptConverterAcceptanceTests } from './scriptConverter.spec';
import { runZhuyinConverterAcceptanceTests } from './zhuyinConverter.spec';
import { runToneColorizerAcceptanceTests } from './toneColorizer.spec';
import { runLexicalDensityAcceptanceTests } from './lexicalDensity.spec';
import { runVocabExtractorAcceptanceTests } from './vocabExtractor.spec';
import { runGrammarHighlighterAcceptanceTests } from './grammarHighlighter.spec';
import { runHomophoneDetectorAcceptanceTests } from './homophoneDetector.spec';
import { runSynonymLadderAcceptanceTests } from './synonymLadder.spec';
import { runChengyuDatabaseAcceptanceTests } from './chengyuDatabase.spec';
import { runSrsAlgorithmAcceptanceTests } from './srsAlgorithm.spec';
import { runAdaptiveEngineAcceptanceTests } from './adaptiveEngine.spec';
import { runSubtitleParserAcceptanceTests } from './subtitleParser.spec';
import { runStoryShareAcceptanceTests } from './storyShare.spec';
import { runReadingAnalyticsAcceptanceTests } from './readingAnalytics.spec';
import { runStorageServiceAcceptanceTests } from './storageService.spec';
import { runToastStoreAcceptanceTests } from './toastStore.spec';
import { runSemanticSearchAcceptanceTests } from './semanticSearch.spec';
import { runAdventureEngineAcceptanceTests } from './adventureEngine.spec';
import { runDictionarySearchAcceptanceTests } from './dictionarySearch.spec';
import { runCompoundDictionaryAcceptanceTests } from './compoundDictionary.spec';
import { runGeminiEngineAcceptanceTests } from './geminiEngine.spec';
import { runWritingGraderAcceptanceTests } from './writingGrader.spec';
import { runStrokeOrderAcceptanceTests } from './strokeOrder.spec';
import { runAnkiExportAcceptanceTests } from './ankiExport.spec';
import { runSyllabusGeneratorAcceptanceTests } from './syllabusGenerator.spec';
import { runUserExperienceFlowsAcceptanceTests } from './userExperienceFlows.spec';

export async function runAllAcceptanceTests(): Promise<{ total: number; passed: number; failed: number; assertions: number }> {
  console.log(`\n========================================================================`);
  console.log(`  MOYUN MANDARIN GRADED READER — EXHAUSTIVE BDD ACCEPTANCE SUITE`);
  console.log(`========================================================================`);

  BDDContext.reset();

  await runTokenizerAcceptanceTests();
  await runScriptConverterAcceptanceTests();
  await runZhuyinConverterAcceptanceTests();
  await runToneColorizerAcceptanceTests();
  await runLexicalDensityAcceptanceTests();
  await runVocabExtractorAcceptanceTests();
  await runGrammarHighlighterAcceptanceTests();
  await runHomophoneDetectorAcceptanceTests();
  await runSynonymLadderAcceptanceTests();
  await runChengyuDatabaseAcceptanceTests();
  await runSrsAlgorithmAcceptanceTests();
  await runAdaptiveEngineAcceptanceTests();
  await runSubtitleParserAcceptanceTests();
  await runStoryShareAcceptanceTests();
  await runReadingAnalyticsAcceptanceTests();
  await runStorageServiceAcceptanceTests();
  await runToastStoreAcceptanceTests();
  await runSemanticSearchAcceptanceTests();
  await runAdventureEngineAcceptanceTests();
  await runDictionarySearchAcceptanceTests();
  await runCompoundDictionaryAcceptanceTests();
  await runGeminiEngineAcceptanceTests();
  await runWritingGraderAcceptanceTests();
  await runStrokeOrderAcceptanceTests();
  await runAnkiExportAcceptanceTests();
  await runSyllabusGeneratorAcceptanceTests();
  await runUserExperienceFlowsAcceptanceTests();

  const report = BDDContext.getReport();

  console.log(`\n========================================================================`);
  console.log(`  BDD ACCEPTANCE SUITE EXECUTION SUMMARY`);
  console.log(`========================================================================`);
  console.log(`  Total Scenarios:  ${report.total}`);
  console.log(`  Passed:           \x1b[32m${report.passed}\x1b[0m`);
  console.log(`  Failed:           ${report.failed > 0 ? `\x1b[31m${report.failed}\x1b[0m` : `\x1b[32m0\x1b[0m`}`);
  console.log(`  Total Assertions: \x1b[36m${report.assertions}\x1b[0m`);
  console.log(`========================================================================\n`);

  return report;
}
