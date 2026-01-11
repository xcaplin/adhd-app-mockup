import React from 'react';

/**
 * NHS Header Component
 * Displays the NHS blue header with yellow stripe and NHS logo
 * Following NHS Design System guidelines
 */

const NHSHeader = ({ title = "ADHD Screening Tool" }) => {
  return (
    <header style={styles.header}>
      {/* Yellow stripe at top */}
      <div style={styles.yellowStripe}></div>

      {/* Main header content */}
      <div style={styles.headerContent}>
        {/* NHS Logo */}
        <div style={styles.logoContainer}>
          <NHSLogo />
        </div>

        {/* Service name */}
        <div style={styles.serviceName}>
          <span style={styles.serviceText}>{title}</span>
        </div>
      </div>
    </header>
  );
};

/**
 * NHS Logo SVG Component
 * Official NHS logo in white
 */
const NHSLogo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 120"
      style={styles.logo}
      aria-label="NHS Logo"
    >
      <rect width="300" height="120" fill="white" />
      <text
        x="30"
        y="80"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="70"
        fontWeight="bold"
        fill="#005EB8"
        letterSpacing="-2"
      >
        NHS
      </text>
    </svg>
  );
};

// Styles following NHS Design System
const styles = {
  header: {
    backgroundColor: '#005EB8', // NHS Blue
    color: 'white',
    position: 'relative',
    width: '100%',
  },
  yellowStripe: {
    backgroundColor: '#FAE100', // NHS Yellow
    height: '4px',
    width: '100%',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logoContainer: {
    marginRight: '20px',
  },
  logo: {
    height: '40px',
    width: 'auto',
  },
  serviceName: {
    flex: 1,
  },
  serviceText: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'white',
    letterSpacing: '-0.5px',
  },
};

export default NHSHeader;
