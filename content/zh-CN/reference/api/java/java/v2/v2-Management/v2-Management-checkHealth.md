---
title: "checkHealth() | Java | v2"
slug: /java/java/v2-Management-checkHealth
sidebar_label: "checkHealth()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会检查当前 Milvus 实例的健康状态。 | Java | v2"
type: docx
token: TSuFdRAGiopuefxPbEVczwlCnRg
sidebar_position: 19
keywords: 
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - 开源向量 Database
  - zilliz
  - Zilliz Cloud
  - 云
  - checkHealth()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# checkHealth()

此操作会检查当前 Milvus 实例的健康状态。

```java
public CheckHealthResp checkHealth()
```

## 请求语法\{#request-syntax}

```java
CheckHealthResp()
```

**构建器方法：**

无

**返回类型：**

*CheckHealthResp*

**返回：**

一个 **CheckHealthResp** 对象，包含当前 Milvus 实例的详细健康信息。该对象具有以下字段：

**参数：**

- **isHealthy**（*Boolean*）-

    当前 Milvus 实例是否处于健康状态。

- **reasons**（*List&lt;String&gt;*）-

    如果服务器处于不健康状态，则为不健康的原因。

- **quotaStates**（*List&lt;String&gt;*）-

    不健康状态的名称。列表中可能出现以下名称："ReadLimited"、"WriteLimited"、"DenyToRead"、"DenyToWrite"、"DenyToDDL"。

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.response.CheckHealthResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Check healthy
CheckHealthResp healthyResp = client.checkHealth();
```
