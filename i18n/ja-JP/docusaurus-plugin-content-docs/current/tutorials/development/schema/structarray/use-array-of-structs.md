---
title: "StructArray の概要 | Cloud"
slug: /use-array-of-structs
sidebar_label: "概要"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "1 つの entity に多くの chunk を持つ 1 つの document、1 つの page に多くの visual patch を持つ場合、または 1 つの video に多くの clip を持つ場合など、1 つの entity が構造化された要素の順序付きリストを保存する必要があるときは StructArray を使用します。StructArray はこれらの要素を親 entity の内部に保持しながら、各要素内の field に対する vector search と scalar filtering も可能にします。 | Cloud"
type: origin
token: VlAlwAJvEiVVW6k0RBvcvkpWnhK
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# StructArray の概要

1 つの entity が構造化された要素の順序付きリストを保存する必要があるときは StructArray を使用します。たとえば、1 つの document に多くの chunk がある場合、1 つの page に多くの visual patch がある場合、または 1 つの video に多くの clip がある場合などです。StructArray はこれらの要素を親 entity の内部に保持しながら、各要素内の field に対する vector search と scalar filtering も可能にします。

## StructArray とは？\{#what-is-structarray}

**StructArray** は、struct の配列とも呼ばれ、各 entity に順序付けられた Struct 要素の集合を保存します。配列内のすべての Struct 要素は同じ schema に従います。Struct 要素には scalar subfield、vector subfield、またはその両方を含めることができます。

たとえば、ある collection では 1 つの記事を 1 つの entity として保存し、その chunk を `chunks` という名前の StructArray field に保存できます。各 chunk には、text、section metadata、quality score、および 1 つ以上の vector embedding を含めることができます。

```plaintext
{
  "doc_id": 1,
  "title": "Vector search tuning guide",
  "category": "search",
  "title_vector": [0.10, 0.20, 0.30, 0.40],
  "chunks": [
    {
      "text": "Use HNSW efSearch to trade recall for latency.",
      "section": "index",
      "page": 1,
      "quality_score": 0.92,
      "has_code": true,
      "emb_list_vector": [0.11, 0.21, 0.31, 0.41],
      "emb": [0.12, 0.20, 0.33, 0.39]
    },
    {
      "text": "Range search returns vectors within a distance boundary.",
      "section": "search",
      "page": 2,
      "quality_score": 0.86,
      "has_code": false,
      "emb_list_vector": [0.18, 0.23, 0.29, 0.36],
      "emb": [0.19, 0.24, 0.30, 0.37]
    }
  ]
}
```

<Admonition type="info" icon="📘" title="注意">

この例の 2 つの vector subfield は、同じ chunk を 2 つの search の観点から表しています。`chunks[emb_list_vector]` は `MAX_SIM*` metric を使用する EmbeddingList search 用であり、`chunks[emb]` は `COSINE`、`IP`、`L2` などの通常の vector metric を使用する element-level search 用です。

</Admonition>

## StructArray を使用するタイミング\{#when-to-use-structarray}

返したい自然な単位が、search または filter したい自然な単位よりも大きい場合は StructArray を使用します。

| Use case | StructArray が役立つ理由 | 典型的な StructArray field |
| --- | --- | --- |
| Document retrieval | 1 つの document を 1 つの entity として保存しつつ、その chunk を横断して search できる。 | `chunks` |
| Late-interaction retrieval | document または page を embedding list として保存し、`MAX_SIM*` で score を計算できる。 | `chunks[emb_list_vector]` または `patches[emb]` |
| Element-level retrieval | 配列オフセットを含めて、最も関連性の高い chunk、clip、patch、または observation を返せる。 | `chunks[emb]` |
| Structured filtering | section、score、page、flag など、Struct 要素内の scalar subfield で filter できる。 | `chunks[section]`, `chunks[quality_score]` |
| 重複する親結果の削減 | 各子要素を個別の行として保存する代わりに、同じ親 entity の下に子要素を保持できる。 | `chunks`, `clips`, `patches` |

## Decision Matrix\{#decision-matrix}

適切な StructArray の利用方法を選ぶには、次のマトリクスを使用してください。

| Goal | 推奨される方法 | 結果の粒度 | ここから開始 |
| --- | --- | --- | --- |
| 多くの構造化された子を持つ 1 つの親オブジェクトをモデリングする。 | StructArray field を作成する。 | entity に順序付き Struct 要素が含まれる。 | [Create a StructArray Field](./create-struct-array) |
| ネストされた子データを持つ親レコードを挿入する。 | StructArray field が Struct オブジェクトのリストである entity を挿入する。 | entity レベルの insert。 | [Insert Data into StructArray Fields](./insert-struct-array) |
| ColBERT、ColPali、または document-level の late-interaction retrieval を実行する。 | `MAX_SIM*` index を使用した EmbeddingList search を使用する。 | entity レベル。 | [Search with Embedding Lists](./tutorial-colbert-colpali) |
| 個々の chunk、clip、または patch を search する。 | 通常の vector metric を使用した element-level search を使用する。 | 利用可能な場合は offset を含む Struct 要素レベル。 | [Basic Vector Search with StructArray](./search-with-struct-array) |
| scalar 条件に一致する要素に対してのみ element-level vector search を制限する。 | `element_filter` を使用する。 | 要素レベルの filtering。結果の形状は search type に依存する。 | [Filtered Search with StructArray](./filtered-search-with-struct-arrays) |
| 条件を満たす Struct 要素の数に基づいて entity を選択する。 | `MATCH_ANY`、`MATCH_ALL`、`MATCH_LEAST`、`MATCH_MOST`、または `MATCH_EXACT` を使用する。 | entity レベル。 | [StructArray Operators](./struct-array-filtering) |
| StructArray vector subfield に対して score または distance の境界を使用する。 | element-level range search を使用する。 | Struct 要素レベル。 | [Range Search with StructArray](./range-search-with-struct-arrays) |
| element-level search の後、各親 entity につき最大 1 件の結果を返す。 | primary key による grouping search を使用する。 | grouping 後は entity レベル。 | [Grouping Search with StructArray](./grouping-search-with-struct-array) |
| StructArray element search を別の vector field と組み合わせる。 | StructArray vector subfield を対象とする 1 つの AnnSearchRequest を含む hybrid search を使用する。 | 要素レベルの sub-search、entity レベルの reranking。 | [Hybrid Search with StructArray](./hybrid-search-with-struct-array) |

## 2 つの search モデルを理解する\{#understand-the-two-search-models}

<Grid columnSize="2" widthRatios="50,50">

    <div>

        ### EmbeddingList search\{#embeddinglist-search}

        EmbeddingList search では、StructArray vector subfield 内の vector を親 entity の 1 つの embedding list として扱います。query も embedding list です。Zilliz Cloud は `MAX_SIM*` metric を使用して query の embedding list と保存された embedding list を比較し、一致する entity を返します。

        - Query data: embedding list。

        - Metric family: `MAX_SIM*`。

        - 結果の粒度: entity レベル。

        - 最適な用途: document-level または page-level の late-interaction retrieval。

    </div>

    <div>

        ### Element-level search\{#element-level-search}

        Element-level search では、各 Struct 要素を独立した vector-search 候補として扱います。各ヒットは StructArray field 内の一致した要素を表し、grouping されていない結果では要素の offset を公開できます。

        - Query data: 通常の vector。

        - Metric family: 通常の vector metric。

        - 結果の粒度: Struct 要素レベル。

        - 最適な用途: chunk-level、clip-level、または patch-level retrieval。

    </div>

</Grid>

<Admonition type="warning" icon="🚧" title="警告">

collection で EmbeddingList search と element-level search の両方が必要な場合は、2 つの別個の vector subfield を使用してください。vector field または vector subfield は 1 つの index しか受け付けず、この 2 つの search モードでは異なる metric family が必要です。

</Admonition>

## ドキュメントマップ\{#documentation-map}

StructArray のドキュメントは、モデリングページと search ページに分かれています。モデリングページを使ってデータを定義および準備してください。search ページを使って適切な retrieval と filtering の動作を選択してください。

| Area | Page | 用途 |
| --- | --- | --- |
| Modeling | [Create a StructArray Field](./create-struct-array) | Struct schema を定義し、StructArray field を追加する。 |
| Modeling | [Insert Data into StructArray Fields](./insert-struct-array) | ネストされた StructArray データを準備して挿入する。 |
| Modeling | [Index StructArray Fields](./index-struct-array) | StructArray subfield に vector index と scalar index を作成する。 |
| Reference | [StructArray Limits](./struct-array-limits) | schema、data type、index、search、filter、および version の制限を確認する。 |
| Search | [Basic Vector Search with StructArray](./search-with-struct-array) | EmbeddingList search と element-level vector search を比較する。 |
| Search | [Range Search with StructArray](./range-search-with-struct-arrays) | StructArray vector subfield に range 制約を使用する。 |
| Search | [Grouping Search with StructArray](./grouping-search-with-struct-array) | element-level search 結果を primary key で group 化する。 |
| Search | [Hybrid Search with StructArray](./hybrid-search-with-struct-array) | StructArray の element-level search を他の vector search と組み合わせる。 |
| Search | [Filtered Search with StructArray](./filtered-search-with-struct-arrays) | search、query、hybrid search で StructArray filter を使用する。 |
| Search | [Search with Embedding Lists](./tutorial-colbert-colpali) | StructArray を使用して ColBERT および ColPali スタイルの retrieval システムを構築する。 |
| Filter | [StructArray Operators](./struct-array-filtering) | `element_filter` と `MATCH_*` operator のリファレンス構文。 |

## 最初に確認すべき主な制限\{#key-limits-to-check-first}

- Struct は Array field の要素 type として使用できます。トップレベルの collection field としては使用されません。

- 同じ StructArray field 内のすべての Struct 要素は、1 つの事前定義された schema を共有します。

- vector subfield には index が必要です。EmbeddingList search は `MAX_SIM*` metric を使用し、element-level search は通常の vector metric を使用します。

- `element_filter` と `MATCH_*` は StructArray field 内の scalar subfield 用です。`$[subfield]` はこれらの operator 内でのみ使用してください。

- 一部の search の組み合わせは version 制限または mode 固有です。range search、grouping search、hybrid search、nullable field、または動的に追加される field を使用する前に、[StructArray Limits](./struct-array-limits) を確認してください。

## 次のステップ\{#next-steps}

1. schema を設計するには、[Create a StructArray Field](./create-struct-array) をお読みください。

1. データを準備するには、[Insert Data into StructArray Fields](./insert-struct-array) をお読みください。

1. index を選択するには、[Index StructArray Fields](./index-struct-array) をお読みください。

1. StructArray vector subfield を search するには、まず [Basic Vector Search with StructArray](./search-with-struct-array) から始めてください。

1. StructArray scalar subfield を filter するには、[StructArray Operators](./struct-array-filtering) と [Filtered Search with StructArray](./filtered-search-with-struct-arrays) をお読みください。

