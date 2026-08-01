---
title: "BYOC 计费模式 | BYOC"
slug: /understand-byoc-billing
sidebar_label: "BYOC 计费模式"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "BYOC 计费基于承诺 vCPU 容量。当您购买 BYOC 时，需要签订一份包含特定承诺 vCPU 容量的合同，该容量决定了您的 BYOC 组织可使用的许可容量。 | BYOC"
type: origin
token: HnUxw64aKibN0RkFBEsceIi2noL
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 了解 BYOC 账单

BYOC 计费基于承诺 vCPU 容量。当您购买 BYOC 时，需要签订一份包含特定承诺 vCPU 容量的合同，该容量决定了您的 BYOC 组织可使用的许可容量。

Zilliz Cloud 支持两种 BYOC 购买方式：**仅承诺用量** 和 **承诺用量 + 按量付费**。

本文介绍 BYOC 的购买方式，以及 Zilliz Cloud 中的计费方式。

## BYOC 购买方式\{#byoc-purchase-options}

Zilliz Cloud 支持两种 BYOC 购买方式：**仅承诺用量** 和 **承诺用量 + 按量付费**。请选择最适合你 BYOC 工作负载可预测性的购买方式。

| 购买方式 | 适用场景 | 计费方式 |
| --- | --- | --- |
| 仅承诺用量 | 稳定且可预测的工作负载 | 你通过合同购买承诺 vCPU 容量。Zilliz Cloud 不会按月生成用量账单。付款方式按照合同约定执行，例如对公转账。如果需要更多容量，请联系你的客户经理团队续签或扩容合同。你可以在 License 页面查看许可容量。 |
| 承诺用量 + 按量付费 | 具有可预测基线、但偶尔会出现用量峰值的工作负载 | 承诺 vCPU 容量是你的最低承诺用量，并通过合同约定。超出承诺容量的用量会按按量付费用量计费。Zilliz Cloud 会为按量付费部分按月生成账单，你必须添加[支持的支付方式](./payment-billing#payment-methods)来支付这些账单。支持的支付方式包括云市场订阅、对公转账等，具体取决于你的合同和账号设置。 |

## Committed vCPU\{#committed-vcpu}

Committed vCPU 是 BYOC 合同中包含的 vCPU 容量。

Committed vCPU 的价格以合同为准，并可能采用阶梯定价。承诺容量越大，可能获得越低的单价。

如需了解准确价格，请参考你的合同，或联系你的客户经理团队。

## 按需 vCPU\{#on-demand-vcpu}

按需 vCPU 仅适用于 **承诺用量 + 按量付费** 购买方式。你可以联系客户经理团队，为你的 BYOC 组织启用按需用量。

启用按需用量后，如果你的实际 BYOC 用量超过了承诺 vCPU 容量，Zilliz Cloud 会将超出部分记录为按需 vCPU 用量。

按需用量以 `vCPU-minute` 为单位计量。

以下公式说明如何计算按需每分钟单价：

```plaintext
按需每分钟单价 = 适用的承诺 vCPU 单价 / (365 x 24 x 60)
```

适用单价基于您的承诺 vCPU 用量所解锁的价格阶梯或合同条款。超出的用量会按计费周期累计并展示。

### 示例\{#example}

假设您适用的承诺 vCPU 单价为 `$900 / vCPU /年`。按需每分钟单价计算如下：

```plaintext
$900 / (365 × 24 × 60) ≈ $0.0017 / vCPU / 分钟
```

如果在一个计费周期内，您的用量比承诺用量超出 `600 vCPU-minute`，则按需 vCPU 用量的预估费用为：

```plaintext
600 × $0.0017 = $1.02
```

## 用量超出合同约定时\{#when-licensed-capacity-is-reached}

如果当前 BYOC 用量达到许可用量，且未启用按需用量，Zilliz Cloud 可能会阻止会进一步增加用量的操作。

| 操作 | 行为 |
| --- | --- |
| 创建集群 | 可能会阻止创建新集群。 |
| 扩容 Query CU | 可能会阻止增加 Query CU。<br/>也可能会阻止增加自动扩缩容的最小或最大 Query CU。 |
| 扩容副本数 | 可能会阻止增加副本数。<br/>也可能会阻止增加自动扩缩容的最小或最大副本数。 |

如需继续扩展资源，请联系客户经理团队，根据合同增加承诺用量或启用按需用量。

## 账单\{#invoices}

对于 **承诺用量 + 按量付费** 购买方式，Zilliz Cloud 会为超出承诺 vCPU 容量的按量用量按月生成账单。你必须添加[支持的支付方式](./payment-billing#payment-methods)来支付这些账单。

对于 BYOC 按需用量，账期可能因合同条款而异。请参考您的合同，了解具体的账期和付款方式。

有关管理账单的详细信息，请参阅[了解账单](./view-invoice)。

<Admonition type="info" icon="📘" title="注意">

如果账单逾期，增加资源用量的操作可能会被阻止，包括创建集群、增加 Query CU 或副本数，以及启用或使用自动扩缩容。

</Admonition>

## 用量页面\{#usage-page}

**用量**页面可帮助您对照承诺用量查看 BYOC 用量。

启用按需用量后，该页面可以按 `vCPU-minute` 展示每日超额用量。承诺部分会显示为基准用量，只有超出承诺的用量才会计入按需用量。

您可以使用该页面了解超额用量发生的时间、哪些项目或区域产生了超额用量，以及超出承诺用量的用量规模。

有关详细信息，请参阅[分析成本](./analyze-cost)。

## 最佳实践\{#best-practices}

- 根据预期的基准生产用量选择承诺 vCPU 用量。

- 如果您的工作负载可能偶尔超过承诺用量，请启用按需用量。

- 定期查看用量页面，识别反复出现的超额用量模式。

- 如果超额用量变得频繁或可预测，请增加承诺用量。

- 在进行大规模扩容之前，确认您的许可用量和按需设置是否能够支持目标配置。

