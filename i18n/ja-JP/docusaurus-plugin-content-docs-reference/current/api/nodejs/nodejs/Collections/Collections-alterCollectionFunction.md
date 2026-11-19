---
title: "alterCollectionFunction() | Node.js"
slug: /node/node/Collections-alterCollectionFunction
sidebar_label: "alterCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクション内のカスタム関数を変更します。 | Node.js"
type: docx
token: DBEFdVorMomen0x4xNEcKkM1n8O
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

---

# alterCollectionFunction()

この操作は、既存のコレクション内のカスタム関数を変更します。

```javascript
await milvusClient.alterCollectionFunction(data: AlterCollectionFunctionReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.alterCollectionFunction({
    collection_name: string,
    function_name: string,
    function: FunctionObject,
    db_name?: string,
    timeout?: number,
})
```

**パラメーター:**

- **collection_name** (*string*) -

    **[必須]**

    変更する関数を含むコレクションの名前です。

- **function_name** (*string*) -

    **[必須]**

    変更する関数の名前です。

- **function** (*[FunctionObject](./Collections-FunctionObject)*) -

    **[必須]**

    更新された関数スキーマです。[FunctionObject](./Collections-FunctionObject) を参照してください。

- **db_name** (*string*) -

    コレクションが存在するデータベースの名前です。

- **timeout** (*number*) -

    この操作のタイムアウト時間（ミリ秒）です。

**戻り値:**

*Promise&lt;ResStatus&gt;*

このメソッドは、**ResStatus** オブジェクトに解決される Promise を返します。

**例外:**

- **Error**

    この操作中にエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```javascript
import { MilvusClient, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.alterCollectionFunction({
    collection_name: 'my_collection',
    function_name: 'my_bm25_function',
    function: {
        name: 'my_bm25_function',
        description: 'Updated BM25 sparse embedding function',
        type: FunctionType.BM25,
        input_field_names: ['text'],
        output_field_names: ['sparse_vector'],
        params: {},
    },
});
```
