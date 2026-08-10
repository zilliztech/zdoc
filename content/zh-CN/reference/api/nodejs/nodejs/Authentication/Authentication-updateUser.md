---
title: "updateUser() | Node.js"
slug: /node/node/Authentication-updateUser
sidebar_label: "updateUser()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会更新特定用户的密码。| Node.js"
type: docx
token: BCGKdCttdotF32xUJTec8UFlndg
sidebar_position: 28
keywords: 
  - 信息检索
  - 降维
  - hnsw 算法
  - 向量相似性搜索
  - zilliz
  - zilliz cloud
  - 云
  - updateUser()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# updateUser()

此操作会更新特定用户的密码。

```javascript
await milvusClient.updateUser(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.updateUser({
   username: string,
   newPassword: string,
   oldPassword: string,
   timeout?: number
 })
```

**参数：**

- **username** (*str*) -

    **【必填】**

    现有用户的名称。

- **oldPassword** (*str*) -

    **【必填】**

    用户的原始密码。

- **newPassword** (*str*) -

    **【必填】**

    用户的新密码。

- **timeout** (*number*) -  

    此操作的超时时长。

    将此项设置为 **None** 表示，当收到任意响应或发生任何错误时，此操作将超时。

**返回** *Promise\<ResStatus>*

此方法返回一个 promise，该 promise 会解析为 **ResStatus** 对象。

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

    表示已发生错误的错误代码。如果此操作成功，则其值为 **Success**。

- **reason** (*string*) - 

    表示所报告错误原因的原因。如果此操作成功，则其值为空字符串。

## 示例\{#example}

```java
await milvusClient.updateUser({
   username: 'exampleUser',
   newPassword: 'newPassword',
   oldPassword: 'oldPassword',
 })
```

