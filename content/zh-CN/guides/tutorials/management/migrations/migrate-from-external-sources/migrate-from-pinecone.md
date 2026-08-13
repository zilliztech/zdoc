---
title: "从 Pinecone 迁移至 Zilliz Cloud | Cloud"
slug: /migrate-from-pinecone
sidebar_label: "从 Pinecone 迁移至 Zilliz Cloud"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Pinecone 是一款支持相似搜索的向量数据库。将数据从 Pinecone 迁移至 Zilliz Cloud，可以增强稠密和稀疏向量的管理能力，同时利用 Zilliz Cloud 高性能的搜索与分析能力。 | Cloud"
type: origin
token: MjDcwfnLMiVRYVkFSqTckwQbnmc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 从 Pinecone 迁移至 Zilliz Cloud

Pinecone 是一款支持相似搜索的向量数据库。将数据从 Pinecone 迁移至 Zilliz Cloud，可以增强稠密和稀疏向量的管理能力，同时利用 Zilliz Cloud 高性能的搜索与分析能力。

## 注意事项\{#considerations}

- 在将数据从 Pinecone 迁移至 Zilliz Cloud 时，向量字段会直接迁移，而 Pinecone 的元数据字段将以 JSON 格式存储在 Zilliz Cloud 的动态字段中。有关动态字段功能的详细信息，请参阅[Dynamic Field](./enable-dynamic-field)。

- 本迁移仅支持 Pinecone 的 Serverless Index。

- 每次迁移任务仅限于单个源 Index。如果有多个源 Index，可为每个 Index 单独设置迁移任务。

## 开始前\{#before-you-start}

- Pinecone Index 必须能够通过公网访问。

- 如果您的网络环境配置了白名单列表，请确保将 Zilliz Cloud 的 IP 地址添加到其中。要了解更多信息，请参考 [Zilliz Cloud IP](./zilliz-cloud-ips)。

- 已获取访问目标 Pinecone 项目的 API 密钥。

- 已在 Zilliz Cloud 中获得组织管理员或项目管理员权限。如果您没有相关权限，请联系您的 Zilliz Cloud 管理员。

- 确保目标集群的 CU 容量足以容纳源数据。要估算所需的 CU 规格，请使用[计算器](https://zilliz.com.cn/pricing#calculator)。

## 从 Pinecone 迁移至 Zilliz Cloud\{#migrate-from-pinecone-to-zilliz-cloud}

![zh_migrate_from_pinecone](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/zhmigratefrompinecone.png "zh_migrate_from_pinecone")

您可以将源数据迁移到任何版本类型的 Zilliz Cloud 集群，只要其计算单元（CU）大小能够满足源数据的存储需求。

<Procedures>

1. 登录 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)。

1. 进入目标项目，选择**数据迁移** > **Pinecone**。

1. 在**连接数据源**步骤中，输入访问目标 Pinecone 项目的 API 密钥，然后点击**下一步**。

    <Admonition type="info" icon="📘" title="说明">

    阅读 [Authentication](https://docs.pinecone.io/reference/api/authentication) 文档将帮助您获取所需的连接信息。

    </Admonition>

1. 在**选择迁移来源和目标步骤**中，配置源 Pinecone Index 和 Zilliz Cloud 集群设置，点击**下一步**。

    <Admonition type="info" icon="📘" title="说明">

    每个从 Pinecone 迁移的源 Index 必须包含一个向量字段。

    </Admonition>

1. 在**配置 Schema** 步骤中：

    1. 在 **Schema 预览**中，确认 Pinecone Index 与 Zilliz Cloud Collection 之间的字段映射。

        <Admonition type="info" icon="📘" title="说明">

        - Auto ID 禁用且无法修改。
        
        - Pinecone 的记录 ID 将映射为 Zilliz Cloud 中的主键字段，数据类型为 `VARCHAR`，最大长度为 1 至 65,535 字节。在插入或 Upsert 数据时，确保 `VARCHAR` 字段长度在此取值范围内。
        
        - 您可以重命名字段，但不支持修改字段的数据类型。

        </Admonition>

    1. 在**高级设置**中，确认**动态列**和 **Partition Key** 的设置：

        - **动态列**：默认启用且不可修改。它用于存储源 Index 的元数据字段。

        - **Partition Key**：默认启用。启用后，Zilliz Cloud 会将 Pinecone 的 Namespace 映射到 Partition Key；禁用后，则会将其映射到 Partition。建议保持此功能启用。在此状态下，`namespace` 会作为目标 Collection Schema 中的标量字段，数据类型为 `VARCHAR`。更多信息，请参考[管理 Partition](./manage-partitions) 和[使用 Partition Key](./use-partition-key)。

    1. 在**目标 Collection 名称和描述**中，自定义目标 Collection 的名称和描述。Collection 名称在每个集群中必须唯一。如果名称与现有 Collection 重复，请重命名 Collection。

1. 点击**迁移**。

</Procedures>

## 查看迁移进度\{#monitor-the-migration-process}

生成迁移任务后，您可前往[任务中心](https://docs.zilliz.com.cn/docs/job-center)查看任务状态和进度。如果迁移任务的状态从**进行中**变更为**成功**，则代表迁移成功。

<Admonition type="info" icon="📘" title="说明">

迁移完成后，请验证目标集群中的 collection 和 entity 数量是否与数据源一致。如果发现不一致，请删除缺失 entity 的 collection 并重新进行迁移。

</Admonition>

![view_migration_progress_cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/viewmigrationprogresscn.png "view_migration_progress_cn")

## 取消迁移任务\{#cancel-migration-job}

如果迁移过程遇到任何问题，您可以采取以下步骤进行故障排除并恢复迁移：

<Procedures>

1. 在**任务中心**页面，取消失败的迁移任务。

1. 在**操作**列点击**查看详情**以访问日志信息。

</Procedures>