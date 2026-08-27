---
title: "版本说明书（2026/07） | Cloud"
slug: /release-notes-2607
sidebar_label: "2026/07"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: F5GVwlcfjiYBK0kSxfDcpas7n8b
sidebar_position: 2
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 版本说明书（2026/07）

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-07-30**

    </div>

    <div>

        ## 功能增强（Enhancements）\{#enhancements}

        - **BYOC 现已支持按需计费** - BYOC 组织在 vCPU 用量超限后可以继续扩容。这部分超限的用量将计入按需计费，并呈现在您的用量和账单中。更多内容，可参考[了解 BYOC 账单](https://docs.zilliz.com.cn/docs/byoc/understand-byoc-billing)。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-07-21**

    </div>

    <div>

        ## BYOC 支持存储集成及外部 Volume\{#byoc-supports-storage-integrations-and-external-volumes}

        BYOC 现已支持存储集成和外部 Volume 功能。您现在可通过跨账号授权集成对象存储存储桶，并将其设置为外部 Volume。

        - 基于 RAM/IAM 的授权：无需嵌入长期云凭证，即可通过 RAM/IAM 对存储桶访问进行授权。

        更多内容，可以查看[阿里云对象存储](./integrate-with-alibaba-cloud-oss)、[Amazon S3](./integrate-with-amazon-s3-cn)及[External Volume](./external-volume)。

        ## BYOC 支持使用 API 密钥进行集群访问\{#byoc-supports-api-key-for-cluster-access}

        您现在可以通过集群端点搭配 API 密钥访问该集群，同时也支持具备集群级细粒度访问控制的自定义 API 密钥。

        更多内容，可以查看[API 密钥](./manage-api-keys)。

        ## On-demand 集群 Collection 级监控指标\{#collection-level-metrics-for-on-demand-clusters}

        On-demand 集群现已在 Web 控制台中提供 Collection 级性能指标，包括延迟和QPS，让您能够更精准地隔离工作负载并排查单个 Collection 的问题。

        更多内容，可以查看[指标快速参考](./metrics-alerts-reference)。

        ## 按需计算及付费 Volume 涉及的存储能力及其账单\{#storage-and-storage-request-billing-for-on-demand-databases-and-paid-volumes}

        Vector Lakebase 现已针对阿里云上的按需计算能力按实际使用计量并收取存储费用。按需计算及付费 Volume 的存储请求均会产生费用明细，让你能更清晰地了解构成存储资源及相关操作的成本。

        更多内容，可以查看[按需计算费用](./on-demand-compute-cost)及[存储费用](./storage-cost)。

        ## 通过 RESTful API 管理存储集成\{#manage-storage-integrations-through-restful-apis}

        现在您可以通过 RESTful API 以编程方式管理存储集成。该 API 支持创建、列出、查看、验证和删除集成，并可在 RESTful API、CLI 与 Terraform 之间统一自动化工作流。

        更多内容，可以查看[存储集成操作](https://docs.zilliz.com.cn/reference/restful/storage-integration-operations-v2)及[阿里云对象存储](./integrate-with-alibaba-cloud-oss#create-storage-integration-programmatically)。

        ## 用户和角色相关接口及操作界面提供描述字段\{#add-descriptions-to-users-and-roles}

        现在您可以为集群用户和角色添加并查看描述，更便于识别和管理权限。

        更多内容，可以查看：

        - [管理集群用户（控制台）](./cluster-users)

        - [管理集群用户（SDK）](./cluster-users-sdk)

        - [管理集群角色（控制台）](./cluster-roles)

        - [管理集群角色（SDK）](./cluster-roles-sdk)

        ## 功能增强\{#enhancements}

        - **更高的规模限制**：最大 Replica 数现在为 100，Dedicated 集群的 Query CU 限制现在为 2,048。有关详细信息，请参阅[使用限制](./limits)。

        - **为按需集群自定义自动挂起设置**：您现在可以在创建按需集群后，修改其自动挂起间隔。随着工作负载模式的变化，这一功能让您能更灵活地在查询就绪度与闲置计算成本之间把控平衡。详情请参阅[创建 On-Demand 集群](./on-demand-cluster)。

        - **功能引导优化**：全新的产品内引导功能可帮助用户更轻松地发现并配置跨区域备份。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-07-07**

    </div>

    <div>

        ## 功能增强（Enhancements）\{#enhancements}

        - **On-Demand 集群区域覆盖扩展** — On-Demand 集群现已开通阿里云所有区域，与 Serving Dedicated 支持区域对齐。

    </div>

</Grid>

