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

The [Milvus Java SDK](https://github.com/milvus-io/milvus-sdk-java) is the Java SDK for Zilliz Cloud. Its v2 client, `MilvusClientV2`, uses typed request builders and response objects for collection management, data operations, vector search, and cluster administration.

## Features

- **Typed v2 API** — Build requests with Java builders and consume operation-specific response types.
- **Collection and index management** — Define schemas, create collections and indexes, and control collection loading.
- **Data and vector operations** — Insert, upsert, delete, query, search, and run hybrid searches from Java applications.
- **Cloud administration** — Manage databases, partitions, users, roles, and resource groups available to your cluster.
- **Client pooling** — Use the SDK pool classes when an application needs to manage multiple client connections.
- **Optional BulkWriter artifact** — Add `milvus-sdk-java-bulkwriter` separately when preparing files for bulk import.

## Installation

The SDK requires Java 8 or later. Add the core artifact with Maven:

```xml
<dependency>
    <groupId>io.milvus</groupId>
    <artifactId>milvus-sdk-java</artifactId>
    <version>2.6.22</version>
</dependency>
```

Or use Gradle:

```groovy
implementation 'io.milvus:milvus-sdk-java:2.6.22'
```

Use the same release number for `io.milvus:milvus-sdk-java-bulkwriter` when your application needs BulkWriter. Check Maven Central or the SDK repository before pinning a version in production.

## Connect to Zilliz Cloud

Copy the public endpoint from the cluster **Connect** card and use an API key or cluster credential as the token.

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

## Resources

- [Java SDK v2 Reference](./v2)
- [Java SDK source repository](https://github.com/milvus-io/milvus-sdk-java)
- [Java SDK examples](https://github.com/milvus-io/milvus-sdk-java/tree/master/examples)

import DocCardList from '@theme/DocCardList';

<DocCardList />
