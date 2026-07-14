---
title: "Java SDK リファレンス | Cloud"
slug: /java
sidebar_label: "概要"
sidebar_position: 2
displayed_sidebar: javaSidebar
beta: FALSE
notebook: FALSE
---

import Admonition from '@theme/Admonition';

# Java SDK リファレンス

[Milvus Java SDK](https://github.com/milvus-io/milvus-sdk-java) は、Milvus と Zilliz Cloud 向けの公式 Java クライアントです。collection、vector、index、およびデータベース操作を管理するための同期 API と非同期 API を提供します。

## 機能

- **Java 8+ 互換**
- **Maven と Gradle をサポート**
- **同期 API と非同期 API**
- **Collection と vector の管理**
- **Index の作成と管理**
- **RBAC とユーザー管理**
- オプションの `milvus-sdk-java-bulkwriter` パッケージによる **Bulk import のサポート**

## インストール

SDK のダウンロードには、**Apache Maven** または **Gradle** を使用できます。

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

BulkWriter には、同じバージョンの `milvus-sdk-java-bulkwriter` を使用します。

## クイックスタート

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

## バージョン

- [Java SDK v1 リファレンス](./v1-About)
- [Java SDK v2 リファレンス](./v2)

import DocCardList from '@theme/DocCardList';

<DocCardList />
