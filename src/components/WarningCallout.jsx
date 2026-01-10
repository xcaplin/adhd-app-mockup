import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * NHS Warning Callout Component
 * Yellow-bordered warning box following NHS Design System
 * Used for important notices and disclaimers
 */

const WarningCallout = ({
  title = "Important",
  children,
  icon = true
}) => {
  return (
    <div style={styles.callout} role="alert">
      {/* Icon and Title */}
      <div style={styles.header}>
        {icon && (
          <div style={styles.iconContainer}>
            <AlertTriangle size={24} color="#FAE100" strokeWidth={2.5} />
          </div>
        )}
        <h3 style={styles.title}>{title}</h3>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {children}
      </div>
    </div>
  );
};

/**
 * Predefined warning callouts for common scenarios
 */

// Clinical disclaimer callout
export const ClinicalDisclaimer = () => (
  <WarningCallout title="This is not a diagnosis">
    <p style={styles.text}>
      This screening tool is designed to help identify patterns that may warrant
      professional evaluation. It is <strong>not a diagnostic tool</strong> and should
      not replace consultation with a qualified healthcare professional.
    </p>
    <p style={styles.text}>
      If you have concerns about your child's development or behaviour, please
      contact your GP or refer to NHS Children and Young People's Mental Health
      Services (CYPMHS).
    </p>
  </WarningCallout>
);

// Sleep confounder warning
export const SleepWarning = () => (
  <WarningCallout title="Sleep issues detected">
    <p style={styles.text}>
      The responses indicate significant sleep difficulties. Sleep disorders
      (such as sleep apnea) can cause symptoms that look like ADHD, including
      inattention, hyperactivity, and mood problems.
    </p>
    <p style={styles.text}>
      <strong>We strongly recommend a sleep evaluation before pursuing ADHD assessment.</strong>
    </p>
  </WarningCallout>
);

// Low impairment warning
export const LowImpairmentWarning = () => (
  <WarningCallout title="Limited functional impairment">
    <p style={styles.text}>
      While some patterns are present, the responses suggest limited impact on
      daily functioning across multiple domains (school, social, family life).
    </p>
    <p style={styles.text}>
      ADHD diagnosis requires significant impairment in multiple settings. Consider
      whether the difficulties are causing meaningful problems in daily life.
    </p>
  </WarningCallout>
);

// Age-appropriate behavior warning
export const AgeAppropriateWarning = ({ age }) => (
  <WarningCallout title="Consider typical development">
    <p style={styles.text}>
      At age {age}, high activity levels and some impulsivity are developmentally
      normal. Look for behaviors that are <strong>extreme</strong> compared to
      same-age peers and cause <strong>significant problems</strong> across
      multiple settings.
    </p>
  </WarningCallout>
);

// Styles following NHS Design System
const styles = {
  callout: {
    backgroundColor: '#FFF8E1', // Light yellow background
    border: '4px solid #FAE100', // NHS Yellow border
    borderRadius: '4px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
  },
  iconContainer: {
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '19px',
    fontWeight: '700',
    color: '#1d1d1b', // NHS Dark Grey
    letterSpacing: '-0.5px',
  },
  content: {
    paddingLeft: '36px', // Align with title (after icon)
  },
  text: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#212b32', // NHS Text Grey
  },
};

export default WarningCallout;
