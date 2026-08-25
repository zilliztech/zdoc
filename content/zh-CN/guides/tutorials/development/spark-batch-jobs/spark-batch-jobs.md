---
title: "Spark 批量任务 | Cloud"
slug: /spark-batch-jobs
sidebar_label: "Spark 批量任务"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Spark 批量任务让你可以以分布式、离线的方式处理托管在 Zilliz Cloud 上的大规模数据集。具体来说，您可以创建批量任务，完成去重、聚类等任务，或分析您的向量数据。 | Cloud"
type: origin
token: KQT0wFr1TiDE72ksEUDcJ1B8nyc
sidebar_position: 13
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Spark 批量任务

Spark 批量任务让你可以以分布式、离线的方式处理托管在 Zilliz Cloud 上的大规模数据集。具体来说，您可以创建批量任务，完成去重、聚类等任务，或分析您的向量数据。

Spark 批量任务是用来处理长时间运行的数据处理任务，不建议在低时延在线请求或秒级变数据换场景使用。

## 你可能遇到的问题\{#problems-you-may-encounter}

随着向量数据规模的不断增长，简单的流式插入或向量搜索能力已经不能完全满足生产需要了。重复的数据导入任务可能也会引入重复数据，让数据规模庞大的 Collection 变得越来越难以理解，而数据预处理流水线也可能引入一些值得商榷的问题数据。

### 重复的向量数据\{#duplicate-vector-embeddings}

重试、重复导入、重叠数据源、甚至相同文字或图像的轻微改动都可能会引入重复创建的向量数据。在这些重复数据中，有些可能连主键都保持一致，而有些虽然主键不同，但内容可能完全一致。这些重复的数据会占用更多的存储空间、在索引过程中消耗更多的计算资源、并增加下流数据处理任务的成本。

Spark 批量任务可以识别并移除大规模数据集中的重复数据。您可以使用主键去重任务清理那些主键一致的重复数据，也可以使用向量近似去重任务来识别主键不同但内容一致的重复数据。

### 向量分布不明确\{#unclear-embedding-distributions}

随着 Collection 规模日益庞大，整体的向量分布变得越来越难以理解。您可能无法知道数据集占主导地位的是哪些数据、长尾数据又是哪些，或者新近导入的数据和既有数据是否明显不同。

在这种情况下，您可以考虑使用 K-Means 聚类任务将相似的向量数据聚集到相应的簇里，并为每个簇分配一个独一无二的 ID。然后，您就可以根据这些簇来分析数据分布、比较数据源、创建有代表性的样本、并将相似数据的处理切分成更小的任务单元。

### 向量数据中隐藏的异常数据\{#hidden-anomalies-in-embedding-data}

向量数据处理流水线可能会因某些异常导致部分数据看上去没有问题，但实际上与数据集中的其它数据不太一样的数据记录。这些失败的预处理、嵌入模型的选择错误、数据解析过程中的噪声、数据源损坏或者错误的数据批次都可能会导致数据集中引入难以通过手工排查发现的异常数据。

这时，您可以使用异常点检测任务来扫描数据集，识别与其它数据迥异的异常数据。任务结果可以用来识别那些需要再次调用嵌入模型编码、清理或进一步审查的数据。需要注意的是，一个异常数据并不一定是非法数据。您需要对哪些标记为异常数据的记录进行进一步分析，而不是一删了之。

## 选择任务类型\{#choose-a-job-type}

根据您的目标，在下表中选择不同的 Spark 批量任务。

| **目标** | **推荐任务** |
| --- | --- |
| 移除主键相同的重复记录。 | [主键去重](./primary-key-dedup) |
| 找到数据集中向量表示高度相似的记录。 | [向量近似去重](./vector-similarity-dedup) |
| 将向量数据分成指定数量的组。 | [K-Means 聚类](./k-means-clustering) |
| 找出向量数据中与其它记录迥异的记录。 | [异常点检测](./anomaly-detection) |

## Spark 批量任务的工作流程\{#how-spark-batch-jobs-work}

一个 Spark 批量任务是一个长时间运行的分布式、离线任务。在任务创建时会立即返回一个任务 ID，供您监测任务进度并管理任务生命周期。

### 开始前准备\{#before-you-start}

在创建 Spark 批量任务前，请确保：

- 您有一个拥有相关权限的 Zilliz Cloud API 密钥。

- 您的输入数据已上传 Zilliz Cloud External Volume 且数据格式受支持。

    - 受支持的数据格式包括`parquet`、`lance`、`json` 和  `csv`。

- 与存放数据的 External Volume 关联的角色需要有执行任务所需的所有权限：

    - 对于存放输入数据的 External Volume 需要有访问指定输入路径的只读权限。

    - 对于存放输出数据的 External volume 需要有访问指定输出路径的读写权限，包括删除在任务执行过程中产生的临时或不完整数据的权限。

    - 存放输入数据和输出数据的 External Volumes 可以使用不同的角色。

### 配置 External Volume 权限\{#external-volume}

Spark 批量任务从 External Volume 中读取输入数据，并向目标 External Volume 中写入处理完成的数据。在提交任务前，请确认相关 Volume 绑定的角色拥有相应的权限。

存放输入数据和输出数据的 External Volumes 可以使用不同的角色。建议为这些角色仅绑定访问存储桶和相应路径的必要的权限。

#### 输入 Volume\{#volume}

输入 Volume 需要对输入数据的只读权限。如果您在创建 Volume 集成时已经提供了相应的权限，则无须关注。

对于阿里云 OSS，角色需要绑定的权限包括：

- 获取输入路径下的指定对象所需的 `oss:GetObject`。

- 列出输入路径下所有对象所需的 `oss:ListObjects`。

- 获取对象存储桶路径所需的 `oss:GetBucketLocation`。

<details>

<summary>单击此处了解具体配置</summary>

```json
{
    "Version": "1",
    "Statement": [
        {
            "Sid": "ReadInput",
            "Effect": "Allow",
            "Action": [
                "oss:GetObject",
                "oss:ListObjects",
                "oss:GetBucketLocation"
            ],
            "Resource": [
                "acs:oss:*:*:<bucket>",
                "acs:oss:*:*:<bucket>/*"
            ]
        }
    ]
}
```

</details>

#### 输出 Volume\{#volume}

输出 Volume 需要拥有读写权限，以便向输出 Volume 中写入任务结果。Spark 也需要拥有删除临时对象或在任务失败或取消前产生的任务对象的权限。

对于阿里云 OSS，角色需要的权限包括：

- 访问输出路径所需要的 `oss:GetObject`、`oss:GetBucketLocation` 和 `oss:ListObjects` 权限。

- 写入任务结果的 `oss:PutObject` 权限。

- 清理临时或不完整输出对象的 `oss:DeleteObject` 权限。

建议为 `oss:PutObject` 和 `oss:DeleteObject` 权限指定输出路径前缀，不要针对整个存储桶授权。

 <details>

<summary>单击此处了解具体配置</summary>

```json
{
    "Version": "1",
    "Statement": [
        {
            "Sid": "ReadOutput",
            "Effect": "Allow",
            "Action": [
                "oss:GetObject",
                "oss:GetBucketLocation",
                "oss:ListObjects"
            ],
            "Resource": [
                "acs:oss:*:*:<bucket>",
                "acs:oss:*:*:<bucket>/*"
            ]
        },
        {
            "Sid": "ReadWriteDeleteOutput",
            "Effect": "Allow",
            "Action": [
                "oss:PutObject",
                "oss:DeleteObject"
            ],
            "Resource": "acs:oss:*:*:<bucket>/<output-prefix>/*"
        }
    ]
}
```

</details>

### 提交和运行 Spark 批量任务\{#submit-and-run-a-spark-batch-job}

在您获取 Zilliz Cloud API 密钥并将所需数据文件上传到 Zilliz Cloud Volume 中后，您就可以提交和运行 Spark 批量任务了。

<Procedures>

1. 生成幂等 Key。

    幂等 Key 用来识别针对同一任务的请求。更多详情，请参考[幂等提交](./spark-batch-jobs#idempotent-submission)。

1. 准备请求头。

    在创建 Spark 批量任务时，将上一步生成的幂等 Key 纳入请求头中。

    ```json
    Authorization: Bearer <api-key>
    Idempotency-Key: spark-job-20260730-001
    Content-Type: application/json
    ```

1. 准备请求负载。

    所有的 Spark 批量任务的请求负载格式基本相同，每个任务也有一些仅用于各自任务所需的参数。

    对于通用负载结构，请参阅[请求负载](./spark-batch-jobs#request-payload)一节。对于各自任务独有的参数，可以参考如下章节：

    - [主键去重](./primary-key-dedup)

    - [向量近似去重](./vector-similarity-dedup)

    - [K-Means 聚类](./k-means-clustering)

    - [异常点检测](./anomaly-detection)

</Procedures>

#### 幂等提交\{#idempotent-submission}

在创建任务时，务必使用幂等 Key。Zilliz Cloud 会在收到任务请求时检查该幂等 Key 和请求负载，并根据检查情况返回该幂等 Key 对应的任务或拒绝该请求。下面总结了匹配规则。

| 情形 | 行为 |
| --- | --- |
| 相同的幂等 Key，相同的请求负载 | 返回该幂等 Key 对应的任务，不会重复创建。 |
| 相同的幂等 Key，不同的请求负载 | 返回一个冲突错误。 |

幂等 Key 在指定的组织、用户、地域范围内生效。幂等 Key 的最长保存时间为 25 小时，并根据任务的超时窗口动态调整。在保存窗口过期后，您可以使用相同的幂等 Key 来提交新的任务。

#### 请求负载\{#request-payload}

所有的 Spark 批量任务共用如下负载结构。

```json
{
  "jobName": "my-spark-job",
  "description": "optional description",
  "projectId": "proj-xxx",
  "regionId": "aws-us-west-2",
  "input": {...},
  "output": {...},
  "clusterSize": "SMALL",
  "minExecutors": 1,
  "maxExecutors": 10,
  "timeoutSeconds": 3600
}
```

如下表格列出了这些参数的描述信息：

| 参数名称 | 是否必填 | 参数描述 |
| --- | --- | --- |
| `jobName` | 是 | 待创建任务的名称。 |
| `description` | 否 | 可选任务描述信息。 |
| `projectId` | 是 | 待创建任务所属的项目 ID。参数值格式为 `proj-xxxxxxxxxxxxx`。 |
| `regionId` | 是 | 待创建任务所属的地域 ID。关于支持 Spark 批量任务的地域，请参考 [云服务提供商和地域](./cloud-providers-and-regions)。 |
| `input` | 否 | 待创建任务的输入。内置任务必选。具体任务见下表。 |
| `output` | 否 | 待创建任务的输出。内置任务必选。具体任务见下表。 |
| `clusterSize` | 否 | 需要使用的 Spark 集群的大小。可选值包括 `SMALL`、`MEDIUM`、`LARGE`, `XLARGE`、`2XLARGE` 及 `3XLARGE`。 |
| `timeoutSeconds` | 否 | 待创建任务的超时时间，单位为秒。取值范围为 `300` - `86400`. |

上表中，`input` 和 `output` 参数包含的参数大致相同。具体内容见下表：

<table>
   <tr>
     <th><p>参数名称</p></th>
     <th><p>是否必填</p></th>
     <th><p>参数描述</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>是</p></td>
     <td><p>待创建任务的类型。该参数适用于 <code>input</code> 和 <code>output</code>。可能的值有：</p><ul><li><code>volume</code></li></ul></td>
   </tr>
   <tr>
     <td><p><code>volumeId</code></p></td>
     <td><p>否</p></td>
     <td><p>已经集成到 Zilliz Cloud 上的 Volume ID。当 <code>type</code> 为 <code>volume</code> 时必填。该参数适用于 <code>input</code> 和 <code>output</code>。</p></td>
   </tr>
   <tr>
     <td><p><code>path</code></p></td>
     <td><p>否</p></td>
     <td><p>相对于指定 Volume 根的输入、输出路径。当 <code>type</code> 为 <code>volume</code> 时必填。该参数适用于 <code>input</code> 和 <code>output</code>。</p><p>对于 Volume 路径为 <code>volume://path/to/data.parquet</code> 的文件，请将 <code>path</code> 设置为 <code>path/to/data.parquet</code>。</p></td>
   </tr>
   <tr>
     <td><p><code>format</code></p></td>
     <td><p>否</p></td>
     <td><p><code>input</code> 和 <code>output</code> 文件的格式。该参数适用于 <code>input</code> 和 <code>output</code>。该参数默认值为 <code>parquet</code>。支持的格式包括<code>parquet</code>、<code>lance</code>、<code>json</code> 和  <code>csv</code></p></td>
   </tr>
   <tr>
     <td><p><code>writeMode</code></p></td>
     <td><p>否</p></td>
     <td><p>输出文件的写入方式。该参考仅适用于 <code>output</code>。可能的取值为：</p><ul><li><p><code>ERROR_IF_EXIST</code></p><p>此选项在输出文件存在时报错。此为默认选项。</p></li><li><p><code>OVERWRITE</code></p><p>此选项在输出时默认覆盖输出文件。</p></li></ul></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

对于 `input` 参数，`format` 决定使用哪种 Spark 数据源阅读器。如果您未指定该参数，任务默认使用 Parquet 阅读器，并仅处理指定路径下的 Parquet 文件。此时，其它格式的文件，如 JSON 或 CSV，会被忽略。

如果您希望处理的文件并非 Parquet 格式，请明确指定 `input.format` 为相应格式。任务不会自动检测文件格式，也不会混合处理不同格式的文件。

</Admonition>

#### 返回响应\{#submission-response}

成功的任务响应会因任务不同而返回不同的 HTTP 代码。下表列出了响应中可能携带的 HTTP 代码及其描述。

| 情形 | HTTP 代码 | 描述 |
| --- | --- | --- |
| 创建任务 | `201 CREATED` | 表示当前任务正在创建。<br/>创建任务为异步操作，您可以使用响应中携带的任务 ID 来查看任务进度，并管理其生命同期。 |
| 取消任务 | `202 ACCEPTED` | 表示取消请求已被接受并开始处理。<br/>取消任务为异步操作，您可以使用响应中携带的任务 ID 来查看任务进度。 |
| 查看任务详情 | `200 OK` | 表示请求的响应已返回。<br/>该操作为同步操作，响应通常携带任务在请求时的状态。 |

虽然 HTTP 代码不同，但响应负载的格式基本相同。

```json
{
  "code": 0,
  "data": {
    "jobId": "job-xxx",
    "sparkInstanceId": "sp-xxx",
    "type": "SPARK",
    "jobName": "kmeans-demo",
    "status": "PENDING",
    "regionId": "aws-us-west-2",
    "createdAt": "2026-07-30T00:00:00Z"
  }
}
```

响应通常会携带一个任务 ID，用于监控任务执行情况。需要了解任务状态、获取任务详情、取消任务，可以查看[了解任务状态](./manage-spark-batch-jobs#understand-job-states)。

当发生错误时，您会看到如下响应：

```json
{
  "code": 10001,
  "message": "projectId is required",
  "details": {
    "errorCode": "INVALID_PARAMETER"
  }
}
```

此时，您可以根据响应中的 `details.errorCode` 和响应头中携带的 HTTP 代码来初步判断任务执行过程中出现的问题。下表列出了错误响应中常见的 HTTP 代码及其描述信息。

| HTTP 代码 | 描述 |
| --- | --- |
| `400 BAD REQUEST` | 表示请求负载中的参数配置有误。 |
| `403 FORBIDDEN` | 表示请求头中携带的 API 密钥权限不足或指定项目中没有相应的资源。 |
| `404 NOT FOUND` | 表示指定的资源，如任务 ID、Zilliz Cloud Volume 等，不存在。 |
| `409 CONFLICT` | 表示指定的幂等 Key 和请求负载不匹配。 |
| `500 INTERNAL SERVER ERROR` | 表示服务器处理请求失败。 |

## 更多内容\{#next-steps}

请使用如下指南，指导您创建符合您业务需求的 Spark 批量任务，并监控任务进度、管理任务生命周期。



import DocCardList from '@theme/DocCardList';

<DocCardList />