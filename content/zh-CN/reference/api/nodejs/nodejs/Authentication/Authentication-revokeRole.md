---
title: "revokeRole() | Node.js"
slug: /node/node/Authentication-revokeRole
sidebar_label: "revokeRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会撤销分配给用户的角色。 | Node.js"
type: docx
token: W7XJdZDHnoFECDxCYoMcrZqrnnd
sidebar_position: 27
keywords: 
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - zilliz
  - zilliz cloud
  - cloud
  - revokeRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# revokeRole()

此操作会撤销分配给用户的角色。

```javascript
await milvusClient.revokeRole(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.revokeRole({
   username: string,
   roleName: string，
   timeout?: number
 })
```

**参数：**

- **username** (*str*) -

    **[必需]**

    现有用户的名称。

- **roleName** (*str*) -

    **[必需]**

    要撤销的角色名称。

- **timeout** (*number*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回** *Promise\<ResStatus>*

此方法返回一个 promise，该 promise 会解析为一个 **ResStatus** 对象。

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

    表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```java
await milvusClient.removeUserFromRole({
   username: 'my',
   roleName: 'myrole'
 });
```

