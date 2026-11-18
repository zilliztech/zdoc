---
title: "スローログ リファレンス | Cloud"
slug: /slow-log-reference
sidebar_label: "スローログ リファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリファレンスでは、遅いリクエストの所要時間、結果、実行コンテキストを確認できます。JSON、Elastic Common スキーマ（ECS）、OpenTelemetry（OTel）の出力を扱います。しきい値と送信先を設定するには、スローログの構成を参照してください。 | Cloud"
type: origin
token: QvqMw06F7iI6oKkXiD4cjV33nCd
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# スローログ リファレンス

このリファレンスでは、遅いリクエストの所要時間、結果、実行コンテキストを確認できます。**JSON**、Elastic Common スキーマ **（ECS）**、OpenTelemetry **（OTel）** の出力を扱います。しきい値と送信先を設定するには、[スローログの構成](./configure-slow-logs) を参照してください。

## ログ形式\{#log-formats}

HTTPS 転送では、3つの形式はすべて改行区切り JSON（NDJSON）を使用し、1 行に 1 件のログエントリが含まれます。各行を JSON オブジェクトとして解析し、選択した形式に従ってレコードを読み取ります。

| 形式 | ログフィールドの参照先 |
| --- | --- |
| JSON | オブジェクトから直接フィールドを読み取ります。たとえば、`params.execution_time` です。 |
| ECS | `event.duration` などの標準フィールドを読み取ります。元のレコード全体は `zilliz.original` にあるオブジェクトです。 |
| OTel | `timeUnixNano` と `attributes` を読み取ります。元のレコードにアクセスするには、`body.stringValue` を JSON として解析します。 |

## ログフィールド\{#log-fields}

以下の表では、元の JSON レコード内のフィールドについて説明します。ECS 出力では、これらのフィールドは `zilliz.original` の下にネストされます。たとえば、`params.execution_time` は `zilliz.original.params.execution_time` になります。OTel 出力では、`body.stringValue` を JSON として解析して同じフィールドを読み取ります。

### 実行時間と結果\{#execution-time-and-result}

| フィールド | JSON 型 | 説明 |
| --- | --- | --- |
| `params.execution_time` | string | 単位を含む、記録された実行時間です。この例では `1.802601ms` が記録されています。実行時間と設定済みのしきい値は、同じ単位で比較してください。 |
| `status` | string | 人が判読できる形式のリクエストステータスです。この例は `Success` です。リクエストは成功しても、スローログの対象になる場合があります。 |
| `error_code` | integer | リクエストの結果コードです。この例の成功したリクエストでは `0` が記録されています。 |

### リクエストコンテキスト\{#request-context}

| フィールド | JSON 型 | 説明 |
| --- | --- | --- |
| `action` | string | `Search` などの操作名です。スローログでは `Search`、`HybridSearch`、`Query` がサポートされています。 |
| `timestamp` | integer | ログに記録されたリクエストの時刻です。Unix タイムスタンプ（ミリ秒）で表されます。 |
| `cluster_id` | string | リクエストを処理したクラスターの識別子です。 |
| `database` | string | リクエストでアクセスしたデータベースです。 |
| `log_type` | string | ログカテゴリです。値は `SLOW` です。 |
| `user` | string | リクエストを発行した識別情報です。たとえば、ユーザー名や API キー識別子です。 |
| `interface` | string | リクエストに使用されたインターフェースです。この例では REST API を使用し、`Restful` と記録されています。 |
| `ip` | string | リクエストについて記録された送信元 IP アドレスです。 |
| `trace_id` | string | リクエストに関連付けられたトレース識別子です。相関とトラブルシューティングに役立ちます。 |

### 操作パラメーター\{#operation-parameters}

| フィールド | JSON 型 | 説明 |
| --- | --- | --- |
| `params.collection` | string | 検索対象のコレクションの名前です。 |
| `params.nq` | integer | クエリベクトルの数です。この例には 1つのベクトルが含まれています。 |
| `params.output_fields` | array of strings | 応答で要求されたエンティティフィールドです。これらはコレクションのフィールドであり、ログレコード用に選択されたフィールドではありません。 |
| `params.consistency_level` | integer | リクエストについて記録された数値の整合性レベルです。この例では `2` が記録されています。 |
| `params.partition` | この例では null | リクエストについて記録されたパーティションの選択内容です。このリクエストではパーティションが指定されていないため、値は `null` です。 |

## 形式のマッピング\{#format-mappings}

各形式で共通フィールドを特定するには、これらのマッピングを使用します。OTel 列では、`timeUnixNano` を除くすべての名前が `attributes` 配列内のキーです。文字列属性では `value.stringValue` を使用します。

| フィールド | JSON | ECS | OTel |
| --- | --- | --- | --- |
| 時刻 | `timestamp` — ミリ秒 | `@timestamp` — UTC 日時 | `timeUnixNano` — 文字列としてのナノ秒 |
| 実行時間 | `params.execution_time` — 単位付きの文字列 | `event.duration` — 数値としてのナノ秒 | `event.duration` — `value.intValue` 内のナノ秒（文字列） |
| 操作 | `action` | `event.action` | `event.action` |
| 呼び出し元 | `user` | `user.name` | `user.name` |
| クラスター | `cluster_id` | `zilliz.original.cluster_id` | `zilliz.cluster.id` |
| ログタイプ | `log_type` = SLOW | `event.dataset` = `zilliz.milvus.slow` | `zilliz.log.type` = SLOW |
| 結果 | `status` = `Success` | `event.outcome` = `success` | `event.outcome` = `success` |
| クライアントアドレス | `ip` | `source.ip` | `source.address` |
| トレース | `trace_id` | `trace.id` | `trace.id` |

コレクションの詳細、リクエストパラメーター、エラーコードは元のレコードに残ります。上のマッピングでは、個々のフィールドに展開されません。ここに示す結果のマッピングは、成功したリクエストのものです。

## 例\{#examples}

以下の完全なレコードは、実際の HTTPS 配信から取得したものです。識別情報の値は置き換えられていますが、その他のフィールドと値は変更されていません。読みやすさのため、改行とインデントを追加しています。これらのスローログを収集する際には、一時的な 1 ms のしきい値を使用しました。

### JSON の例\{#json-example}

この成功した Search リクエストの所要時間は `1.802601ms` で、一時的な 1 ms のしきい値を超えています。

```json
{
  "action": "Search",
  "cluster_id": "in01-example",
  "database": "default",
  "error_code": 0,
  "interface": "Restful",
  "ip": "192.0.2.10",
  "log_type": "SLOW",
  "params": {
    "collection": "docs_log_sample_20261110",
    "consistency_level": 2,
    "execution_time": "1.802601ms",
    "nq": 1,
    "output_fields": [
      "primary_key"
    ],
    "partition": null
  },
  "status": "Success",
  "timestamp": 1794300563698,
  "trace_id": "0123456789abcdef0123456789abcdef",
  "user": "key-example"
}
```

### ECS の例\{#ecs-example}

この Search レコードは ECS バージョン `8.11.0` を宣言しています。標準フィールドは、`zilliz.original` 内の完全なレコードと並んで表示されます。

```json
{
  "@timestamp": "2026-11-10T09:23:25.97Z",
  "ecs": {
    "version": "8.11.0"
  },
  "event": {
    "action": "Search",
    "category": [
      "database"
    ],
    "dataset": "zilliz.milvus.slow",
    "duration": 4868781,
    "kind": "event",
    "outcome": "success",
    "type": [
      "access"
    ]
  },
  "source": {
    "ip": "192.0.2.10"
  },
  "trace": {
    "id": "0123456789abcdef0123456789abcdef"
  },
  "user": {
    "name": "key-example"
  },
  "zilliz": {
    "original": {
      "action": "Search",
      "cluster_id": "in01-example",
      "database": "default",
      "error_code": 0,
      "interface": "Restful",
      "ip": "192.0.2.10",
      "log_type": "SLOW",
      "params": {
        "collection": "docs_log_sample_20261110",
        "consistency_level": 2,
        "execution_time": "4.868781ms",
        "nq": 1,
        "output_fields": [
          "primary_key"
        ],
        "partition": null
      },
      "status": "Success",
      "timestamp": 1794302605970,
      "trace_id": "0123456789abcdef0123456789abcdef",
      "user": "key-example"
    }
  }
}
```

### OTel の例\{#otel-example}

この Search レコードには、元の JSON が `body.stringValue` 内のエスケープされた文字列として、マッピングされた `attributes` とともに格納されています。各 NDJSON 行は、`resourceLogs` エンベロープを持たない個別のログレコードです。

```json
{
  "timeUnixNano": "1794302922142000000",
  "body": {
    "stringValue": "{\"action\":\"Search\",\"cluster_id\":\"in01-example\",\"database\":\"default\",\"error_code\":0,\"interface\":\"Restful\",\"ip\":\"192.0.2.10\",\"log_type\":\"SLOW\",\"params\":{\"collection\":\"docs_log_sample_20261110\",\"consistency_level\":2,\"execution_time\":\"1.579877ms\",\"nq\":1,\"output_fields\":[\"primary_key\"],\"partition\":null},\"status\":\"Success\",\"timestamp\":1794302922142,\"trace_id\":\"0123456789abcdef0123456789abcdef\",\"user\":\"key-example\"}"
  },
  "attributes": [
    {
      "key": "zilliz.cluster.id",
      "value": {
        "stringValue": "in01-example"
      }
    },
    {
      "key": "zilliz.log.type",
      "value": {
        "stringValue": "SLOW"
      }
    },
    {
      "key": "user.name",
      "value": {
        "stringValue": "key-example"
      }
    },
    {
      "key": "source.address",
      "value": {
        "stringValue": "192.0.2.10"
      }
    },
    {
      "key": "event.action",
      "value": {
        "stringValue": "Search"
      }
    },
    {
      "key": "event.outcome",
      "value": {
        "stringValue": "success"
      }
    },
    {
      "key": "trace.id",
      "value": {
        "stringValue": "0123456789abcdef0123456789abcdef"
      }
    },
    {
      "key": "event.duration",
      "value": {
        "intValue": "1579877"
      }
    }
  ]
}
```

`timeUnixNano` または `value.intValue` を読み取る際は、整数の精度を維持してください。たとえば、JavaScript でナノ秒のタイムスタンプには `BigInt` を使用します。
