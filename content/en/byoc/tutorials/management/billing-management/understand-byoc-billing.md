---
title: "Understand BYOC Billing | BYOC"
slug: /understand-byoc-billing
sidebar_label: "Understand BYOC Billing"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide explains how BYOC billing works in Zilliz Cloud, including committed vCPU capacity, usage beyond commitment, invoice display, and usage controls when your licensed capacity is reached. | BYOC"
type: origin
token: VsLcwDK6SiGs0CkJ7i0cmRYWnof
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Understand BYOC Billing

This guide explains how BYOC billing works in Zilliz Cloud, including committed vCPU capacity, usage beyond commitment, invoice display, and usage controls when your licensed capacity is reached.

For BYOC deployments, Zilliz Cloud uses a contract-based billing model. Your organization commits to a licensed vCPU capacity in the contract. If on-demand usage is enabled, usage beyond the committed capacity can be tracked and billed separately based on vCPU-hour usage.

## Billing model\{#billing-model}

BYOC billing consists of two parts:

| Billing component | Description |
| --- | --- |
| Committed vCPU | The vCPU capacity purchased through your contract. This is the baseline licensed capacity available to your BYOC organization. |
| On-demand vCPU | Usage beyond the committed vCPU capacity. If on-demand usage is enabled, Zilliz Cloud tracks the exceeded portion in vCPU-hours and displays the cost on a monthly basis. |

In general:

```plaintext
Total BYOC cost = Committed capacity cost + On-demand cost beyond commitment
```

<Admonition type="info" icon="📘" title="Note">

Invoices are used to summarize usage beyong commitment and estimated charges. Actual payment and settlement terms may depend on your contract. If you have any questions, please contact your account executive team.

</Admonition>

## Committed vCPU\{#committed-vcpu}

Committed vCPU is the vCPU capacity included in your BYOC contract. Your committed capacity defines the licensed usage baseline for your BYOC organization.

Committed vCPU pricing is contract-based and may use tiered pricing. Larger committed capacities may unlock lower unit prices. The following table demonstrates the tiered vCPU unit price.

| **Tiered (vCPU)** | **Unit Price (vCPU/year)** |
| --- | --- |
| 40 | &#36;1000 |
| 41-250 | &#36;900 |
| 251-500 | &#36;800 |
| 500-1000 | &#36;700 |
| 1001-5000 | &#36;600 |
| 5000+ | &#36;500 |

For exact pricing, refer to your contract or contact your executive account team.

## On-demand vCPU\{#on-demand-vcpu}

You can contact your executive account team to enable on-demand usage for your BYOC deployments. If on-demand usage is enabled and your actual BYOC usage exceeds your committed vCPU capacity, Zilliz Cloud records the exceeded portion as on-demand vCPU usage.

On-demand usage is measured in `vCPU-hour`. 

The following formula explains how the on-demand hourly unit price is calculated:

```plaintext
On-demand hourly unit price = applicable committed vCPU unit price / (365 × 24)
```

The applicable unit price is based on the pricing tier unlocked by your committed vCPU capacity or contract terms. The exceeded usage is accumulated and displayed by billing period.

### Example\{#example}

Suppose your applicable committed vCPU unit price is `$900 / vCPU / year`. The hourly On-Demand unit price is calculated as follows:

```plaintext
$900 / (365 × 24) ≈ $0.1027 / vCPU-hour
```

If your usage exceeds the committed capacity by `100 vCPU-hours` in a billing period, the estimated On-demand vCPU usage cost is:

```plaintext
100 × $0.1027 = $10.27
```

## When licensed capacity is reached\{#when-licensed-capacity-is-reached}

If your current BYOC usage reaches the licensed capacity and on-demand usage is not enabled, Zilliz Cloud may block operations that would further increase usage.

| Operation | Behavior |
| --- | --- |
| Create cluster | Creating new clusters may be blocked. |
| Scale Query CU | Increasing Query CU may be blocked.<br/>Increasing the minimum or maximum Query CU for auto scaling may also be blocked. |
| Scale replica | Increasing replicas may be blocked.<br/>Increasing the minimum or maximum replica count for auto scaling may also be blocked. |

If an operation is blocked, you may see the message *"Current usage has reached the limit. Please contact us to expand your licensed capacity."*

To continue expanding resources, contact your executive account team to increase your committed capacity or enable on-demand usage, depending on your contract.

## Invoices\{#invoices}

If on-demand usage is enabled and your BYOC usage exceeds the committed capacity, Zilliz Cloud displays a monthly invoice record for the exceeded usage. You can pay the invoices via the [supported payment methods](./payment-billing#payment-methods).

For BYOC on-demand usage, the invoice grace period may vary depending on your contract terms. Refer to your contract for the applicable grace period and payment schedule.

For details about managing your invoices, see [Manage Invoices](./manage-invoice).

<Admonition type="info" icon="📘" title="Note">

If an invoice becomes overdue, operations that increase resource usage may be blocked, including creating clusters, increasing query CUs or replicas, and enabling or using autoscaling.

</Admonition>

## Usage page\{#usage-page}

The **Usage** page helps you review BYOC usage against your committed capacity.

When on-demand usage is enabled, the page can show daily overage usage in `vCPU-hour`. The committed portion is shown as the baseline capacity, and only usage beyond the commitment is counted as on-demand usage.

Use this page to understand when overage occurred, which projects or regions contributed to the overage, and how much usage exceeded your committed capacity. 

For details, see [Analyze Cost](./analyze-cost).

## Best practices\{#best-practices}

- Choose committed vCPU capacity based on your expected baseline production usage.

- Enable on-demand usage if your workload may occasionally exceed the committed capacity.

- Review the Usage page regularly to identify recurring overage patterns.

- Increase committed capacity if overage becomes frequent or predictable.

- Before large scaling events, confirm whether your licensed capacity and on-demand settings can support the target configuration.

