---
title: "アクセスログリファレンス | Cloud"
slug: /access-log-reference
sidebar_label: "アクセスログリファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリファレンスでは、アクセスログの操作を特定し、実行時間を確認して、結果を調べる方法を説明します。JSON、Elastic Common スキーマ（ECS）、OpenTelemetry（OTel）の出力を扱います。転送を有効にしてフィールドを選択する方法については、アクセスログの構成を参照してください。 | Cloud"
type: origin
token: XWjpwaGdTi3PM9kST46cU7mpnLg
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# アクセスログリファレンス

このリファレンスでは、アクセスログの操作を特定し、実行時間を確認して、結果を調べる方法を説明します。**JSON**、Elastic Common スキーマ **（ECS）**、OpenTelemetry **（OTel）** の出力を扱います。転送を有効にしてフィールドを選択する方法については、[アクセスログの構成](./configure-access-logs) を参照してください。

## ログ形式\{#log-formats}

HTTPS 転送では、3つの形式はすべて改行区切り JSON（NDJSON）を使用し、1 行に 1 つのログエントリが含まれます。各行を JSON オブジェクトとして解析し、選択した形式に従ってレコードを読み取ります。

| 形式 | ログフィールドの参照先 |
| --- | --- |
| JSON | オブジェクトから直接フィールドを読み取ります。たとえば、`params.execution_time` です。 |
| ECS | `event.duration` などの標準フィールドを読み取ります。元のレコード全体は `zilliz.original` にあるオブジェクトです。 |
| OTel | `timeUnixNano` と `attributes` を読み取ります。元のレコードにアクセスするには、`body.stringValue` を JSON として解析します。 |

`cluster_id`、`log_type`、`user` は常に含まれます。その他のフィールドは、**Output Fields** の選択と操作によって異なります。コレクションの詳細、実行時間、入力パラメーター、結果は `params` の下にネストされます。

## ログフィールド\{#log-fields}

以下の表では、元の JSON レコード内のフィールドについて説明します。ECS 出力では、これらのフィールドは `zilliz.original` の下にネストされます。たとえば、`params.execution_time` は `zilliz.original.params.execution_time` になります。OTel 出力では、`body.stringValue` を JSON として解析して同じフィールドを読み取ります。フィールドは、選択した Output Fields と操作によって異なります。たとえば、Query には類似度スコアがありません。

### 共通フィールド\{#common-fields}

| フィールド | JSON 型 | 説明 |
| --- | --- | --- |
| `cluster_id` | string | リクエストを処理したクラスターの識別子です。 |
| `log_type` | string | ログカテゴリです。値は `ACCESS` です。 |
| `user` | string | リクエストを発行した識別情報です。たとえば、ユーザー名や API キー識別子です。 |
| `action` | string | 操作名です。アクセスログでは `Search`、`HybridSearch`、`Query` がサポートされています。Operations の選択内容によって、ログに記録される操作が決まります。 |
| `timestamp` | integer | ログに記録されたリクエストの時刻です。Unix タイムスタンプ（ミリ秒）で表されます。 |
| `params` | object | 操作固有のフィールドです。解析する際は、以下に示すネストされたパスを使用します。 |

### リクエストと実行のフィールド\{#request-and-execution-fields}

| フィールド | JSON 型 | 説明 |
| --- | --- | --- |
| `params.collection` | string | リクエストでアクセスしたコレクションの名前です。 |
| `params.execution_time` | string | 単位を含むサーバー側の実行時間です。値の単位は、`23.543546ms` や `973.39µs` など、異なる場合があります。期間を比較する前に、共通の単位に変換してください。 |
| `params.expr` | string（これらの例） | フィルター式です。Search の例ではフィルターが指定されていないため空文字列です。Query の例では `primary_key in [1,2,3]` が記録されています。 |
| `params.nq` | integer | クエリベクトルの数です。Search の例には 1 つのベクトルが含まれています。 |
| `params.limit` | integer | 要求された結果の最大数です。Query の例では `3` が記録されています。 |
| `params.input_params` | object | 追加のリクエストパラメーターです。Search の例には `anns_field`、`topk`、`offset` が含まれ、Query の例には `limit` が含まれています。このオブジェクト内の値は、数値設定を含め、文字列になる場合があります。 |

### 結果フィールド\{#result-fields}

| フィールド | JSON 型 | 説明 |
| --- | --- | --- |
| `params.result_num` | integer | 操作によって返された結果の数です。 |
| `params.result_pks` | array | 返されたエンティティのプライマリキーです。例では INT64 のプライマリキーを使用しているため、数値が含まれています。 |
| `params.result_scores` | array of numbers | 返された検索結果に対応するスコアです。このフィールドは Search の例に含まれ、Query の例には含まれていません。 |

### Query フィールドの相違点\{#query-field-differences}

この Query は 3 つのプライマリキーでフィルタリングします。Search と異なり、ベクトル数や類似度スコアはありません。`params.limit` は数値ですが、`params.input_params.limit` は文字列です。この完全な JSON レコードは実際の HTTPS 配信から取得したもので、クラスターと呼び出し元の識別子は置き換えられています。

```json
{
  "action": "Query",
  "cluster_id": "in01-example",
  "log_type": "ACCESS",
  "params": {
    "collection": "docs_log_sample_20261110",
    "execution_time": "2.39537ms",
    "expr": "primary_key in [1,2,3]",
    "input_params": {
      "limit": "3"
    },
    "limit": 3,
    "result_num": 3,
    "result_pks": [
      1,
      2,
      3
    ]
  },
  "timestamp": 1794300445287,
  "user": "key-example"
}
```

## 形式のマッピング\{#format-mappings}

各形式で共通フィールドを特定するには、これらのマッピングを使用します。OTel 列では、`timeUnixNano` を除くすべての名前が `attributes` 配列内のキーです。文字列属性では `value.stringValue` を使用します。

| フィールド | JSON | ECS | OTel |
| --- | --- | --- | --- |
| 時刻 | `timestamp` — ミリ秒 | `@timestamp` — UTC 日時 | `timeUnixNano` — 文字列としてのナノ秒 |
| 実行時間 | `params.execution_time` — 単位付きの文字列 | `event.duration` — 数値としてのナノ秒 | `event.duration` — `value.intValue` 内のナノ秒（文字列） |
| 操作 | `action` | `event.action` | `event.action` |
| 呼び出し元 | `user` | `user.name` | `user.name` |
| クラスター | `cluster_id` | `zilliz.original.cluster_id` | `zilliz.cluster.id` |
| ログタイプ | `log_type` = ACCESS | `event.dataset` = `zilliz.milvus.access` | `zilliz.log.type` = ACCESS |

コレクションの詳細、リクエストパラメーター、結果は元のレコードに残ります。上のマッピングでは、個々のフィールドに展開されません。Access の例では出力フィールドの一部のみを選択しているため、ステータスやトレース情報は含まれていません。

## 例\{#examples}

以下の完全なレコードは、実際の HTTPS 配信から取得したものです。識別情報の値は置き換えられていますが、その他のフィールドと値は変更されていません。読みやすさのため、改行とインデントを追加しています。例では、4 次元のベクトルフィールドと INT64 のプライマリキーを持つコレクションを使用しています。

### JSON の例\{#json-example}

このリクエストは 1 つのベクトルで検索し、3 件の一致結果を返します。要求された結果数は `params.input_params.topk` 内の文字列 `"3"` で、`params.result_num` には実際の件数が数値 `3` として記録されています。

```json
{
  "action": "Search",
  "cluster_id": "in01-example",
  "log_type": "ACCESS",
  "params": {
    "collection": "docs_log_sample_20261110",
    "execution_time": "23.543546ms",
    "expr": "",
    "input_params": {
      "anns_field": "vector",
      "offset": "0",
      "params": "{}",
      "round_decimal": "-1",
      "topk": "3"
    },
    "nq": 1,
    "result_num": 3,
    "result_pks": [
      10,
      11,
      9
    ],
    "result_scores": [
      1,
      0.9988664,
      0.9986361
    ]
  },
  "timestamp": 1794300429632,
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
    "dataset": "zilliz.milvus.access",
    "duration": 4868781,
    "kind": "event",
    "type": [
      "access"
    ]
  },
  "user": {
    "name": "key-example"
  },
  "zilliz": {
    "original": {
      "action": "Search",
      "cluster_id": "in01-example",
      "log_type": "ACCESS",
      "params": {
        "collection": "docs_log_sample_20261110",
        "execution_time": "4.868781ms",
        "expr": "",
        "input_params": {
          "anns_field": "vector",
          "offset": "0",
          "params": "{}",
          "round_decimal": "-1",
          "topk": "3"
        },
        "nq": 1,
        "result_num": 3,
        "result_pks": [
          10,
          11,
          9
        ],
        "result_scores": [
          1,
          0.9988664,
          0.9986361
        ]
      },
      "timestamp": 1794302605970,
      "user": "key-example"
    }
  }
}
```

### OTel の例\{#otel-example}

この Search レコードには、元の JSON が `body.stringValue` 内のエスケープされた文字列として、マッピングされた `attributes` とともに格納されています。各 NDJSON 行は、`resourceLogs` エンベロープを持たない個別のログレコードです。

```json
{
  "timeUnixNano": "1794302922141000000",
  "body": {
    "stringValue": "{\"action\":\"Search\",\"cluster_id\":\"in01-example\",\"log_type\":\"ACCESS\",\"params\":{\"collection\":\"docs_log_sample_20261110\",\"execution_time\":\"1.579877ms\",\"expr\":\"\",\"input_params\":{\"anns_field\":\"vector\",\"offset\":\"0\",\"params\":\"{}\",\"round_decimal\":\"-1\",\"topk\":\"3\"},\"nq\":1,\"result_num\":3,\"result_pks\":[10,11,9],\"result_scores\":[1,0.9988664,0.9986361]},\"timestamp\":1794302922141,\"user\":\"key-example\"}"
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
        "stringValue": "ACCESS"
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
        "stringValue": "Search"
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
