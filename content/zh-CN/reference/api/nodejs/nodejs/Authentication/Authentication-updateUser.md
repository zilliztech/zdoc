---
title: "updateUser() | Node.js"
slug: /node/node/Authentication-updateUser
sidebar_label: "updateUser()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会更新指定用户的密码。 | Node.js"
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

---

# updateUser()

此操作会更新指定用户的密码。

```javascript
await milvusClient.updateUser(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.updateUser({
   username: string,
   newPassword: string,
   oldPassword: string,
   description?: string,
   timeout?: number
 })
```

**参数：**

- **username** （*string*） -

    **[必需]**

    现有用户的名称。

- **oldPassword** （*string*） -

    用户的原始密码。更改密码时为必需项。

- **newPassword** （*string*） -

    用户的新密码。更改密码时为必需项。

- **description** （*string*） -

    用户的描述。

- **timeout** (*number*) -  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

**返回：**

*Promise\<ResStatus\>*

此方法返回一个 Promise，该 Promise 会解析为 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则该值保持为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误码。如果此操作成功，则该值保持为 **Success**。

- **reason** (*string*) - 

    表示所报告错误的原因。如果此操作成功，则该值保持为空字符串。


**异常：**

- **Error**

    此操作过程中发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
await milvusClient.updateUser({
   username: 'exampleUser',
   newPassword: 'newPassword',
   oldPassword: 'oldPassword',
 })
```
