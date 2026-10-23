---
title: "getLoadStateV2() | Java | v2"
slug: /java/java/v2-Collections-getLoadStateV2
sidebar_label: "getLoadStateV2()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取 Collection 或 Partition 的详细加载状态信息。当您同时需要当前加载状态和加载进度时，请使用此操作。 | Java | v2"
type: docx
token: JEgudTxxYocs2VxLjgccpB7SnOb
sidebar_position: 43
keywords: 
  - 开源向量 Database
  - 向量 Database 示例
  - RAG 向量 Database
  - 什么是向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - getLoadStateV2()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getLoadStateV2()

此操作获取 Collection 或 Partition 的详细加载状态信息。当您同时需要当前加载状态和加载进度时，请使用此操作。

```java
public GetLoadStateResp getLoadStateV2(GetLoadStateReq request)
```

## 请求语法\{#request-syntax}

```java
getLoadStateV2(GetLoadStateReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build());
```

**构建器方法：**

- `databaseName(String databaseName)`

    包含该 Collection 的 Database。

- `collectionName(String collectionName)`

    要检查其加载状态的 Collection。

- `partitionName(String partitionName)`

    可选的 Partition 名称。省略此参数可检查 Collection 级别的加载状态。

**返回类型：**

*GetLoadStateResp*

**返回：**

返回一个 **GetLoadStateResp** 对象，包含指定 Collection 或 Partition 的加载状态和加载进度。

**参数：**

- **state** (*LoadState*) -

    Collection 或 Partition 的当前加载状态。

- **progress** (*Long*) -

    Collection 或 Partition 的加载进度。仅当加载状态为 **Loading** 时，此字段才有值。

**异常：**

- **MilvusClientException**

    当验证失败或服务器对此操作返回错误时，将抛出此异常。

## 示例\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")
    .build());

GetLoadStateResp resp = client.getLoadStateV2(GetLoadStateReq.builder()
    .collectionName("book")
    .build());
System.out.println(resp.getState());
System.out.println(resp.getProgress());
```

{/* category: Collections; action: CREATE; addedSince: v3.0.x */}
