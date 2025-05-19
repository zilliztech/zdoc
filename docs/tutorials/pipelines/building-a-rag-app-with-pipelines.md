---
title: "Building a RAG Application with Pipelines | Cloud"
slug: /building-a-rag-app-with-pipelines
sidebar_label: "Pipelines Quickstart"
beta: NEAR DEPRECATE
notebook: FALSE
description: "Zilliz Cloud Pipelines is a robust solution for transforming unstructured data such as documents, text pieces and images into a searchable vector collection. This guide provides a detailed description of the three main Pipelines types and provides and example of building a RAG application with Pipelines. | Cloud"
type: origin
token: CCU1wZs6NiTEiwk8vN6cIP41nQf
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - pipelines
  - RAG
  - application
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings

---

import Admonition from '@theme/Admonition';


# Building a RAG Application with Pipelines

Zilliz Cloud Pipelines is a robust solution for transforming unstructured data such as documents, text pieces and images into a searchable vector [collection](./manage-collections). This guide provides a detailed description of the three main Pipelines types and provides and example of building a RAG application with Pipelines.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud Pipelines will be discontinued by the end of Q2 2025 and replaced by a new feature, “Data In, Data Out,” to streamline embedding generation in both Milvus and Zilliz Cloud. As of December 24, 2024, new user registrations are no longer accepted. Current users can continue using the service within the $20 monthly free allowance until the sunset date; however, no SLA is provided. Please consider using embedding APIs from model providers or open-source models to generate vector embeddings.</p>

</Admonition>

![pipeline-overview](/img/pipeline-overview.png)

## Understanding pipelines{#understanding-pipelines}

In many modern services and applications, there is a need to search by semantics. From searching for a chunk of text that matches the meaning of a query, to finding images that look similar to each other. A typical retrieval system that finishes such task are built with data preparation and embedding, a process of representing text or images as numerical vectors in a multi-dimensional space. Zilliz Cloud Pipelines empowers such use cases with a simple yet flexible interface.

Currently, we offer Pipelines for semantic search in texts, documents, and images, providing a critical building block of [Retrieval Augmented Generation (RAG) applications](https://github.com/milvus-io/bootcamp/blob/master/bootcamp/RAG/zilliz_pipeline_rag.ipynb). More Pipelines will be added in the future for more semantic search use cases, such as video frame search and multi-modal search.

There are three types of Piplines in Zilliz Cloud.

### Ingestion pipeline{#ingestion-pipeline}

Ingestion pipelines can process unstructured data into searchable vector embeddings and store them in Zilliz Cloud Vector Databases. 

An Ingestion pipeline contains several functions, each describing a transformation of some input field, such as generating vector embeddings for unstructured data (eg images, texts, documentation), and preserving some input value as additional information that can be retrieved during vector search.

<Admonition type="info" icon="📘" title="Notes">

<p>One Ingestion pipeline maps to exactly one <strong>vector database collection</strong> on Zilliz Cloud. </p>

</Admonition>

### Search pipeline{#search-pipeline}

A Search pipeline enables vector similarity search and semantic search by converting the input into an embedding vector and then retrieving the top-K most similar embedding vectors and relevant metadata. A Search pipeline allows only one type of function.

### Deletion pipeline{#deletion-pipeline}

A Deletion pipeline removes all specified entities from a collection. A Deletion pipeline allows only one type of function.

## Example: Building a RAG application with Pipelines{#example-building-a-rag-application-with-pipelines}

This [tutorial](https://github.com/milvus-io/bootcamp/blob/master/bootcamp/RAG/zilliz_pipeline_rag.ipynb) will demonstrate how to use Zilliz Cloud Pipelines to build a simple yet scalable [Retrieval Augmented Generation (RAG)](https://zilliz.com/use-cases/llm-retrieval-augmented-generation) application in Python. By providing a unified set of APIs, Zilliz Cloud Pipelines simplify the process of building an RAG application. You can skip the hassle of DevOps and accomplish everything with a simple API call. The figure below illustrates the main components of a basic RAG application.

![rag-application](/img/rag-application.png)

### Before you start{#before-you-start}

- Ensure you have [created a Free-tier cluster](./create-cluster#set-up-a-free-cluster) in Zilliz Cloud.

### Set up Zilliz Cloud Pipelines{#set-up-zilliz-cloud-pipelines}

#### Obtain cluster information{#obtain-cluster-information}

Obtain the necessary information about the created Free cluster, including cluster ID, cloud region, API key, and project ID. 

```bash
import os

CLOUD_REGION = 'gcp-us-west1'
CLUSTER_ID = 'your CLUSTER_ID'
API_KEY = 'your API_KEY'
PROJECT_ID = 'your PROJECT_ID'
```

#### Create an ingestion pipeline{#create-an-ingestion-pipeline}

Ingestion pipelines can transform unstructured data into searchable vector embeddings and store them in Zilliz Cloud Vector Database. In the Ingestion pipeline you can define the type of unstructured data to process by specifying the functions. Currently, Ingestion pipeline allows the following types of functions:

- `INDEX_TEXT`: This function is used to process texts. It converts each text to a vector embedding and maps an input field (`text_list`) to two output fields (`text`, `embedding`).

- `INDEX_DOC`: This function is used to process documents. It splits the input text document into chunks and generates a vector embedding for each chunk. This function maps an input field (`doc_url`) to four output fields (`doc_name`, `chunk_id`, `chunk_text`, and `embedding`) .

- `INDEX_IMAGE`: This function is used to process images. It generates the image embedding and maps two input fields (`image_url` and `image_id`) to two output fields (`image_id` and `embedding`) .

- `PRESERVE`: This function is used to store additional metadata as scalar field(s). These metadata typically include properties like document publisher info, tags, publication date etc.

In this tutorial, we will create an Ingestion pipeline with an `INDEX_TEXT` function and a `PRESERVE` function. As part of creating the Ingestion pipeline, a vector database collection named `my_text_collection` will be created in the cluster. It contains five fields:

- `id` as the auto-generated primary key for each entity

- `text`, `embedding` as defined in the `INDEX_TEXT` function

- `title` as defined in the `PRESERVE` function

```bash
import requests

headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

create_pipeline_url = f"https://controller.api.{CLOUD_REGION}.zillizcloud.com/v1/pipelines"

collection_name = 'my_text_collection'
embedding_service = "zilliz/bge-base-en-v1.5"

data = {
    "name": "my_ingestion_pipeline",
    "description": "A pipeline that generates text embeddings and stores title information.",
    "type": "INGESTION",
    "projectId": PROJECT_ID,
    "clusterId": CLUSTER_ID,
    "collectionName": collection_name,
    "functions": [
        {
            "name": "index_my_text",
            "action": "INDEX_TEXT",
            "language": "ENGLISH",
            "embedding": embedding_service
        },
        {
            "name": "title_info",
            "action": "PRESERVE",
            "inputField": "title",
            "outputField": "title",
            "fieldType": "VarChar"
        }
    ]
}

response = requests.post(create_pipeline_url, headers=headers, json=data)
print(response.json())
ingestion_pipe_id = response.json()["data"]["pipelineId"]
```

Upon successful creation, a pipeline ID will be returned. We will use this pipeline ID later when running the pipeline.

#### Create a search pipeline{#create-a-search-pipeline}

Search pipelines enables semantic search by converting a query string into a vector embedding and then retrieving top-K nearest neighbor vectors, each vector representing a chunk of ingested document and other preserved properties such as file name. Currently, Search pipeline allows the following types of functions:

- `SEARCH_DOC_CHUNK`: This function takes a user query as input and returns relevant doc chunks from the knowledge base.

- `SEARCH_TEXT`: This function takes a user query as input and returns relevant text entities from the knowledge base.

- `SEARCH_IMAGE`: This function takes an image url as input and returns entities of most similar images.

In this tutorial, we will adopt the `SEARCH_TEXT` function for text retrieval.

```bash
data = {
    "projectId": PROJECT_ID,
    "name": "my_search_pipeline",
    "description": "A pipeline that receives text and search for semantically similar texts.",
    "type": "SEARCH",
    "functions": [
        {
            "name": "search_text_and_title",
            "action": "SEARCH_TEXT",
            "embedding": embedding_service,
            "reranker": "zilliz/bge-reranker-base", # optional, this will rerank search results by the reranker service
            "clusterId": CLUSTER_ID,
            "collectionName": collection_name,
        }
    ]
}

response = requests.post(create_pipeline_url, headers=headers, json=data)

print(response.json())
search_pipe_id = response.json()["data"]["pipelineId"]
```

Similarly, upon successful creation, a pipeline ID will be returned. We will use this pipeline ID later when running the pipeline.

#### Run ingestion pipeline{#run-ingestion-pipeline}

In this tutorial, we will ingest the text pieces from the blog [What Milvus version to start with](https://milvus.io/blog/what-milvus-version-to-start-with.md).

```bash
run_pipeline_url = f"https://controller.api.{CLOUD_REGION}.zillizcloud.com/v1/pipelines/{ingestion_pipe_id}/run"

milvus_lite_data = {
    "data":
        {
            "text_list": [
                "As the name suggests, Milvus Lite is a lightweight version that integrates seamlessly with Google Colab and Jupyter Notebook. It is packaged as a single binary with no additional dependencies, making it easy to install and run on your machine or embed in Python applications. Additionally, Milvus Lite includes a CLI-based Milvus standalone server, providing flexibility for running it directly on your machine. Whether you embed it within your Python code or utilize it as a standalone server is entirely up to your preference and specific application requirements.",
                "Milvus Lite is ideal for rapid prototyping and local development, offering support for quick setup and experimentation with small-scale datasets on your machine. However, its limitations become apparent when transitioning to production environments with larger datasets and more demanding infrastructure requirements. As such, while Milvus Lite is an excellent tool for initial exploration and testing, it may not be suitable for deploying applications in high-volume or production-ready settings.",
                "Milvus Lite is perfect for prototyping on your laptop."
            ],
            "title": 'Milvus Lite'
        }
}

milvus_standalone_data = {
    "data":
        {
            "text_list": [
                "Milvus Standalone is a mode of operation for the Milvus vector database system where it operates independently as a single instance without any clustering or distributed setup. Milvus runs on a single server or machine in this mode, providing functionalities such as indexing and searching for vectors. It is suitable for situations where the data and traffic volume scale is relatively small and does not require the distributed capabilities provided by a clustered setup.",
                "Milvus Standalone offers high performance and flexibility for conducting vector searches on your datasets, making it suitable for smaller-scale deployments, CI/CD, and offline deployments when you have no Kubernetes support."
            ],
            "title": 'Milvus Standalone'
        }
}

milvus_cluster_data = {
    "data":
        {
            "text_list": [
                "Milvus Cluster is a mode of operation for the Milvus vector database system where it operates and is distributed across multiple nodes or servers. In this mode, Milvus instances are clustered together to form a unified system that can handle larger volumes of data and higher traffic loads compared to a standalone setup. Milvus Cluster offers scalability, fault tolerance, and load balancing features, making it suitable for scenarios that need to handle big data and serve many concurrent queries efficiently.",
                "Milvus Cluster provides unparalleled availability, scalability, and cost optimization for enterprise-grade workloads, making it the preferred choice for large-scale, highly available production environments."
            ],
            "title": 'Milvus Cluster'
        }
}

for data in [milvus_lite_data, milvus_standalone_data, milvus_cluster_data]:
    response = requests.post(run_pipeline_url, headers=headers, json=data)
    print(response.json())
```

Now we have successfully ingested the text pieces with corresponding titles and embeddings into the vector database. You can check the ingested data in the **Data Preview** tab of this collection (`my_text_collection`) on the [Zilliz Cloud web UI](https://cloud.zilliz.com/).

### Build a RAG application{#build-a-rag-application}

#### Run search pipeline{#run-search-pipeline}

```bash
import pprint

def retrieval_with_pipeline(question, search_pipe_id, top_k=2, verbose=False):
    run_pipeline_url = f"https://controller.api.{CLOUD_REGION}.zillizcloud.com/v1/pipelines/{search_pipe_id}/run"

    data = {
        "data": {
            "query_text": question
        },
        "params": {
            "limit": top_k,
            "offset": 0,
            "outputFields": [
                "text",
                "title"
            ],
            "filter": 'title == "Milvus Lite"'
        }
    }
    response = requests.post(run_pipeline_url, headers=headers, json=data)
    if verbose:
        pprint.pprint(response.json())
    results = response.json()["data"]["result"]
    retrieved_texts = [{'text': result['text'], 'title': result['title']} for result in results]
    return retrieved_texts

question = 'Which Milvus should I choose if I want to use in the jupyter notebook with a small scale of data?'
retrieval_with_pipeline(question, search_pipe_id, top_k=2, verbose=True)
```

In `params`, we specify to retrieve the top k results, filter only the article titled "Milvus Lite", and return only the `text` and `title` fields. For more information about the parameters of search pipeline running, you can refer to [here](/docs/pipelines-text-data#run-text-search-pipeline).

The following is the output.

```bash
{'code': 200,
 'data': {'result': [{'distance': 0.8722565174102783,
                      'id': 449431798276845977,
                      'text': 'As the name suggests, Milvus Lite is a '
                              'lightweight version that integrates seamlessly '
                              'with Google Colab and Jupyter Notebook. It is '
                              'packaged as a single binary with no additional '
                              'dependencies, making it easy to install and run '
                              'on your machine or embed in Python '
                              'applications. Additionally, Milvus Lite '
                              'includes a CLI-based Milvus standalone server, '
                              'providing flexibility for running it directly '
                              'on your machine. Whether you embed it within '
                              'your Python code or utilize it as a standalone '
                              'server is entirely up to your preference and '
                              'specific application requirements.',
                      'title': 'Milvus Lite'},
                     {'distance': 0.3541138172149658,
                      'id': 449431798276845978,
                      'text': 'Milvus Lite is ideal for rapid prototyping and '
                              'local development, offering support for quick '
                              'setup and experimentation with small-scale '
                              'datasets on your machine. However, its '
                              'limitations become apparent when transitioning '
                              'to production environments with larger datasets '
                              'and more demanding infrastructure requirements. '
                              'As such, while Milvus Lite is an excellent tool '
                              'for initial exploration and testing, it may not '
                              'be suitable for deploying applications in '
                              'high-volume or production-ready settings.',
                      'title': 'Milvus Lite'}],
          'token_usage': 34}}
Out[7]:
[{'text': 'As the name suggests, Milvus Lite is a lightweight version that integrates seamlessly with Google Colab and Jupyter Notebook. It is packaged as a single binary with no additional dependencies, making it easy to install and run on your machine or embed in Python applications. Additionally, Milvus Lite includes a CLI-based Milvus standalone server, providing flexibility for running it directly on your machine. Whether you embed it within your Python code or utilize it as a standalone server is entirely up to your preference and specific application requirements.',
  'title': 'Milvus Lite'},
 {'text': 'Milvus Lite is ideal for rapid prototyping and local development, offering support for quick setup and experimentation with small-scale datasets on your machine. However, its limitations become apparent when transitioning to production environments with larger datasets and more demanding infrastructure requirements. As such, while Milvus Lite is an excellent tool for initial exploration and testing, it may not be suitable for deploying applications in high-volume or production-ready settings.',
  'title': 'Milvus Lite'}]
```

We can see that when we ask a question and run the search pipeline, the top-K most similar knowledge fragments will be returned, which forms the basis for creating a RAG application.

#### Build a chatbot powered by RAG{#build-a-chatbot-powered-by-rag}

With the above convenient helper function `retrieval_with_pipeline`, we can retrieve the knowledge ingested into the vector database. Now let's build a simple RAG-enabled chatbot  that can answer user questions based on the knowledge base we just created. In this tutorial, we will use OpenAI `gpt-3.5-turbo` as the LLM. Please use your own OpenAI API key in the following code.

```bash
import os
from openai import OpenAI

client = OpenAI()
client.api_key = os.getenv('OPENAI_API_KEY')  # your OpenAI API key

class Chatbot:
    def __init__(self, search_pipe_id):
        self._search_pipe_id = search_pipe_id

    def retrieve(self, query: str) -> list:
        """
        Retrieve relevant text with Zilliz Cloud Pipelines.
        """
        results = retrieval_with_pipeline(query, self._search_pipe_id, top_k=2)
        return results

    def generate_answer(self, query: str, context_str: list) -> str:
        """
        Generate answer based on context, which is from the result of Search pipeline run.
        """
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            temperature=0,
            messages=
            [
                {"role": "user",
                 "content":
                     f"We have provided context information below. \n"
                     f"---------------------\n"
                     f"{context_str}"
                     f"\n---------------------\n"
                     f"Given this information, please answer the question: {query}"
                 }
            ]
        ).choices[0].message.content
        return completion

    def chat_with_rag(self, query: str) -> str:
        context_str = self.retrieve(query)
        completion = self.generate_answer(query, context_str)
        return completion

    def chat_without_rag(self, query: str) -> str:
        return client.chat.completions.create(
            model="gpt-3.5-turbo",
            temperature=0,
            messages=
            [
                {"role": "user",
                 "content": query
                 }
            ]
        ).choices[0].message.content

chatbot = Chatbot(search_pipe_id)
```

The code above creates a RAG-enabled chatbot that utilizes the search pipeline we just created to retrieve the most relevant text pieces from the knowledge base. Now let's see how it works.

#### Ask the chatbot a question{#ask-the-chatbot-a-question}

We ask the chatbot which Milvus version to use in Jupyter notebook if we have a small dataset.

```bash
question = 'Which Milvus should I choose if I want to use in the jupyter notebook with a small scale of data?'chatbot.chat_with_rag(question)
```

The answer we got is as follows.

```bash
Based on the context provided, you should choose Milvus Lite if you want to use it in a Jupyter Notebook with a small scale of data. Milvus Lite is specifically designed for rapid prototyping and local development, offering support for quick setup and experimentation with small-scale datasets on your machine. It is lightweight, easy to install, and integrates seamlessly with Google Colab and Jupyter Notebook.
```

The original text from the knowledge base is follows:

```bash
As the name suggests, Milvus Lite is a lightweight version that integrates seamlessly with Google Colab and Jupyter Notebook. It is packaged as a single binary with no additional dependencies, making it easy to install and run on your machine or embed in Python applications. Additionally, Milvus Lite includes a CLI-based Milvus standalone server, providing flexibility for running it directly on your machine. Whether you embed it within your Python code or utilize it as a standalone server is entirely up to your preference and specific application requirements.
```

After comparing the text piece in the knowledge base and the answer we got, we can see that the RAG-enabled chatbot has provided a perfect answer with domain knowledge to our question.

Now let's try asking the chatbot with the same question but without the RAG capabilities.

```bash
chatbot.chat_without_rag(question)
```

We get the following answer.

```bash
If you are working with a small scale of data in a Jupyter notebook, you may want to consider using Milvus CE (Community Edition). Milvus CE is a free and open-source vector database that is suitable for small-scale projects and experimentation. It is easy to set up and use in a Jupyter notebook environment, making it a good choice for beginners or those working with limited data. Additionally, Milvus CE offers a range of features and functionalities that can help you efficiently store and query your data in a vectorized format.
```

Clearly, this time, the chatbot is not infused with domain knowledge and [hallucinates](https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence).

### Conclusion{#conclusion}

We have successfully built an RAG-enabled chatbot that is infused with domain knowledge and provide accurate answers to user questions. 

