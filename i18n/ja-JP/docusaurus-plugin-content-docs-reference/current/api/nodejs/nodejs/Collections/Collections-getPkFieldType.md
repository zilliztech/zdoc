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
  - ベクトル similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse ベクトル
  - zilliz
  - zilliz cloud
  - cloud
  - getPkFieldType()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# getPkFieldType()

この操作は、コレクションの主キーフィールドのデータ型を返します。これは、コレクションの情報を取得して主キーフィールドの型を抽出するための便利なメソッドです。

```javascript
await milvusClient.getPkFieldType(data: DescribeCollectionReq)
```

## Request Syntax\{#request-syntax}

```javascript
getPkFieldType({
    collection_name: string,
    db_name?: string,
    cache?: boolean,
    timeout: number
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    コレクションの名前。

- **db_name** (*string*) -

    対象のコレクションが格納されているデータベースの名前。

- **cache** (*boolean*) -

    コレクションのキャッシュされた説明を使用するかどうか。省略可能です。

- **timeout** (*number*) -

    ミリ秒単位の RPC タイムアウト。省略可能です。

**RETURNS:**

*Promise\<keyof typeof DataType\\>*

主キーフィールドのデータ型（例：`"Int64"`、`"VarChar"`）。[DataType](./Collections-DataType) を参照してください。


**例外:**

- **エラー**

    この操作中にエラーが発生すると、この例外がスローされます。

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
