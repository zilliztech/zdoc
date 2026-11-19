---
title: "dropFunctionField() | Node.js"
slug: /node/node/Collections-dropFunctionField
sidebar_label: "dropFunctionField()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、コレクションスキーマから関数を削除します。 | Node.js"
type: docx
token: MmABd2rdooxiLZxYzwEciyTanOg
sidebar_position: 32
keywords: 
  - 関数の削除
  - 関数
  - スキーマ
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - dropFunctionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# dropFunctionField()

この操作では、コレクションから関数とその出力フィールドおよびインデックスを削除します。

```javascript
await milvusClient.dropFunctionField(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.dropFunctionField({
    collection_name: string,
    function_name: string,
    db_name?: string,
    timeout?: number
})
```

**パラメーター：**

- **collection_name** (*string*) -

    **[必須]**

    関数を含むコレクションの名前です。

- **function_name** (*string*) -

    **[必須]**

    削除する関数の名前です。

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
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.dropFunctionField({
    collection_name: 'my_collection',
    function_name: 'my_bm25_function',
});
```
