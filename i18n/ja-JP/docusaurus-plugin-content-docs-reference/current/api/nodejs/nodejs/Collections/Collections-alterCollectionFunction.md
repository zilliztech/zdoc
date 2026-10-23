---
title: "alterCollectionFunction() | Node.js"
slug: /node/node/Collections-alterCollectionFunction
sidebar_label: "alterCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクション内の既存の関数を変更します。 | Node.js"
type: docx
token: McjWdWlspoubE4x3atYc4Fn9n3c
sidebar_position: 22
keywords: 
  - knn
  - 画像検索
  - LLMs
  - 機械学習
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionFunction()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionFunction()

この操作は、コレクション内の既存の関数を変更します。

## リクエスト構文\{#request-syntax}

```typescript
milvusClient.alterCollectionFunction({ collection_name, function_name, function, db_name?, timeout? })
```

**パラメーター:**

- **collection_name** (*string*) -

    既存のコレクションの名前です。

- **function_name** (*string*) -

    変更する関数の名前です。

- **function** (*FunctionObject*) -

    置換後の関数スキーマです。

- **db_name** (*string*) -

    コレクションを格納するデータベースの名前です。

- **timeout** (*number*) -

    RPC に許可する時間をミリ秒単位で指定します（任意）。undefined に設定すると、サーバーが応答するかエラーが発生するまで、クライアントは待機し続けます。デフォルトは undefined です。

**戻り値:**

*ResStatus*

操作のレスポンスステータスは、`{error_code, reason}` の形式です。

**パラメーター:**

- **error_code** (*number*) -

    エラーコード番号です。0 は成功を意味します。

- **reason** (*string*) -

    エラーの原因です（存在する場合）。

**例外:**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合にスローされます。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
await milvusClient.alterCollectionFunction({
  collection_name: 'my_collection',
  function_name: 'bm25_fn',
  function: {
    name: 'bm25_fn',
    type: 'BM25',
    input_field_names: ['text'],
    output_field_names: ['sparse_vector'],
    params: {},
  },
});
```
