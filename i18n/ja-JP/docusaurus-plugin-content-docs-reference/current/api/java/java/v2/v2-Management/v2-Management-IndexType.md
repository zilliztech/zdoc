---
title: "IndexType | Java | v2"
slug: /java/java/v2-Management-IndexType
sidebar_label: "IndexType"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "以下の定数を提供する列挙型です。 | Java | v2"
type: docx
token: RcJhdfB29okLpcx3w8KcvcL7nU9
sidebar_position: 11
keywords: 
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
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

これは、以下の定数を提供する列挙型です。

## Constants\{#constants}

### FLAT\{#flat}

index type を FLAT に設定します。

### IVF_FLAT\{#ivfflat}

index type を IVF_FLAT に設定します。

### IVF_SQ8\{#ivfsq8}

index type を IVF_SQ8 に設定します。

### IVF_PQ\{#ivfpq}

index type を IVF_PQ に設定します。

### HNSW\{#hnsw}

index type を HNSW に設定します。

### HNSW_SQ\{#hnswsq}

index type を HNSW に設定します。

### HNSW_PQ\{#hnswpq}

index type を HNSW_PQ に設定します。

### HNSW_PRQ\{#hnswprq}

index type を HNSW_PRQ に設定します。

### DISKANN\{#diskann}

index type を DISKANN に設定します。

### AUTOINDEX\{#autoindex}

index type を AUTOINDEX に設定します。

### SCANN\{#scann}

index type を SCANN に設定します。

### IVF_RABITQ\{#ivfrabitq}

index type を IVF_RABITQ に設定します。これは dense float vector に適用されます。

### AISAQ\{#aisaq}

index type を AISAQ に設定します。これは GPU 上の dense float vector に適用されます。

### GPU_IVF_FLAT\{#gpuivfflat}

index type を GPU_IVF_FLAT に設定します。これは GPU index にのみ適用されます。

### GPU_IVF_PQ\{#gpuivfpq}

index type を GPU_IVF_PQ に設定します。これは GPU index にのみ適用されます。

### GPU_BRUTE_FORCE\{#gpubruteforce}

index type を GPU_BRUTE_FORCE に設定します。これは GPU index にのみ適用されます。

### GPU_CAGRA\{#gpucagra}

index type を GPU_CAGRA に設定します。これは GPU index にのみ適用されます。

### BIN_FLAT\{#binflat}

index type を BIN_FLAT に設定します。これは binary vector にのみ適用されます。

### BIN_IVF_FLAT\{#binivfflat}

index type を BIN_IVF_FLAT に設定します。これは binary vector にのみ適用されます。

### MINHASH_LSH\{#minhashlsh}

index type を MINHASH_LSH に設定します。これは binary vector にのみ適用されます。

### TRIE("Trie")\{#trietrie}

index type を TRIE に設定します。これは VarChar field にのみ適用されます。

### NGRAM\{#ngram}

index type を NGRAM に設定します。これは VarChar field および JSON Path index に適用されます。

### RTREE\{#rtree}

index type を RTREE に設定します。これは geometry field にのみ適用されます。

### STL_SORT\{#stlsort}

index type を SLT_SORT に設定します。これは数値型の field にのみ適用されます。

### INVERTED\{#inverted}

index type を INVERTED に設定します。これは JSON field を除くすべての scalar field に適用されます。

### BITMAP\{#bitmap}

index type を BITMAP に設定します。これは JSON、FLOAT、DOUBLE field を除くすべての scalar field に適用されます。

### SPARSE_INVERTED_INDEX\{#sparseinvertedindex}

index type を SPARSE_INVERTED_INDEX に設定します。これは sparse vector にのみ適用されます。

### SPARSE_WAND\{#sparsewand}

index type を SPARSE_WAND に設定します。これは sparse vector にのみ適用されます。

### EMB_LIST_HNSW\{#emblisthnsw}

index type を EMB_LIST_HNSW に設定します。これは Array of Structs field に適用されます。
