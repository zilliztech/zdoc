---
title: "管理 Spark 批量任务 | Cloud"
slug: /manage-spark-batch-jobs
sidebar_label: "管理 Spark 批量任务"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Spark 批量任务异步执行，并在从提交到完成期间会经过多个不同的状态。本文将解释任务的生命周期，并展示如何查看任务列表、获取任务详情，以及取消一个处于可取消状态的任务。 | Cloud"
type: origin
token: VOt1wvC7jid1sOkWeFOct55Fn0e
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 管理 Spark 批量任务

Spark 批量任务异步执行，并在从提交到完成期间会经过多个不同的状态。本文将解释任务的生命周期，并展示如何查看任务列表、获取任务详情，以及取消一个处于可取消状态的任务。

## 了解任务状态\{#understand-job-states}

下图演示了任务在不同状态间流转的情况。

![RApdwsARuhIq3ZbDeVUccWppnKc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/RApdwsARuhIq3ZbDeVUccWppnKc.png)

通常情况下，任务状态会在抵达某个终结状态前从 `PENDING` 到 `PREPARING`，再到 `RUNNING`。

当任务处于 `PENDING`、`PREPARING` 或 `RUNNING` 时，您可以取消该任务，而当任务抵达某个终结状态，即 `SUCCEEDED`、`FAILED` 或 `TIMEOUT` 时，您无法取消该任务。重复取消一个正在取消过程中的任务会按幂等原则进行处理。

## 查看指定地域内的 Spark 批量任务\{#list-spark-batch-jobs-in-a-region}

你可以通过该任务查看各项目中相同地域的任务。请求中需要携带地域 ID 及 `type=spark` 参数。您也可以组合包括任务状态、任务名称前缀或任务创建时间等多种可选条件，进一步收窄返回的列表范围。

### 请求示例\{#request-syntax}

如下请求要求列出您可以访问的所有项目中位于 `aws-us-west-2` 地域的所有 Spark 批量任务。

```bash
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request GET \
  --url "https://api.cloud.zilliz.com/v2/jobs?type=SPARK&regionId=aws-us-west-2" \
  --header "Authorization: Bearer ${API_KEY}"
```

如需进一步收窄返回的结果，可以增加一个或多个可选过滤器。如果示例返回所有位于 `aws-us-west-2` 地域内、任务名称前缀为 `pk-dedup` 的所有正在运行的 Spark 批量任务。同时要求返回的响应中按 50 条每页进行分页返回。

```bash
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request GET \
  --url "https://api.cloud.zilliz.com/v2/jobs" \
  --get \
  --data-urlencode "type=SPARK" \
  --data-urlencode "regionId=aws-us-west-2" \
  --data-urlencode "state=RUNNING" \
  --data-urlencode "jobNamePrefix=pk-dedup" \
  --data-urlencode "pageSize=50" \
  --header "Authorization: Bearer ${API_KEY}"
```

### 过滤结果\{#filter-the-results}

下表列出了适用于任务列表请求的过滤器参数。

| 参数名称 | 是否必选 | 参数描述 |
| --- | --- | --- |
| `type` | 是 | 任务类型，请将该参数设置为 `SPARK`。 |
| `regionId` | 是 | 地域 ID。将返回该地域内所有 Spark 批量任务。 |
| `state` | 否 | 按诸如 `PENDING`、`RUNNING` 或 `SUCCEEDED` 等任务状态过滤任务。 |
| `jobNamePrefix` | 否 | 按任务名称前缀过滤任务。 |
| `createdAfter` | 否 | 按任务创建时间过滤任务。您可以指定一个具体的 ISO 8601 格式的时间戳，如 `2026-07-30T00:00:00Z`，将返回应该时间戳之后创建的任务。 |
| `createdBefore` | 否 | 按任务创建时间过滤任务。您可以指定一个具体的 ISO 8601 格式的时间戳，如 `2026-07-30T00:00:00Z`，将返回应该时间戳之前创建的任务。 |
| `pageSize` | 否 | 每页需要包括的最大任务数量。默认值为 `20`，取值范围为 `1` 到 `100`。 |
| `pageToken` | 否 | 返回结果如分多页，此参数值须为上一条请求响应中携带的 `nextPageToken` 参数的值。 |

在同一条请求中，您可以叠加多条可选过滤器。

### 结果分页\{#paginate-through-the-results}

如果响应中携带 `nextPageToken`，请将该值传递到下一条请求的 `pageToken` 参数，直至请求响应中不再携带 `nextPageToken` 或该属性为空。

```bash
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export NEXT_PAGE_TOKEN="token-returned-by-the-previous-request"

curl --request GET \
  --url "https://api.cloud.zilliz.com/v2/jobs" \
  --get \
  --data-urlencode "type=SPARK" \
  --data-urlencode "regionId=aws-us-west-2" \
  --data-urlencode "pageSize=20" \
  --data-urlencode "pageToken=${NEXT_PAGE_TOKEN}" \
  --header "Authorization: Bearer ${API_KEY}"
```

### 了解响应\{#understand-the-response}

成功响应会返回符合条件的任务数量，当前页的任务记录及获取下一页任务记录的令牌。

```json
{
  "code": 0,
  "data": {
    "total": 120,
    "items": [
      {
        "jobId": "job-xxx",
        "sparkInstanceId": "sp-xxx",
        "type": "SPARK",
        "jobName": "kmeans-demo",
        "status": "RUNNING",
        "regionId": "aws-us-west-2",
        "mainClass": "com.zilliz.cloud.spark.jobs.ClusteringApp",
        "resource": {
          "driverCores": 8,
          "driverMemory": "32g",
          "executorCores": 8,
          "executorMemory": "32g",
          "minExecutors": 1,
          "maxExecutors": 10
        },
        "createdAt": "2026-07-30T00:00:00Z",
        "startedAt": "2026-07-30T00:01:00Z",
        "finishedAt": null,
        "durationSeconds": 60
      }
    ],
    "nextPageToken": "opaque-token"
  }
}
```

响应包括如下主要属性：

- `total`：符合指定条件的任务数量。

- `items`：当前页需要返回的 Spark 批量任务详情。

- `nextPageToken`：用于获取下一页 Spark 批量任务的令牌。当没有更多任务时，响应中将不饮食该属性为空或该属性为空。

关于响应中的更多参数，请查看参考文档。

## 查看 Spark 批量任务详情\{#view-a-spark-batch-job-details-in-a-project}

您可以通过指定任务 ID 及该任务所属的项目 ID 来获取该 Spark 批量任务的详细信息。

### 请求示例\{#request-syntax}

```bash
export PROJECT_ID="proj-xxxxxxxxxxxxxxxxxxxxxxx"
export JOB_ID="job-xxxxxxxxxxxxxxxxxxxxxxx"
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request GET \
  --url "https://api.cloud.zilliz.com/v2/projects/${PROJECT_ID}/spark/jobs/${JOB_ID}" \
  --header "Authorization: Bearer ${API_KEY}"
```

### 了解响应\{#understand-the-response}

如下示例展示了一个失败的 K-Means 聚类任务的响应。

```json
{
  "code": 0,
  "data": {
    "jobId": "job-xxx",
    "sparkInstanceId": "sp-xxx",
    "type": "SPARK",
    "jobName": "kmeans-demo",
    "status": "FAILED",
    "regionId": "aws-us-west-2",
    "sparkApplicationName": "spark-batch-sp-xxx",
    "sparkNamespace": "spark-sp-xxx",
    "sparkHistoryUrl": "https://spark-history.example",
    "sparkApplicationId": "app-xxx",
    "sparkHistoryAppUrl": "https://spark-history.example/history/app-xxx/jobs",
    "driverLogUri": "https://spark-history.example/history/app-xxx/environment/",
    "failureReason": {
      "code": "FAILED",
      "message": "executor failed"
    },
    "outputContract": {
      "operator": "kmeans",
      "outputFormat": "parquet",
      "writeMode": "ERROR_IF_EXISTS",
      "preservesInputColumns": true,
      "generatedColumns": [
        "cluster_id"
      ]
    },
    "createdAt": "2026-07-30T00:00:00Z",
    "queuedAt": "2026-07-30T00:00:00Z",
    "submittedAt": "2026-07-30T00:00:30Z",
    "startedAt": "2026-07-30T00:01:00Z",
    "finishedAt": "2026-07-30T00:10:00Z",
    "endedAt": "2026-07-30T00:10:00Z",
    "durationSeconds": 540
  }
}
```

响应中包括：

- **任务状态和身份**：`jobId`、`jobName`、`status` 、`regionId` 及 Spark 任务的身份信息。

- **诊断信息**：`failureReason`、相关的Spark 历史操作链接及相关的驱动日志 URI。

- **时间线**：任务创建、排队、提交、执行及完成的时间戳。

对于一个失败的任务，先检查 `failureReason`，然后使用 Spark 操作历史或驱动日志进行深入分析。

### 了解 `outputContract`\{#understand-the-output-contract}

下表列出了 `outputContract` 属性中的各子属性。

| 子属性 | 描述 |
| --- | --- |
| `operator` | Spark 批量任务的运行器，包括 `kmeans`、`pk_deduplicate`、`vector_deduplicate` 或 `anomaly_detection`。 |
| `outputFormat` | 生成输出文件的实际格式。这通常和您在提交任务时指定的 `output.format` 保持一致。 |
| `writeMode` | 当指定的输出路径已经存在时执行的动作。 |
| `preservesInputColumns` | 输出文件是否保留输入文件中的原始字段。 |
| `generatedColumns` | 当前任务添加的列。比如，K-Means 聚类任务会在输出文件中添加 `cluster_id` 字段，异常点检测任务会在输出文件中添加 `outlier_score` 字段。 |

举个例子，当 K-Means 聚类任务的响应中 `preservesInputColumns` 为 `true` 且 `generatedColumes` 包含 `cluster_id`，意味着输出文件中包含所有输入的原始字段及一个表示记录簇分配信息的新字段。

## 取消 Spark 批量任务\{#cancel-a-spark-batch-job}

您可以在任务处于 `PENDING`、`PREPARING` 及 `RUNNING` 状态时，发起取消请求。

### 请求示例\{#request-syntax}

```bash
export PROJECT_ID="proj-xxxxxxxxxxxxxxxxxxxxxxx"
export JOB_ID="job-xxxxxxxxxxxxxxxxxxxxxxx"
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request POST \
  --url "https://api.cloud.zilliz.com/v2/projects/${PROJECT_ID}/spark/jobs/${JOB_ID}/cancel" \
  --header "Authorization: Bearer ${API_KEY}"
```

### 了解取消请求的行为\{#understand-the-cancel-request-behaviors}

取消行为取决于任务的当前状态。当任务处于任一非终结状态时可以取消。下表列出了任务状态及相应的取消行为。

| 任务当前状态 | 取消请求行为 |
| --- | --- |
| `PENDING`, `PREPARING`, `RUNNING` | 返回 `202 Accepted` 并开启取消进程。 |
| `CANCELLING` | 继续正在进行的取消进程。 |
| `CANCELED` | 返回当前任务。不会重新开启另一个取消任务。 |
| `SUCCEEDED`, `FAILED`, `TIMEOUT` | 拒绝取消请求，并返回一个状态错误。 |

