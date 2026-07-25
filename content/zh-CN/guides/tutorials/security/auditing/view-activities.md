---
title: "查看平台审计日志 | Cloud"
slug: /view-activities
sidebar_key: view-activities
sidebar_label: "查看平台审计日志"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 平台审计日志页面记录了组织中的所有事件，包括账单和资源访问情况等。 | Cloud"
type: origin
token: L7IZwws2oiiByGk53YWcJJ3ynFg
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 组织
  - organizations
  - 查看项目事件
  - view activities

---

import Admonition from '@theme/Admonition';


# 查看平台审计日志

Zilliz Cloud **平台审计日志**页面记录了[组织](./organizations)中的所有事件，包括账单和资源访问情况等。

## 查看平台审计日志\{#view-platform-audit-logs}

点击进入组织。在左侧导航栏中，点击**平台审计日志**。在**平台审计日志**页面，您可以查看日志内容、日志发生时间以及对应的操作人。

![view-activities-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/view-activities-cn.png "view-activities-cn")

## 筛选平台审计日志\{#filter-platform-audit-logs}

您可以根据平台审计日志类型和日志发生的时段来筛选展示的日志。您可以组合这 2 个筛选条件。

- **根据时间筛选**

    如需查看特定时间段内的平台审计日志，请点击时间组件，选择起始日期和终止日期，点击**确认**。 

    <Admonition type="info" icon="📘" title="说明">

    起始日期和终止日期之间应小于 30 天。

    </Admonition>

    ![filter-by-time-range-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/filter-by-time-range-cn.png "filter-by-time-range-cn")

- **根据类型筛选**

    如需根据类型筛选，请点击类型下拉框并选择您想要查看的平台审计日志类型。Zilliz Cloud 中有 3 种类型：**信息**、**警告**和**错误**。

    <table>
       <tr>
         <th><p><strong>类型</strong></p></th>
         <th><p><strong>描述</strong></p></th>
       </tr>
       <tr>
         <td><p>信息</p></td>
         <td><p>集群、权限、账单等相关信息。</p><p>例如：集群 in01-xxxxxxxxxxxxxxx 已创建。</p></td>
       </tr>
       <tr>
         <td><p>警告</p></td>
         <td><p>资源状态更新等需要留意的信息。</p><p>例如：集群 in01-xxxxxxxxxxxxxxx 已删除。</p></td>
       </tr>
       <tr>
         <td><p>错误</p></td>
         <td><p>账单支付失败或系统出错等需要立刻注意或采取行动的信息。</p><p>例如：账单 invo-xxxxxxxxxxxxxxxxxxxxxxxx 支付失败。</p></td>
       </tr>
    </table>

    ![filter-by-activity-type-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/filter-by-activity-type-cn.png "filter-by-activity-type-cn")

