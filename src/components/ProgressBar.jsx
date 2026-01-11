import React from 'react';

/**
 * NHS Progress Bar Component
 * Green progress indicator following NHS Design System
 * Shows completion status with section labels
 */

const ProgressBar = ({
  currentSection,
  totalSections,
  sectionLabels = [],
  showPercentage = true
}) => {
  const percentage = (currentSection / totalSections) * 100;

  return (
    <div style={styles.container}>
      {/* Progress info text */}
      <div style={styles.infoRow}>
        <span style={styles.label}>
          Section {currentSection} of {totalSections}
          {sectionLabels[currentSection - 1] && (
            <span style={styles.sectionName}> - {sectionLabels[currentSection - 1]}</span>
          )}
        </span>
        {showPercentage && (
          <span style={styles.percentage}>{Math.round(percentage)}%</span>
        )}
      </div>

      {/* Progress bar */}
      <div style={styles.progressBarContainer}>
        <div
          style={{
            ...styles.progressBarFill,
            width: `${percentage}%`,
          }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>

      {/* Section indicators */}
      {totalSections <= 8 && (
        <div style={styles.sectionsContainer}>
          {Array.from({ length: totalSections }, (_, index) => (
            <div
              key={index}
              style={{
                ...styles.sectionDot,
                ...(index < currentSection ? styles.sectionDotComplete : {}),
                ...(index === currentSection - 1 ? styles.sectionDotCurrent : {}),
              }}
              title={sectionLabels[index] || `Section ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Simplified progress bar without section dots
 * For use with many sections
 */
export const SimpleProgressBar = ({ current, total }) => {
  const percentage = (current / total) * 100;

  return (
    <div style={styles.container}>
      <div style={styles.infoRow}>
        <span style={styles.label}>
          Question {current} of {total}
        </span>
        <span style={styles.percentage}>{Math.round(percentage)}%</span>
      </div>

      <div style={styles.progressBarContainer}>
        <div
          style={{
            ...styles.progressBarFill,
            width: `${percentage}%`,
          }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
};

/**
 * Tier progress indicator
 * Shows which tier of questions is active
 */
export const TierProgress = ({ currentTier, totalTiers, tierName }) => {
  return (
    <div style={styles.tierContainer}>
      <div style={styles.tierHeader}>
        <span style={styles.tierBadge}>Tier {currentTier}/{totalTiers}</span>
        <span style={styles.tierName}>{tierName}</span>
      </div>
      <div style={styles.tierBarContainer}>
        {Array.from({ length: totalTiers }, (_, index) => (
          <div
            key={index}
            style={{
              ...styles.tierSegment,
              ...(index < currentTier ? styles.tierSegmentComplete : {}),
              ...(index === currentTier - 1 ? styles.tierSegmentCurrent : {}),
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Styles following NHS Design System
const styles = {
  container: {
    width: '100%',
    marginBottom: '24px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  label: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#212b32', // NHS Text Grey
  },
  sectionName: {
    fontWeight: '400',
    color: '#4c6272', // NHS Secondary Grey
  },
  percentage: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#009639', // NHS Green
  },
  progressBarContainer: {
    width: '100%',
    height: '12px',
    backgroundColor: '#F0F4F5', // NHS Grey
    borderRadius: '6px',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#009639', // NHS Green
    transition: 'width 0.3s ease-in-out',
    borderRadius: '6px',
  },
  sectionsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '12px',
    paddingLeft: '2px',
    paddingRight: '2px',
  },
  sectionDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#F0F4F5', // NHS Grey
    border: '2px solid #AEB7BD',
    transition: 'all 0.3s ease',
    cursor: 'default',
  },
  sectionDotComplete: {
    backgroundColor: '#009639', // NHS Green
    borderColor: '#009639',
  },
  sectionDotCurrent: {
    backgroundColor: '#005EB8', // NHS Blue
    borderColor: '#005EB8',
    transform: 'scale(1.2)',
  },
  // Tier progress styles
  tierContainer: {
    width: '100%',
    marginBottom: '32px',
    padding: '16px',
    backgroundColor: '#F0F4F5',
    borderRadius: '4px',
  },
  tierHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
  },
  tierBadge: {
    display: 'inline-block',
    backgroundColor: '#005EB8', // NHS Blue
    color: 'white',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '700',
    marginRight: '12px',
  },
  tierName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#212b32',
  },
  tierBarContainer: {
    display: 'flex',
    gap: '8px',
    width: '100%',
  },
  tierSegment: {
    flex: 1,
    height: '8px',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    border: '1px solid #AEB7BD',
    transition: 'all 0.3s ease',
  },
  tierSegmentComplete: {
    backgroundColor: '#009639', // NHS Green
    borderColor: '#009639',
  },
  tierSegmentCurrent: {
    backgroundColor: '#005EB8', // NHS Blue
    borderColor: '#005EB8',
  },
};

export default ProgressBar;
