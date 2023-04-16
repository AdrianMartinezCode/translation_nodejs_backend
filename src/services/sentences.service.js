const ApiError = require('@utils/ApiError');
const {cleanUndefinedFields} = require('@utils/objects');

const createSentence = async ({sentence, repository, logger}) => {
  logger.info('Service creating sentence', sentence);
  return await repository.insert({sentence});
};

const updateSentence = async ({sentenceId, sentence, repository, logger}) => {
  logger.info('Service updating sentence', sentenceId, sentence);
  sentence = cleanUndefinedFields(sentence);
  const sentenceDoc = await repository.getById({sentenceId});
  if (sentenceDoc !== null) {
    await repository.updateById({sentenceId, sentence});
  } else {
    throw new ApiError(
        404,
        'NOT_FOUND',
        `The sentenceId ${sentenceId} has not found.`,
    );
  }
};

const deleteSentence = async ({sentenceId, repository, logger}) => {
  logger.info('Service delete sentence', sentenceId);
  const sentenceDoc = await repository.getById({sentenceId});
  if (sentenceDoc !== null) {
    await repository.deleteById({sentenceId});
  } else {
    throw new ApiError(
        404,
        'NOT_FOUND',
        `The sentenceId ${sentenceId} has not found.`,
    );
  }
};

const getSentence = async ({sentenceId, repository, logger}) => {
  logger.info('Service get sentence', sentenceId);
  const sentenceDoc = await repository.getById({sentenceId});
  if (sentenceDoc !== null) {
    return sentenceDoc;
  }
  throw new ApiError(
      404,
      'NOT_FOUND',
      `The sentenceId ${sentenceId} has not found.`,
  );
};

const listSentences =
    async ({page, sortCriteria, category, repository, logger}) => {
      logger.info(
          `Service list sentences page=${page},sortCriteria=${sortCriteria},category=${category}`,
      );
      return await repository.list({page, sortCriteria, category});
    };

const translateSentence =
    async ({sentenceId, repository, translator, logger}) => {
      logger.info('Service translate sentence', sentenceId);
      const sentenceDoc = await repository.getById({sentenceId});
      if (sentenceDoc === null) {
        throw new ApiError(
            404,
            'NOT_FOUND',
            `The sentenceId ${sentenceId} has not found.`,
        );
      }
      const textToTranslate = sentenceDoc.text;

      const translatedText = await translator({sentence: textToTranslate});

      return {...sentenceDoc, translation: translatedText};
    };


const sentencesService = ({repository, translator, logger}) => ({
  create: ({sentence}) => createSentence({sentence, repository, logger}),
  update: ({sentenceId, sentence}) =>
    updateSentence({sentenceId, sentence, repository, logger}),
  delete: ({sentenceId}) => deleteSentence({sentenceId, repository, logger}),
  get: ({sentenceId}) => getSentence({sentenceId, repository, logger}),
  list: (params) => listSentences({...params, repository, logger}),
  translate: ({sentenceId}) =>
    translateSentence({sentenceId, repository, translator, logger}),
});

module.exports = sentencesService;
