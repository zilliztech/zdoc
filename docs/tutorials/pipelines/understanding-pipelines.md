---
slug: /understanding-pipelines
beta: TRUE
notebook: FALSE
token: Z2MUw8RaRiwlm4kGXAGcI6ybnFA
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Understanding Pipelines

Zilliz Cloud Pipelines is a robust solution for transforming unstructured data such as documents, text pieces and images into a searchable vector [collection](./cluster-collection-and-entities#collection). This guide provides a detailed description of the three main Pipelines types and their functions.

![pipeline-overview](/img/pipeline-overview.png)

## Overview{#overview}

In many modern services and applications, there is a need to search by semantics. From searching for a chunk of text that matches the meaning of a query, to finding images that look similar to each other. A typical retrieval system that finishes such task are built with data preparation and embedding, a process of representing text or images as numerical vectors in a multi-dimensional space. It requires deep know-how and engineering speciality to build such systems. Zilliz Cloud Pipelines empowers such use cases with a simple yet flexible interface.

Currently, we offer Pipelines for semantic search in text documents, providing a critical building block of [Retrieval Augmented Generation (RAG) applications](https://github.com/milvus-io/bootcamp/blob/master/bootcamp/RAG/zilliz_pipeline_rag.ipynb). More Pipelines will be added in the future for more semantic search use cases, such as image search, video frame search and multi-modal search.

## Ingestion pipelines{#ingestion-pipelines}

Ingestion pipelines can process unstructured data into searchable vector embeddings and store them in Zilliz Cloud Vector Databases. 

An Ingestion pipeline contains several functions, each describing a transformation of some input field, such as generating vector embeddings for auto-splitted chunks of the input document, or preserving some input value as additional information that can be retrieved during vector search.

One Ingestion pipeline maps to exactly one Vector Database collection on Zilliz Cloud. As part of creating the Ingestion pipeline, the collection will be automatically created with the schema inferred from the functions.

Ingestion pipeline allows two types of functions.

### INDEX_DOC function{#indexdoc-function}

The INDEX_DOC function splits the input text document into chunks and generates a vector embedding for each chunk. This function maps an input field (`doc_url`) to four output fields (`doc_name`, `chunk_id`, `chunk_text`, and `embedding`) as the scalar and vector fields of the auto-generated collection. The field names cannot be changed.

<Admonition type="info" icon="📘" title="Notes">

An Ingestion pipeline requires one and only one INDEX_DOC function.

</Admonition>

### PRESERVE function{#preserve-function}

The PRESERVE function stores user-defined input fields as additional scalar fields in the auto-generated collection for storing metadata. You can use PRESERVE functions to preserve the metadata of your documents. A single PRESERVE function preserves one field, and up to five PRESERVE functions can be added to one Ingestion pipeline.

### Example: creating a knowledge base{#example-creating-a-knowledge-base}

If you have documents and metadata such as author, publish date. You can use the Ingestion pipeline to easily build a knowledge base that supports vector similarity search. The text chunks from the documents, together with its vector embedding and associated metadata will be kept in vector database.

![ingestion-pipeline](/img/ingestion-pipeline.png)

## Search pipelines{#search-pipelines}

A Search pipeline enables semantic search by converting a query string into a vector embedding and then retrieving top-K similar vectors with its corresponding text and other metadata. A Search pipeline allows one type of function.

### SEARCH_DOC_CHUNK function{#searchdocchunk-function}

This function converts query text into vector embeddings and retrieves the top-K most relevant document chunks.

### Example: retrieving the most relevant entities{#example-retrieving-the-most-relevant-entities}

If you have a collection managed by an Ingestion pipeline, you can use Search pipeline to retrieve the top-K most relevant chunks and their associated information.

![search-pipeline](/img/search-pipeline.png)

## Deletion pipelines{#deletion-pipelines}

A Deletion pipeline removes all chunks in a specified document from a collection. A Deletion pipeline allows one type of function.

### PURGE_DOC_INDEX function{#purgedocindex-function}

This function deletes all document chunks with the specified `doc_name`, effectively removing the entire document.

### Example: Easily purge all data of a document{#example-easily-purge-all-data-of-a-document}

For a collection managed by Ingestion pipeline, deleting all entities (each with a single doc chunk) of a document is made easy with a Deletion pipeline. Simply create a Deletion pipeline and run it with a doc_name specified. All chunks of that doc will be purged.

![deletion-pipeline](/img/deletion-pipeline.png)

## Related topics{#related-topics}

- [[WIP] Create Ingestion Pipeline](./create-ingestion-piplines)

- [[WIP] Create Search Pipeline](./create-search-piplines)

- [[WIP] Create Deletion Pipeline](./create-deletion-pipelines)

- [FAQs](./faqs#faq-pipelines) 

