# NHS ADHD Screening Tool

Multi-tier ADHD screening tool for children and adolescents aged 5-18. Evaluates patterns of attention, behaviour, and emotional regulation using evidence-based assessment methods with Bayesian probability calculations and ML pattern matching.

## 🎯 Features

- **Multi-Tier Assessment**: 24 questions across 5 sections (Demographics + 4 tiers)
- **Multi-Condition Evaluation**: ADHD, Autism Spectrum, Anxiety, Trauma/PTSD
- **Bayesian Probability Engine**: Gender and family history priors with demographic adjustments
- **ML Pattern Matching**: Signature-based pattern recognition with confidence boosts
- **Age-Adjusted Scoring**: Developmental norms for ages 6, 9, 12, 15, 18
- **Sleep Confounder Detection**: Flags potential sleep disorders
- **Functional Impairment Assessment**: Academic, social, family, emotional domains
- **NHS Design System**: Official NHS colors, typography, and accessibility standards
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices
- **Print-Friendly Results**: Professional printable assessment reports

## 📋 Prerequisites

- **Node.js**: v16.x or higher
- **npm**: v8.x or higher

Check your versions:
```bash
node --version
npm --version
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `react` (^18.2.0)
- `react-dom` (^18.2.0)
- `lucide-react` (^0.263.1) - Icons
- `@vitejs/plugin-react` (^4.0.0) - Dev
- `vite` (^4.3.9) - Build tool

### 2. Run Development Server

```bash
npm run dev
```

The application will start at **http://localhost:5173** (default Vite port)

You should see:
```
VITE v4.3.9  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

Open your browser and navigate to the URL shown.

### 3. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

Output example:
```
vite v4.3.9 building for production...
✓ XX modules transformed.
dist/index.html                   X.XX kB
dist/assets/index-XXXXX.css       XX.XX kB
dist/assets/index-XXXXX.js        XXX.XX kB
✓ built in XXXms
```

### 4. Preview Production Build

```bash
npm run preview
```

Serves the production build locally at **http://localhost:4173**

## 📁 Project Structure

```
nhs-adhd-screener/
├── index.html              # Entry HTML with NHS metadata
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
│
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Main application component (458 lines)
│   ├── App.css             # App-specific styles
│   ├── index.css           # Global base styles
│   │
│   ├── components/         # React components (5 total)
│   │   ├── NHSHeader.jsx              # Blue header with NHS logo
│   │   ├── ProgressBar.jsx            # Green progress indicator
│   │   ├── QuestionRenderer.jsx       # Multi-type question renderer
│   │   ├── ResultsDisplay.jsx         # Comprehensive results display
│   │   └── WarningCallout.jsx         # Yellow warning callouts
│   │
│   ├── data/               # JSON data files
│   │   ├── questions.json             # 24 questions (410 lines)
│   │   ├── ageNorms.json              # Age-specific norms (5 ages)
│   │   └── mlPatterns.json            # ML pattern signatures (4 types)
│   │
│   ├── styles/             # CSS stylesheets
│   │   └── nhs.css                    # NHS Design System (563 lines)
│   │
│   └── utils/              # JavaScript utilities (3 modules)
│       ├── calculator.js              # Weighted scoring algorithm
│       ├── bayesianEngine.js          # Probability calculations
│       └── mlMatcher.js               # Pattern matching engine
│
└── dist/                   # Production build (created by npm run build)
```

## 🧮 Assessment Algorithm

### Calculation Pipeline (6 Steps):

1. **Calculate Raw Scores** (`calculator.js`)
   - Weighted scoring for 4 conditions
   - Age-adjusted hyperactivity scoring
   - Sleep confounder tracking
   - ML feature extraction

2. **Match ML Patterns** (`mlMatcher.js`)
   - Signature-based pattern matching
   - 75% threshold for confirmation
   - Returns confidence boosts

3. **Apply Bayesian Probabilities** (`bayesianEngine.js`)
   - Base prevalence rates (ADHD 5%, Autism 1%, Anxiety 8%, Trauma 4%)
   - Gender multipliers (Male: 2.5x ADHD, 4x autism)
   - Family history multipliers (4x ADHD, 10x autism, 3x anxiety)

4. **Apply Pattern Boosts**
   - Add ML confidence bonuses
   - Adjust probabilities based on matched patterns

5. **Calculate Confidence Level**
   - High/Moderate/Low based on separation and impairment

6. **Get Age Context**
   - Load developmental norms for child's age
   - Provide age-appropriate interpretation

## 🎨 NHS Design System

### Colors:
- **NHS Blue**: #005EB8 (Primary brand color)
- **NHS Yellow**: #FAE100 (Warnings, focus states)
- **NHS Green**: #009639 (Success, CTAs)
- **NHS Red**: #DA291C (Errors, urgent)
- **NHS Purple**: #330072 (Links visited)
- **NHS Grey**: #F0F4F5 (Backgrounds)

### Typography:
- **Font Family**: Arial, Helvetica, sans-serif
- **Base Size**: 19px (body text)
- **Headings**: 48px/32px/24px/19px
- **Line Height**: 1.5 (body), 1.2 (headings)

### Accessibility:
- ✅ WCAG 2.1 AA compliant color contrast
- ✅ Keyboard navigation with visible focus states
- ✅ Screen reader friendly semantic HTML
- ✅ High contrast mode support
- ✅ Reduced motion support

## 🧪 Testing the Application

### Manual Testing Workflow:

1. **Introduction Screen**
   - Verify clinical disclaimer displays
   - Check "Start Screening" button works

2. **Demographics Section**
   - Enter child age (5-18)
   - Select gender
   - Select family history items

3. **Tier 1: Core Patterns**
   - Answer 5 questions about variability, novelty, rewards, hyperfocus

4. **Tier 2: Supporting Evidence**
   - Answer 7 questions about social, activity, structure, emotions

5. **Tier 3: Context & Development**
   - Answer 5 questions about onset, triggers, pervasiveness

6. **Tier 4: Functional Impact**
   - Rate impact on academic, social, family, emotional domains

7. **Results Screen**
   - Verify probability bars display correctly
   - Check pattern matches appear
   - Confirm age context shows
   - Verify recommendations generate
   - Test "Print Results" button
   - Test "Start New Screening" button

### Expected Behaviors:

- **Validation**: Cannot proceed without answering required questions
- **Age Warning**: Shows for children ≤8 years old in Tier 2
- **Sleep Warning**: Displays if sleep score ≥8
- **Low Impairment**: Shows if total impairment <6
- **Progress Bar**: Updates as you move through sections
- **Navigation**: Can go back to previous sections

## 🔧 Customization

### Modify Questions:
Edit `src/data/questions.json`

### Adjust Age Norms:
Edit `src/data/ageNorms.json`

### Update ML Patterns:
Edit `src/data/mlPatterns.json`

### Change Colors:
Edit CSS variables in `src/styles/nhs.css`:
```css
:root {
  --nhs-blue: #005EB8;
  --nhs-yellow: #FAE100;
  --nhs-green: #009639;
  /* ... */
}
```

### Modify Scoring Algorithm:
Edit functions in:
- `src/utils/calculator.js` (raw scoring)
- `src/utils/bayesianEngine.js` (probabilities)
- `src/utils/mlMatcher.js` (pattern matching)

## 📝 Available Scripts

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production (creates dist/)
npm run preview  # Preview production build (http://localhost:4173)
```

## 🌐 Browser Support

- **Chrome/Edge**: ✅ Latest 2 versions
- **Firefox**: ✅ Latest 2 versions
- **Safari**: ✅ Latest 2 versions
- **Mobile Safari**: ✅ iOS 12+
- **Chrome Mobile**: ✅ Latest

## ⚠️ Important Disclaimers

**This is a screening tool, NOT a diagnostic tool.**

- Results are preliminary and require professional evaluation
- Not a substitute for clinical assessment
- Should not be used to self-diagnose or diagnose others
- Consult a qualified healthcare professional (GP, CAMHS)
- In emergency, call 999
- For mental health crisis: Contact local crisis team

## 📄 License

See LICENSE file for details.

## 👥 Authors

NHS Digital - ADHD Screening Tool Development Team

## 🆘 Support

For technical issues:
- Check browser console for errors
- Verify Node.js and npm versions
- Clear browser cache and rebuild
- Check network tab for failed requests

For clinical questions:
- Contact your GP
- Refer to NHS Children and Young People's Mental Health Services (CYPMHS)
- Visit: https://www.nhs.uk/mental-health/

---

**Version**: 1.0.0
**Last Updated**: 2026-01-10
**Built with**: React 18.2 + Vite 4.3
