---
title: "closeConnection() | Node.js"
slug: /node/node/Client-closeConnection
sidebar_label: "closeConnection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会关闭与 Milvus 服务器的当前连接。 | Node.js"
type: docx
token: HtOGdjTpOoG0RcxpGv1cCBcEnAh
sidebar_position: 3
keywords: 
  - 神经网络
  - 深度学习
  - 知识库
  - 自然语言处理
  - zilliz
  - zilliz cloud
  - 云
  - closeConnection()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# closeConnection()

此操作会关闭与 Milvus 服务器的当前连接。

```javascript
await milvusClient.closeConnection()
```

## 请求语法\{#request-syntax}

```javascript
milvusClient.closeConnection()
```

**返回类型：**

*Promise*\<*CONNECT_STATUS*>

**返回值：**

一个 Promise，解析为与 Milvus 服务器当前连接的最终状态，应为 `SHUTDOWN`。

## 示例\{#example}

```javascript
milvusClient.closeConnection()
```
