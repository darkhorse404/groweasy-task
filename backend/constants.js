// Default Backend Constants

const DEFAULT_QUESTIONS_MAP = {
  'Real Estate': [
    "What is your budget for the property?",
    "When are you planning to move in?",
    "Are you looking for a flat, house, or plot?",
    "Which location or area do you prefer?",
    "Is this for self-occupancy or investment?"
  ],
  'Healthcare': [
    "What specific treatment or specialist are you looking for?",
    "How soon are you looking to book an appointment?",
    "Do you have a preferred clinic or hospital location?",
    "Do you have health insurance?",
    "Is this a follow-up or a new consultation?"
  ],
  'Education': [
    "Which course or degree are you interested in?",
    "What is your current educational background?",
    "When do you plan to start your studies?",
    "Are you looking for online or on-campus classes?",
    "Do you require information regarding scholarships or financial aid?"
  ],
  'General': [
    "Could you describe your specific requirements?",
    "What is your estimated budget for this?",
    "How soon are you looking to start?",
    "Which location or region do you prefer?",
    "What is the primary goal you want to achieve?"
  ]
};

const getSectorQuestions = (sector) => {
  return DEFAULT_QUESTIONS_MAP[sector] || DEFAULT_QUESTIONS_MAP['General'];
};

const DEFAULT_CRITERIA_MAP = {
  'Real Estate': {
    hot: 'A lead is HOT if they have a clear budget, an immediate or short-term timeline (e.g., within 3 months), and know what property type they want.',
    cold: 'A lead is COLD if they are "just browsing," have no budget, or a timeline beyond 1 year.',
    invalid: 'A lead is INVALID if they are applying for a job, selling services, or speaking complete nonsense.'
  },
  'Healthcare': {
    hot: 'A lead is HOT if they have an urgent medical need, specific treatment requirements, and have selected a hospital location.',
    cold: 'A lead is COLD if they are inquiring about general info with no intent to book or have no insurance/funding for elective care.',
    invalid: 'A lead is INVALID if they are looking for emergency services (recommend 911/ER) or irrelevant medical sales.'
  },
  'Education': {
    hot: 'A lead is HOT if they have a specific degree choice, a clear start date (next intake), and have confirmed their educational eligibility.',
    cold: 'A lead is COLD if they are "thinking about it" for future years or have no idea what they want to study.',
    invalid: 'A lead is INVALID if they are looking for employment at the school or unrelated corporate services.'
  },
  'General': {
    hot: 'A lead is HOT if they have clear requirements, a defined budget, and a short-term timeline to proceed.',
    cold: 'A lead is COLD if they are unsure of their needs, have no budget, or no clear timeline.',
    invalid: 'A lead is INVALID if they are not interested in the core service or are irrelevant to the business.'
  }
};

const getSectorCriteria = (sector) => {
  return DEFAULT_CRITERIA_MAP[sector] || DEFAULT_CRITERIA_MAP['General'];
};

module.exports = {
  getSectorQuestions,
  getSectorCriteria,
  DEFAULT_RULES
};
