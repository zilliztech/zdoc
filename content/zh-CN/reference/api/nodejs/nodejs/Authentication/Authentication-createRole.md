---
title: "createRole() | Node.js"
slug: /node/node/Authentication-createRole
sidebar_label: "createRole()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会在 Milvus 服务器中创建一个新角色。 | Node.js"
type: docx
token: TR8xdMnzEo85sLxAtizcJWZdn6b
sidebar_position: 6
keywords: 
  - 什么是 Milvus
  - Milvus Database
  - Milvus Lite
  - Milvus 基准测试
  - Zilliz
  - Zilliz Cloud
  - 云
  - createRole()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# createRole()

此操作会在 Milvus 服务器中创建一个新角色。

## 请求语法\{#request-syntax}

```typescript
milvusClient.createRole({ roleName, description?, timeout? })
```

**参数：**

- **roleName**（*string*）-

    新角色的名称。

- **description**（*string*）-

    新角色的可选描述。

- **timeout**（*number*）-

    允许 RPC 执行的可选时长，单位为毫秒。如果将其设置为 undefined，客户端会一直等待，直到服务器响应或发生错误。该值默认为 undefined。

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

    当服务器拒绝请求或 RPC 失败时抛出。请检查服务器错误消息以获取确切的失败原因。

## 示例\{#example}

```javascript
await milvusClient.createRole({
  roleName: 'exampleRole',
});
```
