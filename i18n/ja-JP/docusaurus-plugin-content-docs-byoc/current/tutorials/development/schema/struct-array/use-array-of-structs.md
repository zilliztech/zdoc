---
title: "StructArray の概要 | BYOC"
slug: /use-array-of-structs
sidebar_label: "概要"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "1 つのエンティティに、複数のチャンクを持つ 1 つのドキュメント、複数の visual patch を持つ 1 つのページ、複数のクリップを持つ 1 つの動画のような、構造化された要素の順序付きリストを保存する必要がある場合は StructArray を使用します。StructArray はこれらの要素を親エンティティ内に保持しながら、各要素内のフィールドに対する vector search と scalar filtering も可能にします。 | BYOC"
type: origin
token: VlAlwAJvEiVVW6k0RBvcvkpWnhK
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# StructArray の概要

1 つのエンティティに、複数のチャンクを持つ 1 つのドキュメント、複数の visual patch を持つ 1 つのページ、複数のクリップを持つ 1 つの動画のような、構造化された要素の順序付きリストを保存する必要がある場合は StructArray を使用します。StructArray はこれらの要素を親エンティティ内に保持しながら、各要素内のフィールドに対する vector search と scalar filtering も可能にします。

## StructArray とは何ですか？\{#what-is-structarray}

**StructArray** は、struct の配列とも呼ばれ、各エンティティ内に Struct 要素の順序付きセットを保存します。配列内のすべての Struct 要素は同じ schema に従います。Struct 要素には scalar subfield、vector subfield、またはその両方を含めることができます。

たとえば、ある collection は 1 つの記事を 1 つのエンティティとして保存し、そのチャンクを `chunks` という名前の StructArray フィールドに保存できます。各チャンクには、テキスト、セクションのメタデータ、品質スコア、および 1 つ以上の vector embedding を含めることができます。

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

この例の 2 つの vector subfield は、同じチャンクを 2 つの検索観点から表しています。`chunks[emb_list_vector]` は `MAX_SIM*` メトリクスを使用した EmbeddingList search を想定しており、`chunks[emb]` は `COSINE`、`IP`、`L2` などの通常の vector metrics を使用した element-level search を想定しています。

</Admonition>

## StructArray を使用するタイミング\{#when-to-use-structarray}

返したい自然な単位が、検索またはフィルタリングしたい自然な単位よりも大きい場合は StructArray を使用します。

| Use case | StructArray が役立つ理由 | 一般的な StructArray フィールド |
| --- | --- | --- |
| ドキュメント検索 | 1 つのドキュメントを 1 つのエンティティとして保存しつつ、そのチャンク全体を検索できます。 | `chunks` |
| Late-interaction retrieval | ドキュメントまたはページを embedding list として保存し、`MAX_SIM*` でスコアリングできます。 | `chunks[emb_list_vector]` または `patches[emb]` |
| Element-level retrieval | 最も関連性の高い chunk、clip、patch、または observation を、その配列オフセットを含めて返します。 | `chunks[emb]` |
| Structured filtering | section、score、page、フラグなど、Struct 要素内の scalar subfield でフィルタリングできます。 | `chunks[section]`, `chunks[quality_score]` |
| 重複する親結果の削減 | 各子要素を個別の行として保存する代わりに、同じ親エンティティの配下に子要素を保持します。 | `chunks`, `clips`, `patches` |

## 判断マトリクス\{#decision-matrix}

適切な StructArray の使い方を選ぶには、次のマトリクスを使用してください。

| 目的 | 推奨される方法 | 結果の粒度 | ここから開始 |
| --- | --- | --- | --- |
| 多数の構造化された子要素を持つ 1 つの親オブジェクトをモデル化する。 | StructArray フィールドを作成する。 | エンティティに順序付き Struct 要素が含まれる。 | [StructArray フィールドの作成](./create-struct-array) |
| ネストされた子データを含む親レコードを挿入する。 | StructArray フィールドが Struct オブジェクトのリストであるエンティティを挿入する。 | エンティティレベルの挿入。 | [StructArray フィールドへのデータ挿入](./insert-struct-array) |
| ColBERT、ColPali、またはドキュメントレベルの late-interaction retrieval を実行する。 | `MAX_SIM*` index を使用した EmbeddingList search を使用する。 | エンティティレベル。 | [Embedding List による検索](./tutorial-colbert-colpali) |
| 個々の chunk、clip、または patch を検索する。 | 通常の vector metric による element-level search を使用する。 | 利用可能な場合はオフセット付きの Struct 要素レベル。 | [StructArray を使用した基本的な Vector Search](./search-with-struct-array) |
| scalar 条件に一致する要素に element-level vector search を制限する。 | `element_filter` を使用する。 | 要素レベルのフィルタリング。結果の形状は検索タイプによって異なります。 | [StructArray を使用した Filtered Search](./filtered-search-with-struct-arrays) |
| 条件を満たす Struct 要素の数に基づいてエンティティを選択する。 | `MATCH_ANY`、`MATCH_ALL`、`MATCH_LEAST`、`MATCH_MOST`、または `MATCH_EXACT` を使用する。 | エンティティレベル。 | [StructArray Operators](./struct-array-filtering) |
| StructArray の vector subfield に対して score または distance の境界を使用する。 | element-level range search を使用する。 | Struct 要素レベル。 | [StructArray を使用した Range Search](./range-search-with-struct-arrays) |
| element-level search の後、親エンティティごとに最大 1 件の結果を返す。 | 主キーによる grouping search を使用する。 | grouping 後はエンティティレベル。 | [StructArray を使用した Grouping Search](./grouping-search-with-struct-array) |
| StructArray の要素検索を別の vector field と組み合わせる。 | 1 つの AnnSearchRequest で StructArray の vector subfield を対象にした hybrid search を使用する。 | 要素レベルのサブ検索、エンティティレベルの reranking。 | [StructArray を使用した Hybrid Search](./hybrid-search-with-struct-array) |

## 2 つの検索モデルを理解する\{#understand-the-two-search-models}

<Grid columnSize="2" widthRatios="50,50">

    <div>

        ### EmbeddingList search\{#embeddinglist-search}

        EmbeddingList search は、StructArray の vector subfield 内の vectors を、親エンティティに対する 1 つの embedding list として扱います。クエリも embedding list です。Zilliz Cloud は、`MAX_SIM*` metric を使用してクエリ embedding list と保存された embedding list を比較し、一致するエンティティを返します。

        - クエリデータ: embedding list。

        - metric ファミリー: `MAX_SIM*`。

        - 結果の粒度: エンティティレベル。

        - 最適な用途: ドキュメントレベルまたはページレベルの late-interaction retrieval。

    </div>

    <div>

        ### Element-level search\{#element-level-search}

        Element-level search は、各 Struct 要素を独立した vector-search 候補として扱います。各ヒットは StructArray フィールド内の一致した要素を表し、grouping されていない結果では要素オフセットを公開できます。

        - クエリデータ: 通常の vector。

        - metric ファミリー: 通常の vector metrics。

        - 結果の粒度: Struct 要素レベル。

        - 最適な用途: chunk レベル、clip レベル、または patch レベルの検索。

    </div>

</Grid>

<Admonition type="warning" icon="🚧" title="警告">

collection で EmbeddingList search と element-level search の両方が必要な場合は、2 つの別々の vector subfield を使用してください。vector field または vector subfield は 1 つの index しか受け付けられず、2 つの検索モードでは異なる metric ファミリーが必要です。

</Admonition>

## ドキュメントマップ\{#documentation-map}

StructArray のドキュメントは、モデリングページと検索ページに分かれています。モデリングページはデータの定義と準備に使用します。検索ページは、適切な retrieval と filtering の動作を選ぶために使用します。

| Area | Page | 用途 |
| --- | --- | --- |
| Modeling | [StructArray フィールドの作成](./create-struct-array) | Struct schema を定義し、StructArray フィールドを追加する。 |
| Modeling | [StructArray フィールドへのデータ挿入](./insert-struct-array) | ネストされた StructArray データを準備して挿入する。 |
| Modeling | [StructArray フィールドのインデックス作成](./index-struct-array) | StructArray の subfield に vector index と scalar index を作成する。 |
| Reference | [StructArray の制限](./struct-array-limits) | schema、data type、index、search、filter、および version の制限を確認する。 |
| Search | [StructArray を使用した基本的な Vector Search](./search-with-struct-array) | EmbeddingList search と element-level vector search を比較する。 |
| Search | [StructArray を使用した Range Search](./range-search-with-struct-arrays) | StructArray の vector subfield に range 制約を使用する。 |
| Search | [StructArray を使用した Grouping Search](./grouping-search-with-struct-array) | element-level search の結果を主キーでグループ化する。 |
| Search | [StructArray を使用した Hybrid Search](./hybrid-search-with-struct-array) | StructArray の element-level search を他の vector search と組み合わせる。 |
| Search | [StructArray を使用した Filtered Search](./filtered-search-with-struct-arrays) | search、query、hybrid search で StructArray filters を使用する。 |
| Search | [Embedding List による検索](./tutorial-colbert-colpali) | StructArray を使用して ColBERT および ColPali スタイルの retrieval system を構築する。 |
| Filter | [StructArray Operators](./struct-array-filtering) | `element_filter` と `MATCH_*` operators のリファレンス構文。 |

## 最初に確認すべき主な制限\{#key-limits-to-check-first}

- Struct は Array field の要素型として使用できます。トップレベルの collection field としては使用しません。

- 同じ StructArray フィールド内のすべての Struct 要素は、1 つの事前定義された schema を共有します。

- vector subfield には index が必要です。EmbeddingList search は `MAX_SIM*` metrics を使用し、element-level search は通常の vector metrics を使用します。

- `element_filter` と `MATCH_*` は StructArray フィールド内の scalar subfield 用です。`$[subfield]` はこれらの operators の内部でのみ使用してください。

- 一部の検索の組み合わせは version による制約またはモード固有の制約があります。range search、grouping search、hybrid search、nullable fields、または動的に追加される fields に依存する前に、[StructArray の制限](./struct-array-limits) を確認してください。

## 次のステップ\{#next-steps}

1. schema を設計するには、[StructArray フィールドの作成](./create-struct-array) を参照してください。

1. データを準備するには、[StructArray フィールドへのデータ挿入](./insert-struct-array) を参照してください。

1. indexes を選択するには、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

1. StructArray の vector subfield を検索するには、まず [StructArray を使用した基本的な Vector Search](./search-with-struct-array) を参照してください。

1. StructArray の scalar subfield をフィルタリングするには、[StructArray Operators](./struct-array-filtering) および [StructArray を使用した Filtered Search](./filtered-search-with-struct-arrays) を参照してください。

