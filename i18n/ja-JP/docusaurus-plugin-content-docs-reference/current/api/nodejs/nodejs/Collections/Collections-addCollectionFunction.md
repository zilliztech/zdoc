---
title: "addCollectionFunction() | Node.js"
slug: /node/node/Collections-addCollectionFunction
sidebar_label: "addCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存の collection にカスタム関数を追加します。 | Node.js"
type: docx
token: SmI4dGF4qoAjbKxamfhcndjxnCc
sidebar_position: 21
keywords: 
  - Zilliz database
  - 非構造化データ
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - addCollectionFunction()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionFunction()

この操作は、既存の collection にカスタム関数を追加します。

```typescript
await milvusClient.addCollectionFunction(data: AddCollectionFunctionReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.addCollectionFunction({
    collection_name: string,
    function: FunctionObject,
    db_name?: string,
    timeout?: number,
})
```

**パラメータ:**

- **collection_name** (*string*) -

    **[必須]**

    関数を追加する collection の名前。

- **function** (*FunctionObject*) -

    **[必須]**

    collection に追加する関数。完全なフィールド参照については、以下の FunctionObject セクションを参照してください。

- **db_name** (*string*) -

    collection が存在する database の名前。

- **timeout** (*number*) -

    この操作のタイムアウト時間（ミリ秒）。

**戻り値:**

*Promise\<ResStatus\>*

**例外:**

- **MilvusError**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## FunctionObject\{#functionobject}

**FunctionObject** は、insert および search の際にデータを自動的に vector embeddings に変換するサーバーサイド関数を定義します。

**パラメータ:**

- **name** (*string*) -

    **[必須]**

    関数の名前。クエリおよび collection 内で関数を参照するために使用されます。

- **type** (*FunctionType*) -

    **[必須]**

    関数タイプ。指定可能な値: `FunctionType.BM25`（BM25 を使用してテキストから sparse embeddings を生成）、`FunctionType.TEXTEMBEDDING`（テキストから dense embeddings を生成）、`FunctionType.RERANK`（reranking 関数）。

- **input_field_names** (*string[]*) -

    **[必須]**

    変換する生データを含むフィールド名。`FunctionType.BM25` の場合、フィールド名はちょうど 1 つである必要があります。

- **output_field_names** (*string[]*) -

    生成された embeddings を保存するフィールド名。`FunctionType.BM25` の場合、フィールド名はちょうど 1 つである必要があります。

- **params** (*object*) -

    キーと値のペアによる追加の関数パラメータ。

- **description** (*string*) -

    関数の目的を簡潔に説明する文。デフォルトは空文字列です。

## Example\{#example}

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

