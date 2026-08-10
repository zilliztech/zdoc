---
title: "listCollections() | Node.js"
slug: /node/node/Collections-listCollections
sidebar_label: "listCollections()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出所有现有 Collection。 | Node.js"
type: docx
token: Djg7dlb5NoINz9xOAs1cyY67nsh
sidebar_position: 15
keywords: 
  - milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz Database
  - 非结构化数据
  - zilliz
  - zilliz cloud
  - 云
  - listCollections()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listCollections()

此操作列出所有现有 Collection。

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

    **[必填]**

    现有 Collection 的名称。

- **type** (*ShowCollectionsType*) 

    此操作的范围。可能的值包括 **All** 或 **Loaded**。

- **timeout** (*number*) -

    此操作的超时时长。 

    将其设置为 **None** 表示此操作会在返回任意响应或发生错误时超时。

**返回值** *Promise&lt;ShowCollectionsResponse&gt;*

此方法返回一个 promise，解析为 **ShowCollectionsResponse** 对象。

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
  Collection 数据对象列表。每个条目都包含 Collection 名称、ID、时间戳和加载百分比。

- **created_timestamps** (*string[]*) -<br/>
  混合时间戳列表，表示每个 Collection 的创建时间。

- **created_utc_timestamps** (*string[]*) -<br/>
  UTC 时间戳列表，表示每个 Collection 的创建时间。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的原因。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await milvusClient.listCollections({ collection_name: 'my_collection' });
```

