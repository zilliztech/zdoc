---
title: "创建账号 | Cloud"
slug: /register-with-zilliz-cloud
sidebar_label: "创建账号"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "创建 Zilliz Cloud 账号，即可开始使用托管的向量检索服务。您可以使用企业邮箱和密码注册账号。 | Cloud"
type: origin
token: VLvsdfwWZo2tf5xqwGdcYBE7nyh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 创建账号

创建 Zilliz Cloud 账号，即可开始使用托管的向量检索服务。您可以使用企业邮箱和密码注册账号。

创建账号无需绑定支付方式。注册后，您可以使用免费资源，体验向量数据库功能并评估使用成本。

## 前提条件\{#before-you-start}

欢迎访问并[注册 Zilliz Cloud](https://cloud.zilliz.com.cn/signup)。

![register_account](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/registeraccount.png "register_account")

## 注册账号\{#sig-up-with-a-work-email-and-password}

<Procedures>

1. 在“企业邮箱”字段中输入您的邮箱地址。

1. 点击“获取验证码”，并输入邮件中接收到的验证码。

1. 在“密码”字段中输入密码。

    您的密码必须符合以下要求：

    - 长度为 8 至 128 个字符

    - 包含大写字母（A–Z）、小写字母（a–z）和数字（0–9）

    - 至少包含一个特殊字符（如 !@#&#36;%^&&ast;）

1. 输入手机号码。

    每个手机号码仅能注册 1 个 Zilliz Cloud 账号。

1. 点击获取验证码，并输入手机短信中接收到的验证码。

1. 阅读并勾选“同意[使用条款](https://zilliz.com.cn/cloud-service-terms)和[隐私政策](https://zilliz.com.cn/cloud-user-policy)”。

1. 点击“注册”按钮。

    邮箱验证码将发送到您填写的邮箱中。

1. 在提示对话框中输入邮箱验证码，并点击“验证”。

    如未收到验证码，请点击“重新发送验证码”。

</Procedures>

<Admonition type="info" title="说明">

- 在使用邮箱和密码首次登录后，请您完成问卷调查。我们希望了解您的数据规模及用例，从而更有效地为您提供服务。

- 出于安全考虑，您的 Zilliz Cloud 控制台会话将在闲置 6 小时后过期。如果会话过期，请重新登录以继续使用控制台。更多详情，可参考[控制台会话](./email-accounts#console-session)。

</Admonition>

## 开始使用免费资源\{#start-with-free-resources}

注册账号后，您即可使用 Free 集群和免费试用资源，测试 Zilliz Cloud 向量数据库特性并评估使用成本，无需绑定支付方式。

| 资源 | 说明 |
| --- | --- |
| Free 集群 | 免费使用基础的向量数据库功能，提供 5 GB 存储（可容纳 100 万个 768 维向量）、每月 250 万免费 vCU 额度和 5 个 Collection。如需更多资源或使用高级功能，请免费试用 Serverless 或 Dedicated 版本。 |
| 免费试用优惠券 | 首次使用企业邮箱注册 Zilliz Cloud 账号时，您的组织将获赠 **¥300** 优惠券，有效期为 **30 天**，可用于试用 Serverless 和按量计费的 Dedicated 集群。优惠券使用完毕或过期时即视为免费试用结束。 |
| 延长优惠券有效期 | 如果您绑定了云市场支付方式，注册时获得的 ¥300 优惠券有效期可延长至 **1 年**。如需更多优惠券或延长试用期，请[联系销售](https://zilliz.com.cn/contact-sales)。 |

<Admonition type="info" title="说明">

免费试用结束后，您的组织将被冻结。在此期间，组织中的 Serverless 和 Dedicated 集群将被移至[回收站](./use-recycle-bin)，您将无法使用 Dedicated 和 Serverless 集群特有的高级功能（如备份恢复、告警等）。

如需解冻组织，请[添加支付方式](./payment-billing)。在此之后，您可以从回收站中恢复数据。如果在组织冻结 30 天后仍未添加支付方式，您的 Serverless 和 Dedicated 集群将被永久删除，但您的组织仍被保留。

</Admonition>

## 常见问题\{#}

### 为什么提示账号注册失败？\{#}

账号注册失败的理由可能是您已使用该邮箱地址或手机号注册过 Zilliz Cloud 账号。这种情况下，您可以使用该邮箱或手机号直接登录 Zilliz Cloud。如果仍然无法解决问题，您可以[提交工单](http://support.zilliz.com.cn)。

## 后续操作\{#}

- 继续使用 Serverless 和 Dedicated 集群：[添加支付方式](./payment-billing)

- 恢复免费试用结束后移入回收站的数据：[回收站](./use-recycle-bin)

- 获取更多优惠券或延长试用期：[联系销售](https://zilliz.com.cn/contact-sales)

