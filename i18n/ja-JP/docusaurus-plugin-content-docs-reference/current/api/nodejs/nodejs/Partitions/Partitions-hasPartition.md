---
title: "hasPartition() | Node.js"
slug: /node/node/Partitions-hasPartition
sidebar_label: "hasPartition()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation checks whether the specified partition exists in the specified コレクション. | Node.js"
type: docx
token: TVWPdTw2WoPAJYxsbGMc7MX6nEf
sidebar_position: 4
keywords: 
  - Milvus はどのように動作するか
  - Zilliz ベクトル データベース
  - Zilliz データベース
  - 非構造化データ
  - zilliz
  - zilliz cloud
  - cloud
  - hasPartition()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# hasPartition()

This operation checks whether the specified partition exists in the specified コレクション.

```javascript
await milvusClient.hasPartition(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.hasPartition({
    db_name: string,
    collection_name: string,
    partition_name: string,
    timeout?: number
 })
```

**パラメータ:**

- **db_name** (*string*) -

    The name of the データベース that holds the target コレクション.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing コレクション.

- **partition_name** (*string*)

    **[REQUIRED]**

    確認する partition の名前。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise&lt;BoolResponse&gt;*

このメソッドは、**BoolResponse** オブジェクトに解決される promise を返します。

```typescript
{
    value: boolean,
    status:  ResStatus
}
```

**パラメータ:**

- **value** (*boolean*) -<br/>
  A boolean that indicates whether the requested partition exists in the コレクション. It is **true** when the partition exists and **false** when it does not.

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

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
}).hasPartition({
    collection_name: 'my_collection',
    partition_name: 'my_partition',
 });
```

