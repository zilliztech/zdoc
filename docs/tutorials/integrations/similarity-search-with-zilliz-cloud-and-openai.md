---
slug: /similarity-search-with-zilliz-cloud-and-openai
sidebar_label: With OpenAI
beta: FALSE
notebook: FALSE
type: origin
token: SeQxwhBEaimlzykxXLacoJuTnAb
sidebar_position: 1

---

import Admonition from '@theme/Admonition';


# Similarity Search with Zilliz Cloud and OpenAI

This page discusses integrating vector databases with OpenAI's embedding API.

We will demonstrate how to use [OpenAI's Embedding API](https://beta.openai.com/docs/guides/embeddings) with our vector database to search for book titles. Many existing book search solutions, such as those used by public libraries, rely on keyword matching rather than a semantic understanding of the title's meaning. Using a trained model to represent the input data is known as *semantic search* and can be applied to a variety of different text-based use cases, including anomaly detection and document search.

## Get started{#get-started}

To follow along, you'll need an API key from the [OpenAI website](https://openai.com/api/). Also, be sure to visit our [cloud landing page](https://zilliz.com/cloud) for $100 free credits that you can use to spin up a new cluster if you don’t have one already.

We'll also need to prepare the data for this example. You can obtain the book titles from [this kaggle page.](https://www.kaggle.com/datasets/jealousleopard/goodreadsbooks) Let's create a function that loads book titles from our CSV.

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
# 1. Go to https://www.kaggle.com/datasets/jealousleopard/goodreadsbooks, download the dataset, and save it locally.
FILE = '../books.csv'

# 2. Set up the name of the collection to be created.
COLLECTION_NAME = 'title_db'

# 3. Set up the dimension of the embeddings.
DIMENSION = 1536

# 4. Set up the number of records to process.
COUNT = 100

# 5. Set up the connection parameters for your Zilliz Cloud cluster.
URI = 'YOUR_CLUSTER_ENDPOINT'
TOKEN = 'YOUR_CLUSTER_TOKEN'

# 6. Set up the OpenAI engine and API key to use.
OPENAI_ENGINE = 'text-embedding-ada-002'  # Which engine to use
openai.api_key = 'YOUR_OPENAI_API_KEY'  # Use your own Open AI API Key here
```

<Admonition type="info" icon="📘" title="Notes">

<p>Since the embedding process for a free OpenAI account can be time-consuming, we use a small dataset to balance the execution time of the script and the precision of the search results. You can adjust the value of the <code>COUNT</code> constant to your liking.</p>

</Admonition>

The following snippet deals with Zilliz Cloud and setting up the cluster for this use case. Within Zilliz Cloud, we need to set up a collection and index it. For more information on how to set up and use Zilliz Cloud, refer to this [the quickstart guide](./quick-start).

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
    FieldSchema(name='id', dtype=DataType.INT64, descrition='Ids', is_primary=True, auto_id=False),
    FieldSchema(name='title', dtype=DataType.VARCHAR, description='Title texts', max_length=200),
    FieldSchema(name='embedding', dtype=DataType.FLOAT_VECTOR, description='Embedding vectors', dim=DIMENSION)
]

schema = CollectionSchema(fields=fields, description='Title collection')

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
    field_name='embedding',
    index_params=index_params
)

collection.load()
```

After setting up the collection, we can begin inserting our data, which involves three steps: reading the data, embedding the titles, and inserting into Zilliz Cloud.

```python
# Load the csv file and extract embeddings from the text
def csv_load(file):
    with open(file, newline='') as f:
        reader=csv.reader(f, delimiter=',')
        for row in reader:
            yield row[1]

def embed(text):
    return openai.Embedding.create(
        input=text, 
        engine=OPENAI_ENGINE)["data"][0]["embedding"]

# Insert each title and its embeddings

inserted = []

for idx, text in enumerate(random.sample(sorted(csv_load(FILE)), k=COUNT)):
    ins = {
        'id': idx,
        'title': (text[:198] + '..') if len(text) > 200 else text,
        'embedding': embed(text)
    }
    collection.insert(data=ins)
    time.sleep(3)
    inserted.append(ins)

# Search for similar titles
def search(text):
    res = collection.search(
        data=[embed(text)],
        anns_field='embedding',
        param={"metric_type": "L2", "params": {"nprobe": 10}},
        output_fields=['title'],
        limit=5,
    )

    ret = []

    for hits in res:
        for hit in hits:
            row = []
            row.extend([hit.id, hit.distance, hit.entity.get('title')])
            ret.append(row)

    return ret

search_terms = [
    'self-improvement',
    'landscape',
]

for x in search_terms:
    print('Search term: ', x)
    for x in search(x):
        print(x)
    print()
```

You should see the following as the output:

```python
# Output
#
# Search term:  self-improvement
# [9, 0.40222519636154175, 'Awakening Intuition: Using Your Mind-Body Network for Insight and Healing']
# [66, 0.40565189719200134, 'The War of Art: Break Through the Blocks & Win Your Inner Creative Battles']
# [73, 0.4130449891090393, 'The Organized Student: Teaching Children the Skills for Success in School and Beyond']
# [34, 0.41660943627357483, 'The Consolation of Philosophy']
# [61, 0.4331777095794678, 'Orientalism']

# Search term:  landscape
# [61, 0.3965946137905121, 'Orientalism']
# [24, 0.4071578085422516, 'Andreas Gursky']
# [1, 0.4108707904815674, 'The Art of Warfare']
# [45, 0.4112565815448761, 'Sunshine']
# [39, 0.41171979904174805, 'Wonderful Life: The Burgess Shale and the Nature of History']
```

A full example of this is available [in this colab notebook.](https://colab.research.google.com/drive/1bAX1Ah7ub4uVibQIT82LvdPmrRCzCXKM?usp=sharing)

## Related integrations{#related-integrations}

- [Question Answering Using Zilliz Cloud and HuggingFace](./question-answering-using-zilliz-cloud-and-hugging-face)

- [Question Answering Using Zilliz Cloud and Cohere](./question-answering-using-zilliz-cloud-and-cohere)

- [Question Answering over Documents with Zilliz Cloud and LangChain](./question-answering-over-documents-with-zilliz-cloud-and-langchain)

- [Image Search with Zilliz Cloud and PyTorch](./image-search-with-zilliz-cloud-and-pytorch)

- [Documentation QA using Zilliz Cloud and LlamaIndex](./rag-with-zilliz-cloud-and-llamaindex)

- [Movie Search Using Zilliz Cloud and SentenceTransformers](./movie-search-using-zilliz-cloud-and-sentencetransformers) 

