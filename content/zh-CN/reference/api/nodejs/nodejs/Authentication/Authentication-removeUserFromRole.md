---
title: "removeUserFromRole() | Node.js"
slug: /node/node/Authentication-removeUserFromRole
sidebar_label: "removeUserFromRole()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将用户从特定角色中移除。 | Node.js"
type: docx
token: XmyMdqvDLosr6oxzvhWcw8H2ntg
sidebar_position: 23
keywords: 
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - removeUserFromRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# removeUserFromRole()

此操作会将用户从特定角色中移除。

```javascript
await milvusClient.removeUserFromRole(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.removeUserFromRole({
   username: string,
   rolename: string,
   timeout?: number
 })
```

**参数：**

- **username** (*string*) -

    **[必需]**

    用户名称。

- **rolename** (*string*) -

    **[必需]**

    角色名称

- **timeout** (*number*) -  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回值** *Promise\<ResStatus>*

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

    指示操作结果的代码。如果此操作成功，则其值始终为 **0**。

- **error_code** (*string* | *number*) -

    指示已发生错误的错误码。如果此操作成功，则其值始终为 **Success**。 

- **reason** (*string*) - 

    指示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

## 示例\{#example}

```java
await milvusClient.removeUserFromRole({
   username: 'my',
   roleName: 'myrole'
 });
```

