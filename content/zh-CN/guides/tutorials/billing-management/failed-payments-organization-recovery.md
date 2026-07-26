---
title: "处理支付失败与组织冻结 | Cloud"
slug: /failed-payments-organization-recovery
sidebar_label: "处理支付失败与组织冻结"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "支付失败可能会影响您组织的账单状态，以及对 Zilliz Cloud 付费功能的访问。 | Cloud"
type: origin
token: OzZfwGPsaiFv7zkFpPOcOKddnSd
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 处理支付失败与组织冻结

支付失败可能会影响您组织的账单状态，以及对 Zilliz Cloud 付费功能的访问。

本指南介绍支付失败的常见原因、无法完成支付时的影响，以及如何恢复组织。

<Admonition type="info" icon="📘" title="说明">

如需管理支付和账单设置，您必须是组织管理员或组织账单管理员。

</Admonition>

## 支付失败的常见原因\{#common-causes-for-failed-payments}

支付可能因以下原因失败：

- 现金余额不足。

- 优惠券已用完或已过期。

- 云市场订阅已过期、已取消，或不再关联到 Zilliz Cloud 组织。

## 服务影响\{#service-impact}

如果 Zilliz Cloud 无法完成扣款，且没有有效的优惠券或现金余额，您的组织将产生逾期发票并被冻结。

组织被冻结后：

- Zilliz Cloud 会发送邮件通知，并提供 15 天的宽限期供您支付逾期发票。如果宽限期结束后发票仍未支付，您的数据和资源将被移至回收站。

- 正在运行的服务和高级功能可能会受到限制。

- 您将无法创建新的付费资源。

- 依赖受影响 Zilliz Cloud 资源的应用可能会中断。

## 解冻组织\{#recover-your-organization}

如需恢复访问，请先解决账单问题，并确保您的组织有有效的支付方式或可用余额。

### 如果优惠券已过期或用完\{#if-credits-expired-or-ran-out}

<Procedures>

1. 添加有效的支付方式，例如现金充值或云市场订阅。

1. 如果您已进行现金充值，请检查并保持现金余额充足。

1. 如果您需要额外申请优惠券，请联系 [Zilliz 销售团队](https://zilliz.com.cn/contact-sales)。

</Procedures>

### 如果现金余额不足\{#if-your-advance-pay-balance-is-insufficient}

<Procedures>

1. 进行现金充值。

1. 前往费用中心页面确认现金充值已到账。

1. 如果现金充值后组织仍处于冻结状态，请[提交工单](http://support.zilliz.com.cn)。

</Procedures>

### 如果云市场订阅已过期或被取消\{#if-your-marketplace-subscription-expired-or-was-canceled}

<Procedures>

1. 检查您的云市场订阅。

    如果云市场订阅已被取消，请重新订阅或切换到其他支付方式。

1. 在费用中心页面的**支付方式**区域验证更新后的云市场订阅。

1. 重试支付。如果您仍无法支付逾期发票，请[提交工单](http://support.zilliz.com.cn)。

</Procedures>

## 组织解冻后\{#after-recovering-your-organization}

组织解除冻结后，已移至回收站的数据和资源不会自动恢复。

如需恢复，请进入回收站，并手动恢复所需的数据和资源。

恢复完成后，请验证您的应用是否可以按预期访问已恢复的资源。

## 避免支付问题\{#avoid-payment-issues}

为降低服务中断风险：

- 监控剩余优惠券金额以及优惠券到期时间。

- 在 现金余额用尽前及时充值。

- 为使用量、优惠券和现金余额配置告警。

- 确认云市场订阅已关联到正确的 Zilliz Cloud 组织。

