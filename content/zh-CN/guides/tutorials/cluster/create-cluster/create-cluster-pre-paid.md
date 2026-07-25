---
title: "创建包年包月集群 | Cloud"
slug: /create-cluster-pre-paid
sidebar_key: create-cluster-pre-paid
sidebar_label: "创建包年包月集群"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "包年包月集群采用预付费的计费方式，即先付费后使用，按照订单的购买时长进行结算。包年包月集群一般适用于资源需求相对稳定的长期业务。购买包年包月集群可享受折扣，且购买时长越长，折扣越大。本文介绍如何在 Zilliz Cloud 创建和管理包年包月的 Dedicated 集群。如需了解包年包月集群使用过程中可能会额外产生的费用以及计费规则，请参考了解账单。 | Cloud"
type: origin
token: RY1swXlbQilxR3k42SdczdL0ndc
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 创建集群
  - 创建包年包月集群
  - 包年包月

---

import Admonition from '@theme/Admonition';


# 创建包年包月集群

包年包月集群采用预付费的计费方式，即先付费后使用，按照订单的购买时长进行结算。包年包月集群一般适用于资源需求相对稳定的长期业务。购买包年包月集群可享受折扣，且购买时长越长，折扣越大。本文介绍如何在 Zilliz Cloud 创建和管理包年包月的 Dedicated 集群。如需了解包年包月集群使用过程中可能会额外产生的费用以及计费规则，请参考[了解账单](./view-invoice)。

## 前提条件\{#prerequisites}

- 您具备**组织管理员**或**项目管理员**权限。

- 您的组织已完成[企业认证](./enterprise-certification)。

## 创建包年包月集群\{#create-annual-subscription-cluster}

![Oeusw9TnGhQfe0bLWcGcQoaZn5f](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Oeusw9TnGhQfe0bLWcGcQoaZn5f.png)

上图展示了创建包年包月集群的主要流程和步骤。以下为具体操作说明。

### 步骤 1. 配置包年包月集群\{#step-1-configure-annual-subscription-cluster}

1. 登录 Zilliz Cloud。在合适的项目下点击 **+ 创建集群**。

    ![create-annual-subscription-cluster-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/create-annual-subscription-cluster-cn.png "create-annual-subscription-cluster-cn")

1. 选择 **Dedicated** 部署方式并配置集群。目前仅 Dedicated 集群支持包年包月的计费方式。

    ![configure-annual-subscription-cluster-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/configure-annual-subscription-cluster-cn.png "configure-annual-subscription-cluster-cn")

    <table>
       <tr>
         <th><p><strong>配置项</strong></p></th>
         <th><p><strong>说明</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>集群名称</strong></p></td>
         <td><p>请输入集群的名称。Zilliz Cloud 会提供随机的默认名称，您可按需修改集群名称。</p></td>
       </tr>
       <tr>
         <td><p><strong>云服务提供商和地域</strong></p></td>
         <td><p>请选择集群部署的云服务提供商和地域。所有可选择云服务提供商和地域请参考 <a href="./cloud-providers-and-regions">云服务提供商和地域</a>。</p></td>
       </tr>
       <tr>
         <td><p><strong>计费方式</strong></p></td>
         <td><p>请选择包年包月作为计费方式。</p><p>如需创建按量计费集群，请参考<a href="./create-cluster-on-demand">创建按量计费集群</a></p></td>
       </tr>
       <tr>
         <td><p><strong>购买时长</strong></p></td>
         <td><p>请选择包年包月集群的购买时长。</p><p>如果您选择了亚马逊云科技作为云服务提供商，您仅可以选择 1 年作为购买时长。如需长期包年订阅，请<a href="https://zilliz.com.cn/contact-sales">联系销售</a>获取报价。</p></td>
       </tr>
       <tr>
         <td><p><strong>集群类型和 Query CU 数量</strong></p></td>
         <td><p>集群类型和 Query CU 数量</p><p>界面上提供集群类型的简要介绍，想了解更多相关内容，请参考<a href="./cu-types-explained">选择合适的 CU 类型</a>。</p><p>集群需要的 Query CU 数量由您的数据量决定，欢迎使用<a href="https://zilliz.com.cn/pricing#calculator">价格计算器</a>预估所需 Query CU 数量。</p></td>
       </tr>
       <tr>
         <td><p><strong>备份策略（可选）</strong></p></td>
         <td><p>请按需决定是否开启云备份。开启后，会为该集群定期自动创建备份，可有效保护数据。开启云备份会产生备份费用。</p></td>
       </tr>
    </table>

1. 检查配置并点击**创建**。

1. 阅读并同意 [Zilliz Cloud 服务条款](https://zilliz.com.cn/cloud-service-terms)。

    ![agree-to-annnual-subscription-terms-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/agree-to-annnual-subscription-terms-cn.png "agree-to-annnual-subscription-terms-cn")

### 步骤 2. 支付订单\{#step-2-pay-order}

完成步骤 1 后，Zilliz Cloud 将生成一份类型为**新购**的**待支付**订单。请检查订单内容并及时完成支付。

![pay-annual-subscription-order-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/pay-annual-subscription-order-cn.png "pay-annual-subscription-order-cn")

<Admonition type="info" icon="📘" title="说明">

您可以通过现金余额或者云市场订阅支付包年包月集群订单。但**仅支持单一支付方式**。

订单生成后 7 天内未完成支付，系统将自动取消订单。如仍需创建包年包月集群，请重新完成步骤 1 的操作并支付新订单。

</Admonition>

### 步骤 3. 等待集群创建成功\{#step-3-wait-till-cluster-is-created}

订单支付成功后，Zilliz Cloud 会开始自动为您创建包年包月集群，您将看到以下界面。请及时下载和安全保存集群用户名与密码。

![annual-subscription-cluster-is-being-created-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/annual-subscription-cluster-is-being-created-cn.png "annual-subscription-cluster-is-being-created-cn")

创建集群的过程大约需要 10 分钟，请您耐心等待。当集群状态变为**运行中**时，代表已成功创建包年包月集群。您可以继续[连接集群](./connect-to-cluster)或在集群中[创建 Collection](./manage-collections-sdks)。

## 管理包年包月集群\{#manage-annual-subscription-cluster}

下表展示了您可以对包年包月集群进行的管理操作。

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>是否支持</strong></p></th>
     <th><p><strong>说明</strong></p></th>
   </tr>
   <tr>
     <td><p>挂起集群</p></td>
     <td><p>✖️</p></td>
     <td><p>包年包月集群不可挂起。</p></td>
   </tr>
   <tr>
     <td><p>重命名集群</p></td>
     <td><p>✔️</p></td>
     <td><p>在集群详情页的右上角，在操作下拉菜单中选择重命名。输入新名称名点击保存。</p></td>
   </tr>
   <tr>
     <td><p>删除集群</p></td>
     <td><p>✖️</p></td>
     <td><p>包年包月集群到期前不可自行删除。</p></td>
   </tr>
   <tr>
     <td><p>连接集群</p></td>
     <td><p>✔️</p></td>
     <td><p>详情请见<a href="./connect-to-cluster">连接集群</a></p></td>
   </tr>
   <tr>
     <td><p>修改集群部署方式</p></td>
     <td><p>✖️</p></td>
     <td><p>仅 Dedicated 集群支持包年包月的计费模式。创建包年包月集群后不可修改集群的部署方式。</p></td>
   </tr>
   <tr>
     <td><p>修改集群类型</p></td>
     <td><p>✖️</p></td>
     <td><p>包年包月集群不可修改集群类型。如有任何问题，请<a href="http://support.zilliz.com.cn">联系我们</a>。</p></td>
   </tr>
   <tr>
     <td><p>管理集群容量</p></td>
     <td><p>✔️</p></td>
     <td><ul><li><p>支持集群扩容</p></li><li><p>不支持集群缩容</p></li><li><p>不支持弹性伸缩。</p><p>详情请见<a href="./scale-cluster">集群扩缩容</a>。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>管理集群 Replica</p></td>
     <td><p>✔️</p></td>
     <td><p>仅支持增加集群 Replica 数量，暂不支持减少 Replica 数量。</p><p>详情请见<a href="./manage-replica">管理 Replica</a>。</p></td>
   </tr>
   <tr>
     <td><p>备份恢复</p></td>
     <td><p>✔️</p></td>
     <td><p>当前仅支持为包年包月集群创建备份。创建备份会额外产生费用，按量计费。详情请见<a href="./view-invoice">了解账单</a>。</p><p>如需恢复备份，请<a href="http://support.zilliz.com.cn">联系我们</a>。</p></td>
   </tr>
   <tr>
     <td><p>集群续订</p></td>
     <td><p>✔️</p></td>
     <td><p>当前您只可以在集群升配（扩容、增加 Replica 数量）的同时进行续订操作。详情请见<a href="./scale-cluster">集群扩缩容</a>和<a href="./manage-replica">管理 Replica</a>。</p></td>
   </tr>
   <tr>
     <td><p>退订集群</p></td>
     <td><p>✖️</p></td>
     <td><p>不支持</p></td>
   </tr>
</table>

## 常见问题\{#faqs}

- **为什么我无法创建包年包月集群？**

    如需创建包年包月集群，您需要确保：

    - 您具备**组织管理员**或**项目管理员**权限。

    - 您已绑定的云市场订阅，或者您的组织已完成[企业认证](/docs/enterprise-certification)且组织中[现金余额](./advance-pay)充足。**为什么购买了预付费的包年包月集群，还有后付费账单产生？**

        包年包月集群有部分服务对应的计费项是按量付费的，例如存储、备份服务。例如，您购买了包年包月集群后，使用备份功能时仍将产生备份存储的按量付费账单。

- **如何从按量计费集群转换为包年包月集群？**

    您可以通过迁移操作来完成转换。以下为具体操作步骤：

    1. [创建新的包年包月集群](./create-cluster-pre-paid#create-annual-subscription-cluster)并支付订单。等待包年包月集群创建成功，状态转为运行中。

    1. 通过 Zilliz Cloud [跨集群迁移](./offline-migration)，将按量计费集群中的数据迁移到新创建的包年包月集群中。

        **建议您在按量计费集群停写时进行迁移操作，避免两个集群间数据不一致。**

    1. 数据迁移完成后，验证包年包月集群的连通性和数据量。

    1. 验证成功后，修改上层应用中的配置，切换至包年集群的连接 Endpoint。

    1. 将原按量计费集群删除，释放资源。

- **包年包月集群订单可以通过哪些支付方式支付？**

    您可以通过现金余额或者云市场订阅支付包年包月集群订单。但**仅支持单一支付方式**。例如，当现金余额不足时，系统不会自动通过云市场订阅补足差额，您需先充值现金余额后再完成支付。此外，包年包月集群订单暂不支持使用优惠券抵扣。

