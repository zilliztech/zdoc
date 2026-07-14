---
title: "hasPartition() | Node.js"
slug: /node/node/Partitions-hasPartition
sidebar_label: "hasPartition()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定された collection 内に指定された partition が存在するかどうかを確認します。 | Node.js"
type: docx
token: TVWPdTw2WoPAJYxsbGMc7MX6nEf
sidebar_position: 4
keywords: 
  - Milvus はどのように動作するか
  - Zilliz vector database
  - Zilliz database
  - 非構造化データ
  - zilliz
  - zilliz cloud
  - cloud
  - hasPartition()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# hasPartition()

この操作は、指定された collection 内に指定された partition が存在するかどうかを確認します。

```javascript
await milvusClient.hasPartition(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.hasPartition({
    db_name: string,
    collection_name: string,
    partition_name: string,
    timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前です。

- **partition_name** (*string*)

    **[REQUIRED]**

    確認する partition の名前です。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、レスポンスが返るか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;BoolResponse&gt;*

このメソッドは、**BoolResponse** オブジェクトに解決される promise を返します。

```typescript
{
    value: boolean,
    status:  ResStatus
}
```

**PARAMETERS:**

- **value** (*boolean*) -
要求された partition が collection 内に存在するかどうかを示すブール値です。partition が存在する場合は **true**、存在しない場合は **false** です。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
}).hasPartition({
    collection_name: 'my_collection',
    partition_name: 'my_partition',
 });
```

