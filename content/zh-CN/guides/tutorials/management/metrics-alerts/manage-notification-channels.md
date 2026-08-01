---
title: "管理告警渠道 | Cloud"
slug: /manage-notification-channels
sidebar_label: "管理告警渠道"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 的告警通知确保您不会错过集群中的任何重要事件。通常情况下，告警通知会发送到您指定的电子邮件地址。此外，您也可以通过自定义 webhook 通知渠道，实现更加无缝和事件驱动的告警通知。本指南将介绍如何管理告警渠道。 | Cloud"
type: origin
token: T9z1wL5y9iDgV5kMAx1cAZfxn0b
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 管理告警渠道

Zilliz Cloud 的告警通知确保您不会错过集群中的任何重要事件。通常情况下，告警通知会发送到您指定的电子邮件地址。此外，您也可以通过自定义 webhook 通知渠道，实现更加无缝和事件驱动的告警通知。本指南将介绍如何管理告警渠道。

## 开始前\{#before-you-start}

要管理告警渠道，请确保您是组织或项目管理员。有关更多用户角色信息，请参阅[访问控制](./zilliz-access-control-prompts)。

## 配置告警渠道\{#set-up-notification-channels}

您可以在 Zilliz Cloud 控制台的**编辑告警**或**新建告警**对话框中访问告警渠道管理页面。

![zh-manage-alert-channel](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/zh-manage-alert-channel.png "zh-manage-alert-channel")

### 邮件\{#email}

要设置电子邮件通知，请按以下步骤操作：

<Procedures>

1. 登录 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/signup)，进入组织或项目告警页面的**告警设置**选项卡。

1. 要修改现有的告警配置，找到目标告警，从右侧的**操作**列中选择**编辑**。如果要创建新的告警配置，点击页面右上角的 **+ 告警**按钮。

    <Admonition type="info" icon="📘" title="📘 说明">

    对于组织告警，您只能编辑现有的告警配置，无法创建新的配置。如需更多信息，请参阅[管理组织告警](./manage-organization-alerts)。

    </Admonition>

1. 在弹出对话框的**发送给**字段中，选择接收告警通知的用户角色或个别用户的电子邮件地址。

1. 在**告警恢复通知**和**开启告警**中，可以配置告警解决后或告警触发后需要执行的动作。

</Procedures>

有关更多告警配置信息，请参阅[管理组织告警](./manage-organization-alerts)或[管理项目告警](./manage-project-alerts)。

### 企业微信\{#wecom}

要设置企业微信告警通知，请按以下步骤操作：

<Procedures>

1. 在企业微信群中，创建群机器人。具体操作步骤，请参阅[群机器人添加入口](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchData=#%E4%BA%8C%E3%80%81%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%B7%BB%E5%8A%A0%E5%85%A5%E5%8F%A3)。

    <Admonition type="info" icon="📘" title="📘 说明">

    由于企业微信的设置，导致部分群可能无法添加群机器人，详情请参阅[添加/创建群机器人条件](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchData=#%E5%9B%9B%E3%80%81%E6%B7%BB%E5%8A%A0/%E5%88%9B%E5%BB%BA%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%9D%A1%E4%BB%B6)。

    </Admonition>

1. 查看已创建的机器人信息，获取对应机器人的 webhook URL。具体操作步骤，请参阅[群机器人 Webhook 地址](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchData=#%E4%BA%94%E3%80%81%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BAWebhook%E5%9C%B0%E5%9D%80)。

1. 登录 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/signup)，配置企业微信告警渠道。

    1. 进入组织或项目告警页面的**告警设置**选项卡。

    1. 要修改现有的告警配置，找到目标告警，从右侧的**操作**列中选择**编辑**。如果要创建新的告警配置，点击页面右上角的 **+ 告警**按钮。

        <Admonition type="info" icon="📘" title="📘 说明">

        对于组织告警，您只能编辑现有的告警配置，无法创建新的配置。如需更多信息，请参阅[管理组织告警](./manage-organization-alerts)。

        </Admonition>

    1. 在弹出对话框的**发送给**字段中，点击 **+ 告警渠道**，从下拉菜单中选择**企业微信**。

    1. 在文本框中填入前面获取到的群机器人的 webhook URL。

    1. 在**告警恢复通知**和**开启告警**中，可以配置告警解决后或告警触发后需要执行的动作。

</Procedures>

有关更多告警配置信息，请参阅[管理组织告警](./manage-organization-alerts)或[管理项目告警](./manage-project-alerts)。

### 短信\{#sms}

要设置短信告警通知，请按以下步骤操作：

<Procedures>

1. 登录 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/signup)，进入组织或项目告警页面的**告警设置**选项卡。

1. 要修改现有的告警配置，找到目标告警，从右侧的**操作**列中选择**编辑**。如果要创建新的告警配置，点击页面右上角的 **+ 告警**按钮。

    <Admonition type="info" icon="📘" title="📘 说明">

    对于组织告警，您只能编辑现有的告警配置，无法创建新的配置。如需更多信息，请参阅[管理组织告警](./manage-organization-alerts)。

    </Admonition>

1. 在弹出对话框的**发送给**字段中，选择想要发送短信告警的用户角色或集群成员。

1. 在**告警恢复通知**和**开启告警**中，可以配置告警解决后或告警触发后需要执行的动作。

</Procedures>

有关更多告警配置信息，请参阅[管理组织告警](./manage-organization-alerts)或[管理项目告警](./manage-project-alerts)。

### 钉钉\{#dingtalk}

要设置钉钉告警通知，请按以下步骤操作：

<Procedures>

1. 在钉钉群中，创建自定义机器人。具体操作步骤，请参阅[自定义机器人接入](https://open.dingtalk.com/document/robots/custom-robot-access)。

    <Admonition type="info" icon="📘" title="📘 说明">

    在配置机器人信息时，需为自定义机器人的**安全设置**添加**自定义关键字**：
    
    - **测试**：用于接收连通性测试的告警通知
    
    - **告警**：用于接收正式的告警通知
    
    有关如何配置自定义关键字，请参阅[自定义关键字](https://open.dingtalk.com/document/robots/custom-robot-access)。

    </Admonition>

1. 查看已创建的机器人信息，获取对应机器人的 webhook URL。具体操作步骤，请参阅[获取自定义机器人 Webhook 地址](https://open.dingtalk.com/document/orgapp/obtain-the-webhook-address-of-a-custom-robot)。

1. 登录 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/signup)，配置钉钉告警渠道。

    1. 进入组织或项目告警页面的**告警设置**选项卡。

    1. 要修改现有的告警配置，找到目标告警，从右侧的**操作**列中选择**编辑**。如果要创建新的告警配置，点击页面右上角的 **+ 告警**按钮。

        <Admonition type="info" icon="📘" title="📘 说明">

        对于组织告警，您只能编辑现有的告警配置，无法创建新的配置。如需更多信息，请参阅[管理组织告警](./manage-organization-alerts)。

        </Admonition>

    1. 在弹出对话框的**发送给**字段中，点击 **+ 告警渠道**，从下拉菜单中选择**钉钉**。

    1. 在文本框中填入前面获取到的群机器人的 webhook URL。

    1. 在**告警恢复通知**和**开启告警**中，可以配置告警解决后或告警触发后需要执行的动作。

</Procedures>

有关更多告警配置信息，请参阅[管理组织告警](./manage-organization-alerts)或[管理项目告警](./manage-project-alerts)。

### 飞书\{#lark}

要设置飞书告警通知，请按以下步骤操作：

<Procedures>

1. 在飞书群组中，添加自定义机器人，并获取机器人的 webhook URL。具体操作步骤，请参阅[在群组中添加自定义机器人](https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot#399d949c)。

1. 登录 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/signup)，配置飞书告警渠道。

    1. 进入组织或项目告警页面的**告警设置**选项卡。

    1. 要修改现有的告警配置，找到目标告警，从右侧的**操作**列中选择**编辑**。如果要创建新的告警配置，点击页面右上角的 **+ 告警**按钮。

        <Admonition type="info" icon="📘" title="说明">

        对于组织告警，您只能编辑现有的告警配置，无法创建新的配置。如需更多信息，请参阅[管理组织告警](./manage-organization-alerts)。

        </Admonition>

    1. 在弹出对话框的**发送给**字段中，点击 **+ 告警渠道**，从下拉菜单中选择**飞书**。

    1. 在文本框中填入前面获取到的群机器人的 webhook URL。

    1. 在**告警恢复通知**和**开启告警**中，可以配置告警解决后或告警触发后需要执行的动作。

</Procedures>

有关更多告警配置信息，请参阅[管理组织告警](./manage-organization-alerts)或[管理项目告警](./manage-project-alerts)。

### 自定义 webhook\{#webhook}

Zilliz Cloud 提供的 **Webhook** 选项允许您设置自定义的通知渠道。

<Procedures>

1. 获取自定义服务的 webhook URL。

1. 登录 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/signup)，配置 webhook 告警渠道。

    1. 进入组织或项目告警页面的**告警设置**选项卡。

    1. 要修改现有的告警配置，找到目标告警，从右侧的**操作**列中选择**编辑**。如果要创建新的告警配置，点击页面右上角的 **+ 告警**按钮。

        <Admonition type="info" icon="📘" title="📘 说明">

        对于组织告警，您只能编辑现有的告警配置，无法创建新的配置。如需更多信息，请参阅[管理组织告警](./manage-organization-alerts)。

        </Admonition>

    1. 在弹出对话框的**发送给**字段中，点击 **+ 告警渠道**，从下拉菜单中选择 **Webhook**。

    1. 在文本框中填入前面获取到的自定义服务的 webhook URL。

    1. 在**告警恢复通知**和**开启告警**中，可以配置告警解决后或告警触发后需要执行的动作。

</Procedures>

有关更多告警配置信息，请参阅[管理组织告警](./manage-organization-alerts)或[管理项目告警](./manage-project-alerts)。

示例 webhook 告警通知：

```python
{
  "orgId": "org-lgedmeaxmbofeolgsrwhru",
  "projectId": "proj-e8b1b136b0e7462ee6ed4b",
  "summary": "您的 Zilliz Cloud 集群 resume-deployment 于 2024-04-16 11:59:00 (UTC) 发生 紧急 级别的告警。Search 延时（平均） 在 5 分钟内超过 1 ms。请检查系统。",
  "level": "CRITICAL",
  "timestamp": "2024-04-16T11:59:00Z"
}
```

## 测试连通性\{#test-connectivity}

在设置完告警渠道后，可点击**发送测试消息**图标来验证配置是否有效。

![zh-test-connectivity](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/zh-test-connectivity.png "zh-test-connectivity")

