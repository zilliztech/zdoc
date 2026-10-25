---
title: "updateUser() | Node.js"
slug: /node/node/Authentication-updateUser
sidebar_label: "updateUser()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会更新用户账户的密码、描述，或同时更新两者。 | Node.js"
type: docx
token: L4tGd5KqLoLtp2xQRyhcaXjsnL5
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

import Admonition from '@theme/Admonition';


# updateUser()

此操作会更新用户账户的密码、描述，或同时更新两者。

## 请求语法\{#request-syntax}

```typescript
milvusClient.updateUser({ username, newPassword?, oldPassword?, description?, timeout? })
```

**参数：**

- **username** （*string*） -

    要更新的用户的用户名。

- **newPassword** （*string*） -

    用户的新密码。仅在更新密码时必须提供。

- **oldPassword** （*string*） -

    用户的旧密码。在请求更新密码时必须提供。

- **description** （*string*） -

    用户的新描述。

- **timeout** （*number*） -

    允许 RPC 执行的以毫秒为单位的可选时长。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。该值默认为 undefined。

**返回类型：**

*ResStatus*

**返回：**

响应状态：`{error_code, reason}`。

**参数：**

- **error_code** （*number*） -

    错误代码编号：0 表示成功。

- **reason** （*string*） -

    错误的原因（如果有）。

**异常：**

- **MilvusError**

    当服务器拒绝请求或 RPC 失败时抛出。请检查服务器错误消息，以获取确切的失败原因。

## 示例\{#example}

```javascript
await milvusClient.updateUser({
  username: 'exampleUser',
  description: 'new description',
});
```
