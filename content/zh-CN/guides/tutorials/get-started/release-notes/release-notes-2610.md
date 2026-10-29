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

        **2026-10-29**

    </div>

    <div>

        ## Milvus v3.0.x 公测版上线\{#milvus-v30x-public-preview}

        Milvus v3.0.x 现已面向 Zilliz Cloud Dedicated 集群开始公测（Public Preview）。本次发布带来更灵活的 Schema 变更、更强的文本处理能力，以及查询与搜索的排序和聚合能力。如需试用，请在运行 Milvus v2.6.x 的 Dedicated 集群的集群概览页点击 **升级至 Milvus v3.0.x**。

        **搜索与查询**

        - **查询与搜索支持 ORDER BY**：查询时使用 `order_by` 按一个或多个标量字段排序；搜索时使用 `order_by_fields` 按价格、评分等标量字段对返回的结果或分组排序。更多内容，可以查看[查询](./get-and-scalar-query)和[基本 Vector Search](./single-vector-search)。

        - **查询聚合**：使用 `group_by_fields` 对查询结果分组，并在服务端计算每组的 `count`、`min`、`max`、`sum` 和 `avg`。更多内容，可以查看[查询](./get-and-scalar-query)。

        - **搜索聚合**：把 ANN 搜索得到的候选结果按标量字段分到不同的桶（bucket）里，为每个桶计算指标、对桶排序，并返回每个桶里有代表性的结果；单次请求最多支持四级聚合。做分面搜索（Faceted Search）页面时，一次搜索就能拿齐所需数据。更多内容，可以查看[搜索聚合](./search-aggregation)。

        - **正则表达式过滤**：在查询、搜索和 Hybrid Search 中，可使用 `=~` 和 `!~` 操作符（RE2 语法）过滤 `VARCHAR` 字段、JSON 字符串路径以及按下标访问的数组元素。更多内容，可以查看[模式匹配](./pattern-match)。

        - **Membership Match 过滤**：按标量字段值是否属于调用方给定的一组取值来过滤 Entity；这组取值以一个紧凑的二进制 blob 通过表达式模板传入，不必再写很长的 `IN [...]` 列表。`type=roaring` 为精确匹配，仅支持有符号整型字段，且可用于 `delete` 表达式；`type=bloom` 为近似匹配，支持整型、`VARCHAR` 和 JSON 路径字段，适用于可以接受少量误判的场景。blob 只需用 gRPC SDK 构建一次，即可在多次请求中复用；RESTful API 无法传输该二进制 blob。更多内容，可以查看 [成员匹配](./membership-match)。

        - **MinHash Function**：直接传入原始文本，由 Zilliz Cloud 在服务端生成 MinHash 签名，并通过 `MINHASH_LSH` Index 检索，无需外部模型即可完成近似重复检测和大规模去重。更多内容，可以查看[MinHash Function](./minhash-function)。

        **文本与 NLP**

        - **`TEXT` 数据类型**：用于存储超过 `VARCHAR` 65,535 字节上限的段落、长文档、工单和日志，无需设置 `max_length`。`TEXT` 字段可以通过 `output_fields` 返回，也可以作为 BM25 Function 的输入来做 Full Text Search。更多内容，可以查看[Text 类型](./use-text-field)。

        **灵活 Schema 与数据类型**

        - **为已有 Collection 添加 Function 及其字段**：只需一次 Schema 变更，就能为已有 Collection 添加以已有 `VARCHAR` 字段为输入的 BM25 或 MinHash Function，以及它生成的向量字段和向量 Index。不用重建 Collection，就能用上 Full Text Search 或去重。更多内容，可以查看[修改 Collection Schema](./add-fields-to-an-existing-collection)。

        - **删除字段和 Function**：可删除不再需要的标量字段、向量字段和整个 StructArray 字段，也可删除 Function 及其生成的字段。Collection 中须至少保留一个向量字段。更多内容，可以查看[修改 Collection Schema](./add-fields-to-an-existing-collection)。

        **嵌套数据结构**

        - **StructArray 元素级搜索**：使用普通查询向量搜索 StructArray 的向量子字段，返回元素级命中结果及命中元素的 offset，并支持范围搜索、Grouping Search 和 Hybrid Search。子字段新增支持 `FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR` 和 `BINARY_VECTOR`。更多内容，可以查看[StructArray 概述](./use-array-of-structs)。

        - **StructArray Match 系列过滤**：`element_filter` 要求多个条件由同一个 Struct 元素同时满足；`MATCH_ANY`、`MATCH_ALL`、`MATCH_LEAST`、`MATCH_MOST`、`MATCH_EXACT` 操作符则按满足条件的元素个数过滤 Entity。更多内容，可以查看[StructArray 操作符](./struct-array-filtering)。

        **数据操作**

        - **Entity 级 TTL**：把 Collection 属性 `ttl_field` 设为某个 `TIMESTAMPTZ` 字段，每个 Entity 就会按自己的时间过期。TTL 值为 `NULL` 的 Entity 永不过期；用 Upsert 把时间戳改晚，就能延长 Entity 的有效期。更多内容，可以查看[设置 Collection 生存时间](./set-collection-ttl)。

        <Admonition type="info" title="说明">

        **Dedicated 集群可在控制台自助开启。** 部署运行 Milvus v2.6.x 的 Dedicated 集群后，在集群概览页点击 **升级至 Milvus v3.0.x**，即可升级至 Milvus v3.0.x。
        
        **Milvus v2.5.x 集群需先升级至 v2.6.x。** 不支持从 v2.5.x 直接升级至 v3.0.x。
        
        **升级不停机，无需重建 Index。** 升级期间集群持续提供服务，节点重启时可能出现短暂抖动；现有 Index 和 Analyzer 配置保持不变；升级后 Milvus v2.6.x 的功能仍可正常使用。
        
        **暂不包含 Global Cluster。** Global Cluster 仍运行 Milvus v2.6.x。

        </Admonition>

    </div>

</Grid>

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

