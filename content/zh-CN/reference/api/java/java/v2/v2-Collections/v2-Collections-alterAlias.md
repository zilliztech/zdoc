---
title: "alterAlias() | Java | v2"
slug: /java/java/v2-Collections-alterAlias
sidebar_label: "alterAlias()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "此操作会将一个集合的别名重新分配给另一个集合。 | Java | v2"
type: docx
token: Fv8EdYIt4oThstxgpzqcm7C0nug
sidebar_position: 1
keywords: 
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example
  - zilliz
  - zilliz cloud
  - cloud
  - alterAlias()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterAlias()

此操作会将一个集合的别名重新分配给另一个集合。

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

**BUILDER METHODS：**

- `alias(String alias)`

    集合的别名。请注意，该别名应预先存在。

    <Admonition type="info" icon="📘" title="说明">

    什么是集合别名？
    
        集合别名是集合的附加名称。当你希望将应用程序切换到一个新集合且无需对代码进行任何修改时，集合别名会非常有用。 
    
        在 Zilliz Cloud 上，集合别名是全局唯一标识符。一个别名只能分配给一个集合。相反，一个集合可以拥有多个别名。
    
        以下是将一个集合的别名重新分配给另一个集合的示例：
    
        假设有两个集合：`collection_1` 和 `collection_2`。还有一个名为 `bob` 的集合别名，最初它被分配给了 `collection_1`：
    
        - `collection_1` 的别名 = ["bob"]
    
        - `collection_2` 的别名 = []
    
        调用 `alterAlias` 函数并传入参数 `collection_2` 和 `bob` 后：
    
        - `collection_1` 的别名 = []
    
        - `collection_2` 的别名 = ["bob"]

    </Admonition>

- `databaseName(String databaseName)`

    目标集合所属数据库的名称。

- `collectionName(String collectionName)`

    要重新分配别名的目标集合名称。

**返回：**

*void*

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.AlterAliasReq;

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

