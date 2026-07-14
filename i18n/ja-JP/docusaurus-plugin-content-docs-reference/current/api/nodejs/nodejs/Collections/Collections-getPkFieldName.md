---
title: "getPkFieldName() | Node.js"
slug: /node/node/Collections-getPkFieldName
sidebar_label: "getPkFieldName()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションの主キーフィールド名を取得します。これは、コレクションの情報を取得し、主キーフィールド名を抽出する便利なメソッドです。 | Node.js"
type: docx
token: WiVnd8VXooFQ9PxVgiyc7FkqnAg
sidebar_position: 26
keywords: 
  - Milvus はどのように動作するか
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - 非構造化データ
  - zilliz
  - zilliz cloud
  - クラウド
  - getPkFieldName()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getPkFieldName()

この操作は、コレクションの主キーフィールド名を取得します。これは、コレクションの情報を取得し、主キーフィールド名を抽出する便利なメソッドです。

```javascript
await milvusClient.getPkFieldName(data: DescribeCollectionReq)
```

## リクエスト構文\{#request-syntax}

```javascript
getPkFieldName({
    collection_name: string,
    timeout: number
})
```

**パラメータ:**

- **collection_name** (*string*) -

    **[必須]**

    コレクション名。

- **timeout** (*number*) -

    ミリ秒単位の RPC タイムアウト。省略可能です。

**戻り値:**

*Promise\<string\>*

主キーフィールドの名前。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const pkName = await client.getPkFieldName({
    collection_name: 'my_collection',
});
console.log(pkName); // e.g., "id"
```
