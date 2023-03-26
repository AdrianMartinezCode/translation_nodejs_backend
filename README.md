
### First steps
To run anything in local, ensure that you have the next files into the resources folder,
by security reasons I didn't put these files into the github repository:

- sentences.jsonl.txt (in case that you'll execute the initialization script)
- service-api-key.json (the secret key from the firebase)


### DB Initialization script
This script is simple, read line by line avoiding to load the whole file into the memory,
parse it as JSON, transform the format to the chosen, and use the creation sentence service
to store it.

To execute the script we type in the console:
```node ./scripts/dbInitialization```

### Aggregation script
This script is simple as well, we use the list service to get the sentences by pages,
for each sentence of each page, we split by the space character, we normalized every token, 
and we used a dictionary to classify each token with their current occurrences, we have used a dictionary because
their access cost is O(1).

Once we filled the dictionary with all the word occurrences on our database, 
we sort the keys based on their occurrence value, we take the first N words,
and we print it.

To execute the script we type in the console:
```node scripts/aggregation/index.js 100```

We can configure the top N words at the third argument.


### Jobs JSON transformation
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
) should equals to 1
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
