---
title: "FAQ: Monitors & Metrics | BYOC"
slug: /faq-monitors-and-metrics
sidebar_label: "FAQ: Monitors & Metrics"
beta: FALSE
notebook: FALSE
description: "This topic lists the possible issues about monitors and metrics that you may encounter on Zilliz Cloud and the corresponding solution. | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 9

---

# FAQ: Monitors & Metrics

This topic lists the possible issues about monitors and metrics that you may encounter on Zilliz Cloud and the corresponding solution.

## Contents

- [Why does the cluster’s CU capacity and storage usage increase temporarily during frequent insert and delete operations?](#why-does-the-clusters-cu-capacity-and-storage-usage-increase-temporarily-during-frequent-insert-and-delete-operations)
- [What can I do if my cluster memory quota has been exhausted and I cannot insert data as a result?](#what-can-i-do-if-my-cluster-memory-quota-has-been-exhausted-and-i-cannot-insert-data-as-a-result)
- [Why doesn't the memory consumption decrease even if I dropped a collection?](#why-doesnt-the-memory-consumption-decrease-even-if-i-dropped-a-collection)

## FAQs




### Why does the cluster’s CU capacity and storage usage increase temporarily during frequent insert and delete operations?{#why-does-the-clusters-cu-capacity-and-storage-usage-increase-temporarily-during-frequent-insert-and-delete-operations}

Frequent insert and delete operations trigger an internal process called *[compaction](https://milvus.io/blog/2022-2-21-compact.md)*.

- **For inserts**: Compaction combines smaller segments into larger ones, which can significantly improve search performance.

- **For deletes**: Data is not immediately deleted; instead, it’s marked for deletion and removed only after compaction.

During compaction, new segments are temporarily created, which may lead to a short-term increase in storage usage and CU capacity. Once garbage collection (GC) occurs, old segments are removed, reducing both storage and CU capacity back to expected levels.

This behavior is normal and does not impact system performance.

### What can I do if my cluster memory quota has been exhausted and I cannot insert data as a result?{#what-can-i-do-if-my-cluster-memory-quota-has-been-exhausted-and-i-cannot-insert-data-as-a-result}

You can try the following two methods.

1. [Scale up](./manage-cluster) your cluster to a larger CU size. Clusters with larger CU sizes can handle more data.

1. Release loaded collections that are not frequently used to save memory usage.

### Why doesn't the memory consumption decrease even if I dropped a collection?{#why-doesnt-the-memory-consumption-decrease-even-if-i-dropped-a-collection}

Data in dropped collections are cleaned after 24 hours. Please [submit a request](https://support.zilliz.com/hc/en-us) if your memory consumption still does not drop after 24 hours.
