---
title: "upsertAsync | Java | v1"
slug: /java/v1-Collection-upsertAsync
sidebar_label: "upsertAsync"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法将新实体插入到指定集合中，如果实体已存在，则将其替换。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#L9dudvetmoHTKxxoPx5c4QSInhe
sidebar_position: 14
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# upsertAsync()

MilvusClient 接口。此方法将新实体插入到指定集合中，如果实体已存在，则将其替换。

```java
ListenableFuture<R<MutationResult>> upsertAsync(UpsertParam requestParam);
```

此方法使用与 `upsert()` 相同的参数。它调用 RPC 接口并立即返回一个 `ListenableFuture` 对象。

#### 示例\{#example}

```java
import io.milvus.param.*;
import io.milvus.response.MutationResultWrapper;
import io.milvus.grpc.MutationResult;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

List<List<Float>> vectors = generateFloatVectors(1);
List<JsonObject> rows = new ArrayList<>();
JsonObject row = new JsonObject();
row.addProperty("id", (long)i);
row.add("vector", gson.toJsonTree(vectors.get(0)));
rows.add(row);

UpsertParam param = UpsertParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withRows(rows)
        .build();
ListenableFuture<R<MutationResult>> response = client.upsertAsync(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

R<MutationResult> result = response.get();
MutationResultWrapper wrapper = new MutationResultWrapper(result.getData());
System.out.println(wrapper.getInsertCount() + " rows upserted");
```
