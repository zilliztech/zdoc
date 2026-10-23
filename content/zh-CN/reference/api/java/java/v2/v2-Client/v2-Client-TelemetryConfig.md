---
title: "TelemetryConfig | Java | v2"
slug: /java/java/v2-Client-TelemetryConfig
sidebar_label: "TelemetryConfig"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "TelemetryConfig 实例保存客户端遥测配置，用于上报指标、心跳和服务器推送的命令。 | Java | v2"
type: docx
token: C5PrdABXTokjv0xcpb9cZQd5nSb
sidebar_position: 10
keywords: 
  - 大语言模型
  - 向量化
  - k 最近邻算法
  - ANNS
  - zilliz
  - zilliz cloud
  - 云
  - TelemetryConfig
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# TelemetryConfig

TelemetryConfig 实例保存客户端遥测配置，用于上报指标、心跳和服务器推送的命令。

```java
io.milvus.telemetry.TelemetryConfig
```

## 构造函数\{#constructor}

此构建器创建遥测配置。

```java
TelemetryConfig.builder()
    .enabled(boolean enabled)
    .heartbeatIntervalMs(long heartbeatIntervalMs)
    .samplingRate(double samplingRate)
    .errorMaxCount(int errorMaxCount)
    .clientId(String clientId)
    .build()
```

**构建器方法：**

- `enabled(boolean enabled)`<br/>
  是否启用遥测上报。默认为 `true`。

- `heartbeatIntervalMs(long heartbeatIntervalMs)`<br/>
  心跳之间的毫秒数，同时也是指标窗口。每次心跳都会携带自上次心跳以来的操作。默认为 `10000`。

- `samplingRate(double samplingRate)`<br/>
  已记录操作的采样率（0.0 到 1.0）。默认为 `1.0`。

- `errorMaxCount(int errorMaxCount)`<br/>
  保留的已记录错误的最大数量。默认为 `100`。

- `clientId(String clientId)`<br/>
  可选的稳定身份标识。为空时使用随机 UUID。

**返回类型：**

*TelemetryConfig*

**返回：**

**TelemetryConfig** 对象包含以下字段：

**参数：**

- **enabled**（*boolean*）-

    是否启用遥测上报。默认为 `true`。

- **heartbeatIntervalMs**（*long*）-

    心跳之间的毫秒数，同时也是指标窗口。每次心跳都会携带自上次心跳以来的操作。默认为 `10000`。

- **samplingRate**（*double*）-

    已记录操作的采样率（0.0 到 1.0）。默认为 `1.0`。

- **errorMaxCount**（*int*）-

    保留的已记录错误的最大数量。默认为 `100`。

- **clientId**（*String*）-

    可选的稳定客户端身份标识。为空时使用随机 UUID。

**方法：**

- `boolean isEnabled()`<br/>
  返回是否启用遥测上报。

- `long getHeartbeatIntervalMs()`<br/>
  返回以毫秒为单位的心跳间隔。

- `double getSamplingRate()`<br/>
  返回已记录操作的采样率。

- `int getErrorMaxCount()`<br/>
  返回保留的已记录错误的最大数量。

- `String getClientId()`<br/>
  返回稳定的客户端身份标识。

## 示例\{#example}

```java
ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .telemetryConfig(TelemetryConfig.builder()
                .enabled(true)
                .heartbeatIntervalMs(15000)
                .build())
        .build();
```
