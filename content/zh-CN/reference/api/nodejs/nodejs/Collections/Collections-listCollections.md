---
title: "listCollections() | Node.js"
slug: /node/node/Collections-listCollections
sidebar_label: "listCollections()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出所有现有集合。 | Node.js"
type: docx
token: Djg7dlb5NoINz9xOAs1cyY67nsh
sidebar_position: 15
keywords: 
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - zilliz
  - zilliz cloud
  - cloud
  - listCollections()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listCollections()

此操作列出所有现有集合。

```javascript
milvusClient.listCollections();
```

## 请求语法\{#request-syntax}

```javascript
listCollections({
    collection_name: string
    type: ShowCollectionsType,
    timeout?: number
})
```

**参数：**

- **collection_name** (*string*) -

    **[必需]**

    现有集合的名称。

- **type** (*ShowCollectionsType*) 

    此操作的范围。可能的值为 **All** 或 **Loaded**。

- **timeout** (*number*) -

    此操作的超时时长。 

    将其设置为 **None** 表示当返回任意响应或发生错误时，此操作即超时。

**返回** *Promise&lt;ShowCollectionsResponse&gt;*

此方法返回一个 promise，该 promise 解析为 **ShowCollectionsResponse** 对象。

```typescript
{
    data: CollectionData[],
    created_timestamps: string[],
    created_utc_timestamps: string[],
    status:  ResStatus
}
```

**参数：**

- **data** (*CollectionData[]*) -<br/>
  集合数据对象列表。每个条目都包含集合名称、ID、时间戳和加载百分比。

- **created_timestamps** (*string[]*) -<br/>
  混合时间戳列表，表示每个集合的创建时间。

- **created_utc_timestamps** (*string[]*) -<br/>
  UTC 时间戳列表，表示每个集合的创建时间。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await milvusClient.listCollections({ collection_name: 'my_collection' });
```

