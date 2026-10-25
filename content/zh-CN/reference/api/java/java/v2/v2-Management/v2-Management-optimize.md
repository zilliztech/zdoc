---
title: "optimize() | Java | v2"
slug: /java/java/v2-Management-optimize
sidebar_label: "optimize()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会优化 Collection 数据的物理布局，例如通过 Compaction 将 Segment 调整到目标大小，或重建索引。 | Java | v2"
type: docx
token: SxrVdEzD4oLV9MxZbuzc6ltNnKe
sidebar_position: 31
keywords: 
  - 向量数据库
  - 多模态向量 Database 检索
  - 检索增强生成
  - 大语言模型
  - zilliz
  - zilliz cloud
  - 云
  - optimize()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# optimize()

此操作会优化 Collection 数据的物理布局，例如通过 Compaction 将 Segment 调整到目标大小，或重建索引。

```java
public OptimizeTask optimize(OptimizeReq request)
```

## 请求语法\{#request-syntax}

```java
optimize(OptimizeReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .targetSize(String targetSize)
    .async(boolean async)
    .timeout(Long timeout)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    Database 的名称。如果未指定，则默认为当前 Database。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `targetSize(String targetSize)`

    目标 Segment 大小，例如 `"512MB"` 或 `"1GB"`。`null` 值会使用服务器默认值。

- `async(boolean async)`

    是否在后台运行优化。当为 `false`（默认值）时，此操作会一直阻塞到优化完成。当为 `true` 时，会立即返回一个 `OptimizeTask`。

- `timeout(Long timeout)`

    超时时间，单位为毫秒。`null` 值表示无超时。

**返回类型：**

*OptimizeTask*

**返回：**

一个会跟踪进度并提供优化结果的 **OptimizeTask**。调用 `getResult(Long timeoutMs)` 会阻塞，直到结果可用，然后返回最终的 **OptimizeResp**，其中包含以下字段：

**参数：**

- **status** (*String*) -

    优化的状态。

- **collectionName** (*String*) -

    经过优化的 Collection 名称。

- **compactionId** (*Long*) -

    由该优化触发的 Compaction ID。

- **targetSize** (*String*) -

    优化的目标 Segment 大小。

- **progress** (*List&lt;String&gt;*) -

    优化的进度消息。

### OptimizeTask\{#optimizetask}

**方法：**

- `void start()`

    启动优化任务。

- `boolean isDone()`

    返回优化是否已完成。

- `boolean isCancelled()`

    返回优化是否已取消。

- `ProgressStage getProgress()`

    返回当前进度阶段。

- `List<String> getProgressHistoryAsStrings()`

    以字符串形式返回进度历史记录。

- `boolean cancel()`

    尝试取消优化。

- `OptimizeResp getResult(Long timeoutMs)`

    阻塞，直到结果可用或超时，然后返回 `OptimizeResp`。

    **ProgressStage** 值：`INITIALIZING`、`WAITING_FOR_INDEXES`、`COMPACTING`、`WAITING_FOR_COMPACTION`、`WAITING_FOR_INDEX_REBUILD`、`REFRESHING_LOAD`、`CANCELLED`。

### OptimizeResp\{#optimizeresp}

**方法：**

- `String getStatus()`

    返回操作状态。

- `String getCollectionName()`

    返回经过优化的 Collection 名称。

- `Long getCompactionId()`

    返回 Compaction ID。

- `String getTargetSize()`

    返回目标 Segment 大小。

- `List<String> getProgress()`

    返回进度消息。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.OptimizeReq;
import io.milvus.v2.service.utility.OptimizeTask;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

OptimizeTask task = client.optimize(OptimizeReq.builder()
        .collectionName("my_collection")
        .targetSize("512MB")
        .build());
```
