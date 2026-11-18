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

---

# closeConnection()

此操作会关闭与 Milvus 服务器的当前连接。

```javascript
await milvusClient.closeConnection()
```

## 请求语法\{#request-syntax}

```javascript
milvusClient.closeConnection()
```

**返回值：**

*Promise&lt;CONNECT_STATUS&gt;*

一个 Promise，解析为与 Milvus 服务器当前连接的最终状态，应为 `SHUTDOWN`。


**异常：**

- **Error**

    当此操作期间发生任何错误时，会引发此异常。

## 示例\{#example}

```javascript
milvusClient.closeConnection()
```
