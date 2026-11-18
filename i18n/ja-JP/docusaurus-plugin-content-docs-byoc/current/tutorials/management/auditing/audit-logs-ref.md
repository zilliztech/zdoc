---
title: "VectorDB 監査ログリファレンス | BYOC"
slug: /audit-logs-ref
sidebar_label: "VectorDB 監査ログリファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリファレンスを使用すると、データベース操作を実行したユーザーを特定し、記録された結果を確認し、監査レコードを相互に関連付けられます。JSON、Elastic Common Schema（ECS）スキーマ、OpenTelemetry（OTel）の出力を扱います。セットアップ手順については、VectorDB 監査ログを参照してください。 | BYOC"
type: origin
token: IrxCwX9Hoi2BYckqDdjcSN7ynkh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# VectorDB 監査ログリファレンス

このリファレンスを使用すると、データベース操作を実行したユーザーを特定し、記録された結果を確認し、監査レコードを相互に関連付けられます。**JSON**、Elastic Common Schema **（ECS）** スキーマ、OpenTelemetry **（OTel）** の出力を扱います。セットアップ手順については、[VectorDB 監査ログ](./audit-logs) を参照してください。

## ログ形式\{#log-formats}

HTTPS 転送では、各リクエスト本文に改行区切りの JSON（NDJSON）が格納され、1 行につき 1 件の監査レコードが含まれます。各行を個別に解析し、選択した形式に従ってフィールドを読み取ります。

| 形式 | 監査フィールドの確認場所 |
| --- | --- |
| JSON | `action` や `params.execution_time` などのフィールドをオブジェクトから直接読み取ります。 |
| ECS | `event.action` や `event.duration` などの標準フィールドを使用します。元のレコード全体は `zilliz.original` にあるオブジェクトです。 |
| OTel | `timeUnixNano` と `attributes` を使用します。元のレコードを読み取るには、`body.stringValue` を JSON として解析します。 |

## ログフィールド\{#log-fields}

フィールドの表では、元の JSON レコード内のパスを使用しています。ECS では、各パスの先頭に `zilliz.original` とドットを追加します。OTel では、`body.stringValue` を解析してからこれらのフィールドを読み取ります。フィールドは操作、インターフェース、レコードの段階によって異なります。

### 共通フィールド\{#common-fields}

| フィールド | 型 | 意味 |
| --- | --- | --- |
| `action` | 文字列 | `ShowCollections` や `Query` などの操作名です。 |
| `user` | 文字列 | 操作に関連付けられたデータベースユーザーまたは API キーの識別子です。 |
| `cluster_id` | 文字列 | 操作が実行されたクラスターの識別子です。 |
| `database` | 文字列 | 操作に関連付けられたデータベースです。 |
| `interface` | 文字列 | `Restful` や `Grpc` などのリクエストインターフェースです。 |
| `log_type` | 文字列 | VectorDB 監査レコードの場合は `AUDIT` です。 |
| `timestamp` | 整数 | Unix ミリ秒単位のレコードタイムスタンプです。 |
| `trace_id` | 文字列 | リクエストのレコードを相互に関連付けるために使用するトレース識別子です。 |
| `params` | オブジェクト | 操作固有の詳細です。内容は操作とレコードの段階によって異なります。 |

`params` 内では、`collection`、`expr`（フィルター式）、`input_params` など、操作に関連する詳細を確認します。1 つの操作に存在するフィールドが、別の操作には存在しない場合があります。

### 結果と実行時間のフィールド\{#result-and-execution-time-fields}

| フィールド | 解釈方法 |
| --- | --- |
| `result` | 操作の結果コードです。`0` は成功を示します。失敗したレスポンスには 0 以外のコードが含まれる場合があります。これは HTTP ステータスコードではありません。 |
| `status` | 記録された結果です（例: `Success`、`Failed`）。リクエストレコードでは、このフィールドが省略される場合があります。 |
| `params.execution_time` | 実行時間は、`3.568487ms` や `384.774µs` などの単位を含む文字列です。すべての値がミリ秒単位であると想定せず、単位を解析してください。 |

`result` または `status` が欠けていても、成功または失敗を証明するものではありません。結果を解釈する前に、対応するレスポンスレコードを特定してください。これらのフィールドは、監査ログに記録された結果を表します。エラーを調査する場合は、API レスポンスも確認してください。

たとえば、不完全なフィルター式を含む Query では、`result: 1100` と `status: Failed` が出力されました。その OTel の `event.outcome` 属性は `failure` でした。

### 接続および SDK のフィールド\{#connection-and-sdk-fields}

gRPC レコードには、次の接続メタデータも含まれる場合があります。これらのフィールドは、後述する REST の例には含まれていません。

| フィールド | 型 | 意味 |
| --- | --- | --- |
| `connection_uid` | 整数 | クライアント接続の識別子です。 |
| `params.sdk` | 文字列 | `Java` など、接続について記録された SDK 言語です。 |
| `params.sdk_version` | 文字列 | 接続について記録された SDK バージョンです。 |

### リクエストレコードとレスポンスレコード\{#request-and-response-records}

1 つの操作から、個別のリクエストレコードとレスポンスレコードが生成される場合があります。この JSON リクエストは操作と実行主体を識別しますが、結果はまだ含まれていません。対応するレスポンスは、後述する JSON の例に示されています。

```json
{
  "action": "ShowCollections",
  "cluster_id": "<cluster-id>",
  "database": "default",
  "interface": "Restful",
  "log_type": "AUDIT",
  "timestamp": 1793876926440,
  "trace_id": "<same-trace-id>",
  "user": "<database-user>"
}
```

`trace_id` は、一意のレコード ID としてではなく、リクエストとそのレスポンスを関連付けるために使用します。2 つのレコードは、同じリクエストの異なる段階を表します。`trace_id` のみで重複排除すると、一方が破棄されます。ECS では `trace.id` を使用し、OTel ではキーが `trace.id` の属性を使用します。

## 形式マッピング\{#format-mappings}

これらのマッピングを使用して、共通の監査フィールドを特定します。OTel 列では、`timeUnixNano` を除くすべての名前が `attributes` 配列のキーです。文字列属性では `value.stringValue` を使用します。

| フィールド | JSON | ECS | OTel |
| --- | --- | --- | --- |
| 時間 | `timestamp` — Unix ミリ秒 | `@timestamp` — UTC 日時 | `timeUnixNano` — 文字列としてのナノ秒 |
| 操作 | `action` | `event.action` | `event.action` |
| 呼び出し元 | `user` | `user.name` | `user.name` |
| クラスター | `cluster_id` | `zilliz.original.cluster_id` | `zilliz.cluster.id` |
| ログタイプ | `log_type` = `AUDIT` | `event.dataset` = `zilliz.milvus.audit` | `zilliz.log.type` = `AUDIT` |
| トレース | `trace_id` | `trace.id` | `trace.id` |
| 実行時間 | `params.execution_time` — 単位を含む文字列 | `event.duration` — 数値としてのナノ秒 | `event.duration` — `value.intValue` 内のナノ秒（文字列） |
| 結果 | `status`（例: `Success`） | `event.outcome`（例: `success`） | `event.outcome`（例: `success`） |

リクエストレコードでは、実行時間と結果が省略される場合があります。操作パラメーターと数値の `result` コードは元のレコードに残ります。マッピングされた結果は、HTTP ステータスコードではなく、記録された監査ステータスを表します。

## 例\{#examples}

これらの完全なレスポンスレコードは、実際の HTTPS 配信によるものです。それぞれ、別々のリクエストで実行された成功時の `ShowCollections` 操作を示しています。識別情報の値は置き換えられていますが、その他のフィールドと値は変更されていません。読みやすくするためにインデントが追加されています。

### JSON の例\{#json-example}

このレスポンスはリクエストの `trace_id` を共有し、記録された結果と実行時間を追加します。

```json
{
  "action": "ShowCollections",
  "cluster_id": "<cluster-id>",
  "database": "default",
  "interface": "Restful",
  "log_type": "AUDIT",
  "timestamp": 1793876926443,
  "trace_id": "<same-trace-id>",
  "user": "<database-user>",
  "params": {
    "execution_time": "3.568487ms"
  },
  "result": 0,
  "status": "Success"
}
```

### ECS の例\{#ecs-example}

このレスポンスは ECS バージョン `8.11.0` を宣言し、完全な監査レコードを `zilliz.original` に保持します。

```json
{
  "@timestamp": "2026-11-11T02:09:55.737Z",
  "ecs": {
    "version": "8.11.0"
  },
  "event": {
    "action": "ShowCollections",
    "category": [
      "database"
    ],
    "dataset": "zilliz.milvus.audit",
    "duration": 7963611,
    "kind": "event",
    "outcome": "success",
    "type": [
      "access"
    ]
  },
  "trace": {
    "id": "0000000000000000000000000000000a"
  },
  "user": {
    "name": "key-example"
  },
  "zilliz": {
    "original": {
      "action": "ShowCollections",
      "cluster_id": "in01-example",
      "database": "default",
      "interface": "Restful",
      "log_type": "AUDIT",
      "params": {
        "execution_time": "7.963611ms"
      },
      "result": 0,
      "status": "Success",
      "timestamp": 1794362995737,
      "trace_id": "0000000000000000000000000000000a",
      "user": "key-example"
    }
  }
}
```

### OTel の例\{#otel-example}

元の監査レコードは、`body.stringValue` 内のエスケープされた JSON 文字列です。各 NDJSON 行には、`resourceLogs` エンベロープなしで 1 件のログレコードが含まれます。

```json
{
  "timeUnixNano": "1794363609012000000",
  "body": {
    "stringValue": "{\"action\":\"ShowCollections\",\"cluster_id\":\"in01-example\",\"database\":\"default\",\"interface\":\"Restful\",\"log_type\":\"AUDIT\",\"params\":{\"execution_time\":\"3.3319ms\"},\"result\":0,\"status\":\"Success\",\"timestamp\":1794363609012,\"trace_id\":\"00000000000000000000000000000020\",\"user\":\"key-example\"}"
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
        "stringValue": "AUDIT"
      }
    },
    {
      "key": "user.name",
      "value": {
        "stringValue": "key-example"
      }
    },
    {
      "key": "event.action",
      "value": {
        "stringValue": "ShowCollections"
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
        "stringValue": "00000000000000000000000000000020"
      }
    },
    {
      "key": "event.duration",
      "value": {
        "intValue": "3331900"
      }
    }
  ]
}
```

`timeUnixNano` と `value.intValue` を読み取る際は、整数の精度を維持してください。たとえば、JavaScript ではナノ秒のタイムスタンプに `BigInt` を使用します。
