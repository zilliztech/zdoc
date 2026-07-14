---
title: "getPkFieldType() | Node.js"
slug: /node/node/Collections-getPkFieldType
sidebar_label: "getPkFieldType()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションの主キーフィールドのデータ型を返します。これは、コレクションの情報を取得して主キーフィールドの型を抽出するための便利なメソッドです。 | Node.js"
type: docx
token: AKpldMJPTo6MfuxxrpicBKRInCh
sidebar_position: 27
keywords: 
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - cloud
  - getPkFieldType()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getPkFieldType()

この操作は、コレクションの主キーフィールドのデータ型を返します。これは、コレクションの情報を取得して主キーフィールドの型を抽出するための便利なメソッドです。

```javascript
await milvusClient.getPkFieldType(data: DescribeCollectionReq)
```

## Request Syntax\{#request-syntax}

```javascript
getPkFieldType({
    collection_name: string,
    timeout: number
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    コレクションの名前。

- **timeout** (*number*) -

    ミリ秒単位の RPC タイムアウト。省略可能です。

**RETURNS:**

*Promise\<keyof typeof DataType\>*

主キーフィールドのデータ型（例: `"Int64"`、`"VarChar"`）。

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const pkType = await client.getPkFieldType({
    collection_name: 'my_collection',
});
console.log(pkType); // e.g., "Int64"
```

