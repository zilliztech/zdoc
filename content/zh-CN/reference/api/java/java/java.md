---
title: "Java SDK 参考 | Cloud"
slug: /java
sidebar_label: "概述"
sidebar_position: 2
displayed_sidebar: javaSidebar
beta: FALSE
notebook: FALSE
---

import Admonition from '@theme/Admonition';

# Java SDK 参考

[Milvus Java SDK](https://github.com/milvus-io/milvus-sdk-java) 是 Zilliz Cloud 的 Java SDK。其 v2 客户端 `MilvusClientV2` 通过类型化的请求构建器和响应对象来处理 Collection 管理、数据操作、向量搜索和集群管理。

## 功能特性

- **类型化 v2 API** — 使用 Java 构建器构建请求，并消费特定于操作的响应类型。
- **Collection 与索引管理** — 定义 Schema、创建 Collection 和索引，并控制 Collection 加载。
- **数据与向量操作** — 在 Java 应用程序中执行插入、upsert、删除、查询、搜索和混合搜索。
- **云管理** — 管理您的集群可用的 Database、Partition、用户、角色和资源组。
- **客户端连接池** — 当应用程序需要管理多个客户端连接时，可使用 SDK 的连接池类。
- **可选的 BulkWriter 构件** — 在为批量导入准备文件时，单独添加 `milvus-sdk-java-bulkwriter`。

## 安装

该 SDK 需要 Java 8 或更高版本。使用 Maven 添加核心构件：

```xml
<dependency>
    <groupId>io.milvus</groupId>
    <artifactId>milvus-sdk-java</artifactId>
    <version>3.0.8</version>
</dependency>
```

或使用 Gradle：

```groovy
implementation 'io.milvus:milvus-sdk-java:3.0.8'
```

当您的应用程序需要使用 BulkWriter 时，请为 `io.milvus:milvus-sdk-java-bulkwriter` 使用相同的版本号。在生产环境中固定版本之前，请检查 Maven Central 或 SDK 仓库。

## 连接到 Zilliz Cloud

从集群的 **Connect** 卡片中复制公共 Endpoint，并使用 API key 或集群凭据作为 token。

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.response.ListCollectionsResp;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String CLUSTER_TOKEN = "YOUR_CLUSTER_TOKEN";

ConnectConfig config = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(CLUSTER_TOKEN)
    .build();

MilvusClientV2 client = new MilvusClientV2(config);

try {
    ListCollectionsResp response = client.listCollections();
    System.out.println(response.getCollectionNames());
} finally {
    client.close();
}
```

## 相关资源

- [Java SDK v2 参考](./java/java/v2-Client-ConnectConfig)
- [Java SDK 源代码仓库](https://github.com/milvus-io/milvus-sdk-java)
- [Java SDK 示例](https://github.com/milvus-io/milvus-sdk-java/tree/master/examples)

import DocCardList from '@theme/DocCardList';

<DocCardList />
