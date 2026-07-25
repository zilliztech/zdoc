---
title: "版本说明书（2025/12） | Cloud"
slug: /release-notes-2512
sidebar_key: release-notes-2512
sidebar_label: "2025/12"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "版本说明书（2025/12） | Cloud"
type: origin
token: RkDPw7UlzivLdbkTSXecdUYEnbe
sidebar_position: 5
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 版本说明书（2025/12）

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2025 年 12 月 26 日**

    </div>

    <div>

        ## Milvus v2.6 GA\{#milvus-v26-ga}

        本次发布标志着 Milvus v2.6.x 达成重要里程碑，实现了可用于生产的稳定性和所有特性在 Zilliz Cloud 上的全面可用。这些特性包括 Geometry、Struct Array、TimestampTz 等新的数据类型、向已有 Collection 添加字段、进一步强化的 Full-text Search，不断提速的 JSON 过滤能力、新的 Reranking Function、INT8 向量支持、合并模式的 Upsert 以及适用于 Binary 向量字段的 MINHASH_LSH 索引。

        分层存储能力达成 GA，引入了全新升级的热、温、冷数据架构，并开始对冷数据的访问计费。更多详情，可参考[存储费用](./storage-cost#example-4-cluster-cold-data-access-cost)。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2025 年 12 月 10 日**

    </div>

    <div>

        ## 功能增强\{#enhancements}

        - Milvus Endpoint 迁移支持 Geometry 与 Struct 类型，可无缝迁移包含空间形状与多层嵌套字段的集合

        - 账单支持展示“现金余额”展示，帮助用户清晰查看预付金额的使用情况与剩余额度

        - RESTful API 支持自动扩缩容配置，便于以编程方式管理集群弹性策略

        - JobCenter 提供更详细的进度展示，让用户更直观了解任务状态与执行阶段

        - 注册流程优化，通过精简表单提升新用户注册效率与整体体验

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2025 年 12 月 1 日**

    </div>

    <div>

        ## Volume GA（曾用名 Stage）\{#volume-ga-formerly-stage}

        本次发布也带来了 **Stage** 特性的 GA，并将该特性正式命名为 **Volume**。作为托管在 Zilliz Cloud 上用于存储结构化表格及非结构化数据 Collection 的存储对象，Volume 将成为可扩展数据接入和 ETL 工作流的统一数据层。

        本次发布带来的新特性包括：

        - **Volume 级别的 RBAC**

            针对 Volume 的读写操作提供细粒度、多角色的访问控制。

        - **Console 操作支持**

            您可以在 Zilliz Cloud 控制台上直接创建、管理和监控 Volume。

        -  **阿里云支持**

            当前您可以在阿里云上管理您的 Volume，为您的多云业务提供必要的灵活性。

        本次发布后，Volume 将支持如下两种计费方式：免费试用 Volume 以及按量计费 Volume。其中，按量计费版本将基于您的存储用量进行计费。

        更多内容，可参考了解 Volume、管理 Volume (SDK) 以及管理 Volume (控制台)。

        ## 组织级 IP 白名单\{#organization-level-ip-access-allowlist}

        为了进一步提升数据安全水平、满足企业合规要求，Zilliz Cloud 为 Dedicated 企业版集群提供组织级别的 IP 白名单设置。

        - **细粒度访问控制**

            组织 Owner 可以定义可信的 IPv4 地址或 CIDR 地址段，以限制控制台访问的范围。来自未列出地址的访问将被阻止。

        - **丰富的审计信息**

            记录白名单的全生命周期事件，包括启用、禁用及规则变化等。您可以在 Zilliz Cloud 的审计日志查看详细信息。

        更多内容，可以参考[设置控制台 IP 白名单](./setup-console-ip-allowlist)。

        ## MFA 安全升级\{#mfa-security-upgrade}

        Zilliz Cloud 现已支持 TOTP MFA，为您的数据提供更强的防护能力。您可以使用 Google Authentication 或 Microsoft Authentication 等 TOTP MFA 工具管理您的 MFA。

        - **组织级别安全强化**

            企业版订阅计划管理员可以决定是否强制要求组织成员使用 MFA，确保企业合规。

        - **支持从原有方式迁移**

            原有的基于邮件地址的 MFA 即将下线，您将收到相关信息。请按照提示迁移到您选择的 TOTP MFA 工具。

        更多内容，可以参考[管理 MFA](./multi-factor-auth)。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2025 年 11 月 26 日**

    </div>

    <div>

        ## 支持阿里云新加坡区\{#}

    </div>

</Grid>
