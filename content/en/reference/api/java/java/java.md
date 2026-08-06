---
title: "Java SDK Reference | Cloud"
slug: /java
sidebar_label: "Overview"
sidebar_position: 2
displayed_sidebar: javaSidebar
beta: FALSE
notebook: FALSE
---

import Admonition from '@theme/Admonition';

# Java SDK Reference

The [Milvus Java SDK](https://github.com/milvus-io/milvus-sdk-java) is the official Java client for Milvus and Zilliz Cloud. It provides synchronous and asynchronous APIs for managing collections, vectors, indexes, and database operations.

## Features

- **Java 8+ compatibility**
- **Maven and Gradle support**
- **Synchronous and asynchronous APIs**
- **Collection and vector management**
- **Index creation and management**
- **RBAC and user management**
- **Bulk import support** via optional `milvus-sdk-java-bulkwriter` package

## Installation

You can use **Apache Maven** or **Gradle** to download the SDK.

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

For BulkWriter, use `milvus-sdk-java-bulkwriter` with the same version.

## Quick Start

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

## Versions

- [Java SDK v1 Reference](./v1-About)
- [Java SDK v2 Reference](./v2)

import DocCardList from '@theme/DocCardList';

<DocCardList />
