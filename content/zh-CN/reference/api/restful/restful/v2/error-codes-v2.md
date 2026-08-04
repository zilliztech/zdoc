---
displayed_sidbar: restfulSidebar
slug: /restful/error-codes-v2
title: 错误代码
description: 本页列出了 Zilliz Cloud RESTful API 返回的错误代码。
beta: FALSE
notebook: FALSE
sidebar_position: 2
---

# 错误代码（v2）

本页列出了 Zilliz Cloud RESTful API（v2）返回的错误代码。

**96000**

无效的 CloudId。请使用 ListCloudProviders API 获取受支持的 cloudIds 列表。

**96001**

无效的 RegionId。请使用 ListCloudRegions API 获取受支持的 regionIds 列表。

**96002**

无效的 cuSize。参数值应为正数。

**96003**

无效的 cuType。

**96004**

无效的 dedicated plan。

**96005**

无效的 projectId。projectId 的格式应为 proj-xxxxxxxx。请使用 ListProjects API 获取您有权限访问的项目。

**96006**

UTC 中的 ISO 8601 duration 格式无效。

**96007**

UTC 中的 ISO 8601 timestamp 格式无效。

**96008**

pageSize 的参数值应在 1 到 100 之间。

**96009**

参数 currentPage 的值应在 1 到 Int 的最大值之间。

**96010**

无效的 clusterName。集群名称只能包含字母数字字符和连字符。

**96011**

必须提供有效的 period，或提供有效的 start 和 end 参数。

**96012**

您没有此项目的权限。Project org 与 Apikey org 不匹配。

**96013**

您没有此项目的权限。需要 org owner 或 project owner 权限。

**96014**

您没有此集群的权限。Cluster org 与 Apikey org 不匹配。

**96015**

您没有此集群的权限。需要 org owner 或 project owner 权限。

**96016**

您没有此集群的权限。请检查您的 Apikey scope。

**96017**

指定的集群名称在项目下已存在。

**96018**

未找到集群。请使用 ListClusters API 获取您有权限访问的集群。

**96019**

此区域不支持 free plan。

**96020**

此区域不支持 serverless plan。

**96021**

Free cluster 不支持此操作。

**96022**

Serverless cluster 不支持此操作。

**96023**

指定的 class 不存在。请检查 cuType、cuSize 和 plan 的组合。

**96024**

查询实例指标失败。%s（详情）

**96025**

clusterId 为空。请指定 clusterId。

**96026**

未找到作业。请检查您的请求参数。

**96027**

您没有此项目的权限。请检查您的 Apikey scope。

**96028**

此功能仅支持 enterprise plan 集群。

**96029**

无效的 backupType。

**96030**

无效的 backup creationMethod。

**96031**

无效的 backup restore policy。`collectionStatus` 的值应为 KEEP 或 RELEASE。

**96032**

无效的 backup policy frequency。

**96033**

无效的 backup policy startTime。

**96034**

无效的 auto backup retentionDays。该值应在 1 到 30 之间。

**96035**

无效的时间范围。请检查 start 和 end 时间参数。

**96036**

无效的 clusterId。

**96037**

无效的 targetCollectionStatus。该值应为 LOADED 或 UNLOADED。

**96038**

创建备份失败。%s

**96039**

恢复集合备份失败。%s

**96040**

恢复集群备份失败。%s
