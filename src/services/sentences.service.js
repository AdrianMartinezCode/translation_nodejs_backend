const ApiError = require("../utils/ApiError");

const SENTENCES_COLLECTION_PATH = 'sentences';
const PAGE_SIZE = 10;

const createSentence = async ({ sentence, db }) => {
    const docRef = await db.collection(SENTENCES_COLLECTION_PATH).add(sentence);
    return { id: docRef.id };
}

const updateSentence = async ({ sentenceId, sentence, db }) => {
    Object.keys(sentence).forEach(key => sentence[key] === undefined ? delete sentence[key] : {});
    const sentenceDoc = await db.collection(SENTENCES_COLLECTION_PATH).doc(sentenceId).get();
    if (sentenceDoc.exists) {
        await db.collection(SENTENCES_COLLECTION_PATH).doc(sentenceId).update(sentence);
    } else {
        throw new ApiError(404, "NOT_FOUND", `The sentenceId ${sentenceId} has not found.`);
    }

}

const deleteSentence = async ({ sentenceId, db }) => {
    const sentenceDoc = await db.collection(SENTENCES_COLLECTION_PATH).doc(sentenceId).get();
    if (sentenceDoc.exists) {
        await db.collection(SENTENCES_COLLECTION_PATH).doc(sentenceId).delete();
    } else {
        throw new ApiError(404, "NOT_FOUND", `The sentenceId ${sentenceId} has not found.`);
    }
};

const getSentence = async ({ sentenceId, db }) => {
    const sentenceDoc = await db.collection(SENTENCES_COLLECTION_PATH).doc(sentenceId).get();
    if (sentenceDoc.exists) {
        return { id: sentenceDoc.id, ...sentenceDoc.data() };
    }
    throw new ApiError(404, "NOT_FOUND", `The sentenceId ${sentenceId} has not found.`);
}

const listSentences = async ({ page, sortCriteria, category, db }) => {
    let itemsRef = db.collection(SENTENCES_COLLECTION_PATH);
    if (category) {
        itemsRef = itemsRef.where('category', '==', category);
    }
    // If the category is undefined, it doesn't matter the sort criteria, because all the results will have the same category.
    // In addition, with this operation we prevent the error:
    // order by clause cannot contain a field with an equality filter category
    // This is a firestore limitation, that doesn't support the filterBy equality and orderBy at the same field.
    if (category === undefined && sortCriteria) {
        itemsRef = itemsRef.orderBy('category', sortCriteria === 'ASC' ? 'asc' : 'desc');
    }
    const offset = (page - 1) * PAGE_SIZE;
    itemsRef = itemsRef.offset(offset).limit(PAGE_SIZE);

    const snapshot = await itemsRef.get();
    return snapshot._docs().map((doc) => ({ id: doc.id, ...doc.data() }));
}

const translateSentence = async ({ sentenceId, db, translator }) => {
    const sentenceDoc = await db.collection(SENTENCES_COLLECTION_PATH).doc(sentenceId).get();
    if (!sentenceDoc.exists) {
        throw new ApiError(404, "NOT_FOUND", `The sentenceId ${sentenceId} has not found.`);
    }
    const sentence = sentenceDoc.data();
    const textToTranslate = sentence.text;

    const translatedText = await translator(textToTranslate);

    return {id: sentenceDoc.id, ...sentence, translation: translatedText};
}


const sentencesService = ({ db, translator }) => ({
    create: ({ sentence }) => createSentence({ sentence, db }),
    update: ({ sentenceId, sentence }) => updateSentence({ sentenceId, sentence, db }),
    delete: ({ sentenceId }) => deleteSentence({ sentenceId, db }),
    get: ({ sentenceId }) => getSentence({ sentenceId, db }),
    list: (params) => listSentences({ ...params, db }),
    translate: ({ sentenceId }) => translateSentence({ sentenceId, db, translator })
});

module.exports = sentencesService;