---
title: "スローログ リファレンス | BYOC"
slug: /slow-log-reference
sidebar_label: "スローログ リファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "遅いリクエストの所要時間、結果、実行コンテキストを確認するためのリファレンスです。JSON、Elastic Common スキーマ（ECS）、OpenTelemetry（OTel）出力について説明します。しきい値と送信先を設定するには、スローログの設定を参照してください。 | BYOC"
type: origin
token: QvqMw06F7iI6oKkXiD4cjV33nCd
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# スローログ リファレンス

このリファレンスでは、遅いリクエストの所要時間、結果、実行コンテキストを確認できます。**JSON**、Elastic Common スキーマ**（ECS）**、OpenTelemetry**（OTel）** 出力について説明します。しきい値と送信先を設定するには、[スローログの設定](./configure-slow-logs) を参照してください。

## ログ形式\{#log-formats}

HTTPS 転送では、3つの形式すべてで改行区切り JSON（NDJSON）を使用し、1 行に 1つのログエントリを記録します。各行を JSON オブジェクトとして解析し、選択した形式に従ってレコードを読み取ります。

| 形式 | ログフィールドの確認場所 |
| --- | --- |
| JSON | `params.execution_time` など、オブジェクトから直接フィールドを読み取ります。 |
| ECS | `event.duration` などの標準フィールドを読み取ります。元のレコード全体は `zilliz.original` にあるオブジェクトです。 |
| OTel | `timeUnixNano` と `attributes` を読み取ります。元のレコードにアクセスするには、`body.stringValue` を JSON として解析します。 |

## ログフィールド\{#log-fields}

以下の表では、元の JSON レコード内のフィールドについて説明します。ECS 出力では、これらのフィールドは `zilliz.original` の下に入れ子になっています。たとえば、`params.execution_time` は `zilliz.original.params.execution_time` になります。OTel 出力では、`body.stringValue` を JSON として解析して同じフィールドを読み取ります。

### 実行時間と結果\{#execution-time-and-result}

| フィールド | JSON の型 | 説明 |
| --- | --- | --- |
| `params.execution_time` | string | 記録された実行時間です（単位を含む）。この例では `1.802601ms` が記録されています。設定したしきい値と所要時間を比較する際は、同じ単位を使用してください。 |
| `status` | string | 人間が読み取れる形式のリクエストステータスです。この例は `Success` です。リクエストが成功していても、スローログの対象になる場合があります。 |
| `error_code` | 整数 | リクエスト結果コードです。この例の成功したリクエストでは `0` が記録されています。 |

### リクエストコンテキスト\{#request-context}

| フィールド | JSON の型 | 説明 |
| --- | --- | --- |
| `action` | string | `Search` などの操作名です。スローログの対象となる操作は、`Search`、`HybridSearch`、`Query` です。 |
| `timestamp` | 整数 | ログに記録されたリクエストの時刻を、ミリ秒単位の Unix タイムスタンプで示します。 |
| `cluster_id` | string | リクエストを処理したクラスターの識別子です。 |
| `database` | string | リクエストによってアクセスされたデータベースです。 |
| `log_type` | string | ログのカテゴリです。値は `SLOW` です。 |
| `user` | string | リクエストを発行した主体です。ユーザー名や API キー識別子などが該当します。 |
| `interface` | string | リクエストに使用されたインターフェースです。この例では REST API が使用され、`Restful` が記録されています。 |
| `ip` | string | リクエストに対して記録された送信元 IP アドレスです。 |
| `trace_id` | string | リクエストに関連付けられたトレース識別子です。相関分析やトラブルシューティングに役立ちます。 |

### 操作パラメーター\{#operation-parameters}

| フィールド | JSON の型 | 説明 |
| --- | --- | --- |
| `params.collection` | string | 検索対象のコレクション名です。 |
| `params.nq` | 整数 | クエリベクトルの数です。この例には 1つのベクトルが含まれています。 |
| `params.output_fields` | 文字列の配列 | レスポンスで要求されたエンティティフィールドです。これらはコレクションのフィールドであり、ログレコード用に選択されたフィールドではありません。 |
| `params.consistency_level` | 整数 | リクエストに対して記録された数値の整合性レベルです。この例では `2` が記録されています。 |
| `params.partition` | この例では null | リクエストに対して記録されたパーティション選択です。このリクエストではパーティションが指定されていないため、値は `null` です。 |

## 形式のマッピング\{#format-mappings}

これらのマッピングを使用して、各形式の共通フィールドを特定できます。OTel 列では、`timeUnixNano` を除くすべての名前が `attributes` 配列内のキーです。文字列属性は `value.stringValue` を使用します。

| フィールド | JSON | ECS | OTel |
| --- | --- | --- | --- |
| 時刻 | `timestamp` — ミリ秒 | `@timestamp` — UTC の日時 | `timeUnixNano` — 文字列として表されたナノ秒 |
| 所要時間 | `params.execution_time` — 単位を含む文字列 | `event.duration` — 数値として表されたナノ秒 | `event.duration` — `value.intValue` 内のナノ秒（文字列） |
| 操作 | `action` | `event.action` | `event.action` |
| 呼び出し元 | `user` | `user.name` | `user.name` |
| クラスター | `cluster_id` | `zilliz.original.cluster_id` | `zilliz.cluster.id` |
| ログタイプ | `log_type` = SLOW | `event.dataset` = `zilliz.milvus.slow` | `zilliz.log.type` = SLOW |
| 結果 | `status` = `Success` | `event.outcome` = `success` | `event.outcome` = `success` |
| クライアントアドレス | `ip` | `source.ip` | `source.address` |
| トレース | `trace_id` | `trace.id` | `trace.id` |

コレクションの詳細、リクエストパラメーター、エラーコードは元のレコードに残ります。上記のマッピングでは、これらは個別のフィールドに展開されません。ここに示す結果のマッピングは、成功したリクエストのものです。

## 例\{#examples}

以下の完全なレコードは、実際の HTTPS 配信から取得したものです。識別情報の値は置き換えられていますが、その他のフィールドと値は変更されていません。読みやすさのため、改行とインデントが追加されています。これらのスローログを収集するには、一時的な 1 ms のしきい値が使用されました。

### JSON の例\{#json-example}

この成功した Search リクエストは `1.802601ms` かかり、一時的な 1 ms のしきい値を超えています。

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

この Search レコードには、元の JSON がエスケープされた文字列として `body.stringValue` に格納されており、マッピングされた `attributes` も含まれています。各 NDJSON 行は個別のログレコードであり、`resourceLogs` エンベロープはありません。

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

`timeUnixNano` または `value.intValue` を読み取る際は、整数の精度を維持してください。たとえば、JavaScript でナノ秒のタイムスタンプを扱う場合は `BigInt` を使用します。
