require('module-alias/register');
const config = require('@config/config');
const logger = require('@utils/logger');
const db = require('@database/database')({config, logger});
const repository =
    require('@repository/sentence.repository')({db, config, logger});

const creationService =
    require('../../src/services/sentences.service')(
        {repository, translator: null, logger},
    )
        .create;

const Path = require('path');

const filePath =
    Path.join(__dirname, '..', '..', 'resources', 'sentences.jsonl.txt');

const fs = require('fs');
const readline = require('readline');


const getCategory =
    ({responsibility, benefit, none, education, experience, soft, tech}) => {
      if (responsibility) return 'responsibility';
      if (benefit) return 'benefit';
      if (none) return 'none';
      if (education) return 'education';
      if (experience) return 'experience';
      if (soft) return 'soft';
      if (tech) return 'tech';
      throw new Error('Error, file wrong formatted.');
    };


const readLinesPromise = async () => {
  const stream = fs.createReadStream(filePath);
  const reader = readline.createInterface({input: stream});
  for await (const line of reader) {
    const {text, cats} = JSON.parse(line);
    const category = getCategory(cats);
    await creationService({sentence: {text, category}});
  }
};

readLinesPromise()
    .then(() => {
      console.log('Insertion process finished.');
    })
    .catch((err) => {
      console.error('The insertion process has had an error.', err);
    });

