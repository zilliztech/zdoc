---
title: "规划集群扩缩容 | BYOC"
slug: /plan-cluster-scaling
sidebar_label: "规划集群扩缩容"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "扩缩容可以帮助您在数据量、Collection 数量、流量或可用性要求增长时，保持 Dedicated Serving 集群健康运行。在 Zilliz Cloud 中，通常会因为两类原因进行扩缩容： | BYOC"
type: origin
token: CGA8w8CE3iHjGJkkax9cISiwnTc
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 规划集群扩缩容

扩缩容可以帮助您在数据量、Collection 数量、流量或可用性要求增长时，保持 Dedicated Serving 集群健康运行。在 Zilliz Cloud 中，通常会因为两类原因进行扩缩容：

- **容量压力**：集群需要更多资源来保存和服务数据、Collection、Partition 或索引。

- **查询计算压力**：集群已经可以容纳数据，但查询并发、QPS 或延迟要求需要更强的并行服务能力。

对于 Dedicated Serving 集群，您可以手动扩缩容 Query CU 或 Replica，也可以配置自动扩缩容或定时扩缩容。

On-demand 集群会自动扩缩容，不需要手动扩缩容。

<Admonition type="info" icon="📘" title="📘 说明">

所有版本都支持手动扩缩容 Query CU。

企业版及以上版本支持手动扩缩容 Replica。

企业版及以上版本支持自动扩缩容和定时扩缩容。

</Admonition>

## 了解要扩缩容什么\{#understand-what-to-scale}

根据影响集群的压力类型选择扩缩容目标：

- 当集群需要更多容量来保存和服务已加载数据、Collection、Partition 或索引时，扩缩容 Query CU。

- 当集群已经可以容纳数据，但查询流量需要更强的并行服务能力时，扩缩容 Replica。

在大多数情况下：

- Query CU 用于解决容量压力。

- Replica 用于解决吞吐和可用性压力。

<Admonition type="info" icon="📘" title="📘 说明">

对于 Query CU 较少的小规格集群，增加 **Query CU** 也可能提升 QPS。不过在大多数情况下，应通过扩缩容 **Replica** 来提升搜索吞吐和可用性。

</Admonition>

## 识别扩缩容信号\{#identify-scaling-signals}

使用以下现象判断是否需要扩缩容，以及应该调整哪类资源。

| 现象 | 可能原因 | 建议操作 |
| --- | --- | --- |
| 写入操作开始失败，但查询仍然可用。 | 集群正在接近容量上限。 | 增加 Query CU。 |
| 数据量持续增长。 | 容量需求正在增加。 | 增加 Query CU。 |
| Collection 或 Partition 数量接近当前规格限制。 | 当前集群规格无法提供足够容量。 | 增加 Query CU。 |
| QPS 上升且查询延迟变高。 | 查询并发压力正在增加。 | 增加 Replica。 |
| 查询在高峰时段变慢，但在非高峰时段正常。 | 可预测高峰期资源不足。 | 启用定时扩缩容或自动扩缩容。 |
| 流量不可预测。 | 工作负载波动明显。 | 启用自动扩缩容。 |
| 非高峰时段资源空闲。 | 集群资源配置过高。 | 启用定时扩缩容或自动扩缩容。 |

## 使用指标指导扩缩容\{#use-metrics-to-guide-scaling}

Zilliz Cloud 提供两个指标，帮助您判断应该扩缩容 Query CU 还是 Replica。

| 指标 | 描述 | 扩缩容指导 |
| --- | --- | --- |
| Query CU 加载容量 | 衡量当前 Query CU 距离容量上限有多近。它取两个信号中的较高值：已加载数据使用的内存，以及已存储数据大小相对于集群存储配额的比例。 | 持续高位表示当前 Query CU 规格可能容量不足。如果启用了自动扩缩容，Zilliz Cloud 可能会扩容 Query CU 以提供更多容量。 |
| Query CU 计算资源 | 衡量查询执行对 CPU 资源的使用程度。它根据 QueryNode CPU 使用量相对于 CPU 限制的比例计算。 | 持续高位表示查询执行受 CPU 约束。Zilliz Cloud 可能会横向扩展 Replica，以增加并行查询处理能力。 |

## 选择扩缩容方式\{#choose-a-scaling-method}

根据工作负载的可预测性和运维目标选择扩缩容方式。

| 扩缩容方式 | 适用场景 | 示例 |
| --- | --- | --- |
| 手动扩缩容 | 已知时间和目标规格的一次性调整，例如发布、压测、迁移或大规模数据导入。 | 发布新的 RAG 应用前，增加 Query CU 和 Replica，为第一批用户预留容量和查询吞吐。 |
| 定时扩缩容 | 可预测的流量模式、周期性工作时间高峰，或固定时间的批量搜索和评测任务。 | 内部 AI Agent 或知识库应用的流量主要集中在工作日办公时间，因此集群在早上扩容、晚上缩容。 |
| 自动扩缩容 | 不可预测的工作负载、AI Agent、交互式应用、客服机器人和多模态搜索。 | AI Agent 可能空闲数小时，然后在处理复杂 Prompt 或检索长期记忆时触发大量搜索。自动扩缩容会在峰值期间增加资源，并在之后缩容。 |

## 了解扩缩容行为\{#understand-scaling-behavior}

提交或触发扩缩容请求后，Zilliz Cloud 会校验请求的配置并创建扩缩容任务。

在扩缩容任务期间：

- 集群状态会变为**修改中**。

- 部分管理操作会暂时不可用，例如挂起、迁移和删除。

- 在新配置准备就绪前，当前配置会继续提供服务。

- Zilliz Cloud 使用 [金丝雀升级](./canary-upgrade) 机制执行扩缩容。该机制会先在有限范围内验证新配置，再逐步推出。因此，扩缩容期间不会断开已有连接。

- 只有扩缩容任务成功完成后，新配置才会生效。

- 如果扩缩容任务未完成，集群会继续使用之前的配置。

扩缩容操作可能造成临时服务抖动。

您可以在**任务中心**页面跟踪进度。任务完成后，集群状态会恢复为运行中。

## 查看限制和要求\{#review-limits-and-requirements}

配置扩缩容前，请查看以下限制：

- Replica 扩缩容要求 Query CU 配置至少为 4 CU。

- Query CU × Replica 存在上限。详情请参阅[使用限制](./limits)。

- 只有当前数据量以及当前 Collection 和 Partition 数量都能适配目标规格时，缩容才会成功。

- 定时扩缩容要求计划间隔大于 30 分钟。

## 验证扩缩容结果\{#validate-scaling-results}

扩缩容后，检查以下信号以确认变更符合预期。

| 信号 | 验证方式 |
| --- | --- |
| Query CU 加载容量 | 容量压力降低。 |
| Query CU 计算资源 | 查询计算压力降低。 |
| QPS 和读取延迟 | 查询性能提升。 |
| 任务状态 | 扩缩容任务成功完成。 |
| 集群状态 | 集群从 **Modifying** 恢复为 **Running**。 |
| 计费或用量数据 | 任务完成后，计费切换到新配置。 |

## 规划全球集群扩缩容\{#plan-global-cluster-scaling}

全球集群（Global Cluster）扩缩容遵循不同于普通 Dedicated 集群扩缩容的规则。

- 您只能在主集群上设置 **Query CU** 扩缩容。

- 当您在主集群上扩缩容 Query CU 时，Zilliz Cloud 会自动将相同的 Query CU 数量应用到所有从集群。

- 从集群不能独立扩缩容 Query CU。

- 对每个主集群或从集群，独立扩缩容 **Replica**。

- 使用独立的 Replica 设置，为高流量区域分配更多服务能力，并为低流量或备用区域配置更少 Replica。

详情请参阅[全球集群扩缩容](./scale-global-cluster)。