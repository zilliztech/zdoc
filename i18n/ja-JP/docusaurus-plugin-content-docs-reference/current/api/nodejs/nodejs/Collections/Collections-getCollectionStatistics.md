---
title: "getCollectionStatistics() | Node.js"
slug: /node/node/Collections-getCollectionStatistics
sidebar_label: "getCollectionStatistics()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists the statistics collected on a specific コレクション. | Node.js"
type: docx
token: LQMGdRHjKogdeMxekCtcdBLqnNf
sidebar_position: 12
keywords: 
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense ベクトル
  - zilliz
  - zilliz cloud
  - cloud
  - getCollectionStatistics()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# getCollectionStatistics()

This operation lists the statistics collected on a specific コレクション.

```javascript
await milvusClient.getCollectionStatistics(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.getCollectionStatistics({ 
    db_name: string,
    collection_name: string,
    timeout?: number 
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the データベース that holds the target コレクション.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of a コレクション.

- **timeout** (*number*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、いずれかのレスポンスが返るかエラーが発生した時点でこの操作はタイムアウトします。

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

- **stats** (*KeyValuePair[]*) -<br/>
  Milvus によって返される生の統計情報リスト。各エントリは **key**（たとえば **row_count**）と、文字列としての **value** を持ちます。

- **data** (*Record&lt;string, any&gt;*) -<br/>
  利便性のために **stats** をフラット化し、キーで索引付けしたビューです。たとえば、`data.row_count` は行数を文字列として返します。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す内容。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const res = await milvusClient.getCollectionStatistics({ collection_name: 'my_collection' });
```

