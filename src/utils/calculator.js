import questionsData from '../data/questions.json';

/**
 * Main scoring calculator for the ADHD screener
 * Takes question responses and calculates weighted scores for each condition
 */

/**
 * Calculate scores from question responses
 * @param {Object} responses - Object with question IDs as keys and responses as values
 * @param {number} age - Child's age for age-adjusted calculations
 * @returns {Object} Scores object with condition scores, impairment, sleep, and ML features
 */
export function calculateScores(responses, age) {
  // Initialize scores for each condition
  const scores = {
    adhd: 0,
    autism: 0,
    anxiety: 0,
    trauma: 0
  };

  // Track impairment scores
  const impairment = {
    academic: 0,
    social: 0,
    family: 0,
    emotional: 0,
    total: 0
  };

  // Track sleep confounder
  let sleepScore = 0;

  // Extract ML features for pattern matching
  const mlFeatures = {};

  // Flatten all questions from all sections
  const allQuestions = questionsData.sections.flatMap(section =>
    section.questions.map(q => ({ ...q, sectionId: section.id }))
  );

  // Process each response
  Object.entries(responses).forEach(([questionId, response]) => {
    const question = allQuestions.find(q => q.id === questionId);

    if (!question) return;

    // Handle different question types
    switch (question.type) {
      case 'scale':
        handleScaleQuestion(question, response, scores, age, mlFeatures);
        break;

      case 'select':
        handleSelectQuestion(question, response, scores, age, mlFeatures);
        break;

      case 'multiselect':
        handleMultiselectQuestion(question, response, scores);
        break;

      case 'number':
        // Age is handled separately, no scoring needed
        break;
    }

    // Track impairment domain scores
    if (question.impairmentDomain) {
      const responseIndex = question.options.indexOf(response);
      const impairmentScore = responseIndex; // 0-4 scale
      impairment[question.impairmentDomain] = impairmentScore;
    }

    // Track sleep confounders
    if (question.id === 'sleepIssues' && question.sleepScores) {
      const responseIndex = question.options.indexOf(response);
      sleepScore = question.sleepScores[responseIndex] || 0;
    }
  });

  // Calculate total impairment
  impairment.total = Object.values(impairment)
    .filter(v => typeof v === 'number')
    .reduce((sum, val) => sum + val, 0);

  return {
    scores,
    impairment,
    sleepScore,
    mlFeatures
  };
}

/**
 * Handle scale-type questions (Never, Rarely, Sometimes, Often, Very Often)
 */
function handleScaleQuestion(question, response, scores, age, mlFeatures) {
  const responseIndex = question.options.indexOf(response);

  if (responseIndex === -1) return;

  // Apply weights for each condition
  if (question.weights) {
    Object.entries(question.weights).forEach(([condition, weights]) => {
      if (scores.hasOwnProperty(condition)) {
        scores[condition] += weights[responseIndex] || 0;
      }
    });
  }

  // Extract ML features
  // For mlType: "index", store the numeric index (0-4) directly
  if (question.mlKey && question.mlType === 'index') {
    mlFeatures[question.mlKey] = responseIndex;
  }
}

/**
 * Handle select-type questions (single choice)
 */
function handleSelectQuestion(question, response, scores, age, mlFeatures) {
  const responseIndex = question.options.indexOf(response);

  if (responseIndex === -1) return;

  // Apply weights for each condition
  if (question.weights) {
    Object.entries(question.weights).forEach(([condition, weights]) => {
      if (scores.hasOwnProperty(condition)) {
        let score = weights[responseIndex] || 0;

        // Apply age adjustments if applicable
        if (question.ageAdjusted && question.ageAdjustments) {
          score = applyAgeAdjustment(score, responseIndex, age, question.ageAdjustments);
        }

        scores[condition] += score;
      }
    });
  }

  // Extract ML features
  if (question.mlKey) {
    if (question.mlValues) {
      mlFeatures[question.mlKey] = question.mlValues[responseIndex];
    }
  }
}

/**
 * Handle multiselect questions (multiple choices)
 */
function handleMultiselectQuestion(question, responses, scores) {
  if (!Array.isArray(responses)) {
    responses = [responses];
  }

  responses.forEach(response => {
    const responseIndex = question.options.indexOf(response);

    if (responseIndex === -1) return;

    // Apply weights for each condition
    if (question.weights) {
      Object.entries(question.weights).forEach(([condition, weights]) => {
        if (scores.hasOwnProperty(condition)) {
          scores[condition] += weights[responseIndex] || 0;
        }
      });
    }
  });
}

/**
 * Apply age adjustments to scores
 * @param {number} score - Base score
 * @param {number} responseIndex - Index of selected response
 * @param {number} age - Child's age
 * @param {Object} ageAdjustments - Age adjustment rules
 * @returns {number} Adjusted score
 */
function applyAgeAdjustment(score, responseIndex, age, ageAdjustments) {
  // Young children (5-8): adjust hyperactivity interpretation
  if (age <= 8 && ageAdjustments.young) {
    if (responseIndex === ageAdjustments.young.index) {
      score += ageAdjustments.young.adjustment;
    }
  }

  // Older children/teens (13+): adjust hyperactivity interpretation
  if (age >= 13 && ageAdjustments.older) {
    if (responseIndex === ageAdjustments.older.index) {
      score += ageAdjustments.older.adjustment;
    }
  }

  return score;
}

/**
 * Get maximum possible score for a condition
 * Useful for calculating percentages
 */
export function getMaxPossibleScore(condition) {
  const allQuestions = questionsData.sections.flatMap(section => section.questions);

  let maxScore = 0;

  allQuestions.forEach(question => {
    if (question.weights && question.weights[condition]) {
      const weights = question.weights[condition];
      const maxWeight = Math.max(...weights);
      maxScore += maxWeight;
    }
  });

  return maxScore;
}

/**
 * Calculate percentage score for a condition
 */
export function getPercentageScore(rawScore, condition) {
  const maxScore = getMaxPossibleScore(condition);
  return maxScore > 0 ? (rawScore / maxScore) * 100 : 0;
}

/**
 * Determine if impairment is clinically significant
 * Requires elevated scores in at least 2 domains
 */
export function isImpairmentSignificant(impairment) {
  const domains = ['academic', 'social', 'family', 'emotional'];
  const elevatedDomains = domains.filter(domain => impairment[domain] >= 2);
  return elevatedDomains.length >= 2;
}

/**
 * Check if sleep issues are confounding the results
 * High sleep scores may indicate sleep disorder rather than ADHD
 */
export function hasSleepConfounder(sleepScore) {
  return sleepScore >= 8;
}
