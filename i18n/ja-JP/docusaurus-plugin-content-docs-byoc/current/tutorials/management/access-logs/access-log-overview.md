---
title: "Access Logs の概要 | BYOC"
slug: /access-log-overview
sidebar_label: "Access Logs の概要"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "高ボリュームのワークロードでは、どのデータに最も頻繁にアクセスされているかを理解することが、インデックスチューニングやパーティション戦略などの最適化判断に不可欠です。クエリパターンの可視性がなければ、これらの判断は推測に頼ることになります。 | BYOC"
type: origin
token: PIfLwbrMmiOZKAkqtpScjnhinXf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Access Logs の概要

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

高ボリュームのワークロードでは、どのデータに最も頻繁にアクセスされているかを理解することが、インデックスチューニングやパーティション戦略などの最適化判断に不可欠です。クエリパターンの可視性がなければ、これらの判断は推測に頼ることになります。

Access Logs はその可視性を提供します。Zilliz Cloud クラスターで有効にすると、アクセスログパイプラインがクエリ活動を収集し、構造化されたログファイルとしてお客様自身のオブジェクトストレージに配信します。これらのログをデータウェアハウスにロードし、エンティティ ID ごとに集計することで、ホットデータ、遅いクエリ、利用傾向を特定できます。

<Admonition type="info" icon="📘" title="注">

- このリリースでは、Search、HybridSearch、Query のみ、つまり検索またはクエリクラスのアクションだけがログに記録されます。全アクションリストのサポートは今後のリリースで予定されています。

- このリリースでは監査ログとアクセスログは排他的であり、同時に有効化できるのはどちらか一方のみです。

</Admonition>

## パイプラインの仕組み\{#how-the-pipeline-works}

アクセスログパイプラインは 2 つのフェーズで構成されます。Zilliz Cloud 側での収集と、お客様側での分析です。

![TWlbbeheTo3aOnxE5t5cEYgcnbb](https://zdoc-images.s3.us-west-2.amazonaws.com/twlbbeheto3aonxe5t5ceygcnbb.png "TWlbbeheTo3aOnxE5t5cEYgcnbb")

### Zilliz Cloud によるログの収集と配信\{#zilliz-cloud-collects-and-delivers-logs}

クラスターで Access Logs を有効にすると、Zilliz Cloud はプロキシレイヤーでクエリ活動の収集を開始します。クラスター レベルで 2 つの設定を構成します。

- **サンプルレート**: どの割合のリクエストをログに記録するかを制御します。値の範囲は 0 ～ 100 で、ランダムにサンプリングされてアクセスログに書き込まれるリクエストの割合を表します。たとえば、サンプルレートを 1 に設定すると、約 1% のリクエストでアクセスログエントリが生成されます。高ボリュームのワークロードでは、サンプルレートを低くすることで、アクセスパターンを分析するのに十分なデータを維持しつつ、ログ保存コストを削減できます。

- **出力フィールド**: 各アクセスログエントリに含める追加のレスポンスフィールドを制御します。一般的なオプションは次のとおりです。

    - `params.result_pks`: クエリ結果で返された主キー ID のリストを記録します。これにより、後でエンティティごとに集計して、ホットデータやアクセス頻度を特定できます。

    - `params.result_scores`: `params.result_pks` 内の各 ID に対応する類似度スコアを記録し、どの結果が高信頼の一致で、どの結果が境界的な一致だったかを把握するのに役立ちます。

ログは **JSON Lines** 形式（1 行につき 1 つの JSON オブジェクト）で書き込まれ、セットアップ時に構成したオブジェクトストレージバケットに自動的に配信されます。各ファイルは予測可能なパス規則に従います。

```plaintext
/<Cluster ID>/<Log type>/<Date>/<HH:MM:SS>-<UUID>.log
```

例: `/inxx-xxxxxxxxxxxxxxx/access/2024-12-20/09:16:53-jz5l7D8Q.log`

パラメータの詳細については、[Access Log Reference](./access-log-reference) を参照してください。

### お客様によるログ分析\{#you-analyze-the-logs}

ログはお客様自身のバケットに標準的な JSON Lines ファイルとして配信されるため、JSON を読み取れる任意のツールで処理できます。各ログエントリには、`action`、`cluster_id`、`timestamp`、`params.result_pks`（クエリ結果内の主キーのリスト）などの構造化フィールドが含まれます。

一般的な分析アプローチは次のとおりです。

1. JSON Lines ファイルをデータウェアハウスまたは分析ツールにロードします。

1. 各エントリから `action` フィールドと `params.result_pks` フィールドを解析します。

1. 一定の時間ウィンドウにわたって主キーごとに集計し、アクセス頻度を可視化します。

その結果、どのエンティティが最も頻繁にクエリされているか、どのアクションを通じてか、どの時間帯かを示す、データのヒートマップが得られます。

## 信頼性と課金\{#reliability-and-billing}

アクセスログパイプラインは、ログ記録によってクエリ性能を決して低下させないという中核原則に基づいて設計されています。

### 非ブロッキング保証\{#non-blocking-guarantee}

アクセスログの収集によってユーザーリクエストが遅延したりブロックされたりすることはありません。システムがクエリの完了とログエントリの書き込みのどちらかを選ばなければならない場合、常にクエリが優先されます。

### グレースフルデグラデーション\{#graceful-degradation}

極端に高い負荷下では、クエリスループットを維持するために、システムがアクセスログエントリを破棄する場合があります。これは、アクセスログが完全な記録を保証するものではなく、クエリ活動のベストエフォートな記録を提供することを意味します。

## 次のステップ\{#whats-next}

- [Access Logs の設定](./configure-access-logs): アクセスログを有効化し、サンプリングレートと出力パラメータを調整するか、ログ記録を無効化します。

- [Access Log Reference](./access-log-reference): 完全なフィールドスキーマ、完全なアクションリスト、ファイルパス規則。

