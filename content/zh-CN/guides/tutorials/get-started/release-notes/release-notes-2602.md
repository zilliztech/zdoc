---
title: "版本说明书（2026/02） | Cloud"
slug: /release-notes-2602
sidebar_key: release-notes-2602
sidebar_label: "2026/02"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "版本说明书（2026/02） | Cloud"
type: origin
token: Kw4GwXRaVir8Q5kxl3LcwvXVngf
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 版本说明书（2026/02）

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026 年 02 月 09 日**

    </div>

    <div>

        ## 集群级别权限控制\{#cluster-level-access-control}

        Zilliz Cloud 现已支持集群级访问控制，可在项目内实现精细化的权限管理。管理员可以为不同集群和 Volumes 分配不同的角色，实现更加细粒度的权限隔离。

        - **按集群分配角色**：在同一项目中，可为集群和卷授予独立的角色（只读/读写），从而针对不同环境和工作负载实现细粒度的职责分离。

        - **严格的访问执行**：对未授权资源的 API 请求将被拒绝，且受限资源将在控制台中隐藏。所有访问均严格限制在用户获授的权限范围内。

        - **无缝迁移**：现有项目成员将被自动迁移并获得“所有资源”的访问权限，以继承当前的项目角色和权限范围。用户无需进行任何手动操作。

        功能细节请参考 [管理组织用户](./organization-users#invite-a-user-to-your-organization)及[管理项目用户](./project-users#invite-a-user-to-a-project)。

    </div>

</Grid>

