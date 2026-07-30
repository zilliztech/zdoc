---
title: "指标快速参考 | BYOC"
slug: /metrics-alerts-reference
sidebar_label: "指标快速参考"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在本手册中，您可以快速找到 Zilliz Cloud 集群监控指标的相关描述，并了解组织和项目级别的告警项。 | BYOC"
type: origin
token: Rca8w6kRRiy7a9kr6adczTcGnoh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 指标快速参考

在本手册中，您可以快速找到 Zilliz Cloud 集群监控指标的相关描述，并了解组织和项目级别的告警项。

- **组织级指标**：反映账号权限范围内的所有项目的状态。

- **集群级别指标**：反映单个集群内的资源使用情况、性能表现以及数据状态。

- **Collection 级别指标**：集群指标在 Collection 维度的细分，帮助您定位单个 Collection 的性能问题并进行容量规划。

<Admonition type="info" icon="📘" title="说明">

大多数的指标支持设置告警。当某个指标达到指定条件（如时间窗口或阈值）时，会触发告警。关于如何配置告警，可以参考[管理组织告警](./manage-organization-alerts)和[管理项目告警](./manage-project-alerts)

</Admonition>

## 组织级指标\{#organization-level-metrics}

组织级指标帮助您在指定组织内跟踪所有项目的费用支出情况。

<table>
   <tr>
     <th><p>指标名称</p></th>
     <th><p>描述</p></th>
     <th><p>推荐操作</p></th>
   </tr>
   <tr>
     <td><p>License 有效期</p></td>
     <td><p>表示离组织 License 过期前的剩余天数。</p></td>
     <td><ul><li><p><strong>< 60 天</strong>：可以开始续期操作。</p></li><li><p><strong>已过期</strong> ：应当立即续期或升级操作，避免影响业务（如创建新集群或集群扩容等）。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>已使用 CPU 核心数</p></td>
     <td><p>表示已使用的 CPU 核心数与 License 中包含的 CPU 核心数的比值。</p></td>
     <td><ul><li><p><strong>></strong> <strong>70%</strong>：评估未来需求，计划续期或升级。</p></li><li><p><strong>100%</strong>：应该立即续期或升级，避免影响业务。</p></li></ul></td>
   </tr>
</table>

## 集群和 Collection 级别指标\{#cluster-and-collection-metrics}

以下指标用于描述单个集群中的资源使用情况、性能表现和数据状态。带有 ✦ 标记的指标同样支持在 Collection 级别查看。你可以在控制台的 Collection 详情页、通过 [Prometheus 监控](./prometheus-monitoring)，或通过 RESTful API 获取 Collection 级别指标。

<Admonition type="info" icon="📘" title="说明">

在按需计算 Database 中，当前仅支持部分 Collection 级别监控指标。支持的指标包括：**读请求 QPS**、**每秒 Search NQ**、**读请求延时**、**读请求失败率**、**Entity 数量**。这些指标可在控制台中查看。本版本暂不支持通过 Prometheus 导出按需计算 Database 指标。

</Admonition>

### Pod 和容器资源\{#pod-container-resources}

| 告警项 | 描述 | 推荐操作 | 可用场景 |
| --- | --- | --- | --- |
| CPU 用量 | Pod 已使用的 CPU 核心数。 | 跟踪趋势、调查持续增长或快速增长的原因。 | BYOC |
| CPU 使用率 | Pod 已使用的 CPU 与限制值之间的比值。 | 如果趋势抬升，建议优化工作负载或增加限制值。 | BYOC |
| 内存用量 | Pod 中各容器的内存用量（不包括缓存） | 调查持续增长或可能泄露的原因。 | BYOC |
| 内存使用率 | Pod 内存使用与限制值之间的比值。 | 如果持续保持高水位，建议优化内存使用或增加限制值。 | BYOC |
| 入站流量 | Pod 的入站流量 | 观察可能的拥塞，调整带宽大小到合理范围。 | BYOC |
| 出站流量 | Pod 的出站流量 | 观察可能的拥塞，调整带宽大小到合理范围。 | BYOC |

### 资源\{#resources}

| 指标名称 | 描述 | 推荐操作 |
| --- | --- | --- |
| Query CU 计算资源 | 衡量查询执行对 CPU 资源的使用程度。该指标根据 QueryNode 的 CPU 使用量相对于其 CPU limit 计算得出。<br/>有关更多集群类型信息，请参阅 [Zilliz Cloud 版本对比](./select-zilliz-cloud-service-plans)。 | 如果该指标持续处于高位，说明查询执行受 CPU 资源限制。可以考虑[扩展 replica](./manage-replica)，以提升并行查询处理能力。 |
| Query CU 加载容量 | 衡量当前 Query CU 距离容量上限的接近程度。该指标取两个信号中的较高值：已加载数据占用的内存，以及已存储数据量相对于集群存储配额的比例。<br/>有关更多集群类型信息，请参阅 [Zilliz Cloud 版本对比](./select-zilliz-cloud-service-plans)。 | 如果该指标持续处于高位，说明当前 Query CU 规格可能没有足够容量。可以考虑扩容 Query CU，以提供更多容量。 |
| Query CU 总数 | 当前集群中 Query CU 总数。该数值可以通过集群 Query CU × Replica 数量计算得出。<br/>例如，如果集群的 Query CU为 2，Replica 数量为 2，则此处显示的Query CU 规格总数为 4。<br/>有关更多集群类型信息，请参阅 [Zilliz Cloud 版本对比](./select-zilliz-cloud-service-plans)。 | 监控该指标，可以识别 Query CU 的[扩缩容](./scale-cluster)事件。 |
| Replica 数量 | 当前集群中的 Replica 数量。<br/>有关更多集群类型信息，请参阅 [Zilliz Cloud 版本对比](./select-zilliz-cloud-service-plans)。 | 监控该指标，可以识别 Replica 的[扩缩容](./manage-replica)事件。 |
| 存储用量 | 数据和索引消耗的持久存储总量。 | [配置监控告警](./manage-project-alerts)，以了解存储用量情况。 |

### 性能\{#performance}

| 指标名称 | 描述 | 推荐操作 |
| --- | --- | --- |
| 读请求 QPS ✦ | 每秒读取请求（vector search, hybrid search and query）的数量。<br/>该指标同样适用于按需计算 Database 中的 Managed Collection 和 External Collection。 | 有关系统性能监控，请参阅[向量数据库性能测试工具](https://zilliz.com.cn/vector-database-benchmark-tool?database=ZillizCloud,Milvus,PgVector,ElasticCloud,Pinecone,QdrantCloud,WeaviateCloud&dataset=medium&filter=none,low,high)。 |
| 写请求 QPS ✦ | 每秒写入请求（insert、bulk insert、upsert 和 delete）的数量。 | 有关系统性能监控，请参阅[向量数据库性能测试工具](https://zilliz.com.cn/vector-database-benchmark-tool?database=ZillizCloud,Milvus,PgVector,ElasticCloud,Pinecone,QdrantCloud,WeaviateCloud&dataset=medium&filter=none,low,high)。 |
| 每秒 Search NQ ✦ | 每秒搜索请求中携带的查询向量数量。<br/>该指标同样适用于按需计算 Database 中的 Managed Collection 和 External Collection。 |  |
| 每秒写请求 Entity 数量 ✦ | 所有写操作（insert、upsert、bulk insert 和 delete）中每秒写入的 Entity 数量。 |  |
| 读请求延时（Latency）✦ | 客户端向服务器发起读请求（search 和 query）到客户端收到响应之间的时间差。<br/>该指标同样适用于按需计算 Database 中的 Managed Collection 和 External Collection。<br/>在右侧扩展的下拉菜单中选择**平均值**或 **P99** 将显示对应的平均延时或 P99 延时。 | - |
| 写请求延时（Latency）✦ | 客户端向服务器发起写请求（insert、upsert 和 delete）到客户端收到响应之间的时间差。<br/>在右侧扩展的下拉菜单中选择**平均值**或 **P99** 将显示对应的平均延时或 P99 延时。 | - |
| 读请求失败率 ✦ | 失败读请求（search 和 query）在每秒所有读请求中所占的百分比。<br/>该指标同样适用于按需计算 Database 中的 Managed Collection 和 External Collection。 | [配置告警](./manage-project-alerts)以监控读请求失败率。 |
| 写请求失败率 ✦ | 失败写请求（insert、bulk insert、upsert 和 delete）在每秒所有写请求中所占的百分比。 | [配置告警](./manage-project-alerts)以监控写请求失败率。 |
| 慢查询数量 ✦ | 统计慢查询数量，包括 search 和 query 请求数。默认情况下，查询延时超过 5 秒的查询被视为慢查询。<br/>有关更多集群类型信息，请参阅 [Zilliz Cloud 版本对比](./select-zilliz-cloud-service-plans)。 | 通过适当调整集群配置，可以识别存在问题的查询并优化性能。 |
| 集群写入性能使用率 | 集群的 insert/upsert 操作存在相应的速率限制。当前写入速率与限制的比值即为集群的写入性能利用率。<br/>有关更多集群类型信息，请参阅 [Zilliz Cloud 版本对比](./select-zilliz-cloud-service-plans)。 | 如果该利用率过高（建议超过 80%），建议您降低写入速率。 |
| Flush 次数 | 统计对集群操作的 flush 次数。<br/>有关更多集群类型信息，请参阅 [Zilliz Cloud 版本对比](./select-zilliz-cloud-service-plans)。 | 过于频繁的 flush 操作会影响集群的整体性能。有关 flush 操作的相关限制，请参阅[使用限制](./limits#flush)。 |
| 缓存命中率 | 集群中所有查询的平均缓存命中率。单次查询缓存命中率 = (总扫描数据量-冷数据扫描数据量)/总扫描数据量。<br/>该指标仅适用于兼容 Milvus 2.6.x 版本的 **Dedicated （分层存储型）**集群。如需使用该指标，请[提交工单](http://support.zilliz.com.cn)将您的集群 Milvus 版本升级至 2.6.x。 | 监控该指标，可以识别集群的查询性能。 |

### 数据\{#data}

| 指标名称 | 描述 | 推荐操作 |
| --- | --- | --- |
| Collection 数量 | 集群中已创建的 Collection 数量。 | - |
| Entity 数量 ✦ | 集群或 Collection 中通过 Insert 和 Bulk Insert 操作插入的 Entity 总数。<br/>该指标同样适用于按需计算 Database 中的 Managed Collection 和 External Collection。<br/>在右侧扩展的下拉菜单中选择指定的 collection，将显示该 collection 中已插入的 entity 数量。 | - |
| 已加载 Entity 数量近似值 ✦ | 集群或 Collection 中已加载 Entity 数量的近似值。<br/>在右侧扩展的下拉菜单中选择指定的 collection，将显示该 collection 中已加载的 entity 数量。<br/>该指标仅适用于 **Dedicated 企业版** 或 **BYOC**。有关更多集群类型信息，请参阅 [Zilliz Cloud 版本对比](./select-zilliz-cloud-service-plans)。 | 如需查看精确、实时的 Entity 计数，请参考 Collection 详情页中的“已加载 Entity 数量”或者使用 [count(*)](https://docs.zilliz.com.cn/docs/single-vector-search#use-count-as-output-field)。 |
| 未加载的 Collection 数量 | 统计集群中未加载的 collection 数量。<br/>该指标仅适用于 **Dedicated 企业版** 或 **BYOC**。有关更多集群类型信息，请参阅 [Zilliz Cloud 版本对比](./select-zilliz-cloud-service-plans)。 | 可凭借该指标判断是否需要清理数据或继续加载 collection。 |

### 其他\{#others}

| 指标名称 | 描述 | 推荐操作 |
| --- | --- | --- |
| 集群状态异常 | 目标集群状态异常。 | 检查集群状态，并根据具体情况采取相应措施。 |
| 集群禁止写入 | 由于错误或保护机制，目标集群的写入被禁用。 | 检查集群状态、最近的配置或维护操作，以及相关告警，排查并解决根本原因后恢复写入能力。 |
| 访问日志转发异常 | 访问日志无法正常转发到已配置的存储集成。 | 检查日志转发配置、目标服务状态、网络连通性，以及相关凭证或权限，解决问题后确认日志转发已恢复。 |
| 审计日志转发异常 | 当审计日志无法正常转发到已配置的存储集成。 | 检查日志转发配置、目标服务状态、网络连通性，以及相关凭证或权限，解决问题后确认日志转发已恢复。 |

## 文档推荐\{#related-topics}

- [查看集群性能指标](./view-cluster-metric-charts)

- [管理组织告警](./manage-organization-alerts)

- [管理项目告警](./manage-project-alerts)

