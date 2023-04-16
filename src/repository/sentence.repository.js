const insertSentence = async ({sentence, db, config, logger}) => {
  logger.info('Repository inserting sentence', sentence);
  const docRef =
      await db.collection(config.sentencesCollectionPath).add(sentence);
  return {id: docRef.id};
};

const getSentenceById = async ({sentenceId, db, config, logger}) => {
  logger.info('Repository getting sentence by Id', sentenceId);
  const sentenceDoc =
        await db.collection(config.sentencesCollectionPath)
            .doc(sentenceId)
            .get();
  if (sentenceDoc.exists) {
    return {id: sentenceDoc.id, ...sentenceDoc.data()};
  }
  return null;
};

const updateSentenceById =
    async ({sentenceId, sentence, db, config, logger}) => {
      logger.info('Repository updating sentence by Id', sentenceId, sentence);
      await db.collection(config.sentencesCollectionPath)
          .doc(sentenceId)
          .update(sentence);
    };

const deleteSentenceById = async ({sentenceId, db, config, logger}) => {
  logger.info('Repository deleting sentence by Id', sentenceId);
  await db.collection(config.sentencesCollectionPath)
      .doc(sentenceId)
      .delete();
};

const listSentences =
    async ({page, sortCriteria, category, db, config, logger}) => {
      logger.info(`Repository list sentences page=${page},sortCriteria=${sortCriteria},category=${category}`);
      let itemsRef = db.collection(config.sentencesCollectionPath);
      if (category) {
        itemsRef = itemsRef.where('category', '==', category);
      }
      // If the category is undefined, it doesn't matter the sort criteria,
      // because all the results will have the same category.
      // In addition, with this operation we prevent the error:
      // order by clause cannot contain a field with an equality filter category
      // This is a firestore limitation, that doesn't support the filterBy
      // equality and orderBy at the same field.
      if (category === undefined && sortCriteria) {
        itemsRef = itemsRef.orderBy(
            'category',
            sortCriteria === 'ASC' ? 'asc' : 'desc',
        );
      }
      const offset = (page - 1) * config.pageSize;
      itemsRef = itemsRef.offset(offset).limit(config.pageSize);

      const snapshot = await itemsRef.get();
      return snapshot._docs().map((doc) => ({id: doc.id, ...doc.data()}));
    };

const sentenceRepository = ({db, config, logger}) => ({
  insert: ({sentence}) => insertSentence({sentence, db, config, logger}),
  getById: ({sentenceId}) => getSentenceById({sentenceId, db, config, logger}),
  updateById: ({sentenceId, sentence}) =>
    updateSentenceById({sentenceId, sentence, db, config, logger}),
  deleteById: ({sentenceId}) =>
    deleteSentenceById({sentenceId, db, config, logger}),
  list: ({page, sortCriteria, category}) =>
    listSentences({page, sortCriteria, category, db, config, logger}),
});

module.exports = sentenceRepository;
