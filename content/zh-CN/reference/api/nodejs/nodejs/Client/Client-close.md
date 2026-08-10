---
title: "close() | Node.js"
slug: /node/node/Client-close
sidebar_label: "close()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会关闭 `MilvusClientSession` 实例，并阻止后续会话请求。 | Node.js"
type: docx
token: Xwg8dMovYoRP94xNDjOc1TSNnsg
sidebar_position: 6
keywords: 
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - 向量 Database 教程
  - zilliz
  - zilliz cloud
  - 云
  - close()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# close()

此操作会关闭 `MilvusClientSession` 实例，并阻止后续会话请求。

```typescript
session.close(): void
```

## 请求语法\{#request-syntax}

```typescript
session.close()
```

**参数：**

此操作没有参数。

**返回值：**

*void*

仅关闭会话句柄，不会关闭父级 `MilvusClient` 连接池。

**异常：**

- **Error**

    后续会话操作将抛出 `MilvusClient session is closed`。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const session = client.session('cluster-a');
session.close();
```
