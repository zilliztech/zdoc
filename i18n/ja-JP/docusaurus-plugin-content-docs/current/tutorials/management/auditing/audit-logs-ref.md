---
title: "VectorDB 監査ログ リファレンス | Cloud"
slug: /audit-logs-ref
sidebar_label: "VectorDB 監査ログ リファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリファレンスでは、データベース操作を実行したユーザーを特定し、記録された結果を確認し、監査レコードを関連付ける方法を説明します。JSON、Elastic Common スキーマ（ECS）、OpenTelemetry（OTel）の出力について扱います。設定手順については、VectorDB 監査ログを参照してください。 | Cloud"
type: origin
token: IrxCwX9Hoi2BYckqDdjcSN7ynkh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# VectorDB 監査ログ リファレンス

このリファレンスでは、データベース操作を実行したユーザーを特定し、記録された結果を確認し、監査レコードを関連付ける方法を説明します。**JSON**、Elastic Common スキーマ **（ECS）**、OpenTelemetry **（OTel）** の出力について扱います。設定手順については、[VectorDB 監査ログ](./audit-logs) を参照してください。

## ログ形式\{#log-formats}

HTTPS 転送では、各リクエストボディに改行区切り JSON（NDJSON）が含まれ、1 行につき監査レコード 1 件となります。各行を個別に解析し、選択した形式に従ってフィールドを読み取ります。

| 形式 | 監査フィールドの場所 |
| --- | --- |
| JSON | `action` や `params.execution_time` など、オブジェクトからフィールドを直接読み取ります。 |
| ECS | `event.action` や `event.duration` などの標準フィールドを使用します。元のレコード全体は、`zilliz.original` にあるオブジェクトです。 |
| OTel | `timeUnixNano` と `attributes` を使用します。元のレコードを読み取るには、`body.stringValue` を JSON として解析します。 |

## ログフィールド\{#log-fields}

フィールドテーブルでは、元の JSON レコード内のパスを使用します。ECS では、各パスの先頭に `zilliz.original` とドットを付けます。OTel では、`body.stringValue` を解析した後に読み取ります。フィールドは、操作、インターフェース、レコードの段階によって異なります。

### 共通フィールド\{#common-fields}

| フィールド | 型 | 意味 |
| --- | --- | --- |
| `action` | string | `ShowCollections` や `Query` などの操作名。 |
| `user` | string | 操作に関連付けられたデータベースユーザーまたは API キーの識別子。 |
| `cluster_id` | string | 操作が発生したクラスターの識別子。 |
| `database` | string | 操作に関連付けられたデータベース。 |
| `interface` | string | `Restful` や `Grpc` などのリクエストインターフェース。 |
| `log_type` | string | VectorDB 監査レコードの場合は `AUDIT`。 |
| `timestamp` | integer | Unix ミリ秒単位のレコードタイムスタンプ。 |
| `trace_id` | string | リクエストのレコードを関連付けるために使用するトレース識別子。 |
| `params` | object | 操作固有の詳細。内容は操作とレコードの段階によって異なります。 |

`params` 内で、`collection`、`expr`（フィルター式）、`input_params` など、操作に関連する詳細を探します。ある操作に存在するフィールドが、別の操作には存在しない場合があります。

### 結果と実行時間のフィールド\{#result-and-execution-time-fields}

| フィールド | 解釈方法 |
| --- | --- |
| `result` | 操作の結果コード。`0` は成功を示し、失敗したレスポンスには 0 以外のコードが含まれる場合があります。これは HTTP ステータスコードではありません。 |
| `status` | `Success` や `Failed` など、記録された結果。リクエストレコードではこのフィールドが省略される場合があります。 |
| `params.execution_time` | `3.568487ms` や `384.774µs` など、単位付きの文字列として表される実行時間。すべての値がミリ秒単位であると想定せず、単位を解析してください。 |

`result` または `status` がないだけでは、成功または失敗を証明できません。結果を解釈する前に、対応するレスポンスレコードを確認してください。これらのフィールドは監査ログに記録された結果を表すため、エラーを調査する際は API レスポンスも確認してください。

たとえば、不完全なフィルター式を含む Query では、`result: 1100` と `status: Failed` が記録されました。その OTel の `event.outcome` 属性は `failure` でした。

### 接続と SDK のフィールド\{#connection-and-sdk-fields}

gRPC レコードには、次の接続メタデータも含まれる場合があります。以下の REST の例にはこれらのフィールドはありません。

| フィールド | 型 | 意味 |
| --- | --- | --- |
| `connection_uid` | integer | クライアント接続の識別子。 |
| `params.sdk` | string | 接続について記録された SDK 言語（例: `Java`）。 |
| `params.sdk_version` | string | 接続について記録された SDK バージョン。 |

### リクエストレコードとレスポンスレコード\{#request-and-response-records}

1 つの操作で、リクエストレコードとレスポンスレコードが別々に生成される場合があります。この JSON リクエストは操作と実行者を識別しますが、まだ結果は含まれていません。対応するレスポンスは、後述の JSON 例に示されています。

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

`trace_id` は、一意のレコード ID としてではなく、リクエストとそのレスポンスを関連付けるために使用します。2 つのレコードは、同じリクエストの異なる段階を表します。`trace_id` だけで重複を排除すると、いずれかのレコードが失われます。ECS では `trace.id` を使用し、OTel ではキー `trace.id` を持つ属性を使用します。

## 形式マッピング\{#format-mappings}

これらのマッピングを使用して、一般的な監査フィールドを特定します。OTel 列では、`timeUnixNano` を除くすべての名前が `attributes` 配列のキーです。文字列属性では `value.stringValue` を使用します。

| フィールド | JSON | ECS | OTel |
| --- | --- | --- | --- |
| 時刻 | `timestamp` — Unix ミリ秒 | `@timestamp` — UTC の日時 | `timeUnixNano` — 文字列として表したナノ秒 |
| 操作 | `action` | `event.action` | `event.action` |
| 呼び出し元 | `user` | `user.name` | `user.name` |
| クラスター | `cluster_id` | `zilliz.original.cluster_id` | `zilliz.cluster.id` |
| ログタイプ | `log_type` = `AUDIT` | `event.dataset` = `zilliz.milvus.audit` | `zilliz.log.type` = `AUDIT` |
| トレース | `trace_id` | `trace.id` | `trace.id` |
| 実行時間 | `params.execution_time` — 単位付きの文字列 | `event.duration` — 数値として表したナノ秒 | `event.duration` — `value.intValue` 内のナノ秒（文字列） |
| 結果 | `status`（例: `Success`） | `event.outcome`（例: `success`） | `event.outcome`（例: `success`） |

リクエストレコードでは、実行時間と結果を省略できます。操作パラメーターと数値の `result` コードは、元のレコードに残ります。マッピングされた結果は、記録された監査ステータスを表し、HTTP ステータスコードではありません。

## 例\{#examples}

これらの完全なレスポンスレコードは、実際の HTTPS 配信から取得したものです。それぞれ、別々のリクエストで成功した `ShowCollections` 操作を示しています。ID 値は置き換えられていますが、その他のフィールドと値は変更されていません。読みやすいようにインデントを追加しています。

### JSON の例\{#json-example}

このレスポンスはリクエストの `trace_id` を共有し、記録された結果と実行時間を追加しています。

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

このレスポンスは ECS バージョン `8.11.0` を宣言し、監査レコード全体を `zilliz.original` に保持しています。

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

元の監査レコードは、`body.stringValue` 内のエスケープされた JSON 文字列です。各 NDJSON 行には `resourceLogs` エンベロープなしでログレコードが 1 つ含まれます。

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

`timeUnixNano` と `value.intValue` を読み取る際は、整数の精度を保持してください。たとえば、JavaScript ではナノ秒のタイムスタンプに `BigInt` を使用します。
