---
title: "CollectionSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "CollectionSchema 实例表示 Collection 的 Schema。Schema 勾勒出 Collection 的结构。 | Python | MilvusClient"
type: docx
token: SSiodq10FoH26hx2HlccfcAgnje
sidebar_position: 2
keywords: 
  - Chroma 向量 Database
  - NLP 搜索
  - LLM 幻觉
  - 多模态搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - CollectionSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# CollectionSchema

**CollectionSchema** 实例表示 Collection 的 Schema。Schema 勾勒出 Collection 的结构。

## 请求语法\{#request-syntax}

```python
class pymilvus.CollectionSchema
```

**参数：**

- **fields**（*list*）-

    **[必填]**

    由 FieldSchema 对象组成的列表，用于定义 Collection Schema 中的字段。字段 Schema 表示并包含单个字段的元数据，而 CollectionSchema 会将一组 FieldSchema 对象组合起来，以定义完整的 Schema。

- **description**（*string*）-

    Schema 的说明。如果未提供说明，则会将其设置为空字符串。

- **external_source**（*str*）-

    外部源 URI，类似于 AWS S3 对象路径。

- **external_spec**（*str*）-

    外部源规范，是一组次级参数：format（str）：目标源数据文件的格式。可选值为 parquet、vortex、lance-table 和 iceberg-table。snapshot_id（str）：Iceberg 表的 ID。仅当 format 为 iceberg-table 时适用。extfs（string）：字符串化 JSON 结构中的外部文件系统设置。可选选项如下：access_key_id（string）：您的对象存储服务的访问密钥 ID。access_key_val（string）：您的对象存储服务的访问密钥值。cloud_provider（string）：您的对象存储服务的云提供商。region（string）：您的对象存储服务的区域。use_iam（string）：是否使用 AWS IAM 进行桶访问身份验证。可选值为 "true" 或 "false"。iam_endpoint（string）：AWS IAM STS Endpoint。use_ssl（string）：是否使用 SSL 访问对象存储桶。可选值为 "true" 或 "false"。use_virtual_host（string）：是否使用虚拟主机进行桶访问。有关详细信息，请参阅本文。storage_type（string）：存储类型。可选值为 remote。role_arn（string）：从桶所有者处获取的 AWS IAM Role ARN。external_id（string）：从桶所有者处获取的外部 ID。load_frequency（string）：Milvus 检索临时身份验证凭据的间隔，以秒为单位。

- **kwargs**（*Any*）-

    自动递增的相关选项，auto_id（bool）：是否允许主字段自动递增。将此参数设置为 True 会使主字段自动递增。此时，插入的数据中不应包含主字段，以避免出错。此参数不适用于外部 Collection。enable_dynamic_field（bool）：如果插入目标 Collection 的数据包含 Collection 的 Schema 中未定义的字段，Milvus 是否允许将这些未定义字段的值保存在动态字段中。将此参数设置为 True 时，Milvus 会创建一个名为 &#36;meta 的字段，用于存储插入数据中任何未定义的字段及其值。此参数不适用于外部 Collection。如果插入目标 Collection 的数据包含 Collection 的 Schema 中未定义的字段，这些字段将作为键值对保存在动态字段中。primary_field（str）：主字段的名称。该值应为 fields 中列出的字段名称。或者，您可以在创建 FieldSchema 对象时设置 is_primary。此参数不适用于外部 Collection。partition_key_field（str）：用作 Partition key 的字段名称。该值应为 fields 中列出的字段名称。设置此项后，Milvus 会管理当前 Collection 中的所有 Partition。或者，您可以在创建 FieldSchema 对象时设置 is_partition_key。此参数不适用于外部 Collection。将某个字段指定为 Partition key 后，Milvus 会为此字段中的每个唯一值自动创建一个 Partition，并相应地将 Entity 保存在这些 Partition 中。这在实现基于特定键的数据隔离（例如面向 Partition 的多租户）时特别有用。或者，您可以在创建 CollectionSchema 对象时设置 partition_key_field。partition_key_isolation（bool）：是否启用 Partition key 隔离，以进一步提升对 Partition key 进行标量过滤时的搜索性能。有关详细信息，请参阅使用 Partition Key Isolation。此参数不适用于外部 Collection。

**返回类型：**

*CollectionSchema*

**返回：**

一个 CollectionSchema 对象。

**异常：**

- **FieldsTypeException**

    当 **fields** 参数不是列表时，将抛出此异常。当 **fields** 参数不是列表时，将抛出此异常。

- **FieldTypeException**

    当 **fields** 列表中的字段不是 **FieldSchema** 对象时，将抛出此异常。当 **fields** 列表中的字段不是 **FieldSchema** 对象时，将抛出此异常。

- **PrimaryKeyException:**

    在以下情况下会抛出此异常。在以下情况下会抛出此异常。

- **PartitionKeyException:**

    在以下情况下会抛出此异常。在以下情况下会抛出此异常。

- **AutoIDException:**

    当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以获取确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType

# Define fields in a schema
primary_key = FieldSchema(
    name="id",
    dtype=DataType.INT64,
    is_primary=True,
)

vector = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=768
)

# Construct a schema with the predefined fields
schema = CollectionSchema(
    fields=[primary_key, vector],
    description="example_schema"
)
```

- **external_source**（*str*）-

    外部源 URI，应为指向可访问外部卷的 `volume://` URI。例如，`volume://<volume-name>/path/to/folder/`。

- **external_spec**（*str*）-

    外部源规范，是一组次级参数：

    - **format**（*str*）-

        目标源数据文件的格式。

        可选值为 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。

    - **snapshot_id**（*str*）-

        Iceberg 表的 ID。仅当 `format` 为 `iceberg-table` 时适用。

    
