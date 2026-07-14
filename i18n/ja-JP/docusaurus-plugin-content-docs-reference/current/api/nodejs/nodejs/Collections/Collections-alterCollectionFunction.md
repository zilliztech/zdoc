---
title: "alterCollectionFunction() | Node.js"
slug: /node/node/Collections-alterCollectionFunction
sidebar_label: "alterCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存の collection 内のカスタム関数を変更します。 | Node.js"
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

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionFunction()

この操作は、既存の collection 内のカスタム関数を変更します。

```typescript
await milvusClient.alterCollectionFunction(data: AlterCollectionFunctionReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.alterCollectionFunction({
    collection_name: string,
    function_name: string,
    function: FunctionObject,
    db_name?: string,
    timeout?: number,
})
```

**パラメータ:**

- **collection_name** (*string*) -

    **[必須]**

    変更する関数を含む collection の名前。

- **function_name** (*string*) -

    **[必須]**

    変更する関数の名前。

- **function** (*FunctionObject*) -

    **[必須]**

    更新後の関数スキーマ。FunctionObject の完全なフィールドリファレンスについては、`addCollectionFunction()` を参照してください。

- **db_name** (*string*) -

    collection が存在するデータベースの名前。

- **timeout** (*number*) -

    この操作のタイムアウト時間（ミリ秒）。

**戻り値:**

*Promise\<ResStatus\>*

**例外:**

- **MilvusError**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

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
