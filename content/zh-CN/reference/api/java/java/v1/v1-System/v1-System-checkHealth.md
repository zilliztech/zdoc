---
title: "checkHealth() | Java | v1"
slug: /java/v1-System-checkHealth
sidebar_label: "checkHealth()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法用于检查 milvus 服务器健康状态。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#PnEgdKQ2ho3Ayux3Zc9cH3jZn8e
sidebar_position: 1
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# checkHealth()

MilvusClient 接口。此方法用于检查 milvus 服务器健康状态。

```java
R<CheckHealthResponse> checkHealth();
```

#### 返回值\{#returns}

此方法会捕获所有异常，并返回一个 `R<CheckHealthResponse>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误信息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和异常的错误信息。

- 如果 API 执行成功，则返回由 `R` 模板持有的有效 `CheckHealthResponse`。您可以使用 `CheckHealthResponse` 获取资源组信息。

#### 示例\{#example}

```java

R<CheckHealthResponse> response = client.checkHealth();

if (response.getStatus() != R.Status.Success.getCode()) {
    throw new RuntimeException(response.getMessage());
}
```
