---
title: "指标快速参考 | Cloud"
slug: /metrics-alerts-reference
sidebar_key: metrics-alerts-reference
sidebar_label: "指标快速参考"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "在本手册中，您可以快速找到 Zilliz Cloud 集群监控指标的相关描述，并了解组织和项目级别的告警项。 | Cloud"
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
     <th><p>告警项</p></th>
     <th><p>描述</p></th>
     <th><p>推荐操作</p></th>
     <th><p>默认告警条件</p></th>
   </tr>
   <tr>
     <td><p>优惠券</p></td>
     <td><p>跟踪优惠券的余额，当额度低时提醒用户及时充值。</p></td>
     <td><p>充值以维持账户功能。</p></td>
     <td><p>优惠券余额小于 ¥10 时触发<strong>警告</strong>告警。</p></td>
   </tr>
   <tr>
     <td><p>优惠券有效期</p></td>
     <td><p>监控优惠券的剩余有效期，鼓励用户使用或延期。</p></td>
     <td><p>延长有效期或在额度过期前使用。</p></td>
     <td><p>优惠券有效期小于 0 天时触发<strong>警告</strong>告警。</p></td>
   </tr>
   <tr>
     <td><p>现金余额</p></td>
     <td><p>监控预付款余额，当余额低时提醒用户以防服务中断。</p></td>
     <td><p>为预付款余额增加资金以避免服务中断。</p></td>
     <td><p>现金余额小于 ¥100 时触发<strong>紧急</strong>告警。</p></td>
   </tr>
   <tr>
     <td><p>过去一天内用量金额</p></td>
     <td><p>跟踪过去一天内的用量金额，当超过设定阈值时通知用户，建议监控和管理。</p></td>
     <td><p>监控和管理使用以保持在预算限额内。</p></td>
     <td><p>用量金额大于 ¥100 时触发<strong>警告</strong>告警。</p></td>
   </tr>
</table>

## 集群和 Collection 级别指标\{#cluster-and-collection-metrics}

以下指标用于描述单个集群中的资源使用情况、性能表现和数据状态。带有 ✦ 标记的指标同样支持在 Collection 级别查看。你可以在控制台的 Collection 详情页、通过 [Prometheus 监控](./prometheus-monitoring)，或通过 RESTful API 获取 Collection 级别指标。

### 资源\{#resources}

<table>
   <tr>
     <th><p>指标名称</p></th>
     <th><p>描述</p></th>
     <th><p>推荐操作</p></th>
   </tr>
   <tr>
     <td><p>Read vCUs</p></td>
     <td><p>Search 和 Query 操作消耗的 vCU 用量。</p><p>该指标仅适用于 <strong>Free</strong> 或 <strong>Serverless</strong> 集群。有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Write vCUs</p></td>
     <td><p>Insert、Delete 和 Upsert 操作消耗的 vCU 用量。</p><p>该指标仅适用于 <strong>Free</strong> 或 <strong>Serverless</strong> 集群。有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Query CU 计算资源</p></td>
     <td><p>相对于 CU 总计算能力的已使用计算能力的度量。</p><p>该指标仅适用于 <strong>Dedicated 企业版</strong> 或 <strong>BYOC</strong>。有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p><strong>70%-80%</strong>：检查服务状态并准备<a href="./manage-cluster">扩容</a>。 </p><p><strong>> 90%</strong>：立即<a href="./manage-cluster">扩容</a>，以避免服务中断。</p></td>
   </tr>
   <tr>
     <td><p>Query CU 加载容量</p></td>
     <td><p>相对于 CU 总容量的已使用容量的度量。</p><p>该指标仅适用于 <strong>Free</strong>, <strong>Dedicated 企业版</strong> 或 <strong>BYOC</strong>。有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p><strong>70%-80%</strong>：检查服务状态并准备<a href="./manage-cluster">扩容</a>。 </p><p><strong>> 90%</strong>：立即<a href="./manage-cluster">扩容</a>，以避免服务中断。</p><p><strong>100%</strong>：当 CU 加载容量达到 100% 时，您将无法向集群写入数据。请立即<a href="./manage-cluster">扩容</a>，以避免服务中断。</p></td>
   </tr>
   <tr>
     <td><p>Query CU 总数</p></td>
     <td><p>当前集群中 Query CU 总数。该数值可以通过集群 Query CU × Replica 数量计算得出。</p><p>例如，如果集群的 Query CU为 2，Replica 数量为 2，则此处显示的Query CU 规格总数为 4。</p><p>该指标仅适用于 <strong>Dedicated 企业版</strong> 或 <strong>BYOC</strong>。有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p>监控该指标，可以识别 Query CU 的<a href="./scale-cluster">扩缩容</a>事件。</p></td>
   </tr>
   <tr>
     <td><p>Replica 数量</p></td>
     <td><p>当前集群中的 Replica 数量。</p><p>该指标仅适用于 <strong>Dedicated 企业版</strong> 或 <strong>BYOC</strong>。有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p>监控该指标，可以识别 Replica 的<a href="./manage-replica">扩缩容</a>事件。</p></td>
   </tr>
   <tr>
     <td><p>存储用量</p></td>
     <td><p>数据和索引消耗的持久存储总量。</p></td>
     <td><p><a href="./manage-project-alerts">配置监控告警</a>，以了解存储用量情况。</p></td>
   </tr>
</table>

### 性能\{#performance}

<table>
   <tr>
     <th><p>指标名称</p></th>
     <th><p>描述</p></th>
     <th><p>推荐操作</p></th>
   </tr>
   <tr>
     <td><p>读请求 QPS ✦</p></td>
     <td><p>每秒读取请求（vector search, hybrid search and query）的数量。</p></td>
     <td><p>有关系统性能监控，请参阅<a href="https://zilliz.com.cn/vector-database-benchmark-tool?database=ZillizCloud,Milvus,PgVector,ElasticCloud,Pinecone,QdrantCloud,WeaviateCloud&dataset=medium&filter=none,low,high">向量数据库性能测试工具</a>。</p></td>
   </tr>
   <tr>
     <td><p>写请求 QPS ✦</p></td>
     <td><p>每秒写入请求（insert、bulk insert、upsert 和 delete）的数量。</p></td>
     <td><p>有关系统性能监控，请参阅<a href="https://zilliz.com.cn/vector-database-benchmark-tool?database=ZillizCloud,Milvus,PgVector,ElasticCloud,Pinecone,QdrantCloud,WeaviateCloud&dataset=medium&filter=none,low,high">向量数据库性能测试工具</a>。</p></td>
   </tr>
   <tr>
     <td><p>每秒 Search NQ ✦</p></td>
     <td><p>每秒搜索请求中携带的查询向量数量。</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>每秒写请求 Entity 数量 ✦</p></td>
     <td><p>所有写操作（insert、upsert、bulk insert 和 delete）中每秒写入的 Entity 数量。</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>读请求延时（Latency）✦</p></td>
     <td><p>客户端向服务器发起读请求（search 和 query）到客户端收到响应之间的时间差。</p><p>在右侧扩展的下拉菜单中选择<strong>平均值</strong>或 <strong>P99</strong> 将显示对应的平均延时或 P99 延时。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>写请求延时（Latency）✦</p></td>
     <td><p>客户端向服务器发起写请求（insert、upsert 和 delete）到客户端收到响应之间的时间差。</p><p>在右侧扩展的下拉菜单中选择<strong>平均值</strong>或 <strong>P99</strong> 将显示对应的平均延时或 P99 延时。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>读请求失败率 ✦</p></td>
     <td><p>失败读请求（search 和 query）在每秒所有读请求中所占的百分比。</p></td>
     <td><p><a href="./manage-project-alerts">配置告警</a>以监控读请求失败率。</p></td>
   </tr>
   <tr>
     <td><p>写请求失败率 ✦</p></td>
     <td><p>失败写请求（insert、bulk insert、upsert 和 delete）在每秒所有写请求中所占的百分比。</p></td>
     <td><p><a href="./manage-project-alerts">配置告警</a>以监控写请求失败率。</p></td>
   </tr>
   <tr>
     <td><p>慢查询数量</p></td>
     <td><p>统计慢查询数量，包括 search 和 query 请求数。默认情况下，查询延时超过 5 秒的查询被视为慢查询。</p><p>该指标仅适用于 <strong>Dedicated 企业版</strong> 或 <strong>BYOC</strong>。有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p>通过适当调整集群配置，可以识别存在问题的查询并优化性能。</p></td>
   </tr>
   <tr>
     <td><p>集群写入性能使用率</p></td>
     <td><p>集群的 insert/upsert 操作存在相应的速率限制。当前写入速率与限制的比值即为集群的写入性能利用率。</p><p>该指标仅适用于 <strong>Dedicated 企业版</strong> 或 <strong>BYOC</strong>。有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p>如果该利用率过高（建议超过 80%），建议您降低写入速率。</p></td>
   </tr>
   <tr>
     <td><p>Flush 次数</p></td>
     <td><p>统计对集群操作的 flush 次数。</p><p>该指标仅适用于 <strong>Dedicated 企业版</strong> 或 <strong>BYOC</strong>。有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p>过于频繁的 flush 操作会影响集群的整体性能。有关 flush 操作的相关限制，请参阅<a href="./limits#flush">使用限制</a>。</p></td>
   </tr>
   <tr>
     <td><p>缓存命中率</p></td>
     <td><p>集群中所有查询的平均缓存命中率。单次查询缓存命中率 = (总扫描数据量-冷数据扫描数据量)/总扫描数据量。</p><p>该指标仅适用于兼容 Milvus 2.6.x 版本的 <strong>Dedicated （分层存储型）</strong>集群。如需使用该指标，请<a href="http://support.zilliz.com.cn">提交工单</a>将您的集群 Milvus 版本升级至 2.6.x。</p></td>
     <td><p>监控该指标，可以识别集群的查询性能。</p></td>
   </tr>
</table>

### 数据\{#data}

<table>
   <tr>
     <th><p>指标名称</p></th>
     <th><p>描述</p></th>
     <th><p>推荐操作</p></th>
   </tr>
   <tr>
     <td><p>Collection 数量</p></td>
     <td><p>集群中已创建的 Collection 数量。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Entity 数量 ✦</p></td>
     <td><p>集群或 Collection 中通过 Insert 和 Bulk Insert 操作插入的 Entity 总数。</p><p>在右侧扩展的下拉菜单中选择指定的 collection，将显示该 collection 中已插入的 entity 数量。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>已加载 Entity 数量近似值 ✦</p></td>
     <td><p>集群或 Collection 中已加载 Entity 数量的近似值。</p><p>在右侧扩展的下拉菜单中选择指定的 collection，将显示该 collection 中已加载的 entity 数量。</p><p>有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p>如需查看精确、实时的 Entity 计数，请参考 Collection 详情页中的“已加载 Entity 数量”或者使用 <a href="/docs/single-vector-search#use-count-as-output-field">count(&ast;)</a>。</p></td>
   </tr>
   <tr>
     <td><p>未加载的 Collection 数量</p></td>
     <td><p>统计集群中未加载的 collection 数量。</p><p>有关更多集群类型信息，请参阅 <a href="./select-zilliz-cloud-service-plans">Zilliz Cloud 版本对比</a>。</p></td>
     <td><p>可凭借该指标判断是否需要清理数据或继续加载 collection。</p></td>
   </tr>
</table>

## 文档推荐\{#related-topics}

- [查看集群性能指标](./view-cluster-metric-charts)

- [管理组织告警](./manage-organization-alerts)

- [管理项目告警](./manage-project-alerts)

