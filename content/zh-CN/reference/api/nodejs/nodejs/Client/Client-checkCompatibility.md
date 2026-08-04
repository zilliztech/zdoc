---
title: "checkCompatibility() | Node.js"
slug: /node/node/Client-checkCompatibility
sidebar_label: "checkCompatibility()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于检查 SDK 与 Milvus 服务器的兼容性。 | Node.js"
type: docx
token: Tq1Md4GuIoNbfuxK03ncIa7onMc
sidebar_position: 1
keywords: 
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - checkCompatibility()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# checkCompatibility()

此操作用于检查 SDK 与 Milvus 服务器的兼容性。

```javascript
await milvusClient.checkCompatibility(data?)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.checkCompatibility({
    checker?: Function,
    message?: string
})
```

**参数：**

- **checker** (*Function*) -

    如果当前 SDK 兼容，则会调用的回调函数。

- **message** (*string*) -  

    如果 SDK 不兼容，则抛出的错误消息。

**返回类型：**

*Promise*\<*any*>

**返回值：**

一个 Promise，会解析为指定 `checker` 函数的结果。

## 示例\{#examples}

```javascript
await milvusClient.checkCompatibility({
   checker: () => { console.log("compatible") },
   message: "incompatible"
});
```
