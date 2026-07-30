---
title: "支付方式与账单 | Cloud"
slug: /payment-billing
sidebar_label: "支付方式与账单"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本指南介绍 Zilliz Cloud 支持的支付方式、支付优先级，以及管理发票和订阅时需要注意的事项。 | Cloud"
type: origin
token: Uj7IwJpneijPROkAZN7cJRLInrc
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 支付方式与账单

本指南介绍 Zilliz Cloud 支持的支付方式、支付优先级，以及管理发票和订阅时需要注意的事项。

<Admonition type="info" icon="📘" title="说明">

如需管理支付和账单设置，您必须是组织管理员或组织账单管理员。

</Admonition>

## 支付方式\{#payment-methods}

下表说明 Zilliz Cloud 支持的支付方式，以及各支付方式是否支持 SaaS 和 BYOC 部署。

| **支付方式** | **说明** | **SaaS** | **BYOC** |
| --- | --- | --- | --- |
| 优惠券 | 使用企业邮箱注册 Zilliz Cloud 账号或参与符合条件的 Zilliz Cloud 项目或活动时，您可能会获得优惠券。优惠券可用于抵扣使用 Zilliz Cloud 产生的费用。 | ✅ | ✅ |
| 现金充值（对公转账） | 您可以为 Zilliz Cloud 服务进行现金充值。Zilliz Cloud 会根据用量自动从您的现金余额中扣除费用。进行现金充值前，您需要先完成[企业认证](./enterprise-verification) | ✅ | ✅ |
| 阿里云云市场订阅 | 您通过阿里云云市场接收并支付 Zilliz Cloud 用量的发票。 | ✅ | ❌ |
| 亚马逊云科 Marketplace 订阅 | 您通过亚马逊云科技 Marketplace 接收并支付 Zilliz Cloud 用量的发票。 | ✅ | ❌ |

云市场订阅仅是一种支付方式，与您创建项目、集群及相关资源时使用的云服务提供商无关。

## 支付方式优先级\{#payment-method-priority}

如果您的组织账号中同时具有优惠券、[现金余额](./cash-recharge)和[云市场订阅](./aliyun-marketplace)，则扣费顺序为：优惠券>现金余额>云市场。

例如，当您有一份账单需要支付时，我们会先扣除您的优惠券。如果剩余优惠券不足以抵扣全部账单金额，我们会扣除所有剩余优惠券，剩余账单金额部分将扣除您的现金余额。如扣除优惠券和现金余额后，依旧不足以抵扣全部账单金额，我们将通过您绑定的云市场账号进行扣费。

## 云市场订阅\{#marketplace-subscription}

您可以通过以下云市场订阅 Zilliz Cloud：

- [阿里云云市场](./aliyun-marketplace)

- [亚马逊云科技 Marketplace](./amazon-marketplace-cn)

云市场订阅可让您的组织通过云市场账户接收 Zilliz Cloud 费用账单。当您的财务或采购团队希望将 Zilliz Cloud 使用费用纳入现有云账单时，这种方式非常有用。

云市场价格可能因云服务提供商、地域、集群类型和集群计划而异。详细价格信息，请参见 [Zilliz Cloud 定价](https://zilliz.com.cn/pricing)。

## 角色和权限\{#roles-and-permissions}

支付和账单设置在组织级别进行管理。要查看或更新账单信息，您必须具备相应的组织级权限。

| **角色** | **账单权限** |
| --- | --- |
| 组织管理员 | 可以管理支付方式、账单信息、云市场订阅、发票和账单告警。 |
| 组织账单管理员 | 可以管理支付方式、账单信息、云市场订阅、发票和账单告警。 |
| 其他组织角色 | 无法访问账单信息。如需查看或更新账单设置，请联系组织管理员或组织账单管理员。 |

详情请参见[组织用户](./organization-users)。

## 账单状态和服务影响\{#billing-status-and-service-impact}

组织的账单状态决定您是否可以继续使用 Zilliz Cloud 的付费功能和资源。

- 如果您的组织有有效的优惠券、充足的现金余额或有效的云市场订阅，您可以根据所选版本继续使用服务。

- 如果没有有效的支付方式或可用余额，您的组织可能产生逾期发票、无法使用高级功能，并被冻结。为避免服务中断：

    - 监控优惠券到期时间和剩余优惠券余额。

    - 在现金余额用尽前及时充值。

    - 在云市场订阅到期前续订或更新订阅。

    - 配置账单告警，提前发现支付或使用风险。

如果您的组织被冻结或支付失败，请更新支付方式以恢复访问。详情请参见[处理支付失败与组织冻结](./failed-payments-organization-recovery)。

