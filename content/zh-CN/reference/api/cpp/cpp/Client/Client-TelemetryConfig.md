---
title: "TelemetryConfig | Cloud"
slug: /cpp/cpp/Client-TelemetryConfig
sidebar_label: "TelemetryConfig"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此结构体保存客户端遥测配置，用于上报指标、心跳和服务器推送的命令。连接时，将 `TelemetryConfig` 传递给 `ConnectParam:WithTelemetryConfig()`。 | Cloud"
type: docx
token: XTxZdqmCIoUv7vx2yMVccq3RnYc
sidebar_position: 16
keywords: 
  - 什么是向量 Database
  - 向量 Database 对比
  - Faiss
  - 视频搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - TelemetryConfig
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# TelemetryConfig

此结构体保存客户端遥测配置，用于上报指标、心跳和服务器推送的命令。连接时，将 `TelemetryConfig` 传递给 `ConnectParam::WithTelemetryConfig()`。

```c++
struct TelemetryConfig {
    bool enabled{true};
    uint64_t heartbeat_interval_ms{10000};
    double sampling_rate{1.0};
    size_t error_max_count{100};
    std::string client_id;
};
```

**参数：**

- **enabled**（*bool*）

    是否启用遥测上报。该值默认为 `true`。

- **heartbeat_interval_ms**（*uint64_t*）

    心跳之间的毫秒数，同时也是指标窗口。每次心跳都会携带自上次心跳以来的操作。Coordinator 会基于最新窗口之前的窗口来应答遥测查询，因此调用方读取到的数据会滞后一到两个间隔。该值默认为 `10000`。

- **sampling_rate**（*double*）

    已记录操作的采样率（0.0 到 1.0）。该值默认为 `1.0`。

- **error_max_count**（*size_t*）

    保留的已记录错误数量上限。该值默认为 `100`。

- **client_id**（*std::string*）

    可选的稳定身份标识；为空时使用随机 UUID。

## 示例\{#example}

```c++
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
milvus::TelemetryConfig telemetry_config;
telemetry_config.enabled = true;
connect_param.WithTelemetryConfig(telemetry_config);
```
