---
title: "版本说明书（2026/09） | Cloud"
slug: /release-notes-2609
sidebar_label: "2026/09"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: ZVtsw12VCipuFNkRdrdcz9U2nKN
sidebar_position: 2
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 版本说明书（2026/09）

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-09-03**

    </div>

    <div>

        ## 权限体系升级：组织与项目角色分离，支持自定义项目角色\{#enhanced-access-control-with-custom-project-roles}

        Zilliz Cloud 现已将组织角色与项目角色分离，并支持自定义项目角色，让您可以在组织和项目两个层级分别授予最小必要权限。

        - **组织角色与项目角色分离**：组织角色（Organization Owner、Billing Admin、Public）管理组织设置与账单；项目角色（Project Admin、Data Admin、Data Operator、Data Viewer）管理项目内的集群与数据。用户可同时持有多个角色，实际权限为并集。更多内容，可以查看[访问控制概览](./access-control-overview)。

        - **自定义项目角色**：可从基于预置模板创建自定义角色，组合平台、计算与数据访问权限，并将计算与数据访问范围限定为项目内全部集群或指定集群。更多内容，可以查看[管理平台角色](./manage-platform-roles)及[平台资源权限](./platform-privileges)。

        - **通过 RESTful API 管理角色**：可通过 API 列出角色、创建自定义项目角色，以及为成员授予或撤销角色，让自动化流程与控制台使用同一套权限模型。更多内容，可以查看[角色管理 API 参考](https://docs.zilliz.com.cn/reference/restful/list-cloud-roles-v2)。

        - **访问控制页面改版**：原成员页面改版为访问控制页面，新增项目角色，组织角色页签；邀请成员时可一步设置组织角色及可选的项目访问权限。更多内容，可以查看[管理平台用户](./manage-platform-users)。

        <Admonition type="info" icon="📘" title="**说明**">

        - **Organization Owner 不再自动继承项目访问权限。** 组织角色现仅涵盖组织设置、成员、账单与认证；Organization Owner 需要持有项目角色，才能管理或访问项目内的资源。Organization Owner 自行创建项目时，会自动获得该项目的 Project Admin 角色。
        
        - **现有 Organization Owner 的访问权限保持不变。** 系统已为其授予本次发布前可访问的所有项目的 Project Admin 角色。本次发布后由其他成员创建的项目，需在控制台或通过 API 显式分配项目角色。
        
        - **现有角色分配自动映射。** Admin 映射为 Data Admin，Read-Write 映射为 Data Operator，Read-Only 映射为 Data Viewer；限定特定集群的分配会转换为带有相同限制的自定义角色，实际生效权限不变。
        
        - **仅自动化管理角色的场景需要操作。** 如您通过 Terraform 或 API 管理角色，请更新流程，为 Organization Owner 显式分配项目角色，并改用新的角色名称。

        </Admonition>

        ## 慢查询日志支持 Dedicated 集群\{#dedicated}

        Enterprise 项目中的 Dedicated 集群现已支持记录慢 Search、Hybrid Search 与 Query 请求，并通过 Storage Integration 投递到您自己的对象存储，无额外费用。

        - **阈值可配置**：记录执行时间超过设定阈值（默认 150 ms）的请求，修改后立即对新日志生效。

        - **投递到您的存储桶**：选择 Storage Integration 及目录，日志以 JSON Lines 文件写入 `/<cluster-id>/slow/<date>/`。

        - **结构化字段：**包含时间戳、执行耗时、Database、Collection、SDK 及版本、客户端 IP、Trace ID 和状态，便于后续监控和分析。

        更多内容，可以查看[配置慢日志](./configure-slow-logs)及[慢查询日志参考](./slow-log-reference)。

        ## 创建集群时支持配置 Replica 与自动扩缩容 \{#replicas-and-autoscaling-at-cluster-creation}

        创建 Dedicated 集群或 Global Cluster 时，您现在可以直接设置 Replica 数量与 Query CU 自动扩缩容范围，无需等集群运行后再调整。

        - **Dedicated 集群**：Enterprise 项目默认开启 Query CU 自动扩缩容，可配置最小值与最大值；同时可选择 Replica 数量，多 Replica 需 8 CU 及以上。

        - **Global Cluster**：在 Primary 集群上配置自动扩缩容，并为 Primary 集群与每个 Secondary 集群分别设置不同的 Replica 数量；支持控制台及创建 Global Cluster API。

        更多内容，可以查看[创建按量计费集群](./create-pay-as-you-go-cluster)及[创建全球集群](./create-global-cluster)。

        ## 按地域组织的项目导航\{#region-aware-project-navigation}

        控制台现在按地域组织项目资源，多地域项目的管理更加清晰。

        - **项目级地域选择器**：集群、Volume、备份、按需计算及 API Playground 页面每次只展示一个地域，选择结果按项目记忆。

        - **项目设置页面**：集中查看项目信息与已绑定的全部地域，并可在此添加地域。改版后的创建项目与添加地域对话框会展示每个地域的云服务商及支持的集群类型。

        - **更快创建集群**：创建集群时默认选中当前地域；Business Critical 项目可在创建过程中自动添加新地域。

        - **多地域项目支持移除地域**：Business Critical 项目在某地域下不再有集群、Volume、备份或集成时，可通过控制台或 API 移除该地域；项目至少保留一个地域。BYOC 项目暂不支持。

        更多内容，可以查看[项目管理](./manage-projects)。

        ## 功能增强（Enhancements）\{#enhancements-0903}

        - **On-Demand 集群支持变配**：您现在可以在控制台或通过更新 On-Demand 集群 API，直接修改已有 On-Demand 集群的 Query CU 数量，以及名称、描述和自动挂起时间。更多内容，可以查看[管理 On-Demand 集群](./manage-on-demand-clusters)。

        - **支持删除默认项目**：默认项目在清空集群与 Volume 等后，可与其他项目一样删除。更多内容，可以查看[项目管理](./manage-projects)。

        - **控制台支持管理 Collection Alias** ：Collection 列表及概览页面现已展示 Alias，并可在操作菜单中创建、修改和删除 Alias，无需调用 SDK。更多内容，可以查看[管理 Collection（控制台）](./manage-collections-console)。

        - **迁移时更清晰地选择源集群与目标集群** ：跨集群迁移向导现在会按两侧所选项目过滤集群，只展示可用的源集群与目标集群。更多内容，可以查看[离线迁移](./offline-migration)。

        - **日志推送异常支持项目告警：**您现在可以为审计日志、访问日志和慢日志推送异常创建项目告警。推送异常时，Zilliz Cloud 会通过配置的渠道通知接收者，帮助您及时发现问题。审计日志推送异常期间将暂停计费，并在推送恢复后自动继续计费。更多内容，可以查看[管理项目告警](./manage-project-alerts)。

        - **按量计费账单支持月度自动开票**：对于按量计费账单，如您未在出账后 3 个自然日内申请开票，系统将于每月固定日期自动开具增值税专用发票；已开票账单不会重复开票，包年订单仍需手动申请。更多内容，可以查看[开具发票](./manage-invoice)。

    </div>

</Grid>

