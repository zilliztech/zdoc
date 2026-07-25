---
title: "变更日志 | Cloud"
slug: /changelogs
sidebar_key: changelogs
sidebar_label: "变更日志"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "最近更新：2026 年 4 月 11 日 | Cloud"
type: origin
token: JziCwn071iCV1tkX4NZcwGSDnmc
sidebar_position: 1
keywords: 
  - zilliz
  - 向量数据库
  - milvus
  - changelogs
  - 变更日志

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 变更日志

**最近更新**：2026 年 4 月 11 日

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **下次发布**

    </div>

    <div>

        - 外部 Volume 即将上线。

    </div>

</Grid>

## 2026\{#2026}

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2026 年 4 月 11 日](./release-notes-2604)**

    </div>

    <div>

        - 🌎 [全球集群](./global-cluster-explained)现已支持云地域间的灾备能力及相关的平台能力提升。

        - 📈 提供 [Collection 级别的指标监控](./metrics-alerts-reference)

        - 📋 [访问日志进入公测](./access-log-overview)。

        - ⚙️[ 运维窗口](./organization-settings#set-up-preferred-maintenance-window)功能经过重新设计，为您提供更多地升级计划及主动通知。

        - 👥 全新的 [Cluster Admin 角色](./project-users#cluster-admin)为您的团队成员提供部分或所有集群的项目管理员权限。

        - 💾 BYOC 现已支持创建分层存储类型的集群。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2026 年 2 月 9 日](./release-notes-2602#cluster-level-access-control)**

    </div>

    <div>

        - 🔐 集群级别权限控制，为您在[组织](./organization-users#invite-a-user-to-your-organization)和[项目设置](./project-users#invite-a-user-to-a-project)中提供更细粒度的访问控制通力。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2026 年 1 月 29 日](./release-notes-2601#another-milvus-v2.6.x-new-feature)**

    </div>

    <div>

        - 🚀   Milvus v2.6.x 新功能特性在 Zilliz Cloud 上线：

            - [Primary Key Search](./primary-key-search)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2026 年 1 月 23 日](./release-notes-2601#milvus-v2.6.x-new-feature)**

    </div>

    <div>

        - 🚀   Milvus v2.6.x 新功能特性在 Zilliz Cloud 上线：

            - [Semantic Highlighter](./semantic-highlighter)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2026 年 1 月 15 日](./release-notes-2601)**

    </div>

    <div>

        - 🚀   Milvus v2.6.x 新功能特性在 Zilliz Cloud 上线：

            - [TIMESTAMPTZ 类型](./use-timestamptz-field)

            - [Lexical Highlighter](./text-highlighter)

        - 🤖 基于[模型的 Embedding](./model-based-functions) 和[重排序 Function](./model-ranker) 开始公测。

        - 🛠️ [智能动态扩缩容](./scale-query-cu#dynamic-scaling)上线。

        - 📅 基于 Cron 表达式的高级[定时扩缩容](./scale-query-cu#scheduled-scaling)上线。

        - ☁️ BYOC 上线如下功能增强，进一步提升易用性：

            - 全面的集群自动扩缩容能力

            - 技术支持访问控制能力

    </div>

</Grid>

## 2025\{#2025}

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2025 年 12 月 26 日](./release-notes-2512#milvus-v26-ga)**

    </div>

    <div>

        - 🚀   Milvus v2.6.x 功能特性全面可用（GA）

        - 💾  分层存储能力正式发布（GA）并[开始计费](./storage-cost#example-4-cluster-cold-data-access-cost)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2025 年 12 月 1 日](./release-notes-2512#volume-ga-formerly-stage)**

    </div>

    <div>

        - 📦  Stage 功能正式更名为 Volume，并全面可用（GA）

        - 🔐  [组织级别的 IP 白名单](./setup-console-ip-allowlist)能力，丰富您的访问控制方式

        - 🔐  提升 [MFA](./multi-factor-auth) 安全能力，支持基于 TOTP 的 MFA 鉴权

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **2025 年 11 月 26 日**

    </div>

    <div>

        **新区域**：🇸🇬 阿里云新加坡

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2025 年 11 月 6 日](./release-notes-2511#milvus-v26x-new-features)**

    </div>

    <div>

        -  🚀  **Milvus v2.6.x** 更多新功能加入 Zilliz Cloud 公测

            - [Geometry 类型](./use-geometry-field)和

            - [Struct Array](./use-array-of-structs)

        - 🔍   在[迁移时](./via-endpoint#getting-started)可以同步开启 Full-text search 能力。

        - ⏰   为您的集群[设置定时告警间隔时间](./manage-project-alerts#alert-settings)，减少冗余告警信息。

        - 🔧   无须重新创建 Collection 即可[启用 Dynamic Field](./modify-collections#example-4-enable-dynamic-field)。

        - 💳   订阅计划现为项目级设置，而集群则保留原有的部署方案。更多详情，可阅读[Zilliz Cloud 版本对比](./select-zilliz-cloud-service-plans)。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2025 年 10 月 9 日](./release-notes-2510#milvus-v26x-public-preview)**

    </div>

    <div>

        - **🚀   Milvus v2.6.x** 新功能特性在 Zilliz Cloud 公测

            - 不停机[新增字段](./add-fields-to-an-existing-collection)

            - [多语言 Analyzer](./multi-language-analyzers) 和 [Phrase Match](./phrase-match) 增强全文检索能力

            - [JSON 索引](./json-indexing)和 [JSON Shredding](./json-shredding) 加速 JSON 字段内搜索

            - [Boost Ranker](./boost-ranker) 和 [Decay Ranker](./decay-ranker) 优化相似性搜索结果

            - 支持 [INT8_VECTOR 数据类型](./use-dense-vector)

        - 💾   分层存储升级，容量型集群再扩容

        - 🔄  [跨地域备份](./backup-to-other-regions)，业务连续性更添保障

        - ⚙️  [调整索引构建级别](./tune-index-build-level)，为您的场景定制索引构建策略

        - 🚧 Pipeline 功能全面下线

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2025 年 8 月 20 日](./release-notes-2508#autoscaling-upgrade)**

    </div>

    <div>

        - 📈  简单配置，尽享[集群自动扩缩容](./scale-cluster)

        - 📋  [审计日志](./auditing)功能全面可用（GA）

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2025 年 7 月 15 日](./release-notes-2180)**

    </div>

    <div>

        - 🔗  [合并数据](./merge-data) API 实现 Schema 演进

        - 📦  Stage 为数据迁移和导入提供数据层基础能力

        - 📅  [集群定时扩缩容](./scale-cluster)

        - 🔄  从集群备份中跨数据库[恢复部分数据](./restore-from-snapshot#restore-a-partial-cluster)

        - ⚙️  在 Zilliz Cloud 控制台上[创建 JSON Path 索引](./use-json-fields)

        - 💳  包年集群支持阿里云市场、亚马逊云市场支付

        - 🔐  集群恢复时可选恢复集群 RBAC 设置

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2025 年 6 月 9 日](./release-notes-2170)**

    </div>

    <div>

        - 📚  重新设计的数据迁移界面和[最佳实践文档](./migrations)

        - 🚨  [基于策略的告警规则](./manage-project-alerts)

        - ⚙️  控制台支持 [mmap 设置](./use-mmap#global-mmap-strategy)

        - 🤖  重新设计的 AI 助手

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2025 年 4 月 24 日](./release-notes-2150)**

    </div>

    <div>

        - 🔄  不停机数据迁移

        - [⚙️  修改集群副本数量](/reference/restful/modify-cluster-replica-v2)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2025 年 3 月 27 日](./release-notes-2140)**

    </div>

    <div>

        - 📋  [审计日志](./audit-logs)功能上线

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2025 年 2 月 7 日](./release-notes-2130)**

    </div>

    <div>

        - **🚀  Milvus v2.5.x** 新功能特性在 Zilliz Cloud 公测

            - [Full Text Search](./full-text-search)

        - 💳  全新的预付费包年订阅计划

        - 🗂️  增加 [Database](./database) 层级支持

        - 💾  增加 [mmap](./use-mmap) 支持，扩展 Collection 容量

        - 🔐  增加 [Collection 层级 RBAC](./cluster-privileges#collection-level-privilege-groups)

        - [🎯  高精度向量搜索调优](./tune-recall-rate)

    </div>

</Grid>

## 2024\{#2024}

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2024 年 11 月 20 日](./release-notes-2110)**

    </div>

    <div>

        - 🎨  全新的用户界面

        - 🔄  扩大数据迁移来源，包括

            - [Qdrant](./migrate-from-qdrant)

            - [腾讯云 VectorDB](./migrate-from-tencent-cloud-vectordb)

        - 💳  全新账单和支付流程升级

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2024 年 9 月 12 日](./release-notes-2100)**

    </div>

    <div>

        - ☁️  Serverless 集群 GA

        - **🚀  Milvus v2.4.x** 功能上新

            - [稀疏向量](./use-sparse-vector)

            - [多向量混合搜索](./hybrid-search)

            - [增强的元数据过滤和子串匹配](./basic-filtering-operators#range-operators)

            - [Grouping Search](./grouping-search)

            - Float16 和 BFloat 向量字段支持

        - 🔄  [多 Replica 支持](./manage-replica)

        - 📦  数据迁移服务上线，支持如下来源：

            - [Milvus](./migrate-from-milvus)

            - [Elasticsearch](./migrate-from-elasticsearch)

            - [PostgreSQL](./migrate-from-pgvector)

        - 📋  任务管理功能上线

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2024 年 7 月 30 日](./release-notes-291)**

    </div>

    <div>

        - 🛠️  RESTful API v2 上线

        - 🤖  文档聊天机器人上线

        - 📋  任务中心上线

        - 📈  Dedicated 集群自动扩容

        - 🖼️  Pipelines 功能支持图像数据

        - 📊  Pipelines 功能支持估算用量

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2024 年 7 月 5 日](./release-notes-290)**

    </div>

    <div>

        - **🚀  Milvus v2.4.x** 功能上新

            - [稀疏向量](./use-sparse-vector)

            - [多向量混合搜索](./hybrid-search)

            - 倒排索引和模糊查询

            - [Grouping Search](./grouping-search)

            - Float16 和 BFloat 向量字段支持

        - 📊  Pipelines 支持返回资源用量

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2024 年 5 月 30 日](./release-notes-280)**

    </div>

    <div>

        - ☁️  Serverless 集群 Beta

        - 📊  Pipelines 支持多种检索对象，支持利用既有 Collection。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2024 年 4 月 18 日](./release-notes-270)**

    </div>

    <div>

        - 🔌  Pipelines 支持 Connector 和 Rerankers

        - 📊  指标监控支持通过 API 查询

        - 🌐  支持跨云数据导入和数据迁移

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2024 年 2 月 27 日](./release-notes-260)**

    </div>

    <div>

        - **🚀**  Pipelines 功能上线

        - 📥  [数据导入](./data-import-zero-to-hero)支持 Parquet 格式

        - 🔐  [API 密钥](./manage-api-keys)分层控制，支持 RBAC

        - 📊  [指标和告警](./metrics-and-alerts)上新

    </div>

</Grid>

## 2023\{#2023}

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2023 年 12 月 20 日](./release-notes-240)**

    </div>

    <div>

        - [🛠️  Partition SDK](./manage-partitions) 上线

        - [🛠️  集群管理 API 接口](/reference/restful/create-cluster)上线

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2023 年 11 月 23 日](./release-notes-230)**

    </div>

    <div>

        - **🚀  Milvus v2.3.x** 新功能在 Zilliz Cloud 公测

            - [Range Search](./range-search)

            - [Upsert Entity](./upsert-entities)

            - [Cosine 相似度类型](./search-metrics-explained)

            - [访问控制](./access-control)

            - [查询结果返回原始向量](./single-vector-search)

            - [JSON_CONTAINS 运算符](./json-filtering-operators)

            - [Entity 计数](./count-entities)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2023 年 10 月 17 日](./release-notes-221)**

    </div>

    <div>

        - ⚙️  集群增强：引入新 CU，提升灵活性

        - [💳  现金充值](./advance-pay)功能上线

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2023 年 9 月 19 日](./release-notes-220)**

    </div>

    <div>

        - [🔄  ](./offline-migration)[Zilliz Cloud 集群间数据迁移](./offline-migration)

        - [🔄  ](./migrate-from-elasticsearch)[从 Elasticsearch 迁移](./migrate-from-elasticsearch)

        - [📥  ](./data-import)[数据导入](./data-import)能力增强，支持导入目录和任务监控

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2023 年 8 月 21 日](./release-notes-210)**

    </div>

    <div>

        - [🛠️  ](./manage-partitions)[RESTful API 接口](/reference/restful)开放

        - 🛒  Zilliz Cloud 在[阿里云云市场上线](./subscribe-on-aliyun-marketplace)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **[2023 年 6 月 14 日](./release-notes-200)**

    </div>

    <div>

        - 💳  提供企业版和专有部署订阅方案

        - ⚙️  提供性能型、容量型和经济型三种 CU 类型

        - 👥  组织管理、项目协作和[访问控制](./access-control-overview)

        - 🏷️  支持 [Partition Key](./use-partition-key)

        - 📝  支持 [Dynamic Field](./enable-dynamic-field)

    </div>

</Grid>

