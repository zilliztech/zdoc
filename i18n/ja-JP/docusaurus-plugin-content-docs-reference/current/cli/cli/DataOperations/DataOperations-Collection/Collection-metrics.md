---
title: "metrics | Cloud"
slug: /cli/cli/Collection-metrics
sidebar_label: "metrics"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたメトリック名について、要求された時間範囲にわたるコレクションごとのメトリクス（QPS、レイテンシ、VPS、失敗率、エンティティ数）を取得します。デフォルトでは、結果はインラインの点字チャートとして表示されます。ピボットテーブルを表示するには `-o table` を、未加工データを表示するには `-o json` / `-o yaml` / `-o csv` / `--query` を指定してください。 | Cloud"
type: docx
token: X1rVdVsuHogCohx1CX3cZFaQn1e
sidebar_position: 11
keywords: 
  - ベクトル類似検索
  - 近似最近傍探索
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - cloud
  - metrics
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# metrics

この操作は、指定されたメトリック名について、要求された時間範囲にわたるコレクションごとのメトリクス（QPS、レイテンシ、VPS、失敗率、エンティティ数）を取得します。デフォルトでは、結果はインラインの点字チャートとして表示されます。ピボットテーブルを表示するには `-o table` を、未加工データを表示するには `-o json` / `-o yaml` / `-o csv` / `--query` を指定してください。

## Synopsis\{#synopsis}

```bash
zilliz collection metrics
[--cluster-id <string>]
--collection-name <string>
--metric <string>...
[--period <string>]
[--start <iso8601>]
[--end <iso8601>]
[--granularity <string>]
```

## オプション\{#options}

- **--cluster-id** (*string*) -

    クラスター ID を示します。省略した場合は、アクティブなコンテキストのクラスターが使用されます。

- **--collection-name, -c** (*string*) -

    **[REQUIRED]**

    メトリクスを取得するコレクション名を指定します。

- **--metric, -m** (*string*) -

    **[REQUIRED]**

    メトリック名を指定します。繰り返し指定可能です。有効なコレクションスコープのメトリクスは次のとおりです: `SEARCH_QPS`, `QUERY_QPS`, `INSERT_QPS`, `UPSERT_QPS`, `DELETE_QPS`, `BULK_INSERT_QPS`, `HYBRID_SEARCH_QPS`, `SEARCH_LATENCY_AVG`, `SEARCH_LATENCY_P99`, `QUERY_LATENCY_AVG`, `QUERY_LATENCY_P99`, `INSERT_LATENCY_AVG`, `INSERT_LATENCY_P99`, `UPSERT_LATENCY_AVG`, `UPSERT_LATENCY_P99`, `DELETE_LATENCY_AVG`, `DELETE_LATENCY_P99`, `HYBRID_SEARCH_LATENCY_AVG`, `HYBRID_SEARCH_LATENCY_P99`, `SEARCH_VPS`, `INSERT_VPS`, `UPSERT_VPS`, `DELETE_VPS`, `BULK_INSERT_VPS`, `SEARCH_FAIL_RATE`, `QUERY_FAIL_RATE`, `INSERT_FAIL_RATE`, `UPSERT_FAIL_RATE`, `DELETE_FAIL_RATE`, `HYBRID_SEARCH_FAIL_RATE`, `BULK_INSERT_FAIL_RATE`, `ENTITIES`, `ENTITIES_LOADED`, `ENTITIES_INDEXED`.

- **--period** (*string*) -

    遡って参照する時間範囲を示します。使用可能な値: `10m`, `1h`, `6h`, `24h`, `3d`, `7d`。デフォルト: `1h`。`--start` / `--end` とは相互排他的です。

- **--start** (*string*) -

    ISO 8601 形式の開始タイムスタンプを示します（例: `2026-04-01T00:00:00Z`）。明示的な範囲を指定する場合は、`--period` の代わりに `--end` と一緒に使用します。

- **--end** (*string*) -

    ISO 8601 形式の終了タイムスタンプを示します。`--start` と組み合わせて使用します。

- **--granularity, -g** (*string*) -

    データポイントの間隔を示します。使用可能な値: `1m`, `5m`, `1h`, `1d`。デフォルトでは、`--period` に基づいて適切な値が設定されます。

## 例\{#example}

```bash
# 過去 1 時間の insert + search QPS のインラインチャート
zilliz collection metrics -c my_collection -m INSERT_QPS -m SEARCH_QPS

# 過去 24 時間のレイテンシのピボットテーブル（5 分単位の粒度）
zilliz collection metrics -c my_collection -m SEARCH_LATENCY_P99 -m QUERY_LATENCY_P99 --period 24h -g 5m -o table

# ダウンストリームツール向けの未加工 JSON
zilliz collection metrics -c my_collection -m ENTITIES -o json
```
