---
title: "开具发票 | Cloud"
slug: /manage-invoice
sidebar_label: "开具发票"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "您可以对 Zilliz Cloud 上的账单申请开具发票。具体开票方式根据您的支付方式有所不同。 | Cloud"
type: origin
token: JTuUwoHUyiqJU6kuu30cN9ibnkh
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 开具发票

您可以对 Zilliz Cloud 上的账单申请开具发票。具体开票方式根据您的支付方式有所不同。

- 如果您的支付方式为现金充值，您可以通过 Zilliz Cloud 界面手动申请开票。对于按量计费部分的账单，如您未提前手动申请开票，Zilliz Cloud 将于每月 XX 号为上个月符合条件的账单**自动开具增值税专用发票**。已提前开票的账单不会重复开票。

- 如果您开通了阿里云云市场扣费渠道，请通过阿里云云市场申请开票。

<Admonition type="info" icon="📘" title="📘 说明">

预充值不可申请开票。《中华人民共和国发票管理办法》、《中华人民共和国发票管理办法实施细则》规定了只能针对消费者已消费过的订单开具发票。预充值和预付款并未纳入商品消费记录，不具备开具发票的条件。因此，Zilliz Cloud 只能针对您已消费过的订单开具发票。您充值的预付款余额没有消费，也没有对应的 Zilliz Cloud 的产品/服务，因此无法申请开具发票。

</Admonition>

## 通过 Zilliz Cloud 开票\{#invoicing-on-zilliz-cloud}

Zilliz Cloud 支持按账单和按订单开具发票。

- 按账单开票：

    - 支持[手动开票](./manage-invoice#manual)和[系统自动开票](./manage-invoice#automatic)。

    - 仅支持为状态为**已支付**且**未开票**的账单进行手动开票。

    - 状态为**未出账**的账单需要等待出账后方可开票。

    - Zilliz Cloud 账单周期一般为一个完整月，出账日期一般为下个月第一天 00:00:00 UTC。因此**当月不可开票**。更多详情，请参考[账单计费周期](./view-invoice#billing-cycle)。

    - 每月账单中的实际**可开票金额=按量计费总金额-优惠券。**

- 按订单开票：

    - 仅支持为状态为**已支付且未开票**的订单进行开票。

    - 订单在完成支付后，支持随时开票。

    - 订单中的可开票金额为订单中**订单金额**。

### 手动开票\{#manual}

<Procedures>

1. 选择组织并点击左侧导航栏中的**费用中心**。

1. 为账单和订单开具发票的入口所有不同：

    - 为账单开票：打开**发票**页签。点击**可开票账单**。勾选一张或多张您希望开具发票的账单。在底部提示栏上，您可查看已选中的开票账单数量及开票总金额。确认无误后，请点击**开票**按钮。

        ![invoicing-bills-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/invoicing-bills-cn.png "invoicing-bills-cn")

    - 为订单开票：打开**发票**页签。点击**可开票订单**。勾选一张或多张您希望开具发票的订单。在底部提示栏上，您可查看已选中的开票订单数量及开票总金额。确认无误后，请点击**开票**按钮。

        ![invoicing-orders-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/invoicing-orders-cn.png "invoicing-orders-cn")

1. 选择发票抬头类型。如选择个人抬头，Zilliz Cloud 仅支持开具增值税普通发票。如需开具增值税专用发票，请选择企业抬头。

    ![invoicing-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/invoicing-cn.png "invoicing-cn")

1. 选择发票类型并填写所需开票信息。

    - 如选择开具增值税普通发票，相关参数请见下表。**发票抬头**和**统一社会信用代码**自动录入企业认证中的信息，且不可修改。

        | **参数** | **描述** |
        | --- | --- |
        | **发票备注（可选）** | 发票备注不得超过 50 个字符。 |
        | **发票接收邮箱** | 用于接收开票结果和发票的邮箱地址。最多可输入 5 个邮箱地址。 |

    - 如选择开具增值税专用发票，相关参数请见下表。**发票抬头**、**统一社会信用代码**、**注册地址**和**注册电话**自动录入企业认证中的信息，且不可修改。

        | **参数** | **描述** |
        | --- | --- |
        | **开户银行（可选）** | 你开立待登记银行帐户的银行名称 |
        | **银行帐户（可选）** | 待登记的银行帐户号码 |
        | **发票备注（可选）** | 发票备注不得超过 50 个字符。 |
        | **发票接收邮箱** | 用于接收开票结果和发票的邮箱地址。最多可输入 5 个邮箱地址。 |

1. 开票信息填写完毕并确认无误后，点击**申请开票**。

1. 我们预计在 1～3 个工作日后以邮件形式通知您开票结果。如开票成功，您可在 **Zilliz Cloud 开票成功**通知邮件中下载发票。

</Procedures>

<Admonition type="info" icon="📘" title="📘 说明">

已开票的账单和订单不支持重复开票。如有疑问请通过 finance@zilliz.com 联系我们。

</Admonition>

### 系统自动开票\{#automatic}

对于按量计费部分的账单，如您未提前申请开票，Zilliz Cloud 将于每月 XX 号为上个月符合条件的账单自动开具**增值税专用发票**。

系统自动开票遵循以下规则：

- 仅适用于按量计费的账单。

- 默认开具增值税专用发票。

- 已提前开票的账单不会重复开票。

- 包年订单不参与系统自动开票，仍需您[手动申请开票](./manage-invoice#manual)。

- 开票信息将从[企业认证](./enterprise-verification)信息中获取。如组织未完成企业认证，自动开票将失败。

- 自动开票结果将发送给组织管理员和账单管理员。

- 如您对系统自动开票金额有疑问，请通过 finance@zilliz.com 联系我们，我们将根据实际情况协助处理。

## 通过阿里云云市场开票\{#invoicing-on-alibaba-cloud-marketplace}

如您开通了阿里云云市场扣费渠道并需要开具发票，请参考[申请发票](https://help.aliyun.com/document_detail/150571.html)。

## 通过亚马逊云科技 Marketplace 开票\{#invoicing-on-amazon-marketplace}

如您开通了亚马逊云科技 Marketplace 扣费渠道并需要开具发票，请参考[发票信息指南](https://www.amazonaws.cn/support/fapiao/?nc1=h_ls)。

## 常见问题\{#}

- **申请开票后，何时可以完成开票？**

    Zilliz Cloud 预计在 1～3 个工作日后通知您开票结果。开票成功后，电子发票将发送至申请开票时留存的邮箱地址。您也可通过开票历史页直接下载。若您在超过 15 个工作日仍未收到发票，请通过 finance@zilliz.com 联系我们。

- **发票申请有时间限制吗？**

    请在出账单后的 3 个自然日内完成开票申请，否则账单将自动进入开票流程。

- **一张月账单是否可以分开为多张发票？**

    不可以。一张月账单对应一张发票。

- **公司的营业执照名称发生变更后，发票抬头需要更新怎么办？**

    如果您公司的营业执照名称发生变更，开具发票前请先[联系我们](http://support.zilliz.com.cn)修改企业认证信息。

- **电子发票的邮箱地址写错了，发送到其他邮箱了，怎么办？**

    已经发送的发票无法撤回，请前往 Zilliz Cloud **账单-发票-开票历史**界面手动下载发票。

- **电子发票能否换成纸质发票？**

    根据国家税务总局公告 2024 年第 11 号，Zilliz Cloud 不再支持纸质发票申请。数字化电子发票与纸质发票具有同等法律效力。

- **开票信息有误怎么办？**

    因用户提交的开票信息有误等原因造成的开票问题，请通过 finance@zilliz.com 联系我们。

- **优惠券抵扣的金额是否可以开票？**

    不可以。Zilliz Cloud 只支持对消费部分开具发票，使用优惠券抵扣的金额不开具发票。

- **系统自动开票会开具什么类型的发票？**

    系统自动开票默认开具增值税专用发票。

