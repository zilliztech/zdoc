---
title: "Replica 扩缩容 | BYOC"
slug: /manage-replica
sidebar_label: "Replica 扩缩容"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 支持针对集群创建 Replica。Replica 是对集群中数据和资源的拷贝。使用 Replica 可以提升查询吞吐量和系统稳定性。 | BYOC"
type: origin
token: A8MYw6Wj2ilF2akZeKYcwJGSnSY
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - Replica 扩缩容

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Replica 扩缩容

Zilliz Cloud 支持针对集群创建 Replica。Replica 是对集群中数据和资源的拷贝。使用 Replica 可以提升查询吞吐量和系统稳定性。

对于数据量较小但 QPS 出现瓶颈的用户而言，增加 Replica 数量能分布查询负载，从而整体提升查询吞吐量。为了提升性能，您可以在[指标](./view-cluster-metric-charts)页面查看 **Query CU 计算资源**，判断是否需要扩容。

请注意，增加 Replica 数量并不会提升集群容量。影响集群数据容量的唯一因素是 CU 规格。如需提升集群数据容量，请参考[集群扩缩容](./scale-cluster)。

本文介绍如何为 Zilliz Cloud 集群设置 Replica。

## 使用限制\{#limits}

在集群创建完成后，满足以下条件时，您可以设置 Replica：

- 集群 Query CU 数量大于等于 8。

- Query CU 数量 x Replica 数量不得超过 256。

<Admonition type="caution" icon="🚧" title="警告">

<p>修改 Replica 数量可能会短暂影响数据读取。请谨慎操作。</p>

</Admonition>

## 手动扩缩容\{#manual-scaling}

您可以选择通过控制台或 RESTful API 调整集群 Replica 数量。

以下 Demo 展示了如何在 Zilliz Cloud 控制台中手动调整 Replica 数量。

<Supademo id="cmd2ub5ca38cxc4kjl4ua85dm" title=""  />

<Admonition type="info" icon="📘" title="说明">

<p>当您在 <strong>集群 Replica 扩缩容</strong>对话框中单击<strong>保存</strong>后，您将看到自动弹出的<strong>检查项目资源配额</strong>窗口。如果当前项目的资源充足，该窗口在检查完成后会自动消失。如果资源不足，您可以：</p>
<ul>
<li><p>单击<strong>前往项目资源设置</strong>按钮，以便编辑当前项目的资源设置，或者</p></li>
<li><p>单击<strong>返回上一步</strong>按钮，以便编辑当前集群的相关设置。</p></li>
</ul>
<p>操作期间会消耗少量额外资源，并在操作完成后释放。</p>

</Admonition>

您还可以使用 RESTful API 设置 Replica。`replica` 参数的取值应为 1 到 8 之间的整数。更多详情，请参考[修改集群副本数量](/reference/restful/modify-cluster-replica-v2)。

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "replica": 2
}'
```

## 定时扩缩容\{#scheduled-scaling}

您可以通过 Web 控制台或 RESTful API 设置集群 Replica 定时扩缩容。

定时扩缩容的 2 个调度计划之间时间间隔必须大于 30 分钟。

如需使用定时扩缩容的高级模式并了解如何编写 Cron 表达式，请参考 [Cron 表达式](./cron-expression)。

以下 Demo 展示如何设置 Replica 定时扩缩容

<Supademo id="cmd2ujs5s38dlc4kjgbm3gkui" title=""  />

此外，您还可以通过 RESTful API 设置定时扩缩容。详情请参考[修改集群配置](/reference/restful/modify-cluster-v2)。

```json
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "autoscaling": {
        "replica": {
            "schedules": [
                {
                    "cron": "10 0 0 0 0 ?",
                    "target": 2
                }
            ]
        }
    }
}'
```

## 动态扩缩容\{#dynamic-scaling}

Zilliz Cloud 支持 Replica 动态扩缩容。启用后，系统会基于实时 Query CU 计算资源指标自动调整 Replica 数量，确保高效处理工作负载且不中断服务。

在设置动态扩缩容时，您可以配置以下范围：

- **最小 Replica**：默认为当前 Replica 数量。

- **最大 Replica**：默认为当前 Replica 数量的 1 倍。最大不可超过 10。如需调整上限，请[提交工单](http://support.zilliz.com.cn)。

<Admonition type="info" icon="📘" title="说明">

<ul>
<li><p>选择比当前 Replica 数量小的最大值会立刻触发缩容。</p></li>
<li><p>选择比当前 Replica 数量大的最小值会立刻触发扩容。</p></li>
</ul>

</Admonition>

### 触发条件\{#trigger-conditions}

- **自动扩容**：CU 计算资源连续 2 分钟超过 60% 时触发。

- **自动缩容**：CU 计算资源连续 10 分钟低于 40% 时触发。

### 扩缩容目标值计算\{#scaling-size-calculation}

以下公式说明了 Zilliz Cloud 在动态扩缩容事件中如何计算目标 Replica 数量。动态扩缩容目标值的计算公式旨在将您的 CU 计算资源维持在 50% 的目标值。

```plaintext
目标 Replica 数量 = 当前 Replica 数量 × (当前指标值 / 目标指标值)
```

<table>
    <tr>
        <th><p>变量名称</p></th>
        <th><p>描述</p></th>
    </tr>
    <tr>
        <td><p>目标 Replica 数量</p></td>
        <td><p>系统计划将集群扩缩容至的新 Replica 数量</p></td>
    </tr>
    <tr>
        <td><p>当前 Replica 数量</p></td>
        <td><p>集群当前的 Replica 数量</p></td>
    </tr>
    <tr>
        <td><p>当前指标值</p></td>
        <td><p>当前测得的 CU 计算资源指标值</p></td>
    </tr>
    <tr>
        <td><p>目标指标值</p></td>
        <td><p>扩缩容后期望达到的 CU 计算资源值，固定为 50</p></td>
    </tr>
</table>

**示例**
 假设已启用动态扩缩容，且满足以下条件：

- **当前 Replica 数量**：1

- **集群 CU 加载容量**：连续 10 分钟超过 60%

将触发动态扩容事件。目标 Replica 数量计算如下：

```plaintext
1 × (60 / 50) = 1.2
```

该值向上取整到下一个 Replica 数量，即扩容至 2。

### 操作步骤\{#procedures}

以下 Demo 展示了如何启用 Replica 动态扩缩容功能。

<Supademo id="cmk2cc3xq00inxm0i4obrv5mc" title=""  />

此外，您还可以通过 RESTful API 设置动态扩缩容。详情请参考[修改集群配置](/reference/restful/modify-cluster-v2)。

```json
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "autoscaling": {
        "replica": {
            "min": 1,
            "max": 2
        }
    }
}'
```

## 查看集群扩缩容进度\{#view-scaling-progress}

当您发送手动扩缩容请求或集群自动触发动态扩缩容时，会生成一条任务记录。您可以前往[任务中心](./job-center)查看进度。

当扩缩容任务正在进行中时，您的集群状态将转为“修改中”。待扩缩容任务完成，您的集群状态将转为“运行中”。