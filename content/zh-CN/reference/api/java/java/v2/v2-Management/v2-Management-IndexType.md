---
title: "IndexType | Java | v2"
slug: /java/java/v2-Management-IndexType
sidebar_label: "IndexType"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "这是一个提供以下常量的枚举。 | Java | v2"
type: docx
token: RcJhdfB29okLpcx3w8KcvcL7nU9
sidebar_position: 11
keywords: 
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - IndexType
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# IndexType

这是一个提供以下常量的枚举。

## 常量\{#constants}

### FLAT\{#flat}

将索引类型设置为 FLAT。

### IVF_FLAT\{#ivfflat}

将索引类型设置为 IVF_FLAT。

### IVF_SQ8\{#ivfsq8}

将索引类型设置为 IVF_SQ8。

### IVF_PQ\{#ivfpq}

将索引类型设置为 IVF_PQ。

### HNSW\{#hnsw}

将索引类型设置为 HNSW。

### HNSW_SQ\{#hnswsq}

将索引类型设置为 HNSW。

### HNSW_PQ\{#hnswpq}

将索引类型设置为 HNSW_PQ。

### HNSW_PRQ\{#hnswprq}

将索引类型设置为 HNSW_PRQ。

### DISKANN\{#diskann}

将索引类型设置为 DISKANN。

### AUTOINDEX\{#autoindex}

将索引类型设置为 AUTOINDEX。

### SCANN\{#scann}

将索引类型设置为 SCANN。

### IVF_RABITQ\{#ivfrabitq}

将索引类型设置为 IVF_RABITQ。适用于稠密浮点向量。

### AISAQ\{#aisaq}

将索引类型设置为 AISAQ。适用于 GPU 上的稠密浮点向量。

### GPU_IVF_FLAT\{#gpuivfflat}

将索引类型设置为 GPU_IVF_FLAT。仅适用于 GPU 索引。

### GPU_IVF_PQ\{#gpuivfpq}

将索引类型设置为 GPU_IVF_PQ。仅适用于 GPU 索引。

### GPU_BRUTE_FORCE\{#gpubruteforce}

将索引类型设置为 GPU_BRUTE_FORCE。仅适用于 GPU 索引。

### GPU_CAGRA\{#gpucagra}

将索引类型设置为 GPU_CAGRA。仅适用于 GPU 索引。

### BIN_FLAT\{#binflat}

将索引类型设置为 BIN_FLAT。仅适用于二进制向量。

### BIN_IVF_FLAT\{#binivfflat}

将索引类型设置为 BIN_IVF_FLAT。仅适用于二进制向量。

### MINHASH_LSH\{#minhashlsh}

将索引类型设置为 MINHASH_LSH。仅适用于二进制向量。

### TRIE("Trie")\{#trietrie}

将索引类型设置为 TRIE。仅适用于 VarChar 字段。

### NGRAM\{#ngram}

将索引类型设置为 NGRAM。适用于 VarChar 字段和 JSON Path 索引。

### RTREE\{#rtree}

将索引类型设置为 RTREE。仅适用于几何字段。

### STL_SORT\{#stlsort}

将索引类型设置为 SLT_SORT。仅适用于数值类型字段。

### INVERTED\{#inverted}

将索引类型设置为 INVERTED。适用于除 JSON 字段之外的所有标量字段。

### BITMAP\{#bitmap}

将索引类型设置为 BITMAP。适用于除 JSON、FLOAT 和 DOUBLE 字段之外的所有标量字段。

### SPARSE_INVERTED_INDEX\{#sparseinvertedindex}

将索引类型设置为 SPARSE_INVERTED_INDEX。仅适用于稀疏向量。

### SPARSE_WAND\{#sparsewand}

将索引类型设置为 SPARSE_WAND。仅适用于稀疏向量。

### EMB_LIST_HNSW\{#emblisthnsw}

将索引类型设置为 EMB_LIST_HNSW。适用于 Array of Structs 字段。
