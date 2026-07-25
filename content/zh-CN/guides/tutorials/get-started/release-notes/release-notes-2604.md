---
title: "版本说明书（2026/04） | Cloud"
slug: /release-notes-2604
sidebar_key: release-notes-2604
sidebar_label: "2026/04"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "版本说明书（2026/04） | Cloud"
type: origin
token: Ahgkw1upqiFne0kMJBaciMyEnac
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 版本说明书（2026/04）

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026 年 04 月 11 日**

    </div>

    <div>

        ## 全球集群\{#global-cluster}

        全球集群现已支持云地域级别的灾备和故障切换能力，并加强了相关平台能力。

        - **强切**：您可以在主用集群不可用时手动触发强切。在完成强切后，Zilliz Cloud 会为您的全球集群自动创建新的备用集群。

        - **独立 Replica 设置**：主用和备用集群支持分别设置 Replica 数量，启用动态扩缩容及定时扩缩容等设置。

        - **快速转换**：Zilliz Cloud 支持您在全球集群和普通的 Dedicated 集群间进行无缝转换。

        - **审计日志**：全球集群拓扑的所有变化均会记录审计日志，包括创建、优雅切换、强切及备用集群管理等。

        更多详情，请参考 [全球集群概览](./global-cluster-explained) 及 [优雅切换和强切](./switchover-and-failover)。

        ## Collection 级别指标监控\{#collection-level-metrics}

        以下指标现已支持 Collection 级别的细分展示，帮助您快速定位单个 Collection 的性能问题并进行容量规划：

        - QPS（读/写）

        - Latency（读/写，平均值及 P99）

        - Entity Count

        - Loaded Entities

        您可以通过控制台、Prometheus 端点或 RESTful API 访问 Collection 级别指标。

        更多详情，请参考 [指标快速参考](./metrics-alerts-reference)及 [Prometheus 监控](./prometheus-monitoring)。

        ## 访问日志 | PUBLIC \{#performance-logs-access-logs}

        Zilliz Cloud 现已支持访问日志（Access log），可捕获集群查询活动（Search、Hybrid Search、Query），专为性能分析和业务洞察设计。主要能力：

        - **可配置采样率** — 平衡统计精度与存储成本（如设置 1% 采样率）。

        - **可定制输出字段** — 控制每条日志的详细程度与成本。

        - **热数据识别** — 分析返回的主键，发现高频访问记录。

        - **结构化 JSONL 格式** — 可直接接入任意数据仓库或分析管道。

        更多详情，请参考 [访问日志](./access-logs)。

        ## 运维窗口\{#maintenance-window}

        运维窗口功能体验已全面升级：最短窗口时长由 2 小时延长至 4 小时，升级前 7/3/1 天自动发送邮件及控制台通知，支持推迟升级最多 7 天，且已向所有企业版订阅组织开放。更多详情，请参考[配置运维窗口](./organization-settings#set-up-preferred-maintenance-window)。

        ## Cluster Admin 角色\{#cluster-admin-role}

        Zilliz Cloud 提供了全新的 Cluster Admin 角色。您可以将其授予团队内的成员，从而使他们能够以项目管理员的所有权限访问部分或全部集群资源。

        - 集群操作：Cluster Admin 可以操作每日运维任务，包括扩缩容、挂起及恢复、备份和恢复以及数据库用户管理。

        - 按集群分配：此角色可以关联具体的集群，在您的各类环境和工作负载间提供细粒度的分工。

        - 注意：自定义 API Key 不支持绑定 Cluster Admin 角色。

        更多详情，可参考 [管理项目用户](./project-users)。

        ## Zilliz Cloud BYOC 支持分层存储集群\{#zilliz-cloud-byoc-supports-tiered-storage-cluster}

        您现在可以在 BYOC 项目中创建分层存储集群。在此之前，您需要在部署 BYOC 项目时设置分层存储 Query Node 设置，从而允许您独立设置此类 Query Node 的实例数量、节点数量及针对分层存储 Query Node 的自动扩缩容。

        ## 更多增强\{#enhancements}

        - 您现在可以通过控制台在您的集群数据预览页面按主键、数值及其它标量列进行升序或降序排列。更多内容，可参考[管理 Collection (控制台)](./manage-collections-console)

    </div>

</Grid>
