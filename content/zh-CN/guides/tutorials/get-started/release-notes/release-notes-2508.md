---
title: "版本说明书（2025/08） | Cloud"
slug: /release-notes-2508
sidebar_key: release-notes-2508
sidebar_label: "2025/08"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "版本说明书（2025/08） | Cloud"
type: origin
token: RymVwbgxOiSKsDk60xtc8CXOn3c
sidebar_position: 8
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 版本说明书（2025/08）

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2025-08-20**

    </div>

    <div>

        ## 自动扩缩容升级\{#autoscaling-upgrade}

        **我们将对 Zilliz Cloud 中的自动扩缩容功能进行重大升级，以提供更好的自动化资源管理体验。** 以下是主要改进：

        - **智能自动扩缩容**：您将不再需要手动设置扩容的容量阈值。我们的系统将根据实时工作负载需求自动确保最佳性能和资源利用率。

        - **支持自动缩容**：一项备受期待的功能现已推出！新的自动扩缩容功能将支持在低负载期间自动缩容，无需人工干预即可优化成本。

        - **简化配置**：现在您只需设置最小和最大 CU 大小。Zilliz Cloud 随后将自动管理在这些边界内的伸缩，以平衡可用性和资源利用率。

        ## 审计日志 GA\{#audit-log-ga}

        随着本次发布，我们很高兴地宣布审计日志正式**全面可用（GA）**，并且现在通过**阿里云**托管的集群均已支持。

        审计日志提供集群内用户活动的详细记录，帮助您**提高安全性**、**确保合规性**，并**更高效地排查问题**。通过对从查询/搜索到数据管理操作、从连接事件到用户或角色变更等操作的全面可见性，审计日志使您能够监控数据访问、检测异常行为，并**满足企业治理和合规要求**。

        从GA版本开始，审计日志将成为**付费功能**。若要启用该功能，请选择**企业版** **Dedicated 集群**。

        有关使用详情，请参阅[审计日志用户指南](./audit-logs)。

        如需定价信息，请参阅[定价指南](http://zilliz.com.cn/pricing/pricing-guide)。

        ## 功能增强\{#enhancements}

        - 你可以**通过SDK（Python、Java）管理 Stage 的整个生命周期**。通过SDK创建 Stage 后，你可以无缝上传文件并处理工作流，使开发更加顺畅和高效。

        - 您可以直接**通过图形用户界面（GUI）导入 Parquet 格式的本地文件**，进一步扩展了支持的格式，使其超越了 JSON，从而更便于处理大型数据集并简化数据接入流程。

        - **从 Milvus 备份文件迁移**现在支持选择特定的 Database 和 Collection，让您在将数据从本地 Milvus 迁移到云端时更具灵活性和精准性。

        - 您可以在 Zilliz 控制台上查看与 Collection 关联的所有别名，从而更轻松地管理和跟踪别名的使用情况。

        - Zilliz 的 Terraform Provider 现在支持在 BYOC 数据面上管理集群。你可以使用 Terraform 在 BYOC 项目中创建、更新和删除集群。

        - 您可以在用量页面将使用详情导出为 CSV。我们还改进了用户体验，使数据分析和存档更加便捷。

        - 计费配置文件中的电子邮件地址现在可以接收计费通知，确保您的财务团队随时了解最新情况。

        ## 弃用特性公告\{#deprecation-notice}

        - 导入 NumPy 文件现已进入功能废弃前通知阶段。

    </div>

</Grid>

