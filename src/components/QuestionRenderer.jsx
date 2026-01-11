import React from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Question Renderer Component
 * Renders different question types with NHS styling
 * Supports: number, select, scale, multiselect
 */

const QuestionRenderer = ({
  question,
  value,
  onChange,
  error = null
}) => {
  const renderQuestion = () => {
    switch (question.type) {
      case 'number':
        return <NumberInput question={question} value={value} onChange={onChange} />;
      case 'select':
        return <SelectInput question={question} value={value} onChange={onChange} />;
      case 'scale':
        return <ScaleInput question={question} value={value} onChange={onChange} />;
      case 'multiselect':
        return <MultiselectInput question={question} value={value} onChange={onChange} />;
      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  return (
    <div style={styles.questionContainer}>
      {/* Question text */}
      <label style={styles.questionLabel}>
        {question.text}
        {question.required && <span style={styles.required}> *</span>}
      </label>

      {/* Hint text */}
      {question.hint && (
        <div style={styles.hintBox}>
          <HelpCircle size={16} style={styles.hintIcon} />
          <span style={styles.hintText}>{question.hint}</span>
        </div>
      )}

      {/* Question input */}
      {renderQuestion()}

      {/* Error message */}
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
};

/**
 * Number Input Component
 */
const NumberInput = ({ question, value, onChange }) => {
  return (
    <input
      type="number"
      min={question.min}
      max={question.max}
      value={value || ''}
      onChange={(e) => onChange(parseInt(e.target.value) || '')}
      style={styles.numberInput}
      placeholder="Enter age"
    />
  );
};

/**
 * Select Input Component (single choice)
 */
const SelectInput = ({ question, value, onChange }) => {
  return (
    <div style={styles.selectContainer}>
      {question.options.map((option, index) => (
        <div
          key={index}
          style={{
            ...styles.radioOption,
            ...(value === option ? styles.radioOptionSelected : {})
          }}
          onClick={() => onChange(option)}
        >
          <div style={styles.radioButton}>
            {value === option && <div style={styles.radioButtonInner} />}
          </div>
          <span style={styles.optionText}>{option}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * Scale Input Component (Never -> Very Often)
 */
const ScaleInput = ({ question, value, onChange }) => {
  return (
    <div style={styles.scaleContainer}>
      {question.options.map((option, index) => (
        <button
          key={index}
          type="button"
          style={{
            ...styles.scaleButton,
            ...(value === option ? styles.scaleButtonSelected : {})
          }}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

/**
 * Multiselect Input Component (checkboxes)
 */
const MultiselectInput = ({ question, value, onChange }) => {
  const selectedValues = Array.isArray(value) ? value : [];

  const handleToggle = (option) => {
    let newValues;
    if (selectedValues.includes(option)) {
      // Remove option
      newValues = selectedValues.filter(v => v !== option);
    } else {
      // Add option
      newValues = [...selectedValues, option];
    }

    // Handle "None" selection - clear all others
    if (option === 'None') {
      newValues = ['None'];
    } else if (newValues.includes('None')) {
      // If selecting something else, remove "None"
      newValues = newValues.filter(v => v !== 'None');
    }

    onChange(newValues);
  };

  return (
    <div style={styles.multiselectContainer}>
      {question.options.map((option, index) => {
        const isSelected = selectedValues.includes(option);
        return (
          <div
            key={index}
            style={{
              ...styles.checkboxOption,
              ...(isSelected ? styles.checkboxOptionSelected : {})
            }}
            onClick={() => handleToggle(option)}
          >
            <div style={styles.checkbox}>
              {isSelected && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.5 4L6 11.5L2.5 8"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span style={styles.optionText}>{option}</span>
          </div>
        );
      })}
    </div>
  );
};

// Styles following NHS Design System
const styles = {
  questionContainer: {
    marginBottom: '32px',
  },
  questionLabel: {
    display: 'block',
    fontSize: '19px',
    fontWeight: '600',
    color: '#212b32', // NHS Text Grey
    marginBottom: '16px',
    lineHeight: '1.4',
  },
  required: {
    color: '#DA291C', // NHS Red
  },
  hintBox: {
    display: 'flex',
    alignItems: 'flex-start',
    backgroundColor: '#F0F4F5', // NHS Grey
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '16px',
    border: '1px solid #AEB7BD',
  },
  hintIcon: {
    color: '#005EB8', // NHS Blue
    marginRight: '8px',
    marginTop: '2px',
    flexShrink: 0,
  },
  hintText: {
    fontSize: '16px',
    color: '#4c6272',
    lineHeight: '1.5',
  },
  error: {
    color: '#DA291C', // NHS Red
    fontSize: '16px',
    marginTop: '8px',
    fontWeight: '600',
  },
  // Number input
  numberInput: {
    width: '120px',
    padding: '12px',
    fontSize: '19px',
    border: '2px solid #4c6272',
    borderRadius: '4px',
    outline: 'none',
  },
  // Select/Radio options
  selectContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  radioOption: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    border: '2px solid #AEB7BD',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
  },
  radioOptionSelected: {
    borderColor: '#005EB8', // NHS Blue
    backgroundColor: '#F0F4F5',
  },
  radioButton: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid #4c6272',
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioButtonInner: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#005EB8', // NHS Blue
  },
  // Scale buttons
  scaleContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  scaleButton: {
    padding: '12px 20px',
    fontSize: '16px',
    fontWeight: '600',
    border: '2px solid #AEB7BD',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#212b32',
  },
  scaleButtonSelected: {
    backgroundColor: '#005EB8', // NHS Blue
    borderColor: '#005EB8',
    color: 'white',
  },
  // Multiselect/Checkbox options
  multiselectContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  checkboxOption: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    border: '2px solid #AEB7BD',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
  },
  checkboxOptionSelected: {
    borderColor: '#005EB8', // NHS Blue
    backgroundColor: '#F0F4F5',
  },
  checkbox: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    border: '2px solid #4c6272',
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'white',
  },
  optionText: {
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#212b32',
  },
};

export default QuestionRenderer;
