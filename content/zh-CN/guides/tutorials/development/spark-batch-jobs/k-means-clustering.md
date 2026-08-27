---
title: "K-Means 聚类 | Cloud"
slug: /k-means-clustering
sidebar_label: "K-Means 聚类"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "K-Means 聚类会将嵌入特征相似的记录归入指定数量的聚类中。可通过该任务探索向量数据的分布情况，将记录整理为粗略的语义分组，或是为采样、分析及其他下游工作流准备数据集。 | Cloud"
type: origin
token: VIyWwOfUFiQaNkkdsqVca9Gqnve
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# K-Means 聚类

K-Means 聚类会将嵌入特征相似的记录归入指定数量的聚类中。可通过该任务探索向量数据的分布情况，将记录整理为粗略的语义分组，或是为采样、分析及其他下游工作流准备数据集。

该任务会保留所有输入记录，并为每条记录新增一个 `cluster_id` 字段，用于标识每条记录所属的记录簇。

## 概述\{#overview}

下图展示了 K-Means 聚类如何组织向量数据。任务会读取指定向量字段的数据，把每条记录分配到指定数量的簇中的一个簇中，并为该记录添加一个额外的名为 `cluster_id` 的标量字段。

`cluster_id` 值相同的记录属于同一个簇。任务当前不提供簇中心点信息。

![TDWow3ct8hJerDbWhFMcky61n7d](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/TDWow3ct8hJerDbWhFMcky61n7d.png)

### 选择簇数量\{#choose-the-number-of-clusters}

将 `numClusters` 设置为您希望任务创建的簇的数量。值越小，每个簇涵盖的特征越多；值越大，每个簇的粒度越细。

### 选择相似度类型\{#choose-a-distance-metric}

相似度类型决定如何将向量纳入不同的簇中。

| **相似度类型** | **如何解读相似度** | **何时使用** |
| --- | --- | --- |
| `l2` | 相似度值越小，向量越相似。 | 请根据嵌入模型使用的相似度类型和当前工作流使用 Euclidean 距离（L2）。 |
| `cosine` | 相似度值越大，向量越相似。 | 如果向量的方向比距离更重要，就使用余弦距离（Cosine）。 |

## 了解输出\{#understand-the-output}

输出数据保留所有输入数据列，并额外添加一个名为 `cluster_id` 的字段。

| 字段 | **描述** |
| --- | --- |
| `cluster_id` | 当前数据记录被分配到的簇 ID。拥有相同 `cluster_id` 的记录属于同一个 K-Means 簇。 |

任务会将每个合法的输入向量分配到某个簇中。针对同一批输入数据，每次调用聚类任务的最终的分配结果可能不完全相同，簇 ID 只代表当前请求的分组情况。

## 开始前准备\{#before-you-start}

在创建 K-Means 聚类任务前，请确保：

- 所有输入文件都拥有互相兼容的数据结构，且都包含一个可用于聚类的向量字段。

- 该字段中的向量数据类型和维度相同，且均由相同的嵌入模型和数据预处理方法生成。

关于 Spark 批量任务的通用要求，包括鉴权、输入文件和输出行为，查看[Spark 批量任务](./spark-batch-jobs)。

## 创建 K-Means 聚类任务\{#create-a-k-means-clustering-job}

创建 K-Means 聚类任务需要指定输入和输出路径、用于聚类的向量字段、相似度类型以及期望的簇数量。任务异步运行，返回一个任务 ID，可用于监控任务进展。在任务成功完成后，您可以在请求中指定的输出路径中查看处理过的数据。

<Procedures>

1. 准备一个幂等 Key。

    幂等 Key 是一个用于判断当前请求的资源是否已经在运行的字符串。如果请求的资源已经在运行，则返回该资源。关于幂等 Key 的更多详情，可以参考[幂等提交](./spark-batch-jobs#idempotent-submission)。

1. 准备请求负载。

    ```bash
    export payload='{
      "jobName": "kmeans-demo",
      "projectId": "proj-xxx",
      "regionId": "aws-us-west-2",
      "input": {
        "type": "volume",
        "volumeId": "volume-xxx",
        "path": "input/raw.parquet",
        "format": "parquet"
      },
      "output": {
        "type": "volume",
        "volumeId": "volume-xxx",
        "path": "output/kmeans.parquet",
        "format": "parquet"
      },
      "primaryKeyField": "id",
      "vectorField": "embedding",
      "metric": "cosine",
      "numClusters": 100,
      "clusterSize": "SMALL"
    }'
    ```

    下表列出了主键去重任务独有的几个参数。

    | 参数名称 | 是否必选 | 参数描述 |
    | --- | --- | --- |
    | `primaryKeyField` | 否 | 用于在数据完成清理后导入的目标 Collection 中充当主键的标量字段。<br/>Zilliz Cloud Collection  要求主键字段的数据类型为字符串（VarChar）或整数（Int64）。 |
    | `vectorField` | 是 | 用于进行向量相似度比较的向量字段。支持的字段值类型为 `array<float>`、数值数组、Spark 向量以及用逗号分隔的字符串。 |
    | `metric` | 是 | 用于向量相似度比较的相似度类型。可能的取值为 `cosine` 和 `l2`。 |
    | `numClusters` | 是 | 期望任务创建的簇的数量。参数值为正整数。 |

    关于 Spark 批量任务通用的其它参数，请参考[请求负载](./spark-batch-jobs#request-payload)。

1. 提交任务。

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/jobs/kmeans" \
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
        "jobName": "kmeans-demo",
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

- 输入数据的所有记录和字段都已保留。

- 每条记录都包含一个新增的 `cluster_id` 字段。

- 唯一簇 ID 的数量不超过 `numClusters`。

- 对同簇记录进行采样确认聚类结构与您的预期相符。

## 后续操作\{#next-step}

您可以使用生成的 `cluster_id` 字段来分析嵌入分布、对不同语义分组的数据记录进行采样或将聚类结构作为下游流程的输入。您还可以使用[向量近似去重](./vector-similarity-dedup)任务识别数据中语义冗余的数据记录，使用[异常点检测](./anomaly-detection)来识别数据记录中与其它记录迥异的数据。