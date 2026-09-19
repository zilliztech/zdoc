---
title: "StructArray の概要 | BYOC"
slug: /use-array-of-structs
sidebar_label: "概要"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "多数のチャンクを持つ 1 つのドキュメント、多数のビジュアルパッチを持つ 1 つのページ、多数のクリップを持つ 1 つの動画など、1 つのエンティティに構造化された要素の順序付きリストを保存する必要がある場合は StructArray を使用します。StructArray は、これらの要素を親エンティティの内部に保持しながら、各要素内のフィールドに対するベクトル検索とスカラーフィルタリングも可能にします。 | BYOC"
type: origin
token: VlAlwAJvEiVVW6k0RBvcvkpWnhK
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# StructArray の概要

多数のチャンクを持つ 1 つのドキュメント、多数のビジュアルパッチを持つ 1 つのページ、多数のクリップを持つ 1 つの動画など、1 つのエンティティに構造化された要素の順序付きリストを保存する必要がある場合は StructArray を使用します。StructArray は、これらの要素を親エンティティの内部に保持しながら、各要素内のフィールドに対するベクトル検索とスカラーフィルタリングも可能にします。

## StructArray とは\{#what-is-structarray}

**StructArray** は、Struct の配列とも呼ばれ、各エンティティに Struct 要素の順序付きセットを格納します。配列内のすべての Struct 要素は、同じスキーマに従います。Struct 要素には、スカラーサブフィールド、ベクトルサブフィールド、またはその両方を含めることができます。

たとえば、コレクションは 1 つの記事を 1 つのエンティティとして格納し、そのチャンクを `chunks` という名前の StructArray フィールドに格納できます。各チャンクには、テキスト、セクションのメタデータ、品質スコア、および 1 つ以上のベクトル埋め込みを含めることができます。

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

この例の 2 つのベクトルサブフィールドは、同じチャンクを 2 つの検索観点から表現しています。`chunks[emb_list_vector]` は `MAX_SIM*` メトリクスを使用する EmbeddingList 検索向けであり、`chunks[emb]` は `COSINE`、`IP`、`L2` などの通常のベクトルメトリクスを使用する要素レベル検索向けです。

</Admonition>

## StructArray を使用する場合\{#when-to-use-structarray}

返したい自然な単位が、検索またはフィルタリングしたい自然な単位よりも大きい場合は、StructArray を使用します。

| ユースケース | StructArray が役立つ理由 | 一般的な StructArray フィールド |
| --- | --- | --- |
| ドキュメント検索 | 1 つのドキュメントを 1 つのエンティティとして格納しながら、そのチャンクを横断して検索できます。 | `chunks` |
| レイトインタラクション検索 | ドキュメントまたはページを埋め込みリストとして格納し、`MAX_SIM*` でスコアリングできます。 | `chunks[emb_list_vector]` または `patches[emb]` |
| 要素レベル検索 | 配列内のオフセットを含め、最も関連性の高いチャンク、クリップ、パッチ、または観測結果を返します。 | `chunks[emb]` |
| 構造化フィルタリング | セクション、スコア、ページ、フラグなど、Struct 要素内のスカラーサブフィールドでフィルタリングできます。 | `chunks[section]`、`chunks[quality_score]` |
| 親結果の重複の削減 | 各子要素を個別の行として格納する代わりに、同じ親エンティティの下に子要素を保持します。 | `chunks`、`clips`、`patches` |

## 判断マトリクス\{#decision-matrix}

適切な StructArray の方法を選択するには、次のマトリクスを使用してください。

| 目的 | 推奨される方法 | 結果の粒度 | ここから開始 |
| --- | --- | --- | --- |
| 多数の構造化された子要素を持つ 1 つの親オブジェクトをモデル化する。 | StructArray フィールドを作成する。 | エンティティに順序付きの Struct 要素が含まれる。 | [StructArray フィールドを作成する](./create-struct-array) |
| ネストされた子データを持つ親レコードを挿入する。 | StructArray フィールドが Struct オブジェクトのリストであるエンティティを挿入する。 | エンティティレベルの挿入。 | [StructArray フィールドにデータを挿入する](./insert-struct-array) |
| ColBERT、ColPali、またはドキュメントレベルのレイトインタラクション検索を実行する。 | `MAX_SIM*` インデックスを使った EmbeddingList 検索を使用する。 | エンティティレベル。 | [EmbeddingLists で検索する](./tutorial-colbert-colpali) |
| 個々のチャンク、クリップ、またはパッチを検索する。 | 通常のベクトルメトリクスを使った要素レベル検索を使用する。 | Struct 要素レベル。利用可能な場合はオフセットが付与されます。 | [StructArray を使った基本的なベクトル検索](./search-with-struct-array) |
| 要素レベルのベクトル検索を、スカラー条件に一致する要素に制限する。 | `element_filter` を使用する。 | 要素レベルのフィルタリング。結果の形式は検索タイプによって異なります。 | [StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) |
| 条件を満たす Struct 要素の数に基づいてエンティティを選択する。 | `MATCH_ANY`、`MATCH_ALL`、`MATCH_LEAST`、`MATCH_MOST`、または `MATCH_EXACT` を使用する。 | エンティティレベル。 | [StructArray 演算子](./struct-array-filtering) |
| StructArray のベクトルサブフィールドにスコアまたは距離の境界を使用する。 | 要素レベルの範囲検索を使用する。 | Struct 要素レベル。 | [StructArray を使用した範囲検索](./range-search-with-struct-arrays) |
| 要素レベル検索の後、親エンティティごとに最大 1 件の結果を返す。 | 主キーによるグルーピング検索を使用する。 | グルーピング後はエンティティレベル。 | [StructArray を使ったグルーピング検索](./grouping-search-with-struct-array) |
| StructArray の要素検索を別のベクトルフィールドと組み合わせる。 | StructArray のベクトルサブフィールドを対象とする 1 つの AnnSearchRequest によるハイブリッド検索を使用する。 | 要素レベルのサブ検索、エンティティレベルの再ランキング。 | [StructArray を使用したハイブリッド検索](./hybrid-search-with-struct-array) |

## 2 つの検索モデルを理解する\{#understand-the-two-search-models}

<Grid columnSize="2" widthRatios="50,50">

    <div>

        ### EmbeddingList 検索\{#embeddinglist-search}

        EmbeddingList 検索は、StructArray のベクトルサブフィールド内のベクトルを、親エンティティに対する 1 つの埋め込みリストとして扱います。クエリも埋め込みリストです。Zilliz Cloud は `MAX_SIM*` メトリクスを使用して、クエリの埋め込みリストと格納された埋め込みリストを比較し、一致するエンティティを返します。

        - クエリデータ: 埋め込みリスト。

        - メトリクスファミリー: `MAX_SIM*`。

        - 結果の粒度: エンティティレベル。

        - 最適な用途: ドキュメントレベルまたはページレベルのレイトインタラクション検索。

    </div>

    <div>

        ### 要素レベル検索\{#element-level-search}

        要素レベル検索は、各 Struct 要素を独立したベクトル検索の候補として扱います。各ヒットは StructArray フィールド内で一致した要素を表し、グルーピングされていない結果では要素のオフセットを公開できます。

        - クエリデータ: 通常のベクトル。

        - メトリクスファミリー: 通常のベクトルメトリクス。

        - 結果の粒度: Struct 要素レベル。

        - 最適な用途: チャンクレベル、クリップレベル、またはパッチレベルの検索。

    </div>

</Grid>

<Admonition type="warning" title="Warning">

コレクションで EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々のベクトルサブフィールドを使用してください。ベクトルフィールドまたはベクトルサブフィールドが受け付けるインデックスは 1 つだけであり、2 つの検索モードには異なるメトリクスファミリーが必要です。

</Admonition>

## ドキュメントマップ\{#documentation-map}

StructArray のドキュメントは、モデリングページと検索ページに分かれています。モデリングページはデータの定義と準備に使用します。検索ページは、適切な検索とフィルタリングの動作を選択するために使用します。

| 領域 | ページ | 用途 |
| --- | --- | --- |
| モデリング | [StructArray フィールドを作成する](./create-struct-array) | Struct スキーマを定義し、StructArray フィールドを追加します。 |
| モデリング | [StructArray フィールドにデータを挿入する](./insert-struct-array) | ネストされた StructArray データを準備して挿入します。 |
| モデリング | [StructArray フィールドのインデックス作成](./index-struct-array) | StructArray のサブフィールドにベクトルインデックスとスカラーインデックスを作成します。 |
| リファレンス | [StructArray の制限](./struct-array-limits) | スキーマ、データ型、インデックス、検索、フィルター、およびバージョンの制限を確認します。 |
| 検索 | [StructArray を使った基本的なベクトル検索](./search-with-struct-array) | EmbeddingList 検索と要素レベルのベクトル検索を比較します。 |
| 検索 | [StructArray を使用した範囲検索](./range-search-with-struct-arrays) | StructArray のベクトルサブフィールドで範囲条件を使用します。 |
| 検索 | [StructArray を使ったグルーピング検索](./grouping-search-with-struct-array) | 要素レベル検索の結果を主キーでグループ化します。 |
| 検索 | [StructArray を使用したハイブリッド検索](./hybrid-search-with-struct-array) | StructArray の要素レベル検索を他のベクトル検索と組み合わせます。 |
| 検索 | [StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) | 検索、クエリ、およびハイブリッド検索で StructArray フィルターを使用します。 |
| 検索 | [EmbeddingLists で検索する](./tutorial-colbert-colpali) | StructArray を使用して ColBERT および ColPali 形式の検索システムを構築します。 |
| フィルター | [StructArray 演算子](./struct-array-filtering) | `element_filter` および `MATCH_*` 演算子のリファレンス構文です。 |

## 最初に確認すべき主な制限\{#key-limits-to-check-first}

- Struct は Array フィールドの要素型として使用できます。コレクションのトップレベルフィールドとしては使用しません。

- 同じ StructArray フィールド内のすべての Struct 要素は、1 つの事前定義されたスキーマを共有します。

- ベクトルサブフィールドにはインデックスが必要です。EmbeddingList 検索は `MAX_SIM*` メトリクスを使用し、要素レベル検索は通常のベクトルメトリクスを使用します。

- `element_filter` および `MATCH_*` は、StructArray フィールド内のスカラーサブフィールドを対象とするものです。`$[subfield]` はこれらの演算子の内部でのみ使用してください。

- 一部の検索の組み合わせには、バージョンによる制限またはモード固有の制限があります。範囲検索、グルーピング検索、ハイブリッド検索、nullable フィールド、または動的に追加されたフィールドに依存する前に、[StructArray の制限](./struct-array-limits) を確認してください。

## 次のステップ\{#next-steps}

1. スキーマを設計するには、[StructArray フィールドを作成する](./create-struct-array) を参照してください。

1. データを準備するには、[StructArray フィールドにデータを挿入する](./insert-struct-array) を参照してください。

1. インデックスを選択するには、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

1. StructArray のベクトルサブフィールドを検索するには、まず [StructArray を使った基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. StructArray のスカラーサブフィールドをフィルタリングするには、[StructArray 演算子](./struct-array-filtering) および [StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。
