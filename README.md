 ## Introduction

 This README provides a comprehensive guide for setting up and using the backend project. 
 It covers the necessary steps, such as required files, environment variables, running the server, 
 API documentation, testing, and more.

 ## Table of Contents

 1. Prerequisites
 2. Setup and Configuration
 3. Running the Server
 4. API Documentation
 5. Testing
 6. Database Initialization
 7. Data Aggregation
 8. JSON Data Transformation
 9. Error Handling
 10. Logging

 ## 1. Prerequisites

 Before running the project locally, make sure you have the following files in the resources folder, 
 as they are not included in the GitHub repository due to security reasons:

 - sentences.jsonl.txt: Required if you plan to execute the initialization script
 - service-api-key.json: The secret key for Firebase
 - yandex-api-key.txt: The API key for Yandex

 When deploying the backend, ensure the following environment variables are set:

 - FIREBASE_SERVICE_ACCOUNT_KEY: The stringified Firebase secret key
 - YANDEX_API_KEY: The Yandex API key
 - PORT: The port used for requests

 ## 2. Setup and Configuration

Start downloading the nodejs and npm and installing these, once you have both applications type on the terminal from the root source project:
```npm install```

 ## 3. Running the Server

 To run the Node.js API server, you can use one of the following methods:

``` node ./src/index.js```<br>
 Or via npm scripts:
 ```npm run start```

 Once the server is running, you can access the following views:
 - http://localhost:3977/views/main  <-- the root view, you can access to the other views
 - http://localhost:3977/views/create
 - http://localhost:3977/views/update
 - http://localhost:3977/views/delete
 - http://localhost:3977/views/list
 - http://localhost:3977/views/query

 In a production environment, replace localhost:3977 with the appropriate domain and port.

 ## 4. API Documentation

 The API provides five endpoints to manage sentence data. Replace localhost:3977 with 
 the appropriate address for your environment.

### 4.1. Create a Sentence (POST /sentence/single)

 This endpoint is used to create a single sentence:

```
curl --location 'http://localhost:3977/sentence/single' \
--header 'Content-Type: application/json' \
--data '{
"text": "Ich mache einen Programmiertest",
"category": "education"
}'
```
The return body will include the ID of the created sentence:
```
{
    "id": "cTY76mbps9lYDsWcGNJN"
}
```

### 4.2. Update a Sentence (PUT /sentence/single/:id)

 This endpoint is used to modify the text and category fields of a sentence with the given ID:
```
curl --location --request PUT 'http://localhost:3977/sentence/single/cTY76mbps9lYDsWcGNJN' \
--header 'Content-Type: application/json' \
--data '{
    "text": "Ich ändere einen Satz",
    "category": "none"
}'
```
 No response body is returned for this endpoint.

  ### 4.3. Delete a Sentence (DELETE /sentence/single/:id)
 
  This endpoint deletes a sentence with the given ID:
 ```
curl --location --request DELETE 'http://localhost:3977/sentence/single/cTY76mbps9lYDsWcGNJN'
```
No response body is returned for this endpoint.

### 4.4. Retrieve a Sentence (GET /sentence/single/:id)
This endpoint retrieves a sentence with the given ID:

```
curl --location 'http://localhost:3977/sentence/single/7o1YecFX8YGEp2iqWuGl'
```
The response body will include the sentence details:
```
{
    "id": "7o1YecFX8YGEp2iqWuGl",
    "category": "soft",
    "text": "Ich frage das Backend nach einem Satz ab"
}
```

### 4.5. List Sentences (GET /sentence/list?category=none&page=3&sort=ASC)
 This endpoint retrieves a list of sentences based on the provided parameters:
 - category: One of the possible categories
 - page: The page corresponding to the defined criteria
 - sort: Sort by category in ascending (ASC) or descending (DESC) order

 Example query:

```
curl --location 'http://localhost:3977/sentence/list?category=none&page=3&sort=ASC'
```
Sample response:
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

 ### 4.6. Translate a Sentence (GET /sentence/translate/:id)

 This endpoint translates a sentence with the given ID:
```
curl --location 'http://localhost:3977/sentence/translate/q3sazRjA08rabAoe6U9L'
```
One possible response can be:
```
{
    "id": "q3sazRjA08rabAoe6U9L",
    "text": "Hilfe beim Einrichten von Hardware & Accounts",
    "category": "none",
    "translation": "Help with setting up hardware "
}
```


## 5. Testing
We have created some tests, but the backend isn't have the full coverage for e2e tests and integration tests by the moment,
we can run the next tests:

- Unit tests for the sentences.service: sentences.service.spec
- Unit tests for the sentence.repository: sentence.repository.spec

To execute the overall tests of the project:
```npm run test```


## 6. Database Initialization
This script takes the sentences.jsonl.txt file to save these in the database.
The script is simple, read line by line avoiding to load the whole file into the memory,
parse it as JSON, transform the format to the chosen and use the creation sentence service
to store it.

To execute the script we type in the console:
```node ./scripts/dbInitialization/index.js```

## 7. Data Aggregation
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


## 8. JSON Data Transformation
The given base json structure has the next format:
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


 ## 9. Error Handling

 A middleware has been created to handle two types of errors, both returning the same body structure:
```
{
    "code": "NOT_FOUND",
    "message": "The sentenceId cTY76mbps9lYDsWcGNJ has not found."
}
```
  The two types of errors are:
  - ApiError: Known errors that will be shown to the user, informing them of any issues, 
such as incorrect parameters or if the queried sentence doesn't exist.
  - Generic error: Can be thrown anywhere in the backend. This will be logged on our error output, 
and a standard generic error will be shown to the user.
 
  ## 10. Logging
 
  A logger has been created and injected into some parts of the backend and is used to log
some actions on different layers. This approach makes us able to change in only in one file
the standard output to anywhere.