---
title: "Understand BYOC Billing | BYOC"
slug: /understand-byoc-billing
sidebar_key: understand-byoc-billing
sidebar_label: "Understand BYOC Billing"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "BYOC billing is based on committed vCPU capacity. When you purchase BYOC, you sign a contract for a certain amount of committed vCPU capacity, which defines the licensed capacity available to your BYOC organization. | BYOC"
type: origin
token: VsLcwDK6SiGs0CkJ7i0cmRYWnof
sidebar_position: 0
keywords: 
  - zilliz
  - vector database
  - cloud
  - payment
  - billing
  - byoc

---

import Admonition from '@theme/Admonition';


# Understand BYOC Billing

BYOC billing is based on committed vCPU capacity. When you purchase BYOC, you sign a contract for a certain amount of committed vCPU capacity, which defines the licensed capacity available to your BYOC organization.

Zilliz Cloud supports two BYOC purchase options: **Commit only** and **Commit + on-demand**. 

This guide explains how BYOC purchase options and how billing works in Zilliz Cloud.

## BYOC purchase options\{#byoc-purchase-options}

Zilliz Cloud supports two BYOC purchase options: **Commit only** and **Commit + on-demand**. Choose the option that best matches how predictable your BYOC workload is.

<table>
   <tr>
     <th><p><strong>Purchase option</strong></p></th>
     <th><p><strong>Best for</strong></p></th>
     <th><p><strong>How billing works</strong></p></th>
   </tr>
   <tr>
     <td><p>Commit only</p></td>
     <td><p>Stable and predictable workloads</p></td>
     <td><p>You purchase committed vCPU capacity through a contract. Usage does not generate monthly invoices in Zilliz Cloud. Payment is handled according to your contract, such as through Advance Pay or a cloud marketplace private offer. If you need more capacity, contact your account executive team to renew or expand your contract. You can view your licensed capacity on the <strong>License</strong> page.</p></td>
   </tr>
   <tr>
     <td><p>Commit + on-demand</p></td>
     <td><p>Workloads with a predictable baseline and occasional usage spikes</p></td>
     <td><p>Your committed vCPU capacity is the minimum committed usage and is handled through your contract. Usage that exceeds the committed capacity is charged as on-demand usage. Zilliz Cloud generates monthly invoices for the on-demand portion, and you must add a <a href="./payment-billing#payment-methods">supported payment method</a> to pay these invoices. Supported payment methods include cloud marketplace subscription, credit card, and Advance Pay, depending on your contract and account setup.</p></td>
   </tr>
</table>

## Committed vCPU\{#committed-vcpu}

Committed vCPU is the vCPU capacity included in your BYOC contract. Your committed capacity defines the licensed usage baseline for your BYOC organization.

Committed vCPU pricing is contract-based and may use tiered pricing. Larger committed capacities may unlock lower unit prices. 

For exact pricing, refer to your contract or contact your executive account team.

## On-demand vCPU\{#on-demand-vcpu}

On-demand vCPU applies only to the **Commit + on-demand** purchase option. You can contact your account executive team to enable on-demand usage for your BYOC deployments.

If on-demand usage is enabled and your actual BYOC usage exceeds your committed vCPU capacity, Zilliz Cloud records the exceeded portion as on-demand vCPU usage.

On-demand usage is measured in `vCPU-minute`.

The following formula explains how the on-demand unit price is calculated:

```plaintext
On-demand per-minute unit price = applicable committed vCPU unit price / (365 × 24 × 60)
```

The applicable unit price is based on the pricing tier unlocked by your committed vCPU capacity or contract terms. The exceeded usage is accumulated and displayed by billing period.

### Example\{#example}

Suppose your applicable committed vCPU unit price is `$900 / vCPU / year`. The per-minute On-Demand unit price is calculated as follows:

```plaintext
$900 / (365 × 24 × 60) ≈ $0.0017 / vCPU / minute
```

If your usage exceeds the committed capacity by `600 vCPU-minute` in a billing period, the estimated On-demand vCPU usage cost is:

```plaintext
600 × $0.0017 = $1.02
```

## When licensed capacity is reached\{#when-licensed-capacity-is-reached}

If your current BYOC usage reaches the licensed capacity and on-demand usage is not enabled, Zilliz Cloud may block operations that would further increase usage.

<table>
   <tr>
     <th><p>Operation</p></th>
     <th><p>Behavior</p></th>
   </tr>
   <tr>
     <td><p>Create cluster</p></td>
     <td><p>Creating new clusters may be blocked.</p></td>
   </tr>
   <tr>
     <td><p>Scale Query CU</p></td>
     <td><p>Increasing Query CU may be blocked. </p><p>Increasing the minimum or maximum Query CU for auto scaling may also be blocked.</p></td>
   </tr>
   <tr>
     <td><p>Scale replica</p></td>
     <td><p>Increasing replicas may be blocked. </p><p>Increasing the minimum or maximum replica count for auto scaling may also be blocked.</p></td>
   </tr>
</table>

If an operation is blocked, you may see the message *"Current usage has reached the limit. Please contact us to expand your licensed capacity."*

To continue expanding resources, contact your executive account team to increase your committed capacity or enable on-demand usage, depending on your contract.

## Invoices\{#invoices}

For Commit + on-demand, Zilliz Cloud generates monthly invoices for on-demand usage that exceeds your committed vCPU capacity. You must add a [supported payment method](./payment-billing#payment-methods) to pay these invoices.

For BYOC on-demand usage, the invoice period and payment schedule may vary depending on your contract terms. Refer to your contract for details.

For details about managing your invoices, see [Manage Invoices](./manage-invoice).

<Admonition type="info" icon="📘" title="Note">

If an invoice becomes overdue, operations that increase resource usage may be blocked, including creating clusters, increasing query CUs or replicas, and enabling or using autoscaling.

</Admonition>

## Usage page\{#usage-page}

The **Usage** page helps you review BYOC usage against your committed capacity.

When on-demand usage is enabled, the page can show daily overage usage in `vCPU-minute`. The committed portion is shown as the baseline capacity, and only usage beyond the commitment is counted as on-demand usage.

Use this page to understand when overage occurred, which projects or regions contributed to the overage, and how much usage exceeded your committed capacity. 

For details, see [Analyze Cost](./analyze-cost).

## Best practices\{#best-practices}

- Choose committed vCPU capacity based on your expected baseline production usage.

- Enable on-demand usage if your workload may occasionally exceed the committed capacity.

- Review the Usage page regularly to identify recurring overage patterns.

- Increase committed capacity if overage becomes frequent or predictable.

- Before large scaling events, confirm whether your licensed capacity and on-demand settings can support the target configuration.

