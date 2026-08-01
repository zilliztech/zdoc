---
title: "管理订单 | Cloud"
slug: /manage-orders
sidebar_label: "管理订单"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 控制台提供专门的订单页面，方便您统一集中管理订单。 | Cloud"
type: origin
token: FJU5wklQuiAJASkHAFlcQShDn9e
sidebar_position: 10
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 管理订单

Zilliz Cloud 控制台提供专门的订单页面，方便您统一集中管理订单。

在 Zilliz Cloud 中，账单与订单的概念有所不同，主要区别如下：

- **订单**：当您购买、续订、升配 Zilliz Cloud 包年包月集群时生成的记录被称为订单。订单包含了您所购集群的具体信息（如集群配置参数、购买时长等）、价格等细节。订单通常只涉及单次购买交易的信息，每次下单都会生成一个新的订单，展示单次购买交易的详细信息。

- **账单**：账单则是对一定周期内所有消费行为（包括但不限于通过订单产生的费用）的汇总报告。Zilliz Cloud 以月为单位汇总账单。账单不仅涵盖了订单结算的部分，还包含按量计费的资源使用情况、优惠券抵扣等信息。账单包含一段时间内的全部收费项目及其明细，为用户提供更全面的成本视图。

本指南将解释如何管理订单。更多账单单相关说明，请参考[了解账单](./view-invoice)。如需管理订单，您的角色需要为**组织管理员**或**项目管理员**。

## 订单概览\{#order-overview}

目前，仅创建包年包月集群、为包年包月集群升配会生成订单。以下为订单示例。

![order-details-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/order-details-cn.png "order-details-cn")

**订单中仅包含包年包月集群的 CU 费用，需要一次性全部付清**。只有在您付清订单金额后，系统才会开始创建包年包月集群或开始为包年包月集群进行升配。**如果在后续使用包年包月的过程中产生存储、备份的费用，会合并至按量计费部分的费用中。**这部分费用明细需要前往账单中查看。有关账单的详细信息，请参考[了解账单](./view-invoice)。

当前 Zilliz Cloud 中仅会生成两种类型的订单：

| **订单类型** | **说明** |
| --- | --- |
| **新购** | 创建包年包月集群后会生成类型为“新购”的订单。 |
| **升配** | 为包年包月集群进行扩容或增加包年包月集群 Replica 数量后会生成类型为“升配”的订单。 |

订单会有以下几种状态：

| **订单状态** | **说明** |
| --- | --- |
| **已支付** | 订单金额已全部付清。系统将开始为您创建包年包月集群或开始为已创建的包年包月集群进行升配。 |
| **未支付** | 订单金额未付清。需要在订单生成 7 天内完成支付。若未及时在订单生成 7 天内完成支付，订单状态将变为“已超时”。 |
| **已超时** | 订单在生成后 7 天内未完成支付，被自动取消。状态为“已超时”的订单无法继续支付。 |
| **已取消** | 订单被用户手动取消。状态为“已取消”的订单无法再继续支付。 |

<Admonition type="info" icon="📘" title="说明">

订单完成支付后，将归入支付月份的当月账单。

</Admonition>

## 支付订单\{#pay-order}

支付订单前，请先确保已绑定云市场订阅或者组织现金余额充足。包年包月集群订单暂不支持使用优惠券抵扣。

请前往**费用中心>订单**页面。在目标订单的订单状态栏中点击**支付**按钮。

![pay-order-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/pay-order-cn.png "pay-order-cn")

## 取消订单\{#cancel-order}

订单取消后将无法恢复或进行支付，请谨慎操作。

如需取消订单，请前往**费用中心>订单**页面。在目标订单的操作下拉菜单中点击**取消订单**。

![cancel-order-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/cancel-order-cn.png "cancel-order-cn")

在对话框中点击**确定取消**。

![confirm-cancel-order-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/confirm-cancel-order-cn.png "confirm-cancel-order-cn")

## 常见问题\{#faqs}

- **为什么我无法创建包年包月集群？**

    如需创建包年包月集群，您需要确保：

    - 您具备**组织管理员**或**项目管理员**权限。

    - 您的组织已完成[企业认证](https://docs.zilliz.com.cn/docs/enterprise-certification)且组织中现金余额充足。详情请参考[企业认证](./enterprise-verification)和[现金充值（对公转账）](./cash-recharge)

- **为什么购买了预付费的包年包月集群，还有后付费账单产生？**

    包年包月集群有部分服务对应的计费项是按量付费的，例如存储、备份服务。例如，您购买了包年包月集群后，使用备份功能时仍将产生备份存储的按量付费账单。

- **充值后，订单为何还是未支付状态？**

    充值只是增加组织的现金余额。充值后，需要在**费用中心-订单**页面，找到未支付订单进行支付。

- **未支付订单的有效期是多久？**

    下单后，您有 7 天的支付时间，超时未支付，订单将被自动取消。

- **自动取消的订单能否恢复？**

    订单超时未支付时，系统将自动取消订单。自动取消的订单无法恢复或继续支付，请重新提交订单。

- **订单提交失败怎么办？**

    订单提交失败不会生成订单。如遇订单提交失败，请[提交工单](http://support.zilliz.com.cn)。

- **包年包月集群订单可以通过哪些支付方式支付？**

    您可以通过现金余额或者云市场订阅支付包年包月集群订单。但**仅支持单一支付方式**。例如，当现金余额不足时，系统不会自动通过云市场订阅补足差额，您需先充值现金余额后再完成支付。此外，包年包月集群订单暂不支持使用优惠券抵扣。