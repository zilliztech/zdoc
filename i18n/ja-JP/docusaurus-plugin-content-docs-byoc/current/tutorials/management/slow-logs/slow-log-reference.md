---
title: "スローログ リファレンス | BYOC"
slug: /slow-log-reference
sidebar_label: "スローログ リファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スローログは JSON Lines 形式で配信されます。1 行につき 1 つの JSON オブジェクトです。各行は単一の操作を表す自己完結型の JSON オブジェクトです。次の例は、search リクエストに対する代表的なスローログエントリを示しています | BYOC"
type: origin
token: Ke8ownBFFiAmZFkBnWec81qEn70
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# スローログ リファレンス

スローログは [JSON Lines](https://jsonlines.org/) 形式で配信されます。1 行につき 1 つの JSON オブジェクトです。各行は、単一の操作を表す自己完結型の JSON オブジェクトです。次の例は、search リクエストに対する代表的なスローログエントリを示しています。

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

実際には、各エントリは `.log` ファイル内で 1 行を占めます。以下のセクションでは、各フィールドについて詳しく説明します。

## ログフィールドスキーマ\{#log-field-schema}

| **Field** | **Required** | **Type** | **Description** | **Example** |
| --- | --- | --- | --- | --- |
| `action` | いいえ | string | `Query`、`Search`、`Hybrid Search` などの操作名。 | `"Search"` |
| `cluster_id` | はい | string | cluster の一意識別子です。このフィールドは下流のログパイプラインで必須です。 | `"inxx-xxxxxxxxxxxxxxx"` |
| `collection` | いいえ | string | アクションが collection スコープの場合の対象 collection。 | `"medium_articles"` |
| `connection_uid` | いいえ | string | リクエストに関連付けられた内部接続識別子。 | `"453798218345292801"` |
| `consistency_level` | いいえ | string | リクエストで使用された整合性レベル。 | `"Bounded"` |
| `database` | いいえ | string | 操作が発生した database。 | `"default"` |
| `error_code` | いいえ | int | リクエスト結果コード。通常、`0` は成功を示します。 | `0` |
| `execution_time` | いいえ | string | リクエストをスローログに出力するかどうかを判断するために使用される測定済み実行時間。 | `"231.4ms"` |
| `interface` | いいえ | string | リクエストインターフェース。通常は `Grpc` または `Restful`。 | `"Grpc"` |
| `ip` | いいえ | string | リクエストに対して記録されたクライアント IP アドレス。 | `"203.0.113.10"` |
| `log_type` | はい | string | ログカテゴリ。スローログエントリでは、値は `SLOW` です。 | `"SLOW"` |
| `output_fields` | いいえ | array | 該当する場合、query によって要求された出力フィールド。 | `["title", "author"]` |
| `partition` | いいえ | string or null | 対象 partition。partition が指定されていない場合、値は `null` です。 | `null` |
| `sdk` | いいえ | string | クライアント SDK 名。 | `"pymilvus"` |
| `sdk_version` | いいえ | string | クライアント SDK バージョン。 | `"2.6.0"` |
| `status` | いいえ | string | 人が読める形式のリクエストステータス。 | `"Success"` |
| `timestamp` | はい | int | ミリ秒単位の Unix タイムスタンプ。このフィールドは、最終的なファイルパスを生成する際にオブジェクトストレージシンクで必須です。 | `1776148276827` |
| `trace_id` | いいえ | string | 相関付けおよびトラブルシューティングのための一意のリクエストトレース識別子。 | `"f89903d701329910380442aa86941be9"` |
| `user` | はい | string | リクエストを発行したユーザー名または API key。このフィールドはパイプラインフィルターでも使用されます。 | `"key-ibchakktguxxrvvxseoasz"` |

## サポートされているアクション\{#supported-actions}

現在のスローログ機能では、デフォルトで次のアクションが有効になっています。

| Action | Description |
| --- | --- |
| Search | vector 類似度検索 |
| HybridSearch | 再ランキング付きのマルチ vector 検索 |
| Query | scalar フィルタリング query |

## ファイルパスと命名\{#file-path-and-naming}

スローログファイルは、オブジェクトストレージの `slow` ディレクトリ配下にアップロードされ、最終的なオブジェクトキーでは UTC の日付と時刻が使用されます。

```plaintext
/<Cluster ID>/slow/<Date>/<File name>.log
```

| **Component** | **Format** | **Example** |
| --- | --- | --- |
| Cluster ID | cluster の一意識別子。 | `inxx-xxxxxxxxxxxxxxx` |
| Log type directory | `slow` に固定。 | `slow` |
| Date | `YYYY-MM-DD` 形式の UTC 日付。 | `2026-04-14` |
| File name | UTC 時刻を使用した `HH:MM:SS-<UUID>.log`。 | `06:31:16-jz5l7D8Q.log` |

完全なパスの例:

```plaintext
/inxx-xxxxxxxxxxxxxxx/slow/2026-04-14/06:31:16-jz5l7D8Q.log
```
