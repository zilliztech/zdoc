---
title: "版本说明书（2026/10） | Cloud"
slug: /release-notes-2610
sidebar_label: "2026/10"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: AmAGw7C78ir35FkC0n6c6cEGnBd
sidebar_position: 2
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 版本说明书（2026/10）

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-10-19**

    </div>

    <div>

        ## 数据回填 | ON REQUEST \{#data-back-fill}

        从 Zilliz Cloud 存储卷中的 Parquet 文件批量更新现有实体的选定字段，例如填充新增字段或补全缺失值。

        - **主键匹配**：回填任务通过主键将输入记录与实体进行匹配，且绝不会插入新实体。

        - **三种回填模式**：选择 `coalesce`（默认选项）仅填充空值，选择 `overwrite` 替换匹配实体的值，或选择 `replace` 将不匹配实体的字段也设为空值。

        - **预检查**：您可以先运行预检查，在不更改集合的情况下对输入进行验证。

        - **Spark 批处理作业**：数据回填通过 RESTful API 以 Spark 批处理作业的形式运行，可在所有开放区域使用。

        此功能可根据需求启用。如需开启，请[联系我们](https://support.zilliz.com.cn/hc/zh-cn)。相关详情请参阅[数据回填](./data-backfill)。

        ## 按需计算支持腾讯云\{#on-demand-compute-on-tencent-cloud}

        - On-Demand 集群及按需计算中的 Database 现已支持腾讯云。该地域暂不支持 External Collection 和 Volume。

        更多内容，可以查看[云服务提供商和地域](./cloud-providers-and-regions)。

        ## 功能增强\{#enhancements}

        - **按需集群的 Keep-warm 策略** —— 设置按需集群保持运行的每周时间窗口。当窗口启动时，若集群处于暂停状态，Zilliz Cloud 会恢复该集群，并暂停自动挂起功能直至窗口结束，窗口结束后将重新应用常规的自动暂停设置。在您组织的系统时区下，一个定时计划最多可包含 10 条规则，您可以在控制台中或通过按需集群 API 的 keepWarm 对象对其进行管理。详情请参考[管理按需集群](./manage-on-demand-clusters#configure-keep-warm-schedule)。

        - **从 Milvus 迁移时跳过索引创建**  —— 当您通过端点从 Milvus 迁移时，您现在可以在**高级设置**中为单个 Collection 启用**跳过索引创建**，以迁移架构和数据而无需构建索引，然后在准备好时创建索引并加载集合。有关详细信息，请参阅[通过 Endpoint 从 Milvus 迁移至 Zilliz Cloud](./via-endpoint)。

    </div>

</Grid>

