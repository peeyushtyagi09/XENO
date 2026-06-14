/**
 * Conversion rate calculate karo — divide-by-zero safe
 * @param {number} numerator
 * @param {number} denominator
 * @returns {string} e.g. "66.67%"
 */
const calculateRate = (numerator, denominator) => {
  if (!denominator || denominator === 0) {
    return "0%";
  }

  const rate = (numerator / denominator) * 100;
  return `${parseFloat(rate.toFixed(2))}%`;
};

/**
 * Raw counts se funnel rates nikalna — assignment formulas ke mutabiq
 *
 * deliveryRate  = delivered / sent * 100
 * openRate      = opened / delivered * 100
 * clickRate     = clicked / opened * 100
 * conversionRate = converted / clicked * 100
 */
const buildConversionRates = (counts) => {
  const { sent, delivered, opened, clicked, converted } = counts;

  return {
    deliveryRate: calculateRate(delivered, sent),
    openRate: calculateRate(opened, delivered),
    clickRate: calculateRate(clicked, opened),
    conversionRate: calculateRate(converted, clicked),
  };
};

module.exports = {
  calculateRate,
  buildConversionRates,
};
