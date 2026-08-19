---
title: "配置慢日志 | BYOC"
slug: /configure-slow-logs
sidebar_label: "配置慢日志"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本指南介绍 Zilliz Cloud 上慢日志的完整生命周期管理，包括启用、调整设置和禁用。 | BYOC"
type: origin
token: NLDRwGZoXiGyIUkGh5Oc2q6dnJe
sidebar_position: 13
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 配置慢日志

本指南介绍 Zilliz Cloud 上慢日志的完整生命周期管理，包括启用、调整设置和禁用。

<Admonition type="info" icon="📘" title="说明">

- 当前版本会记录执行较慢的 Search、Hybrid Search 和 Query 请求。

- 慢日志仅适用于企业版项目中的 Dedicated 集群。如果您的集群使用其他项目计划或集群类型，请考虑升级。

- 慢日志功能免费。

</Admonition>

## 开始之前\{#before-you-start}

- 在目标集群所在区域配置了对象存储集成。有关设置说明，请参阅集成[阿里云对象存储](./integrate-with-alibaba-cloud-oss)或 [Amazon S3](./integrate-with-amazon-s3-cn)。

- 拥有该项目的 Organization Owner, Project Admin 或 Cluster Admin 权限。如果你没有所需权限，请联系你的 Zilliz Cloud 管理员。

## 开启慢日志\{#enable-slow-logs}

<Supademo id="cmqq1peyb3o8pqms4y98l3sab" title=""  />

<Procedures>

1. 打开 Zilliz Cloud 控制台，并进入目标集群。

1. 点击**日志**页签。

1. 在**慢日志**卡片上点击**配置**按钮。

1. 在**慢日志设置**对话框中配置以下设置：

    - **存储集成**：选择用于投递日志文件的已集成存储桶。

    - **目录**：指定存储桶中用于保存访问日志的目录。

    - **阈值**：指定慢日志采集阈值。执行时间超过该值的操作会被记录到慢日志中。默认值为 150 ms。

1. 点击**保存**。

</Procedures>

## 编辑慢日志设置\{#edit-slow-log-settings}

![AeDvwVgqohowAfb141zcE4PsnnE](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/AeDvwVgqohowAfb141zcE4PsnnE.png)

<Procedures>

1. 打开 Zilliz Cloud 控制台，并进入目标集群。

1. 点击**日志**页签。

1. 点击**编辑**。

1. 根据需要调整**存储集成**、**目录**或**阈值**。

1. 点击**保存**。更新后的设置会立即对新的日志条目生效。存储桶中已有的日志文件不受影响。

</Procedures>

## 关闭慢日志\{#disable-slow-logs}

![Rwr9wXiNlh0wwVbCwGwc3InSnab](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Rwr9wXiNlh0wwVbCwGwc3InSnab.png)

<Procedures>

1. 打开 Zilliz Cloud 控制台，并进入目标集群。

1. 点击**日志**页签。

1. 点击**关闭**。新的日志条目会立即停止生成。已有日志文件会保留在您的存储桶中。

</Procedures>