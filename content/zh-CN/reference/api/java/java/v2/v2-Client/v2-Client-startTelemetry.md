---
title: "startTelemetry() | Java | v2"
slug: /java/java/v2-Client-startTelemetry
sidebar_label: "startTelemetry()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作启动一个遥测管理器，该管理器的 worker 在连接设置期间被有意延迟启动。 | Java | v2"
type: docx
token: NLr1dU4t1oyTHcxZvXUc10Aundb
sidebar_position: 9
keywords: 
  - 什么是向量 Database
  - 向量 Database 对比
  - Faiss
  - 视频搜索
  - zilliz
  - zilliz cloud
  - 云
  - startTelemetry()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# startTelemetry()

此操作启动一个遥测管理器，该管理器的 worker 在连接设置期间被有意延迟启动。

```java
public void startTelemetry()
```

当客户端以延迟启动遥测的方式创建时，此方法很有用。请在连接设置完成后调用此方法，以开始报告指标和心跳。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

client.startTelemetry();
```
