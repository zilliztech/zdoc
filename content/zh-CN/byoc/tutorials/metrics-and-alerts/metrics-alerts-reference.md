---
title: "指标与告警快速参考 | BYOC"
slug: /metrics-alerts-reference
sidebar_label: "指标与告警快速参考"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在本手册中，您可以快速找到 Zilliz Cloud 集群监控指标的相关描述，并了解组织和项目级别的告警项。 | BYOC"
type: origin
token: Rca8w6kRRiy7a9kr6adczTcGnoh
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 指标
  - 告警
  - 参考

---

import Admonition from '@theme/Admonition';


# 指标与告警快速参考

在本手册中，您可以快速找到 Zilliz Cloud 集群监控指标的相关描述，并了解组织和项目级别的告警项。

- **组织级指标**：反映账号权限范围内的所有项目的状态。

- **项目级指标**：反映当前项目内的集群资源、容量、性能和数据等对象的状态。

<Admonition type="info" icon="📘" title="说明">

<p>大多数的指标支持设置告警。当某个指标达到指定条件（如时间窗口或阈值）时，会触发告警。关于如何配置告警，可以参考<a href="./manage-organization-alerts">管理组织告警</a>和<a href="./manage-project-alerts">管理项目告警</a></p>

</Admonition>

## 组织级指标\{#organization-level-metrics}

组织级指标帮助您在指定组织内跟踪所有项目的费用支出情况。

<table>
   <tr>
     <th><p>指标名称</p></th>
     <th><p>单位</p></th>
     <th><p>描述</p></th>
     <th><p>推荐操作</p></th>
   </tr>
   <tr>
     <td><p>License 有效期</p></td>
     <td><p>天</p></td>
     <td><p>表示离组织 License 过期前的剩余天数。</p></td>
     <td><ul><li><p><strong>< 60 天</strong>：可以开始续期操作。</p></li><li><p><strong>已过期</strong> ：应当立即续期或升级操作，避免影响业务（如创建新集群或集群扩容等）。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>已使用 CPU 核心数</p></td>
     <td><p>%</p></td>
     <td><p>表示已使用的 CPU 核心数与 License 中包含的 CPU 核心数的比值。</p></td>
     <td><ul><li><p><strong>></strong> <strong>70%</strong>：评估未来需求，计划续期或升级。</p></li><li><p><strong>100%</strong>：应该立即续期或升级，避免影响业务。</p></li></ul></td>
   </tr>
</table>

## 项目级指标（包含集群指标）\{#project-level-metrics-cluster-metrics}

项目告警主要关注您集群的性能方面，包括 CU 使用情况、QPS 阈值、延时问题以及请求异常等，确保您能够维持最佳的集群性能。

### Pod 和容器资源\{#pod-container-resources}

<table>
   <tr>
     <th><p>告警项</p></th>
     <th><p>单位</p></th>
     <th><p>描述</p></th>
     <th><p>推荐操作</p></th>
     <th><p>可用场景</p></th>
   </tr>
   <tr>
     <td><p>CPU 用量</p></td>
     <td><p>核</p></td>
     <td><p>Pod 已使用的 CPU 核心数。</p></td>
     <td><p>Track trends; investigate sustained growth or spikes.</p><p>跟踪趋势、调查持续增长或快速增长的原因。</p></td>
     <td><p>BYOC</p></td>
   </tr>
   <tr>
     <td><p>CPU 使用率</p></td>
     <td><p>%</p></td>
     <td><p>Pod 已使用的 CPU 与限制值之间的比值。</p></td>
     <td><p>如果趋势抬升，建议优化工作负载或增加限制值。</p></td>
     <td><p>BYOC</p></td>
   </tr>
   <tr>
     <td><p>内存用量</p></td>
     <td><p>MB</p></td>
     <td><p>Pod 中各容器的内存用量（不包括缓存）</p></td>
     <td><p>调查持续增长或可能泄露的原因。</p></td>
     <td><p>BYOC</p></td>
   </tr>
   <tr>
     <td><p>内存使用率</p></td>
     <td><p>%</p></td>
     <td><p>Pod 内存使用与限制值之间的比值。</p></td>
     <td><p>如果持续保持高水位，建议优化内存使用或增加限制值。</p></td>
     <td><p>BYOC</p></td>
   </tr>
   <tr>
     <td><p>入站流量</p></td>
     <td><p>Mbps</p></td>
     <td><p>Pod 的入站流量</p></td>
     <td><p>观察可能的拥塞，调整带宽大小到合理范围。</p></td>
     <td><p>BYOC</p></td>
   </tr>
   <tr>
     <td><p>出站流量</p></td>
     <td><p>Mbps</p></td>
     <td><p>Pod 的出站流量</p></td>
     <td><p>观察可能的拥塞，调整带宽大小到合理范围。</p></td>
     <td><p>BYOC</p></td>
   </tr>
</table>

### 资源\{#resources}

<table>
   <tr>
     <th><p>指标名称</p></th>
     <th><p>单位</p></th>
     <th><p>描述</p></th>
     <th><p>推荐操作</p></th>
   </tr>
   <tr>
     <td><p>Query CU 计算资源</p></td>
     <td><p>%</p></td>
     <td><p>相对于 CU 总计算能力的已使用计算能力的度量。</p><p>有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p><strong>70%-80%</strong>：检查服务状态并准备<a href="./manage-cluster">扩容</a>。 </p><p><strong>> 90%</strong>：立即<a href="./manage-cluster">扩容</a>，以避免服务中断。</p></td>
   </tr>
   <tr>
     <td><p>Query CU 加载容量</p></td>
     <td><p>%</p></td>
     <td><p>相对于 CU 总容量的已使用容量的度量。</p><p>有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p><strong>70%-80%</strong>：检查服务状态并准备<a href="./manage-cluster">扩容</a>。 </p><p><strong>> 90%</strong>：立即<a href="./manage-cluster">扩容</a>，以避免服务中断。</p><p><strong>100%</strong>：当 CU 加载容量达到 100% 时，您将无法向集群写入数据。请立即<a href="./manage-cluster">扩容</a>，以避免服务中断。</p></td>
   </tr>
   <tr>
     <td><p>Query CU 总数</p></td>
     <td><p>个</p></td>
     <td><p>当前集群中 Query CU 总数。该数值可以通过集群 Query CU × Replica 数量计算得出。</p><p>例如，如果集群的 Query CU为 2，Replica 数量为 2，则此处显示的Query CU 规格总数为 4。</p><p>有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p>监控该指标，可以识别 Query CU 的<a href="./scale-cluster">扩缩容</a>事件。</p></td>
   </tr>
   <tr>
     <td><p>Replica 数量</p></td>
     <td><p>个</p></td>
     <td><p>当前集群中的 Replica 数量。</p><p>有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p>监控该指标，可以识别 Replica 的<a href="./manage-replica">扩缩容</a>事件。</p></td>
   </tr>
   <tr>
     <td><p>存储用量</p></td>
     <td><p>GB</p></td>
     <td><p>数据和索引消耗的持久存储总量。</p></td>
     <td><p><a href="./manage-project-alerts">配置监控告警</a>，以了解存储用量情况。</p></td>
   </tr>
</table>

### 性能\{#performance}

<table>
   <tr>
     <th><p>指标名称</p></th>
     <th><p>单位</p></th>
     <th><p>描述</p></th>
     <th><p>推荐操作</p></th>
   </tr>
   <tr>
     <td><p>读请求 QPS/ Search NQ</p></td>
     <td><p>-</p></td>
     <td><p><strong>QPS</strong>：每秒读取请求（search 和 query）的数量。</p><p><strong>Search NQ</strong>：每秒搜索（search）请求中携带的查询向量数量。Search NQ 不适用于 query 请求，因为 query 操作不涉及向量。</p></td>
     <td><p>有关系统性能监控，请参阅<a href="https://zilliz.com.cn/vector-database-benchmark-tool?database=ZillizCloud,Milvus,PgVector,ElasticCloud,Pinecone,QdrantCloud,WeaviateCloud&dataset=medium&filter=none,low,high">向量数据库性能测试工具</a>。</p></td>
   </tr>
   <tr>
     <td><p>写请求 QPS/ 每秒写请求 Entity 数量</p></td>
     <td><p>-</p></td>
     <td><p><strong>QPS</strong>：每秒写入请求（insert、bulk insert、upsert 和 delete）的数量。</p><p><strong>每秒写请求 Entity 数量</strong>：每秒向量写入请求（insert、bulk insert、upsert 和 delete）的数量。</p></td>
     <td><p>有关系统性能监控，请参阅<a href="https://zilliz.com.cn/vector-database-benchmark-tool?database=ZillizCloud,Milvus,PgVector,ElasticCloud,Pinecone,QdrantCloud,WeaviateCloud&dataset=medium&filter=none,low,high">向量数据库性能测试工具</a>。</p></td>
   </tr>
   <tr>
     <td><p>读请求延时（Latency）</p></td>
     <td><p>毫秒</p></td>
     <td><p>客户端向服务器发起读请求（search 和 query）到客户端收到响应之间的时间差。</p><p>在右侧扩展的下拉菜单中选择<strong>平均值</strong>或 <strong>P99</strong> 将显示对应的平均延时或 P99 延时。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>写请求延时（Latency）</p></td>
     <td><p>毫秒</p></td>
     <td><p>客户端向服务器发起写请求（insert、upsert 和 delete）到客户端收到响应之间的时间差。</p><p>在右侧扩展的下拉菜单中选择<strong>平均值</strong>或 <strong>P99</strong> 将显示对应的平均延时或 P99 延时。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>读请求失败率</p></td>
     <td><p>%</p></td>
     <td><p>失败读请求（search 和 query）在每秒所有读请求中所占的百分比。</p></td>
     <td><p><a href="./manage-project-alerts">配置告警</a>以监控读请求失败率。</p></td>
   </tr>
   <tr>
     <td><p>写请求失败率</p></td>
     <td><p>%</p></td>
     <td><p>失败写请求（insert、bulk insert、upsert 和 delete）在每秒所有写请求中所占的百分比。</p></td>
     <td><p><a href="./manage-project-alerts">配置告警</a>以监控写请求失败率。</p></td>
   </tr>
   <tr>
     <td><p>慢查询数量</p></td>
     <td><p>次/分钟</p></td>
     <td><p>统计慢查询数量，包括 search 和 query 请求数。默认情况下，查询延时超过 5 秒的查询被视为慢查询。</p><p>有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p>通过适当调整集群配置，可以识别存在问题的查询并优化性能。</p></td>
   </tr>
   <tr>
     <td><p>集群写入性能使用率</p></td>
     <td><p>%</p></td>
     <td><p>集群的 insert/upsert 操作存在相应的速率限制。当前写入速率与限制的比值即为集群的写入性能利用率。</p><p>有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p>如果该利用率过高（建议超过 80%），建议您降低写入速率。</p></td>
   </tr>
   <tr>
     <td><p>Flush 次数</p></td>
     <td><p>次/分钟</p></td>
     <td><p>统计对集群操作的 flush 次数。</p><p>有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p>过于频繁的 flush 操作会影响集群的整体性能。有关 flush 操作的相关限制，请参阅<a href="./limits#flush">使用限制</a>。</p></td>
   </tr>
   <tr>
     <td><p>缓存命中率</p></td>
     <td><p>%</p></td>
     <td><p>集群中所有查询的平均缓存命中率。单次查询缓存命中率 = (总扫描数据量-冷数据扫描数据量)/总扫描数据量。</p><p>该指标仅适用于兼容 Milvus 2.6.x 版本的 <strong>Dedicated （分层存储型）</strong>集群。如需使用该指标，请<a href="http://support.zilliz.com.cn">提交工单</a>将您的集群 Milvus 版本升级至 2.6.x。</p></td>
     <td><p>监控该指标，可以识别集群的查询性能。</p></td>
   </tr>
</table>

### 数据\{#data}

<table>
   <tr>
     <th><p>指标名称</p></th>
     <th><p>单位</p></th>
     <th><p>描述</p></th>
     <th><p>推荐操作</p></th>
   </tr>
   <tr>
     <td><p>Collection 数量</p></td>
     <td><p>个</p></td>
     <td><p>集群中已创建的 Collection 数量。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Entity 数量</p></td>
     <td><p>个</p></td>
     <td><p>集群中通过 Insert 和 Bulk Insert 操作插入的 Entity 总数。</p><p>在右侧扩展的下拉菜单中选择指定的 collection，将显示该 collection 中已插入的 entity 数量。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>已加载 Entity 数量近似值</p></td>
     <td><p>个</p></td>
     <td><p>集群中已加载 Entity 数量的近似值。</p><p>在右侧扩展的下拉菜单中选择指定的 collection，将显示该 collection 中已加载的 entity 数量。</p><p>该指标仅适用于 <strong>Dedicated 企业版</strong> 或 <strong>BYOC</strong>。有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p>如需查看精确、实时的 Entity 计数，请参考 Collection 详情页中的“已加载 Entity 数量”或者使用 <a href="/docs/single-vector-search#use-count-as-output-field">count(&ast;)</a>。</p></td>
   </tr>
   <tr>
     <td><p>未加载的 Collection 数量</p></td>
     <td><p>个</p></td>
     <td><p>统计集群中未加载的 collection 数量。</p><p>该指标仅适用于 <strong>Dedicated 企业版</strong> 或 <strong>BYOC</strong>。有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p>可凭借该指标判断是否需要清理数据或继续加载 collection。</p></td>
   </tr>
</table>

## 文档推荐\{#related-topics}

- [查看集群性能指标](./view-cluster-metric-charts)

- [管理组织告警](./manage-organization-alerts)

- [管理项目告警](./manage-project-alerts)

