---
title: "创建亚马逊云科技 PrivateLink | Cloud"
slug: /setup-a-private-link-amazon-cloud
sidebar_key: setup-a-private-link-amazon-cloud
sidebar_label: "创建亚马逊云科技 PrivateLink"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本小节主要介绍如何在您的亚马逊云科技 VPC 终端节点和您托管在亚马逊云科技云上的 Zilliz Cloud 集群之间建立私网连接（PrivateLink）。 | Cloud"
type: origin
token: EAJywEPq2iGDmNkEDDxcJDYPnsg
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 私网
  - 腾讯云

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 创建亚马逊云科技 PrivateLink

本小节主要介绍如何在您的亚马逊云科技 VPC 终端节点和您托管在亚马逊云科技云上的 Zilliz Cloud 集群之间建立私网连接（PrivateLink）。

您需要在 Zilliz Cloud 项目中创建 Private Endpoint。创建完成后，Private Endpoint 将适用于项目下所有与 Private Endpoint 云服务提供商和地域相同的集群。

<Admonition type="info" icon="📘" title="提示">

Zilliz Cloud 不会针对私网连接收费，但您的云服务提供商可能会[收取一定费用](https://www.amazonaws.cn/privatelink/pricing/)。

</Admonition>

## 配置思路\{#configuration-roadmap}

如需启用访问 Zilliz Cloud 集群的私网连接，您需要：

- 通过亚马逊云科技控制台在您的 VPC 中创建一个终端节点，并为其选择 VPC、安全组和子网。

- 将上述信息提交给 Zilliz Cloud 注册私网连接。Zilliz Cloud 将根据提交的信息为您的集群分配一个域名前缀。

- 前往亚马逊云科技控制台，使用该域名前缀创建一条私网解析记录。

## 前提条件\{#before-you-start}

请先确保：

- 您已[创建](./create-cluster-on-demand)了 1 个部署在亚马逊云科技上的 Dedicated 集群。

## 创建 Private Endpoint\{#create-private-endpoint}

登录Zilliz Cloud，并在左侧导航栏顶部的下拉菜单中选择目标项目。

在项目左侧导航栏中选择**安全** > **私网连接**，并单击**创建私网连接**。

您还可以在**集群详情**页面中的**连接信息**区域中单击**创建私网连接**。

![zh-create-private-link](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/zh-create-private-link.png "zh-create-private-link")

### 步骤 1：选择云服务提供商和地域\{#select-cloud-provider-and-region}

在云服务提供商下拉菜单中选择亚马逊云科技。在地域下拉菜单中选择与您目标集群相同的地域。

### 步骤 2：创建 Endpoint\{#create-endpoint}

<Procedures>

1. 复制 Zilliz Cloud 界面上展示的**服务名称**。

    ![zh-amazon-create-private-link-copy-service-name](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/zh-amazon-create-private-link-copy-service-name.png "zh-amazon-create-private-link-copy-service-name")

1. 前往亚马逊云科技 [VPC 控制面](https://console.amazonaws.cn/vpc/)板，在左侧菜单中，选择**终端节点**。点击右上角按钮，**创建终端节点**。

    ![S0eDba5rKoyTq7xDzUNc86OonJh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/S0eDba5rKoyTq7xDzUNc86OonJh.png "S0eDba5rKoyTq7xDzUNc86OonJh")

1. 在**创建终端节点**页面中的**服务类别**区域，选择**其他终端节点服务**。

1. 在**服务名称**输入框中，输入此前在 Zilliz Cloud 界面获取到的**服务名称**信息。点击**验证服务**。

    ![AjYKbFAvNoL7KPxDaDZc2BTmnId](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/AjYKbFAvNoL7KPxDaDZc2BTmnId.png "AjYKbFAvNoL7KPxDaDZc2BTmnId")

1. 服务名称通过验证后，选择**VPC**、**子网**与**安全组**，并点击创建。

    ![CIesb2ANUosJF6xuJRrcg8hUn4y](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/CIesb2ANUosJF6xuJRrcg8hUn4y.png "CIesb2ANUosJF6xuJRrcg8hUn4y")

1. 等待终端节点创建完成。复制 VPC 终端节点 ID。

    ![vpc-id](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/vpc-id.png "vpc-id")

</Procedures>

### 步骤 3：授权终端节点\{#authorize-endpoint}

返回 Zilliz Cloud 界面，输入**终端节点 ID** 并点击创建。

![zh-amazon-authorize-private-endpoint](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/zh-amazon-authorize-private-endpoint.png "zh-amazon-authorize-private-endpoint")

此时 Zilliz Cloud 界面会出现如下提示：

![MxnvbNInBoM8a3xwHImcjwUInBj](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/MxnvbNInBoM8a3xwHImcjwUInBj.png "MxnvbNInBoM8a3xwHImcjwUInBj")

## 获取 Private Endpoint\{#obtain-a-private-link}

在您创建 Zilliz Cloud VPC 终端节点后，Zilliz Cloud 会进行验证。验证通过后，Zilliz Cloud 会为该终端节点分配一个私网连接。您可以前往**集群详情**页查看该私网连接。

<Admonition type="info" icon="📘" title="说明">

该 Private Endpoint 适用于该项目下所有部署于该云服务和地域的 Dedicated 集群。如果在创建 Private Endpoint 时，该项目下部分 Dedicated 集群正处于维护中或扩缩容过程中，在维护和扩缩容完成后，该 Private Endpoint 会自动适用于这些 Dedicated 集群。

</Admonition>

## 设置 DNS 服务\{#set-up-a-dns-record}

在通过 Zilliz Cloud 分配的私网连接访问集群之前，您必须在您的 DNS 区域中创建一个 CNAME 记录，以将私网连接解析为您的 VPC 终端节点的 DNS 名称。

<Procedures>

1. **使用 Amazon Route 53 创建一个托管区域**

    Amazon Route 53 是一个基于 Web 的 DNS 服务。你需要创建一个 DNS 托管区域，以便向其中添加 DNS 记录。

    ![HiFtbITqAoe1EuxxUMpcA03vnCb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/HiFtbITqAoe1EuxxUMpcA03vnCb.png "HiFtbITqAoe1EuxxUMpcA03vnCb")

    ![PeJsb8ukDo59iDxRhXpcrEGRnmy](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/PeJsb8ukDo59iDxRhXpcrEGRnmy.png "PeJsb8ukDo59iDxRhXpcrEGRnmy")

    1. 登录您的亚马逊云科技账号并前往[托管区域](https://cn-northwest-1.console.aws.amazon.cn/route53/v2/hostedzones#)。

    1. 点击创建托管区域。

    1. 在托管区域配置部分，设置以下参数。

        <table>
            <tr>
                <th><p>参数名称</p></th>
                <th><p>参数说明</p></th>
            </tr>
            <tr>
                <td><p>域名</p></td>
                <td><p>这是您要将流量路由到其中的域的名称。<br/>此处应填写Zilliz Cloud 为目标集群分配的私网连接。</p></td>
            </tr>
            <tr>
                <td><p>描述</p></td>
                <td><p>您可以使用此值来区分具有相同名称的托管区。</p></td>
            </tr>
            <tr>
                <td><p>类型</p></td>
                <td><p>类型说明了您希望通过互联网还是在 Amazon VPC 中路由流量。<br/>您应该选择私有托管区。</p></td>
            </tr>
        </table>

    1. 在要与托管区关联的 VPC 中，添加您的 VPC ID。

1.  **在托管区中创建别名记录**

    Amazon Route 53 别名记录为 DNS 功能提供特定于 Route 53 的扩展。别名记录允许您将流量路由到选定 Amazon 资源。它们还允许您将流量从托管区域中的一个记录路由到另一个记录。创建别名记录后，您就可以将 Zilliz Cloud 私网连接映射到您的 VPC 终端节点 DNS 名称。

    ![G7Thb5aBaoEVQWxadcvcuLkFnwd](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/G7Thb5aBaoEVQWxadcvcuLkFnwd.png "G7Thb5aBaoEVQWxadcvcuLkFnwd")

    1. 在已创建的托管区详情页上，点击创建记录。

    1. 在创建记录页上，切换至别名，并进行如下操作：

        1. 在第一个下拉菜单中选择  **VPC 终端节点别名**。

        1. 在第二个下拉菜单中选择云服务地域。

        1. 输入此前创建的终端节点名称。

    1. 点击创建记录。

</Procedures>

## 后续操作\{#next-steps}

在完成私网连接创建和 DNS 设置后，可按照集群详情页面右上角的连接指南使用私网连接进行连通性验证。

## 管理集群公网访问\{#manage-internet-access-to-your-clusters}

完成配置私网连接后，您可以选择关闭和限制集群的公网访问能力（Public Endpoint）。关闭后，您只可以使用私网连接访问该集群。

如需关闭公共 Endpoint，请按以下步骤操作：

<Procedures>

1. 前往目标集群的**集群详情**页面。

1. 找到**连接信息**部分。

1. 点击集群公共 Endpoint 旁边的**设置图标**。

1. 阅读弹窗信息，然后点击**关闭**。

</Procedures>

<Admonition type="info" icon="📘" title="说明">

- 私网连接仅影响[数据面（Data Plane）](/reference/restful/data-plane)的操作。[控制面（Control Plane）](/reference/restful/control-plane)的操作仍然可以通过公网进行。

- 重新启用公共 Endpoint 后，请您耐心等待。本地 DNS 缓存过期后公网访问才可生效。

</Admonition>

![disable_public_endpoint_cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/disable_public_endpoint_cn.png "disable_public_endpoint_cn")

## 常见问题\{#faq}

**能否为已有集群创建 Private Endpoint？**
可以。当您创建 Private Endpoint 后，它将自动适用于同一项目下且部署在同一个云服务地域的所有 Dedicated 集群。您只需为不同的集群添加对应的 DNS 记录即可。