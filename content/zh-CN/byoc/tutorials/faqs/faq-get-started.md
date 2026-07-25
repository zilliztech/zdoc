---
title: "FAQ：快速入门 | BYOC"
slug: /faq-get-started
sidebar_label: "FAQ：快速入门"
beta: FALSE
notebook: FALSE
description: " | BYOC"
type: origin
token: YVAzwqHdti7uHSkZL6icsY7hnpe
sidebar_position: 1

---

# FAQ：快速入门

本文列举了快速上手 Zilliz Cloud 时可能遇到的常见问题及对应解决方法。

## 目录

- [是否提供 Zilliz Cloud 与其他竞品间的性能对比？](#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions)
- [如何获取技术支持？](#how-can-i-get-further-technical-support)
- [Zilliz Cloud 搜索延时是多少？](#what-is-the-search-latency-of-zilliz-cloud)
- [Zilliz Cloud 支持哪些索引类型？](#which-type-of-index-is-supported-by-zilliz-cloud)

## 问答




### 是否提供 Zilliz Cloud 与其他竞品间的性能对比？ \{#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions}

您可以使用向量数据库性能对比工具 [VectorDBBench](https://zilliz.com/vector-database-benchmark-tool) 来衡量比较 Zilliz Cloud 与其他主流向量数据库和云服务间的性能差异。

### 如何获取技术支持？ \{#how-can-i-get-further-technical-support}

如需技术支持，请[提交工单](https://support.zilliz.com.cn/hc/zh-cn)。

### Zilliz Cloud 搜索延时是多少？ \{#what-is-the-search-latency-of-zilliz-cloud}

通常，具有 500 万 768 维向量的容量型集群，其搜索延迟约为 100 毫秒。相同数据量和维数的性能型集群，搜索延迟约为 20 毫秒。但请注意，实际搜索延迟可能因您的工作负载和部署环境而有所不同。

### Zilliz Cloud 支持哪些索引类型？ \{#which-type-of-index-is-supported-by-zilliz-cloud}

目前，Zilliz Cloud 仅支持 AUTOINDEX。AUTOINDEX 是 Zilliz Cloud 自研索引，可增强搜索性能。对于具有 150 万 768维向量的性能型集群，QPS 可达到几百，延迟低于 100 毫秒。对于具有 500 万 768维向量的容量型集群，QPS 可达到50，延迟超过 200 毫秒。有关更多详细信息，请参见[AUTOINDEX](./autoindex-explained) 。

如果您需要使用特定[索引](https://milvus.io/docs/index.md)，请[提交工单](https://support.zilliz.com.cn/hc/zh-cn)，我们将协助评估您的应用场景并为您开启特定索引类型。
