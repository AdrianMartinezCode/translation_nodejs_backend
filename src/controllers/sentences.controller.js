
const ApiError = require('@utils/ApiError');
const {isValidCategory} = require('@utils/category_utils');

const createSentence = async ({req, res, createSentenceService, logger}) => {
  logger.info('Controller create sentence called with body', req.body);
  // Validate the parameters
  const text = req.body.text;
  if (!text || text === '' || typeof text !== 'string') {
    throw new ApiError(
        400,
        'INVALID_PARAM',
        'The text used in the sentence is invalid.',
    );
  }

  const category = req.body.category;
  if (!isValidCategory(category)) {
    throw new ApiError(
        400,
        'INVALID_PARAM',
        'The category specified is invalid.',
    );
  }

  const serviceResponse = await createSentenceService(
      {sentence: {text, category}},
  );
  res.json(serviceResponse);
};

const updateSentence = async ({req, res, updateSentenceService, logger}) => {
  logger.info(
      'Controller update sentence called with params and body',
      req.params,
      req.body,
  );
  const sentenceId = req.params.id;
  if (!sentenceId) {
    throw new ApiError(
        400,
        'INVALID_PARAM',
        'The specified sentence Id is invalid.',
    );
  }

  // can be undefined, if is undefined the field won't be changed
  const text = req.body.text;
  if (text !== undefined &&
      (text === '' || text === null || typeof text !== 'string')
  ) {
    throw new ApiError(
        400,
        'INVALID_PARAM',
        'The category specified is invalid.',
    );
  }

  const category = req.body.category === '' ? undefined : req.body.category;
  if (category !== undefined && !isValidCategory(category)) {
    throw new ApiError(
        400,
        'INVALID_PARAM',
        'The category specified is invalid.',
    );
  }

  await updateSentenceService({sentenceId, sentence: {text, category}});

  res.status(204).end();
};

const deleteSentence = async ({req, res, deleteSentenceService, logger}) => {
  logger.info('Delete sentence controller called with params', req.params);
  const sentenceId = req.params.id;
  if (!sentenceId) {
    throw new ApiError(
        400,
        'INVALID_PARAM',
        'The specified sentence Id is invalid.',
    );
  }

  await deleteSentenceService({sentenceId});

  res.status(204).end();
};

const getSentence = async ({req, res, getSentenceService, logger}) => {
  logger.info('Get sentence controller called with params', req.params);
  const sentenceId = req.params.id;
  if (!sentenceId) {
    throw new ApiError(
        400,
        'INVALID_PARAM',
        'The specified sentence Id is invalid.',
    );
  }

  const serviceResponse = await getSentenceService({sentenceId});
  res.json(serviceResponse);
};

const listSentences = async ({req, res, listSentencesService, logger}) => {
  logger.info('List sentences controller called with query', req.query);
  const {page = 1, category, sort} = req.query;

  // This is due in the form to use the "All" category filter,
  // the ejs use the empty value.
  const categoryValue = category === '' ? undefined : category;
  if (categoryValue !== undefined && !isValidCategory(categoryValue)) {
    throw new ApiError(
        400,
        'INVALID_PARAM',
        'The category specified is invalid.',
    );
  }

  if (sort !== undefined && !['ASC', 'DESC'].includes(sort)) {
    throw new ApiError(400, 'INVALID_PARAM', 'The sort specified is invalid.');
  }

  const pageNumber = parseInt(page);
  if (isNaN(pageNumber) || !isFinite(pageNumber)) {
    throw new ApiError(400, 'INVALID_PARAM', 'The page specified is invalid.');
  }

  const sentences = await listSentencesService(
      {page: pageNumber, category: categoryValue, sortCriteria: sort},
  );

  res.json(sentences);
};

const translateSentence =
    async ({req, res, translateSentenceService, logger}) => {
      logger.info('Translate sentence called with params', req.params);
      const sentenceId = req.params.id;
      if (!sentenceId) {
        throw new ApiError(
            400,
            'INVALID_PARAM',
            'The specified sentence Id is invalid.',
        );
      }

      const serviceResponse = await translateSentenceService({sentenceId});
      res.json(serviceResponse);
    };

const sentencesController = ({sentencesService, logger}) => ({
  create: async ( req, res ) =>
    createSentence(
        {req, res, createSentenceService: sentencesService.create, logger},
    ),
  update: async ( req, res ) =>
    updateSentence(
        {req, res, updateSentenceService: sentencesService.update, logger},
    ),
  delete: async ( req, res ) =>
    deleteSentence(
        {req, res, deleteSentenceService: sentencesService.delete, logger},
    ),
  get: async ( req, res ) =>
    getSentence(
        {req, res, getSentenceService: sentencesService.get, logger},
    ),
  list: async ( req, res ) =>
    listSentences(
        {req, res, listSentencesService: sentencesService.list, logger},
    ),
  translate: async ( req, res ) =>
    translateSentence({
      req,
      res,
      translateSentenceService: sentencesService.translate,
      logger,
    }),
});

module.exports = sentencesController;
