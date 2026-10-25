---
title: "listFileResources() | Node.js"
slug: /node/node/FileResources-listFileResources
sidebar_label: "listFileResources()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出注册在 Milvus 元数据中的文件资源。 | Node.js"
type: docx
token: GK8hdiDs8olcOtxu0BKc89Vxn0b
sidebar_position: 2
keywords: 
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - LLM 作为评判者
  - zilliz
  - zilliz cloud
  - 云
  - listFileResources()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# listFileResources()

此操作会列出注册在 Milvus 元数据中的文件资源。

## 请求语法\{#request-syntax}

```typescript
milvusClient.listFileResources({ timeout? })
```

**参数：**

- **timeout** （*number*） -

    允许 RPC 执行的时长，单位为毫秒，为可选参数。该值默认为 undefined。

**返回类型：**

*ListFileResourcesResponse*

**返回：**

响应状态和已注册的文件资源列表。

**参数：**

- **status** （*ResStatus*） -

    操作状态：`{error_code, reason}`。

- **resources** （*FileResourceInfo[]*） -

    已注册的文件资源：每个条目包含 `{id, name, path}`。

**异常：**

- **MilvusError**

    当服务器拒绝请求或 RPC 失败时抛出。请检查服务器错误消息以获取确切的失败原因。

## 示例\{#example}

```javascript
const response = await milvusClient.listFileResources({});
```
