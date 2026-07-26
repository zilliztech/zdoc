---
title: "Snapshot | Cloud"
slug: /snapshots
sidebar_label: "Snapshot"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Snapshot 是 Milvus Collection 在某一时间点的镜像，适用于快速回滚、版本管理和测试。它会捕获 Collection 在指定时间戳的状态，并且只保存 metadata 和 manifest 文件，例如 Schema、Index 以及向量数据文件（binlogs），从而提升存储和恢复效率。 | Cloud"
type: origin
token: Km9nwfLWti2GZNkLtbnc8fcVnId
sidebar_position: 15
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Snapshot

Snapshot 是 Milvus Collection 在某一时间点的镜像，适用于快速回滚、版本管理和测试。它会捕获 Collection 在指定时间戳的状态，并且只保存 metadata 和 manifest 文件，例如 Schema、Index 以及向量数据文件（binlogs），从而提升存储和恢复效率。

<Admonition type="info" icon="📘" title="说明">

Snapshots 是快速生成的数据时间点镜像，适用于快速回滚或测试（**数天到数周**）。相比之下，Backup 是独立、完整、单独存储的数据副本，适用于长期灾难恢复（**数周到数年**），也能更好地防范对象存储整体故障。

如需创建 Backup，请参考 Backup & Restore。

</Admonition>

## Snapshot 结构 \{#snapshot-anatomy}

Milvus 使用基于 manifest 的 Snapshot 架构，在不复制实际向量数据的情况下，高效完成数据的时间点捕获、存储和恢复。该架构将 metadata 管理与物理数据存储解耦，使轻量级 Snapshot 可以引用对象存储中已有的 Segment 文件。

为 Collection 创建 Snapshot 时，Milvus 会收集以下信息：

- **Snapshot metadata**：提供创建 Snapshot 所需的基础信息，包括 Snapshot 名称和描述、目标 Collection ID，以及创建 Snapshot 的时间点。

- **Collection description**：包含目标 Collection 的描述信息，包括 Schema 定义、Partition 信息和属性。

- **Index information**：存储 Index metadata 以及 Index 文件路径。

- **Segment data**：捕获向量数据文件（binlogs）、删除日志（deltalogs）和 Index 文件。

在上述信息中，Milvus 会为每个 Segment 生成一个 Apache Avro manifest 文件，并将 Snapshot metadata、Collection description、Index information 以及 manifest 文件路径存储在 JSON 文件中。下面展示了 Snapshot 文件夹结构。

```python
snapshots/{collection_id}/
├── metadata/
│   └── {snapshot_id}.json         # Snapshot metadata（JSON 格式）
│
└── manifests/
    └── {snapshot_id}/             # 每个 Snapshot 对应一个目录
        ├── {segment_id_1}.avro    # 单个 Segment manifest（Avro 格式）
        ├── {segment_id_2}.avro
        └── ...
```

创建 Snapshot 通常只需毫秒级时间；恢复 Snapshot 通常需要数秒到数分钟，具体取决于数据量。

## 存储影响与注意事项 \{#storage-impacts-and-considerations}

一旦 Milvus 在 Snapshot 中引用某个 Segment 或 Index 文件，除非你删除该 Snapshot，否则 Milvus 不会对这些文件执行垃圾回收。Snapshots 消耗的存储空间与目标 Collection 的规模相关，保留 Snapshot 也会产生对象存储费用。在极端情况下，单个 Snapshot 甚至可能使对象存储成本翻倍。建议你：

- 定期删除旧 Snapshot，以节省存储空间。

- 使用具有描述性的名称和说明，方便后续查找。

- 始终验证 Snapshot 的创建和恢复结果。

- 跟踪 Snapshot 创建时间戳和存储用量。

- 保存恢复任务 ID，便于监控和排查问题。

## 限制与约束 \{#limits-and-restrictions}

- Snapshot 创建后不可变。

- Snapshot 只能恢复到原始 Collection 所在同一 Cluster 内的新 Collection。

- 恢复后的 Collection 会保留相同的 Schema、Shard 数量和 Partition 数量。

- 恢复出的历史数据可能与 TTL 策略冲突。建议在创建 Snapshot 前禁用 TTL 或调整 TTL 设置。

## 相关阅读 \{#further-readings}

import DocCardList from '@theme/DocCardList';

<DocCardList />