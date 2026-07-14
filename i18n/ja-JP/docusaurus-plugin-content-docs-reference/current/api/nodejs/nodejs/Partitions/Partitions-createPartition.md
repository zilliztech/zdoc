---
title: "createPartition() | Node.js"
slug: /node/node/Partitions-createPartition
sidebar_label: "createPartition()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、対象の collection に partition を作成します。 | Node.js"
type: docx
token: PPLtdSbtfomgF1x5MHncKPgPnSf
sidebar_position: 1
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - createPartition()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createPartition()

この操作は、対象の collection に partition を作成します。

```javascript
await milvusClient.createPartition(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.createPartition({
    db_name: string,
    collection_name: string,
    partition_name: string,
    timeout?: number
 });
```

**パラメータ:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前。

- **partition_name** (*string*)

    **[REQUIRED]**

    作成する partition の名前。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

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

    操作結果を示すコードです。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
}).createPartition({
    collection_name: 'my_collection',
    partition_name: 'my_partition',
 });
```

