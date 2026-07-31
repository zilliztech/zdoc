---
title: "queryAsync() | Java | v1"
slug: /java/v1-QuerySearch-queryAsync
sidebar_label: "queryAsync()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法根据由布尔表达式筛选的标量字段异步查询实体。请注意，返回实体的顺序无法保证。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#PUtDdkD1yoZWtAxjwiccFgybnWc
sidebar_position: 2
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# queryAsync()

MilvusClient 接口。此方法根据由布尔表达式筛选的标量字段异步查询实体。请注意，返回实体的顺序无法保证。

```java
ListenableFuture<R<QueryResults>> queryAsync(QueryParam requestParam);
```

此方法使用与 `query()` 相同的参数。它会调用 RPC 接口并立即返回一个 ListenableFuture 对象。

#### 示例\{#example}

```java
import io.milvus.param.dml.*;
import io.milvus.grpc.QueryResults;
import com.google.common.util.concurrent.ListenableFuture;

QueryParam param = QueryParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withExpr("id in [100, 101]")
        .addOutFields("field1")
        .withConsistencyLevel(ConsistencyLevelEnum.EVENTUALLY)
        .build();
ListenableFuture<R<QueryResults>> futureResults = client.queryAsync(param);
R<QueryResults> response = futureResults.get();
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
