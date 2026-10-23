---
title: "addCollectionFunction() | Node.js"
slug: /node/node/Collections-addCollectionFunction
sidebar_label: "addCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、既存のコレクションに関数を追加します。 | Node.js"
type: docx
token: VyADdglU4ohvGTxHuwTc6yBRnTe
sidebar_position: 21
keywords: 
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
  - IVF
  - zilliz
  - Zilliz Cloud
  - クラウド
  - addCollectionFunction()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionFunction()

この操作では、既存のコレクションに関数を追加します。

## リクエスト構文\{#request-syntax}

```typescript
milvusClient.addCollectionFunction({ collection_name, function, db_name?, timeout? })
```

**パラメーター：**

- **collection_name** (*string*) -

    既存のコレクションの名前です。

- **function** (*FunctionObject*) -

    コレクションに追加する関数オブジェクトです。

- **db_name** (*string*) -

    コレクションを格納するデータベースの名前です。

- **timeout** (*number*) -

    RPC に許容する時間をミリ秒単位で指定します（省略可能）。undefined に設定した場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

**戻り値：**

*ResStatus*

操作の応答ステータスは、`{error_code, reason}` の形式です。

**パラメーター：**

- **error_code** (*number*) -

    エラーコード番号です。0 は成功を意味します。

- **reason** (*string*) -

    エラーの原因です（存在する場合）。

**例外：**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
await milvusClient.addCollectionFunction({
  collection_name: 'my_collection',
  function: {
    name: 'bm25_fn',
    type: 'BM25',
    input_field_names: ['text'],
    output_field_names: ['sparse_vector'],
    params: {},
  },
});
```
