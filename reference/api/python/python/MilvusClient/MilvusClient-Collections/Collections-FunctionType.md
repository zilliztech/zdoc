---
title: "FunctionType | Python | MilvusClient"
slug: /python/python/Collections-FunctionType
sidebar_key: python/Collections-FunctionType
sidebar_label: "FunctionType"
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
beta: false
notebook: false
description: "This is an enumeration that provides the following constants. | Python | MilvusClient"
type: docx
token: IU0idURLBoJNlZxgkiUcQaOYnIf
sidebar_position: 19
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionType
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# FunctionType

This is an enumeration that provides the following constants.

## Constants\{#constants}

- BM25 = 1

    Sets the function type to BM25. This indicates that Milvus will utilize the BM25 algorithm to generate sparse embeddings for a designated VARCHAR or TEXT field.

- TEXTEMBEDDING = 2

    Sets the function type to TEXTEMBEDDING. This indicates that Milvus will transform raw text data from a VARCHAR or TEXT field into vector embeddings by automatically calling external model providers.

- RERANK = 3

    Sets the function type to **RERANK**. This indicates that Milvus will use a ranker to rerank candidates for improved search performance.