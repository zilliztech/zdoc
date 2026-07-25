---
title: "管理组织告警 | BYOC"
slug: /manage-organization-alerts
sidebar_label: "管理组织告警"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "组织告警功能监控您整个 Zilliz Cloud 组织的账单和账户相关指标。与专注于集群性能的项目告警不同，组织告警帮助您追踪现金余额、用量金额，以确保服务不中断并预防意外的账单问题。通过接收关于用量金额耗尽、支付失败和使用量阈值的及时通知，您可以随时掌握账户健康状况，避免服务中断。 | BYOC"
type: origin
token: WpDVwYaHMizLWuklBJlcypTzn2d
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 组织
  - 告警

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 管理组织告警

组织告警功能监控您整个 Zilliz Cloud 组织的账单和账户相关指标。与专注于集群性能的项目告警不同，组织告警帮助您追踪现金余额、用量金额，以确保服务不中断并预防意外的账单问题。通过接收关于用量金额耗尽、支付失败和使用量阈值的及时通知，您可以随时掌握账户健康状况，避免服务中断。

## 开始前\{#before-you-start}

在查看或管理组织告警前，请确保您拥有：

- **组织管理员**角色权限。

## 查看组织告警\{#view-organization-alerts}

在左侧导航栏中点击**组织告警**，即可访问组织告警仪表盘，监控您账户的财务健康状况。

<Supademo id="cmbkfl0zw8lgwsn1rjl3mhptl" title="Zilliz Cloud - 查看组织告警 Demo" />

### 告警历史

使用**告警历史**选项卡调查过去的告警活动，了解账单模式。这对于分析支出趋势、审查信用使用情况或向利益相关者展示账户管理非常有用。

### 告警设置

使用**告警设置**选项卡监控所有与账单相关告警的当前状态。当您需要确认哪些告警正在保护您的组织并检查其配置时，可在此处查看。

查看告警时，您会看到以下配置项：

<table>
   <tr>
     <th><p>字段</p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p>名称</p></td>
     <td><p>描述账单事件的告警标识符（例如：“信用余额不足”、“支付方式即将到期”）</p></td>
   </tr>
   <tr>
     <td><p>状态</p></td>
     <td><p>当前告警状态：启用（主动监控）或禁用（不发送通知）</p></td>
   </tr>
   <tr>
     <td><p>目标</p></td>
     <td><p>监控范围 - 整个组织</p></td>
   </tr>
   <tr>
     <td><p>告警规则</p></td>
     <td><p>触发参数，包括信用阈值、支付状态和使用量限制</p></td>
   </tr>
   <tr>
     <td><p>告警等级</p></td>
     <td><p>影响等级分类</p><ul><li><p><strong>警告</strong>：接近限制</p></li><li><p><strong>紧急</strong>：需要立即关注</p></li></ul></td>
   </tr>
   <tr>
     <td><p>告警接收</p></td>
     <td><p>通知接收者，包括配置的邮箱地址和通知渠道。</p><p>可用通知渠道列表请参阅<a href="./manage-notification-channels">管理告警渠道</a>。</p></td>
   </tr>
   <tr>
     <td><p>操作</p></td>
     <td><p>可用的管理选项：编辑、克隆、删除</p></td>
   </tr>
</table>

## 管理组织告警\{#manage-organization-alerts}

修改和维护现有告警，确保账单监控有效且符合您组织的需求和通知偏好。

<Supademo id="cmbkgd0a9020yya0i6npknuum" title="管理组织告警" isShowcase="true" />

### 禁用或启用组织告警\{#enable-or-disable-organization-alert}

在不丢失告警配置的情况下控制主动监控。

- 禁用告警：保留所有配置，但停止监控和发送通知。

- 启用告警：主动监控账单指标，并在条件满足时发送通知。

### 编辑组织告警\{#edit-organization-alerts}

为现有告警自定义通知接收者并修改触发条件。

### 复制组织告警\{#clone-project-alert}

创建相似的告警，可调整通知设置或修改阈值。

## 配置告警接收设置\{#configure-alert-receiver-settings}

设置组织范围内的默认通知设置，这些设置会自动应用于新告警，确保整个组织采用一致的账单通知实践。

<Supademo id="cmbkgeww28mczsn1rdmgvzr6m" title="配置告警接收设置"/>

配置设置时，您会遇到以下概念：

- **发送给**：为新告警自动选择的默认通知渠道（邮箱、企业微信、Webhook）。配置您最常用的渠道可简化告警创建流程。

- **告警恢复通知**：启用后，当告警恢复（条件不再满足）时您将收到通知。

- **将设置应用于现有告警**：选择是否用新的默认设置更新所有现有告警。

## FAQ\{#faq}

### 告警触发后，我会多久收到一次通知？

告警通知遵循自动频率模式：

- 首次通知：告警阈值被突破时立即发送。

- 第二次通知：如果条件持续存在，1小时后发送。

- 后续通知：只要告警条件仍处于活动状态，每天发送一次。

如果您觉得通知过于频繁，可以：

- [编辑告警](./manage-organization-alerts#edit-organization-alerts)以调整条件阈值或持续时间要求。

- 暂时[禁用告警](./manage-organization-alerts#enable-or-disable-organization-alert)以停止所有通知（同时保留配置）。

