/**
 * Bayesian Engine for applying prior probabilities and multipliers
 * Takes raw scores and applies demographic and family history adjustments
 */

/**
 * Base population prevalence rates (prior probabilities)
 * These represent the baseline probability before considering symptoms
 */
const BASE_PREVALENCE = {
  adhd: 0.05,      // 5% population prevalence
  autism: 0.01,    // 1% population prevalence
  anxiety: 0.08,   // 8% population prevalence
  trauma: 0.04     // 4% estimated prevalence
};

/**
 * Gender multipliers for conditions
 * Applied to prior probabilities based on gender
 */
const GENDER_MULTIPLIERS = {
  Male: {
    adhd: 2.5,
    autism: 4,
    anxiety: 1,
    trauma: 1
  },
  Female: {
    adhd: 1,
    autism: 1,
    anxiety: 1.2,    // Slightly higher anxiety in females
    trauma: 1.3      // Slightly higher trauma presentation in females
  },
  Other: {
    adhd: 1.5,
    autism: 2,
    anxiety: 1.1,
    trauma: 1.2
  }
};

/**
 * Family history multipliers
 * Applied when specific family history is present
 */
const FAMILY_HISTORY_MULTIPLIERS = {
  'ADHD': { adhd: 4 },
  'Autism': { autism: 10 },
  'Anxiety': { anxiety: 3 },
  'Depression': { anxiety: 2, adhd: 1.5 },
  'Learning disabilities': { adhd: 2 }
};

/**
 * Calculate Bayesian probabilities
 * @param {Object} scores - Raw scores from calculator
 * @param {Object} demographics - Demographic information (age, gender, familyHistory)
 * @returns {Object} Normalized probabilities for each condition
 */
export function calculateBayesianProbabilities(scores, demographics) {
  const { gender, familyHistory } = demographics;

  // Start with base prevalence rates
  const priorProbabilities = { ...BASE_PREVALENCE };

  // Apply gender multipliers
  if (gender && GENDER_MULTIPLIERS[gender]) {
    Object.keys(priorProbabilities).forEach(condition => {
      priorProbabilities[condition] *= GENDER_MULTIPLIERS[gender][condition] || 1;
    });
  }

  // Apply family history multipliers
  if (familyHistory && Array.isArray(familyHistory)) {
    familyHistory.forEach(historyItem => {
      if (FAMILY_HISTORY_MULTIPLIERS[historyItem]) {
        Object.entries(FAMILY_HISTORY_MULTIPLIERS[historyItem]).forEach(([condition, multiplier]) => {
          priorProbabilities[condition] *= multiplier;
        });
      }
    });
  }

  // Convert raw scores to likelihoods (0-1 scale)
  const likelihoods = scoresToLikelihoods(scores);

  // Apply Bayes' theorem: P(Condition|Symptoms) ∝ P(Symptoms|Condition) × P(Condition)
  const posteriorScores = {};
  Object.keys(scores).forEach(condition => {
    posteriorScores[condition] = likelihoods[condition] * priorProbabilities[condition];
  });

  // Normalize to probabilities (sum to 1.0)
  const normalizedProbabilities = normalizeProbabilities(posteriorScores);

  return {
    probabilities: normalizedProbabilities,
    priors: priorProbabilities,
    likelihoods: likelihoods
  };
}

/**
 * Convert raw scores to likelihood values (0-1 scale)
 * Uses sigmoid function to map scores to probabilities
 */
function scoresToLikelihoods(scores) {
  const likelihoods = {};

  Object.entries(scores).forEach(([condition, score]) => {
    // Apply sigmoid transformation with condition-specific scaling
    // This maps raw scores to a 0-1 probability scale
    const scalingFactor = getScalingFactor(condition);
    likelihoods[condition] = sigmoid(score / scalingFactor);
  });

  return likelihoods;
}

/**
 * Sigmoid function to convert scores to probabilities
 * Maps (-∞, +∞) to (0, 1)
 */
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Get condition-specific scaling factor for sigmoid transformation
 * Different conditions have different typical score ranges
 */
function getScalingFactor(condition) {
  const scalingFactors = {
    adhd: 50,      // ADHD typically has higher raw scores
    autism: 40,    // Autism moderate range
    anxiety: 35,   // Anxiety moderate range
    trauma: 30     // Trauma typically lower range
  };

  return scalingFactors[condition] || 40;
}

/**
 * Normalize probabilities to sum to 100%
 * Converts to percentages for display
 */
function normalizeProbabilities(posteriorScores) {
  const total = Object.values(posteriorScores).reduce((sum, val) => sum + val, 0);

  const normalized = {};
  if (total > 0) {
    Object.entries(posteriorScores).forEach(([condition, score]) => {
      normalized[condition] = (score / total) * 100;
    });
  } else {
    // If all scores are 0, return equal probabilities
    Object.keys(posteriorScores).forEach(condition => {
      normalized[condition] = 25; // 100% / 4 conditions
    });
  }

  return normalized;
}

/**
 * Apply pattern matching bonuses to probabilities
 * @param {Object} probabilities - Current probabilities
 * @param {Object} patternMatches - Matched patterns with confidence boosts
 * @returns {Object} Adjusted probabilities
 */
export function applyPatternBoosts(probabilities, patternMatches) {
  const adjusted = { ...probabilities };

  Object.entries(patternMatches).forEach(([condition, match]) => {
    if (match.matched && match.confidenceBoost) {
      // Add confidence boost as percentage points
      adjusted[condition] += match.confidenceBoost;
    }
  });

  // Re-normalize after applying boosts
  return normalizeProbabilities(adjusted);
}

/**
 * Calculate confidence level for results
 * @param {Object} probabilities - Normalized probabilities
 * @param {Object} impairment - Impairment scores
 * @returns {string} Confidence level: 'high', 'moderate', 'low'
 */
export function getConfidenceLevel(probabilities, impairment) {
  // Get the highest probability
  const maxProbability = Math.max(...Object.values(probabilities));

  // Get the difference between top two probabilities
  const sortedProbs = Object.values(probabilities).sort((a, b) => b - a);
  const separation = sortedProbs[0] - sortedProbs[1];

  // Check if impairment is significant
  const hasSignificantImpairment = impairment.total >= 8;

  // High confidence: clear winner + significant impairment
  if (maxProbability > 50 && separation > 20 && hasSignificantImpairment) {
    return 'high';
  }

  // Low confidence: close results or minimal impairment
  if (maxProbability < 35 || separation < 10 || impairment.total < 4) {
    return 'low';
  }

  // Otherwise moderate confidence
  return 'moderate';
}

/**
 * Get interpretation text based on probability and confidence
 */
export function getInterpretation(condition, probability, confidence) {
  if (confidence === 'high') {
    if (probability > 50) {
      return `Strong indication of ${condition}`;
    }
  }

  if (confidence === 'moderate') {
    if (probability > 35) {
      return `Moderate indication of ${condition}`;
    }
  }

  if (probability > 25) {
    return `Some features consistent with ${condition}`;
  }

  return `Low probability of ${condition}`;
}
