---
title: "アクセスログリファレンス | BYOC"
slug: /access-log-reference
sidebar_label: "アクセスログリファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "アクセスログは JSON Lines 形式で配信されます。1 行につき 1 つの JSON オブジェクトです。各行は、1 つの操作を表す自己完結型の JSON オブジェクトです。次の例は、Search 操作のログエントリを示しています | BYOC"
type: origin
token: TeLbw6guCimFLgkQWdmcZB2unMd
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# アクセスログリファレンス

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上、および BYOC デプロイでのみ利用できます。

</FeatureNote>

アクセスログは [JSON Lines](https://jsonlines.org/) 形式で配信されます。1 行につき 1 つの JSON オブジェクトです。各行は、1 つの操作を表す自己完結型の JSON オブジェクトです。次の例は、Search 操作のログエントリを示しています:

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

実際には、各エントリは `.log` ファイル内の 1 行を占めます。以下のセクションでは、各フィールドについて詳しく説明します。

## ログフィールドスキーマ\{#log-field-schema}

| **フィールド** | **必須** | **型** | **説明** | **例** |
| --- | --- | --- | --- | --- |
| `action` | はい | string | 操作名です。[サポートされている操作](./access-log-reference#supported-actions) を参照してください。 | `"Search"` |
| `cluster_id` | はい | string | クラスターの一意の識別子です。 | `"inxx-xxxxxxxxxxxxxxx"` |
| `database` | いいえ | string | 操作が発生したデータベースです。 | `"default"` |
| `date` | はい | string | タイムゾーン付きの人間が読みやすいタイムスタンプです。 | `"2026/04/14 06:31:16.827 +00:00"` |
| `interface` | はい | string | インターフェイスの種類（`Restful` または `Grpc`）です。 | `"Restful"` |
| `log_type` | はい | string | ログカテゴリ（`ACCESS`、`AUDIT`、または `SLOW`）です。 | `"ACCESS"` |
| `params` | はい | object | アクション固有のパラメーターです。ネストされたフィールドについては、[以下](./access-log-reference#params-fields) を参照してください。 | `--` |
| `result` | はい | int | 操作の結果コードです。`0` は成功を示し、0 以外の値はエラーを示します。 | `0` |
| `status` | はい | string | 操作の人間が読みやすいステータスです。 | `"Success"` |
| `timestamp` | はい | int | プロキシがリクエストを受信した時点の Unix タイムスタンプ（ミリ秒単位、13 桁）です。 | `1776148276827` |
| `trace_id` | はい | string | 操作の一意の ID です。同じリクエストに属する複数のログエントリを関連付けるために使用します。 | `"f89903d701329910380442aa86941be9"` |
| `user` | はい | string | リクエストを発行したユーザーまたは API キーです。 | `"key-ibchakktguxxrvvxseoasz"` |

### params フィールド\{#params-fields}

| **フィールド** | **必須** | **型** | **説明** | **例** |
| --- | --- | --- | --- | --- |
| `params.collection` | いいえ | string | 対象のコレクションです。Search、HybridSearch、Query アクションで必須です。 | `"ccc1"` |
| `params.consistency_level` | いいえ | int | 操作に使用される整合性レベルです。 | `2` |
| `params.execution_time` | いいえ | string | サーバー側の実行時間です。プロキシが完全なペイロードを受信した時点から、レスポンスの送信を開始する時点までを測定します。ネットワーク転送時間は含まれません。 | `"15.368706ms"` |
| `params.expr` | いいえ | string or array | リクエストで渡されるフィルター式です。HybridSearch の場合、これは式の配列です（サブリクエストごとに 1 つ）。 | `"" or [""]` |
| `params.input_params` | いいえ | object | 操作の入力パラメーター（検索パラメーター、offset、topk など）です。HybridSearch の場合、`sub_0.*` プレフィックス付きのサブリクエストパラメーターと `strategy` が含まれます。 | `{"topk": "10", "offset": "0"}` |
| `params.limit` | いいえ | int | 返す結果の数の上限です。Query および HybridSearch アクションに表示されます。 | `100` |
| `params.nq` | いいえ | int | クエリベクトルの数です。Search アクションに表示されます。 | `1` |
| `params.output_fields` | いいえ | array | クエリで要求された出力フィールドです。 | `["*"]` |
| `params.partition` | いいえ | string | 指定されている場合の対象パーティションです。パーティションが指定されていない場合は `null` です。 | `null` |
| `params.result_num` | いいえ | int | 操作によって返された実際の結果数です。 | `10` |
| `params.result_pks` | いいえ | array | クエリ結果内のプライマリキーです。これを含めるように出力パラメーターが構成されている場合、Search、HybridSearch、Query アクションに表示されます。 | `[55, 19, 18, 10]` |
| `params.result_scores` | いいえ | array | `params.result_pks` の各エントリに対応する類似度スコアです。Search および HybridSearch アクションに表示されます。 | `[0.87269604, 0.8639183]` |
| `params.topk` | いいえ | int | 検索リクエストの topk パラメーターです。Search および HybridSearch アクションに表示されます。 | `10` |

## サポートされている操作\{#supported-actions}

このリリースでは、検索またはクエリクラスのアクションのみがログに記録されます:

| アクション | 説明 |
| --- | --- |
| Search | ベクトル類似検索 |
| HybridSearch | リランキング付きのマルチベクトル検索 |
| Query | スカラーフィルタリングクエリ |

<Admonition type="info" title="Notes">

追加のアクションのサポートは、将来のリリースで計画されています。

</Admonition>

## ファイルパスと命名\{#file-path-and-naming}

ログファイルは、オブジェクトストレージバケット内に次のパス構造で整理されます:

```plaintext
/<Cluster ID>/<Log type>/<Date>/<File name><File name suffix>
```

| **コンポーネント** | **形式** | **例** |
| --- | --- | --- |
| クラスター ID | クラスターの一意の識別子 | `inxx-xxxxxxxxxxxxxxx` |
| ログタイプ | access、audit、または slow | `access` |
| 日付 | ISO 日付（YYYY-MM-DD） | `2024-12-20` |
| ファイル名 | HH:MM:SS-&lt;UUID&gt;。ここで HH:MM:SS は UTC 時刻で、&lt;UUID&gt; は一意性のためのランダムな文字列です。 | `09:16:53-jz5l7D8Q` |
| ファイル名のサフィックス | .log | `.log` |

完全なパスの例:

```plaintext
/inxx-xxxxxxxxxxxxxxx/access/2024-12-20/09:16:53-jz5l7D8Q.log
```

