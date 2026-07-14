---
title: "dropPartition() | Node.js"
slug: /node/node/Partitions-dropPartition
sidebar_label: "dropPartition()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在の collection から指定された partition を削除します。 | Node.js"
type: docx
token: BBmsddqZEozxWyxkoADcFfzpncW
sidebar_position: 2
keywords: 
  - Serverless ベクトルデータベース
  - milvus オープンソース
  - milvus の仕組み
  - Zilliz ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - dropPartition()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropPartition()

この操作は、現在の collection から指定された partition を削除します。

```javascript
await milvusClient.dropPartition(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.dropPartition({
    db_name: string,
    collection_name: string,
    partition_name: string,
    timeout?: number
 })
```

**パラメータ:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前。

- **partition_name** (*string*)

    **[REQUIRED]**

    削除する partition の名前。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

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
}).dropPartition({
    collection_name: 'my_collection',
    partition_name: 'my_partition',
 });
```

