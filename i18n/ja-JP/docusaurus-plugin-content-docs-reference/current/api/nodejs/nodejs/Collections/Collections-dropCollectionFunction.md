---
title: "dropCollectionFunction() | Node.js"
slug: /node/node/Collections-dropCollectionFunction
sidebar_label: "dropCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation removes a custom function from an existing コレクション. | Node.js"
type: docx
token: T6xNdPPtsotGiYxL1WActF3qnxb
sidebar_position: 24
keywords: 
  - Zilliz
  - milvus ベクトル データベース
  - milvus db
  - milvus ベクトル db
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionFunction()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# dropCollectionFunction()

This operation removes a custom function from an existing コレクション.

```javascript
await milvusClient.dropCollectionFunction(data: DropCollectionFunctionReq)
```

## リクエスト構文\{#request-syntax}

```javascript
dropCollectionFunction({
    collection_name: string,
    function_name: string,
    db_name: string,
    timeout: number
})
```

**パラメータ:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of the コレクション containing the function to remove.

- **function_name** (*string*) -

    **[REQUIRED]**

    削除する関数の名前。

- **db_name** (*string*) -

    The name of the データベース where the コレクション resides. Optional.

- **timeout** (*number*) -

    この操作のタイムアウト時間（ミリ秒）。オプションです。

**戻り値:**

*Promise\<ResStatus\>*

**例外:**

- **MilvusError**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.dropCollectionFunction({
    collection_name: 'my_collection',
    function_name: 'my_function'
});
```
