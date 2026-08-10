---
title: "hasCollection() | Node.js"
slug: /node/node/Collections-hasCollection
sidebar_label: "hasCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作检查指定的 Collection 是否存在。 | Node.js"
type: docx
token: FhbbdNrlNouBXJxHIdKctXVKnmf
sidebar_position: 13
keywords: 
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - llm 幻觉
  - zilliz
  - zilliz cloud
  - 云
  - hasCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# hasCollection()

此操作检查指定的 Collection 是否存在。

```javascript
await milvusClient.hasCollection(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.hasCollection({ 
    db_name: string,
    collection_name: string,
    timeout?: number
})
```

**参数：**

- **db_name** (*str*) -

    包含目标 Collection 的 Database 名称。

- **collection_name** (*str*) -

    **[必需]**

    Collection 的名称。

- **timeout** (*number*) -

    此操作的超时时长。 

    将其设置为 **None** 表示当返回任意响应或发生错误时，此操作即超时。

**返回值** *Promise&lt;BoolResponse&gt;*

此方法返回一个解析为 **BoolResponse** 对象的 Promise。

```typescript
{
    value: boolean,
    status:  ResStatus
}
```

**参数：**

- **value** (*boolean*) -<br/>
  一个布尔值，表示请求的 Collection 是否存在。Collection 存在时为 **true**，不存在时为 **false**。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await milvusClient.hasCollection({ collection_name: 'my_collection' });
```

