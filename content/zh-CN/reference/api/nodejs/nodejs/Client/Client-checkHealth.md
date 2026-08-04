---
title: "checkHealth() | Node.js"
slug: /node/node/Client-checkHealth
sidebar_label: "checkHealth()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作用于检查 Milvus 服务器的健康状态。 | Node.js"
type: docx
token: DDvudeY20o6tV5xwwo4cKovjnHf
sidebar_position: 2
keywords: 
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - zilliz
  - zilliz cloud
  - cloud
  - checkHealth()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# checkHealth()

此操作用于检查 Milvus 服务器的健康状态。

```javascript
await milvusClient.checkHealth()
```

## 请求语法\{#request-syntax}

```javascript
milvusClient.checkHealth()
```

**返回类型：**

*Promise*\<*CheckHealthResponse*>

**返回：** *Promise&lt;CheckHealthResponse&gt;*

此方法返回一个 Promise，该 Promise 会解析为一个 **CheckHealthResponse** 对象。

```typescript
{
    isHealthy: boolean,
    reasons: string[]
}
```

**参数：**

- **isHealthy** (*boolean*) -

    一个布尔值，表示 Milvus 部署中的所有关键组件是否都处于健康状态。

- **reasons** (*string[]*) -

    当 **isHealthy** 为 **false** 时，返回一个包含人类可读原因的列表，用于说明哪些组件不健康。当 **isHealthy** 为 **true** 时，该列表为空。

## 示例\{#examples}

```javascript
milvusClient.checkHealth()
```
