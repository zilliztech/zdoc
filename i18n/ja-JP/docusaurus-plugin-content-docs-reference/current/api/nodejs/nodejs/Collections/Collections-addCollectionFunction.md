---
title: "addCollectionFunction() | Node.js"
slug: /node/node/Collections-addCollectionFunction
sidebar_label: "addCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションにカスタム関数を追加します。 | Node.js"
type: docx
token: SmI4dGF4qoAjbKxamfhcndjxnCc
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

---

import Admonition from '@theme/Admonition';

# addCollectionFunction()

<Admonition type="warning" icon="🚧" title="Warning">

**非推奨です。**

このメソッドは非推奨です。代わりに [addFunctionField()](./Collections-addFunctionField) を使用してください。

</Admonition>

この操作は、既存のコレクションにカスタム関数を追加します。

```javascript
await milvusClient.addCollectionFunction(data: AddCollectionFunctionReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.addCollectionFunction({
    collection_name: string,
    function: FunctionObject,
    db_name?: string,
    timeout?: number,
})
```

**パラメーター：**

- **collection_name** (*string*) -

    **[必須]**

    関数を追加するコレクションの名前です。

- **function** (*[FunctionObject](./Collections-FunctionObject)*) -

    **[必須]**

    コレクションに追加する関数です。詳細は、[FunctionObject](./Collections-FunctionObject) を参照してください。

- **db_name** (*string*) -

    コレクションが存在するデータベースの名前です。

- **timeout** (*number*) -

    この操作のタイムアウト時間（ミリ秒）です。

**戻り値：**

*Promise&lt;ResStatus&gt;*

このメソッドは、**ResStatus** オブジェクトに解決される Promise を返します。

**例外：**

- **エラー**

    この操作中に何らかのエラーが発生すると、この例外がスローされます。

## 例\{#example}

```javascript
import { MilvusClient, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.addCollectionFunction({
    collection_name: 'my_collection',
    function: {
        name: 'my_bm25_function',
        description: 'BM25 sparse embedding function',
        type: FunctionType.BM25,
        input_field_names: ['text'],
        output_field_names: ['sparse_vector'],
        params: {},
    },
});
```

