---
title: "StructArray 概要 | Cloud"
slug: /use-array-of-structs
sidebar_label: "概要"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "1 つの entity に、1 つのドキュメントに多数の chunk、1 つのページに多数の visual patch、1 つの動画に多数の clip のような、順序付きの構造化要素リストを格納する必要がある場合は StructArray を使用します。StructArray はこれらの要素を親 entity 内に保持しつつ、各要素内のフィールドに対する vector search と scalar filtering も可能にします。 | Cloud"
type: origin
token: VlAlwAJvEiVVW6k0RBvcvkpWnhK
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# StructArray 概要

1 つの entity に、1 つのドキュメントに多数の chunk、1 つのページに多数の visual patch、1 つの動画に多数の clip のような、順序付きの構造化要素リストを格納する必要がある場合は StructArray を使用します。StructArray はこれらの要素を親 entity 内に保持しつつ、各要素内のフィールドに対する vector search と scalar filtering も可能にします。

## StructArray とは何ですか?\{#what-is-structarray}

**StructArray** は、struct の配列とも呼ばれ、各 entity に順序付きの Struct 要素セットを格納します。配列内の各 Struct 要素は同じ schema に従います。Struct 要素には scalar subfield、vector subfield、またはその両方を含めることができます。

たとえば、collection は 1 つの記事を 1 つの entity として格納し、その chunk を `chunks` という名前の StructArray field に格納できます。各 chunk には、テキスト、セクション metadata、品質スコア、および 1 つ以上の vector embedding を含めることができます。

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

<Admonition type="info" icon="📘" title="注意">

この例の 2 つの vector subfield は、同じ chunk を 2 つの検索観点から表現しています。`chunks[emb_list_vector]` は `MAX_SIM*` metrics を用いた EmbeddingList search 用であり、`chunks[emb]` は `COSINE`、`IP`、`L2` などの通常の vector metrics を用いた element-level search 用です。

</Admonition>

## StructArray を使用する場合\{#when-to-use-structarray}

返したい自然な単位が、検索または filter したい自然な単位よりも大きい場合は StructArray を使用します。

| ユースケース | StructArray が役立つ理由 | 典型的な StructArray field |
| --- | --- | --- |
| ドキュメント検索 | 1 つのドキュメントを 1 つの entity として保存しつつ、その chunk 全体を対象に検索できます。 | `chunks` |
| Late-interaction retrieval | ドキュメントまたはページを embedding list として保存し、`MAX_SIM*` でスコアリングできます。 | `chunks[emb_list_vector]` または `patches[emb]` |
| Element-level retrieval | 配列オフセットを含めて、最も関連性の高い chunk、clip、patch、または observation を返します。 | `chunks[emb]` |
| 構造化 filtering | section、score、page、flags など、Struct 要素内の scalar subfield による filter を行います。 | `chunks[section]`, `chunks[quality_score]` |
| 重複する親結果の削減 | 各子要素を別々の行として保存する代わりに、同じ親 entity の下に子要素を保持します。 | `chunks`, `clips`, `patches` |

## Decision Matrix\{#decision-matrix}

適切な StructArray のパスを選ぶには、次のマトリクスを使用してください。

| 目的 | 推奨されるパス | 結果の粒度 | 開始場所 |
| --- | --- | --- | --- |
| 多数の構造化された子を持つ 1 つの親オブジェクトをモデル化する。 | StructArray field を作成する。 | entity に順序付きの Struct 要素が含まれる。 | [Create a StructArray Field](./create-struct-array) |
| ネストされた子データを含む親レコードを挿入する。 | StructArray field が Struct object のリストである entity を挿入する。 | entity レベルの insert。 | [Insert Data into StructArray Fields](./insert-struct-array) |
| ColBERT、ColPali、またはドキュメントレベルの late-interaction retrieval を実行する。 | `MAX_SIM*` index を使った EmbeddingList search を使用する。 | entity レベル。 | [Search with Embedding Lists](./tutorial-colbert-colpali) |
| 個々の chunk、clip、または patch を検索する。 | 通常の vector metric で element-level search を使用する。 | Struct 要素レベル。利用可能な場合は offset 付き。 | [Basic Vector Search with StructArray](./search-with-struct-array) |
| scalar 条件に一致する要素に対して element-level vector search を制限する。 | `element_filter` を使用する。 | element-level filtering。結果の形状は検索タイプによって異なる。 | [Filtered Search with StructArray](./filtered-search-with-struct-arrays) |
| 条件を満たす Struct 要素の数によって entity を選択する。 | `MATCH_ANY`、`MATCH_ALL`、`MATCH_LEAST`、`MATCH_MOST`、または `MATCH_EXACT` を使用する。 | entity レベル。 | [StructArray Operators](./struct-array-filtering) |
| StructArray vector subfield に score または distance の境界を使用する。 | element-level range search を使用する。 | Struct 要素レベル。 | [Range Search with StructArray](./range-search-with-struct-arrays) |
| element-level search の後に親 entity ごとに最大 1 件の結果を返す。 | primary key による grouping search を使用する。 | grouping 後は entity レベル。 | [Grouping Search with StructArray](./grouping-search-with-struct-array) |
| StructArray element search を別の vector field と組み合わせる。 | StructArray vector subfield を対象とする 1 つの AnnSearchRequest を含む hybrid search を使用する。 | element-level の sub-search、entity-level の reranking。 | [Hybrid Search with StructArray](./hybrid-search-with-struct-array) |

## 2 つの検索モデルを理解する\{#understand-the-two-search-models}

<Grid columnSize="2" widthRatios="50,50">

    <div>

        ### EmbeddingList search\{#embeddinglist-search}

        EmbeddingList search は、StructArray vector subfield 内の vector を、親 entity の 1 つの embedding list として扱います。クエリも embedding list です。Zilliz Cloud は `MAX_SIM*` metric を使用してクエリ embedding list と保存済み embedding list を比較し、一致する entity を返します。

        - クエリデータ: embedding list。

        - Metric ファミリー: `MAX_SIM*`。

        - 結果の粒度: entity レベル。

        - 最適な用途: ドキュメントレベルまたはページレベルの late-interaction retrieval。

    </div>

    <div>

        ### Element-level search\{#element-level-search}

        Element-level search は、各 Struct 要素を独立した vector-search 候補として扱います。各 hit は StructArray field 内で一致した要素を表し、grouping していない結果では要素 offset を公開できます。

        - クエリデータ: 通常の vector。

        - Metric ファミリー: 通常の vector metrics。

        - 結果の粒度: Struct 要素レベル。

        - 最適な用途: chunk レベル、clip レベル、または patch レベルの retrieval。

    </div>

</Grid>

<Admonition type="warning" icon="🚧" title="警告">

collection で EmbeddingList search と element-level search の両方が必要な場合は、2 つの別個の vector subfield を使用してください。vector field または vector subfield は 1 つの index しか受け付けず、2 つの検索モードでは異なる metric ファミリーが必要です。

</Admonition>

## ドキュメントマップ\{#documentation-map}

StructArray のドキュメントは、モデリングページと検索ページに分かれています。モデリングページを使用してデータを定義および準備し、検索ページを使用して適切な retrieval と filtering の動作を選択してください。

| 領域 | ページ | 用途 |
| --- | --- | --- |
| Modeling | [Create a StructArray Field](./create-struct-array) | Struct schema を定義し、StructArray field を追加する。 |
| Modeling | [Insert Data into StructArray Fields](./insert-struct-array) | ネストされた StructArray データを準備して insert する。 |
| Modeling | [Index StructArray Fields](./index-struct-array) | StructArray subfield に vector index と scalar index を作成する。 |
| Reference | [StructArray Limits](./struct-array-limits) | schema、data type、index、search、filter、および version の制限を確認する。 |
| Search | [Basic Vector Search with StructArray](./search-with-struct-array) | EmbeddingList search と element-level vector search を比較する。 |
| Search | [Range Search with StructArray](./range-search-with-struct-arrays) | StructArray vector subfield で範囲制約を使用する。 |
| Search | [Grouping Search with StructArray](./grouping-search-with-struct-array) | element-level search の結果を primary key ごとに group 化する。 |
| Search | [Hybrid Search with StructArray](./hybrid-search-with-struct-array) | StructArray の element-level search を他の vector search と組み合わせる。 |
| Search | [Filtered Search with StructArray](./filtered-search-with-struct-arrays) | search、query、および hybrid search で StructArray filter を使用する。 |
| Search | [Search with Embedding Lists](./tutorial-colbert-colpali) | StructArray を使用して ColBERT および ColPali スタイルの retrieval システムを構築する。 |
| Filter | [StructArray Operators](./struct-array-filtering) | `element_filter` および `MATCH_*` operators の参照構文。 |

## 最初に確認すべき主な制限\{#key-limits-to-check-first}

- Struct は Array field の要素型として使用できます。トップレベルの collection field としては使用されません。

- 同じ StructArray field 内のすべての Struct 要素は、1 つの事前定義された schema を共有します。

- vector subfield には index が必要です。EmbeddingList search は `MAX_SIM*` metrics を使用し、element-level search は通常の vector metrics を使用します。

- `element_filter` と `MATCH_*` は StructArray field 内の scalar subfield 用です。`$[subfield]` はこれらの operators 内でのみ使用してください。

- 一部の検索の組み合わせは version による制限または mode 固有です。range search、grouping search、hybrid search、nullable fields、または動的に追加された fields に依存する前に、[StructArray Limits](./struct-array-limits) を確認してください。

## 次のステップ\{#next-steps}

1. schema を設計するには、[Create a StructArray Field](./create-struct-array) を参照してください。

1. データを準備するには、[Insert Data into StructArray Fields](./insert-struct-array) を参照してください。

1. index を選択するには、[Index StructArray Fields](./index-struct-array) を参照してください。

1. StructArray vector subfield を検索するには、まず [Basic Vector Search with StructArray](./search-with-struct-array) から始めてください。

1. StructArray scalar subfield を filter するには、[StructArray Operators](./struct-array-filtering) と [Filtered Search with StructArray](./filtered-search-with-struct-arrays) を参照してください。

