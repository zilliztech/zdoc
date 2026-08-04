---
title: "grantRole() | Node.js"
slug: /node/node/Authentication-grantRole
sidebar_label: "grantRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作为用户授予角色。 | Node.js"
type: docx
token: LPJsdEnvwo6apcxjhZgc3rpDnuc
sidebar_position: 16
keywords: 
  - Embedding model
  - image similarity search
  - Context Window
  - Natural language search
  - zilliz
  - zilliz cloud
  - cloud
  - grantRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# grantRole()

此操作为用户授予角色。

```javascript
await milvusClient.grantRole(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.grantRole({
   username: string,
   roleName: string,
   timeout?: number
 })
```

**参数：**

- **username** (*str*) -

    **[必填]**

    现有用户的名称。

- **roleName** (*str*) -

    **[必填]**

    要分配的角色名称。

- **timeout** (number)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回值** *Promise\<ResStatus>*

此方法返回一个 Promise，该 Promise 解析为一个 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则其值始终为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则其值始终为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

## 示例\{#example}

```java
await milvusClient.grantRole({
   username: 'my',
   roleName: 'myrole'
 })
```

