---
title: "listGrants() | Node.js"
slug: /node/node/Authentication-listGrants
sidebar_label: "listGrants()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出授予指定角色的权限。 | Node.js"
type: docx
token: CJ9DdmU1ooquOnxcK5AciA3sn3g
sidebar_position: 18
keywords: 
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - listGrants()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listGrants()

此操作列出授予指定角色的权限。

```javascript
await milvusClient.listGrants(data)
```

## 请求语法\{#request-syntax}

```javascript
 milvusClient.listGrants({
   roleName: 'roleName',
 });
```

**参数：**

- roleName (*string*)  

    目标角色名称

    将其设置为不存在的角色名称可能会导致错误。

**返回值** *Promise&lt;SelectGrantResponse&gt;*

此方法返回一个 Promise，该 Promise 会解析为一个 **SelectGrantResponse** 对象。

```typescript
{
    entities: GrantEntity[],
    status:  ResStatus
}
```

**参数：**

- **entities** (*GrantEntity[]*) -<br/>
  附加到所请求角色的授权列表。每一项都将某项权限与目标对象以及授予该权限的主体进行配对。有关完整的 **GrantEntity** 字段说明，请参阅 `describeRole()` 文档。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

## 示例\{#example}

```javascript
 milvusClient.listGrants({
   roleName: 'roleName',
 });
```
