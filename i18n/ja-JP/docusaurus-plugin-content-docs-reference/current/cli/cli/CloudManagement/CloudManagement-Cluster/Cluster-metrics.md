---
title: "metrics | Cloud"
slug: /cli/cli/Cluster-metrics
sidebar_label: "metrics"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はクラスターのパフォーマンスメトリクス（QPS、レイテンシ、ストレージなど）を照会します。 | Cloud"
type: docx
token: BVHRdq4miotjdVxI72fcI7XznKc
sidebar_position: 5
keywords: 
  - オープンソース vector database
  - オープンソース vector db
  - vector database の例
  - rag vector database
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

この操作はクラスターのパフォーマンスメトリクス（QPS、レイテンシ、ストレージなど）を照会します。

## Description\{#description}

Zilliz Cloud では、メトリクスは次のレベルに整理されています。

- **組織レベルのメトリクス**: すべてのプロジェクトにわたる、アカウント全体の状態（例: ライセンスクレジット、使用状況）を反映します。

- **クラスターレベルのメトリクス**: 個々のクラスター内のリソース使用状況、パフォーマンス、およびデータを反映します。

- **コレクションレベルのメトリクス**: コレクションごとに分類されたクラスターメトリクスのサブセットで、個々のコレクションのパフォーマンス問題の特定や容量計画に役立ちます。

このコマンドをオプションなしで実行すると、コマンドを設定するための対話型プロンプトが表示されます。

## Synopsis\{#synopsis}

```bash
zilliz cluster metrics
--cluster-id <value>
--metric <value>
[--period <value>]
[--start <value>]
[--end <value>]
[--granularity <value>]
[--output <value>]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    クラスター ID を指定します。例: `in01-xxxxxxxxxxxx`。

    `zilliz context set` を使用してクラスターが設定されている場合、このオプションを設定しなくても自動的に適用されます。

- **--metric, -m** (*array*) -

    **[REQUIRED]**

    メトリクス名を指定します。このオプションを複数回指定することで、複数のメトリクス名を設定できます。

    リソースメトリクス:

    - `CU_COMPUTATION`

    - `CU_CAPACITY`

    - `CU_SIZE`

    - `REPLICA_COUNT`

    - `STORAGE`

    QPS メトリクス:

    - `SEARCH_QPS`

    - `QUERY_QPS`

    - `INSERT_QPS`

    - `UPSERT_QPS`

    - `DELETE_QPS`

    - `BULK_INSERT_QPS`

    レイテンシメトリクス:

    - `SEARCH_LATENCY_AVG`

    - `SEARCH_LATENCY_P99`

    - `QUERY_LATENCY_AVG`

    - `QUERY_LATENCY_P99`

    - `INSERT_LATENCY_AVG`

    - `INSERT_LATENCY_P99`

    - `UPSERT_LATENCY_AVG`

    - `UPSERT_LATENCY_P99`

    - `DELETE_LATENCY_AVG`

    - `DELETE_LATENCY_P99`

    VPS メトリクス:

    - `SEARCH_VPS`

    - `INSERT_VPS`

    - `UPSERT_VPS`

    - `DELETE_VPS`

    - `BULK_INSERT_VPS`

    失敗率メトリクス:

    - `SEARCH_FAIL_RATE`

    - `QUERY_FAIL_RATE`

    - `INSERT_FAIL_RATE`

    - `UPSERT_FAIL_RATE`

    - `DELTE_FAIL_RATE`

    - `BULK_INSERT_FAIL_RATE`

    データメトリクス:

    - `ENTITIES`

    - `ENTITIES_LOADED`

    - `ENTITIES_INDEXED`

    - `COLLECTIONS`

    - `SLOW_QURIES`

    Serverless メトリクス:

    - `READ_VCU`

    - `WRITE_VCU`

- **--period** (*string*) -

    現在時刻からの相対的な期間を指定します。 

    日には `d`、月には `m` を使用します。デフォルト値は `1h` で、次の 1 時間以内に収集された統計を示します。

- **--start** (*string*) -

    時間範囲の開始時刻を指定します。例: `2026-03-01` または `2026-03-01T10:00:00Z`。

- **--end** (*string*) -

    時間範囲の終了時刻を指定します。例: `2026-03-15` または `2026-03-15T18:00:00Z`。

- **--granularity, -g** (*string*) -

    データポイントの間隔を指定します。例: `30s`、`5m`、`1h`。このオプションのデフォルト値は `auto` です。

- **--output, -o** (*string*) -

    出力形式を指定します。このオプションを省略すると、結果はターミナル内の点字チャート可視化として表示されます（v1.3.1 以降）。明示的に指定できる値:

    - `json`,

    - `table`,

    - `text`.

## Example\{#example}

```bash
zilliz cluster metrics -m READ_VCU -m WRITE_VCU
```
