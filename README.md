
## First steps
To run anything in local, ensure that you have the next files into the resources folder,
by security reasons I didn't put these files into the github repository:

- sentences.jsonl.txt (in case that you'll execute the initialization script)
- service-api-key.json (the secret key from the firebase)
- yandex-api-key.txt (the api key from the yandex)

If we want to deploy the backend we should define the next envvars:
- FIREBASE_SERVICE_ACCOUNT_KEY : the stringified firebase secret key
- YANDEX_API_KEY : the api key from the yandex
- PORT : the port that will be used to make the requests

### Run the nodejs API server
We can run the server in two approaches:
```node ./src/index.js```<br>
Or via npm scripts:
```npm run start```

### Views path
We have created six views that you can check at the following links:
- http://localhost:3977/views/main  <-- the root view, you can access to the other views
- http://localhost:3977/views/create
- http://localhost:3977/views/update
- http://localhost:3977/views/delete
- http://localhost:3977/views/list
- http://localhost:3977/views/query

At prod environment, you only need to change the domain:port to the necessary domain.

### Execute the tests
I have created some tests, but the backend isn't have the full coverage for e2e tests and integration tests due a lack of time,
by the moment we can run the next tests:

- Unit tests for the sentences.service: sentences.service.spec

To execute the overall tests of the project:
```npm run test```


## DB Initialization script
This script is simple, read line by line avoiding to load the whole file into the memory,
parse it as JSON, transform the format to the chosen, and use the creation sentence service
to store it.

To execute the script we type in the console:
```node ./scripts/dbInitialization/index.js```

## Aggregation script
This script is simple as well, we use the list service to get the sentences by pages,
for each sentence of each page, we split by the space character, we normalized every token, 
and we used a dictionary to classify each token with their current occurrences, we have used a dictionary because
their access cost is O(1).

Once we filled the dictionary with all the word occurrences on our database, 
we sort the keys based on their occurrence value, we take the first N words,
and we print it.

To execute the script we type in the console:
```node ./scripts/aggregation/index.js 100```

We can configure the top N words at the third argument.



## Jobs JSON transformation
The base json structure given has the next format:
```
{
    text: "Sie sind offen, ...",
    cats: {
        responsibility: 0,
        benefit: 0,
        none: 0,
        education: 0,
        experience: 0,
        soft: 1,
        tech: 0
    }
}
...
```
This structure is not the best option to use in this project because we have the
requirement to order by any of the cats fields, filter and paginate, etc.

One approach to do this can be to group all the flags into one named field, which
indicates the category, as long as the all the categories fields into one text
satisfies the next corollary:
```
r = sentence(i)
sum(
    r.cats.responsibility,
    r.cats.benefit,
    r.cats.none,
    r.cats.education,
    r.cats.experience,
    r.cats.soft,
    r.cats.tech
) equals to 1
```
We can rewrite this structure into the next format:

```
{
    text: "Sie sind offen, ...",
    category: 
        | "responsibility" 
        | "benefit" 
        | "none" 
        | "education" 
        | "experience" 
        | "soft" 
        | "tech"
}
...
```
With this approach we can define an index to optimize the query above the
category field and saving space in the database.


## API Documentation
We have five endpoints to manage the required API (change the localhost address to use it in other environment):

### POST sentence/single
This endpoint is used to create a single sentence:
```
curl --location 'http://localhost:3977/sentence/single' \
--header 'Content-Type: application/json' \
--data '{
"text": "Ich mache einen Programmiertest",
"category": "education"
}'
```
The return body will be:
```
{
    "id": "cTY76mbps9lYDsWcGNJN"
}
```
Indicating the sentence ID if it was necessary to use it.

### PUT sentence/single/:id
We can modify the text and category fields from a given sentence:

```
curl --location --request PUT 'http://localhost:3977/sentence/single/cTY76mbps9lYDsWcGNJN' \
--header 'Content-Type: application/json' \
--data '{
    "text": "Ich ändere einen Satz",
    "category": "none"
}'
```

No body return in this endpoint.

### DELETE sentence/single/:id
This endpoint deletes the sentence by the given id.
```
curl --location --request DELETE 'http://localhost:3977/sentence/single/cTY76mbps9lYDsWcGNJN'
```
No body return in this endpoint.

### GET sentence/single/:id
This endpoint query for a sentence with the given id:
```
curl --location 'http://localhost:3977/sentence/single/7o1YecFX8YGEp2iqWuGl'
```
And the response body is:
```
{
    "id": "7o1YecFX8YGEp2iqWuGl",
    "category": "soft",
    "text": "Ich frage das Backend nach einem Satz ab"
}
```

### GET sentence/list?category=none&page=3&sort=ASC
This endpoint query for a list of a sentences given the parameters:
- category: can be one of the possible categories
- page: the page corresponding to the criteria defined
- sort: ASC|DESC by category

An example of a query can be:
```
curl --location 'http://localhost:3977/sentence/list?category=none&page=3&sort=ASC'
```
And the response:
```
[
    {
        "id": "pvgLyejuIoEByVuQasxb",
        "text": "bund.de Navigation anzeigen Filter anzeigen Navigation Haupt-Navigations-MenÃ¼ Stellenangebote Ausschreibungen BehÃ¶rden Leistungen Meta-Navigation LEICHTE SPRACHE GEBÃ„RDENSPRACHE IMPRESSUM / DATENSCHUTZ ÃœBER BUND.DE ENGLISH",
        "category": "none"
    },
    {
        "id": "q3sazRjA08rabAoe6U9L",
        "text": "Hilfe beim Einrichten von Hardware & Accounts",
        "category": "none"
    },
    {
        "id": "scwwI8L7PWvl1GRMyikp",
        "text": "Referent Personalentwicklung (m/w)",
        "category": "none"
    },
    {
        "id": "y76v5eC502XgjY41Um6T",
        "text": "Braunschweig",
        "category": "none"
    },
    {
        "id": "yoNawAooVFTy8lUDkMx3",
        "text": "Wir suchen fÃ¼r unsere Tochtergesellschaft Schmidhauser AG am Standort Romanshorn in der Schweiz einen.",
        "category": "none"
    }
]
```

### GET sentence/translate/:id
This endpoint translates a sentence given an id:
```
curl --location 'http://localhost:3977/sentence/translate/q3sazRjA08rabAoe6U9L'
```
And one possible response can be:
```
{
    "id": "q3sazRjA08rabAoe6U9L",
    "text": "Hilfe beim Einrichten von Hardware & Accounts",
    "category": "none",
    "translation": "Help with setting up hardware "
}
```

## Error handling
I created a middleware to handle two types of errors, but returning with the same body structure:

```
{
    "code": "NOT_FOUND",
    "message": "The sentenceId cTY76mbps9lYDsWcGNJ has not found."
}
```
The two types of errors are:
- ApiError , that is known as an error that will be showed to the user, and informing of anything wrong, for example an incorrect parameter or if the queried sentence doesn't exists.
- Generic error, that can be thrown in anywhere of the backend, this will be logged on our error output and we will show a standard generic error to the user.


## Logger
We have created a logger that is injected in some parts of the backend, but is ideal to be injected in more
parts, but due a lack of time we only have used in the general error handler, the purpose of this logger
is to abstract the implementation if we need to implement another log approach instead of the standard output.

## Configuration
The best practice to get configuration options along the whole project is injecting an object which contains the
different values of the configuration, we can make it using the implemented dependency injection, but for the moment
we did a wrong practice to do this, that is getting the configuration directly where will be used.