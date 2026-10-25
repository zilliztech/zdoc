---
title: "alterCollectionSchema() | Node.js"
slug: /node/node/Collections-alterCollectionSchema
sidebar_label: "alterCollectionSchema()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションスキーマに関数ベースの出力フィールドを追加します。 | Node.js"
type: docx
token: VD1AddhBlo14dnxad79cWBEinMe
sidebar_position: 30
keywords: 
  - DiskANN
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionSchema()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# alterCollectionSchema()

この操作は、コレクションスキーマに関数ベースの出力フィールドを追加します。

## リクエスト構文\{#request-syntax}

```typescript
milvusClient.alterCollectionSchema({ collection_name, field, function, db_name?, timeout? })
```

**パラメータ:**

- **collection_name** (*string*) -

    既存のコレクションの名前です。

- **field** (*FieldType*) -

    追加する関数出力フィールドのスキーマです。

- **function** (*FunctionObject*) -

    追加する関数のスキーマです。

- **db_name** (*string*) -

    コレクションを保持するデータベースの名前です。

- **timeout** (*number*) -

    省略可能な RPC タイムアウト時間（ミリ秒）です。

**戻り値の型:**

*AlterCollectionSchemaResponse*

**戻り値:**

Milvus からのレスポンスです。`index_status` フィールドは通信時のレスポンスから削除され、互換性のためにのみ残っています。

**パラメータ:**

- **alter_status** (*ResStatus*) -

    スキーマ変更のステータス: `{error_code, reason}`。

- **index_status** (*ResStatus*) -

    非推奨であり、通信時のレスポンスから削除されています。互換性のために保持されています。

**例外:**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合にスローされます。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
await milvusClient.alterCollectionSchema({
  collection_name: 'my_collection',
  function: {
    name: 'bm25_fn',
    type: 'BM25',
    input_field_names: ['text'],
    output_field_names: ['sparse_vector'],
    params: {},
  },
  field: {
    name: 'sparse_vector',
    type: 'SparseFloatVector',
  },
});
```
