require('module-alias/register');
const topNWords = parseInt(process.argv[2]);
if (!topNWords || isNaN(topNWords)) {
  throw new Error(
      'Please, specify as the second parameter a numeric top words.',
  );
}

const config = require('@config/config');
const logger = require('@utils/logger');
const db = require('@database/database')({config, logger});
const repository =
    require('@repository/sentence.repository')({db, config, logger});

const listService =
    require('@services/sentences.service')(
        {repository, translator: null, logger},
    ).list;


const queryItems = (numPage) => listService(
    {page: numPage, sortCriteria: null, filterBy: null},
);

const normalizeToken = (token) => {
  // We can put more normalization logic here if we needed
  // In german some words have their first character in
  // Uppercase to indicate nouns,
  // TODO: search another approach to handle the capital letters
  return token.trim().toLowerCase();
};


const occurrences = {};
const classifySentence = (sentence) => {
  sentence.split(' ')
      .map(normalizeToken)
      .forEach((token) => {
        if (occurrences[token]) {
          occurrences[token] = occurrences[token] + 1;
        } else {
          occurrences[token] = 1;
        }
      });
};

const countWords = async () => {
  let i = 0;
  let remainSentences = true;
  while (remainSentences) {
    const sentences = await queryItems(i + 1);
    for (const sentence of sentences) {
      classifySentence(sentence.text);
    }
    remainSentences = sentences.length > 0;
    i++;
  }
};

const printTop100Words = () => {
  console.log(`Printing the top ${topNWords} words...`);
  Object.keys(occurrences)
      .sort((a, b) => occurrences[b] - occurrences[a])
      .slice(0, topNWords)
      .forEach((word) => console.log(`${word}: ${occurrences[word]}`));
};


countWords()
    .then(() => {
      printTop100Words();
    })
    .catch((error) => {
      console.error(
          'Error occurred while we were processing the words.',
          error,
      );
    });
