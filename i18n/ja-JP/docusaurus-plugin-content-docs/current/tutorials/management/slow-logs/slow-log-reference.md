---
title: "スローログ リファレンス | Cloud"
slug: /slow-log-reference
sidebar_label: "スローログ リファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スローログは JSON Lines 形式で配信されます。1 行につき 1 つの JSON オブジェクトです。各行は単一の操作を表す自己完結型の JSON オブジェクトです。以下の例は、検索リクエストの代表的なスローログエントリを示しています | Cloud"
type: origin
token: Ke8ownBFFiAmZFkBnWec81qEn70
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# スローログ リファレンス

スローログは [JSON Lines](https://jsonlines.org/) 形式で配信されます。1 行につき 1 つの JSON オブジェクトです。各行は単一の操作を表す自己完結型の JSON オブジェクトです。以下の例は、検索リクエストの代表的なスローログエントリを示しています。

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
| `action` | No | string | `Query`、`Search`、`Hybrid Search` などの操作名です。 | `"Search"` |
| `cluster_id` | Yes | string | クラスターの一意識別子です。このフィールドはダウンストリームのログパイプラインで必須です。 | `"inxx-xxxxxxxxxxxxxxx"` |
| `collection` | No | string | アクションがコレクションスコープである場合の対象コレクションです。 | `"medium_articles"` |
| `connection_uid` | No | string | リクエストに関連付けられた内部接続識別子です。 | `"453798218345292801"` |
| `consistency_level` | No | string | リクエストで使用された整合性レベルです。 | `"Bounded"` |
| `database` | No | string | 操作が発生したデータベースです。 | `"default"` |
| `error_code` | No | int | リクエスト結果コードです。通常、`0` は成功を示します。 | `0` |
| `execution_time` | No | string | リクエストをスローログに出力すべきかどうかを判断するために使用される測定済み実行時間です。 | `"231.4ms"` |
| `interface` | No | string | リクエストインターフェースで、通常は `Grpc` または `Restful` です。 | `"Grpc"` |
| `ip` | No | string | リクエストについて記録されたクライアント IP アドレスです。 | `"203.0.113.10"` |
| `log_type` | Yes | string | ログカテゴリです。スローログエントリでは値は `SLOW` です。 | `"SLOW"` |
| `output_fields` | No | array | 該当する場合、クエリによって要求された出力フィールドです。 | `["title", "author"]` |
| `partition` | No | string or null | 対象パーティションです。パーティションが指定されていない場合、値は `null` です。 | `null` |
| `sdk` | No | string | クライアント SDK 名です。 | `"pymilvus"` |
| `sdk_version` | No | string | クライアント SDK バージョンです。 | `"2.6.0"` |
| `status` | No | string | 人が読める形式のリクエストステータスです。 | `"Success"` |
| `timestamp` | Yes | int | ミリ秒単位の Unix タイムスタンプです。このフィールドは、最終的なファイルパスを生成する際にオブジェクトストレージシンクで必須です。 | `1776148276827` |
| `trace_id` | No | string | 相関付けとトラブルシューティングのための一意のリクエストトレース識別子です。 | `"f89903d701329910380442aa86941be9"` |
| `user` | Yes | string | リクエストを発行したユーザー名または API キーです。このフィールドはパイプラインフィルターでも使用されます。 | `"key-ibchakktguxxrvvxseoasz"` |

## サポートされるアクション\{#supported-actions}

現在のスローログ機能では、デフォルトで次のアクションが有効になっています。

| Action | Description |
| --- | --- |
| Search | ベクトル類似度検索 |
| HybridSearch | 再ランキングを伴うマルチベクトル検索 |
| Query | スカラーフィルタリングクエリ |

## ファイルパスと命名\{#file-path-and-naming}

スローログファイルは、`slow` ディレクトリ配下のオブジェクトストレージにアップロードされ、最終的なオブジェクトキーでは UTC の日付と時刻が使用されます。

```plaintext
/<Cluster ID>/slow/<Date>/<File name>.log
```

| **Component** | **Format** | **Example** |
| --- | --- | --- |
| Cluster ID | クラスターの一意識別子です。 | `inxx-xxxxxxxxxxxxxxx` |
| Log type directory | `slow` に固定されます。 | `slow` |
| Date | `YYYY-MM-DD` 形式の UTC 日付です。 | `2026-04-14` |
| File name | UTC 時刻を使用する `HH:MM:SS-<UUID>.log`。 | `06:31:16-jz5l7D8Q.log` |

完全なパスの例:

```plaintext
/inxx-xxxxxxxxxxxxxxx/slow/2026-04-14/06:31:16-jz5l7D8Q.log
```
