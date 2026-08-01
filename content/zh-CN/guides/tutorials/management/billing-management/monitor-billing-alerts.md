---
title: "设置账单告警 | Cloud"
slug: /monitor-billing-alerts
sidebar_label: "设置账单告警"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "监控账单告警可帮助您跟踪 Zilliz Cloud 组织的近期使用量、优惠券有效期、和现金余额。这些告警有助于您及时发现异常支出，并及时更新支付方式，从而降低服务中断风险。 | Cloud"
type: origin
token: VHz6wyqArieXOpkujoRctW0hnng
sidebar_position: 9
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 设置账单告警

监控账单告警可帮助您跟踪 Zilliz Cloud 组织的近期使用量、优惠券有效期、和现金余额。这些告警有助于您及时发现异常支出，并及时更新支付方式，从而降低服务中断风险。

本指南介绍账单相关告警。如需了解如何配置账单告警，请参见[管理组织告警](./manage-organization-alerts)。

<Admonition type="info" icon="📘" title="说明">

如需查看或管理账单告警，您必须是组织管理员或组织账单管理员。

</Admonition>

## 账单告警指标\{#billing-alert-metrics}

Zilliz Cloud 提供以下账单告警指标。

| **指标** | **说明** | **建议操作** |
| --- | --- | --- |
| 过去一天内用量金额 | 过去一天累计产生的使用费用。 | 将使用量与预算进行比较。如果使用量高于预期，请检查近期使用情况，并按需优化工作负载或调整预算。 |
| 优惠券有效期 | 优惠券距离过期的剩余天数。 | 在优惠券过期前尽快使用优惠券。如果您需要优惠券的有效期，请联系[销售团队](http://zilliz.com.cn/contact-sales)。 |
| 优惠券余额 | 优惠券的剩余余额。 | 在优惠券使用完毕前设置其他支付方式，以避免服务中断。 |
| 现金余额 | 现金充值的余额 | 在余额较低时及时充值，以防止支付问题或服务中断。 |

## 推荐告警\{#}

请根据您组织的支付方式和使用模式配置告警。

<table>
   <tr>
     <th><p><strong>支付设置</strong></p></th>
     <th><p><strong>推荐告警</strong></p></th>
   </tr>
   <tr>
     <td><p>仅使用优惠券</p></td>
     <td><ul><li><p>过去一天内用量金额</p></li><li><p>优惠券有效期</p></li><li><p>优惠券余额</p></li></ul></td>
   </tr>
   <tr>
     <td><p>现金充值</p></td>
     <td><ul><li><p>过去一天内用量金额</p></li><li><p>现金余额</p></li></ul></td>
   </tr>
   <tr>
     <td><p>云市场订阅</p></td>
     <td><ul><li>过去一天内用量金额</li></ul></td>
   </tr>
</table>

## 最佳实践\{#best-practices}

- 根据预期每日支出设置使用量告警。

- 在测试或 PoC 期间监控剩余优惠券。如果需要申请更多优惠券，请联系[销售团队](http://zilliz.com.cn/contact-sales)。

- 监控现金余额，并及时充值或其他更新支付方式，以防止服务中断。

