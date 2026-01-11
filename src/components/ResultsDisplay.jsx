import React from 'react';
import { AlertCircle, CheckCircle, Info, TrendingUp, AlertTriangle } from 'lucide-react';
import { generateRecommendations } from '../utils/mlMatcher';

/**
 * Results Display Component
 * Shows comprehensive screening results with NHS styling
 * Includes probabilities, ML patterns, age context, impairment, and recommendations
 */

const ResultsDisplay = ({
  probabilities,
  patternMatches,
  ageContext,
  impairment,
  sleepScore,
  confidence,
  childAge
}) => {
  return (
    <div style={styles.container}>
      {/* Results Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Screening Results</h2>
        <ConfidenceBadge level={confidence} />
      </div>

      {/* Probability Bars */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Condition Probabilities</h3>
        <ProbabilityBars probabilities={probabilities} />
      </section>

      {/* Pattern Matches */}
      {patternMatches && Object.values(patternMatches).some(m => m.matched) && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Pattern Analysis</h3>
          <PatternMatches matches={patternMatches} />
        </section>
      )}

      {/* Age Context */}
      {ageContext && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Age Context</h3>
          <AgeContext context={ageContext} age={childAge} />
        </section>
      )}

      {/* Impairment Summary */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Functional Impact</h3>
        <ImpairmentSummary impairment={impairment} />
      </section>

      {/* Sleep Confounder */}
      {sleepScore >= 8 && (
        <section style={styles.section}>
          <div style={styles.warningBox}>
            <AlertCircle size={24} color="#DA291C" />
            <div style={styles.warningContent}>
              <strong>Sleep Concerns Detected</strong>
              <p style={styles.warningText}>
                Significant sleep issues are present. Sleep disorders can mimic ADHD symptoms.
                Consider sleep evaluation before pursuing ADHD assessment.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Recommendations */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Next Steps</h3>
        <Recommendations
          probabilities={probabilities}
          confidence={confidence}
          impairment={impairment}
          sleepScore={sleepScore}
        />
      </section>
    </div>
  );
};

/**
 * Confidence Badge Component
 */
const ConfidenceBadge = ({ level }) => {
  const config = {
    high: { color: '#009639', text: 'High Confidence' },
    moderate: { color: '#FAE100', text: 'Moderate Confidence', textColor: '#212b32' },
    low: { color: '#AEB7BD', text: 'Low Confidence', textColor: '#212b32' }
  };

  const { color, text, textColor = 'white' } = config[level] || config.moderate;

  return (
    <div style={{ ...styles.badge, backgroundColor: color, color: textColor }}>
      {text}
    </div>
  );
};

/**
 * Probability Bars Component
 */
const ProbabilityBars = ({ probabilities }) => {
  const conditions = [
    { key: 'adhd', label: 'ADHD', color: '#005EB8' },
    { key: 'autism', label: 'Autism Spectrum', color: '#330072' },
    { key: 'anxiety', label: 'Anxiety', color: '#FAE100' },
    { key: 'trauma', label: 'Trauma/PTSD', color: '#DA291C' }
  ];

  // Sort by probability descending
  const sorted = conditions
    .map(c => ({ ...c, probability: probabilities[c.key] || 0 }))
    .sort((a, b) => b.probability - a.probability);

  return (
    <div style={styles.probabilityContainer}>
      {sorted.map((condition) => (
        <div key={condition.key} style={styles.probabilityRow}>
          <div style={styles.probabilityLabel}>
            <span style={styles.conditionName}>{condition.label}</span>
            <span style={styles.probabilityValue}>{Math.round(condition.probability)}%</span>
          </div>
          <div style={styles.barBackground}>
            <div
              style={{
                ...styles.barFill,
                width: `${condition.probability}%`,
                backgroundColor: condition.color
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Pattern Matches Component
 */
const PatternMatches = ({ matches }) => {
  const matchedPatterns = Object.entries(matches)
    .filter(([_, match]) => match.matched)
    .map(([condition, match]) => ({ condition, ...match }));

  if (matchedPatterns.length === 0) {
    return <p style={styles.noPattern}>No specific patterns matched.</p>;
  }

  return (
    <div style={styles.patternContainer}>
      {matchedPatterns.map((pattern, index) => (
        <div key={index} style={styles.patternCard}>
          <div style={styles.patternHeader}>
            <CheckCircle size={20} color="#009639" />
            <span style={styles.patternName}>{pattern.patternName}</span>
          </div>
          <div style={styles.patternDetails}>
            <span style={styles.patternStat}>
              Match: {Math.round(pattern.matchScore * 100)}%
            </span>
            <span style={styles.patternStat}>
              Confidence boost: +{pattern.confidenceBoost}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Age Context Component
 */
const AgeContext = ({ context, age }) => {
  return (
    <div style={styles.ageContextBox}>
      <Info size={20} color="#005EB8" />
      <div style={styles.ageContextContent}>
        <p style={styles.ageContextText}>
          <strong>Age {age}:</strong> {context.note}
        </p>
        <ul style={styles.ageContextList}>
          <li>Expected attention span: {context.attentionSpan} minutes</li>
          <li>Hyperactivity expected: {context.hyperactivityExpected ? 'Yes' : 'No'}</li>
          <li>High impulsivity typical: {context.impulsivityHigh ? 'Yes' : 'No'}</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Impairment Summary Component
 */
const ImpairmentSummary = ({ impairment }) => {
  const domains = [
    { key: 'academic', label: 'Academic Performance' },
    { key: 'social', label: 'Social Relationships' },
    { key: 'family', label: 'Family Life' },
    { key: 'emotional', label: 'Emotional Wellbeing' }
  ];

  const getImpairmentLevel = (score) => {
    if (score >= 3) return { text: 'Significant', color: '#DA291C' };
    if (score >= 2) return { text: 'Moderate', color: '#FAE100', textColor: '#212b32' };
    if (score >= 1) return { text: 'Mild', color: '#AEB7BD', textColor: '#212b32' };
    return { text: 'None', color: '#009639' };
  };

  return (
    <div style={styles.impairmentContainer}>
      {domains.map((domain) => {
        const score = impairment[domain.key] || 0;
        const level = getImpairmentLevel(score);
        return (
          <div key={domain.key} style={styles.impairmentRow}>
            <span style={styles.impairmentLabel}>{domain.label}</span>
            <div
              style={{
                ...styles.impairmentBadge,
                backgroundColor: level.color,
                color: level.textColor || 'white'
              }}
            >
              {level.text}
            </div>
          </div>
        );
      })}
      <div style={styles.impairmentTotal}>
        <strong>Total Impact Score:</strong> {impairment.total}/16
      </div>
    </div>
  );
};

/**
 * Recommendations Component - V8 Specification
 * Uses generateRecommendations from mlMatcher for detailed clinical recommendations
 */
const Recommendations = ({ probabilities, confidence, impairment, sleepScore }) => {
  // Generate V8-compliant recommendations
  const recs = generateRecommendations(probabilities, impairment, sleepScore);

  // Map urgency to priority styles
  const urgencyPriority = {
    urgent: 'urgent',
    priority: 'high',
    routine: 'moderate'
  };

  return (
    <div style={styles.recommendationsContainer}>
      {/* Urgency indicator */}
      <div style={{
        ...styles.urgencyBadge,
        backgroundColor: recs.urgency === 'urgent' ? '#DA291C' :
                         recs.urgency === 'priority' ? '#FAE100' : '#AEB7BD',
        color: recs.urgency === 'priority' ? '#212b32' : 'white'
      }}>
        <strong>Urgency: {recs.urgency.toUpperCase()}</strong>
      </div>

      {/* Flags (if any) */}
      {recs.flags.length > 0 && (
        <div>
          <h4 style={styles.recSectionTitle}>⚠️ Important Flags</h4>
          {recs.flags.map((flag, index) => (
            <div key={index} style={{ ...styles.recommendationCard, ...styles.priority_urgent }}>
              <AlertTriangle size={20} style={styles.recommendationIcon} />
              <p style={styles.recommendationText}>{flag}</p>
            </div>
          ))}
        </div>
      )}

      {/* Referrals */}
      {recs.referrals.length > 0 && (
        <div>
          <h4 style={styles.recSectionTitle}>📋 Recommended Assessments & Referrals</h4>
          {recs.referrals.map((referral, index) => (
            <div key={index} style={{ ...styles.recommendationCard, ...styles[`priority_${urgencyPriority[recs.urgency]}`] }}>
              <TrendingUp size={20} style={styles.recommendationIcon} />
              <p style={styles.recommendationText}>{referral}</p>
            </div>
          ))}
        </div>
      )}

      {/* Support strategies */}
      {recs.support.length > 0 && (
        <div>
          <h4 style={styles.recSectionTitle}>💡 Support Strategies</h4>
          {recs.support.map((strategy, index) => (
            <div key={index} style={{ ...styles.recommendationCard, ...styles.priority_info }}>
              <Info size={20} style={styles.recommendationIcon} />
              <p style={styles.recommendationText}>{strategy}</p>
            </div>
          ))}
        </div>
      )}

      {/* General disclaimer */}
      <div style={{ ...styles.recommendationCard, ...styles.priority_info, marginTop: '24px' }}>
        <Info size={20} style={styles.recommendationIcon} />
        <p style={styles.recommendationText}>
          This screening tool provides preliminary information only. A comprehensive assessment by qualified professionals is needed for diagnosis.
        </p>
      </div>
    </div>
  );
};

// Styles following NHS Design System
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '4px solid #005EB8',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#212b32',
    margin: 0,
  },
  badge: {
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '700',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#005EB8',
    marginBottom: '16px',
  },
  // Probability bars
  probabilityContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  probabilityRow: {
    width: '100%',
  },
  probabilityLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  conditionName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#212b32',
  },
  probabilityValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#005EB8',
  },
  barBackground: {
    width: '100%',
    height: '32px',
    backgroundColor: '#F0F4F5',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    transition: 'width 0.5s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '8px',
  },
  // Pattern matches
  patternContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  patternCard: {
    backgroundColor: '#F0F4F5',
    padding: '16px',
    borderRadius: '4px',
    border: '2px solid #009639',
  },
  patternHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  patternName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#212b32',
  },
  patternDetails: {
    display: 'flex',
    gap: '16px',
    fontSize: '14px',
    color: '#4c6272',
  },
  patternStat: {
    fontWeight: '600',
  },
  noPattern: {
    color: '#4c6272',
    fontStyle: 'italic',
  },
  // Age context
  ageContextBox: {
    display: 'flex',
    gap: '12px',
    backgroundColor: '#F0F4F5',
    padding: '16px',
    borderRadius: '4px',
    border: '2px solid #005EB8',
  },
  ageContextContent: {
    flex: 1,
  },
  ageContextText: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    color: '#212b32',
  },
  ageContextList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#4c6272',
  },
  // Impairment
  impairmentContainer: {
    backgroundColor: '#F0F4F5',
    padding: '16px',
    borderRadius: '4px',
  },
  impairmentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #AEB7BD',
  },
  impairmentLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#212b32',
  },
  impairmentBadge: {
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '700',
  },
  impairmentTotal: {
    marginTop: '16px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#005EB8',
  },
  // Warnings
  warningBox: {
    display: 'flex',
    gap: '12px',
    backgroundColor: '#FFF8E1',
    padding: '16px',
    borderRadius: '4px',
    border: '4px solid #FAE100',
  },
  warningContent: {
    flex: 1,
  },
  warningText: {
    margin: '8px 0 0 0',
    fontSize: '16px',
    color: '#212b32',
  },
  // Recommendations
  recommendationsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  urgencyBadge: {
    padding: '12px 20px',
    borderRadius: '4px',
    textAlign: 'center',
    fontSize: '16px',
    marginBottom: '16px',
  },
  recSectionTitle: {
    fontSize: '19px',
    fontWeight: '600',
    color: '#005EB8',
    marginTop: '16px',
    marginBottom: '12px',
  },
  recommendationCard: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    borderRadius: '4px',
    border: '2px solid #AEB7BD',
    backgroundColor: 'white',
  },
  recommendationIcon: {
    flexShrink: 0,
    marginTop: '2px',
  },
  recommendationText: {
    margin: 0,
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#212b32',
  },
  priority_urgent: {
    borderColor: '#DA291C',
    backgroundColor: '#FFF0F0',
  },
  priority_high: {
    borderColor: '#005EB8',
    backgroundColor: '#F0F7FF',
  },
  priority_moderate: {
    borderColor: '#FAE100',
    backgroundColor: '#FFF8E1',
  },
  priority_info: {
    borderColor: '#AEB7BD',
    backgroundColor: 'white',
  },
};

export default ResultsDisplay;
