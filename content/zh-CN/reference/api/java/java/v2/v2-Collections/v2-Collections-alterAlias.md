---
title: "alterAlias() | Java | v2"
slug: /java/java/v2-Collections-alterAlias
sidebar_label: "alterAlias()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会将一个 Collection 的别名重新分配给另一个 Collection。 | Java | v2"
type: docx
token: SkdsdSZ9lo79GYx31YEcvaSon4c
sidebar_position: 1
keywords: 
  - 向量索引
  - 开源向量 Database
  - 开源向量 Database
  - 向量 Database 示例
  - zilliz
  - Zilliz Cloud
  - 云
  - alterAlias()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# alterAlias()

此操作会将一个 Collection 的别名重新分配给另一个 Collection。

```java
public void alterAlias(AlterAliasReq request)
```

## 请求语法\{#request-syntax}

```java
alterAlias(AlterAliasReq.builder()
    .alias(String alias)
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**构建器方法：**

- `alias(String alias)`

    该 Collection 的别名。请注意，该别名应事先存在。

    Collection 别名是 Collection 的附加名称。当您希望在不更改代码的情况下将应用程序切换到新 Collection 时，Collection 别名会非常有用。

    在 Milvus 中，Collection 别名是全局唯一标识符。一个别名只能分配给一个 Collection。反之，一个 Collection 可以拥有多个别名。

    以下是将一个 Collection 的别名重新分配给另一个 Collection 的示例：

    假设有两个 Collection：`collection_1` 和 `collection_2`。还有一个名为 `bob` 的 Collection 别名，它最初分配给 `collection_1`：

    - `collection_1` 的别名 = ["bob"]

    - `collection_2` 的别名 = []

    使用参数 `collection_2` 和 `bob` 调用 `alterAlias` 函数后：

    - `collection_1` 的别名 = []

    - `collection_2` 的别名 = ["bob"]

- `databaseName(String databaseName)`

    目标 Collection 所属 Database 的名称。

- `collectionName(String collectionName)`

    要重新分配别名的目标 Collection 名称。

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.AlterAliasReq;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Alter the alias for collection "test"
AlterAliasReq alterAliasReq = AlterAliasReq.builder()
        .collectionName("test")
        .alias("test_alias2")
        .build();
client.alterAlias(alterAliasReq);
```
