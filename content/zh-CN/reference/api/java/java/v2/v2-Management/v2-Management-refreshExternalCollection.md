---
title: "refreshExternalCollection() | Java | v2"
slug: /java/java/v2-Management-refreshExternalCollection
sidebar_label: "refreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会触发一个刷新作业，从外部源拉取数据到 Milvus Collection 中。返回一个作业 ID，可将其传递给 `getRefreshExternalCollectionProgress()` 以跟踪进度。 | Java | v2"
type: docx
token: G8JydoIzPoKb2MxASemcW2spnbe
sidebar_position: 32
keywords: 
  - 视频去重
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - zilliz
  - zilliz cloud
  - 云
  - refreshExternalCollection()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# refreshExternalCollection()

此操作会触发一个刷新作业，从外部源拉取数据到 Milvus Collection 中。返回一个作业 ID，可将其传递给 `getRefreshExternalCollectionProgress()` 以跟踪进度。

```java
public RefreshExternalCollectionResp refreshExternalCollection(RefreshExternalCollectionReq request)
```

## 请求语法\{#request-syntax}

```java
refreshExternalCollection(RefreshExternalCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .externalSource(String externalSource)
    .externalSpec(JsonObject externalSpec)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -

    Database 的名称。如果未指定，该值默认为当前 Database。

- `collectionName(String collectionName)` -

    **[必需]**

    要刷新的 Collection 的名称。

- `externalSource(String externalSource)` -

    外部源 URI。

    请同时提供 `externalSource` 和 `externalSpec`，或两者都省略；如果两者都省略，刷新操作会重用已持久化的源和规范。

    在 Zilliz Cloud 上，`externalSource` 支持两种方案：`volume://<volume_name>/<path>` 和 `milvus://<instance_id>/<db_name>/<collection_name>`。对于 `volume://` URI，适用上述规则。对于 `milvus://` 源，您必须在每次刷新请求中传入 `externalSource`；如果省略，Collection 将继续提供此前同步的数据。

- `externalSpec(JsonObject externalSpec)` -

    一个 JSON 对象，包含外部源规范，例如 `format`。`format` 的可选值为 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。

    在 Zilliz Cloud 上，`milvus-table` 源与 `milvus://` 方案配合使用；对于 `milvus://` 源，可以省略 `format`，其默认值为 `milvus-table`。

**返回类型：**

*RefreshExternalCollectionResp*

**返回：**

**RefreshExternalCollectionResp** 对象包含新启动的刷新作业的 ID。

**参数：**

- **jobId**（*long*） -

    新启动的刷新作业的数字 ID。请保存此值，以便使用 `getRefreshExternalCollectionProgress()` 查询进度。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```java
import com.google.gson.JsonObject;
import io.milvus.v2.service.utility.request.RefreshExternalCollectionReq;
import io.milvus.v2.service.utility.response.RefreshExternalCollectionResp;

JsonObject spec = new JsonObject();
spec.addProperty("endpoint", "https://s3.amazonaws.com");
spec.addProperty("bucket", "my-bucket");
spec.addProperty("path", "data/snapshots/2026-05-01/");

RefreshExternalCollectionResp resp = client.refreshExternalCollection(
    RefreshExternalCollectionReq.builder()
        .collectionName("my_collection")
        .externalSource("s3")
        .externalSpec(spec)
        .build()
);
long jobId = resp.getJobId();
System.out.println("Started refresh job: " + jobId);
```
