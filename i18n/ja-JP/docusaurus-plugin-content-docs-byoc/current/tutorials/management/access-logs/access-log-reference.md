---
title: "アクセスログリファレンス | BYOC"
slug: /access-log-reference
sidebar_label: "アクセスログリファレンス"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリファレンスでは、アクセスログの操作を特定し、その実行時間を確認し、結果を検査できます。JSON、Elastic Common スキーマ（ECS）、OpenTelemetry（OTel）の出力を扱います。転送を有効化してフィールドを選択する方法については、アクセスログの構成を参照してください。 | BYOC"
type: origin
token: XWjpwaGdTi3PM9kST46cU7mpnLg
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# アクセスログリファレンス

このリファレンスでは、アクセスログの操作を特定し、その実行時間を確認し、結果を検査できます。**JSON**、Elastic Common スキーマ **（ECS）**、OpenTelemetry **（OTel）** の出力を扱います。転送を有効化してフィールドを選択する方法については、[アクセスログの構成](./configure-access-logs) を参照してください。

## ログ形式\{#log-formats}

HTTPS 転送では、3つの形式はすべて改行区切りの JSON（NDJSON）を使用し、1 行に 1 つのログエントリが含まれます。各行を JSON オブジェクトとして解析し、選択した形式に従ってレコードを読み取ります。

| 形式 | ログフィールドの確認場所 |
| --- | --- |
| JSON | `params.execution_time` など、オブジェクトからフィールドを直接読み取ります。 |
| ECS | `event.duration` などの標準フィールドを読み取ります。元のレコード全体は `zilliz.original` にあるオブジェクトです。 |
| OTel | `timeUnixNano` と `attributes` を読み取ります。元のレコードにアクセスするには、`body.stringValue` を JSON として解析します。 |

`cluster_id`、`log_type`、`user` は常に含まれます。その他のフィールドは、**Output Fields** の選択内容と操作によって異なります。コレクションの詳細、実行時間、入力パラメーター、結果は `params` の下にネストされます。

## ログフィールド\{#log-fields}

以下の表では、元の JSON レコード内のフィールドについて説明します。ECS 出力では、これらのフィールドは `zilliz.original` の下にネストされます。たとえば、`params.execution_time` は `zilliz.original.params.execution_time` になります。OTel 出力では、同じフィールドを読み取るために `body.stringValue` を JSON として解析します。フィールドは、選択した Output Fields と操作によって異なります。たとえば、Query には類似度スコアがありません。

### 共通フィールド\{#common-fields}

| フィールド | JSON タイプ | 説明 |
| --- | --- | --- |
| `cluster_id` | string | リクエストを処理したクラスターの識別子です。 |
| `log_type` | string | ログカテゴリです。値は `ACCESS` です。 |
| `user` | string | リクエストを発行した ID（ユーザー名や API キー識別子など）です。 |
| `action` | string | 操作名です。アクセスログでは `Search`、`HybridSearch`、`Query` をサポートしており、Operations の選択内容によってログに記録される操作が決まります。 |
| `timestamp` | integer | ログに記録されたリクエストの時刻です。Unix タイムスタンプ（ミリ秒）で表されます。 |
| `params` | object | 操作固有のフィールドです。解析時は、以下に示すネストされたパスを使用します。 |

### リクエストと実行のフィールド\{#request-and-execution-fields}

| フィールド | JSON タイプ | 説明 |
| --- | --- | --- |
| `params.collection` | string | リクエストによってアクセスされたコレクションの名前です。 |
| `params.execution_time` | string | サーバー側の実行時間です。単位が含まれます。値の単位は `23.543546ms` や `973.39µs` など異なる場合があります。期間を比較する前に、共通の単位に変換してください。 |
| `params.expr` | この例では文字列 | フィルター式です。Search の例ではフィルターが指定されていないため空文字列で、Query の例では `primary_key in [1,2,3]` が記録されます。 |
| `params.nq` | integer | クエリベクトルの数です。Search の例には 1つのベクトルが含まれます。 |
| `params.limit` | integer | リクエストされた結果の最大数です。Query の例では `3` が記録されます。 |
| `params.input_params` | object | 追加のリクエストパラメーターです。Search の例には `anns_field`、`topk`、`offset` が含まれ、Query の例には `limit` が含まれます。このオブジェクト内の値は、数値設定を含め、文字列の場合があります。 |

### 結果フィールド\{#result-fields}

| フィールド | JSON タイプ | 説明 |
| --- | --- | --- |
| `params.result_num` | integer | 操作によって返された結果の数です。 |
| `params.result_pks` | array | 返されたエンティティのプライマリキーです。例では INT64 のプライマリキーを使用しているため、数値が含まれています。 |
| `params.result_scores` | array of numbers | 返された検索結果に対応するスコアです。このフィールドは Search の例に含まれ、Query の例には含まれていません。 |

### Query フィールドの相違点\{#query-field-differences}

この Query は 3つのプライマリキーでフィルタリングします。Search と異なり、ベクトル数や類似度スコアは含まれません。`params.limit` は数値ですが、`params.input_params.limit` は文字列です。この完全な JSON レコードは実際の HTTPS 配信から取得したもので、クラスターと呼び出し元の識別子は置き換えられています。

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

## 形式マッピング\{#format-mappings}

これらのマッピングを使用して、各形式の共通フィールドを特定します。OTel 列では、`timeUnixNano` を除くすべての名前が `attributes` 配列のキーです。文字列属性では `value.stringValue` を使用します。

| フィールド | JSON | ECS | OTel |
| --- | --- | --- | --- |
| 時刻 | `timestamp` — ミリ秒 | `@timestamp` — UTC の日時 | `timeUnixNano` — 文字列としてのナノ秒 |
| 実行時間 | `params.execution_time` — 単位付きの文字列 | `event.duration` — 数値としてのナノ秒 | `event.duration` — `value.intValue` 内のナノ秒（文字列） |
| 操作 | `action` | `event.action` | `event.action` |
| 呼び出し元 | `user` | `user.name` | `user.name` |
| クラスター | `cluster_id` | `zilliz.original.cluster_id` | `zilliz.cluster.id` |
| ログタイプ | `log_type` = ACCESS | `event.dataset` = `zilliz.milvus.access` | `zilliz.log.type` = ACCESS |

コレクションの詳細、リクエストパラメーター、結果は元のレコードに残り、上記のマッピングでは個々のフィールドに展開されません。アクセスログの例では出力フィールドの一部のみを選択しているため、ステータスやトレース情報は含まれていません。

## 例\{#examples}

以下の完全なレコードは実際の HTTPS 配信から取得したものです。ID の値は置き換えられていますが、その他のフィールドと値は変更されていません。可読性を高めるため、改行とインデントが追加されています。例では、4 次元ベクトルフィールドと INT64 プライマリキーを持つコレクションを使用します。

### JSON の例\{#json-example}

このリクエストは 1つのベクトルで検索し、3件の一致を返します。要求された結果数は `params.input_params.topk` 内の文字列 `"3"` で、`params.result_num` には実際の件数が数値 `3` として記録されます。

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

この Search レコードは ECS バージョン `8.11.0` を宣言します。標準フィールドは、`zilliz.original` にある完全なレコードとともに含まれます。

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

この Search レコードには、エスケープされた文字列としての元の JSON が `body.stringValue` に格納されており、マッピングされた `attributes` も含まれます。各 NDJSON 行は個別のログレコードであり、`resourceLogs` エンベロープはありません。

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

`timeUnixNano` または `value.intValue` を読み取る際は、整数の精度を維持してください。たとえば、JavaScript のナノ秒タイムスタンプには `BigInt` を使用します。
