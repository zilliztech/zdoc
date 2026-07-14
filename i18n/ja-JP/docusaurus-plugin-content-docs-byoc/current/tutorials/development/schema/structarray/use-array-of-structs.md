---
title: "StructArray の概要 | BYOC"
slug: /use-array-of-structs
sidebar_label: "概要"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray は、1 つのドキュメントに多数のチャンク、1 つのページに多数の visual patch、1 つの動画に多数のクリップがある場合のように、1 つの entity が構造化された要素の順序付きリストを保存する必要があるときに使用します。StructArray は、これらの要素を親 entity の内部に保持しながら、各要素内のフィールドに対する vector search と scalar filtering も可能にします。 | BYOC"
type: origin
token: VlAlwAJvEiVVW6k0RBvcvkpWnhK
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# StructArray の概要

StructArray は、1 つのドキュメントに多数のチャンク、1 つのページに多数の visual patch、1 つの動画に多数のクリップがある場合のように、1 つの entity が構造化された要素の順序付きリストを保存する必要があるときに使用します。StructArray は、これらの要素を親 entity の内部に保持しながら、各要素内のフィールドに対する vector search と scalar filtering も可能にします。

## StructArray とは何ですか？\{#what-is-structarray}

**StructArray** は、struct の配列とも呼ばれ、各 entity に順序付きの Struct 要素の集合を保存します。配列内のすべての Struct 要素は同じ schema に従います。Struct 要素には、scalar subfield、vector subfield、またはその両方を含めることができます。

たとえば、collection は 1 つの記事を entity として保存し、そのチャンクを `chunks` という名前の StructArray フィールドに保存できます。各チャンクには、テキスト、セクションメタデータ、品質スコア、および 1 つ以上の vector embedding を含めることができます。

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

この例の 2 つの vector subfield は、同じチャンクを 2 つの検索観点から表しています。`chunks[emb_list_vector]` は `MAX_SIM*` metrics を用いた EmbeddingList search 用であり、`chunks[emb]` は `COSINE`、`IP`、`L2` などの通常の vector metrics を用いた要素レベル検索用です。

</Admonition>

## StructArray を使用するタイミング\{#when-to-use-structarray}

返したい自然な単位が、検索またはフィルタリングしたい自然な単位よりも大きい場合は、StructArray を使用します。

| Use case | StructArray が役立つ理由 | 典型的な StructArray フィールド |
| --- | --- | --- |
| ドキュメント検索 | 1 つのドキュメントを entity として保存しながら、そのチャンク全体を検索できます。 | `chunks` |
| Late-interaction retrieval | ドキュメントまたはページを embedding list として保存し、`MAX_SIM*` でスコアリングできます。 | `chunks[emb_list_vector]` または `patches[emb]` |
| 要素レベル検索 | 最も関連性の高いチャンク、クリップ、patch、または observation を、その配列オフセット付きで返します。 | `chunks[emb]` |
| 構造化フィルタリング | section、score、page、flag など、Struct 要素内の scalar subfield でフィルタリングします。 | `chunks[section]`, `chunks[quality_score]` |
| 重複する親結果の削減 | 各子を別々の行として保存する代わりに、子要素を同じ親 entity の下に保持します。 | `chunks`, `clips`, `patches` |

## 決定マトリクス\{#decision-matrix}

適切な StructArray の利用方法を選択するには、次のマトリクスを使用してください。

| Goal | 推奨される方法 | 結果の粒度 | ここから開始 |
| --- | --- | --- | --- |
| 多数の構造化された子を持つ 1 つの親オブジェクトをモデル化する。 | StructArray フィールドを作成する。 | entity に順序付きの Struct 要素が含まれる。 | [Create a StructArray Field](./create-struct-array) |
| ネストされた子データを持つ親レコードを挿入する。 | StructArray フィールドが Struct オブジェクトのリストである entity を挿入する。 | entity レベルの挿入。 | [Insert Data into StructArray Fields](./insert-struct-array) |
| ColBERT、ColPali、またはドキュメントレベルの late-interaction retrieval を実行する。 | `MAX_SIM*` index を使った EmbeddingList search を使用する。 | entity レベル。 | [Search with Embedding Lists](./tutorial-colbert-colpali) |
| 個々のチャンク、クリップ、または patch を検索する。 | 通常の vector metric を使った要素レベル検索を使用する。 | 利用可能な場合は offset を伴う Struct 要素レベル。 | [Basic Vector Search with StructArray](./search-with-struct-array) |
| scalar 条件に一致する要素に要素レベル vector search を制限する。 | `element_filter` を使用する。 | 要素レベルのフィルタリング。結果の形状は検索タイプに依存。 | [Filtered Search with StructArray](./filtered-search-with-struct-arrays) |
| 条件を満たす Struct 要素の数によって entity を選択する。 | `MATCH_ANY`, `MATCH_ALL`, `MATCH_LEAST`, `MATCH_MOST`, または `MATCH_EXACT` を使用する。 | entity レベル。 | [StructArray Operators](./struct-array-filtering) |
| StructArray vector subfield に対して score または distance の境界を使用する。 | 要素レベルの range search を使用する。 | Struct 要素レベル。 | [Range Search with StructArray](./range-search-with-struct-arrays) |
| 要素レベル検索の後に親 entity ごとに最大 1 件の結果を返す。 | primary key による grouping search を使用する。 | grouping 後は entity レベル。 | [Grouping Search with StructArray](./grouping-search-with-struct-array) |
| StructArray 要素検索を別の vector フィールドと組み合わせる。 | StructArray vector subfield を対象とする 1 つの AnnSearchRequest を含む hybrid search を使用する。 | 要素レベルのサブ検索、entity レベルの reranking。 | [Hybrid Search with StructArray](./hybrid-search-with-struct-array) |

## 2 つの検索モデルを理解する\{#understand-the-two-search-models}

<Grid columnSize="2" widthRatios="50,50">

    <div>

        ### EmbeddingList search\{#embeddinglist-search}

        EmbeddingList search は、StructArray vector subfield 内の vectors を、親 entity の 1 つの embedding list として扱います。クエリも embedding list です。Zilliz Cloud は、`MAX_SIM*` metric を使用してクエリ embedding list と保存された embedding list を比較し、一致する entity を返します。

        - クエリデータ: embedding list。

        - metric ファミリー: `MAX_SIM*`。

        - 結果の粒度: entity レベル。

        - 最適な用途: ドキュメントレベルまたはページレベルの late-interaction retrieval。

    </div>

    <div>

        ### 要素レベル検索\{#element-level-search}

        要素レベル検索は、各 Struct 要素を独立した vector-search 候補として扱います。各ヒットは StructArray フィールド内で一致した要素を表し、group 化されていない結果では要素 offset を公開できます。

        - クエリデータ: 通常の vector。

        - metric ファミリー: 通常の vector metrics。

        - 結果の粒度: Struct 要素レベル。

        - 最適な用途: チャンクレベル、クリップレベル、または patch レベルの retrieval。

    </div>

</Grid>

<Admonition type="warning" icon="🚧" title="警告">

collection で EmbeddingList search と要素レベル検索の両方が必要な場合は、2 つの別個の vector subfield を使用してください。vector field または vector subfield は 1 つの index しか受け入れられず、2 つの検索モードには異なる metric ファミリーが必要です。

</Admonition>

## ドキュメントマップ\{#documentation-map}

StructArray のドキュメントは、モデリングページと検索ページに分かれています。モデリングページを使ってデータを定義および準備してください。検索ページを使って、適切な retrieval と filtering の動作を選択してください。

| Area | Page | 用途 |
| --- | --- | --- |
| モデリング | [Create a StructArray Field](./create-struct-array) | Struct schema を定義し、StructArray フィールドを追加する。 |
| モデリング | [Insert Data into StructArray Fields](./insert-struct-array) | ネストされた StructArray データを準備して挿入する。 |
| モデリング | [Index StructArray Fields](./index-struct-array) | StructArray subfield に vector index と scalar index を作成する。 |
| リファレンス | [StructArray Limits](./struct-array-limits) | schema、data type、index、search、filter、version の制限を確認する。 |
| 検索 | [Basic Vector Search with StructArray](./search-with-struct-array) | EmbeddingList search と要素レベル vector search を比較する。 |
| 検索 | [Range Search with StructArray](./range-search-with-struct-arrays) | StructArray vector subfield で range 制約を使用する。 |
| 検索 | [Grouping Search with StructArray](./grouping-search-with-struct-array) | 要素レベル検索結果を primary key で group 化する。 |
| 検索 | [Hybrid Search with StructArray](./hybrid-search-with-struct-array) | StructArray 要素レベル検索を他の vector search と組み合わせる。 |
| 検索 | [Filtered Search with StructArray](./filtered-search-with-struct-arrays) | search、query、hybrid search で StructArray フィルターを使用する。 |
| 検索 | [Search with Embedding Lists](./tutorial-colbert-colpali) | StructArray を使用して ColBERT および ColPali スタイルの retrieval システムを構築する。 |
| Filter | [StructArray Operators](./struct-array-filtering) | `element_filter` および `MATCH_*` operators のリファレンス構文。 |

## 最初に確認すべき主な制限\{#key-limits-to-check-first}

- Struct は Array フィールドの要素型として使用できます。トップレベルの collection フィールドとしては使用されません。

- 同じ StructArray フィールド内のすべての Struct 要素は、1 つの事前定義された schema を共有します。

- vector subfield には index が必要です。EmbeddingList search は `MAX_SIM*` metrics を使用し、要素レベル検索は通常の vector metrics を使用します。

- `element_filter` と `MATCH_*` は StructArray フィールド内の scalar subfield 用です。`$[subfield]` はこれらの operators 内でのみ使用してください。

- 一部の検索の組み合わせは version-gated または mode-specific です。range search、grouping search、hybrid search、nullable fields、または動的に追加された fields に依存する前に、[StructArray Limits](./struct-array-limits) を確認してください。

## 次のステップ\{#next-steps}

1. schema を設計するには、[Create a StructArray Field](./create-struct-array) をお読みください。

1. データを準備するには、[Insert Data into StructArray Fields](./insert-struct-array) をお読みください。

1. index を選択するには、[Index StructArray Fields](./index-struct-array) をお読みください。

1. StructArray vector subfield を検索するには、まず [Basic Vector Search with StructArray](./search-with-struct-array) から始めてください。

1. StructArray scalar subfield をフィルタリングするには、[StructArray Operators](./struct-array-filtering) と [Filtered Search with StructArray](./filtered-search-with-struct-arrays) をお読みください。

