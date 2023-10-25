---
slug: /similarity-search-with-zilliz-cloud-and-openai
beta: FALSE
notebook: 80_integrations_openai.ipynb
sidebar_position: 1
---



# Similarity Search with Zilliz Cloud and OpenAI

This page discusses integrating vector databases with OpenAI's embedding API.

We will demonstrate how to use [OpenAI's Embedding API](https://beta.openai.com/docs/guides/embeddings) with our vector database to search for book titles. Many existing book search solutions, such as those used by public libraries, rely on keyword matching rather than a semantic understanding of the title's meaning. Using a trained model to represent the input data is known as *semantic search* and can be applied to a variety of different text-based use cases, including anomaly detection and document search.

## Get started{#get-started}

To follow along, you'll need an API key from the [OpenAI website](https://openai.com/api/). Also, be sure to visit our [cloud landing page](https://zilliz.com/cloud) for $100 free credits that you can use to spin up a new cluster if you don’t have one already.

We'll also need to prepare the data for this example. You can obtain the book titles from [here](https://www.kaggle.com/datasets/jealousleopard/goodreadsbooks). Let's create a function that loads book titles from our CSV.

```python
import csv
import json
import random
import openai
import time
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility

# Extract the book titles
def csv_load(file):
    with open(file, newline='') as f:
        reader=csv.reader(f, delimiter=',')
        for row in reader:
            yield row[1]
```

With this, we're ready to move on to generating embeddings.

## **Searching book titles**{#searching-book-titles}

Here we can find the main parameters that need to be modified for running with your own accounts. Beside each is a description of what it is.

```python
FILE = '/content/books.csv'  # Download it from <https://www.kaggle.com/datasets/jealousleopard/goodreadsbooks> and save it in the folder that holds your script.
COLLECTION_NAME = 'title_db'  # Collection name
DIMENSION = 1536  # Embeddings size
COUNT = 100  # How many titles to embed and insert
URI='https://replace-this-with-the-public-endpoint-of-your-cluster-on-zilliz-cloud'  # Endpoint URI obtained from Zilliz Cloud
USER='replace-this-with-the-cluster-user-name'  # Username specified when you created this cluster
PASSWORD='replace-this-with-the-cluster-password'  # Password set for that account
OPENAI_ENGINE = 'text-embedding-ada-002'  # Which engine to use
openai.api_key = ''  # Use your own Open AI API Key here
```

:::info Notes

Since the embedding process for a free OpenAI account can be time-consuming, we use a small dataset to balance the execution time of the script and the precision of the search results. You can adjust the value of the `COUNT` constant to your liking.

:::

The following snippet deals with Zilliz Cloud and setting up the cluster for this use case. Within Zilliz Cloud, we need to set up a collection and index it. For more information on how to set up and use Zilliz Cloud, refer to this [link](https://www.notion.so/Quick-Start-b0941a3615e440a5996cd7da45b5bee1?pvs=21).

```python
# Connect to Zilliz Cloud
connections.connect(uri=URI, user=USER, password=PASSWORD, secure=True)

# Remove collection if it already exists
if utility.has_collection(COLLECTION_NAME):
    utility.drop_collection(COLLECTION_NAME)

# Create collection which includes the id, title, and embedding.
fields = [
    FieldSchema(name='id', dtype=DataType.INT64, descrition='Ids', is_primary=True, auto_id=False),
    FieldSchema(name='title', dtype=DataType.VARCHAR, description='Title texts', max_length=200),
    FieldSchema(name='embedding', dtype=DataType.FLOAT_VECTOR, description='Embedding vectors', dim=DIMENSION)
]
schema = CollectionSchema(fields=fields, description='Title collection')
collection = Collection(name=COLLECTION_NAME, schema=schema)

# Create an index for the collection.
index_params = {
    'index_type': 'AUTOINDEX',
    'metric_type': 'L2',
    'params': {}
}
collection.create_index(field_name="embedding", index_params=index_params)
```

After setting up the collection, we can begin inserting our data, which involves three steps: reading the data, embedding the titles, and inserting into Zilliz Cloud.

```python
# Extract embedding from text using OpenAI
def embed(text):
    return openai.Embedding.create(
        input=text, 
        engine=OPENAI_ENGINE)["data"][0]["embedding"]

# Insert each title and its embedding
for idx, text in enumerate(random.sample(sorted(csv_load(FILE)), k=COUNT)):  # Load COUNT amount of random values from dataset
    ins=[[idx], [(text[:198] + '..') if len(text) > 200 else text], [embed(text)]]  # Insert the title id, the title text, and the title embedding vector
    collection.insert(ins)
    time.sleep(3)  # Free OpenAI account limited to 60 RPM

# Load the collection into memory for searching
collection.load()

# Search the cluster based on input text
def search(text):
    # Search parameters for the index
    search_params={
        "metric_type": "L2"
    }

    results=collection.search(
        data=[embed(text)],  # Embeded search value
        anns_field="embedding",  # Search across embeddings
        param=search_params,
        limit=5,  # Limit to five results per search
        output_fields=['title']  # Include title field in result
    )

    ret=[]
    for hit in results[0]:
        row=[]
        row.extend([hit.id, hit.score, hit.entity.get('title')])  # Get the id, distance, and title for the results
        ret.append(row)
    return ret

search_terms=['self-improvement', 'landscape']

for x in search_terms:
    print('Search term:', x)
    for result in search(x):
        print(result)
    print()
```

You should see the following as the output:

```python
Search term: self-improvement
[70, 0.34909766912460327, 'Life Management for Busy Woman: Growth and Study Guide']
[18, 0.4245884120464325, 'From Socrates to Sartre: The Philosophic Quest']
[63, 0.4264194667339325, 'Love']
[88, 0.44693559408187866, "The Innovator's Dilemma: The Revolutionary Book that Will Change the Way You Do Business"]
[29, 0.4684774875640869, 'The Thousandfold Thought (The Prince of Nothing  #3)']

Search term: landscape
[63, 0.34171175956726074, 'Love']
[48, 0.4100739061832428, 'Outlander']
[67, 0.41952890157699585, 'Ice Castles']
[98, 0.42765650153160095, 'The Long Walk']
[24, 0.43053609132766724, 'Notes from a Small Island']
```

A full example of this is available [here](https://colab.research.google.com/drive/1bAX1Ah7ub4uVibQIT82LvdPmrRCzCXKM?usp=sharing).

## Related integrations{#related-integrations}

- [Question Answering Using Zilliz Cloud and HuggingFace](./question-answering-using-zilliz-cloud-and-hugging-face) 

- [Question Answering Using Zilliz Cloud and Cohere](./question-answering-using-zilliz-cloud-and-cohere) 

- [Question Answering over Documents with Zilliz Cloud and LangChain](./question-answering-over-documents-with-zilliz-cloud-and-langchain) 

- [Image Search with Zilliz Cloud and PyTorch](./image-search-with-zilliz-cloud-and-pytorch) 

- [Documentation QA using Zilliz Cloud and LlamaIndex](./undefined) 

- [Movie Search Using Zilliz Cloud and SentenceTransformers](./movie-search-using-zilliz-cloud-and-sentencetransformers) 
