---
title: "异常点检测 | Cloud"
slug: /anomaly-detection
sidebar_label: "异常点检测"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "异常点检测能够识别输入的数据记录中与其它记录迥异的数据。您可以使用该类任务找出数据记录中代表数据质量问题、罕见异常、数据处理错误或者需要进一步采样分析的异常数据。 | Cloud"
type: origin
token: RDfLw6XYHiELxGkr2pucgQ1Snyh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 异常点检测

异常点检测能够识别输入的数据记录中与其它记录迥异的数据。您可以使用该类任务找出数据记录中代表数据质量问题、罕见异常、数据处理错误或者需要进一步采样分析的异常数据。

## 概述\{#overview}

下图展示了异常点检测任务如何使用孤立森林（Isolation Forest）算法为向量数据记录打分并返回得分最高的记录或带异常得分的全部输入数据。

![LJDVw3PkTh30CZb1kHncscNVnGb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/LJDVw3PkTh30CZb1kHncscNVnGb.png)

### 识别异常\{#how-anomalies-are-identified}

如上图所示，任务使用孤立森林算法识别异常记录。为了构建森林中的每棵树，任务多次随机选择一个向量维度及切分值，渐进式地将数据记录分割进不同的小分组里。远离稠密区域的零散记录仅需有限次数的分割就可以到达叶子结点，而位于稠密区域的记录则需要更长的路径才能到达叶子结点。借助这种行为，任务可以将仅需少数几步几可以方便分割的数据记录和那些需要更长路径才能分割出来的数据记录区分开来。

### 了解异常得分\{#understand-the-anomaly-score}

对于每条数据记录而言，任务会计算该条记录在所有树上的平均路径长度，并将其转换成异常得分，存入 `outlier_score` 字段中。平均路径越短、异常得分越高，而平均路径越长、异常得分越低。某条记录的异常得分高意味着该记录和同数据集中的其他记录的相关性越小。但是这并不意味着该记录是错误的或应该被删除。

您仍需要进一步检查高分记录来判断它们代表的到底是数据质量问题，还是罕见但合法的情况，抑或者是符合预期的差异。

### 设置返回记录数量\{#choose-how-many-records-to-return}

您可以通过设置 `topK` 来要求任务仅返回得分最高的若干条记录。例如，将 `topK` 设置成 `100`，任务将返回 100 条异常得分高的数据记录。如果您未设置 `topK`，任务将返回所有输入的数据记录，并为它们添加一个记录了各自异常点得分的字段。

### 选择是否保留向量字段\{#choose-whether-to-retain-the-vector-field}

您可以使用 `outputWithFeatures` 来控制是否在输出文件中包含分析过的向量字段。该参数默认为 `true`。当您将其设置为 `false` 时，输出文件中将不包含向量字段。在此情况下，建议您设置 `primaryKeyField` 以便输出文件中的记录仍能溯源到原记录。

## 开始前准备\{#before-you-start}

在创建异常点检测任务前，请确保：

- 所有输入文件都拥有互相兼容的数据结构，且都包含一个可用于检测的向量字段。

- 该字段中的向量数据类型和维度相同，且均由相同的嵌入模型和数据预处理方法生成。

关于 Spark 批量任务的通用要求，包括鉴权、输入文件和输出行为，查看[Spark 批量任务](./spark-batch-jobs)。

当 `outputWithFeatures` 设置为 `false`，可以考虑设置 `primaryKeyField` 以便输出文件中的记录仍能溯源到原记录。

关于 Spark 批量任务的通用要求，包括鉴权、输入文件和输出行为，查看[Spark 批量任务](./spark-batch-jobs)。

## 创建异常点检测任务\{#create-an-anomaly-detection-job}

创建异常点检测任务需要指定输入和输出路径、用于检测的向量字段、需要返回的记录数量以及输出数据中是否包含向量数据。任务异步运行，返回一个任务 ID，可用于监控任务进展。在任务成功完成后，您可以在请求中指定的输出路径中查看处理过的数据。

<Procedures>

1. 准备一个幂等 Key。

    幂等 Key 是一个用于判断当前请求的资源是否已经在运行的字符串。如果请求的资源已经在运行，则返回该资源。关于幂等 Key 的更多详情，可以参考[幂等提交](./spark-batch-jobs#idempotent-submission)。

1. 准备请求负载。

    ```bash
    export payload='{
      "jobName": "anomaly-detection-demo",
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
        "path": "output/anomaly.parquet",
        "format": "parquet"
      },
      "primaryKeyField": "id",
      "vectorField": "embedding",
      "topK": 100,
      "outputWithFeatures": false,
      "clusterSize": "SMALL",
      "minExecutors": 1,
      "maxExecutors": 10
    }'
    ```

    下表列出了主键去重任务独有的几个参数。

    | 参数名称 | 是否必选 | 参数描述 |
    | --- | --- | --- |
    | `primaryKeyField` | 否 | 用于在输出数据中定位输入数据记录的字段。建议在 `outputWithFeatures` 设置为 `false` 时设置。 |
    | `vectorField` | 是 | 用于异常检测的向量字段。支持的字段值类型为 `array<float>`、数值数组、Spark 向量以及用逗号分隔的字符串。 |
    | `topK` | 否 | 用于指定需要返回的异常数据记录的数量，按 `outlier_score` 的值从大到小排序。该值应为正整数。如果未指定，任务将返回所有记录。 |
    | `outputWithFeatures` | 否 | 用于指定是否需要在输出数据中包含向量字段。默认值为 `true`。当设置为 `false` 时，输出数据不包含向量字段。 |

    关于 Spark 批量任务通用的其它参数，请参考[请求负载](./spark-batch-jobs#request-payload)。

1. 提交任务。

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/jobs/anomaly-detection" \
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
        "jobName": "anomaly-detection-demo",
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

## 了解并验证输出\{#understand-and-validate-the-output}

异常点检测任务的输出根据您是否指定 `topK` 来判断，是包含指定数量的异常点记录，还是输出所有输入记录。每条输出记录均带有一个 `outlier_score`。

| **字段名称** | **字段描述** |
| --- | --- |
| `outlier_score` | 为每条输出数据记录分配的异常点得分。分值越高，该记录与同数据集中的其它记录差异越大。 |

输出结果还受如下设置影响：

- 在指定了 `topK` 时，输出包含指定数量的高分异常点记录。

- 在未指定 `topK` 时，输出包含所有输入记录。

- 在指定 `outputWithFeatures` 为 `true` 时，输出包含向量数据。

- 在指定 `outputWithFeatures` 为 `false` 时，输出不包含向量数据。

在任务成功后，请进行如下验证：

- 输出文件已经存入请求中指定的输出路径。

- 每条记录都包含一个新增的 `outlier_score` 字段。

- 如果请求中指定了 `topK`，检查输出中是否包含了指定数量的记录。

- 如果请求中省略了 `topK`，检查输出中是否包含了所有合法的输入记录。

- 输出文件中包含向量数据的情况与请求中 `outputWithFeature` 参数的设置相符？

- 可以对返回的高分记录进行采样分析，判断它们代表的到底是数据质量问题，还是罕见但合法的情况，抑或者是符合预期的差异。

## 后续操作\{#next-step}

查看得分最高的记录，判断它们属于数据质量问题、罕见但合法的案例，还是需要进一步处理的记录。根据结果，你可以修正或移除无效数据、保留有价值的边缘案例，或将选定的记录转交人工审核。

如需探究向量数据的整体结构，请使用[K-Means 聚类](./k-means-clustering)任务；如需识别语义冗余的记录，请使用[向量近似去重](./vector-similarity-dedup)任务。