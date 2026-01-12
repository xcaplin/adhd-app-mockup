import React from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Question Renderer Component
 * Renders different question types with NHS styling and full accessibility
 * Supports: number, select (radios), scale (radio buttons), multiselect (checkboxes)
 * Compliant with WCAG 2.2 AA and NHS Design System
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
        return <NumberInput question={question} value={value} onChange={onChange} error={error} />;
      case 'select':
        return <SelectInput question={question} value={value} onChange={onChange} error={error} />;
      case 'scale':
        return <ScaleInput question={question} value={value} onChange={onChange} error={error} />;
      case 'multiselect':
        return <MultiselectInput question={question} value={value} onChange={onChange} error={error} />;
      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  return (
    <div style={styles.questionContainer}>
      {renderQuestion()}

      {/* Error message with proper ARIA */}
      {error && (
        <div
          id={`${question.id}-error`}
          role="alert"
          aria-live="polite"
          style={styles.error}
        >
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * Number Input Component
 * Proper HTML number input with label association
 */
const NumberInput = ({ question, value, onChange, error }) => {
  const inputId = `input-${question.id}`;
  const errorId = `${question.id}-error`;

  return (
    <>
      <label htmlFor={inputId} style={styles.questionLabel}>
        {question.text}
        {question.required && <span style={styles.required}> *</span>}
      </label>

      {question.hint && (
        <div style={styles.hintBox} id={`${question.id}-hint`}>
          <HelpCircle size={16} style={styles.hintIcon} />
          <span style={styles.hintText}>{question.hint}</span>
        </div>
      )}

      <input
        id={inputId}
        type="number"
        min={question.min}
        max={question.max}
        value={value || ''}
        onChange={(e) => onChange(parseInt(e.target.value) || '')}
        style={{
          ...styles.numberInput,
          ...(error ? styles.inputError : {})
        }}
        placeholder="Enter age"
        aria-required={question.required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${question.hint ? `${question.id}-hint` : ''} ${error ? errorId : ''}`.trim()}
      />
    </>
  );
};

/**
 * Select Input Component (Radio buttons)
 * Proper HTML radio inputs with fieldset/legend
 */
const SelectInput = ({ question, value, onChange, error }) => {
  const fieldsetId = `fieldset-${question.id}`;
  const errorId = `${question.id}-error`;

  return (
    <fieldset
      id={fieldsetId}
      style={styles.fieldset}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={`${question.hint ? `${question.id}-hint` : ''} ${error ? errorId : ''}`.trim()}
    >
      <legend style={styles.legend}>
        {question.text}
        {question.required && <span style={styles.required}> *</span>}
      </legend>

      {question.hint && (
        <div style={styles.hintBox} id={`${question.id}-hint`}>
          <HelpCircle size={16} style={styles.hintIcon} />
          <span style={styles.hintText}>{question.hint}</span>
        </div>
      )}

      <div style={styles.radioContainer}>
        {question.options.map((option, index) => {
          const radioId = `${question.id}-${index}`;
          const isChecked = value === option;

          return (
            <div key={index} style={styles.radioWrapper}>
              <input
                type="radio"
                id={radioId}
                name={question.id}
                value={option}
                checked={isChecked}
                onChange={() => onChange(option)}
                style={styles.radioInput}
                aria-required={question.required}
              />
              <label
                htmlFor={radioId}
                style={{
                  ...styles.radioLabel,
                  ...(isChecked ? styles.radioLabelChecked : {})
                }}
              >
                <span style={styles.radioButtonVisual} aria-hidden="true">
                  {isChecked && <span style={styles.radioButtonInner} />}
                </span>
                <span style={styles.optionText}>{option}</span>
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};

/**
 * Scale Input Component (Radio buttons styled as scale)
 * Proper HTML radio inputs for accessibility
 */
const ScaleInput = ({ question, value, onChange, error }) => {
  const fieldsetId = `fieldset-${question.id}`;
  const errorId = `${question.id}-error`;

  return (
    <fieldset
      id={fieldsetId}
      style={styles.fieldset}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={`${question.hint ? `${question.id}-hint` : ''} ${error ? errorId : ''}`.trim()}
    >
      <legend style={styles.legend}>
        {question.text}
        {question.required && <span style={styles.required}> *</span>}
      </legend>

      {question.hint && (
        <div style={styles.hintBox} id={`${question.id}-hint`}>
          <HelpCircle size={16} style={styles.hintIcon} />
          <span style={styles.hintText}>{question.hint}</span>
        </div>
      )}

      <div style={styles.scaleContainer} role="radiogroup" aria-label={question.text}>
        {question.options.map((option, index) => {
          const radioId = `${question.id}-${index}`;
          const isChecked = value === option;

          return (
            <div key={index} style={styles.scaleWrapper}>
              <input
                type="radio"
                id={radioId}
                name={question.id}
                value={option}
                checked={isChecked}
                onChange={() => onChange(option)}
                style={styles.scaleRadioInput}
                aria-required={question.required}
              />
              <label
                htmlFor={radioId}
                style={{
                  ...styles.scaleButton,
                  ...(isChecked ? styles.scaleButtonSelected : {})
                }}
              >
                {option}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};

/**
 * Multiselect Input Component (Checkboxes)
 * Proper HTML checkbox inputs with fieldset/legend
 */
const MultiselectInput = ({ question, value, onChange, error }) => {
  const selectedValues = Array.isArray(value) ? value : [];
  const fieldsetId = `fieldset-${question.id}`;
  const errorId = `${question.id}-error`;

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
    <fieldset
      id={fieldsetId}
      style={styles.fieldset}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={`${question.hint ? `${question.id}-hint` : ''} ${error ? errorId : ''}`.trim()}
    >
      <legend style={styles.legend}>
        {question.text}
        {question.required && <span style={styles.required}> *</span>}
      </legend>

      {question.hint && (
        <div style={styles.hintBox} id={`${question.id}-hint`}>
          <HelpCircle size={16} style={styles.hintIcon} />
          <span style={styles.hintText}>{question.hint}</span>
        </div>
      )}

      <div style={styles.checkboxContainer}>
        {question.options.map((option, index) => {
          const checkboxId = `${question.id}-${index}`;
          const isChecked = selectedValues.includes(option);

          return (
            <div key={index} style={styles.checkboxWrapper}>
              <input
                type="checkbox"
                id={checkboxId}
                name={question.id}
                value={option}
                checked={isChecked}
                onChange={() => handleToggle(option)}
                style={styles.checkboxInput}
                aria-required={question.required}
              />
              <label
                htmlFor={checkboxId}
                style={{
                  ...styles.checkboxLabel,
                  ...(isChecked ? styles.checkboxLabelChecked : {})
                }}
              >
                <span style={styles.checkboxVisual} aria-hidden="true">
                  {isChecked && (
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
                </span>
                <span style={styles.optionText}>{option}</span>
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};

// Styles following NHS Design System
const styles = {
  questionContainer: {
    marginBottom: '32px',
  },
  // Fieldset and Legend (proper semantic HTML)
  fieldset: {
    border: 'none',
    padding: 0,
    margin: 0,
  },
  legend: {
    display: 'block',
    fontSize: '19px',
    fontWeight: '700',
    color: '#212b32',
    marginBottom: '16px',
    lineHeight: '1.4',
    padding: 0,
  },
  questionLabel: {
    display: 'block',
    fontSize: '19px',
    fontWeight: '700',
    color: '#212b32',
    marginBottom: '16px',
    lineHeight: '1.4',
  },
  required: {
    color: '#DA291C',
  },
  hintBox: {
    display: 'flex',
    alignItems: 'flex-start',
    backgroundColor: '#F0F4F5',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '16px',
    border: '1px solid #AEB7BD',
  },
  hintIcon: {
    color: '#005EB8',
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
    color: '#DA291C',
    fontSize: '16px',
    marginTop: '8px',
    fontWeight: '700',
    padding: '12px',
    backgroundColor: '#FFF0F0',
    border: '4px solid #DA291C',
    borderRadius: '4px',
  },
  // Number input
  numberInput: {
    width: '120px',
    padding: '12px',
    fontSize: '19px',
    border: '2px solid #4c6272',
    borderRadius: '4px',
  },
  inputError: {
    borderColor: '#DA291C',
    borderWidth: '4px',
  },
  // Radio buttons (proper HTML inputs)
  radioContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  radioWrapper: {
    position: 'relative',
  },
  radioInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    border: '2px solid #AEB7BD',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
  },
  radioLabelChecked: {
    borderColor: '#005EB8',
    backgroundColor: '#F0F4F5',
    borderWidth: '4px',
  },
  radioButtonVisual: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid #4c6272',
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'white',
  },
  radioButtonInner: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#005EB8',
  },
  // Scale radio buttons
  scaleContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  scaleWrapper: {
    position: 'relative',
  },
  scaleRadioInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  scaleButton: {
    display: 'inline-block',
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
    backgroundColor: '#005EB8',
    borderColor: '#005EB8',
    borderWidth: '4px',
    color: 'white',
  },
  // Checkboxes (proper HTML inputs)
  checkboxContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  checkboxWrapper: {
    position: 'relative',
  },
  checkboxInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    border: '2px solid #AEB7BD',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
  },
  checkboxLabelChecked: {
    borderColor: '#005EB8',
    backgroundColor: '#F0F4F5',
    borderWidth: '4px',
  },
  checkboxVisual: {
    width: '40px',
    height: '40px',
    borderRadius: '4px',
    border: '2px solid #4c6272',
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: '#005EB8',
  },
  optionText: {
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#212b32',
    flex: 1,
  },
};

export default QuestionRenderer;
