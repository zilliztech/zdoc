---
title: "StructArray の概要 | Cloud"
slug: /use-array-of-structs
sidebar_label: "概要"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "1 つの entity に、多数の chunk を持つ 1 つの document、多数の visual patch を持つ 1 つの page、多数の clip を持つ 1 つの video のような、構造化された要素の順序付きリストを保存する必要がある場合は StructArray を使用します。StructArray は、各要素内の field に対する vector search と scalar filtering を可能にしながら、これらの要素を親 entity の内部に保持します。 | Cloud"
type: origin
token: VlAlwAJvEiVVW6k0RBvcvkpWnhK
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# StructArray の概要

1 つの entity に、多数の chunk を持つ 1 つの document、多数の visual patch を持つ 1 つの page、多数の clip を持つ 1 つの video のような、構造化された要素の順序付きリストを保存する必要がある場合は StructArray を使用します。StructArray は、各要素内の field に対する vector search と scalar filtering を可能にしながら、これらの要素を親 entity の内部に保持します。

## StructArray とは何ですか？\{#what-is-structarray}

**StructArray** は、array of structs とも呼ばれ、各 entity に Struct 要素の順序付きセットを保存します。array 内のすべての Struct 要素は同じ schema に従います。Struct 要素には scalar subfield、vector subfield、またはその両方を含めることができます。

たとえば、collection は 1 つの記事を 1 つの entity として保存し、その chunk を `chunks` という名前の StructArray field に保存できます。各 chunk には、text、section metadata、quality score、および 1 つ以上の vector embedding を含めることができます。

```json
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

<Admonition type="info" icon="📘" title="Notes">

この例の 2 つの vector subfield は、同じ chunk を 2 つの検索観点から表しています。`chunks[emb_list_vector]` は `MAX_SIM*` metrics を使用する EmbeddingList search を目的としており、`chunks[emb]` は `COSINE`、`IP`、`L2` などの通常の vector metrics を使用する element-level search を目的としています。

</Admonition>

## StructArray を使用するタイミング\{#when-to-use-structarray}

返したい自然な単位が、検索または filter したい自然な単位より大きい場合は StructArray を使用します。

| Use case | StructArray が役立つ理由 | 典型的な StructArray field |
| --- | --- | --- |
| Document retrieval | chunk をまたいで検索しながら、1 つの document を 1 つの entity として保存します。 | `chunks` |
| Late-interaction retrieval | document または page を embedding list として保存し、`MAX_SIM*` でスコアリングします。 | `chunks[emb_list_vector]` または `patches[emb]` |
| Element-level retrieval | 最も関連性の高い chunk、clip、patch、または observation を、その array offset とともに返します。 | `chunks[emb]` |
| Structured filtering | section、score、page、flags など、Struct 要素内の scalar subfield で filter します。 | `chunks[section]`, `chunks[quality_score]` |
| 重複する親結果の削減 | 各子要素を個別の row として保存するのではなく、同じ親 entity の下に子要素を保持します。 | `chunks`, `clips`, `patches` |

## Decision Matrix\{#decision-matrix}

適切な StructArray の使い方を選ぶには、次の matrix を使用してください。

| Goal | 推奨される方法 | 結果の粒度 | 開始ページ |
| --- | --- | --- | --- |
| 多数の構造化された子要素を持つ 1 つの親 object をモデル化する。 | StructArray field を作成する。 | entity には順序付き Struct 要素が含まれる。 | [StructArray Field を作成する](./create-struct-array) |
| ネストされた子データを含む親 record を挿入する。 | StructArray field が Struct object のリストである entity を挿入する。 | entity-level insert。 | [StructArray Field にデータを挿入する](./insert-struct-array) |
| ColBERT、ColPali、または document-level の late-interaction retrieval を実行する。 | `MAX_SIM*` index を使った EmbeddingList search を使用する。 | entity level。 | [Embedding List で検索する](./tutorial-colbert-colpali) |
| 個別の chunk、clip、または patch を検索する。 | 通常の vector metric を使用した element-level search を使う。 | Struct element level。利用可能な場合は offset 付き。 | [StructArray を使った基本的な Vector Search](./search-with-struct-array) |
| scalar 条件に一致する要素に element-level vector search を制限する。 | `element_filter` を使う。 | element-level filtering。結果の形状は search type に依存します。 | [StructArray を使った Filtered Search](./filtered-search-with-struct-arrays) |
| 条件を満たす Struct 要素の数に基づいて entity を選択する。 | `MATCH_ANY`、`MATCH_ALL`、`MATCH_LEAST`、`MATCH_MOST`、または `MATCH_EXACT` を使う。 | entity level。 | [StructArray Operators](./struct-array-filtering) |
| StructArray vector subfield に score または distance の境界を使用する。 | element-level range search を使う。 | Struct element level。 | [StructArray を使った Range Search](./range-search-with-struct-arrays) |
| element-level search の後、親 entity ごとに最大 1 件の結果を返す。 | primary key による grouping search を使う。 | grouping 後は entity level。 | [StructArray を使った Grouping Search](./grouping-search-with-struct-array) |
| StructArray element search を別の vector field と組み合わせる。 | StructArray vector subfield を対象とする 1 つの AnnSearchRequest を含む hybrid search を使う。 | element-level sub-search、entity-level reranking。 | [StructArray を使った Hybrid Search](./hybrid-search-with-struct-array) |

## 2 つの検索モデルを理解する\{#understand-the-two-search-models}

<Grid columnSize="2" widthRatios="50,50">

    <div>

        ### EmbeddingList search\{#embeddinglist-search}

        EmbeddingList search は、StructArray vector subfield 内の vector を、親 entity に対する 1 つの embedding list として扱います。query も embedding list です。Zilliz Cloud は `MAX_SIM*` metric を使用して query embedding list と保存された embedding list を比較し、一致する entity を返します。

        - Query data: embedding list.

        - Metric family: `MAX_SIM*`.

        - Result granularity: entity level.

        - Best for: document-level または page-level の late-interaction retrieval.

    </div>

    <div>

        ### Element-level search\{#element-level-search}

        Element-level search は、各 Struct 要素を独立した vector-search candidate として扱います。各 hit は StructArray field 内で一致した要素を表し、group 化されていない結果では要素の offset を公開できます。

        - Query data: regular vector.

        - Metric family: regular vector metrics.

        - Result granularity: Struct element level.

        - Best for: chunk-level、clip-level、または patch-level retrieval.

    </div>

</Grid>

<Admonition type="warning" icon="🚧" title="Warning">

collection で EmbeddingList search と element-level search の両方が必要な場合は、2 つの別々の vector subfield を使用してください。vector field または vector subfield は 1 つの index しか受け入れられず、この 2 つの検索モードには異なる metric family が必要です。

</Admonition>

## ドキュメントマップ\{#documentation-map}

StructArray のドキュメントは、モデリング用ページと検索用ページに分かれています。モデリング用ページを使ってデータを定義および準備し、検索用ページを使って適切な retrieval と filtering の動作を選択してください。

| Area | Page | 用途 |
| --- | --- | --- |
| Modeling | [StructArray Field を作成する](./create-struct-array) | Struct schema を定義し、StructArray field を追加します。 |
| Modeling | [StructArray Field にデータを挿入する](./insert-struct-array) | ネストされた StructArray data を準備して挿入します。 |
| Modeling | [StructArray Field に index を作成する](./index-struct-array) | StructArray subfield に vector index と scalar index を作成します。 |
| Reference | [StructArray の制限](./struct-array-limits) | schema、data type、index、search、filter、version の制限を確認します。 |
| Search | [StructArray を使った基本的な Vector Search](./search-with-struct-array) | EmbeddingList search と element-level vector search を比較します。 |
| Search | [StructArray を使った Range Search](./range-search-with-struct-arrays) | StructArray vector subfield で range 制約を使用します。 |
| Search | [StructArray を使った Grouping Search](./grouping-search-with-struct-array) | element-level search の結果を primary key ごとに group 化します。 |
| Search | [StructArray を使った Hybrid Search](./hybrid-search-with-struct-array) | StructArray の element-level search を他の vector search と組み合わせます。 |
| Search | [StructArray を使った Filtered Search](./filtered-search-with-struct-arrays) | search、query、hybrid search で StructArray filter を使用します。 |
| Search | [Embedding List で検索する](./tutorial-colbert-colpali) | StructArray を使って ColBERT および ColPali スタイルの retrieval system を構築します。 |
| Filter | [StructArray Operators](./struct-array-filtering) | `element_filter` と `MATCH_*` operators の参照構文。 |

## 最初に確認すべき主要な制限\{#key-limits-to-check-first}

- Struct は Array field の要素 type として使用できます。top-level collection field としては使用されません。

- 同じ StructArray field 内のすべての Struct 要素は、1 つの事前定義された schema を共有します。

- vector subfield には index が必要です。EmbeddingList search では `MAX_SIM*` metrics を使用し、element-level search では通常の vector metrics を使用します。

- `element_filter` と `MATCH_*` は StructArray field 内の scalar subfield 用です。`$[subfield]` はこれらの operators の内部でのみ使用してください。

- 一部の検索の組み合わせは version による制限または mode 固有です。range search、grouping search、hybrid search、nullable field、または動的に追加された field に依存する前に、[StructArray の制限](./struct-array-limits) を確認してください。

## 次のステップ\{#next-steps}

1. schema を設計するには、[StructArray Field を作成する](./create-struct-array) をお読みください。

1. data を準備するには、[StructArray Field にデータを挿入する](./insert-struct-array) をお読みください。

1. index を選択するには、[StructArray Field に index を作成する](./index-struct-array) をお読みください。

1. StructArray vector subfield を検索するには、まず [StructArray を使った基本的な Vector Search](./search-with-struct-array) をご覧ください。

1. StructArray scalar subfield を filter するには、[StructArray Operators](./struct-array-filtering) と [StructArray を使った Filtered Search](./filtered-search-with-struct-arrays) をお読みください。

