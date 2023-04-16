

const isValidCategory = (category) => {
  return [
    'responsibility',
    'benefit',
    'none',
    'education',
    'experience',
    'soft',
    'tech',
  ].includes(category);
};

module.exports = {
  isValidCategory,
};
