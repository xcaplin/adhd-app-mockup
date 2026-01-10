import mlPatternsData from '../data/mlPatterns.json';

/**
 * ML Pattern Matcher
 * Matches extracted ML features against known diagnostic patterns
 * Returns confidence bonuses for matched patterns
 */

/**
 * Match ML features against all pattern signatures
 * @param {Object} mlFeatures - Features extracted from question responses
 * @returns {Object} Match results for each condition with confidence boosts
 */
export function matchPatterns(mlFeatures) {
  const matches = {
    adhd: findBestMatch(mlFeatures, mlPatternsData.adhdPatterns),
    autism: findBestMatch(mlFeatures, mlPatternsData.autismPatterns),
    anxiety: findBestMatch(mlFeatures, mlPatternsData.anxietyPatterns),
    trauma: findBestMatch(mlFeatures, mlPatternsData.traumaPatterns)
  };

  return matches;
}

/**
 * Find the best matching pattern for a condition
 * @param {Object} mlFeatures - Features extracted from responses
 * @param {Array} patterns - Array of pattern definitions for a condition
 * @returns {Object} Best match with confidence boost or null
 */
function findBestMatch(mlFeatures, patterns) {
  let bestMatch = null;
  let bestScore = 0;

  patterns.forEach(pattern => {
    const matchResult = matchPattern(mlFeatures, pattern);

    if (matchResult.matched && matchResult.score > bestScore) {
      bestScore = matchResult.score;
      bestMatch = {
        matched: true,
        patternName: pattern.name,
        confidenceBoost: pattern.confidenceBoost,
        prevalence: pattern.prevalence,
        matchScore: matchResult.score,
        matchedFeatures: matchResult.matchedFeatures,
        totalFeatures: matchResult.totalFeatures
      };
    }
  });

  if (!bestMatch) {
    return {
      matched: false,
      confidenceBoost: 0
    };
  }

  return bestMatch;
}

/**
 * Match ML features against a single pattern signature
 * @param {Object} mlFeatures - Features from responses
 * @param {Object} pattern - Pattern definition with signature
 * @returns {Object} Match result with score and details
 */
function matchPattern(mlFeatures, pattern) {
  const signature = pattern.signature;
  const signatureKeys = Object.keys(signature);

  let matchedFeatures = 0;
  let totalFeatures = signatureKeys.length;
  const matchedKeys = [];

  signatureKeys.forEach(key => {
    const expectedValue = signature[key];
    const actualValue = mlFeatures[key];

    // Skip if feature not present in responses
    if (actualValue === undefined || actualValue === null) {
      return;
    }

    // Check if values match
    if (matchesValue(actualValue, expectedValue)) {
      matchedFeatures++;
      matchedKeys.push(key);
    }
  });

  // Calculate match score (percentage of features matched)
  const matchScore = totalFeatures > 0 ? (matchedFeatures / totalFeatures) : 0;

  // Require at least 75% match to consider pattern matched
  const matched = matchScore >= 0.75;

  return {
    matched,
    score: matchScore,
    matchedFeatures,
    totalFeatures,
    matchedKeys
  };
}

/**
 * Check if actual value matches expected value
 * Supports both exact string matching and array matching
 * @param {string} actualValue - Value from ML features
 * @param {string|Array} expectedValue - Expected value(s) from pattern signature
 * @returns {boolean} True if matches
 */
function matchesValue(actualValue, expectedValue) {
  // Array matching: check if actual value is in array
  if (Array.isArray(expectedValue)) {
    return expectedValue.includes(actualValue);
  }

  // Exact string matching
  return actualValue === expectedValue;
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
  if (mlFeatures.variability === 'low' && mlFeatures.rewardResponse === 'dramatic') {
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
