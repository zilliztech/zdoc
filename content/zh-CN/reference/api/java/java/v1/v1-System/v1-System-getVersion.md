---
title: "getVersion() | Java | v1"
slug: /java/v1-System-getVersion
sidebar_label: "getVersion()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法获取 milvus 内核版本。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#QK1rdJJazo2ZqhxClzack6ucnDc
sidebar_position: 2
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getVersion()

MilvusClient 接口。此方法获取 milvus 内核版本。

<Admonition type="info" icon="📘" title="说明">

<p>此方法适用于开源版 Milvus，但可能不适用于 Zilliz Cloud。</p>

</Admonition>

```java
R<GetVersionResponse> getVersion();
```

#### 返回值\{#returns}

此方法会捕获所有异常，并返回一个 `R<CheckHealthResponse>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 调用成功，则返回由 `R` 模板持有的有效 `GetVersionResponse`。您可以使用 `GetVersionResponse` 获取资源组信息。

#### 示例\{#example}

```java

R<GetVersionResponse> response = client.getVersion();

if (response.getStatus() != R.Status.Success.getCode()) {
    throw new RuntimeException(response.getMessage());
}
```

