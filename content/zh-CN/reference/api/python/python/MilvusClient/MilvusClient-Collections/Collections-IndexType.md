---
title: "IndexType | Python | MilvusClient"
slug: /python/python/Collections-IndexType
sidebar_label: "IndexType"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "这是一个提供以下常量的枚举。 | Python | MilvusClient"
type: docx
token: SlrCd1GEbooMh2xLylZc6Oirnrc
sidebar_position: 15
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - IndexType
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# IndexType

这是一个提供以下常量的枚举。

## 常量\{#constants}

- GPU_BRUTE_FORCE

    将索引类型设置为 **GPU_BRUTE_FORCE**。这仅适用于 GPU 索引。

- GPU_IVF_FLAT

    将索引类型设置为 **GPU_IVF_FLAT**。这仅适用于 GPU 索引。

- GPU_IVF_PQ

    将索引类型设置为 **GPU_IVF_PQ**。这仅适用于 GPU 索引。

- GPU_CAGRA

    将索引类型设置为 **GPU_CAGRA**。这仅适用于 GPU 索引。

- FLAT

    将索引类型设置为 **FLAT**。

- IVF_FLAT

    将索引类型设置为 **IVF_FLAT**。

- IVF_PQ

    将索引类型设置为 **IVF_PQ**。

- SCANN

    将索引类型设置为 **SCANN**。

- IVF_SQ8

    将索引类型设置为 **IVF_SQ8**。

- IVF_RABITQ

    将索引类型设置为 **IVF_RABITQ**。

- BIN_FLAT

    将索引类型设置为 **BIN_FLAT**。这仅适用于二进制向量。

- BIN_IVF_FLAT

    将索引类型设置为 **BIN_IVF_FLAT**。这仅适用于二进制向量。

- HNSW

    将索引类型设置为 **HNSW**。

- HNSW_SQ

    将索引类型设置为 **HNSW_SQ**。

- HNSW_PQ

    将索引类型设置为 **HNSW_PQ**。

- HNSW_PRQ

    将索引类型设置为 **HNSW_PRQ**。

- DISKANN

    将索引类型设置为 **DISKANN**。

- SPARSE_INVERTED_INDEX

    将索引类型设置为 **SPARSE_INVERTED_INDEX**。这仅适用于稀疏向量。

- SPARSE_WAND

    将索引类型设置为 **SPARSE_WAND**。这仅适用于稀疏向量。

- INVERTED

    将索引类型设置为 **INVERTED**。这仅适用于标量字段。

- STL_SORT

    将索引类型设置为 **STL_SORT**。这仅适用于标量字段。

- TRIE / Trie

    将索引类型设置为 **TRIE**。这仅适用于 VarChar 标量字段。

- AUTOINDEX

    将索引类型设置为 **AUTOINDEX**。
