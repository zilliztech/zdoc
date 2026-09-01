---
title: "替换向量嵌入模型 | BYOC"
slug: /migrate-to-a-new-embedding-model
sidebar_label: "替换向量嵌入模型"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本操作指南讲述如何在不新建 Collection 的前提下为生产中的 Collection 切换向量嵌入模型。您可以在 Collection 中新建一个用于存放使用新向量嵌入模型生成数据的新字段、为原有 Entity 和新增 Entity 在新字段中填充相应的向量嵌入表示、并验证填入的数据是否符合预期。在验证结束后，可将生产查询流量切换到新字段。 | BYOC"
type: origin
token: P6jIwvKEOiFdagk2vdZcLjt4nIh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 替换向量嵌入模型

本操作指南讲述如何在不新建 Collection 的前提下为生产中的 Collection 切换向量嵌入模型。您可以在 Collection 中新建一个用于存放使用新向量嵌入模型生成数据的新字段、为原有 Entity 和新增 Entity 在新字段中填充相应的向量嵌入表示、并验证填入的数据是否符合预期。在验证结束后，可将生产查询流量切换到新字段。

## 使用场景\{#when-to-use-this-runbook}

在需要同时保持生产 Collection 在线并替换生产 Collection 使用的向量嵌入模型时，可以参考本操作指南。具体场景包括但不限于如下情况：

- 使用的向量嵌入模型需要升级。

- 需要切换向量嵌入模型提供商或模型家族。

- 修改了向量配置，导致生成的新向量与旧向量不兼容。

- 希望在不影响生产的情况下完成替换。

如果您希望添加一个额外的向量字段，而非替换现有向量字段，例如，为 Collection 增加多模态向量检索能力，可参考多模态操作指南。

## 流程概览\{#how-migration-works}

由不同的模型生成的向量表示属于不同的向量空间。您不应该将它们放入同一个向量字段中。当然，您也不应该直接用新的向量表示来替换字段中的旧的向量表示。正确的做法是添加一个用于存放新向量表示的字段，并在新字段数据回填完成前，让两个字段共存一段时间。

在此期间，在为原有 Entity 回填新字段数据之前，新插入和更新的 Entity 即可接收新模型生成的向量数据。同时，生产查询在数据回填和验证完成之前仍旧使用旧字段。在生产流量切换到新字段后，仍建议您设定一个回滚窗口期。在回滚窗口期间继续保留旧字段及其数据，用于新数据的使用不及预期时实现业务回滚。

```python
┌─────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────┐
│ embedding_v1        │      │ embedding_v1            │      │ embedding_v1        │
│ serves production   │ ───▶ │ embedding_v2 being      │ ───▶ │ kept for rollback   │
│ search              │      │ populated               │      │ embedding_v2 serves │
│                     │      │                         │      │ production search   │
└─────────────────────┘      └─────────────────────────┘      └─────────────────────┘

        v1 only                  v1 + v2                         v2 primary
```

核心原则是在新字段数据填充完毕并验证通过之前，在生产查询中继续使用旧字段。

## 开始前准备\{#before-you-start}

开始替换操作前，请确保满足以下条件：

- 您已选择新的嵌入模型，并确认了其向量维度与相似度度量标准。

- 您仍然可以访问用于为现有实体生成嵌入的源内容。

- 每条源记录都可通过稳定的主键映射至现有实体。

- 您已准备好固定的评估集，用于在替换验证过程中对比当前查询逻辑与新查询逻辑。

- 您拥有充足的嵌入、写入、索引及存储容量，可在不影响生产流量的前提下完成替换。

## 步骤 1：准备替换数据\{#step-1-prepare-the-migration-data}

在修改 Collection 或生产应用之前，需要准备一份干净、经过验证的数据集，用于填充新向量字段。请务必使用经过验证的原始文本数据生成新的向量表示，清理重复项或异常记录后，确认该数据集符合预期，可用于数据回填。

<Procedures>

1. **收集原始文本内容。**

    如果原始文本内容就存放在目标 Collection 中，使用 Query Iterator 来分批读取 Collection 中的 Entity。同时，获取主键，并使用存放原始文本的字段生成新的向量表示。在可能的情况下，也同时获取文本的版本信息、时间戳或文本的哈希表示。

    如需要从 Milvus 中导出数据，可以参考如下 Query Iterator 示例：

    ```python
    iterator = client.query_iterator(
        collection_name="documents",
        batch_size=1000,
        filter="",
        output_fields=["id", "text", "content_version"],
    )
    
    for batch in iterator:
        save(batch, "migration-source")
    ```

    准备好的原始数据如下所示：

    ```plaintext
    id   | text                 | content_version
    1001 | "Example document A" | 42
    1002 | "Example document B" | 17
    ```

    在继续下一步前，确认准备好的数据里主键齐备且唯一，目标范围内的所有 Entity 都有内容、都能被新向量嵌入模型解析。

1. **使用新模型生成向量。**

    用准备好的原始文本，通过上一步验证好的新的模型和配置生成 `embedding_v2`。在生成的向量的同时记得保留Entity 的主键和相关元数据。

    如下伪代码演示了生成向量的过程：

    ```python
    # Pseudocode
    source_records = read("migration-source.parquet")
    
    generated = []
    failed = []
    
    for record in source_records:
        try:
            generated.append({
                "id": record["id"],
                "embedding_v2": embed(
                    record["text"],
                    model="new-embedding-model",
                ),
                "content_version": record["content_version"],
            })
        except Exception as error:
            failed.append({
                "id": record["id"],
                "reason": str(error),
            })
    
    save(generated, "embedding-v2.parquet")
    save(failed, "embedding-v2-failures.json")
    ```

    另外，还得将生成失败的 Entity 主键及失败原因保留下来。

1. **如有必要，清洗暂存数据。**

    上述流程的重试、反复导出或失败均有可能在暂存数据中引入重复或异常记录。在数据回填前需进行清理。

    如果同一个主键值的记录反复出现，可以使用 Zilliz Cloud 提供的主键去重任务。如果您怀疑暂存数据中存在近似向量或异常向量，也可以使用向量近似去重或异常点检测任务来发现这些问题。关于这些任务的具体情况，可以参考[主键去重](./primary-key-dedup)、[向量近似去重](./vector-similarity-dedup)和[异常点检测](./anomaly-detection)。

    在继续执行下一步之前，确认暂存数据中不存在无法解释的重复数据或异常数据。

1. **验证生成的数据。**

    在此步骤中，确认所有记录都有唯一主键且主键值不为空，目标向量字段的维度符合预期，且各维度的值均为合法数值。

    如下伪代码演示了验证步骤的具体操作。

    ```python
    # Pseudocode
    source_records = read("migration-source.parquet")
    generated = read("embedding-v2.parquet")
    failed = read("embedding-v2-failures.json")
    
    EXPECTED_DIM = 1024
    
    source_ids = {record["id"] for record in source_records}
    generated_ids = {record["id"] for record in generated}
    failed_ids = {record["id"] for record in failed}
    
    assert len(generated_ids) == len(generated)
    
    for record in generated:
        vector = record["embedding_v2"]
        assert record["id"] is not None
        assert len(vector) == EXPECTED_DIM
        assert all(is_valid_number(value) for value in vector)
    
    unaccounted_ids = source_ids - generated_ids - failed_ids
    
    if unaccounted_ids:
        raise ValueError(
            f"{len(unaccounted_ids)} source records are unaccounted for"
        )
    ```

    在继续进行下一步之前，确认不存在无法解释的记录缺失、非法向量或主键冲突。

1. **暂存替换源数据并记录基线。**

    将替换源数据存为 Parquet、JSON、Lance 或 CSV 等受支持的格式。然后将数据上传至数据回填任务可以访问的 External Volume 中。关于如何创建 External Volume，可以参考 [External Volume](./external-volume)。

    记录源数据水印或快照时间，使用的嵌入模型和版本，向量维度，暂存数据集及记录数量等。将该基线与最终产物保存在一起，用于后续对账和验证。

    ```yaml
    migration_id: embedding-v2-2026-08
    source_watermark: 2026-08-25T02:00:00Z
    embedding_model: new-embedding-model
    vector_dimension: 1024
    source_records: 10000000
    generated_embeddings: 9999850
    failed_records: 150
    staged_dataset: embedding-v2.parquet
    ```

    当所有源记录要么在暂存数据集中有对应条目，要么被明确标记为失败或已排除时，替换源数据集即准备就绪。

</Procedures>

## 步骤 2：完成读写逻辑适配\{#step-1-prepare-readers-and-writers}

在切换生产流量前，请将应用改造为可同时兼容当前与新增的向量表示形式。需将读写开关设为独立状态，以便先切换写入流量、验证新表示形式，之后再切换查询流量。

对于查询操作，请定义两个检索配置文件，始终将查询嵌入模型与匹配向量字段配对：

```plaintext
v1 = old embedding model + embedding_v1
v2 = new embedding model + embedding_v2
```

请勿使用一个模型对查询内容进行编码，再去检索由另一个模型生成的向量字段。

对于写入操作，请预先配置插入与更新链路，使其基于 Entity 所用的同一源内容生成 `embedding_v2`。目前暂不要启用新写入链路；待添加 v2 字段与索引后，再切换生产环境的写入流量。

将这上述两个配置分开，例如：

```plaintext
write_profile = v1 | v1+v2
read_profile  = v1 | v2
```

本步骤结束时，生产环境的读写操作仍应使用 v1，但应用应已准备就绪，可在后续迁移步骤中独立启用 v2。

## 步骤 3：添加 v2 字段并建立索引\{#step-3-add-and-index-v2-field}

为新模型生成的向量添加一个允许为空的向量字段，并将其维度设置为与新嵌入模型允许的维度一致。

```python
from pymilvus import DataType

client.add_collection_field(
    collection_name="documents",
    field_name="embedding_v2",
    data_type=DataType.FLOAT_VECTOR,
    dim=1024,
    nullable=True,
)
```

原有 Entity 在 `embedding_v2` 字段上的值在批量填充前均为 `NULL`。新 Entity 可以在下一步切换生产写入流量后接入目标 Collection。

另外，您也可以选择在此步骤中使用您为新嵌入模型选定的相似性度量类型为新的向量字段创建索引。

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="embedding_v2",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_index(
    collection_name="documents",
    index_params=index_params,
)
```

只有 `embedding_v2` 值不为空的 Entity 才会被纳入索引，且可通过新字段进行检索。

继续操作前，请确认 Collection  Schema 中存在 `embedding_v2`，且其维度与索引配置与新的嵌入模型相匹配。在下一步切换写入流量之前，请确保生产环境的读写操作均使用 v1 版本。

## 步骤 4：切换生产写入流量\{#step-4-switch-production-writes}

更新生产侧写入逻辑，确保每个新增或更新的 Entity 同时生成 `embedding_v1` 和 `embedding_v2`。在历史数据回填工作完成前，生产侧的查询请求仍继续使用 v1 版本。

下方的伪代码演示了从同一源内容及版本中生成两类嵌入向量的方式：

```python
# Pseudocode
source = get_latest_source(record_id)

write_entity({
    "id": source["id"],
    "text": source["text"],
    "content_version": source["content_version"],
    "embedding_v1": embed(source["text"], model="current-model"),
    "embedding_v2": embed(source["text"], model="new-model"),
})
```

当 v2 向量生成失败时，请勿仅写入一种向量表示。您应该记录失败的 Entity 并重试，以确保迁移过程中两个字段均保持最新状态。

在启动历史数据回填前，请确认：在生产环境搜索仍使用 `embedding_v1` 的前提下，新增及更新的实体在两个向量字段中均能获取有效值。

## 步骤 5：回填原有 Entity\{#step-5-backfill-existing-entities}

为切换生产写入逻辑之前就已存在的 Entity 回填 `embedding_v2`。使用前期准备的分阶段替换数据集，通过主键将每条记录与现有 Entity 进行匹配。

将 External Volume 中暂存的 Parquet、JSON、Lance 或 CSV 数据提交至回填工作流。将主键和 `embedding_v2` 列映射到现有的 Collection 字段。

```bash
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request POST \
    --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/backfill" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "Idempotency-Key: migrate-to-new-embedding-model-001" \
    --header "Content-Type: application/json" \
  --data '{
    "collectionName": "documents",
    "fields": ["embedding_v2"],
    "input": {
      "type": "volume",
      "volumeId": "migration-data",
      "path": "embedding-v2/",
      "format": "parquet"
    },
    "columnMapping": {
      "id": "id",
      "embedding_v2": "embedding_v2"
    },
    "mode": "coalesce"
  }'
```

暂存输入应为每个现有 Entity 对应一行：

```plaintext
id   | embedding_v2       | content_version
1001 | [0.12, 0.31, ...]  | 42
1002 | [0.18, 0.27, ...]  | 17
```

在回填工作流运行期间，请保持生产环境双写功能启用。在数据基线之后创建或更新的记录将由生产环境的写入逻辑处理，并在下一步中进行对账。

继续操作前，请确认回填任务已成功完成，并记录其任务 ID、输入数据集、源水印，以及所有被跳过或失败的记录。请勿将任务成功作为迁移已就绪、可投入生产、可读取的依据；请在后续的验证步骤中验证回填操作的覆盖范围与回填数据的正确性。

## 步骤 6：回填后验证\{#step-6-reconcile-changes-made-after-the-backfill}

回填完成后，需核对迁移基准时间点之后创建或更新的记录，确保 `embedding_v2` 能反映源内容的最新状态。

使用此前记录的源水印、快照时间或 `content_version` 来识别受影响实体。基于最新源版本重新生成 `embedding_v2`，并完成生产写入逻辑。

```python
# Pseudocode
baseline = read("migration-baseline.json")

for record in source_store.changed_after(baseline["source_watermark"]):
    latest = source_store.read(record["id"])

    if latest is None or latest["deleted"]:
        continue

    write_embedding_v2(
        id=latest["id"],
        embedding=embed(
            latest["text"],
            model="new-embedding-model",
        ),
        content_version=latest["content_version"],
    )
```

请勿复用基于旧版数据源生成的嵌入向量。若在嵌入向量生成过程中数据源再次发生变更，请使用最新版本重新生成。

在继续操作之前，请确认迁移基准之后作出的所有变更，要么已应用至 `embedding_v2`，要么已明确记录下来以备重试或审核。

## 步骤 7：验证替换结果\{#step-7-validate-the-migration-results}

在将生产环境的查询流量切换至 `embedding_v2` 之前，请同时验证迁移后的数据与新的查询逻辑。请使用前期准备好的迁移基线与固定评估集，确保校验流程可重复执行。

<Procedures>

1. **检查数据覆盖率。**

    将预期迁移人口与当前拥有 `embedding_v2` 的 Entity 进行比对。所有范围内的 Entity 均应完成数据填充，或被明确标记为失败或已排除状态。

    ```plaintext
    expected:      10,000,000
    populated:      9,999,850
    excluded:             150
    unexplained:            0
    ```

1. **检查数据新鲜度。**

    请确认 `embedding_v2` 能够反映迁移期间发生变更的 Entity 的最新源版本。针对存储版本或内容哈希与权威源不匹配的所有记录展开调查。

1. **比较召回率。**

    对两个检索配置文件运行同一套评估集：

    ```plaintext
    v1 = old embedding model + embedding_v1
    v2 = new embedding model + embedding_v2
    ```

    请对比与你的应用相关的检索指标，例如 Recall@K、MRR 或 nDCG@K。

    ```plaintext
                     v1       v2
    Recall@10       0.82     0.87
    nDCG@10         0.71     0.76
    ```

    如果你的应用依赖于相似度分数阈值，请针对 v2 版本重新校准这些阈值，而非复用从旧嵌入模型得出的阈值。

1. **检查生产性能。**

    在典型流量场景下测试 v2 查询逻辑，并将查询嵌入延迟、搜索延迟、错误率、吞吐量与模型容量与当前生产环境路径进行对比。

</Procedures>

在不存在无法解释的覆盖范围或时效性缺口，且 v2 检索路径满足迁移所定义的质量与运维标准之前，请勿在生产环境进行查询操作。

## 步骤 8：切换生产查询流量\{#step-8-switch-production-reads}

替换结果通过验证后，将生产环境的搜索任务从 v1 检索配置文件切换至 v2。需同步切换查询嵌入模型与向量字段，确保新模型生成的查询始终基于 `embedding_v2` 进行查询。

逐步上线新的查询流量，而非一次性切换全部流量。先从一小部分生产流量开始，监控检索质量、延迟及错误情况，且仅在验证标准持续满足的前提下，逐步提升流量占比。

在灰度发布期间，请保持双写功能启用，并保留 v1 检索逻辑。若新逻辑出现性能回退，可将读请求路由回旧嵌入模型与旧向量字段，无需回退回填操作，也无需移除 `embedding_v2`。

持续执行该操作，直至所有生产环境读取请求均使用 v2 检索配置文件，且服务在你定义的回滚窗口期内保持稳定。

## 步骤 9：完成替换\{#step-9-complete-the-migration}

在所有生产环境的查询操作均使用 v2 检索配置文件且回滚窗口已结束后，停止为新增及更新的实体生成 `embedding_v1`，并移除仍依赖旧表示形式的应用逻辑。

当您的 Collection 兼容 Milvus v3.0.x 或更高版本时，请从集合中移除 `embedding_v1`：

```python
client.drop_collection_field(
    collection_name="documents",
    field_name="embedding_v1",
)
```

删除该字段的同时也会移除其关联的索引。如果 `embedding_v1` 是集合中最后剩余的向量字段，则该操作将被拒绝。

之后，请确认旧字段已不存在：

```python
collection = client.describe_collection(
    collection_name="documents"
)

print(collection["fields"])
```

在完成替换前，请确认生产环境的读写操作仅使用新的嵌入模型及 `embedding_v2`，且不存在任何仍依赖旧表示形式的回滚或对账工作流。

## 故障处理与回滚\{#failure-handling-and-rollback}

在替换完成前，需保留当前的 v1 检索逻辑的可用性。若某一步失败，应从该阶段恢复，而非撤销已成功完成的变更。

| **业务逻辑** | **恢复参考方向** |
| --- | --- |
| **准备替换数据** | 更改数据集 Collection 前，请先修复或重新生成失败的记录。若暂存数据集存在无法解释的缺失、重复或无效记录，请勿继续操作。 |
| **添加 v2 字段并建立索引** | 将生产环境的读写操作保留在 v1 版本。在切换写入逻辑之前，先修复 Schema 或索引配置。 |
| **切换生产写入流量** | 将生产环境查询流量保留在 v1 版本。修复写入端，并在启动回填前确认新 Entity 与更新后的 Entity 始终能同时获取两种表示形式。 |
| **回填数据** | 保持双写功能启用，生产环境查询请求仍指向 v1。尽可能使用同一迁移数据集重试回填操作。若快照或暂存数据已失效，请准备新的基线并重新运行受影响的部分。 |
| **对账** | 保持对 v1 的读取，并对失效、失败或仍在变动的记录进行重试。若源数据与 `embedding_v2` 之间存在无法解释的差异，则请勿继续执行。 |
| **验证** | 请勿在生产环境中切换查询流量。请修复覆盖范围、数据新鲜度、检索质量或性能问题，然后重新执行受影响的验证检查。 |
| **只读回滚** | 路由回退至 v1 检索配置文件，同时保留 `embedding_v2` 及其索引完整，以便排查问题。请保持双写功能启用，确保 v1 始终可用作为有效的回退路径。 |
| **全量切换后** | 在回滚窗口期内，请保留 `embedding_v1`、其索引以及旧版模型集成。如果 v2 出现性能退化，将生产环境的查询操作切回 v1。 |

在回滚窗口关闭前，请勿移除 `embedding_v1` ，或停止对其的维护。待旧字段与模型集成下线后，若需回滚，则需执行全新迁移，而非切换流量。