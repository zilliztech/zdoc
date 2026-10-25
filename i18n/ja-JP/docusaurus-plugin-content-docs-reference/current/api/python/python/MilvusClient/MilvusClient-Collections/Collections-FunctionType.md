---
title: "FunctionType | Python | MilvusClient"
slug: /python/python/Collections-FunctionType
sidebar_label: "FunctionType"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "これは、以下の定数を提供する列挙型です。 | Python | MilvusClient"
type: docx
token: IU0idURLBoJNlZxgkiUcQaOYnIf
sidebar_position: 19
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense ベクトル
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

これは、以下の定数を提供する列挙型です。

## Constants\{#constants}

- BM25 = 1

    関数タイプを BM25 に設定します。これは、Milvus が指定された VARCHAR または TEXT フィールドに対して、BM25 アルゴリズムを使用して sparse embeddings を生成することを示します。

- TEXTEMBEDDING = 2

    Sets the function type to TEXTEMBEDDING. This indicates that Milvus will transform raw text data from a VARCHAR or TEXT field into ベクトル embeddings by automatically calling external model providers.

- RERANK = 3

    関数タイプを **RERANK** に設定します。これは、Milvus が検索パフォーマンス向上のために ranker を使用して候補を再ランキングすることを示します。
