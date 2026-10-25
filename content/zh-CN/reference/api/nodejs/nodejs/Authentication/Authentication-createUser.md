---
title: "createUser() | Node.js"
slug: /node/node/Authentication-createUser
sidebar_label: "createUser()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作为 Milvus 服务器创建一个新用户账户。 | Node.js"
type: docx
token: MtHHdvQ36oZcM8xEDpwcCUBynmb
sidebar_position: 7
keywords: 
  - 自然语言处理
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - createUser()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# createUser()

此操作为 Milvus 服务器创建一个新用户账户。

## 请求语法\{#request-syntax}

```typescript
milvusClient.createUser({ username, password, description?, timeout? })
```

**参数：**

- **username**（*string*）-

    新用户的用户名。

- **password**（*string*）-

    新用户的密码。

- **description**（*string*）-

    新用户的可选描述。

- **timeout**（*number*）-

    允许 RPC 执行的可选时长，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。默认值为 undefined。

**返回类型：**

*ResStatus*

**返回：**

响应状态：`{error_code, reason}`。

**参数：**

- **error_code**（*number*）-

    错误代码编号：0 表示成功。

- **reason**（*string*）-

    错误的原因（如有）。

**异常：**

- **MilvusError**

    当服务器拒绝请求或 RPC 失败时引发。请检查服务器错误消息，以了解确切的失败原因。

## 示例\{#example}

```javascript
await milvusClient.createUser({
  username: 'exampleUser',
  password: 'examplePassword',
});
```
