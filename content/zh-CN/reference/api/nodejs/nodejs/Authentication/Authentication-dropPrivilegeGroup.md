---
title: "dropPrivilegeGroup() | Node.js"
slug: /node/node/Authentication-dropPrivilegeGroup
sidebar_label: "dropPrivilegeGroup()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将用户添加到特定角色。 | Node.js"
type: docx
token: I63tdWAY2ok8V1xrK4tcrkwjncd
sidebar_position: 12
keywords: 
  - 稠密向量
  - 分层可导航小世界
  - 稠密嵌入
  - Faiss 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - dropPrivilegeGroup()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropPrivilegeGroup()

此操作会将用户添加到特定角色。

```javascript
await milvusClient.dropPrivilegeGroup(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.dropPrivilegeGroup({
   timeout?: number
})
```

**参数：**

- **timeout** (*number*) -  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回** *Promise\<ResStatus>*

此方法返回一个 promise 列表，其中每个 promise 都会解析为一个 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

- **reason** (*string*) - 

    表示所报告错误原因的原因。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```java
milvusClient.dropPrivilegeGroup()
```

