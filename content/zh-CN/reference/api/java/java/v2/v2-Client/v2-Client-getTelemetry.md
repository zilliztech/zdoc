---
title: "getTelemetry() | Java | v2"
slug: /java/java/v2-Client-getTelemetry
sidebar_label: "getTelemetry()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回已连接客户端的遥测管理器。 | Java | v2"
type: docx
token: OykrdeI7zobXOuxXsxBcId4pn8c
sidebar_position: 7
keywords: 
  - 余弦距离
  - 什么是向量 Database
  - vectordb
  - 多模态向量 Database 检索
  - zilliz
  - zilliz cloud
  - 云
  - getTelemetry()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getTelemetry()

此操作返回已连接客户端的遥测管理器。

```java
public ClientTelemetryManager getTelemetry()
```

**返回类型：**

*ClientTelemetryManager*

**返回：**

已连接客户端的遥测管理器；当遥测不可用时返回 `null`。

**参数：**

- **telemetry**（*ClientTelemetryManager*）-

    已连接客户端的 **ClientTelemetryManager** 实例。使用 `isSupported()` 检查遥测支持情况，使用 `registerCommandHandler()` 注册服务器推送的命令处理程序，并使用 `getConfig()` 读取当前配置。

**异常：**

- **MilvusClientException**

    如果此操作期间发生任何错误，将引发此异常。

## 示例\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

ClientTelemetryManager telemetry = client.getTelemetry();
if (telemetry != null && telemetry.isSupported()) {
    telemetry.registerCommandHandler("custom_command", command -> {
        // Handle a server-pushed telemetry command.
        return TelemetryCommandReply.of(command);
    });
}
```
