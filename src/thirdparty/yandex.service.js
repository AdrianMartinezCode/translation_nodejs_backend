const fs = require('fs');
const Path = require('path');
const filePath = Path.join(__dirname, "..", "..", "resources", "yandex-api-key.txt");
// A tricky import of the fetch function, due we aren't using the ESM
const fetch = (url) => import('node-fetch').then(({default: fetch}) => fetch(url));


// TODO Inject as a configuration the api key
const apiKey = process.env.YANDEX_API_KEY ?
    process.env.YANDEX_API_KEY :
    fs.readFileSync(filePath);

const translateSentence = async (sentence) => {
    /*
    My intention was to make the request as a x-www-form-urlencoded appending the text sentence in the body request
    due to the limitation of the maximum url size (2048 characters), but I was having the next error all the time with the
    fetch:
    Unexpected error: [
      Error: {"code":502,"message":"Invalid parameter: text"}
          at translateSentence (/home/adr/nodejs_translation_project/src/thirdparty/yandex.service.js:35:15)
          at processTicksAndRejections (internal/process/task_queues.js:95:5)
          at async translateSentence (/home/adr/nodejs_translation_project/src/services/sentences.service.js:69:28)
          at async translateSentence (/home/adr/nodejs_translation_project/src/controllers/sentences.controller.js:70:29)
    ]
    The code that do the request:
    const response = await fetch(
        `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${apiKey}&lang=de-en`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
               'text': sentence
            })
        }
    );
    So, I decided to make the request with a GET method and using the text query param,
    but I'm aware that if we use a sentence with size > 2048 - size(url without the sentence text) will
    fail the request.
     */
    // TODO Inject as a configuration the yandex url and maybe the translation direction
    const response = await fetch(
        `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${apiKey}&text=${sentence}&lang=de-en`,
    );
    if (response.ok) {
        return (await response.json()).text[0];
    }
    throw new Error(await response.text());
};

module.exports = translateSentence;