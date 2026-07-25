---
title: "创建腾讯云私有连接（Private Link） | Cloud"
slug: /setup-a-private-link-tencent-cloud
sidebar_key: setup-a-private-link-tencent-cloud
sidebar_label: "创建腾讯云私有连接（Private Link）"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本小节主要介绍如何在您的腾讯云 VPC 和您托管在腾讯云上的 Zilliz Cloud 集群之间建立私网连接。 | Cloud"
type: origin
token: Pzu4wpY64iWmO6kBsaYcNPmPnNf
sidebar_position: 2
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

# 创建腾讯云私有连接（Private Link）

本小节主要介绍如何在您的腾讯云 VPC 和您托管在腾讯云上的 Zilliz Cloud 集群之间建立私网连接。

您需要在 Zilliz Cloud 项目中创建 Private Endpoint。创建完成后，Private Endpoint 将适用于项目下所有与 Private Endpoint 云服务提供商和地域相同的集群。

<Admonition type="info" icon="📘" title="提示">

Zilliz Cloud 不会针对私网连接收费，但您的云服务提供商可能会[收取一定费用](https://buy.cloud.tencent.com/price/vpc/overview)。

</Admonition>

## 配置思路\{#configuration-roadmap}

如需启用访问 Zilliz Cloud 集群的私网连接，您需要：

- 通过腾讯云控制台指定云服务地域开通私网连接，并在您的 VPC 中创建一个终端节点。

- 将上述信息提交给 Zilliz Cloud 以完成信息登记。

- 前往腾讯云控制台，使用该域名前缀创建一条私网解析记录。

## 前提条件\{#before-you-start}

- 您已经注册了 Zilliz Cloud。

- 您已经创建了 Zilliz Cloud 腾讯云集群。

- 您在上述 Zilliz Cloud 腾讯云集群所在云服务地域有 [VPC](https://console.cloud.tencent.com/vpc/vpc)。

    该 VPC 中部署了需要访问上述 Zilliz Cloud 腾讯云集群的业务资源。如果您尚未创建 VPC，可前往腾讯云[私有网络](https://console.cloud.tencent.com/vpc/vpc)管理界面，完成创建。

## 创建 Private Endpoint\{#create-private-endpoint}

本节将按照配置思路详细介绍如何为您的 Zilliz Cloud 阿里云集群创建私网连接。

登陆 Zilliz Cloud，选择合适的项目。在项目左侧导航栏中选择**网络 > 私网连接**，并单击**创建 Private Endpoint**。

![zh-create-private-link](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/zh-create-private-link.png "zh-create-private-link")

### 步骤 1：选择云服务提供商和地域\{#select-cloud-provider-and-region}

在云服务提供商下拉菜单中选择腾讯云。在地域下拉菜单中选择与您目标集群相同的地域。

![zh-tencent-create-private-link](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/zh-tencent-create-private-link.png "zh-tencent-create-private-link")

### 步骤 2：创建终端服务\{#create-endpoint-service}

登录腾讯云控制台，前往[帐号信息](https://console.cloud.tencent.com/developer)页面获取主帐号 ID。

![MKLlbEdCroYr8ixaijxcxXmTnFf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/MKLlbEdCroYr8ixaijxcxXmTnFf.png "MKLlbEdCroYr8ixaijxcxXmTnFf")

<Admonition type="info" icon="📘" title="说明">

在截图中，界面右上角显示了当前登录帐号的帐号邮箱（`john.doe@zilliz.com`）和帐号类型（`主帐号`）。此时，您可以复制或记录**基本信息**中的**帐号 ID** 右侧显示的字符串。

如果界面右上角显示的帐号类型不是`主帐号`，请向您的组织查询。

</Admonition>

复制主帐号 ID 并粘贴到 Zilliz Cloud 弹窗的**账号 ID** 字段中。

### 步骤 3：创建终端节点\{#create-endpoint}

复制 Zilliz Cloud 控制台上展示的 **Zilliz Cloud 腾讯云帐号 ID (UIN)** 和 **Zilliz 终端节点服务 ID**。

前往腾讯云[终端节点](https://console.cloud.tencent.com/vpc/vpce)管理界面。

<Procedures>

1. 将左上角的云服务地域修改为您的 Zilliz Cloud 腾讯云集群所在地域（示例值为**北京**）。

1. 并在其右侧的下拉选项框中选择需要访问您的 Zilliz Cloud 腾讯云集群的业务资源所在 VPC（示例值为 **Default-VPC (172.21.0.0/16)**）。

1. 单击**新建**，在弹出的**新建终端节点**中填写必要的信息。

    ![CeJ5b0nByojIMXx0r6aclR31ncg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/CeJ5b0nByojIMXx0r6aclR31ncg.png "CeJ5b0nByojIMXx0r6aclR31ncg")

    <table>
       <tr>
         <th><p>参数名称</p></th>
         <th><p>参数说明</p></th>
       </tr>
       <tr>
         <td><p>名称</p></td>
         <td><p>终端节点名称。</p><p>可根据需要自定义。</p></td>
       </tr>
       <tr>
         <td><p>所在地域</p></td>
         <td><p>终端节点所在云服务地域。</p></td>
       </tr>
       <tr>
         <td><p>所属网络</p></td>
         <td><p>需要通过当前终端节点访问您的 Zilliz Cloud 腾讯云集群的业务资源所在 VPC。</p></td>
       </tr>
       <tr>
         <td><p>所属子网</p></td>
         <td><p>已选择的 VPC 中的子网。</p></td>
       </tr>
       <tr>
         <td><p>IP 地址</p></td>
         <td><p>终端节点的 IP 地址。</p><p>可根据需要选择 <strong>自动分配</strong> 或 <strong>手动填写</strong>。</p></td>
       </tr>
       <tr>
         <td><p>服务类型</p></td>
         <td><p>通过当前终端节点连接的服务类型。</p><p>请选择 <strong>私有服务</strong>。</p></td>
       </tr>
       <tr>
         <td><p>对端帐号类型</p></td>
         <td><p>Zilliz Cloud 帐户相关信息。</p><p>请选择 <strong>其它账户</strong>，并填写之前复制或记录的 <strong>Zilliz Cloud 腾讯云帐号 ID (UIN)</strong> 和 <strong>Zilliz 终端节点服务 ID。</strong></p></td>
       </tr>
    </table>

1. 单击**验证**并**确定**后，返回[终端节点](https://console.cloud.tencent.com/vpc/vpce)管理界面。复制 **ID/名称**列中的终端节点实例 ID。

    ![Gb92bR4HRoMBtOxwnDncFJLrnQg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Gb92bR4HRoMBtOxwnDncFJLrnQg.png "Gb92bR4HRoMBtOxwnDncFJLrnQg")

</Procedures>

### 步骤 4：授权终端节点\{#authorize-endpoint}

返回 Zilliz Cloud 控制台，将已创建的腾讯云终端节点实例 ID 填入**终端节点 ID** 字段中，并单击**创建**。

![zh-ali-create-private-link-authorize-endpoint](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/zh-ali-create-private-link-authorize-endpoint.png "zh-ali-create-private-link-authorize-endpoint")

此时会出现如下提示：

![JLrmbTY83oEagxxkmTdcgbGtnHW](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/JLrmbTY83oEagxxkmTdcgbGtnHW.png "JLrmbTY83oEagxxkmTdcgbGtnHW")

稍等片刻，腾讯云控制台[终端节点](https://console.cloud.tencent.com/vpc/vpce)终端管理界面中终端节点的状态将由**待接受**变为**可用**。

![Zv2FbvP6PoRsCTxXhWjccyGXnSd](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Zv2FbvP6PoRsCTxXhWjccyGXnSd.png "Zv2FbvP6PoRsCTxXhWjccyGXnSd")

此时，您需要复制或记录

- 该终端节点的 **IP 地址**（示例值为 **172.21.0.4**）

- 您的 Zilliz Cloud 腾讯云集群私网连接地址 （示例值为 **in01-xxxxxxxxxxx-privatelink.tc-ap-xxxxxxx**）。

## 获取 Private Endpoint\{#obtain-a-private-link}

Private Endpoint 创建完成后，您可以前往**集群详情**页查看该私网连接。此时，切换至腾讯云控制台。可以观察到终端节点的**连接状态**变为**已连接**。

<Admonition type="info" icon="📘" title="说明">

该 Private Endpoint 适用于该项目下所有部署于该云服务和地域的 Dedicated 集群。如果在创建 Private Endpoint 时，该项目下部分 Dedicated 集群正处于维护中或扩缩容过程中，在维护和扩缩容完成后，该 Private Endpoint 会自动适用于这些 Dedicated 集群。

</Admonition>

## 配置私有域解析\{#configure-private-zone}

前往腾讯云[私有域解析](https://console.cloud.tencent.com/privatedns)管理页面。

<Procedures>

1. 开通私有域解析服务。如已开通，可忽略此步骤。

    ![UX11bvnEJo9P6wxFHdicnVCIn6d](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/UX11bvnEJo9P6wxFHdicnVCIn6d.png "UX11bvnEJo9P6wxFHdicnVCIn6d")

1. 进入**私有域列表**，单击**新建私有域**。

    ![O7iPbju0RoHKtnxHHjKcCarLnIh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/O7iPbju0RoHKtnxHHjKcCarLnIh.png "O7iPbju0RoHKtnxHHjKcCarLnIh")

1. 填写私有域解析相关信息。

    ![J25YbPFCYo8j5gxwk98cbjv0nkc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/J25YbPFCYo8j5gxwk98cbjv0nkc.png "J25YbPFCYo8j5gxwk98cbjv0nkc")

    <table>
       <tr>
         <th><p>参数名称</p></th>
         <th><p>参数说明</p></th>
       </tr>
       <tr>
         <td><p>域名</p></td>
         <td><p>Zilliz Cloud 腾讯云集群域名。</p><p>请输入您的 Zilliz Cloud 腾讯云集群所在云服务地域的私有域地址。</p><ul><li><code>vectordb.zilliz.com.cn</code></li></ul></td>
       </tr>
       <tr>
         <td><p>关联 VPC</p></td>
         <td><p>选择关联上述私有域名的 VPC。</p><p>请选择待接入 Zilliz Cloud 腾讯云集群的业务资源所在 VPC。并将其移动到<strong>已选择</strong>列表框中。</p></td>
       </tr>
    </table>

    其它参数保持默认即可。

1. 单击**确定**，即可查看已创建的私有域记录。

    ![IQepbWHV6o7BKixCms0cEQQ3n0O](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/IQepbWHV6o7BKixCms0cEQQ3n0O.png "IQepbWHV6o7BKixCms0cEQQ3n0O")

1. 单击刚才创建的私有域记录**操作**列中的**解析**，并在解析记录列表中添加解析记录。

    ![B4uJbhlDOogfjrxkNjdcaT1fnZC](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/B4uJbhlDOogfjrxkNjdcaT1fnZC.png "B4uJbhlDOogfjrxkNjdcaT1fnZC")

    <table>
       <tr>
         <th><p>参数名称</p></th>
         <th><p>参数说明</p></th>
       </tr>
       <tr>
         <td><p>主机记录</p></td>
         <td><p>您的 Zilliz Cloud 腾讯云集群的私网连接域名前缀。</p><p>如果您的集群 ID 为 <strong>in01-xxxxxxxxxxx</strong>，云地域 ID 为 <strong>tc-ap-xxxxxxx</strong>，则该域名前缀为 <strong>in01-xxxxxxxxxxx-privatelink.tc-ap-xxxxxxx</strong>。例如：</p><ul><li><p><strong>in01-xxxxxxxxxxx-privatelink.tc-ap-beijing</strong> (北京)</p></li><li><p><strong>in01-xxxxxxxxxxx-privatelink.tc-ap-shanghai</strong> (上海)</p></li><li><p><strong>in01-xxxxxxxxxxx-privatelink.tc-na-ashburn</strong> (弗吉尼亚)</p></li></ul></td>
       </tr>
       <tr>
         <td><p>记录类型</p></td>
         <td><p>当前解析记录的类型。</p><p>请选择创建 A 记录。</p></td>
       </tr>
       <tr>
         <td><p>记录值</p></td>
         <td><p>上述域名前缀完成解析后的 IP 地址。</p><p>请输入终端节点实例的 IP 地址。</p></td>
       </tr>
    </table>

    其它参数保持默认即可。添加完成后，单击**保存**。

</Procedures>

## 后续操作\{#next-steps}

在完成私网连接创建和私有域解析配置后，可按照集群详情页面右上角的连接指南使用私网连接进行连通性验证。

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