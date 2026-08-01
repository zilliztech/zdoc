---
title: "访问日志参考 | BYOC"
slug: /access-log-reference
sidebar_label: "访问日志参考"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "访问日志 以 JSON Lines 格式传输——每行一个 JSON 对象。每行是一个独立的 JSON 对象，代表一次操作。以下示例展示了一个 Search 操作，为便于阅读进行了格式化： | BYOC"
type: origin
token: Hq43w5qtPijHDok3TxKcZ60fnQc
sidebar_position: 3
displayed_sidebar: default

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

| **字段** | **必填** | **类型** | **描述** | **示例** |
| --- | --- | --- | --- | --- |
| `action` | 是 | string | 操作名称。参见[支持的操作](./access-log-reference#supported-actions)。 | `"Search"` |
| `cluster_id` | 是 | string | 集群的唯一标识符。 | `"in01-2b8d91fc3a3b93b"` |
| `database` | 否 | string | 操作所在的数据库。 | `"default"` |
| `date` | 是 | string | 人类可读的时间戳，包含时区信息。 | `"2026/04/14 06:31:16.827 +00:00"` |
| `interface` | 是 | string | 接口类型：`Restful` 或 `Grpc`。 | `"Restful"` |
| `log_type` | 是 | string | 日志类别：`ACCESS`、`AUDIT` 或 `SLOW`。 | `"ACCESS"` |
| `params` | 是 | object | 操作相关参数。嵌套字段详见[下文](./access-log-reference#params-field)。 | `--` |
| `result` | 是 | int | 操作结果码。`0` 表示成功；非零值表示错误。 | `0` |
| `status` | 是 | string | 操作状态的可读描述。 | `"Success"` |
| `timestamp` | 是 | int | 代理接收请求时的 Unix 时间戳，单位为毫秒（13 位）。 | `1776148276827` |
| `trace_id` | 是 | string | 操作的唯一 ID。用于关联属于同一请求的多条日志记录。 | `"f89903d701329910380442aa86941be9"` |
| `user` | 是 | string | 发起请求的用户或 API Key。 | `"key-ibchakktguxxrvvxseoasz"` |

### params 字段\{#params-field}

| **字段** | **必填** | **类型** | **描述** | **示例** |
| --- | --- | --- | --- | --- |
| `params.collection` | 否 | string | 目标 Collection。Search、HybridSearch 和 Query 操作必填。 | `"ccc1"` |
| `params.consistency_level` | 否 | int | 操作使用的一致性级别。 | `2` |
| `params.execution_time` | 否 | string | 服务端执行时间，从代理接收完整载荷到开始发送响应的时间。不包含网络传输时间。 | `"15.368706ms"` |
| `params.expr` | 否 | string 或 array | 请求中传递的过滤表达式。HybridSearch 中为表达式数组（每个子请求一个）。 | `"" 或 [""]` |
| `params.input_params` | 否 | object | 操作的输入参数（搜索参数、Offset、Topk 等）。HybridSearch 中包含 `sub_0.*` 前缀的子请求参数和 `strategy`。 | `{"topk": "10", "offset": "0"}` |
| `params.limit` | 否 | int | 返回结果数量上限。出现在 Query 和 HybridSearch 操作中。 | `100` |
| `params.nq` | 否 | int | 查询向量数量。出现在 Search 操作中。 | `1` |
| `params.output_fields` | 否 | array | 查询中请求的输出字段。 | `["*"]` |
| `params.partition` | 否 | string | 目标 Partition（如已指定）。未指定时为 `null`。 | `null` |
| `params.result_num` | 否 | int | 操作实际返回的结果数量。 | `10` |
| `params.result_pks` | 否 | array | 查询结果中的主键。出现在 Search、HybridSearch 和 Query 操作中，且需配置输出参数包含该字段。 | `[55, 19, 18, 10]` |
| `params.result_scores` | 否 | array | 与 `params.result_pks` 中各条目对应的相似度分数。出现在 Search 和 HybridSearch 操作中。 | `[0.87269604, 0.8639183]` |
| `params.topk` | 否 | int | 搜索请求的 topk 参数。出现在 Search 和 HybridSearch 操作中。 | `10` |

## 支持的操作\{#supported-actions}

当前版本仅记录查询类操作：

| **操作** | **描述** |
| --- | --- |
| Search | 向量相似性搜索 |
| HybridSearch | 多向量搜索并重排序 |
| Query | 标量过滤查询 |

<Admonition type="info" icon="📘" title="说明">

更多操作的支持计划在后续版本中发布。

</Admonition>

## 文件路径与命名\{#file-path-and-naming}

日志文件在你的对象存储桶中按照以下路径结构组织：

```plaintext
/<Cluster ID>/<Log type>/<Date>/<File name><File name suffix>
```

| **组成部分** | **格式** | **示例** |
| --- | --- | --- |
| Cluster ID | 集群的唯一标识符 | `in03-c7be749d5f403ad` |
| Log type | access、audit 或 slow | `access` |
| Date | ISO 日期（YYYY-MM-DD） | `12/20/2024` |
| File name | HH:MM:SS-&lt;UUID&gt;，其中 HH:MM:SS 为 UTC 时间，&lt;UUID&gt; 为随机字符串以确保唯一性 | `09:16:53-jz5l7D8Q` |
| File name suffix | .log | `.log` |

完整路径示例：

```plaintext
/inxx-xxxxxxxxxxxxxxx/access/2024-12-20/09:16:53-jz5l7D8Q.log
```

