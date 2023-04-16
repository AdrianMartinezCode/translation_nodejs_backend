require('module-alias/register');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const {expect} = chai;
chai.use(sinonChai);

const sentencesService = require('@services/sentences.service');
const ApiError = require('@utils/ApiError');

describe('sentencesService', () => {
  let repository;
  let translator;
  let logger;
  let service;

  beforeEach(() => {
    repository = {
      insert: sinon.stub().resolves(),
      getById: sinon.stub().resolves(),
      updateById: sinon.stub().resolves(),
      deleteById: sinon.stub().resolves(),
      list: sinon.stub().resolves(),
    };
    translator = sinon.stub().resolves();
    logger = {
      info: sinon.stub(),
    };
    service = sentencesService({repository, translator, logger});
  });


  describe('createSentence', () => {
    it('should create a sentence and return the result', async () => {
      const sentence = 'example sentence';
      const expectedResult = {_id: '123', sentence};

      repository.insert.resolves(expectedResult);

      const result = await service.create({sentence});

      expect(repository.insert).to.have.been.calledWith({sentence});
      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe('updateSentence', () => {
    it('should update a sentence and not ' +
        'throw an error if sentenceId is found', async () => {
      const sentenceId = '123';
      const sentence = 'updated example sentence';
      const sentenceDoc = {_id: sentenceId, sentence: 'old example sentence'};

      repository.getById.resolves(sentenceDoc);
      repository.updateById.resolves();

      await service.update({sentenceId, sentence});

      expect(repository.getById).to.have.been.calledWith({sentenceId});
      expect(repository.updateById)
          .to.have.been.calledWith({sentenceId, sentence});
    });

    it('should throw an ApiError ' +
        'if sentenceId is not found', async () => {
      const sentenceId = '123';
      const sentence = 'updated example sentence';

      repository.getById.resolves(null);

      try {
        await service.update({sentenceId, sentence});
        expect.fail('Expected an ApiError to be thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(ApiError);
        expect(error.statusCode).to.equal(404);
        expect(error.code).to.equal('NOT_FOUND');
        expect(error.message)
            .to.equal(`The sentenceId ${sentenceId} has not found.`);
      }

      expect(repository.getById).to.have.been.calledWith({sentenceId});
      expect(repository.updateById).not.to.have.been.called;
    });
  });
  describe('deleteSentence', () => {
    it('should delete a sentence and ' +
        'not throw an error if sentenceId is found', async () => {
      const sentenceId = '123';
      const sentenceDoc = {_id: sentenceId, sentence: 'example sentence'};

      repository.getById.resolves(sentenceDoc);
      repository.deleteById.resolves();

      await service.delete({sentenceId});

      expect(repository.getById).to.have.been.calledWith({sentenceId});
      expect(repository.deleteById).to.have.been.calledWith({sentenceId});
    });

    it('should throw an ApiError if sentenceId is not found', async () => {
      const sentenceId = '123';

      repository.getById.resolves(null);

      try {
        await service.delete({sentenceId});
        expect.fail('Expected an ApiError to be thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(ApiError);
        expect(error.statusCode).to.equal(404);
        expect(error.code).to.equal('NOT_FOUND');
        expect(error.message)
            .to.equal(`The sentenceId ${sentenceId} has not found.`);
      }

      expect(repository.getById).to.have.been.calledWith({sentenceId});
      expect(repository.deleteById).not.to.have.been.called;
    });
  });

  describe('getSentence', () => {
    it('should get a sentence and return it ' +
        'if sentenceId is found', async () => {
      const sentenceId = '123';
      const sentenceDoc = {_id: sentenceId, sentence: 'example sentence'};

      repository.getById.resolves(sentenceDoc);

      const result = await service.get({sentenceId});

      expect(repository.getById).to.have.been.calledWith({sentenceId});
      expect(result).to.deep.equal(sentenceDoc);
    });

    it('should throw an ApiError if sentenceId is not found', async () => {
      const sentenceId = '123';

      repository.getById.resolves(null);

      try {
        await service.get({sentenceId});
        expect.fail('Expected an ApiError to be thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(ApiError);
        expect(error.statusCode).to.equal(404);
        expect(error.code).to.equal('NOT_FOUND');
        expect(error.message).to
            .equal(`The sentenceId ${sentenceId} has not found.`);
      }

      expect(repository.getById).to.have.been.calledWith({sentenceId});
    });
  });
  describe('listSentences', () => {
    it('should list sentences based on the provided parameters', async () => {
      const page = 1;
      const sortCriteria = 'date';
      const category = 'example';
      const expectedResult = [
        {_id: '1', sentence: 'example sentence 1'},
        {_id: '2', sentence: 'example sentence 2'},
      ];

      repository.list.resolves(expectedResult);

      const result = await service.list({page, sortCriteria, category});

      expect(repository.list).to.have.been
          .calledWith({page, sortCriteria, category});
      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe('translateSentence', () => {
    it('should translate a sentence and return the ' +
        'sentence with translation if sentenceId is found', async () => {
      const sentenceId = '123';
      const sentenceDoc = {_id: sentenceId, text: 'example sentence'};
      const translatedText = 'ejemplo de oración';

      repository.getById.resolves(sentenceDoc);
      translator.resolves(translatedText);

      const result = await service.translate({sentenceId});

      expect(repository.getById).to.have.been.calledWith({sentenceId});
      expect(translator).to.have.been.calledWith({sentence: sentenceDoc.text});
      expect(result)
          .to.deep.equal({...sentenceDoc, translation: translatedText});
    });

    it('should throw an ApiError if sentenceId is not found', async () => {
      const sentenceId = '123';

      repository.getById.resolves(null);

      try {
        await service.translate({sentenceId});
        expect.fail('Expected an ApiError to be thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(ApiError);
        expect(error.statusCode).to.equal(404);
        expect(error.code).to.equal('NOT_FOUND');
        expect(error.message)
            .to.equal(`The sentenceId ${sentenceId} has not found.`);
      }

      expect(repository.getById).to.have.been.calledWith({sentenceId});
      expect(translator).not.to.have.been.called;
    });
  });
});
