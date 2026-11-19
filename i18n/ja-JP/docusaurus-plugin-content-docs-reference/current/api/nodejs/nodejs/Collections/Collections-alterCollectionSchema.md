---
title: "alterCollectionSchema() | Node.js"
slug: /node/node/Collections-alterCollectionSchema
sidebar_label: "alterCollectionSchema()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションのスキーマを変更します。 | Node.js"
type: docx
token: VD1AddhBlo14dnxad79cWBEinMe
sidebar_position: 30
keywords: 
  - スキーマ変更
  - 関数
  - スキーマ
  - zilliz
  - zilliz cloud
  - クラウド
  - alterCollectionSchema()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# alterCollectionSchema()

この操作は、関数によって生成される出力フィールドを追加することで、コレクションのスキーマを変更します。ベクトル関数の出力では、明示的な `index_type` を含むバインドインデックスのメタデータを指定してください。Milvus は、スキーマの変更と同時にバインドインデックスをアトミックに作成します。

```javascript
await milvusClient.alterCollectionSchema(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.alterCollectionSchema({
    collection_name: string,
    field: FieldType,
    function: FunctionObject,
    index_name?: string,
    extra_params?: Record<string, any>,
    db_name?: string,
    timeout?: number
})
```

**パラメーター:**

- **collection_name** (*string*) -

    **[必須]**

    変更するコレクションの名前です。

- **field** (*[FieldType](./Collections-FieldType)*) -

    **[必須]**

    追加する関数の出力フィールドのスキーマです。

- **function** (*[FunctionObject](./Collections-FunctionObject)*) -

    **[必須]**

    追加する関数のスキーマです。

- **index_name** (*string*) -

    新しいフィールドのバインドインデックスの名前です。

- **extra_params** (*Record&lt;string, any&gt;*) -

    追加のフィールドメタデータです。

- **db_name** (*string*) -

    コレクションが存在するデータベースの名前です。

- **timeout** (*number*) -

    この操作のタイムアウト時間（ミリ秒）です。

**戻り値:**

*Promise&lt;AlterCollectionSchemaResponse&gt;*

このメソッドは、**AlterCollectionSchemaResponse** オブジェクトに解決される Promise を返します。

```javascript
{
    alter_status: ResStatus,
    index_status?: ResStatus
}
```

**パラメーター:**

- **alter_status** (*ResStatus*) -

    スキーマの変更が成功したかどうかを報告する **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合、**0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合、**Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合、空文字列のままです。

- **index_status** (*ResStatus*) -

    非推奨です。このメンバーは `AlterCollectionSchema` の通信レスポンスから削除されました。代わりに **alter_status** を使用してください。

**例外:**

- **Error**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```javascript
import { MilvusClient, DataType, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.alterCollectionSchema({
    collection_name: 'my_collection',
    field: {
        name: 'sparse_vector',
        data_type: DataType.SparseFloatVector,
        is_function_output: true,
    },
    function: {
        name: 'my_bm25_function',
        type: FunctionType.BM25,
        input_field_names: ['text'],
        output_field_names: ['sparse_vector'],
        params: {},
    },
});
```
