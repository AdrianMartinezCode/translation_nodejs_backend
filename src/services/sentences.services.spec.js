
const sinon = require("sinon");
const { expect } = require("chai");
const sentencesService = require("./sentences.service");

const SENTENCES_COLLECTION_PATH = "sentences";
const PAGE_SIZE = 10;

describe("Sentences", () => {
    let db;

    beforeEach(() => {
        db = {
            collection: sinon.stub().returnsThis(),
            doc: sinon.stub().returnsThis(),
            add: sinon.stub(),
            get: sinon.stub(),
            where: sinon.stub().returnsThis(),
            orderBy: sinon.stub().returnsThis(),
            offset: sinon.stub().returnsThis(),
            limit: sinon.stub().returnsThis(),
            _docs: sinon.stub(),
        };
    });

    describe("createSentence", () => {
        it("should create a new sentence and return its id", async () => {
            const sentence = { text: "This is a test sentence." };
            const mockDocRef = { id: "abc123" };
            db.add.resolves(mockDocRef);

            const result = await sentencesService({ db }).create({ sentence });

            expect(result).to.deep.equal({ id: "abc123" });
            expect(db.collection.calledWith(SENTENCES_COLLECTION_PATH)).to.be.true;
            expect(db.add.calledWith(sentence)).to.be.true;
        });
    });
    describe("updateSentence", () => {
        it("should update a sentence by its id", async () => {
            const sentenceId = "abc123";
            const sentence = { text: "Updated test sentence." };
            const mockSentenceDoc = {
                exists: true,
            };
            db.get.resolves(mockSentenceDoc);
            db.collection(SENTENCES_COLLECTION_PATH).doc(sentenceId).update = sinon.stub();

            await sentencesService({ db }).update({ sentenceId, sentence });

            expect(db.collection.calledWith(SENTENCES_COLLECTION_PATH)).to.be.true;
            expect(db.doc.calledWith(sentenceId)).to.be.true;
            expect(db.get.calledOnce).to.be.true;
            expect(db.collection(SENTENCES_COLLECTION_PATH).doc(sentenceId).update.calledWith(sentence)).to.be.true;
        });
        it("should throw an error when a sentence is not found", async () => {
            const sentenceId = "nonexistent";
            const mockSentenceDoc = { exists: false };
            const sentence = { text: "Updated test sentence." };
            db.get.resolves(mockSentenceDoc);

            try {
                await sentencesService({ db }).update({ sentenceId, sentence });
            } catch (error) {
                expect(error.statusCode).to.equal(404);
                expect(error.code).to.equal("NOT_FOUND");
                expect(error.message).to.equal(`The sentenceId ${sentenceId} has not found.`);
            }

            expect(db.collection.calledWith(SENTENCES_COLLECTION_PATH)).to.be.true;
            expect(db.doc.calledWith(sentenceId)).to.be.true;
            expect(db.get.calledOnce).to.be.true;
        })
    });
    describe("deleteSentence", () => {
        it("should delete a sentence by its id", async () => {
            const sentenceId = "abc123";
            const mockSentenceDoc = {
                exists: true,
            };
            db.get.resolves(mockSentenceDoc);
            db.collection(SENTENCES_COLLECTION_PATH).doc(sentenceId).delete = sinon.stub();

            await sentencesService({ db }).delete({ sentenceId });

            expect(db.collection.calledWith(SENTENCES_COLLECTION_PATH)).to.be.true;
            expect(db.doc.calledWith(sentenceId)).to.be.true;
            expect(db.get.calledOnce).to.be.true;
            expect(db.collection(SENTENCES_COLLECTION_PATH).doc(sentenceId).delete.calledOnce).to.be.true;
        });

        it("should throw an error when a sentence is not found", async () => {
            const sentenceId = "nonexistent";
            const mockSentenceDoc = { exists: false };
            db.get.resolves(mockSentenceDoc);

            try {
                await sentencesService({ db }).delete({ sentenceId });
            } catch (error) {
                expect(error.statusCode).to.equal(404);
                expect(error.code).to.equal("NOT_FOUND");
                expect(error.message).to.equal(`The sentenceId ${sentenceId} has not found.`);
            }

            expect(db.collection.calledWith(SENTENCES_COLLECTION_PATH)).to.be.true;
            expect(db.doc.calledWith(sentenceId)).to.be.true;
            expect(db.get.calledOnce).to.be.true;
        });
    });

    describe("getSentence", () => {
        it("should return a sentence by its id", async () => {
            const sentenceId = "abc123";
            const mockSentence = { text: "This is a test sentence." };
            const mockSentenceDoc = {
                exists: true,
                id: sentenceId,
                data: () => mockSentence,
            };
            db.get.resolves(mockSentenceDoc);

            const result = await sentencesService({ db }).get({ sentenceId });

            expect(result).to.deep.equal({ id: sentenceId, ...mockSentence });
            expect(db.collection.calledWith(SENTENCES_COLLECTION_PATH)).to.be.true;
            expect(db.doc.calledWith(sentenceId)).to.be.true;
            expect(db.get.calledOnce).to.be.true;
        });

        it("should throw an error when a sentence is not found", async () => {
            const sentenceId = "nonexistent";
            const mockSentenceDoc = { exists: false };
            db.get.resolves(mockSentenceDoc);

            try {
                await sentencesService({ db }).get({ sentenceId });
            } catch (error) {
                expect(error.statusCode).to.equal(404);
                expect(error.code).to.equal("NOT_FOUND");
                expect(error.message).to.equal(`The sentenceId ${sentenceId} has not found.`);
            }

            expect(db.collection.calledWith(SENTENCES_COLLECTION_PATH)).to.be.true;
            expect(db.doc.calledWith(sentenceId)).to.be.true;
            expect(db.get.calledOnce).to.be.true;
        });
    });
    describe("listSentences", () => {
        it("should return a list of sentences with pagination and optional filters", async () => {
            const page = 1;
            const sortCriteria = "ASC";
            const category = "test";
            const mockSentences = [
                { id: "sentence1", category: "test", text: "Test sentence 1" },
                { id: "sentence2", category: "test", text: "Test sentence 2" },
            ];
            const mockSnapshot = {
                _docs: () => mockSentences.map((sentence) => ({ id: sentence.id, data: () => sentence })),
            };
            db.get.resolves(mockSnapshot);

            const result = await sentencesService({ db }).list({ page, sortCriteria, category });

            expect(result).to.deep.equal(mockSentences);
            expect(db.collection.calledWith(SENTENCES_COLLECTION_PATH)).to.be.true;
            expect(db.where.calledWith("category", "==", category)).to.be.true;
            expect(db.offset.calledWith((page - 1) * PAGE_SIZE)).to.be.true;
            expect(db.limit.calledWith(PAGE_SIZE)).to.be.true;
            expect(db.get.calledOnce).to.be.true;
        });
        // TODO make more testing to simulate the different params combinations!
    });
    describe("translateSentence", () => {
        let translator;

        beforeEach(() => {
            translator = sinon.stub();
        });

        it("should return a translated sentence by its id", async () => {
            const sentenceId = "abc123";
            const mockSentence = { text: "This is a test sentence." };
            const mockTranslatedText = "Ceci est une phrase de test.";
            const mockSentenceDoc = {
                exists: true,
                id: sentenceId,
                data: () => mockSentence,
            };
            db.get.resolves(mockSentenceDoc);
            translator.resolves(mockTranslatedText);

            const result = await sentencesService({ db, translator }).translate({ sentenceId });

            expect(result).to.deep.equal({ id: sentenceId, ...mockSentence, translation: mockTranslatedText });
            expect(db.collection.calledWith(SENTENCES_COLLECTION_PATH)).to.be.true;
            expect(db.doc.calledWith(sentenceId)).to.be.true;
            expect(db.get.calledOnce).to.be.true;
            expect(translator.calledWith(mockSentence.text)).to.be.true;
        });

        it("should throw an error when a sentence is not found", async () => {
            const sentenceId = "nonexistent";
            const mockSentenceDoc = { exists: false };
            db.get.resolves(mockSentenceDoc);

            try {
                await sentencesService({ db, translator }).translate({ sentenceId });
            } catch (error) {
                expect(error.statusCode).to.equal(404);
                expect(error.code).to.equal("NOT_FOUND");
                expect(error.message).to.equal(`The sentenceId ${sentenceId} has not found.`);
            }

            expect(db.collection.calledWith(SENTENCES_COLLECTION_PATH)).to.be.true;
            expect(db.doc.calledWith(sentenceId)).to.be.true;
            expect(db.get.calledOnce).to.be.true;
        });
    });
});