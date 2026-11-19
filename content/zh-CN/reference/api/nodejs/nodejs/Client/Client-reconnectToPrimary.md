---
title: "reconnectToPrimary() | Node.js"
slug: /node/node/Client-reconnectToPrimary
sidebar_label: "reconnectToPrimary()"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "此操作会将客户端重新连接到全局集群拓扑中的主集群，并在主 Endpoint 发生变化时重建通道池。 | Node.js"
type: origin
token: shared-Client-reconnectToPrimary
displayed_sidebar: nodeSidebar

---

# reconnectToPrimary()

此操作会将客户端重新连接到全局集群拓扑中的主集群，并在主 Endpoint 发生变化时重建通道池。

```javascript
await milvusClient.reconnectToPrimary()
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.reconnectToPrimary()
```

**参数：**

此操作没有参数。

**返回：**

*Promise&lt;boolean&gt;*

此方法返回一个 promise，该 promise 会解析为 **boolean**，用于指示客户端是否已成功重新连接到主集群。

**异常：**

- **Error**

    如果此操作期间发生任何错误，就会引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const reconnected = await milvusClient.reconnectToPrimary();
```
