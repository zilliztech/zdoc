---
title: "Query CU 扩缩容 | BYOC"
slug: /scale-query-cu
sidebar_label: "Query CU 扩缩容"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "随着工作负载增长和数据写入量的增加，集群可能会达到容量上限。在这种情况下，读取操作仍可正常进行，但新的写入请求可能会失败。 | BYOC"
type: origin
token: KgrNwYNN6iuoEMkdpwjcTOeanrb
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - Query CU 扩缩容

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Query CU 扩缩容

随着工作负载增长和数据写入量的增加，集群可能会达到容量上限。在这种情况下，读取操作仍可正常进行，但新的写入请求可能会失败。

为实现主动管理，您可以在[指标](./view-cluster-metric-charts)页面查看 **Query CU 加载容量**，判断是否需要扩容。根据业务需求和访问模式，您可以上调 Query CU 数量以扩大集群容量，或在需求量减少时下调 Query CU 数量以降低成本。

注意：对于 1-8 Query CU 的集群，请直接进行集群扩缩容。对于超过 8 Query CU 的集群，请增加 [Replica 数量](./manage-replica)。

本指南将介绍如何根据变化的工作负载调整集群 Query CU 数量。

## 注意事项\{#considerations}

- **资源限制：**

    - **扩容**

        - Dedicated 企业版集群：最多支持 256  Query CU

        - **Query CU 数量 × Replica 数量**的乘积不得超过 256。

        如需更大 Query CU 数量，请[联系销售](http://zilliz.com.cn/contact-sales)。

    - **缩容**

        - 对于已设置多副本（Replica）的集群，Query CU 数量不得缩减到低于 8 CU。

        - 缩容请求仅在满足以下条件时才会成功：

            - 当前数据量 < 缩容后 [CU 加载容量](./metrics-alerts-reference)的 80%。

            - 当前 Collection 和 Partition 数量小于新 Query CU 数量所支持的最大 Collection 和 Partition 数。

- **扩缩容过程中**：集群状态将变为“修改中”，在此期间无法执行任何操作。如触发多个扩缩容任务，将按触发时间顺序依次处理。扩缩容任务完成时间取决于数据量。

- **性能影响**：扩缩容过程中可能会出现轻微的服务抖动。

- **备份限制**：动态和定时扩缩容设置不会包含在[备份](./backup-and-restore)中。恢复集群后需要重新手动配置。

## 手动扩缩容\{#manual-scaling}

您可以通过 Zilliz Cloud 控制台或 RESTful API 手动扩展或缩减集群的 Query CU 数量。

以下 Demo 展示了如何在 Zilliz Cloud Web 控制台中手动扩容或缩容集群。

<Supademo id="cmd2tmxru37t9c4kjvmhe8n6f" title=""  />

<Admonition type="info" icon="📘" title="说明">

<p>当您在 <strong>Query Node CU 扩缩容</strong>对话框中单击<strong>保存</strong>后，您将看到自动弹出的<strong>检查项目资源配额</strong>窗口。如果当前项目的资源充足，该窗口在检查完成后会自动消失。如果资源不足，您可以：</p>
<ul>
<li><p>单击<strong>前往项目资源设置</strong>按钮，以便编辑当前项目的资源设置，或者</p></li>
<li><p>单击<strong>返回上一步</strong>按钮，以便编辑当前集群的相关设置。</p></li>
</ul>
<p>操作期间会消耗少量额外资源，并在操作完成后释放。</p>

</Admonition>

您还可以通过 RESTful API 进行 Query CU 手动扩缩容。

以下示例将现有集群扩展为 2  CU。详情请见[修改集群配置](/reference/restful/modify-cluster-v2)。

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "cuSize": 2
}'
```

## 定时扩缩容\{#scheduled-scaling}

<Admonition type="info" icon="📘" title="说明">

<p>此功能仅限<strong>企业版</strong>项目中的 <strong>Dedicated</strong> 集群使用。</p>

</Admonition>

定时扩缩容的 2 个调度计划之间时间间隔必须大于 30 分钟。

如需使用定时扩缩容的高级模式并了解如何编写 Cron 表达式，请参考 [Cron 表达式](./cron-expression)。

<Supademo id="cmjmbp8n709chyb0hzmb2cwdt" title=""  />

您也可以使用 RESTful API 启用定时扩缩容。详情请见[修改集群配置](/reference/restful/modify-cluster-v2)。

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

以下为示例返回结果：

```bash
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "prompt": "successfully submitted. Cluster is being upgraded, which is expected to take several minutes. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK."
    }
}
```

## 动态扩缩容\{#dynamic-scaling}

<Admonition type="info" icon="📘" title="说明">

<p>此功能仅限<strong>企业版</strong>项目中的 <strong>Dedicated</strong> 集群使用。</p>

</Admonition>

Zilliz Cloud 支持 Query CU 动态扩缩容。启用后，系统会基于实时 Query CU 加载容量指标自动调整 Query CU 资源，确保高效处理工作负载且不中断服务。

在设置动态扩缩容时，您可以配置以下范围：

- **最小 Query CU**：默认为当前 Query CU 大小。

- **最大 Query CU**：默认为当前 Query CU 大小的 4 倍。

<Admonition type="info" icon="📘" title="说明">

<ul>
<li><p>选择比当前 Query CU 小的最大值会立刻触发缩容。</p></li>
<li><p>选择比当前 Query CU 大的最小值会立刻触发扩容。</p></li>
</ul>

</Admonition>

### 触发条件\{#trigger-conditions}

- **自动扩容**：CU 加载容量连续 10 分钟超过 80% 时触发。当 CU 加载容量 100% 时，立刻触发扩容。

- **自动缩容**：CU 加载容量连续 30 分钟低于 60% 时触发。

- 连续两次扩容事件之间的冷却时间为 10 分钟，连续两次缩容事件之间的冷却时间为 30 分钟。自动缩容操作将按逐档下降的方式执行，直到达到目标指标值为止。

### 扩缩容目标值计算\{#scaling-size-calculation}

以下公式说明了 Zilliz Cloud 在动态扩缩容事件中如何计算目标 Query CU 数量。动态扩缩容目标值的计算公式旨在将您的 CU 加载容量维持在 70% 的目标值。

```plaintext
目标 Query CU 数量 = 当前 Query CU 数量 × (当前指标值 / 目标指标值)
```

<table>
    <tr>
        <th><p>变量名称</p></th>
        <th><p>描述</p></th>
    </tr>
    <tr>
        <td><p>目标 Query CU 数量</p></td>
        <td><p>系统计划将集群扩缩容至的新 Query CU 数量</p></td>
    </tr>
    <tr>
        <td><p>当前 Query CU 数量</p></td>
        <td><p>集群当前的 Query CU 数量</p></td>
    </tr>
    <tr>
        <td><p>当前指标值</p></td>
        <td><p>当前测得的 Query CU 加载容量指标值</p></td>
    </tr>
    <tr>
        <td><p>目标指标值</p></td>
        <td><p>扩缩容后期望达到的 CU 加载容量值，固定为 70</p></td>
    </tr>
</table>

**示例**
 假设已启用动态扩缩容，且满足以下条件：

- **当前 Query CU 数量**：60 CU

- **集群 Query CU 加载容量**：连续 10 分钟超过 80%

将触发动态扩容事件。目标 Query CU 数量计算如下：

```plaintext
60 × (80 / 70) ≈ 68.57 CU
```

该值向上取整到下一个 CU 数量，即扩容至 72 CU。

### 操作步骤\{#procedures}

以下 Demo 展示了如何在 Zilliz Cloud 控制台中配置动态扩缩容。

<Supademo id="cmd2tuc413818c4kjnjh1p2iw" title=""  />

除此之外，您还可以使用 RESTful API 配置动态扩缩容。

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
        }
    }
}'
```

## 查看集群扩缩容进度\{#view-scaling-progress}

当您发送手动扩缩容请求或集群自动触发动态扩缩容时，会生成一条任务记录。您可以前往[任务中心](./job-center)查看进度。

当扩缩容任务正在进行中时，您的集群状态将转为“修改中”。待扩缩容任务完成，您的集群状态将转为“运行中”。

## 常见问题\{#faq}

1. **集群缩容时有哪些限制？**

    - 启用了 Replica 的集群，缩容后 Query CU 数量不得少于 8。

    - 缩容请求仅在同时满足以下两个条件时才会成功：

        - 当前数据量小于新 Query CU 容量的 80%；

        - 当前的 Collection 和 Partition 数量在新 Query CU 所支持的上限范围内。

