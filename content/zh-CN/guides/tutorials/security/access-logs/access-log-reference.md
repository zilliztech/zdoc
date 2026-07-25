---
title: "访问日志参考 | Cloud"
slug: /access-log-reference
sidebar_key: access-log-reference
sidebar_label: "访问日志参考"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: PUBLIC
notebook: FALSE
description: "访问日志 以 JSON Lines 格式传输——每行一个 JSON 对象。每行是一个独立的 JSON 对象，代表一次操作。以下示例展示了一个 Search 操作，为便于阅读进行了格式化： | Cloud"
type: origin
token: Hq43w5qtPijHDok3TxKcZ60fnQc
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 访问
  - 日志
  - 参考

---

import Admonition from '@theme/Admonition';


# 访问日志参考

访问日志 以 [JSON Lines](https://jsonlines.org/) 格式传输——每行一个 JSON 对象。每行是一个独立的 JSON 对象，代表一次操作。以下示例展示了一个 Search 操作，为便于阅读进行了格式化：

```json
{
    "action": "Search",
    "cluster_id": "inxx-xxxxxxxxxxxxxxx",
    "database": "default",
    "date": "2026/04/14 06:31:16.827 +00:00",
    "interface": "Restful",
    "log_type": "ACCESS",
    "params": {
        "collection": "ccc1",
        "consistency_level": 2,
        "execution_time": "15.368706ms",
        "expr": "",
        "input_params": {
            "anns_field": "",
            "offset": "0",
            "params": "{}",
            "round_decimal": "-1",
            "topk": "10"
        },
        "nq": 1,
        "output_fields": ["*"],
        "partition": null,
        "result_num": 10,
        "result_pks": [55, 19, 18, 10, -26, 115, -14, -96, -50, 9],
        "result_scores": [0.87269604, 0.8639183, 0.8605273, 0.85245466, 0.8490447, 0.84537137, 0.84066796, 0.8314183, 0.8296911, 0.82586515],
        "topk": 10
    },
    "result": 0,
    "status": "Success",
    "timestamp": 1776148276827,
    "trace_id": "f89903d701329910380442aa86941be9",
    "user": "key-ibchakktguxxrvvxseoasz"
}
```

实际使用中，每条记录在 `.log` 文件中占一行。以下各节详细描述每个字段。

## 日志字段 Schema\{#log-field-schema}

<table>
   <tr>
     <th><p><strong>字段</strong></p></th>
     <th><p><strong>必填</strong></p></th>
     <th><p><strong>类型</strong></p></th>
     <th><p><strong>描述</strong></p></th>
     <th><p><strong>示例</strong></p></th>
   </tr>
   <tr>
     <td><p><code>action</code></p></td>
     <td><p>是</p></td>
     <td><p>string</p></td>
     <td><p>操作名称。参见<a href="./access-log-reference#supported-actions">支持的操作</a>。</p></td>
     <td><p><code>"Search"</code></p></td>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>是</p></td>
     <td><p>string</p></td>
     <td><p>集群的唯一标识符。</p></td>
     <td><p><code>"in01-2b8d91fc3a3b93b"</code></p></td>
   </tr>
   <tr>
     <td><p><code>database</code></p></td>
     <td><p>否</p></td>
     <td><p>string</p></td>
     <td><p>操作所在的数据库。</p></td>
     <td><p><code>"default"</code></p></td>
   </tr>
   <tr>
     <td><p><code>date</code></p></td>
     <td><p>是</p></td>
     <td><p>string</p></td>
     <td><p>人类可读的时间戳，包含时区信息。</p></td>
     <td><p><code>"2026/04/14 06:31:16.827 +00:00"</code></p></td>
   </tr>
   <tr>
     <td><p><code>interface</code></p></td>
     <td><p>是</p></td>
     <td><p>string</p></td>
     <td><p>接口类型：<code>Restful</code> 或 <code>Grpc</code>。</p></td>
     <td><p><code>"Restful"</code></p></td>
   </tr>
   <tr>
     <td><p><code>log_type</code></p></td>
     <td><p>是</p></td>
     <td><p>string</p></td>
     <td><p>日志类别：<code>ACCESS</code>、<code>AUDIT</code> 或 <code>SLOW</code>。</p></td>
     <td><p><code>"ACCESS"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>是</p></td>
     <td><p>object</p></td>
     <td><p>操作相关参数。嵌套字段详见<a href="./access-log-reference#params-field">下文</a>。</p></td>
     <td><p><code>--</code></p></td>
   </tr>
   <tr>
     <td><p><code>result</code></p></td>
     <td><p>是</p></td>
     <td><p>int</p></td>
     <td><p>操作结果码。<code>0</code> 表示成功；非零值表示错误。</p></td>
     <td><p><code>0</code></p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>是</p></td>
     <td><p>string</p></td>
     <td><p>操作状态的可读描述。</p></td>
     <td><p><code>"Success"</code></p></td>
   </tr>
   <tr>
     <td><p><code>timestamp</code></p></td>
     <td><p>是</p></td>
     <td><p>int</p></td>
     <td><p>代理接收请求时的 Unix 时间戳，单位为毫秒（13 位）。</p></td>
     <td><p><code>1776148276827</code></p></td>
   </tr>
   <tr>
     <td><p><code>trace_id</code></p></td>
     <td><p>是</p></td>
     <td><p>string</p></td>
     <td><p>操作的唯一 ID。用于关联属于同一请求的多条日志记录。</p></td>
     <td><p><code>"f89903d701329910380442aa86941be9"</code></p></td>
   </tr>
   <tr>
     <td><p><code>user</code></p></td>
     <td><p>是</p></td>
     <td><p>string</p></td>
     <td><p>发起请求的用户或 API Key。</p></td>
     <td><p><code>"key-ibchakktguxxrvvxseoasz"</code></p></td>
   </tr>
</table>

### params 字段\{#params-field}

<table>
   <tr>
     <th><p><strong>字段</strong></p></th>
     <th><p><strong>必填</strong></p></th>
     <th><p><strong>类型</strong></p></th>
     <th><p><strong>描述</strong></p></th>
     <th><p><strong>示例</strong></p></th>
   </tr>
   <tr>
     <td><p><code>params.collection</code></p></td>
     <td><p>否</p></td>
     <td><p>string</p></td>
     <td><p>目标 Collection。Search、HybridSearch 和 Query 操作必填。</p></td>
     <td><p><code>"ccc1"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.consistency_level</code></p></td>
     <td><p>否</p></td>
     <td><p>int</p></td>
     <td><p>操作使用的一致性级别。</p></td>
     <td><p><code>2</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.execution_time</code></p></td>
     <td><p>否</p></td>
     <td><p>string</p></td>
     <td><p>服务端执行时间，从代理接收完整载荷到开始发送响应的时间。不包含网络传输时间。</p></td>
     <td><p><code>"15.368706ms"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.expr</code></p></td>
     <td><p>否</p></td>
     <td><p>string 或 array</p></td>
     <td><p>请求中传递的过滤表达式。HybridSearch 中为表达式数组（每个子请求一个）。</p></td>
     <td><p><code>"" 或 [""]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.input_params</code></p></td>
     <td><p>否</p></td>
     <td><p>object</p></td>
     <td><p>操作的输入参数（搜索参数、Offset、Topk 等）。HybridSearch 中包含 <code>sub_0.&ast;</code> 前缀的子请求参数和 <code>strategy</code>。</p></td>
     <td><p><code>\{"topk": "10", "offset": "0"\}</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.limit</code></p></td>
     <td><p>否</p></td>
     <td><p>int</p></td>
     <td><p>返回结果数量上限。出现在 Query 和 HybridSearch 操作中。</p></td>
     <td><p><code>100</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.nq</code></p></td>
     <td><p>否</p></td>
     <td><p>int</p></td>
     <td><p>查询向量数量。出现在 Search 操作中。</p></td>
     <td><p><code>1</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.output_fields</code></p></td>
     <td><p>否</p></td>
     <td><p>array</p></td>
     <td><p>查询中请求的输出字段。</p></td>
     <td><p><code>["&ast;"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.partition</code></p></td>
     <td><p>否</p></td>
     <td><p>string</p></td>
     <td><p>目标 Partition（如已指定）。未指定时为 <code>null</code>。</p></td>
     <td><p><code>null</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.result_num</code></p></td>
     <td><p>否</p></td>
     <td><p>int</p></td>
     <td><p>操作实际返回的结果数量。</p></td>
     <td><p><code>10</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.result_pks</code></p></td>
     <td><p>否</p></td>
     <td><p>array</p></td>
     <td><p>查询结果中的主键。出现在 Search、HybridSearch 和 Query 操作中，且需配置输出参数包含该字段。</p></td>
     <td><p><code>[55, 19, 18, 10]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.result_scores</code></p></td>
     <td><p>否</p></td>
     <td><p>array</p></td>
     <td><p>与 <code>params.result_pks</code> 中各条目对应的相似度分数。出现在 Search 和 HybridSearch 操作中。</p></td>
     <td><p><code>[0.87269604, 0.8639183]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.topk</code></p></td>
     <td><p>否</p></td>
     <td><p>int</p></td>
     <td><p>搜索请求的 topk 参数。出现在 Search 和 HybridSearch 操作中。</p></td>
     <td><p><code>10</code></p></td>
   </tr>
</table>

## 支持的操作\{#supported-actions}

当前版本仅记录查询类操作：

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>Search</p></td>
     <td><p>向量相似性搜索</p></td>
   </tr>
   <tr>
     <td><p>HybridSearch</p></td>
     <td><p>多向量搜索并重排序</p></td>
   </tr>
   <tr>
     <td><p>Query</p></td>
     <td><p>标量过滤查询</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

更多操作的支持计划在后续版本中发布。

</Admonition>

## 文件路径与命名\{#file-path-and-naming}

日志文件在你的对象存储桶中按照以下路径结构组织：

```plaintext
/<Cluster ID>/<Log type>/<Date>/<File name><File name suffix>
```

<table>
   <tr>
     <th><p><strong>组成部分</strong></p></th>
     <th><p><strong>格式</strong></p></th>
     <th><p><strong>示例</strong></p></th>
   </tr>
   <tr>
     <td><p>Cluster ID</p></td>
     <td><p>集群的唯一标识符</p></td>
     <td><p><code>in03-c7be749d5f403ad</code></p></td>
   </tr>
   <tr>
     <td><p>Log type</p></td>
     <td><p>access、audit 或 slow</p></td>
     <td><p><code>access</code></p></td>
   </tr>
   <tr>
     <td><p>Date</p></td>
     <td><p>ISO 日期（YYYY-MM-DD）</p></td>
     <td><p><code>12/20/2024</code></p></td>
   </tr>
   <tr>
     <td><p>File name</p></td>
     <td><p>HH:MM:SS-&lt;UUID&gt;，其中 HH:MM:SS 为 UTC 时间，&lt;UUID&gt; 为随机字符串以确保唯一性</p></td>
     <td><p><code>09:16:53-jz5l7D8Q</code></p></td>
   </tr>
   <tr>
     <td><p>File name suffix</p></td>
     <td><p>.log</p></td>
     <td><p><code>.log</code></p></td>
   </tr>
</table>

完整路径示例：

```plaintext
/inxx-xxxxxxxxxxxxxxx/access/2024-12-20/09:16:53-jz5l7D8Q.log
```

