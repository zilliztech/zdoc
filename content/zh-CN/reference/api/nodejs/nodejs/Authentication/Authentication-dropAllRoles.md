---
title: "dropAllRoles() | Node.js"
slug: /node/node/Authentication-dropAllRoles
sidebar_label: "dropAllRoles()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除 Milvus 中的所有角色。 | Node.js"
type: docx
token: E5rYdw3EWo2WKZxEyGac049an3e
sidebar_position: 11
keywords: 
  - 上下文窗口
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - zilliz
  - zilliz cloud
  - 云
  - dropAllRoles()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropAllRoles()

此操作会删除 Milvus 中的所有角色。

```javascript
await milvusClient.dropAllRoles(data?)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.dropAllRoles({
   timeout?: number
})
```

**参数：**

- **timeout** (*number*) -  

    此操作的超时时长。

    将此项设置为 **None** 表示，当收到任何响应或发生任何错误时，此操作即超时。

**返回值** *Promise\<ResStatus[]>*

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
milvusClient.dropAllRoles()
```

