---
title: "FAQ：监控与指标 | BYOC"
slug: /faq-monitors-and-metrics
sidebar_label: "FAQ：监控与指标"
beta: FALSE
notebook: FALSE
description: " | BYOC"
type: origin
token: YVAzwqHdti7uHSkZL6icsY7hnpe
sidebar_position: 9

---

# FAQ：监控与指标

本文列举了在 Zilliz Cloud 使用监控与指标时可能遇到的常见问题及对应解决方法。

## 目录

- [频繁进行数据插入和删除操作时，为什么集群 CU 加载容量和存储用量这两个指标会上升？](#why-does-the-cluster-s-cu-capacity-and-storage-usage-increase-temporarily-during-frequent-insert-and-delete-operations)
- [集群容量达到上限后，无法插入数据。如何解决这个问题？](#what-can-i-do-if-my-cluster-memory-quota-has-been-exhausted-and-i-cannot-insert-data-as-a-result)
- [为什么删除 Collection 后，内存用量依旧保持不变？](#why-doesnt-the-memory-consumption-decrease-even-if-i-dropped-a-collection)

## 问答




### 频繁进行数据插入和删除操作时，为什么集群 CU 加载容量和存储用量这两个指标会上升？ \{#why-does-the-cluster-s-cu-capacity-and-storage-usage-increase-temporarily-during-frequent-insert-and-delete-operations}

频繁的插入和删除操作会触发内部的 *[Compaction](https://milvus.io/blog/2022-2-21-compact.md)* 机制。

- 对于插入操作：Compaction 会将较小的 Segment 合并为一个或多个大 Segment，从而显著提升搜索性能。

- 对于删除操作：数据不会立即被删除，而是被标记为删除，只有在 Compaction 之后才会被彻底删除。

Compaction 过程中会暂时创建新的 Segment，因此会导致 CU 加载容量和存储用量两个指标在短期内上升。而垃圾回收（GC）过程将删除旧的 Segment。因此 GC 后，CU 加载容量和存储用量两个指标将下降。 

上述情况为预期内现象，不会影响您的系统性能。

### 集群容量达到上限后，无法插入数据。如何解决这个问题？ \{#what-can-i-do-if-my-cluster-memory-quota-has-been-exhausted-and-i-cannot-insert-data-as-a-result}

请尝试以下 2 种方法：

1. 为您的集群[扩容](./scale-cluster)，选择更大的 CU 大小。集群 CU 大小越大，集群可以处理的数据越多。

1. 释放一些已加载但不常用的 Collection。这能够帮助您节省内存用量。

### 为什么删除 Collection 后，内存用量依旧保持不变？ \{#why-doesnt-the-memory-consumption-decrease-even-if-i-dropped-a-collection}

删除的 Collection 数据将于 24 小时后被彻底清理。如果内存用量在 24 小时后仍未下降，请[提交工单](https://support.zilliz.com.cn/hc/zh-cn)。
