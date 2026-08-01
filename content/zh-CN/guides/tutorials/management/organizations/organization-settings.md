---
title: "组织设置 | Cloud"
slug: /organization-settings
sidebar_label: "组织设置"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "组织管理员具备管理组织设置的权限。 | Cloud"
type: origin
token: AkYpwsObJihszLkXBz6ca0XDnOc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 组织设置

组织管理员具备管理组织设置的权限。

本文将介绍如何在 Zilliz Cloud 中管理组织设置。

## 查看组织\{#view-organizations}

当您注册 Zilliz Cloud 后，您会加入一个以您为管理员的默认组织。虽然您无法创建组织，但您可以通过邀请的方式加入其它用户的组织。

在登录 Zilliz Cloud 控制台后，您会看到您已经加入的所有组织的列表。您可以检查这些组织或选择进入其中某个组织。

要快速查看您加入的所有组织，点击顶部导航栏中的组织名，然后选择**查看所有组织**。

![zh-view-organizations](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/zh-view-organizations.png "zh-view-organizations")

## 创建组织\{#create-an-organization}

如果您需要创建多个组织，请[联系我们](http://support.zilliz.com.cn)开通功能。开通后您可以根据以下步骤自行创建组织。

![XQCpw5364hU7Sfb4D0JcDmDJnpc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/XQCpw5364hU7Sfb4D0JcDmDJnpc.png)

## 编辑组织名称\{#edit-organization-name}

要编辑组织名称，您必须是[组织管理员](./organization-users)。

您可以通过以下任一种方式编辑组织名称：

- 在组织列表页面编辑组织名称。

    ![zh-rename-organization](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/zh-rename-organization.png "zh-rename-organization")

- 进入一个组织，在**系统设置**页面编辑组织名称。

    ![edit-organization-name-zh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/edit-organization-name-zh.png "edit-organization-name-zh")

## 设置时区\{#manage-timezone}

默认情况下，系统时区的设置会与首次登录地保持一致，并会应用 Zilliz Cloud 中显示的所有时间字符串。

如需查看时区，您的角色可以是组织管理员或组织成员。更多有关组织角色详情，请参考[管理组织用户](./organization-users)。

![timezone-settings](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/timezone-settings.png "timezone-settings")

如需修改时区，您的角色必须为组织管理员。请单击**编辑**以打开**编辑系统时区**对话框，并从下拉列表中选择时区。您还可以输入时区名称以快速检索所需的时区。

## 设置偏好运维窗口\{#set-up-preferred-maintenance-window}

偏好运维窗口是一个 **4 小时**的时间段，Zilliz Cloud 会在此期时间段内自动按计划执行维护任务，例如升级 Dedicated 集群的 Milvus 版本。

您可以通过设置偏好运维窗口将运维时间安排在业务低峰期，从而尽量降低对工作负载的影响。

默认偏好运维窗口为**上午 2:00–6:00**，您可以随时按需调整。

以下 Demo 展示了如何修改偏好运维窗口。

<Supademo id="cmn5e3ep53bovz3qmb2i4x0cb" title=""  />

<Admonition type="info" icon="📘" title="说明">

如果维护超出偏好运维窗口，系统将继续执行直至完成。

</Admonition>

在计划维护开始前 7 天，您会在的**集群概览**页面看到通知。

![KqSabXxEuoTueAx6ttWcf7QInie](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/kqsabxxeuotueax6ttwcf7qinie.png "KqSabXxEuoTueAx6ttWcf7QInie")

- **组织管理员**和**项目管理员**可以选择：

    - 立即将集群升级到最新 Milvus 版本。

    - 将运维推迟 7 天（仅可推迟一次）。

    - 不进行任何操作，按计划系统自动执行运维。

- **组织成员**请检查 [SDK 兼容性](./install-sdks#sdk-compatibility)。

## 删除组织\{#delete-organization}

开始前，请先确保：

- 当前组织下的[集群已全部删除](./manage-cluster#drop-cluster)。

- 当前组织下的 Volume 已全部删除。

- 当前组织中的[账单](./view-invoice)已全部付清。

- 您的组织角色为组织管理员。

- 现金余额已全部退款

- 第三方云市场[订阅已取消](./aliyun-marketplace#unsubscribe-alibaba-marketplace)。

以下为删除组织的操作步骤：

1. 登录 [Zilliz Cloud 界面](https://cloud.zilliz.com.cn/login)。

1. 进入需要删除的组织并点击左侧导航栏中的**系统设置**。

1. 在**系统设置**页面最下方的**删除组织**区域内，点击**删除组织**按钮。

1. 根据弹出的对话框完成相应操作，确认删除组织。

<Admonition type="info" icon="📘" title="🚧 警告">

删除组织的操作不可逆，请谨慎操作！

</Admonition>

![delete-organization-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/delete-organization-cn.png "delete-organization-cn")

