---
title: "使用 Okta 配置 SSO | BYOC"
slug: /single-sign-on-with-okta
sidebar_label: "使用 Okta 配置 SSO"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "单点登录（SSO）允许您通过使用单一登录凭证便捷地访问 Zilliz Cloud 控制台，而无需注册单独的 Zilliz Cloud 账户。SSO 功能可以简化用户访问，并通过集中身份验证来加强安全性。Zilliz Cloud 的 SSO 功能在组织层面运作，支持 SAML 2.0](https//en.wikipedia.org/wiki/SAML2.0) 协议。通过与 [Okta 集成，您可以使用 Okta 凭据登录并访问 Zilliz Cloud。 | BYOC"
type: origin
token: BRygwmdMOiyW0Ckd439cJwR6nHf
sidebar_position: 14
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 使用 Okta 配置 SSO

单点登录（SSO）允许您通过使用单一登录凭证便捷地访问 Zilliz Cloud 控制台，而无需注册单独的 Zilliz Cloud 账户。SSO 功能可以简化用户访问，并通过集中身份验证来加强安全性。Zilliz Cloud 的 SSO 功能在组织层面运作，支持 [SAML 2.0](https://en.wikipedia.org/wiki/SAML_2.0) 协议。通过与 [Okta](https://www.okta.com/) 集成，您可以使用 Okta 凭据登录并访问 Zilliz Cloud。

本文介绍如何使用 Okta 启用 SSO。

<Admonition type="info" icon="📘" title="📘 说明">

目前，SSO 功能处于公测阶段，仅对白名单用户开放。如需体验 SSO 功能，请[提交工单](https://support.zilliz.com.cn/hc/zh-cn)。

</Admonition>

![U4lQb6Zw6oxyb9xAbsFcXwjAncc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/u4lqb6zw6oxyb9xabsfcxwjancc.png "U4lQb6Zw6oxyb9xAbsFcXwjAncc")

## 开始前\{#before-you-start}

- 您是目标 Zilliz Cloud 组织的管理员。

- 您具有 Okta 管理控制台的管理员权限。有关更多信息，请参考 [Okta 官方文档](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm)。

## 步骤 1：在 Zilliz Cloud 上初始化设置\{#step-1-initialize-setup-on-zilliz-cloud}

![zh-sso-1](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/zh-sso-1.png "zh-sso-1")

<Procedures>

1. 登录 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)，进入您需要配置 SSO 的组织。

1. 在左侧导航栏中选择**系统设置**。

1. 在**系统设置**页面的 **Single Sign-On (SSO)** 区域，点击**操作** > **设置**。

1. 在弹出的 **设置 SSO** 对话框中，复制 **Zilliz Cloud Redirect URL**。该 URL 将在 Okta 控制台配置 IdP 时用到。

</Procedures> 

保留此页面，[接下来](./single-sign-on-with-okta#step-2-create-an-integration-in-the-okta-console)在 Okta 控制台进行配置。

## 步骤 2：在 Okta 控制台中创建应用集成\{#step-2-create-an-integration-in-the-okta-console}

<Procedures>

1. 登录 [Okta 管理控制台](https://login.okta.com/)。

1. 在左侧导航栏中选择 **Applications** > **Applications**。

1. 点击 **Create App Integration**。

1. 在弹出的对话框中，选择 **SAML 2.0**，然后点击**下一步**。

1. 自定义应用名称后点击**下一步**。

1. 在配置 SAML 设置时，您需要填写以下参数：

    - **Single sign-on URL**：输入在第一步中获取的 URL，该 URL 用于通过 HTTP POST 发送 SAML 断言。

    - **Audience URI (SP Entity ID)**：输入第一步中获取的 URL，该标识符用于帮助 IdP 识别服务提供商（Zilliz Cloud）。

1. 点击 **Finish**，您将被重定向到应用页面。

    ![zh_sso-2-1](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/zhsso-2-1.png "zh_sso-2-1")

1. 在 **Sign On** 选项卡的 **SAML 2.0** 部分，点击 **More details**，并复制以下凭据和证书：**Sign on URL**、**Issuer** 和 **Signing Certificate**。您将在 Zilliz Cloud 控制台配置 IdP 时用到这些信息。 有关 Okta 设置的详细信息，请参考 [Okta 官方文档](https://help.okta.com/en-us/content/topics/apps/apps_app_integration_wizard_saml.htm)。

    ![zh_sso-2-2](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/zhsso-2-2.png "zh_sso-2-2")

</Procedures>

## 步骤 3：在 Zilliz Cloud 上配置 IdP\{#step-3-configure-idp-on-zilliz-cloud}

回到 Zilliz Cloud 控制台，完成 IdP 配置。

![zh_sso-3](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/zhsso-3.png "zh_sso-3")

<Procedures>

1. 在**设置 IdP** 步骤中，使用从 Okta 获取的凭据和证书填写以下信息：

    - **Single Sign-On URL**：将从 Okta 获取的 **Sign on URL** 粘贴到此处。该 URL 用于接收来自 Okta 的 SAML 身份验证请求。

    - **Entity ID**：将从 Okta 获取的 **Issuer** 粘贴到此字段。该标识符用于区分 SAML 消息的来源，确保 Zilliz Cloud 正确识别并接受来自 Okta 的信息。

    - **Certificate**：将从 Okta 获取的 **Signing Certificate** 粘贴到此处。该证书用于验证 SAML 断言的数字签名，确保 Zilliz Cloud 可以安全地认证 SAML 数据的来源。

1. 点击**下一步**进入**启用**步骤，按需完成设置后点击**保存**。

    - **启用 SSO**：选择是否为您的组织启用 SSO 功能。如果关闭该选项，您将无法通过 IdP 进行用户身份验证。

    - **自定义 SSO 登录 URL**：您可以自定义 Zilliz Cloud 控制台的登录 URL，并在预览部分查看该自定义 URL。

1. 在弹出的对话框中获取 SSO 登录 URL。

    <Admonition type="info" icon="📘" title="说明">

    配置完成后，您也可以在**系统设置**页面中的 **Single Sign-On (SSO)** 区域查看 SSO 状态和登录 URL。

    </Admonition>

</Procedures>

## 步骤 4：为组织用户分配应用\{#step-4-assign-app-integration-to-end-user}

在用户可以通过 SSO 登录 URL 访问 Zilliz Cloud 之前，需要确保已为每位用户正确分配应用集成。

![zh_sso-4](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/zhsso-4.png "zh_sso-4")

<Procedures>

1. 在 [Okta 管理控制台](https://login.okta.com/)中，选择 **Directory** > **People**。

1. 在 **Applications** 标签页中，点击 **Assign Applications**。

1. 在 **Assign Applications** 对话框中，找到目标应用并点击 **Assign**，然后点击 **Done**。

1. 在用户名字段中输入组织用户的邮箱地址，点击 **Save and Go Back**。之后，该用户即可通过 SSO 登录 URL 访问 Zilliz Cloud。

</Procedures>

有关更多配置详情，请参考 [Okta 官方文档](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm)。

## 验证配置\{#test-configuration}

SSO 配置完成后，可参考以下步骤验证是否生效：

1. 打开新的浏览器窗口访问 SSO 登录 URL，您将被重定向到 Okta 登录页面。

1. 通过已分配应用的用户凭证登录 Okta。如果 SSO 配置成功，您将被重定向至 Zilliz Cloud 控制台。

