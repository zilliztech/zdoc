---
title: "IndexType | Java | v2"
slug: /java/java/v2-Management-IndexType
sidebar_label: "IndexType"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "IndexType インスタンスは列挙定数です。この列挙には、以下の定数が用意されています。 | Java | v2"
type: docx
token: Zh6adGbCBoqXsPxnvGXcfrMwnhc
sidebar_position: 11
keywords: 
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - zilliz
  - zilliz cloud
  - クラウド
  - IndexType
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# IndexType

IndexType インスタンスは列挙定数です。この列挙には、以下の定数が用意されています。

## 定数\{#constants}

### FLAT\{#flat}

インデックスタイプを FLAT に設定します。

### IVF_FLAT\{#ivfflat}

インデックスタイプを IVF_FLAT に設定します。

### IVF_SQ8\{#ivfsq8}

インデックスタイプを IVF_SQ8 に設定します。

### IVF_PQ\{#ivfpq}

インデックスタイプを IVF_PQ に設定します。

### HNSW\{#hnsw}

インデックスタイプを HNSW に設定します。

### HNSW_SQ\{#hnswsq}

インデックスタイプを HNSW に設定します。

### HNSW_PQ\{#hnswpq}

インデックスタイプを HNSW_PQ に設定します。

### HNSW_PRQ\{#hnswprq}

インデックスタイプを HNSW_PRQ に設定します。

### DISKANN\{#diskann}

インデックスタイプを DISKANN に設定します。

### AUTOINDEX\{#autoindex}

インデックスタイプを AUTOINDEX に設定します。

### SCANN\{#scann}

インデックスタイプを SCANN に設定します。

### IVF_RABITQ\{#ivfrabitq}

インデックスタイプを IVF_RABITQ に設定します。これは密な float ベクトルに適用されます。

### AISAQ\{#aisaq}

インデックスタイプを AISAQ に設定します。これは GPU 上の密な float ベクトルに適用されます。

### GPU_IVF_FLAT\{#gpuivfflat}

インデックスタイプを GPU_IVF_FLAT に設定します。これは GPU インデックスにのみ適用されます。

### GPU_IVF_PQ\{#gpuivfpq}

インデックスタイプを GPU_IVF_PQ に設定します。これは GPU インデックスにのみ適用されます。

### GPU_BRUTE_FORCE\{#gpubruteforce}

インデックスタイプを GPU_BRUTE_FORCE に設定します。これは GPU インデックスにのみ適用されます。

### GPU_CAGRA\{#gpucagra}

インデックスタイプを GPU_CAGRA に設定します。これは GPU インデックスにのみ適用されます。

### BIN_FLAT\{#binflat}

インデックスタイプを BIN_FLAT に設定します。これはバイナリベクトルにのみ適用されます。

### BIN_IVF_FLAT\{#binivfflat}

インデックスタイプを BIN_IVF_FLAT に設定します。これはバイナリベクトルにのみ適用されます。

### MINHASH_LSH\{#minhashlsh}

インデックスタイプを MINHASH_LSH に設定します。これはバイナリベクトルにのみ適用されます。

### TRIE("Trie")\{#trietrie}

インデックスタイプを TRIE に設定します。これは VarChar フィールドにのみ適用されます。

### NGRAM\{#ngram}

インデックスタイプを NGRAM に設定します。これは VarChar フィールドと JSON Path インデックスに適用されます。

### FMINDEX\{#fmindex}

インデックスタイプを FMINDEX に設定します。これは VarChar フィールドに適用されます。アンカー付き LIKE クエリ (prefix/infix/suffix) に、候補の再チェックなしで応答する正確なバイトレベルの部分文字列インデックスです。

### RTREE\{#rtree}

インデックスタイプを RTREE に設定します。これはジオメトリフィールドにのみ適用されます。

### STL_SORT\{#stlsort}

インデックスタイプを SLT_SORT に設定します。これは数値型のフィールドにのみ適用されます。

### INVERTED\{#inverted}

インデックスタイプを INVERTED に設定します。これは JSON フィールドを除くすべてのスカラーフィールドに適用されます。

### BITMAP\{#bitmap}

インデックスタイプを BITMAP に設定します。これは JSON、FLOAT、DOUBLE フィールドを除くすべてのスカラーフィールドに適用されます。

### SPARSE_INVERTED_INDEX\{#sparseinvertedindex}

インデックスタイプを SPARSE_INVERTED_INDEX に設定します。これは疎ベクトルにのみ適用されます。

### SPARSE_WAND\{#sparsewand}

インデックスタイプを SPARSE_WAND に設定します。これは疎ベクトルにのみ適用されます。

### EMB_LIST_HNSW\{#emblisthnsw}

インデックスタイプを EMB_LIST_HNSW に設定します。これは Struct の配列フィールドに適用されます。
