---
title: "searchAsync() | Java | v1"
slug: /java/v1-QuerySearch-searchAsync
sidebar_label: "searchAsync()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法以异步方式执行近似最近邻（ANN）搜索。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#DfhddHld8oaWoHxBfWUcDMZFn7d
sidebar_position: 4
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# searchAsync()

MilvusClient 接口。此方法以异步方式执行近似最近邻（ANN）搜索。

```java
ListenableFuture<R<SearchResults>> searchAsync(SearchParam requestParam);
```

此方法使用与 `search()` 相同的参数；它调用 RPC 接口并立即返回一个 ListenableFuture 对象。

#### 示例\{#example}

```java
import io.milvus.param.dml.*;
import io.milvus.grpc.SearchResults;
import com.google.common.util.concurrent.ListenableFuture;

SearchParam param = SearchParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withMetricType(MetricType.HAMMING)
        .withTopK(10)
        .withBinaryVectors(targetVectors)
        .withVectorFieldName("field1")
        .withConsistencyLevel(ConsistencyLevelEnum.EVENTUALLY)
        .build();
ListenableFuture<R<SearchResults>> futureResults = client.searchAsync(param);
R<SearchResults> response = futureResults.get();
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
