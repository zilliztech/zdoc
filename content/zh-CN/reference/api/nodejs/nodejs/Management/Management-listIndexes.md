---
title: "listIndexes() | Node.js"
slug: /node/node/Management-listIndexes
sidebar_label: "listIndexes()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出特定 Collection 的索引 | Node.js"
type: docx
token: N1fldMqhtoWBJPxh8VccivqxnZd
sidebar_position: 16
keywords: 
  - 神经网络
  - 深度学习
  - 知识库
  - 自然语言处理
  - zilliz
  - zilliz cloud
  - 云
  - listIndexes()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listIndexes()

此操作列出特定 Collection 的索引

```javascript
await milvusClient.listIndexes(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.listIndexes({
   db_name: string,
   collection_name: string,
   field_name?: string,
   index_name?: string
   timeout?: number
 })
```

**参数：**

- **db_name** (*string*) -

    持有目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    现有 Collection 的名称。

- **field_name** (*string*) -

    Collection 中现有字段的名称。

- **index_name** (*string*) -

    要描述的索引名称。

- **timeout** (*number*)  

    此操作的超时时长。将此项设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回值** *Promise&lt;ListIndexResponse&gt;*

此方法返回一个 promise，解析为 **ListIndexResponse** 对象。

```typescript
{
    indexes: string[],
    status:  ResStatus
}
```

**参数：**

- **indexes** (*string[]*) -<br/>
  在所请求 Collection 上定义的索引名称列表。

- **ResStatus**<br/>
  **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的原因。如果此操作成功，则其值保持为空字符串。
