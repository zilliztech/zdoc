---
title: "Access Logs の概要 | Cloud"
slug: /access-log-overview
sidebar_label: "Access Logs の概要"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "高ボリュームのワークロードでは、どのデータに最も頻繁にアクセスされているかを把握することが、index のチューニングや partition 戦略などの最適化判断において重要です。クエリパターンの可視性がなければ、これらの判断は推測に頼ることになります。 | Cloud"
type: origin
token: PIfLwbrMmiOZKAkqtpScjnhinXf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Access Logs の概要

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は Enterprise プラン以上、および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

高ボリュームのワークロードでは、どのデータに最も頻繁にアクセスされているかを把握することが、index のチューニングや partition 戦略などの最適化判断において重要です。クエリパターンの可視性がなければ、これらの判断は推測に頼ることになります。

Access Logs は、その可視性を提供します。Zilliz Cloud cluster で有効にすると、access log パイプラインがクエリ活動を収集し、構造化されたログファイルとしてお客様自身のオブジェクトストレージに配信します。その後、これらのログをデータウェアハウスに読み込み、entity ID ごとに集計することで、ホットデータ、低速なクエリ、利用傾向を特定できます。

<Admonition type="info" icon="📘" title="注意">

- このリリースでは、search または query クラスのアクションのみが記録されます: Search、HybridSearch、Query。完全なアクション一覧のサポートは、今後のリリースで予定されています。

- このリリースでは、audit log と access log は相互排他的です。一度に有効化できるのはどちらか一方のみです。

</Admonition>

## パイプラインの仕組み\{#how-the-pipeline-works}

access log パイプラインには 2 つのフェーズがあります。Zilliz Cloud 側での収集と、お客様側での分析です。

![TWlbbeheTo3aOnxE5t5cEYgcnbb](https://zdoc-images.s3.us-west-2.amazonaws.com/twlbbeheto3aonxe5t5ceygcnbb.png "TWlbbeheTo3aOnxE5t5cEYgcnbb")

### Zilliz Cloud によるログの収集と配信\{#zilliz-cloud-collects-and-delivers-logs}

cluster で Access Logs を有効にすると、Zilliz Cloud は proxy レイヤーでクエリ活動の取得を開始します。cluster レベルで次の 2 つの設定を構成します。

- **Sample rate**: どの割合のリクエストを記録するかを制御します。値の範囲は 0 から 100 で、ランダムにサンプリングされて access log に書き込まれるリクエストの割合を表します。たとえば、sample rate を 1 に設定すると、約 1% のリクエストで access log エントリが生成されます。高ボリュームのワークロードでは、sample rate を低くすることで、アクセスパターンの分析に十分なデータを維持しつつ、ログ保存コストを削減できます。

- **Output fields**: 各 access log エントリに含める追加のレスポンスフィールドを制御します。一般的なオプションは次のとおりです。

    - `params.result_pks`: クエリ結果で返された primary key ID のリストを記録します。これにより、後で entity ごとに集計してホットデータやアクセス頻度を特定できます。

    - `params.result_scores`: `params.result_pks` 内の各 ID に対応する類似度スコアを記録します。これにより、どの結果が高信頼な一致で、どの結果が境界的な一致だったかを把握できます。

ログは **JSON Lines** 形式（1 行に 1 つの JSON オブジェクト）で書き込まれ、セットアップ時に構成したオブジェクトストレージ bucket に自動的に配信されます。各ファイルは、予測可能なパス規則に従います。

```plaintext
/<Cluster ID>/<Log type>/<Date>/<HH:MM:SS>-<UUID>.log
```

例: `/inxx-xxxxxxxxxxxxxxx/access/2024-12-20/09:16:53-jz5l7D8Q.log`

パラメーターの詳細については、[Access Log リファレンス](./access-log-reference)を参照してください。

### お客様によるログの分析\{#you-analyze-the-logs}

ログはお客様自身の bucket に標準的な JSON Lines ファイルとして届くため、JSON を読み取れる任意のツールで処理できます。各ログエントリには、`action`、`cluster_id`、`timestamp`、`params.result_pks`（クエリ結果内の primary key のリスト）などの構造化フィールドが含まれています。

一般的な分析アプローチは次のとおりです。

1. JSON Lines ファイルをデータウェアハウスまたは分析ツールに読み込みます。

1. 各エントリから `action` フィールドと `params.result_pks` フィールドを解析します。

1. 一定の時間枠で primary key ごとに集計し、アクセス頻度を明らかにします。

その結果、データのヒートマップが得られます。どの entity が最も頻繁にクエリされているか、どのアクション経由か、そしてどの時間帯に行われているかを把握できます。

## 信頼性と課金\{#reliability-and-billing}

access log パイプラインは、1 つの中核原則に基づいて設計されています。ログ記録によってクエリ性能が低下することはありません。

### 非ブロッキング保証\{#non-blocking-guarantee}

access log の収集によって、ユーザーリクエストが遅延したりブロックされたりすることはありません。システムがクエリの完了とログエントリの書き込みのどちらを優先するか選ばなければならない場合、常にクエリが優先されます。

### グレースフルデグラデーション\{#graceful-degradation}

極端な高負荷時には、クエリスループットを維持するために、システムが access log エントリを破棄する場合があります。これは、access log が保証された完全な記録ではなく、クエリ活動のベストエフォートな記録を提供することを意味します。

## 次のステップ\{#whats-next}

- [Access Logs を構成する](./configure-access-logs): access log を有効化し、sampling rate と output params を調整するか、ログ記録を無効化します。

- [Access Log リファレンス](./access-log-reference): 完全なフィールドスキーマ、完全なアクション一覧、ファイルパス規則を確認できます。

