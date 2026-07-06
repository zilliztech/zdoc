---
title: "Cost Optimization | Cloud"
slug: /cost-optimization
sidebar_label: "Cost Optimization"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "As data scales and query volumes rise, cost control becomes critical. This guide systematically outlines cost optimization strategies for Zilliz Cloud across five dimensions deployment selection, index tuning, elastic scaling, discounts, and billing analysis. | Cloud"
type: origin
token: MYHwwhKtri4MMJku6BbcMjF4n1d
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Cost Optimization

As data scales and query volumes rise, cost control becomes critical. This guide systematically outlines cost optimization strategies for Zilliz Cloud across five dimensions: deployment selection, index tuning, elastic scaling, discounts, and billing analysis.

## Understand your bill\{#understand-your-bill}

Before optimizing, identify where your costs originate. Zilliz Cloud fees consist of five components:

| Item | Description | Optimizable? |
| --- | --- | --- |
| [Compute (CU)](./dedicated-cluster-cost) | Hourly billing for Dedicated clusters based on Compute Units. | Selection + Scaling |
| [Read/Write Operations](./serverless-cluster-cost) | Pay-per-use billing for Serverless clusters. | Query Optimization |
| [Storage](./storage-cost) | Data and backup storage (regardless of cluster status). | Build Level + Data Cleanup |
| [Data Transfer](./data-transfer-cost) | Ingress, egress, and cross-region transfer. | Architecture Planning |
| [Audit Logs](./audit-log-cost) | Resource consumption for audit logging. | Enable as needed |

For most users, over 70% of costs come from **Compute**, which also offers the greatest optimization potential.

Use the [pricing calculator](https://zilliz.com/pricing#calculator) to get monthly estimates based on vector dimensions, data volume, and QPS requirements. Actual costs are often lower than estimates, as business loads rarely stay at peak capacity indefinitely.

## Choose the right deployment method\{#choose-the-right-deployment-method}

Choosing the right deployment method is your most impactful decision. Selecting the wrong method can lead to costs that minor optimizations cannot bridge.

### Deployment methods at a glance\{#deployment-methods-at-a-glance}

| Type | Price Ref (768-dim) | Capacity/CU | Search QPS | Latency | Use Case |
| --- | --- | --- | --- | --- | --- |
| Free | 0 | 5 GB, ≤5 colls | — | — | Learning, Prototyping |
| Serverless | Pay-per-RU | Auto-scaling | Auto | Medium | Unstable traffic, Dev/Test |
| Dedicated (Performance-optimized) | &#126;&#36;65/M vectors/mo | 2M/CU | 500–1,500 | Low (&lt;10ms p99) | Latency-critical production |
| Dedicated (Capacity-optimized) | &#126;&#36;20/M vectors/mo | 8M/CU | 100–300 | Medium | Large-scale, cost-sensitive |
| Dedicated (Tiered-storage) | &#126;&#36;7/M vectors/mo | 40M/CU (≥8 CU) | 100–150 (Hot) | Higher | Massive data, cold/hot split |
| BYOC | Custom | Custom | Custom | Custom | Compliance, Cloud discounts |

### Selection decision tree\{#selection-decision-tree}

- **Data < 1M vectors, QPS < 50?**
→ Use **Serverless**. Pay only for operations with zero idle cost. Do not provision Dedicated resources for "potential" traffic.

- **Data 1M–50M vectors, need stable low latency?**
→ **Capacity-optimized** cluster is the most cost-effective solution. It is 3x cheaper than the performance-optimized option and offers sub-hundred-millisecond latency, which is more than sufficient for most RAG and recommendation scenarios. Use **performance-optimized** cluster only for extreme requirements (e.g., &lt;10 ms p99 real-time search).

- **Data > 50M vectors, infrequent access?**
→ Use **Tiered-storage** cluster. It is 3x cheaper than the capacity-optimized option and ideal for scenarios with massive data where only a subset is frequently queried (e.g., historical log analysis).

- **Compliance or existing Cloud Discounts (RI/SP)?**
→ **BYOC (Bring Your Own Cloud)**. Clusters run in your VPC, allowing you to leverage enterprise-level cloud discounts and meet data sovereignty requirements.

### Recommendation: capacity-optimized—the best fit for most scenarios\{#recommendation-capacity-optimizedthe-best-fit-for-most-scenarios}

Capacity-optimized cluster is often misunderstood as just a "slower" version. In reality, it is Zilliz Cloud's most architecturally sophisticated product.

While traditional vector databases keep all indexes and raw data in memory, trading cost for speed, capacity-optimized clusters use a **tiered storage architecture**:

- **Layered Storage:** Vector indexes stay in memory for speed, while scalar data and raw vectors are mapped to disk via mmap with intelligent caching. This allows 3x the data density per CU compared to performance-optimized  clusters.

- **DiskANN-level Optimization:** IVF indexes are tuned for disk-friendly access, maximizing throughput with NVMe SSDs to maintain 10–50ms latency—negligible for most AI applications.

- **High Resource Utilization:** Performance-optimized clusters often keep 30% headroom; capacity-optimized clusters can reach 90%+ data density.

**Summary:** Performance-optimized option buys speed with hardware while capacity-optimized option buys efficiency with technology.

### Project plans: Standard vs. Enterprise vs. Business Critical\{#project-plans-standard-vs-enterprise-vs-business-critical}

Zilliz Cloud offers several plans that affect features and scaling limits:

| Feature | Standard | Enterprise | Business Critical |
| --- | --- | --- | --- |
| Max CU | 32 CU | 256 CU | 512 CU |
| Replica Limit | Query CU × Repl ≤ 32 | Query CU × Repl ≤ 256 | Query CU × Repl ≤ 512 |
| SLA | 0.999 | 0.9995 | 0.9999 |
| Multi-AZ | Single AZ | Optional | Enabled by Default |
| RBAC | Basic | Custom Roles + Audit | Full + SOC2/HIPAA |
| BYOC | Not Supported | Supported | Supported |
| Support | Ticket | SA + Slack | 24/7 + 15m Response |

For details, see [Detailed Plan Comparison](./select-zilliz-cloud-service-plans).

**Advice:** Start with **Standard**. Upgrade to **Enterprise** only when you need higher SLAs, Multi-AZ, or larger scale. Upgrades are seamless and require no data migration.

### Common pitfalls\{#common-pitfalls}

1. **Defaulting to performance-optimized cluster:** Many users budget based on performance-optimized clusters used during PoCs. However, capacity-optimized is not a "downgraded" version; it is a purpose-built architecture for cost-efficiency. It provides sufficient QPS for most scenarios at only 1/3 the cost of a performance-optimized cluster.

1. **Overlooking the Tiered-storage option:** At 1/9 the cost of a performance-optimized cluster, a tiered-storage cluster is ideal for data with clear hot/cold access patterns. If only a small fraction of your data requires low latency, the tiered-storage option can reduce costs by an order of magnitude.

1. **Using Dedicated for Small Scales:** For small datasets or unstable traffic, Serverless (pay-per-use) is far more cost-effective than Dedicated. Avoid over-provisioning resources solely for the sake of "enterprise" appearances.

## Index and storage optimization\{#index-and-storage-optimization}

Once the mode is selected, tune parameters to maximize the utility of each CU.

### Index build level: capacity vs. recall\{#index-build-level-capacity-vs-recall}

The [`build_level`](./tune-index-build-level)[ parameter ](./tune-index-build-level)controls index precision and storage density. Reducing it can significantly increase the storage capacity of each CU for scenarios that don't require extreme recall.

- **Performance-optimized cluster (768-dim, per CU):**

    | Build Level | Capacity | Increase | Recall | QPS |
    | --- | --- | --- | --- | --- |
    | Capacity-first (0) | 2.1M | 0.4 | 90–95% | &#126;2,850 |
    | Balanced (1) Default | 1.5M | Baseline | 91–97% | &#126;3,500 |
    | Precision-first (2) | 1.0M | -0.33 | 92–98% | &#126;3,000 |

- **Capacity-optimized cluster (768-dim, per CU):**

    | Build Level | Capacity | Increase | Recall | QPS |
    | --- | --- | --- | --- | --- |
    | Capacity-first (0) | 7M | 0.4 | 89–97% | &#126;300 |
    | Balanced (1) Default | 5M | Baseline | 93–98% | &#126;350 |
    | Precision-first (2) | 3M | -0.4 | 94–98% | &#126;345 |

**Case Study:** A 16 CU capacity-optimized cluster holds 80M vectors by default. Switching to `Capacity-first` increases this to 112M, or allows the same 80M vectors to fit in 12 CUs—**saving 25% in CU costs**.

<Admonition type="info" icon="📘" title="**Note**">

The `build_level` parameter cannot be modified once set. Changing it requires dropping and recreating the index. We recommend evaluating your requirements before creating a collection. This parameter only supports floating-point vector types (FLOAT_VECTOR, FLOAT16_VECTOR, and BFLOAT16_VECTOR).

</Admonition>

### Search level: performance vs. cost\{#search-level-performance-vs-cost}

The [`level`](./tune-recall-rate)[ parameter](./tune-recall-rate) (1–10) controls search precision. 

- **Level 1–3:** Ideal for most scenarios (90–95% recall).

- **Level 4–7:** High-precision scenarios. Trade approximately 2–3× latency for 95–98% recall.

- **Level 8–10:** Extreme precision for high-stakes scenarios (e.g., medical, fraud detection), but significantly increases latency and compute cost.

**Advice:** Measure recall using `enable_recall_calculation=true` and find the lowest level that meets your business requirements. Each level increase raises the computational resources consumed by search — in Serverless cluster, this directly translates to higher Read vCU costs; in Dedicated cluster, it means lower QPS supportable under the same CU allocation.

### Mmap configuration: balancing memory and disk\{#mmap-configuration-balancing-memory-and-disk}

[Memory Mapping (mmap)](./use-mmap) offloads data from memory to disk.

| Cluster Type | Default MMAP Policy | Effect |
| --- | --- | --- |
| Dedicated (Performance-optimized) | Raw vector data only uses mmap; scalar data and all indexes remain in memory | Guarantees low latency |
| Dedicated (Capacity-optimized) | Scalar indexes + all raw data use mmap; only vector indexes remain in memory | Maximizes capacity |
| Free / Serverless | All fields and indexes use mmap | Relies on system cache |

**Optimization recommendations:**

- For performance-optimized clusters, if scalar filtering is not a bottleneck, consider enabling mmap on scalar fields to free up memory for vector indexes.

- For capacity-optimized clusters, the default policy is already storage-first; no additional tuning is generally needed.

<Admonition type="info" icon="📘" title="**Note**">

The Collection must be released before modifying mmap settings, then reloaded afterward. Misconfiguration may cause performance degradation or OOM errors — validate in a test environment first.

</Admonition>

## Query optimization\{#query-optimization}

Efficient queries reduce Read Unit (RU) costs for Serverless users and increase the QPS of Dedicated CUs.

### Index scalar fields\{#index-scalar-fields}

Many users neglect scalar indexing. Without it, filters (e.g., `category == "electronics"` or `timestamp > 1700000000`) trigger a **full collection scan**, which is extremely expensive. You can create indexes for frequently filtered scalar fields.

```python
collection.create_index(
    field_name="category",
    index_name="idx_category"
)
collection.create_index(
    field_name="timestamp",
    index_name="idx_timestamp"
)
```

**Optimization recommendations:**

- Build indexes on all scalar fields that appear in `filter` expressions. Zilliz Cloud automatically selects the appropriate index type (inverted index for strings, sorted index for numerics, etc.).

- Scalar indexes have minimal memory overhead, but deliver order-of-magnitude improvements in filtering performance — turning full table scans into index lookups.

- **Important:** For filtered vector searches on capacity-optimized clusters in particular, the presence or absence of a scalar index directly determines whether query latency is measured in milliseconds or seconds.

### Select appropriate TopK\{#select-appropriate-topk}

[TopK](./single-vector-search) directly affects compute and network overhead. 

| TopK | Relative Latency | Relative RU Cost (Serverless) | Typical Use Case |
| --- | --- | --- | --- |
| 1–10 | Baseline | 1x | RAG (typically 3–5 context chunks) |
| 10–50 | 1.2–1.5x | 1.5–2x | Recommendation systems, search result pages |
| 50–200 | 1.5–3x | 2–4x | Candidate set generation, reranking input |
| 200–1000 | 3–10x | 4–10x | Batch analysis, clustering |

- **RAG:** Use TopK 3–10. More context rarely improves LLM quality and wastes tokens and RU.

- **Recommendations:** Use the limit of your reranking model (typically 20–50).

- **Large TopK:** Use [pagination](./single-vector-search#use-limit-and-offset) (`offset` + `limit`) or [iterators](./with-iterators) instead of returning massive result sets in one request.

### Refine output fields\{#refine-output-fields}

By default, search returns all scalar fields as illustrated below.

```python
results = collection.search(vectors, "embedding", search_params, limit=10)
```

However, returning large text fields (e.g., full document contents) in every query increases latency and RU costs. Therefore, you can specify only necessary output fields.

```python
results = collection.search(
    vectors, "embedding", search_params, limit=10,
    output_fields=["id", "title", "category"]  # 不要返回 "content" 等大字段
)
```

For details, see [Use Output Fields](./single-vector-search#use-output-fields).

**Optimization recommendations:**

- Always explicitly specify `output_fields`, returning only the fields required by your business logic.

- For RAG scenarios, if the original text is needed, consider first retrieving IDs via vector search, then fetching the source content from external storage (e.g., Redis, a database) by ID. This keeps vector search fast while allowing external storage to benefit from caching.

- In Serverless mode, the amount of data returned directly affects Read vCU billing — reducing unnecessary fields is the simplest way to cut costs.

### Utilize partition keys\{#utilize-partition-keys}

[Partition keys](./use-partition-key) automatically distribute data into partitions based on a scalar value, allowing searches to skip irrelevant data.

The following example shows how to specify a partition key when creating a collection:

```python
schema.add_field("tenant_id", DataType.VARCHAR, max_length=128, is_partition_key=True)
```

**Use cases:**

- **Multi-tenant SaaS:** Using `tenant_id` as the partition key ensures each tenant's queries scan only their own data partition, significantly improving both QPS and latency.

- **Category filtering:** Using `category` as the partition key eliminates the need to scan the full dataset when searching within a specific category.

**Performance gain:** Assuming 100 tenants with evenly distributed data, using a partition key reduces the scan volume per query by approximately 99%. Even with uneven distribution, scan volume is typically reduced by 50–90%.

## Elastic scaling\{#elastic-scaling}

The biggest cost trap with Dedicated clusters is "provisioning for peak load and running around the clock." Zilliz Cloud offers three scaling strategies to break this pattern.

### Dynamic scaling\{#dynamic-scaling}

Set a minimum and maximum CU value, and the system scales automatically based on real-time load.

- Query CU scales automatically based on the CU Capacity metric (data-volume-driven)

- Replicas scale automatically based on the CU Computation metric (QPS-driven)

**Typical scenario:** An e-commerce search service that needs 32 CU at daytime peak but only 8 CU overnight. Set min=8, max=32 in the dynamic scaling configuration, and the system automatically scales down to 8 CU during off-peak hours. Assuming 10 off-peak hours per day, monthly compute costs can be reduced by approximately 30–40%.

For details, see [Dynamic Scaling](./undefined#dynamic-scaling).

### Scheduled scaling\{#scheduled-scaling}

Suited for workloads with predictable traffic patterns. Supports Basic mode (simple selectors) and Advanced mode (Unix cron expressions).

**Typical configuration:**

- Scale up to 32 CU at 9:00 on weekdays, scale down to 8 CU at 22:00

- Maintain 8 CU all day on weekends

- Pre-scale for end-of-month promotional periods

For details, see [Scheduled Scaling](./undefined#scheduled-scaling).

### Manual scaling\{#manual-scaling}

Do not overlook the simplest option — when your workload enters a quiet period (e.g., between projects or during off-season), proactively reduce your CU configuration. Many users forget to scale down after a PoC and end up paying for weeks or even months of unnecessary capacity.

For details, see [Manual Scaling](./undefined#manual-scaling).

### Scaling constraints\{#scaling-constraints}

- Query CU × Replica ≤ 10,240

- When Replica > 1, the cluster cannot scale below 12 CU

- When scaling down, data volume must be below 80% of the new CU capacity

- Below 12 CU, only Query CU can be adjusted; above 12 CU, Query CU and Replicas can be adjusted independently

**Recommendation:** Use dynamic scaling for unpredictable traffic; use scheduled scaling for regular traffic patterns. The two can be combined.

## Get more credits and discounts\{#get-more-credits-and-discounts}

Beyond technical optimization, taking full advantage of Zilliz's promotional programs is equally important.

### Credits\{#credits}

| Channel | Credits | Validity | Notes |
| --- | --- | --- | --- |
| New user registration | &#36;100 credits | 30 days | Ready to use immediately, no credit card required |
| Add a payment method | — | Extended to 1 year | Any unused credits are automatically extended upon adding a payment method |
| Recycle Bin | Free | — | Deleted data incurs no charges while in the Recycle Bin |

**Recommendation:** Add a payment method as soon as possible after your initial registration to extend the validity of your &#36;100 credits from 30 days to 1 year, giving you ample time for technical evaluation.

### Dedicated programs\{#dedicated-programs}

| Program | Target Audience | How to Apply |
| --- | --- | --- |
| Zilliz AI Startup Program | Early-stage startups | Apply through the [official website](https://zilliz.com/zilliz-for-startups) to receive additional credits and technical support |
| AI Agent Program | AI Agent developers | Exclusive credits for developers building AI Agent applications. Coming soon. |

### Enterprise customers\{#enterprise-customers}

- **Contact sales for a custom quote:** Enterprise customers can receive discounts through annual subscriptions; [contact sales](https://zilliz.com/contact-sales) for specific pricing.

- **Cloud Marketplace subscriptions:** Subscribing through [AWS](./subscribe-on-aws-marketplace), [Google Cloud](./subscribe-on-gcp-marketplace), [Azure](./subscribe-on-azure-marketplace) Marketplace allows you to consolidate Zilliz Cloud charges into your cloud bill and apply any existing enterprise discounts.

- **Advance pay:** Fund your account via [advance pay](./advance-pay). Deduction priority is: credits > advance pay > cloud marketplace subscriptions/credit cards. Suitable for organizations with budget management requirements.

## Monitor usage page\{#monitor-usage-page}

Optimization is not a one-time effort. Zilliz Cloud provides multi-dimensional cost analysis tools to help you continuously track and optimize spending.

### Visualized Cost Analysis\{#visualized-cost-analysis}

On the **Billing > Usage** page, you can break down your bill across five dimensions:

| **Dimension** | **Purpose** |
| --- | --- |
| Project | Compare usage across different business lines or departments |
| Cluster | Identify which cluster is the primary cost driver |
| Time Period | View day-level trends and detect abnormal fluctuations |
| Cost Type | Break down charges by billing category |
| Cloud Region | Compare costs across regions in multi-region deployments |

Multiple dimensions can be combined as filters. For example, selecting CU costs for a specific project over the last 7 days gives you a precise view of that business line's compute cost trend.

For details, see [Analyze Cost](./analyze-cost).

### RESTful API\{#restful-api}

The [Query Daily Usage](/reference/restful/query-daily-usage-v2) API provides usage data with up to 8 decimal places of precision and can be integrated programmatically into internal FinOps workflows to:

- Automatically generate cost reports

- Integrate with internal budgeting systems

- Set custom alerting rules

### Usage alerts\{#usage-alerts}

It is recommended to monitor [cost metrics](./metrics-alerts-reference#organization-level-metrics) and configure alert thresholds to catch abnormal spending early — particularly in the following scenarios:

- Newly launched clusters, to verify that actual costs match expectations

- After configuring dynamic scaling, to confirm that scaling is functioning correctly

- When new team members may have created unnecessary resources

## Cost optimization checklist\{#cost-optimization-checklist}

A checklist you can act on directly:

**Selection Phase**

**Index Configuration**

**Query Optimization**

**Operations Phase**

**Billing Optimization**

## Summary\{#summary}

Cost optimization on Zilliz Cloud is not about tuning a single parameter — it is a systems effort spanning selection, configuration, querying, operations, and billing. The highest-leverage optimizations are:

1. **Choose capacity-optimized clusters first** — this is not a "downgrade." It is a tiered storage architecture specifically designed for cost efficiency, with unit costs at 1/3 that of performance-optimized clusters, covering more than 90% of production use cases.

1. **Optimize your query patterns** — index scalar fields, control TopK, trim returned fields, and use Partition Keys. Each of these meaningfully reduces per-query cost.

1. **Use elastic scaling** — stop paying for idle resources and save 30–40%.

1. **Tune build level** — store 40% more data on the same CU.

Done well, most users can keep costs well within a reasonable range while meeting their business requirements — and benefit from the technical advantages Zilliz Cloud offers in storage tiering, index optimization, and elastic scheduling.