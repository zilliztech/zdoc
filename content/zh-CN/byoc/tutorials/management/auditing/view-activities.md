---
title: "查看平台审计日志 | BYOC"
slug: /view-activities
sidebar_label: "查看平台审计日志"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 平台审计日志页面记录了组织中的所有事件，包括账单和资源访问情况等。 | BYOC"
type: origin
token: L7IZwws2oiiByGk53YWcJJ3ynFg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 查看平台审计日志

Zilliz Cloud **平台审计日志**页面记录了组织中的所有事件，包括账单和资源访问情况等。

## 查看平台审计日志\{#view-platform-audit-logs}

登录 Zilliz Cloud 控制台并选择要查看的组织。在组织导航中，点击**平台审计日志**。日志列表显示级别、服务、消息、发生时间和操作者。要确认谁执行了某项操作，请先找到对应消息，再核对发生时间与操作者。

![view-activities-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/view-activities-cn.png "view-activities-cn")

## 筛选平台审计日志\{#filter-platform-audit-logs}

要找到某次操作，可以组合使用**所有级别**、**所有服务**和日期范围筛选。按级别查找信息、警告或错误，按服务缩小到相关功能，按日期范围查找特定时段的记录。点击**重置**可恢复默认筛选条件。

## 下载平台审计日志\{#download-platform-audit-logs}

如需离线分析或共享审计记录，请先设置筛选条件，再点击**下载**并选择格式。

- <strong>CSV（.csv）</strong>适用于在电子表格中查看和分析。

- <strong>JSON（.jsonl）</strong>适用于程序处理，每行是一条 JSON 记录。

下载范围包含符合当前筛选条件的记录，包括其他分页。若只需要某类操作或某个时段的日志，请先缩小筛选范围。