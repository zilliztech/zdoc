---
title: "StructArray の概要 | Cloud"
slug: /use-array-of-structs
sidebar_label: "概要"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "1 つのエンティティが、多数のチャンクを持つ 1 つのドキュメント、多数の視覚パッチを持つ 1 つのページ、多数のクリップを持つ 1 つの動画など、構造化された要素の順序付きリストを保存する必要がある場合は、StructArray を使用します。StructArray は、各要素内のフィールドに対するベクトル検索とスカラーフィルタリングを可能にしながら、これらの要素を親エンティティの内部に保持します。 | Cloud"
type: origin
token: VlAlwAJvEiVVW6k0RBvcvkpWnhK
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# StructArray の概要

1 つのエンティティが、多数のチャンクを持つ 1 つのドキュメント、多数の視覚パッチを持つ 1 つのページ、多数のクリップを持つ 1 つの動画など、構造化された要素の順序付きリストを保存する必要がある場合は、StructArray を使用します。StructArray は、各要素内のフィールドに対するベクトル検索とスカラーフィルタリングを可能にしながら、これらの要素を親エンティティの内部に保持します。

## StructArray とは\{#what-is-structarray}

**StructArray** は、array of structs とも呼ばれ、各エンティティに Struct 要素の順序付きセットを保存します。配列内のすべての Struct 要素は同じスキーマに従います。Struct 要素には、スカラーサブフィールド、ベクトルサブフィールド、またはその両方を含めることができます。

たとえば、コレクションは 1 つの記事を 1 つのエンティティとして保存し、そのチャンクを `chunks` という名前の StructArray フィールドに保存できます。各チャンクには、テキスト、セクションメタデータ、品質スコア、および 1 つ以上のベクトル埋め込みを含めることができます。

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

<Admonition type="info" title="Notes">

この例の 2 つのベクトルサブフィールドは、同じチャンクを 2 つの検索観点から表しています。`chunks[emb_list_vector]` は `MAX_SIM*` メトリクスを使用する EmbeddingList 検索を目的としており、`chunks[emb]` は `COSINE`、`IP`、`L2` などの通常のベクトルメトリクスを使用する要素レベル検索を目的としています。

</Admonition>

## StructArray を使用するタイミング\{#when-to-use-structarray}

返したい自然な単位が、検索またはフィルタリングしたい自然な単位よりも大きい場合は、StructArray を使用します。

| ユースケース | StructArray が役立つ理由 | 一般的な StructArray フィールド |
| --- | --- | --- |
| ドキュメント検索 | 1 つのドキュメントを 1 つのエンティティとして保存しながら、そのチャンクを横断して検索します。 | `chunks` |
| Late-interaction 検索 | ドキュメントまたはページを埋め込みリストとして保存し、`MAX_SIM*` でスコアリングします。 | `chunks[emb_list_vector]` または `patches[emb]` |
| 要素レベルの検索 | 最も関連性の高いチャンク、クリップ、パッチ、または観測を、その配列オフセットとともに返します。 | `chunks[emb]` |
| 構造化フィルタリング | セクション、スコア、ページ、フラグなど、Struct 要素内のスカラーサブフィールドでフィルタリングします。 | `chunks[section]`, `chunks[quality_score]` |
| 重複する親結果の削減 | 各子要素を個別の行として保存するのではなく、同じ親エンティティの下に子要素を保持します。 | `chunks`, `clips`, `patches` |

## 判断マトリクス\{#decision-matrix}

適切な StructArray の方法を選択するには、次のマトリクスを使用してください。

| 目標 | 推奨される方法 | 結果の粒度 | 開始ページ |
| --- | --- | --- | --- |
| 多数の構造化された子要素を持つ 1 つの親オブジェクトをモデル化する。 | StructArray フィールドを作成する。 | エンティティに順序付きの Struct 要素が含まれる。 | [StructArray フィールドを作成する](./create-struct-array) |
| ネストされた子データを持つ親レコードを挿入する。 | StructArray フィールドが Struct オブジェクトのリストであるエンティティを挿入する。 | エンティティレベルの挿入。 | [StructArray フィールドにデータを挿入する](./insert-struct-array) |
| ColBERT、ColPali、またはドキュメントレベルの late-interaction 検索を実行する。 | `MAX_SIM*` インデックスを使用した EmbeddingList 検索を使用する。 | エンティティレベル。 | [EmbeddingLists を使った検索: ColBERT と ColPali](./tutorial-colbert-colpali) |
| 個々のチャンク、クリップ、またはパッチを検索する。 | 通常のベクトルメトリクスを使用した要素レベル検索を使用する。 | Struct 要素レベル。利用可能な場合はオフセットも含む。 | [StructArray を使った基本的なベクトル検索](./search-with-struct-array) |
| スカラー条件に一致する要素に要素レベルのベクトル検索を制限する。 | `element_filter` を使用する。 | 要素レベルのフィルタリング。結果の形式は検索タイプによって異なります。 | [StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) |
| 条件を満たす Struct 要素の数によってエンティティを選択する。 | `MATCH_ANY`、`MATCH_ALL`、`MATCH_LEAST`、`MATCH_MOST`、または `MATCH_EXACT` を使用する。 | エンティティレベル。 | [StructArray 演算子](./struct-array-filtering) |
| StructArray のベクトルサブフィールドにスコアまたは距離の境界を使用する。 | 要素レベルの範囲検索を使用する。 | Struct 要素レベル。 | [StructArray を使用した範囲検索](./range-search-with-struct-arrays) |
| 要素レベル検索の後、親エンティティごとに最大 1 件の結果を返す。 | プライマリキーによるグループ化検索を使用する。 | グループ化後のエンティティレベル。 | [StructArray を使用したグループ化検索](./grouping-search-with-struct-array) |
| StructArray の要素検索を別のベクトルフィールドと組み合わせる。 | StructArray のベクトルサブフィールドを対象とする 1 つの AnnSearchRequest を使用したハイブリッド検索を使用する。 | 要素レベルのサブ検索、エンティティレベルの再ランキング。 | [StructArray を使ったハイブリッド検索](./hybrid-search-with-struct-array) |

## 2 つの検索モデルを理解する\{#understand-the-two-search-models}

<Grid columnSize="2" widthRatios="50,50">

    <div>

        ### EmbeddingList 検索\{#embeddinglist-search}

        EmbeddingList 検索では、StructArray のベクトルサブフィールド内のベクトルを、親エンティティの 1 つの埋め込みリストとして扱います。クエリも埋め込みリストです。Zilliz Cloud は、`MAX_SIM*` メトリクスを使用してクエリの埋め込みリストと保存された埋め込みリストを比較し、一致するエンティティを返します。

        - クエリデータ：埋め込みリスト。

        - メトリクスファミリー：`MAX_SIM*`。

        - 結果の粒度：エンティティレベル。

        - 最適な用途：ドキュメントレベルまたはページレベルの late-interaction 検索。

    </div>

    <div>

        ### 要素レベル検索\{#element-level-search}

        要素レベル検索では、各 Struct 要素を独立したベクトル検索の候補として扱います。各ヒットは StructArray フィールド内で一致した要素を表し、グループ化されていない結果では要素のオフセットを公開できます。

        - クエリデータ：通常のベクトル。

        - メトリクスファミリー：通常のベクトルメトリクス。

        - 結果の粒度：Struct 要素レベル。

        - 最適な用途：チャンクレベル、クリップレベル、またはパッチレベルの検索。

    </div>

</Grid>

<Admonition type="warning" title="Warning">

コレクションで EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々のベクトルサブフィールドを使用してください。1 つのベクトルフィールドまたはベクトルサブフィールドが受け付けるインデックスは 1 つだけであり、2 つの検索モードには異なるメトリクスファミリーが必要です。

</Admonition>

## ドキュメントマップ\{#documentation-map}

StructArray のドキュメントは、モデリングページと検索ページに分かれています。モデリングページはデータの定義と準備に使用します。検索ページは適切な検索とフィルタリングの動作を選択するために使用します。

| 領域 | ページ | 用途 |
| --- | --- | --- |
| Modeling | [StructArray フィールドを作成する](./create-struct-array) | Struct スキーマを定義し、StructArray フィールドを追加します。 |
| Modeling | [StructArray フィールドにデータを挿入する](./insert-struct-array) | ネストされた StructArray データを準備して挿入します。 |
| Modeling | [StructArray フィールドにインデックスを作成する](./index-struct-array) | StructArray サブフィールドにベクトルインデックスとスカラーインデックスを作成します。 |
| Reference | [StructArray の制限](./struct-array-limits) | スキーマ、データ型、インデックス、検索、フィルタ、およびバージョンの制限を確認します。 |
| Search | [StructArray を使った基本的なベクトル検索](./search-with-struct-array) | EmbeddingList 検索と要素レベルのベクトル検索を比較します。 |
| Search | [StructArray を使用した範囲検索](./range-search-with-struct-arrays) | StructArray のベクトルサブフィールドで範囲制約を使用します。 |
| Search | [StructArray を使用したグループ化検索](./grouping-search-with-struct-array) | 要素レベル検索の結果をプライマリキーでグループ化します。 |
| Search | [StructArray を使ったハイブリッド検索](./hybrid-search-with-struct-array) | StructArray の要素レベル検索を他のベクトル検索と組み合わせます。 |
| Search | [StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) | 検索、クエリ、およびハイブリッド検索で StructArray フィルタを使用します。 |
| Search | [EmbeddingLists を使った検索: ColBERT と ColPali](./tutorial-colbert-colpali) | StructArray を使用して ColBERT および ColPali スタイルの検索システムを構築します。 |
| Filter | [StructArray 演算子](./struct-array-filtering) | `element_filter` および `MATCH_*` 演算子のリファレンス構文。 |

## 最初に確認すべき主な制限\{#key-limits-to-check-first}

- Struct は Array フィールドの要素型として使用できます。トップレベルのコレクションフィールドとしては使用されません。

- 同じ StructArray フィールド内のすべての Struct 要素は、1 つの事前定義されたスキーマを共有します。

- ベクトルサブフィールドにはインデックスが必要です。EmbeddingList 検索では `MAX_SIM*` メトリクスを使用し、要素レベル検索では通常のベクトルメトリクスを使用します。

- `element_filter` と `MATCH_*` は、StructArray フィールド内のスカラーサブフィールド用です。`$[subfield]` は、これらの演算子の内部でのみ使用してください。

- 一部の検索の組み合わせは、バージョンによる制限またはモード固有です。範囲検索、グループ化検索、ハイブリッド検索、nullable なフィールド、または動的に追加されたフィールドに依存する前に、[StructArray の制限](./struct-array-limits) を確認してください。

## 次のステップ\{#next-steps}

1. スキーマを設計するには、[StructArray フィールドを作成する](./create-struct-array) をお読みください。

1. データを準備するには、[StructArray フィールドにデータを挿入する](./insert-struct-array) をお読みください。

1. インデックスを選択するには、[StructArray フィールドにインデックスを作成する](./index-struct-array) をお読みください。

1. StructArray のベクトルサブフィールドを検索するには、まず [StructArray を使った基本的なベクトル検索](./search-with-struct-array) をお読みください。

1. StructArray のスカラーサブフィールドをフィルタリングするには、[StructArray 演算子](./struct-array-filtering) と [StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) をお読みください。

