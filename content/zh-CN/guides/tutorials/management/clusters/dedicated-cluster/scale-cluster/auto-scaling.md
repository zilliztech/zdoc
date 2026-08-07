---
title: "自动扩缩容 | Cloud"
slug: /auto-scaling
sidebar_label: "自动扩缩容"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "自动扩缩容会在您配置的最小值和最大值范围内，自动调整 Dedicated Serving 集群。它有助于在工作负载峰值期间保护查询性能，并在流量下降时减少资源使用。 | Cloud"
type: origin
token: CZ2KwDHqki8aPok1p0EcJnlWnKW
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 自动扩缩容

自动扩缩容会在您配置的最小值和最大值范围内，自动调整 Dedicated Serving 集群。它有助于在工作负载峰值期间保护查询性能，并在流量下降时减少资源使用。

自动扩缩容最适合流量不可预测的工作负载，例如 AI Agent、交互式搜索应用、客服机器人和多模态搜索系统。这些工作负载可能长时间空闲，然后突然触发大量检索请求。

为了让服务资源利用率保持在健康范围内，Zilliz Cloud 使用目标跟踪，而不是对每一次原始指标峰值做出反应。系统会评估平滑后的监控信号，并在创建扩缩容任务前执行安全检查。

<Admonition type="info" icon="📘" title="📘 说明">

所有版本都支持手动扩缩容 Query CU。

企业版及以上版本支持手动扩缩容 Replica。

企业版及以上版本支持自动扩缩容和定时扩缩容。

</Admonition>

## 了解自动扩缩容行为\{#understand-auto-scaling-behavior}

Zilliz Cloud 不会因为单次瞬时指标峰值就触发自动扩缩容。系统会评估扩缩容指标是否在要求的时长内持续高于或低于阈值，并在扩缩容事件之间应用冷却时间，以避免频繁改变资源。

| 扩缩容目标 | 指标 | 目标值 | 扩容条件 | 缩容条件 |
| --- | --- | --- | --- | --- |
| Query CU | Query CU 加载容量，缩容时同时检查 Query CU 计算资源 | Query CU 加载容量：70% | 持续 10 分钟大于 80%，或立即达到 100% | 持续 30 分钟小于 60%，且目标 Query CU 可以安全承载当前 Query CU 计算资源 |
| Replica | Query CU 计算资源 | Query CU 计算资源：50% | 持续 2 分钟大于 60% | 持续 10 分钟小于 40% |

<Admonition type="info" icon="📘" title="📘 注意">

此表中的数值是默认自动扩缩容设置，Zilliz Cloud 可能会按需调整。如果您有疑问，请[联系我们](http://support.zilliz.com)。

</Admonition>

自动扩缩容要求评估窗口内有足够的有效监控数据。如果窗口没有数据、数据不足，或在最近配置变更后被重置，Zilliz Cloud 会跳过本次扩缩容决策并继续监控。

因此，指标越过阈值并不一定会立即触发扩缩容。指标必须在要求时长内持续高于或低于阈值，冷却时间必须已经结束，并且评估窗口必须包含足够的有效监控数据。

## 计算目标规格\{#calculate-the-target-size}

触发自动扩缩容时，Zilliz Cloud 会自动计算目标配置。

- 对于 Query CU 扩容，Zilliz Cloud 倾向于逐步扩容，避免直接跳到不必要的大规格。

- 对于 Query CU 缩容，Zilliz Cloud 会在缩容前执行更保守的检查。系统会确认目标规格仍能容纳当前数据和已加载内容，并确认目标配置不会导致 Query CU 计算资源指标过高。如果缩容会造成过高的计算压力，则会跳过缩容操作，集群继续监控。

- 对于 Replica 缩容，Zilliz Cloud 可以直接缩到计算出的目标 Replica 数量，而不是每次扩缩容操作只移除一个 Replica。这有助于集群在临时流量峰值后更快恢复到预期规模。

- 如果计算出的目标不是可用规格，或不会造成实际配置变化，则会跳过扩缩容操作。

在创建扩缩容任务前，目标规格必须通过规格映射和安全检查。

## 避免扩缩容震荡\{#avoid-scaling-oscillation}

自动扩缩容会平衡响应速度和稳定性。扩容更敏感，用于保护性能；缩容更保守，用于避免过早缩容后又再次扩容。

| 机制 | 目的 |
| --- | --- |
| 持续时间窗口 | 要求指标在一段时间内持续高于或低于阈值。 |
| 分离的扩容和缩容阈值 | 防止集群围绕单一阈值反复扩缩容。 |
| 扩缩容事件之间的冷却时间 | 防止短期流量变化导致连续扩缩容。 |
| 目标规格计算 | 将指标压力映射为实际可用的目标配置。 |
| 安全检查 | 确保目标配置可用，并且可以安全服务当前工作负载。 |

短时峰值不会触发扩容。短时低流量不会触发缩容。该设计可以减少震荡，并在正常流量波动期间保持集群稳定。

## 处理 Query CU 和 Replica 冲突\{#handle-query-cu-and-replica-conflicts}

Zilliz Cloud 不会在同一次扩缩容操作中同时修改 Query CU 和 Replica 配置。这可以降低一次性改变多个资源维度的风险。

- 单个修改请求不能同时改变 Query CU 和 Replica。

- 如果两个维度都满足扩缩容条件，Zilliz Cloud 会应用优先级处理。

    - 当查询并行压力较高时，Zilliz Cloud 通常会优先扩缩容 Replica。

    - 当 Replica 缩容与 Query CU 调整冲突时，Zilliz Cloud 会优先处理 Query CU 调整。

    - 如果目标配置不可用或没有变化，Zilliz Cloud 会跳过该操作。

## 设置扩缩容范围\{#set-the-scaling-range}

自动扩缩容要求为 Query CU 或 Replica 配置最小值和最大值范围。这些范围定义了 Zilliz Cloud 可以扩缩容集群容量和查询吞吐的边界。

| 设置 | 目的 | 建议 |
| --- | --- | --- |
| 最小 Query CU | 定义低流量期间仍保持可用的基线容量。 | 使用能够处理管理任务、后台任务、已加载数据以及最低预期服务工作负载的值。<br/>默认情况下，该值为当前 Query CU 值。 |
| 最大 Query CU | 定义自动 Query CU 扩容的成本和容量上限。 | 使用能够为预期数据增长提供足够空间的值，同时防止失控工作负载、递归查询 Bug 或意外流量激增带来的风险。<br/>默认情况下，该值为当前 Query CU 值的四倍。 |
| 最小 Replica | 定义低流量期间查询服务的基线冗余和吞吐。 | 使用能够保持应用最低可用性和 QPS 要求的值。<br/>对于生产工作负载，避免将其设置得低于可用性目标所需的最小 Replica 数量。 |
| 最大 Replica | 定义自动 Replica 横向扩展的成本和吞吐上限。 | 使用能够吸收预期流量峰值的值，同时防止意外查询峰值导致成本失控。 |

<Admonition type="info" icon="📘" title="📘 注意">

不要将最大值设置得高于您的运维或预算上限。当持续工作负载压力需要时，自动扩缩容可以扩容到配置的最大值。

</Admonition>

## 配置自动扩缩容\{#configure-auto-scaling}

启用自动扩缩容后，Zilliz Cloud 会持续评估相关指标，并在满足配置条件时创建扩缩容任务。

### 通过 Web 控制台\{#via-web-console}

- **配置 Query CU 自动扩缩容**

    <Supademo id="cmd2tuc413818c4kjnjh1p2iw" title=""  />

    <Procedures>

    1. 进入**集群详情**页面。

    1. 在 **CU 设置卡**片中点击**扩缩容**。

    1. 选择**自动扩缩容**作为扩缩容方式，并配置最小和最大 Query CU。

    1. 点击**保存**。

    </Procedures>

- **配置 Replica 自动扩缩容**

    <Supademo id="cmk2cc3xq00inxm0i4obrv5mc" title=""  />

    <Procedures>

    1. 进入**集群详情**页面。

    1. 在 Replica **设置卡**片中点击**扩缩容**。

    1. 选择**自动扩缩容**作为扩缩容方式，并配置最小和最大 Replica。

    1. 点击**保存**。

    </Procedures>

### 通过 RESTful API\{#via-restful-api}

使用 RESTful API 时，您可以在单个[修改集群配置](https://docs.zilliz.com.cn/reference/restful/modify-cluster-v2)请求中为 Query CU 和 Replica 配置自动扩缩容。

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "autoscaling": {
        "cu": {
            "min": 1,
            "max": 2
        },
        "replica": {
            "min": 1,
            "max": 2
        }
    }
}'
```

## 查看扩缩容进度\{#view-scaling-progress}

当扩缩容事件被触发后，Zilliz Cloud 会生成任务记录。您可以在任务中心页面查看进度。

<Procedures>

1. 在 Zilliz Cloud 控制台中，进入目标项目。

1. 进入 **Jobs**。

1. 找到目标集群的扩缩容任务。

1. 查看任务状态。

</Procedures>

当扩缩容任务正在进行时，集群状态为`修改中`。任务成功后，集群状态会变回`运行中`。

<Admonition type="info" icon="📘" title="说明">

扩缩容任务期间，Zilliz Cloud 会继续按之前的配置对集群计费。只有扩缩容任务成功完成后，新的 Query CU 或 Replica 配置才会用于计费。该规则适用于扩容和缩容操作。

</Admonition>

## 排查自动扩缩容问题\{#troubleshoot-auto-scaling}

| 现象 | 可能原因 | 操作 |
| --- | --- | --- |
| 指标超过阈值，但扩缩容未开始。 | 指标没有在要求时长内持续高于阈值，冷却时间仍生效，或评估窗口内数据不足。 | 检查完整评估窗口内的指标趋势，并查看最近的配置变更。 |
| 流量下降后集群仍未缩容。 | 缩容使用更长且更保守的窗口，或目标配置无法安全容纳当前数据和已加载内容。 | 检查 Query CU 加载容量、数据量、已加载 Collection，以及 Collection 或 Partition 限制。 |
| 高流量下 Replica 未扩容。 | Query CU 计算资源 阈值可能未持续满足，或另一个扩缩容操作具有更高优先级。 | 检查一段时间内的 Query CU 计算资源，并查看扩缩容任务历史。 |
| 自动扩缩容跳过了某个操作。 | 目标规格不可用、未变化，或未通过安全检查。 | 调整最小/最大范围，或选择有效的集群配置。 |

## 限制和注意事项\{#limits-and-considerations}

- 自动扩缩容适用于 Dedicated Serving 集群。

- On-demand 集群会自动扩缩容，不需要配置自动扩缩容。

- Replica 扩缩容要求 Query CU 配置至少为 4 CU。

- Query CU × Replica 存在上限。详情请参阅 Zilliz Cloud Limits。

- 缩容只有在当前数据量以及当前 Collection 和 Partition 数量都能适配目标规格时才会成功。

