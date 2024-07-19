---
slug: /question-answering-using-zilliz-cloud-and-cohere
sidebar_label: With Cohere
beta: FALSE
notebook: FALSE
type: origin
token: WjZswh3lJi6k5BkyLaNchzodnib
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - cohere

---

import Admonition from '@theme/Admonition';


# Question Answering Using Zilliz Cloud and Cohere

This page illustrates how to create a question-answering system based on the SQuAD dataset using Zilliz Cloud as the vector database and Cohere as the embedding system.

## Before you start{#before-you-start}

Code snippets on this page require **pymilvus**, **cohere**, **pandas**, **numpy**, and **tqdm** installed. Among these packages, **pymilvus** is the client for Zilliz Cloud. If these packages are not present on your system, run the following commands to install them:

```bash
pip install pymilvus cohere pandas numpy tqdm openai tiktoken
```

Then you need to load the modules to be used in this guide.

```python
from pymilvus import connections, DataType, CollectionSchema, FieldSchema, Collection, utility
import cohere
import pandas
import numpy as np
from tqdm import tqdm
import time, os, json
```

## Parameters{#parameters}

Here we can find the parameters used in the following snippets. Some of them need to be changed to fit your environment. Beside each is a description of what it is.

```python
# 1. Set the The SQuAD dataset url.
FILE = 'https://rajpurkar.github.io/SQuAD-explorer/dataset/train-v2.0.json' 

# 2. Set up the name of the collection to be created.
COLLECTION_NAME = 'question_answering_db'

# 3. Set up the dimension of the embeddings.
DIMENSION = 768

# 4. Set the number of entities to create and the number of entities to insert at a time.
COUNT = 5000
BATCH_SIZE = 96

# 5. Set up the cohere api key
COHERE_API_KEY = "YOUR_COHERE_API_KEY"

# 6. Set up the connection parameters for your Zilliz Cloud cluster.
URI = 'YOUR_CLUSTER_ENDPOINT'

# 7. Set up the token for your Zilliz Cloud cluster.
# You can either use a set of cluster username and password joined by a colon.
TOKEN = 'YOUR_CLUSTER_TOKEN'
```

To know more about the model and dataset used on this page, refer to [Cohere](https://cohere.ai/) and [SQuAD](https://rajpurkar.github.io/SQuAD-explorer/).

## Prepare dataset{#prepare-dataset}

In this example, we are going to use the Stanford Question Answering Dataset (SQuAD) as our truth source for answering questions. This dataset comes in the form of a JSON file and we are going to use **pandas** to load it in.

```python
# Download the dataset
dataset = pandas.read_json(FILE)

# Clean up the dataset by grabbing all the question answer pairs
simplified_records = []
for x in dataset['data']:
    for y in x['paragraphs']:
        for z in y['qas']:
            if len(z['answers']) != 0:
                simplified_records.append({'question': z['question'], 'answer': z['answers'][0]['text']})

# Grab the amount of records based on COUNT
simplified_records = pandas.DataFrame.from_records(simplified_records)
simplified_records = simplified_records.sample(n=min(COUNT, len(simplified_records)), random_state = 42)

# Check if the length of the cleaned dataset matches COUNT
print(len(simplified_records))
```

The output should be the number of records in the dataset.

```python
5000
```

## Create a collection{#create-a-collection}

This section deals with Zilliz Cloud and setting up the cluster for this use case. Within Zilliz Cloud, we need to set up a collection and index it.

```python
# Connect to Zilliz Cloud and create a collection

connections.connect(
    alias='default',
    # Public endpoint obtained from Zilliz Cloud
    uri=URI,
    token=TOKEN
)

if COLLECTION_NAME in utility.list_collections():
    utility.drop_collection(COLLECTION_NAME)

fields = [
    FieldSchema(name='id', dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name='original_question', dtype=DataType.VARCHAR, max_length=1000),
    FieldSchema(name='answer', dtype=DataType.VARCHAR, max_length=1000),
    FieldSchema(name='original_question_embedding', dtype=DataType.FLOAT_VECTOR, dim=DIMENSION)
]

schema = CollectionSchema(fields=fields)

collection = Collection(
    name=COLLECTION_NAME,
    schema=schema,
)

index_params = {
    'metric_type': 'L2',
    'index_type': 'AUTOINDEX',
    'params': {'nlist': 1024}
}

collection.create_index(
    field_name='original_question_embedding', 
    index_params=index_params
)

collection.load()
```

## Insert data{#insert-data}

Once we have the collection set up, we need to start inserting our data. This is done in three steps:

- reading the data,

- embedding the original questions, and

- inserting the data into the collection we've just created on Zilliz Cloud.

In this example, the data includes the original question, the original question's embedding, and the answer to the original question.

```python
# Set up a Cohere client
cohere_client = cohere.Client(COHERE_API_KEY)

# Extract embeddings from questions using Cohere
def embed(texts, input_type):
    res = cohere_client.embed(texts, model='multilingual-22-12', input_type=input_type)
    return res.embeddings

# Insert each question, answer, and qustion embedding
total = pandas.DataFrame()
for batch in tqdm(np.array_split(simplified_records, (COUNT/BATCH_SIZE) + 1)):
    questions = batch['question'].tolist()
    embeddings = embed(questions, "search_document")
    
    data = [
        {
            'original_question': x,
            'answer': batch['answer'].tolist()[i],
            'original_question_embedding': embeddings[i]
        } for i, x in enumerate(questions)
    ]

    collection.insert(data=data)

time.sleep(10)
```

## Ask questions{#ask-questions}

Once all the data is inserted into the Zilliz Cloud collection, we can ask the system questions by taking our question phrase, embedding it with Cohere, and searching with Zilliz Cloud.

<Admonition type="info" icon="📘" title="Notes">

<p>Searches performed on data right after insertion might be a little slower as searching unindexed data is done in a brute-force manner. Once the new data is automatically indexed, the searches will speed up.</p>

</Admonition>

```python
# Search the cluster for an answer to a question text
# Search the cluster for an answer to a question text
def search(text, top_k = 5):

    # AUTOINDEX does not require any search params 
    search_params = {}

    results = collection.search(
        data = embed([text], "search_query"),  # Embeded the question
        anns_field='original_question_embedding',
        param=search_params,
        limit = top_k,  # Limit to top_k results per search
        output_fields=['original_question', 'answer']  # Include the original question and answer in the result
    )

    distances = results[0].distances
    entities = [ x.entity.to_dict()['entity'] for x in results[0] ]

    ret = [ {
        "answer": x[1]["answer"],
        "distance": x[0],
        "original_question": x[1]['original_question']
    } for x in zip(distances, entities)]

    return ret

# Ask these questions
search_questions = ['What kills bacteria?', 'What\'s the biggest dog?']

# Print out the results in order of [answer, similarity score, original question]

ret = [ { "question": x, "candidates": search(x) } for x in search_questions ]

print(ret)
```

The output should be similar to the following:

```python
# Output
#
# [
#     {
#         "question": "What kills bacteria?",
#         "candidates": [
#             {
#                 "answer": "farming",
#                 "distance": 25.10422134399414,
#                 "original_question": "What makes bacteria resistant to antibiotic treatment?"
#             },
#             {
#                 "answer": "converting nitrogen gas to nitrogenous compounds",
#                 "distance": 25.26958465576172,
#                 "original_question": "What do bacteria do in soil?"
#             },
#             {
#                 "answer": "slowing down the multiplication of bacteria or killing the bacteria",
#                 "distance": 26.225540161132812,
#                 "original_question": "How do antibiotics work?"
#             },
#             {
#                 "answer": "Phage therapy",
#                 "distance": 30.04580307006836,
#                 "original_question": "What has been talked about to treat resistant bacteria?"
#             },
#             {
#                 "answer": "antibiotic target",
#                 "distance": 32.077369689941406,
#                 "original_question": "What can be absent from the bacterial genome?"
#             }
#         ]
#     },
#     {
#         "question": "What's the biggest dog?",
#         "candidates": [
#             {
#                 "answer": "English Mastiff",
#                 "distance": 12.71607780456543,
#                 "original_question": "What breed was the largest dog known to have lived?"
#             },
#             {
#                 "answer": "part of the family",
#                 "distance": 27.21062469482422,
#                 "original_question": "Most people today describe their dogs as what?"
#             },
#             {
#                 "answer": "77.5 million",
#                 "distance": 28.54041290283203,
#                 "original_question": "How many people in the United States are said to own dog?"
#             },
#             {
#                 "answer": "Rico",
#                 "distance": 28.770610809326172,
#                 "original_question": "What is the name of the dog that could ID over 200 things?"
#             },
#             {
#                 "answer": "about six",
#                 "distance": 31.739566802978516,
#                 "original_question": "What is the average number of pups in a litter?"
#             }
#         ]
#     }
# ]
```

## Related integrations{#related-integrations}

- [Similarity Search with Zilliz Cloud and OpenAI](./similarity-search-with-zilliz-cloud-and-openai)

- [Question Answering Using Zilliz Cloud and HuggingFace](./question-answering-using-zilliz-cloud-and-hugging-face)

- [Question Answering over Documents with Zilliz Cloud and LangChain](./question-answering-over-documents-with-zilliz-cloud-and-langchain)

- [Image Search with Zilliz Cloud and PyTorch](./image-search-with-zilliz-cloud-and-pytorch)

- [Documentation QA using Zilliz Cloud and LlamaIndex](./rag-with-zilliz-cloud-and-llamaindex)

- [Movie Search Using Zilliz Cloud and SentenceTransformers](./movie-search-using-zilliz-cloud-and-sentencetransformers) 

