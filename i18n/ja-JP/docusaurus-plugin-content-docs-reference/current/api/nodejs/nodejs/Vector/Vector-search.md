---
title: "search() | Node.js"
slug: /node/node/Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクション内でベクトルの類似度検索を実行します。 | Node.js"
type: docx
token: HYv3d0NiRoc09Bx4rz0cIhqknb5
sidebar_position: 7
keywords: 
  - マルチモーダル RAG
  - LLM ハルシネーション
  - ハイブリッド検索
  - 字句検索
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - search()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# search()

この操作は、コレクション内でベクトルの類似度検索を実行します。

## リクエスト構文\{#request-syntax}

```typescript
milvusClient.search({ collection_name, data, ... })
```

**パラメーター:**

- **collection_name** (*string*) -

    コレクションの名前です。

- **db_name** (*string*) -

    データベースの名前です（オプション）。

- **data** (*SearchData | SearchData[]*) -

    検索するベクトルまたはテキストです。ids を指定した場合、必須ではありません。

- **ベクトル** (*SearchData | SearchData[]*) -

    data のエイリアスです（オプション）。

- **ids** (*number[] | string[]*) -

    Search By PK 用の主キー ID です。指定した場合、ベクトルデータは必要ありません。

- **partition_names** (*string[]*) -

    パーティション名の配列です（オプション）。

- **anns_field** (*string*) -

    ベクトルフィールド名です。マルチベクトルコレクションでは必須です（オプション）。

- **output_fields** (*string[]*) -

    返すフィールドです（オプション）。

- **limit** (*number*) -

    返す結果の数です（オプション）。

- **topk** (*number*) -

    limit のエイリアスです（オプション）。

- **offset** (*number*) -

    スキップする結果の数です（オプション）。

- **filter** (*string*) -

    フィルター式です（オプション）。

- **expr** (*string*) -

    filter のエイリアスです（オプション）。

- **exprValues** (*keyValueObj*) -

    フィルター式のテンプレート値です（オプション）。

- **params** (*keyValueObj*) -

    追加の検索パラメーターです（オプション）。

- **metric_type** (*string*) -

    距離メトリクスの種類です（オプション）。

- **consistency_level** (*ConsistencyLevelEnum*) -

    整合性レベルです（オプション）。

- **ignore_growing** (*boolean*) -

    Growing セグメントを無視するかどうかです（オプション）。

- **group_by_field** (*string*) -

    結果のグループ化に使用するフィールドです（オプション）。

- **group_size** (*number*) -

    各グループのサイズです（オプション）。

- **strict_group_size** (*boolean*) -

    グループサイズを厳密に適用するかどうかです（オプション）。

- **order_by_fields** (*OrderByFields*) -

    検索結果の並べ替えに使用するフィールドです。たとえば、`price:asc` または `[{ field: "price", order: "asc" }]` などです（オプション）。

- **hints** (*string*) -

    検索パフォーマンスを向上させるためのヒントです（オプション）。

- **round_decimal** (*number*) -

    スコアを丸める小数点以下の桁数です（オプション）。

- **transformers** (*OutputTransformers*) -

    bf16/f16 ベクトル用のカスタムデータトランスフォーマーです（オプション）。

- **rerank** (*RerankerObj | FunctionObject*) -

    リランカーの構成です（オプション）。

- **nq** (*number*) -

    クエリベクトルの数です（オプション）。

- **timeout** (*number*) -

    RPC に許容される時間をミリ秒単位で指定します（オプション）。デフォルトは undefined です。

**戻り値の型:**

*SearchResults&lt;T&gt;*

**戻り値:**

status、recalls、session_ts、collection_name、result エントリを含む検索結果です。

**パラメーター:**

- **status** (*ResStatus*) -

    応答ステータスです。`{error_code, reason}`。

- **recalls** (*number[]*) -

    検索操作の recalls です。

- **session_ts** (*number*) -

    検索セッションのタイムスタンプです。

- **collection_name** (*string*) -

    検索対象のコレクションの名前です。

- **results** (*DetermineResultsType&lt;T&gt;*) -

    検索結果の配列です。形状は入力パラメーターによって異なります。

- **all_search_count** (*number*) -

    検索操作の合計数です（オプション）。

- **search_iterator_v2_results** (*Record&lt;string, any&gt;*) -

    検索イテレーター v2 の結果です（オプション）。

**例外:**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合にスローされます。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
const milvusClient = new MilvusClient(MILVUS_ADDRESS);
const searchResults = await milvusClient.search({
  collection_name: 'my_collection',
  data: [1, 2, 3, 4],
  limit: 10,
});
```
