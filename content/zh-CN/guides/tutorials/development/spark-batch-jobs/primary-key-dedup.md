---
title: "主键去重 | Cloud"
slug: /primary-key-dedup
sidebar_label: "主键去重"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "主键去重任务识别大规模数据集中主键相同的记录，并移除冗余的数据。当因重复导入、数据预处理流水线重试、数据迁移或数据源重叠等原因导致数据集中存在重复数据时，可以使用该任务进行主键去重。 | Cloud"
type: origin
token: PLmWwXhMyiUErvkeRtAcL9kJnib
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 主键去重

主键去重任务识别大规模数据集中主键相同的记录，并移除冗余的数据。当因重复导入、数据预处理流水线重试、数据迁移或数据源重叠等原因导致数据集中存在重复数据时，可以使用该任务进行主键去重。

## 概述\{#overview}

主键去重任务会将主键相同的记录放在一个重复记录组中，并在每个组中选择一条记录予以保留，并删除其他记录。默认情况下，任务会根据一个内部标记决定保留哪条记录，所以无法根据用户侧字段值预测保留哪条记录。当重复记录中部分字段值不同的情况，可以考虑使用 `keepBy` 来定义记录保留策略。

### 识别重复项\{#how-duplicates-are-identified}

当创建任务时，请将完成清理后在目标 Collection 中充当主键的字段设为主键。任务会将在该字段值相同的记录放入同一个重复记录组。

主键去重仅识别主键字段值完全相同的重复项。主键不同，即使其它标量字段或向量字段的值完全一致或高度相似，也不会被认为是重复项。

### 选择记录保留策略\{#which-record-is-retained}

默认情况下，任务会根据一个内部标记决定保留哪条记录。所以，仅在所有重复项包含相同的字段值时，考虑使用默认策略。

如果重复记录的各字段的值可能不同，请使用 `keepBy` 来定义一个记录保留策略。请将 `keepBy` 设置成 `<field-name>:<strategy>`。例如，`timestamp:max` 会保留重复记录中 `timestamp` 字段值最大的那条记录。

```plaintext
| primary key | timestamp  | content         | vector       |
|-------------|------------|-----------------|--------------|
| doc-1       | 1710000000 | Earlier version | [0.12, 0.35] | <!-- 根据 timestamp:max 策略删除-->
| doc-1       | 1720000000 | Latest version  | [0.18, 0.41] | <!-- 根据 timestamp:max 策略保留-->
| doc-2       | 1715000000 | Another record  | [0.27, 0.53] | <!-- 保留-->
```

在上述示例中，前两条记录被认为是重复记录，因为它们的主键完全相同。但是这两条记录在 `timestamp`、`content` 和 `vector` 字段上的值并不相同。如果没有设置 `keepBy` 策略，任务会根据一个内部标记来确定予以保留的记录，但是我们无法根据用户侧的字段值预测保留的是哪一条。因此，在这种情况下，建议设置 `keepBy` 为 `timestamp:max`，来保留 `timestamp` 字段值最大的第二条记录。

值得注意的是，任务会保留选中的那条记录的所有字段值，不会合并不同重复记录的字段值。

### 任务结果\{#what-the-job-produces}

任务输出一个去重的数据集，每个主键值仅有一条记录。此时，您可以将去重完成的数据导入一个 Collection 中，并使用去重时指定的主键字段作为 Collection 的主键。

## 开始前准备\{#before-you-start}

在创建主键去重任务前，请确保：

- 所有输入文件使用兼容的数据结构，并匹配目标 Collection 的 Schema。

- 被指定为主键的字段在所有输入文件中均存在，且该字段的格式为字符串或整型。

- 如果重复项包含不同的字段值，考虑设置合适的 `keepBy` 字段和策略。

关于 Spark 批量任务的通用要求，包括鉴权、输入文件和输出行为，查看[Spark 批量任务](./spark-batch-jobs)。

## 创建主键去重任务\{#create-a-primary-key-deduplication-job}

创建主键去重任务，需要指定 Zilliz Cloud Volume 中的输入路径和输出路径，充当主键的字段名以及一个可选的 `keepBy` 策略。任务异步运行，返回一个任务 ID，可用于监控任务进展。

<Procedures>

1. 准备一个幂等 Key。

    幂等 Key 是一个用于判断当前请求的资源是否已经在运行的字符串。如果请求的资源已经在运行，则返回该资源。关于幂等 Key 的更多详情，可以参考[幂等提交](./spark-batch-jobs#idempotent-submission)。

1. 准备请求负载。

    ```bash
    export payload='{
      "jobName": "pk-dedup-demo",
      "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
      "regionId": "aws-us-west-2",
      "input": {
        "type": "volume",
        "volumeId": "volume-xxxxxxxxxxxxxxxx",
        "path": "input/raw.parquet",
        "format": "parquet"
      },
      "output": {
        "type": "volume",
        "volumeId": "volume-xxxxxxxxxxxxxxxx",
        "path": "output/pk-dedup.parquet",
        "format": "parquet"
      },
      "primaryKeyField": "id",
      "keepBy": "timestamp:max",
      "clusterSize": "SMALL"
    }'
    ```

    下表列出了主键去重任务独有的几个参数。

    | 参数名称 | 是否必选 | 参数描述 |
    | --- | --- | --- |
    | `primaryKeyField` | 是 | 用于在数据完成清理后导入的目标 Collection 中充当主键的标量字段。<br/>Zilliz Cloud Collection  要求主键字段的数据类型为字符串（VarChar）或整数（Int64）。 |
    | `keepBy` | 否 | 记录保留策略，用于决定重复记录组中保留的记录。<br/>该值的格式为 `<field-name>:<strategy>`。比如，`timestamp:max`。 |

    当前支持的策略包括：

    - `max`：保留指定字段中值最大的那条记录。

    - `min`：保留指定字段中值最小的那条记录。

    当未设置 `keepBy` 策略时，任务会根据内部机制选择一条记录予以保留。当重复组中的记录在某些字段上的值不一致时，或您需要一个可以预期的保留策略时，可以考虑使用 `keepBy`。

    关于 Spark 批量任务通用的其它参数，请参考[请求负载](./spark-batch-jobs#request-payload)。

1. 提交任务。

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/jobs/dedup/pk" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "Idempotency-Key: spark-job-20260730-001" \
        --header "Content-Type: application/json" \
        --data "${payload}"
    ```

    上述请求为异步请求，在提交后会立即返回。返回的响应中会携带一个任务 ID，用于监控任务的进度。一个成功的响应如下所示：

    ```json
    {
      "code": 0,
      "data": {
        "jobId": "job-xxxxxxxxxxxxx",
        "sparkInstanceId": "sp-xxxxxxxxxxxxxxxx",
        "type": "SPARK",
        "jobName": "pk-dedup-demo",
        "status": "PENDING",
        "regionId": "aws-us-west-2",
        "createdAt": "2026-07-30T00:00:00Z"
      }
    }
    ```

    关于提交后任务的状态流转及响应各字段的含义，可以参考[返回响应](./spark-batch-jobs#submission-response)。

</Procedures>

## 监控任务\{#monitor-the-job}

在提交请求后，使用返回的任务 ID 监控任务直到其抵达某个终结状态。您可以查看任务的当前状态及详细信息，列出当前已经创建的任务，或在任务尚可取消时取消某个任务。

当任务成功后，验证请求中指定的输出路径下是否按预期出现了输出文件。

关于相关监控任务的请求、任务状态及状态流转的详细情况，可以参考[管理 Spark 批量任务](./manage-spark-batch-jobs)。

## 验证输出\{#verify-the-output}

在任务成功后，请进行如下验证：

- 输出文件已经存入请求中指定的输出路径。

- 每个主键值只出现一次。

- 如果指定了 `keepBy` 策略，保留的记录符合预期。

您还可以比较输入和输出文件的记录数来进一步确认去除的重复项数量是否合理。

## 后续操作\{#next-step}

主键去重删除那些主键重复的记录，但是您可以根据数据的实际情况进行进一步的清理。您可以使用[向量近似去重](./vector-similarity-dedup)任务来识别数据中内容高度相似但主键不同的记录。对于模型训练及大数据分析场景，您还可以使用[K-Means 聚类](./k-means-clustering)任务来了解数据集中的向量分布，使用[异常点检测](./anomaly-detection)任务来找出需要进一步处理的异常数据记录。

