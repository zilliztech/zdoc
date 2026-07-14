---
title: "getPartitionStatistics() | Node.js"
slug: /node/node/Partitions-getPartitionStatistics
sidebar_label: "getPartitionStatistics()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定の partition で収集された統計情報を表示します。 | Node.js"
type: docx
token: XDXid6aZ8oCHnVxxFpPcKAB9n0c
sidebar_position: 3
keywords: 
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - zilliz
  - zilliz cloud
  - cloud
  - getPartitionStatistics()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getPartitionStatistics()

この操作は、特定の partition で収集された統計情報を表示します。

```javascript
await milvusClient.getPartitionStatistics(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.getPartitionStatistics({
    db_name: string,
    collection_name: string,
    partition_name: string,
    timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前。

- **partition_name** (*string*) -

    **[REQUIRED]**

    既存の partition の名前。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着した時点、または何らかのエラーが発生した時点で、この操作はタイムアウトします。

**RETURNS** *Promise&lt;StatisticsResponse&gt;*

このメソッドは、**StatisticsResponse** オブジェクトに解決される promise を返します。

```typescript
{
    stats: KeyValuePair[],
    data: { [x: string]: any },
    status:  ResStatus
}
```

**PARAMETERS:**

- **stats** (*KeyValuePair[]*) -
Milvus によって返される生の統計情報リストです。各エントリには、**key**（たとえば **row_count**）と、文字列としての **value** が含まれます。

- **data** (*Record&lt;string, any&gt;*) -
利便性のために、**stats** をフラット化してキーでインデックス可能にしたビューです。たとえば、`data.row_count` は partition の行数を文字列として返します。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
}).getPartitionStatistics({
    collection_name: 'my_collection',
    partition_name: "_default",
 });
```

