---
title: "getPkField() | Node.js"
slug: /node/node/Collections-getPkField
sidebar_label: "getPkField()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションの主キー フィールドの完全なスキーマを取得します。これは、コレクションの情報を取得し、主キー フィールドを抽出する便利なメソッドです。 | Node.js"
type: docx
token: LmnudtyV5owY2zx5D9WcENcsnFg
sidebar_position: 25
keywords: 
  - vector database の比較
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - getPkField()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getPkField()

この操作は、コレクションの主キー フィールドの完全なスキーマを取得します。これは、コレクションの情報を取得し、主キー フィールドを抽出する便利なメソッドです。

```javascript
await milvusClient.getPkField(data: DescribeCollectionReq)
```

## リクエスト構文\{#request-syntax}

```javascript
getPkField({
    collection_name: string,
    timeout: number
})
```

**パラメータ:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    コレクションの名前。

- **timeout** (*number*) -

    ミリ秒単位の RPC タイムアウト。オプションです。

**戻り値:**

*Promise\<FieldSchema\>*

名前、データ型、フィールド ID、その他のプロパティを含む、主キー フィールドの完全なフィールド スキーマ オブジェクトです。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const pkField = await client.getPkField({
    collection_name: 'my_collection',
});
console.log(pkField.name, pkField.data_type);
```
