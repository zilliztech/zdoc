---
title: "管理 MFA | Cloud"
slug: /multi-factor-auth
sidebar_key: multi-factor-auth
sidebar_label: "管理 MFA"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本教程将介绍如何在 Zilliz Cloud 账号设置中管理多重身份认证（MFA）。目前，Zilliz Cloud 仅支持通过邮箱进行多重身份认证。 | Cloud"
type: origin
token: EWAWwESijisVHFkoAEbcfhvPnZb
sidebar_position: 4
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - mfa

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 管理 MFA

本教程将介绍如何在 Zilliz Cloud 账号设置中管理多重身份认证（MFA）。目前，Zilliz Cloud 仅支持通过邮箱进行多重身份认证。

## 开启 MFA\{#enable-mfa}

执行以下步骤以开启 MFA：

<Procedures>

1. 登录 [Zilliz Cloud 界面](https://cloud.zilliz.com.cn/login)。

1. 点击界面右上角的人像符号。点击**账号设置**

1. 打开多重身份验证旁的开关，出现弹窗“开启 MFA”。

1. 输入您的账号密码，并点击**开启。**

1. 请前往您的账号邮箱接收验证码，在“账号验证”弹窗的输入框中输入验证码并点击**确认**。

    <Admonition type="info" icon="📘" title="说明">

    如未收到验证码或验证码过期，请点击重新发送验证码。

    </Admonition>

    ![enable_mfa](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/enable_mfa.png "enable_mfa")

1. MFA 开启成功后，页面将自动跳转至登录页。

1. 请在登录页输入您的账号邮箱和密码，并点击**登录**按钮。

1. 请前往您的账号邮箱接收验证码，并在多重身份验证窗口的输入框中输入验证码。

1. 通过验证后，您将自动登录并进入 Zilliz Cloud 操作界面。

</Procedures>

## 关闭 MFA\{#disable-mfa}

![disable_mfa](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/disable_mfa.png "disable_mfa")

如果您已开启 MFA，请执行以下步骤以关闭 MFA：

<Procedures>

1. 登录 [Zilliz Cloud 界面](https://cloud.zilliz.com.cn/login)。

1. 点击界面右上角的人像符号。点击**账号设置**

1. 关闭多重身份验证旁的开关，出现弹窗“关闭 MFA”。点击**关闭**按钮以确认关闭 MFA。

1. 请前往您的账号邮箱接收验证码，在“关闭 MFA”弹窗的输入框中输入验证码并点击**关闭**。

    <Admonition type="info" icon="📘" title="说明">

    如未收到验证码或验证码过期，请点击重新发送验证码。

    </Admonition>

1. MFA 关闭成功后，界面右上角弹出确认信息"关闭邮箱验证"。

</Procedures>

