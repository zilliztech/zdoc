---
title: "向量近似去重 | Cloud"
slug: /vector-similarity-dedup
sidebar_label: "向量近似去重"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "向量近似去重识别数据集中高度近似的向量数据，并将它们组织成一个语义重复组。您可以使用向量近似去重任务来减少诸如重述文本、稍作修改的图片或者多个版本的相似内容等冗余数据。 | Cloud"
type: origin
token: XWOtw0B8zimLDAkc1AQcwIL0n7R
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 向量近似去重

向量近似去重识别数据集中高度近似的向量数据，并将它们组织成一个语义重复组。您可以使用向量近似去重任务来减少诸如重述文本、稍作修改的图片或者多个版本的相似内容等冗余数据。

[主键去重](./primary-key-dedup)和向量近似去重解决不同的数据重复问题。在数据清洗流程中，您可以先清理那些主键重复的数据，然后再在经过主键去重的数据上进行向量近似去重。

## 概述\{#overview}

下图展示了向量近似去重任务如何识别相似记录并生产输出数据集的过程。首先，任务会将数据集中的数据记录分配到 K 个簇中，并使用配置的指标比较每个簇中的记录。符合指标要求的记录会首尾相连，组成重复记录组。

![Drgywy13phfhKLbLRFpcejrRngc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Drgywy13phfhKLbLRFpcejrRngc.png)

对于每个重复数据组，任务选择其中的一条作为整个组的代表数据。默认情况下，离重复数据组中心点最近的记录会被选择为代表性数据。您也可以使用 `keepBy` 策略让任务根据指定标量字段的值来决定更具有代表性的记录。

根据输出模式的不同，任务可以返回所有输入记录并添加重复组相关的元数据字段，或者仅返回向量近似去重后的记录。

### 识别重复项\{#decide-what-counts-as-a-duplicate}

上文中反复提到的阈值（即 `similarityThreshold`）的含义和合法取值范围根据选择的相似度类型不同而有所差异。您可以直接指定这个阈值或者指定一个目标去重率（即 `targetDedupRate`）。但是这两个参数至少要指定一个。

<table>
   <tr>
     <th><p>方法</p></th>
     <th><p>何时用</p></th>
     <th><p>具体行为</p></th>
   </tr>
   <tr>
     <td><p><code>targetDedupRate</code></p></td>
     <td><p>您完全不知道如何设置一个合适的阈值。</p></td>
     <td><p>根据输入数据的采样分析推导一个合适的阈值，并使用该阈值达成指定的去重率。</p></td>
   </tr>
   <tr>
     <td><p><code>similarityThreshold</code></p></td>
     <td><p>您已经有一个经过验证的阈值。</p></td>
     <td><p>直接使用您指定的阈值。需要注意的是：</p><ul><li><p>对于相似度类型 <code>cosine</code>而言，阈值的取值范围为 <code>(0, 1]</code>。</p></li><li><p>对于相似度类型 <code>l2</code> 而言，阈值的合法取值范围为大于 <code>0</code>。</p></li></ul></td>
   </tr>
</table>

当您指定 `targetDedupRate` 时，任务会自动推导并预估一个合适的 `similarityThreshold`，并使用该阈值达成指定的去重率。在 K-Means 聚类阶段，任务会评估多个候选阈值，并用输入数据的 10% 对这些阈值进行筛选，测试每个候选阈值达成的去重率，并使用线性插值来预估达成指定去重率的阈值。

通过设置 `targetDedupRate`，您就无须手动设置 `similarityThreshold`。但是这也在去重前增加了一个额外的参数预估阶段。初步估计，该额外阶段可能会使任务处理时间增加约 10%。

参数 `similarityThreshold` 的含义由您选择的相似度类型决定：

- 对于相似度类型 `cosine`而言，阈值的取值范围为 `(0, 1]`。

- 对于相似度类型 `l2` 而言，阈值的合法取值范围为大于 `0`。

### 选择记录保留策略\{#which-record-is-retained}

默认情况下，任务会根据一个内部标记决定保留哪条记录。所以，仅在所有重复项包含相同的字段值时，考虑使用默认策略。

如果重复记录的各字段的值可能不同，请使用 `keepBy` 来定义一个记录保留策略。请将 `keepBy` 设置成 `<field-name>:<strategy>`。例如，`timestamp:max` 会保留重复记录中 `timestamp` 字段值最大的那条记录。

```plaintext
| primary key | timestamp  | content         | vector       |
|-------------|------------|-----------------|--------------|
| doc-1       | 1710000000 | Earlier version | [0.12, 0.35] | <!-- 根据策略 timestamp:max 删除-->
| doc-2       | 1720000000 | Latest version  | [0.18, 0.41] | <!-- 根据策略 timestamp:max 保留-->
| doc-3       | 1715000000 | Similar version | [0.16, 0.39] | <!-- 根据策略 timestamp:max 删除-->
```

在上述示例中，这三条记录因为向量相似度低于阈值，都落在同一个重复记录组中。如果没有设置 `keepBy` 策略，任务会选择这三条记录中离簇中心点最近的记录予以保留。当您将 `keepBy` 设置为 `timestamp:max`，任务会保留 `doc-2`，因为它的 `timestamp` 值最大。

值得注意的是，任务会保留选中的那条记录的所有字段值，不会合并不同重复记录的字段值。

### 选择相似度类型\{#choose-a-distance-metric}

相似度类型决定如何将向量纳入不同的簇中。

| **相似度类型** | **如何解读相似度** | **何时使用** |
| --- | --- | --- |
| `l2` | 相似度值越小，向量越相似。 | 请根据嵌入模型使用的相似度类型和当前工作流使用 Euclidean 距离（L2）。 |
| `cosine` | 相似度值越大，向量越相似。 | 如果向量的方向比距离更重要，就使用余弦距离（Cosine）。 |

### 选择输出模式\{#choose-an-output-mode}

根据您是要进一步检测去重结果还是直接对数据集去重，来决定输出模式。

| 输出模式 | 生成的数据 | 何时使用 |
| --- | --- | --- |
| `map` | 保留所有输入数据记录，并在每条记录后添加 `parent_id` 和 `is_representative` 两个标量字段，用于记录该记录所属的重复记录组和代表性状态。 | 当您需要检测重复数据组、审核输出结果或者评估新的 `targetDedupRate` 或 `similarityThreshold` 参数时使用。 |
| `deduped_rows` | 输出文件中仅保留每个重复组中的代表性记录或未归入任何重复组的单一记录。 | 当您在完成去重设置验证后，可以直接生产去重数据时使用。 |

当您省略 `outputMode`时，该参数的默认值由是否指定 `primaryKeyField` 来决定：

- 如果您设置了 `primaryKeyField` 时，`outputMode` 默认为 `map`。

- 如果您省略了 `primarykeyField` 时，`outputMode` 默认为 `deduped_rows`。

如果您明确设置 `outputMode` 为 `map`，请务必同时设置 `primaryKeyField`。否则，请求可能会报错。

在 `map` 模式下，输出的数据会包含如下额外的元数据字段。

| 字段名称 | 字段描述 |
| --- | --- |
| `parent_id` | 表示代表性记录的主键值。属于同一重复记录组的所有记录都使用相同的 `parent_id`。对于不属于任何重复记录组的记录，`parent_id` 为其自身的主键值。 |
| `is_representative` | 表示当前记录是否为代表性记录。该字段为 `true` 时，表示当前记录为其所属重复记录组中的代表性记录或不属于任何重复记录组的独立记录。 |

对于初次运行向量近似去重，建议使用 `targetDedupRate` 并将输出模式设置为 `map`。在正式删除任何记录之前，可以方便地对生成的重复组进行检测和分析。在完成结果验证后，可以继续使用 `targetDedupRate` 或者设置一个固定的 `similarityThreshold` 以便进行后续运行。

## 开始前准备\{#before-you-start}

在创建向量近似去重任务前，请确保：

- 所有输入数据文件的结构互相兼容，并都包含需要比较的向量字段。

- 数据记录中的向量数据使用相同的数据类型和相同的维度，确认它们都是使用相同的嵌入模型和前置预处理流程生成的。

- 如需使用 `map` 输出模式，输入数据中的记录必须包含一个合法的主键值，您也需要将这个字段的名称指定为 `primaryKeyField`。

- 如需使用 `keepBy`，请确认输入数据的记录中均包含保留策略中指定的字段。

关于 Spark 批量任务的通用要求，包括鉴权、输入文件和输出行为，查看[Spark 批量任务](./spark-batch-jobs)。

## 创建向量近似去重任务\{#create-a-vector-similarity-deduplication-job}

创建向量近似去重任务需要指定输入和输出路径、用于比较的向量字段、重复检测方法、如何选择代表性数据记录，以及输出模式。任务异步运行，返回一个任务 ID，可用于监控任务进展。在任务成功完成后，您可以在请求中指定的输出路径中查看处理过的数据。

<Procedures>

1. 准备一个幂等 Key。

    幂等 Key 是一个用于判断当前请求的资源是否已经在运行的字符串。如果请求的资源已经在运行，则返回该资源。关于幂等 Key 的更多详情，可以参考[幂等提交](./spark-batch-jobs#idempotent-submission)。

1. 准备请求负载。

    ```bash
    export payload = '{
      "jobName": "vector-dedup-demo",
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
        "path": "output/vector-dedup.parquet",
        "format": "parquet"
      },
      "primaryKeyField": "id",
      "vectorField": "embedding",
      "metric": "cosine",
      "similarityThreshold": 0.95,
      "outputMode": "map",
      "keepBy": "timestamp:max",
      "clusterSize": "SMALL"
    }'
    ```

    下表列出了主键去重任务独有的几个参数。

    <table>
       <tr>
         <th><p>参数名称</p></th>
         <th><p>是否必选</p></th>
         <th><p>参数描述</p></th>
       </tr>
       <tr>
         <td><p><code>primaryKeyField</code></p></td>
         <td><p>否</p></td>
         <td><p>用于在数据完成清理后导入的目标 Collection 中充当主键的标量字段。</p><p>Zilliz Cloud Collection  要求主键字段的数据类型为字符串（VarChar）或整数（Int64）。</p></td>
       </tr>
       <tr>
         <td><p><code>vectorField</code></p></td>
         <td><p>是</p></td>
         <td><p>用于进行向量相似度比较的向量字段。支持的字段值类型为 <code>array&lt;float&gt;</code>、数值数组、Spark 向量以及用逗号分隔的字符串。</p></td>
       </tr>
       <tr>
         <td><p><code>metric</code></p></td>
         <td><p>是</p></td>
         <td><p>用于向量相似度比较的相似度类型。可能的取值为 <code>cosine</code> 和 <code>l2</code>。</p></td>
       </tr>
       <tr>
         <td><p><code>similarityThreshold</code></p></td>
         <td><p>否</p></td>
         <td><p>用于识别相似记录的阈值：</p><ul><li><p>对于 <code>cosine</code> 而言，该值取值范围为 <code>(0, 1]</code>；两条记录间的相似度高于该值时，这两条记录被认为是相似的。</p></li><li><p>对于<code>l2</code> 而言，该值的取值范围为大于 <code>0</code>； 两条记录间的相似度低于该值时，这两条记录被认为是相似的。</p></li></ul><p>请不要同时设置本参数和 <code>targetDedupRate</code>。如果这两个参数都未设置，任务会报错。</p></td>
       </tr>
       <tr>
         <td><p><code>outputMode</code></p></td>
         <td><p>否</p></td>
         <td><p>输出模式。可能的取值为 <code>map</code> 和 <code>deduped_rows</code>。如果未指定，当 <code>primaryKeyField</code> 已指定时，默认值为 <code>map</code>，否则就是 <code>deduped_rows</code>。</p><p>设置该参数为 <code>map</code> 时 <code>primaryKeyField</code> 必填。</p></td>
       </tr>
       <tr>
         <td><p><code>targetDedupRate</code></p></td>
         <td><p>否</p></td>
         <td><p>需要达成的去重率。该参数的取值范围为<code>(0, 1)</code>。任务会根据输入数据来推导一个可以达成指定去重率的合适的阈值。</p><p>请不要同时设置本参数和 <code>similarityThreshold</code>。如果这两个参数都未设置，任务会报错。</p></td>
       </tr>
       <tr>
         <td><p><code>keepBy</code></p></td>
         <td><p>否</p></td>
         <td><p>记录保留策略，用于决定重复记录组中保留的记录。</p><p>该值的格式为 <code>&lt;field-name&gt;:&lt;strategy&gt;</code>。比如，<code>timestamp:max</code>。</p></td>
       </tr>
    </table>

    <Admonition type="info" icon="📘" title="说明">

    `similarityThreshold` 和 `targetDedupRate` 两个参数互斥。两个均设置或均未设置，任务均会报错。

    </Admonition>

    关于 Spark 批量任务通用的其它参数，请参考[请求负载](./spark-batch-jobs#request-payload)。

1. 提交任务。

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/jobs/dedup/vector" \
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
        "jobName": "vector-dedup-demo",
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

- 当输出模式为 `map` 时，

    - 所有输入记录均保留。

    - 落入同一重复记录组的记录，其 `parent_id` 一致。

    - 每个重复记录组都仅有一条记录的 `is_representative` 字段设置为 `true`。

    - 未落入任何重复记录组的单一记录，其 `parent_id` 值为其自身的主键值，且 `is_representative` 为 `true`。

- 当输出模式为 `deduped_rows` 时，

    - 重复记录组中的代表性记录被保留下来。

    - 未落入任何重复记录中的单一记录也被保留下来

- 如果指定了 `keepBy` 策略，保留的记录符合预期。

- 对返回的数据进行采样，看看同一重复记录组中的数据的确实相似。

## 后续操作\{#next-step}

如果可的话，建议您执行[主键去重](./primary-key-dedup)任务删除主键重复的记录，对于模型训练及大数据分析场景，您还可以使用[K-Means 聚类](./k-means-clustering)任务来了解数据集中的向量分布，使用[异常点检测](./anomaly-detection)任务来找出需要进一步处理的异常数据记录。