// Mock credit score service (simulates external credit bureau API)
export const getCreditScore = async (panCard) => {
  // In production, this would call an actual credit bureau API
  // For now, we'll generate a deterministic score based on PAN card
  
  // Generate a deterministic score between 300-900 based on PAN hash
  const hash = panCard
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Map hash to 300-900 range
  const score = 300 + (hash % 601); // 300 to 900
  
  return {
    panCard,
    creditScore: score,
    scoreRange: getScoreRange(score),
    retrievedAt: new Date(),
  };
};

const getScoreRange = (score) => {
  if (score >= 750) return '750-900 (Excellent)';
  if (score >= 700) return '700-749 (Good)';
  if (score >= 650) return '650-699 (Fair)';
  if (score >= 600) return '600-649 (Poor)';
  return '300-599 (Very Poor)';
};

export const calculateCreditLimit = (annualIncome) => {
  if (annualIncome <= 200000) {
    return 50000;
  } else if (annualIncome <= 300000) {
    return 75000;
  } else if (annualIncome <= 500000) {
    return 100000;
  } else {
    // For income > 5,00,000, return null (subjective review)
    return null;
  }
};

export const shouldAutoApprove = (creditScore, creditLimit) => {
  // Auto-approve if credit score > 800 and limit is not subjective
  return creditScore > 800 && creditLimit !== null;
};
