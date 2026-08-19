---
title: "慢查询日志参考 | BYOC"
slug: /slow-log-reference
sidebar_label: "慢查询日志参考"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "慢查询日志以 JSON Lines 格式投递，即每行一个 JSON 对象。每一行都是一个独立的 JSON 对象，表示一次操作。以下示例展示了一条 Search 请求对应的慢查询日志记录： | BYOC"
type: origin
token: NhIhwuigsi0tOVk2GNEcFuaTnYb
sidebar_position: 14
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 慢查询日志参考

慢查询日志以 [JSON Lines](https://jsonlines.org/) 格式投递，即每行一个 JSON 对象。每一行都是一个独立的 JSON 对象，表示一次操作。以下示例展示了一条 Search 请求对应的慢查询日志记录：

```json
{
  "action": "Search",
  "cluster_id": "inxx-xxxxxxxxxxxxxxx",
  "collection": "medium_articles",
  "connection_uid": "453798218345292801",
  "consistency_level": "Bounded",
  "database": "default",
  "error_code": 0,
  "execution_time": "231.4ms",
  "interface": "Grpc",
  "ip": "203.0.113.10",
  "log_type": "SLOW",
  "output_fields": ["title", "author"],
  "partition": null,
  "sdk": "pymilvus",
  "sdk_version": "2.6.0",
  "status": "Success",
  "timestamp": 1776148276827,
  "trace_id": "f89903d701329910380442aa86941be9",
  "user": "key-ibchakktguxxrvvxseoasz"
}
```

实际使用中，每条记录在 `.log` 文件中占据一行。以下章节详细说明每个字段。

## 日志字段 Schema\{#log-field-schema}

| **字段** | **是否必填** | **类型** | **说明** | **示例** |
| --- | --- | --- | --- | --- |
| `action` | 否 | string | 操作名称，例如 `Query`、`Search` 或 `Hybrid Search`。 | `"Search"` |
| `cluster_id` | 是 | string | 集群的唯一标识符。下游日志管道需要使用该字段。 | `"inxx-xxxxxxxxxxxxxxx"` |
| `collection` | 否 | string | 当操作作用于某个 collection 时，表示目标 collection。 | `"medium_articles"` |
| `connection_uid` | 否 | string | 与请求关联的内部连接标识符。 | `"453798218345292801"` |
| `consistency_level` | 否 | string | 请求使用的一致性级别。 | `"Bounded"` |
| `database` | 否 | string | 发生该操作的数据库。 | `"default"` |
| `error_code` | 否 | int | 请求结果码。`0` 通常表示成功。 | `0` |
| `execution_time` | 否 | string | 请求的实际执行耗时，用于判断该请求是否应被输出到慢查询日志。 | `"231.4ms"` |
| `interface` | 否 | string | 请求接口，通常为 `Grpc` 或 `Restful`。 | `"Grpc"` |
| `ip` | 否 | string | 为该请求记录的客户端 IP 地址。 | `"203.0.113.10"` |
| `log_type` | 是 | string | 日志类别。对于慢查询日志记录，该值为 `SLOW`。 | `"SLOW"` |
| `output_fields` | 否 | array | 请求指定的输出字段（如适用）。 | `["title", "author"]` |
| `partition` | 否 | string 或 null | 目标 partition。未指定 partition 时，该值为 `null`。 | `null` |
| `sdk` | 否 | string | 客户端 SDK 名称。 | `"pymilvus"` |
| `sdk_version` | 否 | string | 客户端 SDK 版本。 | `"2.6.0"` |
| `status` | 否 | string | 便于阅读的请求状态。 | `"Success"` |
| `timestamp` | 是 | int | Unix 毫秒时间戳。对象存储 sink 在生成最终文件路径时需要使用该字段。 | `1776148276827` |
| `trace_id` | 否 | string | 唯一的请求追踪标识符，用于关联和排查问题。 | `"f89903d701329910380442aa86941be9"` |
| `user` | 是 | string | 发起请求的用户名或 API key。日志管道过滤也会使用该字段。 | `"key-ibchakktguxxrvvxseoasz"` |

## 支持的操作\{#supported-actions}

当前慢查询日志功能默认支持以下操作：

| 操作 | 说明 |
| --- | --- |
| Search | 向量相似度搜索 |
| HybridSearch | 带重排的多向量搜索 |
| Query | 标量过滤查询 |

## 文件路径和命名\{#file-path-and-naming}

慢查询日志文件会上传到对象存储中的 `slow` 目录下，并在最终对象 key 中使用 UTC 日期和时间。

```plaintext
/<Cluster ID>/slow/<Date>/<File name>.log
```

| **组成部分** | **格式** | **示例** |
| --- | --- | --- |
| Cluster ID | 集群的唯一标识符。 | `inxx-xxxxxxxxxxxxxxx` |
| 日志类型目录 | 固定为 `slow`。 | `slow` |
| 日期 | UTC 日期，格式为 `YYYY-MM-DD`。 | `2026-04-14` |
| 文件名 | `HH:MM:SS-<UUID>.log`，使用 UTC 时间。 | `06:31:16-jz5l7D8Q.log` |

完整路径示例：

```plaintext
/inxx-xxxxxxxxxxxxxxx/slow/2026-04-14/06:31:16-jz5l7D8Q.log
```
