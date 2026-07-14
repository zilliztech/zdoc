---
title: "アクセスログ リファレンス | BYOC"
slug: /access-log-reference
sidebar_label: "アクセスログ リファレンス"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "アクセスログは JSON Lines 形式で配信されます。1 行につき 1 つの JSON オブジェクトです。各行は、単一の操作を表す自己完結型の JSON オブジェクトです。次の例は Search 操作のログエントリを示しています | BYOC"
type: origin
token: TeLbw6guCimFLgkQWdmcZB2unMd
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# アクセスログ リファレンス

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上および BYOC デプロイでのみ利用できます。

</FeatureNote>

アクセスログは [JSON Lines](https://jsonlines.org/) 形式で配信されます。1 行につき 1 つの JSON オブジェクトです。各行は、単一の操作を表す自己完結型の JSON オブジェクトです。次の例は Search 操作のログエントリを示しています。

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

実際には、各エントリは `.log` ファイル内で 1 行を占めます。以下のセクションでは、各フィールドについて詳しく説明します。

## ログフィールドスキーマ\{#log-field-schema}

| **Field** | **Required** | **Type** | **Description** | **Example** |
| --- | --- | --- | --- | --- |
| `action` | Yes | string | 操作名。[サポートされているアクション](./access-log-reference#supported-actions) を参照してください。 | `"Search"` |
| `cluster_id` | Yes | string | クラスターの一意識別子。 | `"inxx-xxxxxxxxxxxxxxx"` |
| `database` | No | string | 操作が実行されたデータベース。 | `"default"` |
| `date` | Yes | string | タイムゾーン付きの人間が判読可能なタイムスタンプ。 | `"2026/04/14 06:31:16.827 +00:00"` |
| `interface` | Yes | string | インターフェースの種類: `Restful` または `Grpc`。 | `"Restful"` |
| `log_type` | Yes | string | ログカテゴリ: `ACCESS`、`AUDIT`、または `SLOW`。 | `"ACCESS"` |
| `params` | Yes | object | アクション固有のパラメータ。ネストされたフィールドについては [以下](./access-log-reference#params-fields) を参照してください。 | `--` |
| `result` | Yes | int | 操作結果コード。`0` は成功を示し、0 以外の値はエラーを示します。 | `0` |
| `status` | Yes | string | 操作の人間が判読可能なステータス。 | `"Success"` |
| `timestamp` | Yes | int | プロキシがリクエストを受信した時点の Unix タイムスタンプ（ミリ秒、13 桁）。 | `1776148276827` |
| `trace_id` | Yes | string | 操作の一意 ID。同じリクエストに属する複数のログエントリを関連付けるために使用します。 | `"f89903d701329910380442aa86941be9"` |
| `user` | Yes | string | リクエストを発行したユーザーまたは API キー。 | `"key-ibchakktguxxrvvxseoasz"` |

### params フィールド\{#params-fields}

| **Field** | **Required** | **Type** | **Description** | **Example** |
| --- | --- | --- | --- | --- |
| `params.collection` | No | string | 対象のコレクション。Search、HybridSearch、Query アクションでは必須です。 | `"ccc1"` |
| `params.consistency_level` | No | int | 操作で使用された整合性レベル。 | `2` |
| `params.execution_time` | No | string | サーバー側の実行時間。プロキシが完全なペイロードを受信した時点からレスポンス送信を開始する時点までを測定します。ネットワーク転送時間は含みません。 | `"15.368706ms"` |
| `params.expr` | No | string or array | リクエストとともに渡されるフィルター式。HybridSearch の場合、これは式の配列です（サブリクエストごとに 1 つ）。 | `"" or [""]` |
| `params.input_params` | No | object | 操作の入力パラメータ（検索パラメータ、offset、topk など）。HybridSearch の場合、`sub_0.*` プレフィックス付きのサブリクエストパラメータと `strategy` が含まれます。 | `{"topk": "10", "offset": "0"}` |
| `params.limit` | No | int | 返される結果数の上限。Query および HybridSearch アクションで表示されます。 | `100` |
| `params.nq` | No | int | クエリベクトルの数。Search アクションで表示されます。 | `1` |
| `params.output_fields` | No | array | クエリで要求された出力フィールド。 | `["*"]` |
| `params.partition` | No | string | 指定されている場合の対象パーティション。パーティションが指定されていない場合は `null`。 | `null` |
| `params.result_num` | No | int | 操作によって実際に返された結果数。 | `10` |
| `params.result_pks` | No | array | クエリ結果内の主キー。出力パラメータがこれを含むよう設定されている場合、Search、HybridSearch、Query アクションで表示されます。 | `[55, 19, 18, 10]` |
| `params.result_scores` | No | array | `params.result_pks` 内の各エントリに対応する類似度スコア。Search および HybridSearch アクションで表示されます。 | `[0.87269604, 0.8639183]` |
| `params.topk` | No | int | 検索リクエストの topk パラメータ。Search および HybridSearch アクションで表示されます。 | `10` |

## サポートされているアクション\{#supported-actions}

このリリースでは、検索またはクエリ系のアクションのみがログに記録されます。

| Action | Description |
| --- | --- |
| Search | ベクトル類似検索 |
| HybridSearch | リランキング付きマルチベクトル検索 |
| Query | スカラーフィルタリングクエリ |

<Admonition type="info" icon="📘" title="注記">

追加のアクションのサポートは、今後のリリースで予定されています。

</Admonition>

## ファイルパスと命名\{#file-path-and-naming}

ログファイルは、次のパス構造でオブジェクトストレージバケット内に整理されます。

```plaintext
/<Cluster ID>/<Log type>/<Date>/<File name><File name suffix>
```

| **Component** | **Format** | **Example** |
| --- | --- | --- |
| Cluster ID | クラスターの一意識別子 | `inxx-xxxxxxxxxxxxxxx` |
| Log type | access、audit、または slow | `access` |
| Date | ISO 日付（YYYY-MM-DD） | `2024-12-20` |
| File name | HH:MM:SS-&lt;UUID&gt;。HH:MM:SS は UTC 時刻、&lt;UUID&gt; は一意性のためのランダム文字列 | `09:16:53-jz5l7D8Q` |
| File name suffix | .log | `.log` |

完全なパスの例:

```plaintext
/inxx-xxxxxxxxxxxxxxx/access/2024-12-20/09:16:53-jz5l7D8Q.log
```

