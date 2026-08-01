---
title: "现金充值（对公转账） | Cloud"
slug: /cash-recharge
sidebar_label: "现金充值（对公转账）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "对公转账是指通过银行汇款的方式将资金充值到您的 Zilliz Cloud 组织现金余额中，用于支付使用 Zilliz Cloud 产生的费用。目前，Zilliz Cloud 界面仅支持通过专属账号进行汇款。 | Cloud"
type: origin
token: JZqrwH8V8i6a3jktSQgcyXAEnAg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 现金充值（对公转账）

对公转账是指通过银行汇款的方式将资金充值到您的 Zilliz Cloud 组织现金余额中，用于支付使用 Zilliz Cloud 产生的费用。目前，Zilliz Cloud 界面仅支持通过**专属账号**进行汇款。

专属账号是指 Zilliz Cloud 为每个组织分配的专属汇款账号，在 Zilliz Cloud [发票](./manage-invoice)信息显示的银行账号基础上增加了 9 位专属识别数字。当您使用专属账号进行汇款时，系统会通过 9 位专属识别数字实时将款项汇入 Zilliz Cloud 银行账户中，5-10 分钟后系统自动将汇款金额充值到对应的 Zilliz Cloud 组织现金余额中。

<Admonition type="info" icon="📘" title="📘 说明">

如需进行现金充值，您需要先通过[企业认证](./enterprise-verification)。

</Admonition>

## 对公转账流程\{#procedures}

下图展示了在 Zilliz Cloud 通过专属账号进行对公转账的主要流程。

![FLFswkIjJhwod6bsBAYcPMNankb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/FLFswkIjJhwod6bsBAYcPMNankb.png)

## 操作步骤\{#add-funds}

<Procedures>

1. **获取专属汇款账号：**

    1. 检查界面右上角的组织是否为需要进行充值的组织。

        <Admonition type="info" icon="📘" title="📘 说明">

        每个 Zilliz Cloud 组织都对应一个专属汇款账号，不可用于其他 Zilliz Cloud 组织。请务必检查组织信息，确保获取对应的专属汇款账号。

        </Admonition>

    1. 点击左侧导航栏中的**账单**并前往**账单概览**页。在**现金余额**部分，点击**充值**按钮。

        ![add-fund-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/add-fund-cn.png "add-fund-cn")

    1. 查看您的专属汇款账号。

        ![bank-transfer-information](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/bank-transfer-information.png "bank-transfer-information")

1. **线下汇款：**

    准备好您的付款银行账号、Zilliz Cloud 专属汇款账号后，前往您付款银行账号对应的网银、手机银行客户端、银行 ATM 机或银行柜台等，将款项转账到 Zilliz Cloud 收款账号中。

    <Admonition type="info" icon="📘" title="📘 说明">

    请务必在汇款前核对账号信息，以免发生错误。

    </Admonition>

1. **检查汇款是否充值到您的 Zilliz Cloud 组织账号中：**

    在您完成线下汇款后，汇款金额预计在 5～10 分钟后充值到您的 Zilliz Cloud 组织账号中，届时您将收到 **Zilliz Cloud 充值成功**的邮件提醒。您可在 Zilliz Cloud 账单概览页的**现金余额**部分查看余额并通过**充值记录**查看充值历史和详情。

    如果您的汇款资金未到账，请通过 finance@zilliz.com 联系我们或[提交工单](http://support.zilliz.com.cn)。

    ![add_fund_history](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/add_fund_history.png "add_fund_history")

</Procedures>

## 常见问题\{#}

- **现金充值（对公转账）可以开发票吗？**

    不可以。根据《中华人民共和国发票管理办法》、《中华人民共和国发票管理办法实施细则》，Zilliz Cloud 只能针对**您已消费**的账单开具发票。对公汇款是对组织的现金余额进行充值。充值预付的款项，由于没有消费，也没有对应的Zilliz Cloud 消费，因此无法申请开具发票。

- **为什么无法进行现金充值？**

    以下情况下可能您无法充值：

    - 组织未完成企业认证。您需要完成组织企业认证后，才能进行现金充值。具体操作请参考[企业认证](./enterprise-verification)。

    - 您的账号不具备操作权限。只有组织管理员和组织账单管理员可以进行现金充值。如果您的权限不足，请联系管理员进行充值。

- **对公转账是否收取手续费？**

    当您通过银行进行转账汇款时，Zilliz Cloud 侧不收取任何手续费，但银行侧可能会收取一定的手续费，请咨询您的汇款银行。