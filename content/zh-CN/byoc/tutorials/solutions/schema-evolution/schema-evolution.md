---
title: "Schema 演进 | BYOC"
slug: /schema-evolution
sidebar_label: "Schema 演进"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Schema 演进流程可以指导您在现有 Collection 中添加字段并回填数据。在此期间，您无须创建新的 Collection 或暂停生产查询。 值得注意的是，添加字段仅改变了 Collection 的数据结构。Collection 中已经存在的 Entity 在新增字段上的值仍旧为空。在不停机变更开始后，新的 Entity 和针对 Collection 中已经存在的 Entity 的更新仍可继续。 | BYOC"
type: origin
token: Y1wRwPqtgiRnIekew7JcfcbhnUc
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Schema 演进

Schema 演进流程可以指导您在现有 Collection 中添加字段并回填数据。在此期间，您无须创建新的 Collection 或暂停生产查询。 值得注意的是，添加字段仅改变了 Collection 的数据结构。Collection 中已经存在的 Entity 在新增字段上的值仍旧为空。在不停机变更开始后，新的 Entity 和针对 Collection 中已经存在的 Entity 的更新仍可继续。

本文将介绍 Schema 演进的通用流程。

## 概述\{#understand-the-workflow}

下图演示了如何安全地完成生产 Collection 的 Schema 演进。

![NQZLwNt9DhEyhybzCgjcVFJBnOe](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/NQZLwNt9DhEyhybzCgjcVFJBnOe.png)

按上图所示，完整的 Schema 演进流程主要包括：

1. 准备读写适配。

    确保您的应用已完成新增字段的读写适配。

1. 添加字段。

    为目标 Collection Schema 增加新字段。

1. 开始写入。

    允许您的应用新增 Entity 或更新原有 Entity。此时，这些 Entity 的原有字段和新增字段应该同步写入。

1. 回填数据。

    为原有 Entity 的新增字段执行数据回填。

1. 验证回填结果。

    验证所有原有 Entity 和新增或更新的 Entity 在新字段上的取值符合预期。

1. 开始查询。

    新增字段可以接受查询。

请严格按照上述顺序执行 Schema 演进。在启动回填前切换应用的写入操作，确保数据回填期间创建或更新的 Entity 已包含新字段的对应值。回填完成后，先对原有数据和新写入的数据进行校验，再将读取操作切换至新字段。

## 开始前准备\{#before-you-start}

在对线上 Collection 的 Schema 进行变更之前，请确保满足以下条件：

- 可对您的应用进行更新，使其能够读写新字段。

- 填充现有 Entity 的新字段所需的源数据已齐备。

- 每条源记录都可通过主键匹配到现有 Entity。

- 在回填验证完成前，现有字段仍可正常使用。

## 步骤 1：完成读写逻辑适配\{#step-1-prepare-readers-and-writers}

在修改 Collection Schema 之前，请先做好应用适配，使其能够对新增字段执行读写操作。请通过配置开关或功能开关部署这些改动，但在新字段添加到 Collection 之前，务必将开关保持禁用状态。

例如，假设你计划添加一个名为 `category` 的字段。你可以提前做好准备，让写入逻辑在启用新 Schema 时包含该字段：

```python
# Pseudocode
def build_entity(document, use_new_schema=False):
    entity = {
        "id": document["id"],
        "text": document["text"],
        "embedding": document["embedding"],
    }

    if use_new_schema:
        entity["category"] = document["category"]

    return entity
```

以相同方式准备好查询逻辑，确保在回填验证通过后，它们能够正常使用新字段：

```python
# Pseudocode
def get_output_fields(use_new_schema=False):
    fields = ["id", "text"]

    if use_new_schema:
        fields.append("category")

    return fields
```

在此阶段，请保持两个开关均处于禁用状态。在添加新字段之前，生产环境的读写操作应继续使用现有架构。

## 步骤 2：添加新字段\{#step-2-add-the-new-fields}

待更新后的读写逻辑准备就绪后，向现有 Collection 的 Schema 中添加所需字段。此时，请保持新字段读写处于禁用状态。

例如，以下代码会添加一个允许为空的名为 `category` 字段：

```python
from pymilvus import DataType

client.add_collection_field(
    collection_name="documents",
    field_name="category",
    data_type=DataType.VARCHAR,
    max_length=64,
    nullable=True,
)
```

添加字段仅会更改 Collection 的 Schema。现有 Entity 不会被重写，且在迁移过程中后续填充该新字段之前，新字段的值均为 NULL。

一旦 Schema 变更完成，即可切换应用写入逻辑，确保所有新增或更新的实体都会填充该新字段。

## 步骤 3：开始写入\{#switch-writes}

在 Collection 的 Schema 中添加新字段后，启用更新后的写入逻辑，确保所有新插入操作和整行 Upsert 操作都能填充这些字段。

例如，启用此前准备好的写入逻辑：

```python
USE_NEW_SCHEMA = True

entity = build_entity(document, use_new_schema=USE_NEW_SCHEMA)

client.insert(
    collection_name="documents",
    data=[entity],
)
```

对于整行 Upsert 操作，请在请求负载中也包含新字段：

```python
client.upsert(
    collection_name="documents",
    data=[{
        "id": document["id"],
        "text": document["text"],
        "embedding": document["embedding"],
        "category": document["category"],
    }],
)
```

在启动回填操作前，请先完成写入逻辑切换。自此之后，新插入或更新的 Entity 已包含新字段的对应值，而现有 Entity 的填充将由回填流程完成。该顺序可避免在迁移过程中，写入操作因两条路径同时遗漏而产生的空档问题。

在回填完成且迁移经验证通过前，保持您的应用仅读取原有字段。

## 步骤 4：回填原有 Entity\{#backfill-existing-entities}

待应用中所有写入逻辑都切换至新 Schema 后，为切换前已存在的 Entity 回填新字段。

准备好包含主键及待写入新字段值的数据文件。对于在线迁移，可使用 `coalesce` 模式在为原有实体填充缺失值的同时，保留您的应用使用新的写入逻辑写入的值。

在 Zilliz Cloud 中提交数据回填任务。Zilliz Cloud 将在 Collection 中创建 Snapshot、执行 Spark 脚本，并将提交回填结果。

提交回填任务前，你可选择运行预检查，以验证输入数据与字段映射是否有效。

以下代码片段演示了如何提交数据回填任务。有关准备输入内容、对数据执行预检查、选择回填模式、提交回填任务以及监控任务的详细信息，请参见[数据回填](./data-backfill)。

```bash
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request POST \
    --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/backfill" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "Idempotency-Key: schema-evolution-backfill-001" \
    --header "Content-Type: application/json" \
    --data '{
      "description": "Backfill category for existing documents",
      "clusterId": "in-xxxxxxxx",
      "dbName": "default",
      "collectionName": "documents",
      "fields": ["category"],
      "input": {
        "type": "volume",
        "volumeName": "migration-data",
        "path": "schema-evolution/category-backfill.parquet",
        "format": "parquet"
      },
      "columnMapping": {
        "source_id": "id",
        "source_category": "category"
      },
      "mode": "coalesce",
      "resourceSize": "SMALL",
      "timeoutSeconds": 3600
    }'
```

## 步骤 5：验证回填结果\{#validate-migration}

回填完成后，在将生产环境的查询请求切换至新字段前，请确认新字段已正确填充。

首先查询一组具有代表性的 Entity，其中既包含回填处理过的历史 Entity，也包含写入器切换后插入或更新的实体：

```python
results = client.query(
    collection_name="documents",
    filter="id in [1001, 1002, 1003]",
    output_fields=["id", "category"],
)

for result in results:
    print(result)
```

请确认以下内容：

- 历史 Entity 包含新字段中的预期值。

- 在写入逻辑切换之后写入的 Entity 也包含有效值。

- 在回填数据中不再存在意外的空值或不匹配情况。

对于大型数据集，需同时验证整体覆盖范围以及代表性数据，而不仅仅是对 Collection 中的 Entity 进行小范围采样。

仅在新字段满足您的应用需求后，再将回填后的数据接入生产环境。

## 步骤 6：开始查询\{#switch-reads}

在数据回填经验证符合预期后，可以将您应用的查询逻辑切换到新字段。

例如，您可以按如下方式启用我们之前准备好的查询逻辑。

```python
USE_NEW_SCHEMA = True

results = client.query(
    collection_name="documents",
    filter="id in [1001, 1002, 1003]",
    output_fields=get_output_fields(use_new_schema=USE_NEW_SCHEMA),
)
```

如果新字段会改变搜索行为，例如将新的向量字段搭配不同的嵌入模型使用时，请一并切换整个查询逻辑，包括查询模型、目标字段以及相关搜索配置。

在条件允许的情况下逐步推行变更，并在回滚窗口关闭前保留原有查询逻辑的可用性。

## 故障处理与回滚\{#failure-handling-and-rollback}

在数据回填完成验证且回滚窗口期结束前，请保持现有字段与查询逻辑可用。若出现问题，请暂停在生产环境中推送回填数据，并考虑恢复原有查询逻辑。

| **业务阶段** | 建议动作 |
| --- | --- |
| 写入逻辑切换失败 | 保持现有字段的生产查询逻辑不变，并在启动回填前完成写入逻辑的整改。 |
| 预检查失败 | 请勿启动回填任务。在修复源数据或配置后，重新运行预检查。 |
| 数据回填失败 | 保持对现有字段的查询逻辑，修复问题后重新进行回填操作。 |
| 数据验证失败 | 请勿切换查询逻辑。修复缺失、过期或错误的值，然后重新验证。 |
| 新查询逻辑出现回归 | 切换业务流程到原有查询逻辑，同时保持新字段与回填数据完整无损。 |
| 数据回填成功 | 在约定的回滚窗口期内保留现有字段。仅当新链路稳定后，再移除旧字段、索引或应用逻辑。 |

对于会改变查询行为的数据回填操作（例如切换到新的嵌入模型或搜索表示）。在条件允许的情况下，请采用渐进式查询流量切换方案。

回填失败通常无需进行数据回滚，因为生产环境的查询逻辑仍会使用现有字段。主要的回滚节点发生在读取流量切换完成之后，此时最安全的恢复方式通常是将流量重新路由回旧字段，而非删除新数据。

## 后续操作\{#next-steps}

请以此文中讲述的业务流程为基础，适配更具体的 Schema 演进场景。以下操作手册将结合此业务流程，讲解该流程在具体的向量搜索场景中的应用。

import DocCardList from '@theme/DocCardList';

<DocCardList />