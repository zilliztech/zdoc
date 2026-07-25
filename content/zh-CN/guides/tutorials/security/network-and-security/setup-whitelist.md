---
title: "设置集群 IP 白名单 | Cloud"
slug: /setup-whitelist
sidebar_key: setup-whitelist
sidebar_label: "设置集群 IP 白名单"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，白名单是项目级别的安全设置，适用于项目下的所有集群。设置后，仅白名单中的 IP 地址可以访问您项目下的所有集群。白名单能够有效降低受到恶意攻击的风险 | Cloud"
type: origin
token: RwEzw2l4siJB5Ake7FOcVU4knre
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 白名单

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 设置集群 IP 白名单

在 Zilliz Cloud 中，白名单是项目级别的安全设置，适用于项目下的所有集群。设置后，仅白名单中的 IP 地址可以访问您项目下的所有集群。白名单能够有效降低受到恶意攻击的风险

本教程将介绍如何设置集群 IP 白名单。

## 前提条件\{#before-you-start}

确保满足以下条件：

开始前，请先确保：

- 您已注册 Zilliz Cloud。如未注册，请先阅读[注册账号](./register-with-zilliz-cloud)并完成注册。

- 您是组织或项目管理员。更多用户角色和权限详情，请阅读[访问控制概览](./access-control-overview)。

## 操作步骤\{#procedure}

<Procedures>

1. 登录 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)。

1. 点击进入需要设置白名单的组织和项目。

1. 在左侧导航栏中，点击 **安全** > **集群 IP 白名单**。随后点击卡片中间的**添加 IP 地址**按钮。

1. 在弹出的对话框中，输入 **IP 地址/CIDR 格式**和**描述**。

1. 字段描述如下表所示。

    <table>
       <tr>
         <th><p><strong>字段</strong></p></th>
         <th><p><strong>描述</strong></p></th>
       </tr>
       <tr>
         <td><p>IP 地址/CIDR 格式</p></td>
         <td><p>您要添加到白名单中的 IP 地址或无类别域间路由（CIDR）。您可最多添加 100 个 CIDR。示例值：192.168.1.1/20。</p></td>
       </tr>
       <tr>
         <td><p>描述</p></td>
         <td><p>白名单 IP 地址或 CIDR 的描述。</p></td>
       </tr>
    </table>

1. 点击 **添加** 完成操作。

</Procedures>

<Admonition type="info" icon="📘" title="说明">

如果未设置集群 IP 白名单，Zilliz Cloud 将允许所有 IP 地址访问项目集群。一旦添加了 CIDR ，仅CIDR 中的 IP 地址可以访问该集群。添加 0.0.0.0/0 的效果等同于未设置白名单。

</Admonition>

![whitelist-ip-access](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/whitelist-ip-access.png "whitelist-ip-access")

## 相关文档\{#related-topics}

- [管理 API 密钥](./manage-api-keys)

- [管理身份凭证](./cluster-credentials)

- [创建私网连接](./setup-a-private-link)

