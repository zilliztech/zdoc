---
title: "版本说明书（2026/06） | Cloud"
slug: /release-notes-2606
sidebar_label: "2026/06"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: IEqzwRohQiApM6kTrMLccyWcncb
sidebar_position: 3
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 版本说明书（2026/06）

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-06-24**

    </div>

    <div>

        ## 功能增强（Enhancements）\{#enhancements}

        我们升级了定时备份功能，您现在可以启用高级定时备份设置更加灵活地调整您的备份计划。

        - **多路定时备份逻辑**：在同一条备份策略里配置多层独立的定时备份计划，从而使得您通过组合不同的备份频率（如，忙时按小时备份、闲时按天备份），优化您的数据恢复点目标（RPO）。

        - **基于 Cron 表达式的高级定时备份能力**：在基础的按天备份逻辑之外，我们还提供了业界通用的 Cron 表达式（如，`0 9 * * 1-5`）来帮助您更加灵活地定义备份策略。

        更多内容，可以参考[设置定时自动备份](./schedule-automatic-backups)。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-06-17**

    </div>

    <div>

        ## 功能增强（Enhancements）\{#enhancements}

        - **备份恢复支持选择大版本** — 从 30 天内创建的备份恢复集群时，您现在可以选择目标 Milvus 大版本。例如，将 2.5.x 备份恢复为 2.5.x 集群，而无需强制升级到 2.6.x——这对需要版本一致性的灾备场景尤为重要。更多详情，请参考[恢复备份](./restore-from-backup-files)及[回收站](./use-recycle-bin)。

        - **集群、项目及 API 密钥支持描述字段** — 您现在可以通过 RESTful API 为集群、项目和 API 密钥添加和更新描述信息，便于管理和识别大规模资源。

        - **控制台支持多向量搜索** — Zilliz Cloud 控制台的搜索页面现已支持多向量搜索，您可以直接在 UI 中对多个向量字段执行混合搜索。

        - **支持查看计费用量趋势** — Billing 现已支持 Usage 视图，可按计费类别查看用量趋势，例如 Serverless vCU Read / Write 用量。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-06-03**

    </div>

    <div>

        ## Nullable Vector（向量字段可空）\{#nullable-vector}

        向量字段现已支持 `nullable` 属性，这意味着您可以为已有 Collection 新增向量字段——这是众多用户期待已久的能力。借助 Nullable Vector，您可以在 Collection 创建后动态演进 Schema、按需添加向量列，然后在 Collection 正常运行的同时逐步回填 embedding 数据。

        <Admonition type="info" icon="📘" title="**说明**">

        Nullable Vector 需要 Serving Cluster 升级至最新的 Milvus 2.6.x 版本。On-Demand Cluster 运行的 Milvus 3.0.x 已支持该功能。未升级至最新版本的 Serving Cluster 不支持 Nullable 向量字段。

        </Admonition>

        该能力覆盖全部六种向量类型——`FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR`、`BINARY_VECTOR` 及 `SPARSE_FLOAT_VECTOR`。主要特性：

        - **为已有 Collection 添加向量字段** — 通过 `AddCollectionField` 在线新增可空向量列，无需重建数据。现有实体的新向量字段初始为 NULL，可随后增量回填。

        - **搜索自动跳过** — NULL 向量在索引构建和搜索中会被自动跳过，不影响召回质量。

        - **近零存储开销** — NULL 向量几乎不占用存储空间，适合存储尚无 embedding 的实体。

        - **全流程覆盖** — Nullable Vector 已覆盖创建 Collection、Add Field、数据预览、Import、备份恢复及 Migration 等流程。

        更多详情，请参考 [Nullable 属性](./nullable-fields) 及 为已有 Collection 添加字段。

        ## 功能增强（Enhancements）\{#enhancements}

        - **按需计算支持私网连接（Private Endpoint）** — On-Demand Compute 现已支持 Private Endpoint，可通过私有网络安全访问按需搜索工作负载。设置流程与 Serving Cluster 一致。更多详情，请参考 [配置 Private Endpoint](./aliyun-private-link)。

        - **数据预览增强** — 数据预览页面现已支持 Upsert 就地编辑单条记录、一键插入 10、50 或 100 条样例记录，以及无限翻页流畅浏览大规模数据集。

        - **创建 Collection：字段配置重新设计** — 更直观的字段配置布局，使 Schema 设置更快捷。更多详情，请参考[管理 Collection（控制台）](./manage-collections-console)中的“创建 Collection”-“Collection Schema”章节。

    </div>

</Grid>

