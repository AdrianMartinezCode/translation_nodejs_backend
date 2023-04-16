require('module-alias/register');
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const sentenceRepository = require('@repository/sentence.repository');

const db = {
  collection: sinon.stub(),
};

const config = {
  sentencesCollectionPath: 'sentences',
};

const logger = {
  info: sinon.stub(),
};

const repository = sentenceRepository({db, config, logger});

describe('sentenceRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('insert', () => {
    it('should insert a sentence and return the new id', async () => {
      const sentence = {text: 'This is a test sentence.'};
      const docRef = {id: '123'};
      const add = sinon.stub().resolves(docRef);

      db.collection.returns({add});

      const result = await repository.insert({sentence});

      expect(db.collection.calledWith(config.sentencesCollectionPath))
          .to.be.true;
      expect(add.calledWith(sentence)).to.be.true;
      expect(result).to.deep.equal({id: docRef.id});
    });
  });

  describe('getById', () => {
    it('should return a sentence when a matching id is found', async () => {
      const sentenceId = '123';
      const sentenceData = {text: 'This is a test sentence.'};
      const sentenceDoc = {
        exists: true,
        id: sentenceId,
        data: () => sentenceData,
      };
      const get = sinon.stub().resolves(sentenceDoc);
      const doc = sinon.stub().returns({get});

      db.collection.returns({doc});

      const result = await repository.getById({sentenceId});

      expect(db.collection.calledWith(config.sentencesCollectionPath))
          .to.be.true;
      expect(doc.calledWith(sentenceId)).to.be.true;
      expect(get.calledOnce).to.be.true;
      expect(result).to.deep.equal({id: sentenceId, ...sentenceData});
    });

    it('should return null when no matching id is found', async () => {
      const sentenceId = '123';
      const sentenceDoc = {
        exists: false,
      };
      const get = sinon.stub().resolves(sentenceDoc);
      const doc = sinon.stub().returns({get});

      db.collection.returns({doc});

      const result = await repository.getById({sentenceId});

      expect(db.collection.calledWith(config.sentencesCollectionPath))
          .to.be.true;
      expect(doc.calledWith(sentenceId)).to.be.true;
      expect(get.calledOnce).to.be.true;
      expect(result).to.be.null;
    });
  });
  describe('updateSentenceById', () => {
    it('should update a sentence by id', async () => {
      const sentenceId = '123';
      const updatedSentence = {text: 'Updated test sentence.'};
      const update = sinon.stub().resolves();
      const doc = sinon.stub().returns({update});

      db.collection.returns({doc});

      await repository.updateById({sentenceId, sentence: updatedSentence});

      expect(db.collection.calledWith(config.sentencesCollectionPath))
          .to.be.true;
      expect(doc.calledWith(sentenceId)).to.be.true;
      expect(update.calledWith(updatedSentence)).to.be.true;
    });
  });

  describe('deleteSentenceById', () => {
    it('should delete a sentence by id', async () => {
      const sentenceId = '123';
      const deleteStub = sinon.stub().resolves();
      const doc = sinon.stub().returns({delete: deleteStub});

      db.collection.returns({doc});

      await repository.deleteById({sentenceId});

      expect(db.collection.calledWith(config.sentencesCollectionPath))
          .to.be.true;
      expect(doc.calledWith(sentenceId)).to.be.true;
      expect(deleteStub.calledOnce).to.be.true;
    });
  });
  describe('listSentences', () => {
    it('should list sentences with pagination, sortCriteria, ' +
        'and category filtering', async () => {
      const page = 1;
      const sortCriteria = 'ASC';
      const category = 'Test';
      const sentences = [
        {id: '1', text: 'Sentence 1', category: 'Test'},
        {id: '2', text: 'Sentence 2', category: 'Test'},
      ];

      const docs = sentences.map((sentence) => ({
        id: sentence.id,
        data: () => sentence,
      }));

      const snapshot = {
        _docs: () => docs,
      };

      const get = sinon.stub().resolves(snapshot);
      const limit = sinon.stub().returns({get});
      const offset = sinon.stub().returns({limit});
      const where = sinon.stub().returns({offset, limit});
      const collectionStub = sinon.stub().returns({where});

      db.collection = collectionStub;

      config.pageSize = 2;

      const result = await repository.list({page, sortCriteria, category});

      expect(db.collection.calledWith(config.sentencesCollectionPath))
          .to.be.true;
      expect(where.calledWith('category', '==', category)).to.be.true;
      expect(offset.calledWith((page - 1) * config.pageSize)).to.be.true;
      expect(limit.calledWith(config.pageSize)).to.be.true;
      expect(get.calledOnce).to.be.true;
      expect(result).to.deep.equal(sentences);
    });

    it('should list sentences without ' +
        'category filtering and apply orderBy', async () => {
      const page = 1;
      const sortCriteria = 'ASC';
      const category = undefined;
      const sentences = [
        {id: '1', text: 'Sentence 1', category: 'Test'},
        {id: '2', text: 'Sentence 2', category: 'Another'},
      ];

      const docs = sentences.map((sentence) => ({
        id: sentence.id,
        data: () => sentence,
      }));

      const snapshot = {
        _docs: () => docs,
      };

      const get = sinon.stub().resolves(snapshot);
      const limit = sinon.stub().returns({get});
      const offset = sinon.stub().returns({limit});
      const orderBy = sinon.stub().returns({offset});
      const collectionStub = sinon.stub().returns({orderBy});

      db.collection = collectionStub;

      config.pageSize = 2;

      const result = await repository.list({page, sortCriteria, category});

      expect(db.collection.calledWith(config.sentencesCollectionPath))
          .to.be.true;
      expect(orderBy.calledWith('category', 'asc')).to.be.true;
      expect(offset.calledWith((page - 1) * config.pageSize)).to.be.true;
      expect(limit.calledWith(config.pageSize)).to.be.true;
      expect(get.calledOnce).to.be.true;
      expect(result).to.deep.equal(sentences);
    });
  });
});
