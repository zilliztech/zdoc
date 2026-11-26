---
title: "管理 Snapshot（控制台） | Cloud"
slug: /manage-snapshots-console
sidebar_label: "管理 Snapshot（控制台）"
beta: ON REQUEST
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
channel: next
sidebar_custom_props:
  channel: next
description: "除了使用 SDK 程序化地管理 Snapshot 之外，您还可以在 Zilliz Cloud 控制台上管理它们。您可以参考本文中的步骤，了解如何创建 Snapshot、将 Snapshot 恢复到新的 Collection 中、删除 Snapshot ，以及配置定时 Snapshot 策略，以便 Zilliz Cloud 定时为您的 Collection 创建 Snapshot。 | Cloud"
type: origin
token: Gs2AwtPbbi4hFTkMswhcrM3tnFc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 管理 Snapshot（控制台）

除了使用 SDK 程序化地管理 Snapshot 之外，您还可以在 Zilliz Cloud 控制台上管理它们。您可以参考本文中的步骤，了解如何创建 Snapshot、将 Snapshot 恢复到新的 Collection 中、删除 Snapshot ，以及配置定时 Snapshot 策略，以便 Zilliz Cloud 定时为您的 Collection 创建 Snapshot。

<Admonition type="info" title="说明">

该功能仅适用于 Dedicated 集群。

</Admonition>

## 创建 Snapshot\{#create-a-snapshot}

在本示例中，您将在名为 **Dedicated-02** 的集群中为名为 **medium_articles** 的 Collection 创建一个 Snapshot。

<Supademo id="cmwx06mal01luqmpkctiro5ie" title=""  />

<Procedures>

1. 在左侧导航中单击 **Serving 集群**，然后在集群列表中单击目标集群。

1. 在集群树中单击目标 Collection。

1. 单击**快照**页签。

1. 单击 **+ 快照**为该 Collection 创建快照。

1. 在弹出的**创建快照**对话框中，为待创建的快照设置名称和描述（可选）。

1. 单击**创建**。

</Procedures>

## 恢复 Snapshot\{#restore-a-snapshot}

您可以将快照列表中的任意快照恢复到一个新的 Collection 中。

<Supademo id="cmwx6idvv07kkqmpkqyf84v1o" title=""  />

<Procedures>

1. 在**快照**页签中找到目标快照记录。

1. 单击该记录**操作**列的 **...**，然后从弹出的下拉菜单中单击**恢复**。

1. 在弹出的**恢复快照**对话框中

    1. 设置目标 Database。

    1. 设置新的 Collection 名称。

1. 单击**恢复**。

1. 您可以监控恢复进度，直至其状态变更为成功。

</Procedures>

## 删除 Snapshot\{#drop-a-snapshot}

在您不再需要某个快照时，可以将其删除。

<Supademo id="cmwx9dcvl09siqmpknrrminxw" title=""  />

<Procedures>

1. 在**快照**页签中找到目标快照记录。

1. 单击该记录**操作**列的 **...**，然后从弹出的下拉菜单中单击**删除**。

1. 在弹出的**删除快照**对话框中

    1. 复制目标快照的名称。

    1. 将其粘贴到下方的文本框内。

1. 单击**删除**。

</Procedures>

## 配置定时策略\{#configure-schedule-policies}

除了手动创建 Snapshot 之外，您还可以为您的 Collection 配置定时快照策略，让 Zilliz Cloud 定时自动创建 Collection 快照。

<Supademo id="cmwxafqzn0ahhqmpkow59u0j8" title=""  />

<Procedures>

1. 在**快照**页签中找到目标快照记录。

1. 打开**快照策略**开关。

1. 在弹出来的**快照策略设置**对话框中。

    1. 为当前策略设置**时区**。

    1. 当前有**基础**和**高级**两种模式。

        - 在基础模式中，您可以设置频率、生效日期及 Zilliz Cloud 创建快照的具体时间。

        - 您也可以在**高级**模式中使用类似 `0 9 * * 1-5` 使用 cron 表达式。更多内容，可以参考[了解 Cron 表达式](./cron-expression)。

    1. 设置**保留期**。

        默认值是 7 天。您可以将其延长到最多 30 天。

1. Click **Save**.

</Procedures>