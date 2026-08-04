---
title: "listRoles() | Node.js"
slug: /node/node/Authentication-listRoles
sidebar_label: "listRoles()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出所有自定义角色。 | Node.js"
type: docx
token: GIeMdvjlMoLwGrxUOu3cFw7bnWc
sidebar_position: 20
keywords: 
  - IVF
  - knn
  - Image Search
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - listRoles()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listRoles()

此操作会列出所有自定义角色。

```javascript
await milvusClient.listRoles(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.listRoles(
    includeUserInfo?: boolean,
    timeout?: number
)
```

**参数：**

- **includeUserInfo** (*boolean*) -

    一个布尔值，用于指示是否包含用户信息。

- **timeout** (*number*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任意响应或发生任何错误时，此操作即超时。

**返回值** *Promise&lt;SelectRoleResponse&gt;*

此方法返回一个 Promise，该 Promise 会解析为一个 **SelectRoleResponse** 对象。

```typescript
{
    results: RoleResult[],
    status:  ResStatus
}
```

**参数：**

- **results** (*RoleResult[]*) -<br/>
  **RoleResult** 对象列表，当前 Milvus 实例中定义的每个角色对应一个对象。有关完整的 **RoleResult** 字段说明，请参阅 `describeRole()` 文档。

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

```

