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

[Milvus Java SDK](https://github.com/milvus-io/milvus-sdk-java) 是 Milvus 和 Zilliz Cloud 的官方 Java 客户端。它为 Java 开发者提供同步与异步两类 API，可用于管理集合、向量、索引以及各类数据库操作。借助该 SDK，你可以在应用程序中完成常见的数据访问与管理任务，并以符合 Java 开发习惯的方式与 Milvus 或 Zilliz Cloud 服务进行交互。

## 功能特性

- **兼容 Java 8+**
- **支持 Maven 和 Gradle**
- **提供同步与异步 API**
- **支持集合与向量管理**
- **支持索引创建与管理**
- **支持 RBAC 和用户管理**
- 通过可选的 `milvus-sdk-java-bulkwriter` 包**支持批量导入**

这些能力覆盖了使用向量数据库时常见的开发场景，既适合快速接入，也适合在需要更完整管理能力的项目中使用。

## 安装

你可以使用 **Apache Maven** 或 **Gradle** 下载并集成该 SDK。根据你的项目构建工具，选择下面对应的依赖配置即可。

### Apache Maven

```xml
<dependency>
    <groupId>io.milvus</groupId>
    <artifactId>milvus-sdk-java</artifactId>
    <version>2.6.18</version>
</dependency>
```

### Gradle/Groovy

```plaintext
implementation 'io.milvus:milvus-sdk-java:2.6.18'
```

### Gradle/Kotlin

```sql
implementation("io.milvus:milvus-sdk-java:2.6.18")
```

如需使用 BulkWriter，请使用相同版本的 `milvus-sdk-java-bulkwriter`。这样可以在批量数据写入或导入场景中配合主 SDK 一起使用，并保持版本一致。

## 快速开始

下面的示例展示了如何创建一个 `MilvusClientV2` 客户端实例。你需要将 `uri` 替换为你的集群访问地址，并将 `token` 替换为实际的认证信息，以便应用程序能够连接到对应的服务端点。

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

MilvusClientV2 client = new MilvusClientV2(
    ConnectConfig.builder()
        .uri("https://your-cluster-endpoint")
        .token("user:password")
        .build()
);
```

## 版本

- [Java SDK v1 参考](./v1-About)
- [Java SDK v2 参考](./v2)

你可以根据所使用的 SDK 主版本进入相应参考文档，查看可用 API、参数说明以及示例用法。

import DocCardList from '@theme/DocCardList';

<DocCardList />
