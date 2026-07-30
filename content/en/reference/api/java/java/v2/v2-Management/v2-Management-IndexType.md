---
title: "IndexType | Java | v2"
slug: /java/java/v2-Management-IndexType
sidebar_label: "IndexType"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This is an enumeration that provides the following constants. | Java | v2"
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

This is an enumeration that provides the following constants.

## Constants\{#constants}

### FLAT\{#flat}

Sets the index type to FLAT.

### IVF_FLAT\{#ivfflat}

Sets the index type to IVF_FLAT.

### IVF_SQ8\{#ivfsq8}

Sets the index type to IVF_SQ8.

### IVF_PQ\{#ivfpq}

Sets the index type to IVF_PQ.

### HNSW\{#hnsw}

Sets the index type to HNSW.

### HNSW_SQ\{#hnswsq}

Sets the index type to HNSW.

### HNSW_PQ\{#hnswpq}

Sets the index type to HNSW_PQ.

### HNSW_PRQ\{#hnswprq}

Sets the index type to HNSW_PRQ.

### DISKANN\{#diskann}

Sets the index type to DISKANN.

### AUTOINDEX\{#autoindex}

Sets the index type to AUTOINDEX.

### SCANN\{#scann}

Sets the index type to SCANN.

### IVF_RABITQ\{#ivfrabitq}

Sets the index type to IVF_RABITQ. This applies to dense float vectors.

### AISAQ\{#aisaq}

Sets the index type to AISAQ. This applies to dense float vectors on GPU.

### GPU_IVF_FLAT\{#gpuivfflat}

Sets the index type to GPU_IVF_FLAT. This applies to GPU indexes only.

### GPU_IVF_PQ\{#gpuivfpq}

Sets the index type to GPU_IVF_PQ. This applies to GPU indexes only.

### GPU_BRUTE_FORCE\{#gpubruteforce}

Sets the index type to GPU_BRUTE_FORCE. This applies to GPU indexes only.

### GPU_CAGRA\{#gpucagra}

Sets the index type to GPU_CAGRA. This applies to GPU indexes only.

### BIN_FLAT\{#binflat}

Sets the index type to BIN_FLAT. This applies to binary vectors only.

### BIN_IVF_FLAT\{#binivfflat}

Sets the index type to BIN_IVF_FLAT. This applies to binary vectors only.

### MINHASH_LSH\{#minhashlsh}

Sets the index type to MINHASH_LSH. This applies to binary vectors only.

### TRIE("Trie")\{#trietrie}

Sets the index type to TRIE. This applies to VarChar fields only.

### NGRAM\{#ngram}

Sets the index type to NGRAM. This applies to VarChar fields and JSON Path indexes.

### RTREE\{#rtree}

Sets the index type to RTREE. This applies to geometry fields only.

### STL_SORT\{#stlsort}

Sets the index type to SLT_SORT. This applies to fields of numeric types only.

### INVERTED\{#inverted}

Sets the index type to INVERTED. This applies to all scalar fields except JSON fields.

### BITMAP\{#bitmap}

Sets the index type to BITMAP. This applies to all scalar fields except JSON, FLOAT, and DOUBLE fields.

### SPARSE_INVERTED_INDEX\{#sparseinvertedindex}

Sets the index type to SPARSE_INVERTED_INDEX. This applies to sparse vectors only.

### SPARSE_WAND\{#sparsewand}

Sets the index type to SPARSE_WAND. This applies to sparse vectors only.

### EMB_LIST_HNSW\{#emblisthnsw}

Sets the index type to EMB_LIST_HNSW. This applies to an Array of Structs field.