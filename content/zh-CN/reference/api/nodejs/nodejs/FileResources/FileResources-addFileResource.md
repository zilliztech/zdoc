---
title: "addFileResource() | Node.js"
slug: /node/node/FileResources-addFileResource
sidebar_label: "addFileResource()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向 Milvus 元数据添加一个具名文件资源。 | Node.js"
type: docx
token: RnyUdtGbFoIC7AxyhmNcbudYnhb
sidebar_position: 1
keywords: 
  - 什么是向量嵌入
  - 向量 Database 教程
  - 向量 Database 如何工作
  - 向量 Database 对比
  - Zilliz
  - Zilliz Cloud
  - 云
  - addFileResource()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# addFileResource()

此操作会向 Milvus 元数据添加一个具名文件资源。

## 请求语法\{#request-syntax}

```typescript
milvusClient.addFileResource({ name, path, timeout? })
```

**参数：**

- **name**（*string*）-

    用于引用该文件资源的名称。

- **path**（*string*）-

    远程文件的路径。

- **timeout**（*number*）-

    允许 RPC 执行的可选持续时间，以毫秒为单位。默认值为 undefined。

**返回类型：**

*ResStatus*

**返回：**

一个 Promise，其解析结果为操作状态。

**参数：**

- **error_code**（*number*）-

    错误码编号：0 表示成功。

- **reason**（*string*）-

    错误原因（如有）。

**异常：**

- **MilvusError**

    当服务器拒绝请求或 RPC 失败时抛出。请检查服务器错误消息以获取确切的失败原因。

## 示例\{#example}

```javascript
await milvusClient.addFileResource({
  name: 'training_data',
  path: 's3://bucket/training.csv',
});
```
