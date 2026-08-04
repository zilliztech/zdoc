---
title: "dropRole() | Node.js"
slug: /node/node/Authentication-dropRole
sidebar_label: "dropRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除一个自定义角色。 | Node.js"
type: docx
token: AnkUdEHXmob3Vwx9GIWcDOQanng
sidebar_position: 13
keywords: 
  - 向量存储
  - 开源向量数据库
  - 向量索引
  - 开源向量数据库
  - zilliz
  - zilliz cloud
  - cloud
  - dropRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropRole()

此操作会删除一个自定义角色。

```javascript
await milvusClient.dropRole(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.dropRole({
   roleName: string,
   timeout?: number
 })
```

**参数：**

- **roleName** (*string*) -

    **[必需]**

    要删除的角色名称。

- **timeout** (number)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回值** *Promise\<ResStatus>*

此方法返回一个 promise，该 promise 解析为一个 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的状态码。如果此操作成功，则其值始终为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误码。如果此操作成功，则其值始终为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

## 示例\{#example}

```java
await milvusClient.dropRole({
   roleName: 'exampleRole',
 })
```

