import { useState } from 'react';
import './App.css';

// Import data
import questionsData from './data/questions.json';
import ageNormsData from './data/ageNorms.json';

// Import utilities
import { calculateScores, isImpairmentSignificant, hasSleepConfounder } from './utils/calculator';
import { calculateBayesianProbabilities, applyPatternBoosts, getConfidenceLevel } from './utils/bayesianEngine';
import { matchPatterns } from './utils/mlMatcher';

// Import components
import NHSHeader from './components/NHSHeader';
import WarningCallout, { ClinicalDisclaimer, SleepWarning, LowImpairmentWarning, AgeAppropriateWarning } from './components/WarningCallout';
import ProgressBar, { TierProgress } from './components/ProgressBar';
import QuestionRenderer from './components/QuestionRenderer';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  // State management
  const [currentStep, setCurrentStep] = useState('intro'); // 'intro', 'screening', 'results'
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [results, setResults] = useState(null);
  const [childAge, setChildAge] = useState(null);

  const sections = questionsData.sections;
  const currentSection = sections[currentSectionIndex];

  // Handle response change
  const handleResponseChange = (questionId, value) => {
    const newResponses = { ...responses, [questionId]: value };
    setResponses(newResponses);

    // If age is being set, store it
    if (questionId === 'age') {
      setChildAge(value);
    }
  };

  // Validate current section
  const validateSection = () => {
    if (!currentSection) return true;

    const errors = [];
    currentSection.questions.forEach(question => {
      if (question.required && !responses[question.id]) {
        errors.push(`${question.text} is required`);
      }
    });

    if (errors.length > 0) {
      alert('Please answer all required questions:\n' + errors.join('\n'));
      return false;
    }

    return true;
  };

  // Navigate to next section
  const handleNext = () => {
    if (!validateSection()) return;

    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      window.scrollTo(0, 0);
    } else {
      // Calculate results
      calculateResults();
    }
  };

  // Navigate to previous section
  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  // Calculate results
  const calculateResults = () => {
    // Get age from responses
    const age = responses.age || childAge || 10;

    // Step 1: Calculate raw scores
    const calculationResult = calculateScores(responses, age);
    const { scores, impairment, sleepScore, mlFeatures } = calculationResult;

    // Step 2: Match ML patterns
    const patternMatches = matchPatterns(mlFeatures);

    // Step 3: Apply Bayesian probabilities
    const demographics = {
      age,
      gender: responses.gender,
      familyHistory: responses.familyHistory
    };

    const bayesianResult = calculateBayesianProbabilities(scores, demographics);
    let { probabilities } = bayesianResult;

    // Step 4: Apply pattern boosts
    probabilities = applyPatternBoosts(probabilities, patternMatches);

    // Step 5: Calculate confidence level
    const confidence = getConfidenceLevel(probabilities, impairment);

    // Step 6: Get age context
    const ageContext = getAgeContext(age);

    // Store results
    setResults({
      probabilities,
      patternMatches,
      ageContext,
      impairment,
      sleepScore,
      confidence,
      childAge: age,
      scores,
      mlFeatures
    });

    // Move to results step
    setCurrentStep('results');
    window.scrollTo(0, 0);
  };

  // Get age context from norms data
  const getAgeContext = (age) => {
    // Find closest age norm
    const ages = Object.keys(ageNormsData).map(Number);
    const closestAge = ages.reduce((prev, curr) =>
      Math.abs(curr - age) < Math.abs(prev - age) ? curr : prev
    );
    return ageNormsData[closestAge];
  };

  // Start screening
  const startScreening = () => {
    setCurrentStep('screening');
    setCurrentSectionIndex(0);
  };

  // Restart screening
  const restartScreening = () => {
    setCurrentStep('intro');
    setCurrentSectionIndex(0);
    setResponses({});
    setResults(null);
    setChildAge(null);
    window.scrollTo(0, 0);
  };

  // Render intro screen
  const renderIntro = () => (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.heading}>NHS ADHD Screening Tool</h1>

        <ClinicalDisclaimer />

        <div style={styles.introSection}>
          <h2 style={styles.subheading}>About This Screener</h2>
          <p style={styles.text}>
            This screening tool uses a multi-tier approach to assess patterns of attention,
            behavior, and emotional regulation in children and adolescents aged 5-18.
          </p>
          <p style={styles.text}>
            The tool evaluates patterns consistent with:
          </p>
          <ul style={styles.list}>
            <li>ADHD (Attention-Deficit/Hyperactivity Disorder)</li>
            <li>Autism Spectrum Conditions</li>
            <li>Anxiety Disorders</li>
            <li>Trauma/PTSD</li>
          </ul>
        </div>

        <div style={styles.introSection}>
          <h2 style={styles.subheading}>What to Expect</h2>
          <p style={styles.text}>
            You'll answer questions across 5 sections covering:
          </p>
          <ul style={styles.list}>
            <li><strong>Demographics:</strong> Basic information about your child</li>
            <li><strong>Tier 1:</strong> Core behavioral patterns</li>
            <li><strong>Tier 2:</strong> Supporting evidence and context</li>
            <li><strong>Tier 3:</strong> Developmental history and environmental factors</li>
            <li><strong>Tier 4:</strong> Functional impact on daily life</li>
          </ul>
          <p style={styles.text}>
            The screening takes approximately 10-15 minutes to complete.
          </p>
        </div>

        <button
          onClick={startScreening}
          style={styles.primaryButton}
        >
          Start Screening
        </button>
      </div>
    </div>
  );

  // Render screening questions
  const renderScreening = () => (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Progress indicator */}
        <ProgressBar
          currentSection={currentSectionIndex + 1}
          totalSections={sections.length}
          sectionLabels={sections.map(s => s.title)}
        />

        {/* Section title */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>{currentSection.title}</h2>
        </div>

        {/* Age warning for young children */}
        {childAge && childAge <= 8 && currentSectionIndex === 2 && (
          <AgeAppropriateWarning age={childAge} />
        )}

        {/* Questions */}
        <div style={styles.questionsContainer}>
          {currentSection.questions.map((question) => (
            <QuestionRenderer
              key={question.id}
              question={question}
              value={responses[question.id]}
              onChange={(value) => handleResponseChange(question.id, value)}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div style={styles.navigationButtons}>
          {currentSectionIndex > 0 && (
            <button
              onClick={handlePrevious}
              style={styles.secondaryButton}
            >
              Previous
            </button>
          )}
          <button
            onClick={handleNext}
            style={styles.primaryButton}
          >
            {currentSectionIndex < sections.length - 1 ? 'Next' : 'View Results'}
          </button>
        </div>
      </div>
    </div>
  );

  // Render results screen
  const renderResults = () => {
    if (!results) return null;

    const hasSignificantImpairment = isImpairmentSignificant(results.impairment);
    const hasSleepIssue = hasSleepConfounder(results.sleepScore);

    return (
      <div style={styles.container}>
        <div style={styles.content}>
          {/* Warnings */}
          {hasSleepIssue && <SleepWarning />}
          {!hasSignificantImpairment && <LowImpairmentWarning />}

          {/* Results display */}
          <ResultsDisplay
            probabilities={results.probabilities}
            patternMatches={results.patternMatches}
            ageContext={results.ageContext}
            impairment={results.impairment}
            sleepScore={results.sleepScore}
            confidence={results.confidence}
            childAge={results.childAge}
          />

          {/* Action buttons */}
          <div style={styles.actionButtons}>
            <button
              onClick={() => window.print()}
              style={styles.secondaryButton}
            >
              Print Results
            </button>
            <button
              onClick={restartScreening}
              style={styles.primaryButton}
            >
              Start New Screening
            </button>
          </div>

          {/* Final disclaimer */}
          <div style={styles.finalDisclaimer}>
            <ClinicalDisclaimer />
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div style={styles.app}>
      {/* Skip link for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <NHSHeader title="ADHD Screening Tool" />

      <main id="main-content" style={styles.main} role="main" aria-label="Main content">
        {currentStep === 'intro' && renderIntro()}
        {currentStep === 'screening' && renderScreening()}
        {currentStep === 'results' && renderResults()}
      </main>

      <footer style={styles.footer} role="contentinfo" aria-label="Site footer">
        <div style={styles.footerContent}>
          <p style={styles.footerText}>
            NHS ADHD Screening Tool | For educational and screening purposes only
          </p>
          <p style={styles.footerText}>
            In an emergency, call <a href="tel:999" style={styles.footerLink} aria-label="Call 999 for emergencies">999</a> | For urgent mental health support, contact your local crisis team
          </p>
        </div>
      </footer>
    </div>
  );
}

// Styles
const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
  },
  main: {
    flex: 1,
    width: '100%',
  },
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '32px 20px',
  },
  content: {
    width: '100%',
  },
  heading: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#005EB8', // NHS Blue
    marginBottom: '24px',
    letterSpacing: '-1px',
  },
  subheading: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#212b32',
    marginBottom: '16px',
  },
  sectionHeader: {
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '4px solid #005EB8',
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#005EB8',
    margin: 0,
  },
  introSection: {
    marginBottom: '32px',
  },
  text: {
    fontSize: '19px',
    lineHeight: '1.6',
    color: '#212b32',
    marginBottom: '16px',
  },
  list: {
    fontSize: '19px',
    lineHeight: '1.8',
    color: '#212b32',
    marginBottom: '16px',
    paddingLeft: '24px',
  },
  questionsContainer: {
    marginBottom: '32px',
  },
  navigationButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end',
    marginTop: '32px',
    paddingTop: '32px',
    borderTop: '2px solid #F0F4F5',
  },
  primaryButton: {
    backgroundColor: '#009639', // NHS Green
    color: 'white',
    border: 'none',
    padding: '16px 32px',
    fontSize: '19px',
    fontWeight: '600',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  secondaryButton: {
    backgroundColor: '#F0F4F5', // NHS Grey
    color: '#212b32',
    border: '2px solid #4c6272',
    padding: '16px 32px',
    fontSize: '19px',
    fontWeight: '600',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  actionButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginTop: '48px',
    marginBottom: '32px',
  },
  finalDisclaimer: {
    marginTop: '48px',
  },
  footer: {
    backgroundColor: '#005EB8', // NHS Blue
    color: 'white',
    padding: '24px 20px',
    marginTop: '64px',
  },
  footerContent: {
    maxWidth: '960px',
    margin: '0 auto',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '14px',
    margin: '8px 0',
  },
  footerLink: {
    color: 'white',
    textDecoration: 'underline',
    fontWeight: '700',
  },
};

export default App;
