---
title: "close() | Java | v2"
slug: /java/java/v2-Client-close
sidebar_label: "close()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会关闭客户端并释放底层 gRPC 通道，取消待处理的异步重试，并最多等待一分钟，以使进行中的调用完成。 | Java | v2"
type: docx
token: TX2vdOOxtomTrQxK4EbcjxPCn1g
sidebar_position: 4
keywords: 
  - HNSW 算法
  - 向量相似度搜索
  - 近似最近邻搜索
  - DiskANN
  - Zilliz
  - Zilliz Cloud
  - 云
  - close()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# close()

此操作会关闭客户端并释放底层 gRPC 通道，取消待处理的异步重试，并最多等待一分钟，以使进行中的调用完成。

```java
public void close()
```

**异常：**

- **MilvusException**

    服务器拒绝请求或 RPC 失败时抛出。请检查服务器错误消息，以了解确切的失败原因。

## 示例\{#example}

所有操作完成后，关闭客户端。

```java
client.close();
```
