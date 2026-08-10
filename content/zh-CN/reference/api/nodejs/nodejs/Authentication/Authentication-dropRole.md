---
title: "dropRole() | Node.js"
slug: /node/node/Authentication-dropRole
sidebar_label: "dropRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于删除自定义角色。 | Node.js"
type: docx
token: AnkUdEHXmob3Vwx9GIWcDOQanng
sidebar_position: 13
keywords: 
  - 向量存储
  - 开源向量 Database
  - 向量索引
  - 开源向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - dropRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropRole()

此操作用于删除自定义角色。

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

    将其设置为 **None** 表示当收到任意响应或发生任何错误时，此操作超时。

**返回** *Promise\<ResStatus>*

此方法返回一个 promise，并解析为 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则其值为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误码。如果此操作成功，则其值为 **Success**。

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值为空字符串。

## 示例\{#example}

```java
await milvusClient.dropRole({
   roleName: 'exampleRole',
 })
```

