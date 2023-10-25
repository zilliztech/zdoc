---
slug: /question-answering-over-documents-with-zilliz-cloud-and-langchain
beta: FALSE
notebook: 83_integrations_langchain.ipynb
sidebar_position: 4
---



# Question Answering over Documents with Zilliz Cloud and LangChain

This guide demonstrates how to build an LLM-driven question-answering application using Zilliz Cloud and LangChain.

For this example, we will use a 1 CU cluster and the OpenAI embedding API to embed texts. Let's get started!

## Before you start{#before-you-start}

Code snippets on this page require **pymilvus** and **langchain** to be installed. Additionally, OpenAI's embedding API has been used to embed documents into the vector store, so **openai** and **tiktoken** are also required. If these packages are not already installed on your system, run the following commands to install them.

```bash
python -m pip install --upgrade pymilvus langchain openai tiktoken
```

## Parameters{#parameters}

This section outlines the necessary steps to set up parameters for the code snippets that follow. Replace the default values with your own.

```python
from os import environ

ZILLIZ_ENDPOINT = "https://<instance-id>.<cloud-region-id>.vectordb.zillizcloud.com:19535" # example: "in01-17f69c292d4a50a.aws-us-west-2.vectordb.zillizcloud.com"
ZILLIZ_USER = "db_admin" # cluster user name
ZILLIZ_PASS = "**" # password of the above cluster user
OPENAI_API_KEY = "sk-**" # OpenAI API key, example: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

## Set up environment variables
environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

## Prepare data{#prepare-data}

Before diving in, complete the following steps:

- Prepare the documents that you want the LLM to consider during inference.

- Set up an embedding model to convert documents into vector embeddings.

- Set up a vector store to save the vector embeddings.

```python
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Zilliz Cloud
from langchain.document_loaders import WebBaseLoader
from langchain.text_splitter import CharacterTextSplitter

# Use the WebBaseLoader to load specified web pages into documents
loader = WebBaseLoader([
    "<https://milvus.io/docs/overview.md>",
])

docs = loader.load()

# Split the documents into smaller chunks
text_splitter = CharacterTextSplitter(chunk_size=1024, chunk_overlap=0)
docs = text_splitter.split_documents(docs)
```

The output of the text splitter would be similar to the following:

```bash
Created a chunk of size 1745, which is longer than the specified 1024
Created a chunk of size 1278, which is longer than the specified 1024
```

After preparing the documents, the next step is to convert them into vector embeddings and save them in the vector store.

```python
# Set up an embedding model to covert documents into vector embeddings
embeddings = OpenAIEmbeddings(model="ada")

# Set up a vector store used to save the vector embeddings. Here we use Milvus as the vector store
vector_store = Zilliz.from_documents(
    docs,
    embedding=embeddings,
    connection_args={"uri": ZILLIZ_ENDPOINT, "user": ZILLIZ_USER, "password": ZILLIZ_PASS, "secure": True}
)
```

To perform text-to-text similarity searches, use the following code snippet. The results will return the most relevant text in the document to the queries.

```python
query = "What is milvus?"
docs = vector_store.similarity_search(query)

print(docs)
```

The output should be similar to the following:

```python
[Document(page_content='Milvus workflow.', metadata={'source': '<https://milvus.io/docs/overview.md>', 'title': 'Introduction Milvus documentation', 'description': 'Milvus is an open-source vector database designed specifically for AI application development, embeddings similarity search, and MLOps v2.2.x.', 'language': 'en'}), Document(page_content="Installat...rved.", metadata={'source': '<https://milvus.io/docs/overview.md>', 'title': 'Introduction Milvus documentation', 'description': 'Milvus is an open-source vector database designed specifically for AI application development, embeddings similarity search, and MLOps v2.2.x.', 'language': 'en'}), Document(page_content='Introduction ... Milvus is able to analyze the correlation between two vectors by calculating their similarity distance. If the two embedding vectors are very similar, it means that the original data sources are similar as well.', metadata={'source': '<https://milvus.io/docs/overview.md>', 'title': 'Introduction Milvus documentation', 'description': 'Milvus is an open-source vector database designed specifically for AI application development, embeddings similarity search, and MLOps v2.2.x.', 'language': 'en'}), Document(page_content="Key concepts\\n...search algorithms are used to accelerate the searching process. If the two embedding vectors are very similar, it means that the original data sources are similar as well.\\nWhy Milvus?", metadata={'source': '<https://milvus.io/docs/overview.md>', 'title': 'Introduction Milvus documentation', 'description': 'Milvus is an open-source vector database designed specifically for AI application development, embeddings similarity search, and MLOps v2.2.x.', 'language': 'en'})]
```

## Ask your question{#ask-your-question}

After preparing the documents, you can set up a chain to include them in a prompt. This will allow LLM to use the docs as a reference when preparing answers.

:::info Notes

LangChain offers four types of chains for question-answering with sources: **stuff**, **map_reduce**, **refine**, and **map-rerank**.

In simple terms, a **stuff** chain includes the document as a whole, which is only suitable for small documents. As most LLMs have restrictions on the maximum number of tokens a prompt can contain, it is recommended to use the other three types of chains. These chains split the input document into smaller pieces and feed them to the LLM in different ways. For more information, refer to the [Index-related chains](https://docs.langchain.com/docs/components/chains/index_related_chains) section in LangChain's documentation.

:::

The following code snippet sets up a chain using OpenAI as the LLM and **map-reduce** the chain type.

```python
from langchain.chains.qa_with_sources import load_qa_with_sources_chain
from langchain.llms import OpenAI

chain = load_qa_with_sources_chain(OpenAI(temperature=0), chain_type="map_reduce", return_intermediate_steps=True)
query = "When was milvus created?"
chain({"input_documents": docs, "question": query}, return_only_outputs=True)
```

The returned results include both the **intermediate_steps** and **output_text**. The former indicates what documents it refers to during the search, and the latter is the final answer to the question.

```python
{'intermediate_steps': [' No relevant text.',
  ' Milvus was created in 2019 with a singular goal: store, index, and manage massive embedding vectors generated by deep neural networks and other machine learning (ML) models.',
  ' Milvus. 2023 All rights reserved.',
  ' None'],
 'output_text': ' Milvus was created in 2019.\\nSOURCES: <https://milvus.io/docs/overview.md>'}
```

## Related integrations{#related-integrations}

- [Similarity Search with Zilliz Cloud and OpenAI](./similarity-search-with-zilliz-cloud-and-openai) 

- [Question Answering Using Zilliz Cloud and HuggingFace](./question-answering-using-zilliz-cloud-and-hugging-face) 

- [Question Answering Using Zilliz Cloud and Cohere](./question-answering-using-zilliz-cloud-and-cohere) 

- [Image Search with Zilliz Cloud and PyTorch](./image-search-with-zilliz-cloud-and-pytorch) 

- [Documentation QA using Zilliz Cloud and LlamaIndex](./undefined) 

- [Movie Search Using Zilliz Cloud and SentenceTransformers](./movie-search-using-zilliz-cloud-and-sentencetransformers) 
