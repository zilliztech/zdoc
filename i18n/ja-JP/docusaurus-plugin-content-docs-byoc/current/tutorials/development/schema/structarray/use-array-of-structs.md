---
title: "StructArray 概要 | BYOC"
slug: /use-array-of-structs
sidebar_label: "概要"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "1 つのエンティティで、複数のチャンクを持つ 1 つのドキュメント、複数の視覚パッチを持つ 1 つのページ、複数のクリップを持つ 1 つの動画など、構造化された要素の順序付きリストを保存する必要がある場合は StructArray を使用します。StructArray はこれらの要素を親エンティティ内に保持しながら、各要素内のフィールドに対するベクトル検索とスカラー フィルタリングも可能にします。 | BYOC"
type: origin
token: VlAlwAJvEiVVW6k0RBvcvkpWnhK
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# StructArray 概要

StructArray は、1 つのエンティティに構造化された要素の順序付きリストを保存する必要がある場合に使用します。たとえば、複数のチャンクを持つ 1 つのドキュメント、複数の視覚パッチを持つ 1 つのページ、複数のクリップを持つ 1 つの動画などです。StructArray はこれらの要素を親エンティティ内に保持しながら、各要素内のフィールドに対するベクトル検索とスカラー フィルタリングも可能にします。

## StructArray とは?\{#what-is-structarray}

**StructArray** は、struct の配列とも呼ばれ、各エンティティ内に Struct 要素の順序付きセットを保存します。配列内のすべての Struct 要素は同じスキーマに従います。Struct 要素には、scalar サブフィールド、vector サブフィールド、またはその両方を含めることができます。

たとえば、ある collection では 1 つの記事を 1 つのエンティティとして保存し、そのチャンクを `chunks` という名前の StructArray フィールドに保存できます。各チャンクには、テキスト、セクション メタデータ、品質スコア、および 1 つ以上のベクトル埋め込みを含めることができます。

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

この例にある 2 つの vector サブフィールドは、同じチャンクを 2 つの検索観点から表しています。`chunks[emb_list_vector]` は `MAX_SIM*` メトリクスを使用した EmbeddingList search 用であり、`chunks[emb]` は `COSINE`、`IP`、`L2` などの通常の vector メトリクスを使用した要素レベル検索用です。

</Admonition>

## StructArray を使用するタイミング\{#when-to-use-structarray}

返したい自然な単位が、検索またはフィルタリングしたい自然な単位より大きい場合は StructArray を使用します。

| ユースケース | StructArray が役立つ理由 | 典型的な StructArray フィールド |
| --- | --- | --- |
| ドキュメント検索 | 1 つのドキュメントを 1 つのエンティティとして保存しつつ、そのチャンク全体を検索できる。 | `chunks` |
| Late-interaction 検索 | ドキュメントまたはページを embedding list として保存し、`MAX_SIM*` でスコアリングできる。 | `chunks[emb_list_vector]` または `patches[emb]` |
| 要素レベル検索 | 最も関連性の高い chunk、clip、patch、または observation を、その配列オフセットを含めて返せる。 | `chunks[emb]` |
| 構造化フィルタリング | section、score、page、flag など、Struct 要素内の scalar サブフィールドでフィルタリングできる。 | `chunks[section]`, `chunks[quality_score]` |
| 重複した親結果の削減 | 各子要素を別々の行として保存する代わりに、同じ親エンティティ配下に子要素を保持できる。 | `chunks`, `clips`, `patches` |

## 決定マトリクス\{#decision-matrix}

適切な StructArray パスを選ぶには、次のマトリクスを使用します。

| 目標 | 推奨パス | 結果の粒度 | 開始地点 |
| --- | --- | --- | --- |
| 多くの構造化された子を持つ 1 つの親オブジェクトをモデル化する。 | StructArray フィールドを作成する。 | エンティティに順序付き Struct 要素が含まれる。 | [StructArray フィールドを作成する](./create-struct-array) |
| ネストした子データを含む親レコードを挿入する。 | StructArray フィールドが Struct オブジェクトのリストであるエンティティを挿入する。 | エンティティ レベルの挿入。 | [StructArray フィールドにデータを挿入する](./insert-struct-array) |
| ColBERT、ColPali、またはドキュメント レベルの late-interaction 検索を実行する。 | `MAX_SIM*` index を使用した EmbeddingList search を使う。 | エンティティ レベル。 | [Embedding List を使って検索する](./tutorial-colbert-colpali) |
| 個々の chunk、clip、または patch を検索する。 | 通常の vector metric を使用した要素レベル検索を使う。 | Struct 要素レベル。利用可能な場合はオフセット付き。 | [StructArray を使った基本ベクトル検索](./search-with-struct-array) |
| scalar 条件に一致する要素に要素レベル vector search を制限する。 | `element_filter` を使う。 | 要素レベル フィルタリング。結果の形状は検索タイプによって異なる。 | [StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) |
| 条件を満たす Struct 要素の数に基づいてエンティティを選択する。 | `MATCH_ANY`, `MATCH_ALL`, `MATCH_LEAST`, `MATCH_MOST`, または `MATCH_EXACT` を使う。 | エンティティ レベル。 | [StructArray 演算子](./struct-array-filtering) |
| StructArray vector サブフィールドに対してスコアまたは距離の境界を使用する。 | 要素レベル range search を使う。 | Struct 要素レベル。 | [StructArray を使った範囲検索](./range-search-with-struct-arrays) |
| 要素レベル検索後に親エンティティごとに最大 1 件の結果を返す。 | 主キーによる grouping search を使う。 | グループ化後はエンティティ レベル。 | [StructArray を使ったグループ化検索](./grouping-search-with-struct-array) |
| StructArray 要素検索を別の vector フィールドと組み合わせる。 | 1 つの AnnSearchRequest が StructArray vector サブフィールドを対象とする hybrid search を使う。 | 要素レベルのサブ検索、エンティティ レベルの reranking。 | [StructArray を使ったハイブリッド検索](./hybrid-search-with-struct-array) |

## 2 つの検索モデルを理解する\{#understand-the-two-search-models}

<Grid columnSize="2" widthRatios="50,50">

    <div>

        ### EmbeddingList search\{#embeddinglist-search}

        EmbeddingList search は、StructArray vector サブフィールド内のベクトルを親エンティティの 1 つの embedding list として扱います。クエリも embedding list です。Zilliz Cloud は `MAX_SIM*` メトリクスを使用してクエリ embedding list と保存済み embedding list を比較し、一致するエンティティを返します。

        - クエリ データ: embedding list。

        - メトリクス ファミリー: `MAX_SIM*`。

        - 結果の粒度: エンティティ レベル。

        - 最適な用途: ドキュメント レベルまたはページ レベルの late-interaction 検索。

    </div>

    <div>

        ### 要素レベル検索\{#element-level-search}

        要素レベル検索は、各 Struct 要素を独立した vector search 候補として扱います。各ヒットは StructArray フィールド内で一致した要素を表し、グループ化されていない結果では要素オフセットを公開できます。

        - クエリ データ: 通常の vector。

        - メトリクス ファミリー: 通常の vector メトリクス。

        - 結果の粒度: Struct 要素レベル。

        - 最適な用途: chunk レベル、clip レベル、または patch レベルの検索。

    </div>

</Grid>

<Admonition type="warning" icon="🚧" title="警告">

collection で EmbeddingList search と要素レベル検索の両方が必要な場合は、2 つの別々の vector サブフィールドを使用してください。vector field または vector サブフィールドは 1 つの index しか受け付けられず、2 つの検索モードでは異なるメトリクス ファミリーが必要です。

</Admonition>

## ドキュメント マップ\{#documentation-map}

StructArray のドキュメントは、モデリング ページと検索ページに分かれています。モデリング ページを使用してデータを定義および準備します。検索ページを使用して、適切な検索およびフィルタリング動作を選択します。

| 領域 | ページ | 用途 |
| --- | --- | --- |
| モデリング | [StructArray フィールドを作成する](./create-struct-array) | Struct スキーマを定義し、StructArray フィールドを追加する。 |
| モデリング | [StructArray フィールドにデータを挿入する](./insert-struct-array) | ネストされた StructArray データを準備して挿入する。 |
| モデリング | [StructArray フィールドにインデックスを作成する](./index-struct-array) | StructArray サブフィールドに vector および scalar index を作成する。 |
| リファレンス | [StructArray の制限](./struct-array-limits) | スキーマ、データ型、index、search、filter、およびバージョンの制限を確認する。 |
| 検索 | [StructArray を使った基本ベクトル検索](./search-with-struct-array) | EmbeddingList search と要素レベル vector search を比較する。 |
| 検索 | [StructArray を使った範囲検索](./range-search-with-struct-arrays) | StructArray vector サブフィールドで range 制約を使う。 |
| 検索 | [StructArray を使ったグループ化検索](./grouping-search-with-struct-array) | 要素レベル検索結果を主キーでグループ化する。 |
| 検索 | [StructArray を使ったハイブリッド検索](./hybrid-search-with-struct-array) | StructArray 要素レベル検索を他の vector search と組み合わせる。 |
| 検索 | [StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) | search、query、および hybrid search で StructArray フィルタを使う。 |
| 検索 | [Embedding List を使って検索する](./tutorial-colbert-colpali) | StructArray を使用して ColBERT および ColPali スタイルの検索システムを構築する。 |
| フィルタ | [StructArray 演算子](./struct-array-filtering) | `element_filter` と `MATCH_*` 演算子のリファレンス構文。 |

## 最初に確認すべき主な制限\{#key-limits-to-check-first}

- Struct は Array field の要素型として使用できます。トップレベルの collection field としては使用しません。

- 同じ StructArray フィールド内のすべての Struct 要素は、1 つの事前定義されたスキーマを共有します。

- vector サブフィールドには index が必要です。EmbeddingList search は `MAX_SIM*` メトリクスを使用し、要素レベル検索は通常の vector メトリクスを使用します。

- `element_filter` と `MATCH_*` は StructArray フィールド内の scalar サブフィールド用です。`$[subfield]` はこれらの演算子内でのみ使用してください。

- 一部の検索の組み合わせは、バージョン制限またはモード固有です。range search、grouping search、hybrid search、nullable fields、または動的に追加された fields に依存する前に、[StructArray の制限](./struct-array-limits) を確認してください。

## 次のステップ\{#next-steps}

1. スキーマを設計するには、[StructArray フィールドを作成する](./create-struct-array) をお読みください。

1. データを準備するには、[StructArray フィールドにデータを挿入する](./insert-struct-array) をお読みください。

1. index を選択するには、[StructArray フィールドにインデックスを作成する](./index-struct-array) をお読みください。

1. StructArray vector サブフィールドを検索するには、まず [StructArray を使った基本ベクトル検索](./search-with-struct-array) を参照してください。

1. StructArray scalar サブフィールドをフィルタリングするには、[StructArray 演算子](./struct-array-filtering) と [StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) をお読みください。

