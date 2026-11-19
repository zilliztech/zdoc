---
title: "addFunctionField() | Node.js"
slug: /node/node/Collections-addFunctionField
sidebar_label: "addFunctionField()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、関数とともにフィールドをコレクションスキーマに追加します。 | Node.js"
type: docx
token: BjKLdh2SFouRSbxELaqc9b4tnts
sidebar_position: 29
keywords: 
  - フィールドの追加
  - bm25
  - 関数
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - addFunctionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# addFunctionField()

この操作では、関数によって生成されるベクトルフィールドと、それにバインドされたインデックスを既存のコレクションに追加します。

```javascript
await milvusClient.addFunctionField(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.addFunctionField({
    collection_name: string,
    field: FieldType,
    function: FunctionObject,
    index_name?: string,
    extra_params: FunctionFieldIndexParams,
    db_name?: string,
    timeout?: number
})
```

**パラメーター：**

- **collection_name** (*string*) -

    **[必須]**

    関数によって生成されるフィールドを追加するコレクションの名前です。

- **field** (*[FieldType](./Collections-FieldType)*) -

    **[必須]**

    関数出力フィールドのスキーマです。詳細は [FieldType](./Collections-FieldType) を参照してください。

- **function** (*[FunctionObject](./Collections-FunctionObject)*) -

    **[必須]**

    関数のスキーマです。詳細は [FunctionObject](./Collections-FunctionObject) を参照してください。

- **index_name** (*string*) -

    新しいフィールドにバインドされるインデックスの名前です。

- **extra_params** (*FunctionFieldIndexParams*) -

    **[必須]**

    バインドされたインデックスのメタデータです。明示的な `index_type` を指定する必要があります。`AUTOINDEX` はサポートされていません。

- **db_name** (*string*) -

    コレクションが存在するデータベースの名前です。

- **timeout** (*number*) -

    この操作のタイムアウト時間（ミリ秒）です。

**戻り値：**

*Promise&lt;ResStatus&gt;*

このメソッドは、**ResStatus** オブジェクトに解決される Promise を返します。

**例外：**

- **Error**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```javascript
import { MilvusClient, DataType, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.addFunctionField({
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
    index_name: 'sparse_vector_index',
    extra_params: {
        index_type: 'SPARSE_INVERTED_INDEX',
        params: { metric_type: 'BM25' },
    },
});
```
