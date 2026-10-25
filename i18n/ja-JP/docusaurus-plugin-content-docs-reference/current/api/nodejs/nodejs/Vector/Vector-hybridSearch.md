---
title: "hybridSearch() | Node.js"
slug: /node/node/Vector-hybridSearch
sidebar_label: "hybridSearch()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、複数のベクトルクエリを実行して集約結果を返すハイブリッド検索を実行します。 | Node.js"
type: docx
token: Ph9ldBswooKwebxKI9EcqSu4nlc
sidebar_position: 4
keywords: 
  - 音声類似検索
  - Elastic ベクトルデータベース
  - Pinecone 対 Milvus
  - Chroma 対 Milvus
  - zilliz
  - zilliz cloud
  - クラウド
  - hybridSearch()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# hybridSearch()

この操作は、複数のベクトルクエリを実行して集約結果を返すハイブリッド検索を実行します。

## リクエスト構文\{#request-syntax}

```typescript
milvusClient.hybridSearch(params: HybridSearchReq)
```

**パラメーター:**

- **collection_name** (*string*) -

    コレクションの名前です。

- **data** (*HybridSearchSingleReq[]*) -

    検索リクエストの配列です。

- **output_fields** (*string[]*) -

    返すフィールドです（オプション）。

- **partition_names** (*string[]*) -

    パーティション名の配列です（オプション）。

- **filter** (*string*) -

    フィルター式です（オプション）。

- **expr** (*string*) -

    filter の別名です（オプション）。

- **limit** (*number*) -

    返す結果の数です（オプション）。

- **offset** (*number*) -

    スキップする結果の数です（オプション）。

- **rerank** (*RerankerObj | FunctionObject*) -

    リランカー設定です（オプション）。

- **consistency_level** (*ConsistencyLevelEnum*) -

    一貫性レベルです（オプション）。

- **ignore_growing** (*boolean*) -

    増加中のセグメントを無視するかどうかです（オプション）。

- **timeout** (*number*) -

    RPC の実行を許可する時間をミリ秒単位で指定します（オプション）。デフォルトは undefined です。

**戻り値の型:**

*SearchResults&lt;T&gt;*

**戻り値:**

ステータス、recalls、集約された結果エントリを含むハイブリッド検索結果です。hybridSearch は、HybridSearchReq 形式に対して search() のエイリアスです。

**パラメーター:**

- **status** (*ResStatus*) -

    レスポンスステータスです（`{error_code, reason}`）。

- **recalls** (*number[]*) -

    ハイブリッド検索の recalls です。

- **session_ts** (*number*) -

    検索セッションのタイムスタンプです。

- **collection_name** (*string*) -

    検索したコレクションの名前です。

- **results** (*DetermineResultsType&lt;T&gt;*) -

    集約された検索結果の配列です。形式は入力パラメーターによって異なります。

**例外:**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合にスローされます。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
const results = await milvusClient.hybridSearch({
  collection_name: 'my_collection',
  data: [
    {
      data: [1, 2, 3, 4],
      anns_field: 'float_vector',
      limit: 10,
    },
  ],
});
```
