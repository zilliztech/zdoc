---
title: "设置控制台 IP 白名单 | Cloud"
slug: /setup-console-ip-allowlist
sidebar_key: setup-console-ip-allowlist
sidebar_label: "设置控制台 IP 白名单"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "默认情况下，组织用户可以从任意 IP 地址访问组织 Web 控制台。为限制访问并提升安全性，您可以为 Web 控制台配置 IP 白名单。配置后用户只能从指定的 IP 地址访问控制台，例如公司网络的 IP 地址。 | Cloud"
type: origin
token: LgvSwz0qxiSMbik6BlbcSiTpn6g
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 网络
  - 安全

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 设置控制台 IP 白名单

默认情况下，组织用户可以从任意 IP 地址访问组织 Web 控制台。为限制访问并提升安全性，您可以为 Web 控制台配置 IP 白名单。配置后用户只能从指定的 IP 地址访问控制台，例如公司网络的 IP 地址。

控制台 IP 白名单仅针对组织 Web 控制台生效，不影响对项目集群的访问。若需限制对集群的访问，请参阅[设置集群 IP 白名单](./setup-whitelist)。

https://zilliverse.feishu.cn/sync/EaQKd6kURsSBc1bD8Loc4RsjnCg

## 限制\{#limits}

- 您的 Zilliz Cloud 组织需创建**企业版**项目，且该项目中至少需要包含 1 个**运行中**的 **Dedicated** 集群。

- 您的 Zilliz Cloud 组织需要添加支付方式。

- 您需要具备组织管理员权限。

- 控制台 IP 白名单中最多可添加 100 条 IP 地址或 CIDR。

## 添加 IP 地址\{#add-ip-address}

您可以在控制台白名单中添加 IPv4 地址（例如 `192.168.0.0`）或 CIDR（例如 `192.168.0.0/24`）。

建议将当前 IP 地址与常用 IP 地址加入白名单中，以免被锁定。

<Admonition type="info" icon="📘" title="说明">

在白名单中添加 `0.0.0.0/0` 等同于未设置白名单。

</Admonition>

以下 Demo 展示如何将 IP 地址添加到控制台 IP 白名单中。

<Supademo id="cmin14al802xyx20i2xtxddqf?utm_source=link" title=""  />

## 查看 IP 地址\{#view-ip-address}

配置白名单后，您可随时查看白名单中的 IP 列表。

以下 Demo 展示如何查看控制台 IP 白名单中的 IP 地址。

![UYusbiBkUolCwoxMgVAcqzpBnHg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/UYusbiBkUolCwoxMgVAcqzpBnHg.png "UYusbiBkUolCwoxMgVAcqzpBnHg")

## 删除 IP 地址\{#delete-ip-address}

您可以删除某个 IP 或 CIDR 以拒绝来自该地址的控制台访问请求。

如果删除白名单中所有地址，则开放控制台访问，用户可以从任意 IP 地址访问组织 Web 控制台。

以下 Demo 展示如何从控制台 IP 白名单中删除 IP 地址。

<Supademo id="cmin1k7zi00011n0i5c3bc7qj?utm_source=link" title=""  />

## 常见问题\{#faqs}

1. **被锁定无法访问怎么办？**

    当您被锁定，无法访问组织界面时，您将看到以下界面：

    ![N5mDbdzstoRd6bxZ7cJcz8Ghnrc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/N5mDbdzstoRd6bxZ7cJcz8Ghnrc.png "N5mDbdzstoRd6bxZ7cJcz8Ghnrc")

    请尝试以下解决方法：

    - 通过已在白名单中的 IP 地址访问（例如办公室 VPN）。

    - 请仍有访问权限的组织管理员将您当前的 IP 地址添加到白名单中。

    - 若所有组织管理员都无法访问控制台，请[提交工单](http://support.zilliz.com.cn)获取协助。

1. **更新控制台 IP 白名单后，当前已登录组织控制台的用户会受影响吗？**

    白名单更新通常适用于新的登录会话。已登录会话会持续到会话过期或用户主动退出。如需立即生效，请要求组织用户退出登录并重新登录。

1. **MFA 会绕过控制台 IP 白名单吗？**

    不会。[MFA](./multi-factor-auth) 与组织控制台 IP 白名单是相互独立的控制项。

1. **组织控制台 IP 白名单会影响集群访问吗？**

    不会。控制台 IP 白名单只限制对于 Web 控制台的访问。如需限制对集群访问，请[设置集群 IP 白名单](./setup-whitelist)。

1. **使用动态 IP 时应如何配置白名单？**

    如果您的互联网服务提供商（ISP） 会轮换 IP 地址，建议您在白名单中添加一个较小的 CIDR（例如 `/29` 或 `/28`）以覆盖您的 IP 范围。

