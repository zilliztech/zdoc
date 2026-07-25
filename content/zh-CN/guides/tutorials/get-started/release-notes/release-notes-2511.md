---
title: "版本说明书（2025/11） | Cloud"
slug: /release-notes-2511
sidebar_key: release-notes-2511
sidebar_label: "2025/11"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "版本说明书（2025/11） | Cloud"
type: origin
token: OzmBwYXzjiOFXlkqQxYc9Y0knWb
sidebar_position: 6
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 版本说明书（2025/11）

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-11-06**

    </div>

    <div>

        ## Milvus  v2.6.x 新特性加入 Zilliz Cloud 公测\{#milvus-v26x-new-features}

        - **Geometry 类型支持**：存储和查询如 POINT、LINESTRING 或 POLYGON 等复杂的空间形状来进行地理信息检索，适用于地理围栏、路由导航和地图类应用。更多内容，可参考[Geometry 类型](./use-geometry-field)。

        - **Struct Array 支持**：更自然地为多层嵌套和属性繁多的数据建模，简化 Schema 设计，提升元数据丰富的 AI 工作负载的查询能力。更多内容，可参考 [Struct Array](./use-array-of-structs)。

        - **在现有 Collection 上开启 Dynamic Field**：自本次发布起，您无需重新创建 Collection，即可为现有 Collection 启用 Dynamic Field，灵活应对业务属性的动态扩展。更多内容，可以阅读[修改 Collection](./modify-collections#example-4-enable-dynamic-field)。

        - **支持在加载状态下删除标量索引** — 允许在 Collection 处于加载状态时删除和重建标量索引。

        ## 订阅计划提升至项目级别\{#plan-moved-to-the-project-level}

        本次发布后，所有订阅计划将统一提升到项目级别进行管理，以提升配置一致性并简化能力治理流程，这对于同时运行多个集群的组织尤为重要。您现有的工作负载、使用能力和计费将保持不变，无需进行任何配置调整。

        发布后创建的新项目需选择订阅计划。目前控制台支持自行创建 Dedicated 版本；如需 BYOC 版本，欢迎[联系销售](http://zilliz.com.cn/contact-sales)咨询。

        在项目内，新创建的集群可选择不同的部署方案，包括 Free、Serverless 和 Dedicated。

        关于订阅计划与集群部署方案的更多信息，请参阅文档  [Zilliz Cloud 版本对比](./select-zilliz-cloud-service-plans)。

        ## 更多增强\{#enhancements}

        - **在迁移过程中开启 Full-Text Search**：现在您可以在从包括 Milvus 在内的各类流行的向量数据库向 Zilliz Cloud 迁移过程中开启并配置 Milvus 提供的基于 BM25 算法的 Full-Text Search 功能。更多内容，可参考[通过 Endpoint 从 Milvus 迁移至 Zilliz Cloud](./via-endpoint#getting-started) 和 [外部迁移概述](./external-migration-basics#configure-full-text-search)。

        - **为告警设置间隔时间**：您可以定制告警通知的发送间隔来抵制重复告警的接收，避免告警信息产生打扰。当前，新告警发送间隔时间默认为 1 小时。更多内容，可以阅读[管理项目告警](./manage-project-alerts#alert-settings)。

    </div>

</Grid>
