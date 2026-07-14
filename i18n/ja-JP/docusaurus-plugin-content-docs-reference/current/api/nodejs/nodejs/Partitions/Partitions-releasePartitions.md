---
title: "releasePartitions() | Node.js"
slug: /node/node/Partitions-releasePartitions
sidebar_label: "releasePartitions()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定した collection 内の partition をメモリから解放します。 | Node.js"
type: docx
token: Sqoed1lkwo8umixJJO1cvKIxnZc
sidebar_position: 8
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - releasePartitions()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# releasePartitions()

この操作は、指定した collection 内の partition をメモリから解放します。

```javascript
await milvusClient.releasePartitions(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.releasePartitions({
    db_name: string,
    collection_name: string,
    partition_names: string[],
    timeout?: number
 })
```

**パラメータ:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前。

- **partition_names** (*string[]*) -

    **[REQUIRED]**

    解放する partition の名前のリスト。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するかエラーが発生した時点で、この操作はタイムアウトします。

**戻り値** *Promise\<ResStatus>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメータ:**

- **code** (*number*) -

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
}).releasePartitions({
    collection_name: 'my_collection',
    partition_names: ['my_partition'],
 });
```

