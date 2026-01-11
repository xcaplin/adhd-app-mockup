import mlPatternsData from '../data/mlPatterns.json';

/**
 * ML Pattern Matcher - V8 Specification
 * Hardcoded pattern matching logic based on empirical evidence
 * Returns confidence bonuses for matched patterns
 */

/**
 * Match ML features against V8 pattern specifications
 * Uses numeric variability (0-4 index) and string values for other features
 * @param {Object} mlFeatures - Features extracted from question responses
 * @returns {Object} Match results with confidence boosts for each condition
 */
export function matchPatterns(mlFeatures) {
  const matchedPatterns = {
    adhd: { matched: false, patternName: null, confidenceBoost: 0 },
    autism: { matched: false, patternName: null, confidenceBoost: 0 },
    anxiety: { matched: false, patternName: null, confidenceBoost: 0 },
    trauma: { matched: false, patternName: null, confidenceBoost: 0 }
  };

  // ADHD Combined Type Pattern
  // High variability (index >= 3) + Strong novelty seeking + Dramatic reward response + Present hyperactivity
  if (mlFeatures.variability >= 3 &&
      mlFeatures.noveltySeeking === 'strong' &&
      mlFeatures.rewardResponse === 'dramatic' &&
      mlFeatures.hyperactivity === 'present') {
    matchedPatterns.adhd = {
      matched: true,
      patternName: 'ADHD Combined Type',
      confidenceBoost: 25
    };
  }
  // ADHD Inattentive Type Pattern
  // High variability (index >= 3) + Absent/Moderate hyperactivity + Moderate/Dramatic reward response
  else if (mlFeatures.variability >= 3 &&
           (mlFeatures.hyperactivity === 'absent' || mlFeatures.hyperactivity === 'moderate') &&
           (mlFeatures.rewardResponse === 'moderate' || mlFeatures.rewardResponse === 'dramatic')) {
    matchedPatterns.adhd = {
      matched: true,
      patternName: 'ADHD Inattentive Type',
      confidenceBoost: 20
    };
  }

  // Autism Classic Pattern
  // Low variability (index 0-1) + Negative novelty seeking + Interest-driven hyperfocus
  if ((mlFeatures.variability === 0 || mlFeatures.variability === 1) &&
      mlFeatures.noveltySeeking === 'negative' &&
      mlFeatures.hyperfocusPattern === 'interestDriven') {
    matchedPatterns.autism = {
      matched: true,
      patternName: 'Autism Classic',
      confidenceBoost: 30
    };
  }

  // Generalized Anxiety Pattern
  // Worry-based attention content + Non-regulated emotional state
  if (mlFeatures.attentionContent === 'worry' &&
      mlFeatures.emotionalRegulation &&
      mlFeatures.emotionalRegulation !== 'regulated') {
    matchedPatterns.anxiety = {
      matched: true,
      patternName: 'Generalized Anxiety',
      confidenceBoost: 20
    };
  }

  // PTSD/Trauma Pattern
  // Post-event trigger + Trauma response in emotional regulation
  if (mlFeatures.trigger === 'postEvent' &&
      mlFeatures.emotionalRegulation === 'traumaResponse') {
    matchedPatterns.trauma = {
      matched: true,
      patternName: 'PTSD Presentation',
      confidenceBoost: 25
    };
  }

  return matchedPatterns;
}

/**
 * Get pattern match summary for display
 * @param {Object} matches - Match results from matchPatterns
 * @returns {Array} Array of matched patterns with details
 */
export function getMatchedPatternsSummary(matches) {
  const summary = [];

  Object.entries(matches).forEach(([condition, match]) => {
    if (match.matched) {
      summary.push({
        condition,
        patternName: match.patternName,
        confidenceBoost: match.confidenceBoost,
        matchPercentage: Math.round(match.matchScore * 100),
        matchedFeatures: match.matchedFeatures,
        totalFeatures: match.totalFeatures
      });
    }
  });

  // Sort by confidence boost (highest first)
  summary.sort((a, b) => b.confidenceBoost - a.confidenceBoost);

  return summary;
}

/**
 * Calculate total confidence boost across all matched patterns
 * @param {Object} matches - Match results
 * @returns {number} Total confidence boost
 */
export function getTotalConfidenceBoost(matches) {
  return Object.values(matches).reduce((total, match) => {
    return total + (match.confidenceBoost || 0);
  }, 0);
}

/**
 * Check if features form a coherent pattern
 * Detects contradictory or inconsistent responses
 * @param {Object} mlFeatures - ML features from responses
 * @returns {Object} Coherence check result
 */
export function checkPatternCoherence(mlFeatures) {
  const warnings = [];

  // Check for ADHD contradictions
  // Low variability (0-1) with dramatic reward response is unusual
  if (mlFeatures.variability !== undefined && mlFeatures.variability <= 1 &&
      mlFeatures.rewardResponse === 'dramatic') {
    warnings.push('Unusual pattern: Low variability with dramatic reward response');
  }

  // Check for autism contradictions
  if (mlFeatures.noveltySeeking === 'strong' && mlFeatures.structureResponse === 'rigid') {
    warnings.push('Unusual pattern: Strong novelty seeking with rigid structure needs');
  }

  // Check for anxiety contradictions
  if (mlFeatures.attentionContent === 'worry' && mlFeatures.emotionalRegulation === 'regulated') {
    warnings.push('Unusual pattern: Worry-based attention with regulated emotions');
  }

  // Check for trauma contradictions
  if (mlFeatures.trigger === 'always' && mlFeatures.emotionalRegulation === 'traumaResponse') {
    warnings.push('Unusual pattern: Lifelong symptoms with acute trauma response');
  }

  return {
    isCoherent: warnings.length === 0,
    warnings
  };
}

/**
 * Get diagnostic suggestions based on pattern matches
 * @param {Object} matches - Pattern match results
 * @param {Object} probabilities - Bayesian probabilities
 * @returns {Array} Ordered list of diagnostic suggestions
 */
export function getDiagnosticSuggestions(matches, probabilities) {
  const suggestions = [];

  // Combine probabilities with pattern matches
  Object.entries(probabilities).forEach(([condition, probability]) => {
    const match = matches[condition];

    suggestions.push({
      condition,
      probability,
      hasPatternMatch: match.matched,
      patternName: match.patternName || null,
      strength: calculateSuggestionStrength(probability, match)
    });
  });

  // Sort by strength (highest first)
  suggestions.sort((a, b) => b.strength - a.strength);

  return suggestions;
}

/**
 * Calculate suggestion strength combining probability and pattern match
 */
function calculateSuggestionStrength(probability, match) {
  let strength = probability;

  // Boost strength if pattern matched
  if (match.matched) {
    strength += match.confidenceBoost;
  }

  return strength;
}

/**
 * Generate V8-specification clinical recommendations
 * @param {Object} probabilities - Probability scores for each condition
 * @param {Object} impairment - Impairment scores across domains
 * @param {number} sleepScore - Sleep confounder score
 * @returns {Object} Comprehensive recommendations object
 */
export function generateRecommendations(probabilities, impairment, sleepScore) {
  // Find primary condition (highest probability)
  const primaryCondition = Object.entries(probabilities).reduce((max, [key, val]) =>
    val > max.val ? { key, val } : max,
    { key: null, val: 0 }
  );

  const recommendations = {
    urgency: primaryCondition.val > 70 ? 'urgent' : primaryCondition.val > 50 ? 'priority' : 'routine',
    referrals: [],
    support: [],
    flags: []
  };

  // ADHD-specific referrals (threshold: 40%)
  if (probabilities.adhd > 40) {
    recommendations.referrals.push('ADHD assessment with developmental paediatrician or CAMHS');
  }

  // Autism-specific referrals (threshold: 30%)
  if (probabilities.autism > 30) {
    recommendations.referrals.push('Autism diagnostic assessment (ADOS-2) through local autism pathway');
  }

  // Anxiety-specific referrals (threshold: 50%)
  if (probabilities.anxiety > 50) {
    recommendations.referrals.push('CAMHS referral for anxiety assessment and treatment');
  }

  // Trauma-specific referrals (threshold: 30%)
  if (probabilities.trauma > 30) {
    recommendations.referrals.push('Trauma-informed therapy (e.g., EMDR, trauma-focused CBT)');
  }

  // Sleep confounder flag (threshold: 6+)
  if (sleepScore > 6) {
    recommendations.referrals.push('Sleep study consultation - rule out sleep apnea/sleep disorders');
    recommendations.flags.push('Sleep disturbance can mimic ADHD symptoms - address sleep issues first');
  }

  // Academic impairment (threshold: 3+)
  if (impairment.academic >= 3) {
    recommendations.referrals.push('Educational psychology assessment for school support');
    recommendations.support.push('Request school SENCO meeting to discuss educational support needs');
  }

  // Emotional wellbeing concerns (threshold: 4+)
  if (impairment.emotional >= 4) {
    recommendations.flags.push('Significant impact on self-esteem - monitor for depression/self-harm risk');
    recommendations.support.push('Consider counseling/therapeutic support for emotional wellbeing');
  }

  // ADHD-specific support strategies (threshold: 30%)
  if (probabilities.adhd > 30) {
    recommendations.support.push('Break tasks into smaller chunks with frequent breaks (e.g., 15-20 min work periods)');
    recommendations.support.push('Use immediate, specific rewards for completed tasks (token economy, instant feedback)');
    recommendations.support.push('Provide high-stimulation breaks between tasks (physical activity, sensory input)');
    recommendations.support.push('Minimize distractions in study environment (quiet space, reduce visual clutter)');
    recommendations.support.push('Use timers and visual schedules to aid time awareness');
  }

  // Autism-specific support strategies (threshold: 30%)
  if (probabilities.autism > 30) {
    recommendations.support.push('Maintain predictable routines with advance warning of changes (visual countdown)');
    recommendations.support.push('Provide visual schedules and social stories for transitions and new situations');
    recommendations.support.push('Reduce sensory overload (quiet spaces, ear defenders, fidget tools if needed)');
    recommendations.support.push('Allow for special interest time as motivation and regulation tool');
    recommendations.support.push('Use concrete, literal language and check understanding');
  }

  // Anxiety-specific support strategies (threshold: 40%)
  if (probabilities.anxiety > 40) {
    recommendations.support.push('Teach and practice calming techniques (deep breathing, grounding exercises)');
    recommendations.support.push('Gradual exposure to anxiety-provoking situations with support');
    recommendations.support.push('Validate worries while gently challenging catastrophic thinking');
    recommendations.support.push('Create a worry time/worry box to contain anxious thoughts');
  }

  // Trauma-specific support strategies (threshold: 25%)
  if (probabilities.trauma > 25) {
    recommendations.support.push('Ensure safety and predictability in environment (consistent routines, safe spaces)');
    recommendations.support.push('Trauma-informed behavior support - avoid punishment, use connection and regulation');
    recommendations.support.push('Be aware of trauma triggers and provide warning/choice when possible');
    recommendations.support.push('Build trusting relationships before making demands');
  }

  return recommendations;
}
