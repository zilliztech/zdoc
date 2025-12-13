---
title: "FunctionType | Python | MilvusClient"
slug: /python/python/Collections-FunctionType
sidebar_label: "FunctionType"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This is an enumeration that provides the following constants. | Python | MilvusClient"
type: docx
token: Y2prdJqs9oEOyax1S9acKecan8e
sidebar_position: 19
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionType
  - pymilvus26
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FunctionType

This is an enumeration that provides the following constants.

## Constants\{#constants}

-  BM25 = 1

    Sets the function type to **BM25**. This indicates that Milvus will utilize the BM25 algorithm to generate sparse embeddings for a designated `VARCHAR` field.

- TEXTEMBEDDING = 2

    Sets the function type to **TEXTEMBEDDING**. This indicates that Milvus will transform raw text data into vector embeddings by automatically calling external model providers.

- RERANK = 3

    Sets the function type to **RERANK**. This indicates that Milvus will use a ranker to rerank candidates for improved search performance.