---
title: "オートスケーリング | Cloud"
slug: /auto-scaling
sidebar_label: "オートスケーリング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "オートスケーリングは、設定した最小値と最大値の範囲内で Dedicated serving cluster を自動的に調整します。これにより、ワークロード急増時のクエリ性能を保護し、トラフィック減少時のリソース使用量を削減できます。 | Cloud"
type: origin
token: I5qmw4fxDiBxBQksrNwcLHQpnTc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# オートスケーリング

オートスケーリングは、設定した最小値と最大値の範囲内で Dedicated serving cluster を自動的に調整します。これにより、ワークロード急増時のクエリ性能を保護し、トラフィック減少時のリソース使用量を削減できます。

オートスケーリングは、AIエージェント、インタラクティブ検索アプリケーション、カスタマーサポートボット、マルチモーダル検索システムなど、トラフィックが予測しづらいワークロードに特に有効です。これらのワークロードは長時間アイドル状態が続いた後に、検索リクエストのバーストを引き起こすことがあります。

<Admonition type="info" icon="📘" title="Note">

Query CU の手動スケーリングはすべてのプランでサポートされています。

replica の手動スケーリングは Enterprise プラン以上でサポートされています。

オートスケーリングとスケジュールスケーリングは Enterprise プラン以上でサポートされています。

</Admonition>

## オートスケーリングの動作を理解する\{#understand-auto-scaling-behavior}

Zilliz Cloud は、単一の瞬間的なメトリクススパイクではオートスケーリングをトリガーしません。システムは、スケーリングメトリクスが一定時間しきい値を上回っているか下回っているかを評価し、頻繁なリソース変更を避けるためにスケーリングイベント間にクールダウンを適用します。

| スケーリング対象 | メトリクス | スケールアウト条件 | スケールイン条件 |
| --- | --- | --- | --- |
| Query CU | Query CU Capacity | 10 分間 80% を超える、または即座に 100% に到達する | 30 分間 60% 未満 |
| Replica | Query CU Computation | 2 分間 60% を超える | 10 分間 40% 未満 |

オートスケーリングには、評価ウィンドウ内に十分な有効な監視データが必要です。ウィンドウにデータがない場合、データが不十分な場合、または最近の設定変更後にリセットされた場合、Zilliz Cloud はスケーリング判断をスキップし、監視を継続します。

したがって、メトリクスがしきい値を超えたからといって、常に即座にスケーリングがトリガーされるわけではありません。メトリクスは必要な時間にわたってしきい値を上回るまたは下回る状態を維持する必要があり、クールダウン期間が終了していて、評価ウィンドウに十分な有効監視データが含まれている必要があります。

## ターゲットサイズを計算する\{#calculate-the-target-size}

オートスケーリングがトリガーされると、Zilliz Cloud はターゲット構成を自動的に計算します。

- Query CU のスケールアウトでは、Zilliz Cloud は不必要に大きな構成へ一気に移行しないよう、段階的にスケールする傾向があります。

- Query CU のスケールインでは、Zilliz Cloud はより保守的です。システムは、スケールダウン前にターゲット仕様が現在のデータとロード済みコンテンツを引き続き保持できることを検証します。

- replica のスケーリングでは、Zilliz Cloud は許可された最小値と最大値の範囲内で serving の並列性を調整します。

- 計算されたターゲットが利用可能な仕様でない場合、または実際の構成変更につながらない場合、スケーリングアクションはスキップされます。

スケーリングジョブが作成される前に、ターゲットサイズは仕様マッピングと安全性チェックを通過する必要があります。

## スケーリングの振動を避ける\{#avoid-scaling-oscillation}

オートスケーリングは応答性と安定性のバランスを取ります。スケールアウトは性能保護のためにより敏感に反応し、スケールインは早すぎるスケールダウン後の再スケールアウトを避けるためにより保守的です。

| メカニズム | 目的 |
| --- | --- |
| Duration window | 一定期間、メトリクスがしきい値を上回るまたは下回る状態を維持することを要求します。 |
| Separate scale-out and scale-in thresholds | cluster が単一のしきい値付近で繰り返しスケールするのを防ぎます。 |
| Cooldown between scaling events | 短期的なトラフィック変動による連続したスケーリングアクションを防ぎます。 |
| Target size calculation | メトリクスの負荷を実用的なターゲット構成にマッピングします。 |
| Safety checks | ターゲット構成が利用可能であり、現在のワークロードを安全に処理できることを保証します。 |

短時間のスパイクではスケールアウトはトリガーされません。短時間の低トラフィック期間ではスケールインはトリガーされません。この設計により振動が減少し、通常のトラフィック変動時にも cluster の安定性が保たれます。

## Query CU と replica の競合を処理する\{#handle-query-cu-and-replica-conflicts}

Zilliz Cloud は、同一のスケーリングアクションで query CU と replica の両方の設定を変更しません。これにより、複数のリソース次元を同時に変更するリスクを低減します。

- 単一の変更リクエストでは、Query CU と replica を同時に変更できません。

- 両方の次元がスケーリング条件を満たす場合、Zilliz Cloud は優先度に基づく処理を適用します。

    - クエリ並列性への負荷が高い場合、Zilliz Cloud は通常 replica のスケーリングを優先します。

    - replica のスケールインが Query CU 調整と競合する場合、Zilliz Cloud は Query CU 調整を優先します。

    - ターゲット構成が利用不可または変更なしの場合、Zilliz Cloud はそのアクションをスキップします。

## スケーリング範囲を設定する\{#set-the-scaling-range}

オートスケーリングでは、Query CU または Replica の最小値と最大値の範囲が必要です。これらの範囲は、Zilliz Cloud が cluster の容量とクエリスループットをスケーリングできる境界を定義します。

| 設定 | 目的 | 推奨ガイダンス |
| --- | --- | --- |
| Minimum Query CU | 低トラフィック時でも利用可能なベースライン容量を定義します。 | 管理タスク、バックグラウンドジョブ、ロード済みデータ、および想定される最小 serving ワークロードを処理できる値を使用してください。<br/>デフォルトでは、この値は現在の Query CU 値です。 |
| Maximum Query CU | Query CU 自動スケールアップのコストと容量の上限を定義します。 | 想定されるデータ増加に十分対応できる一方で、暴走するワークロード、再帰的クエリバグ、または予期しないトラフィック急増から保護できる値を使用してください。<br/>デフォルトでは、この値は現在の Query CU 値の 4 倍です。 |
| Minimum Replica | 低トラフィック時のベースラインとなるクエリ serving の冗長性とスループットを定義します。 | アプリケーションに必要な最小可用性と QPS を維持できる値を使用してください。<br/>本番ワークロードでは、可用性目標に必要な最小 replica 数を下回る値に設定しないでください。 |
| Maximum Replica | replica 自動スケールアウトのコストとスループットの上限を定義します。 | 想定されるトラフィックピークを吸収できる一方で、予期しないクエリスパイクによる制御不能なコスト増加を防げる値を使用してください。 |

<Admonition type="info" icon="📘" title="Note">

最大値は、運用上または予算上の上限を超えて設定しないでください。持続的なワークロード負荷によって必要とされた場合、オートスケーリングは設定した最大値までスケールアップする可能性があります。

</Admonition>

## オートスケーリングを設定する\{#configure-auto-scaling}

オートスケーリングを有効にすると、Zilliz Cloud は関連するメトリクスを継続的に評価し、設定した条件が満たされたときにスケーリングジョブを作成します。

### Web コンソール経由\{#via-web-console}

- **query CU オートスケーリングを設定する**

    <Supademo id="cmd2r7eqb34nbc4kj3wly357s?utm_source=link" title=""  />

    <Procedures>

    1. **Cluster Details** ページに移動します。

    1. **CU Settings** カードの **Scale** をクリックします。

    1. スケーリング方法として Auto-scaling を選択し、**minimum and maximum Query CU Sizes** を設定します。

    1. **Save** をクリックします。

    </Procedures>

- **replica オートスケーリングを設定する**

    <Supademo id="cmk2agfmh01n4zk0iy6iu4vix" title=""  />

    <Procedures>

    1. **Cluster Details** ページに移動します。

    1. **Replica Settings** カードの **Scale** をクリックします。

    1. スケーリング方法として Auto-scaling を選択し、minimum および maximum replica を設定します。

    1. **Save** をクリックします。

    </Procedures>

### RESTful API 経由\{#via-restful-api}

RESTful API を使用すると、1 回の [Modify Cluster](/reference/restful/modify-cluster-v2) リクエストで Query CU と replica の両方に対してオートスケーリングを設定できます。

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "autoscaling": {
        "cu": {
            "min": 1,
            "max": 2
        },
        "replica": {
            "min": 1,
            "max": 2
        }
    }
}'
```

## スケーリング進行状況を確認する\{#view-scaling-progress}

スケーリングイベントがトリガーされると、Zilliz Cloud はジョブレコードを生成します。進行状況は Jobs ページで確認できます。

<Procedures>

1. Zilliz Cloud コンソールで、対象プロジェクトに移動します。

1. **Jobs** に移動します。

1. 対象 cluster のスケーリングジョブを見つけます。

1. ジョブステータスを確認します。

</Procedures>

スケーリングジョブの実行中、cluster ステータスは `Modifying` になります。ジョブが成功すると、cluster ステータスは `Running` に戻ります。

<Admonition type="info" icon="📘" title="Note">

スケーリングジョブ中、Zilliz Cloud は引き続き以前の構成に基づいて cluster の課金を行います。新しい Query CU または replica 構成が課金に使用されるのは、スケーリングジョブが正常に完了した後のみです。これはスケールアップとスケールダウンの両方の操作に適用されます。

</Admonition>

## オートスケーリングのトラブルシューティング\{#troubleshoot-auto-scaling}

| 観察された状況 | 考えられる理由 | 対応 |
| --- | --- | --- |
| メトリクスがしきい値を超えたのに、スケーリングが開始されなかった。 | メトリクスが必要な時間しきい値を上回り続けなかった、クールダウンが有効になっている、または評価ウィンドウのデータが不十分である可能性があります。 | 評価ウィンドウ全体でメトリクストレンドを確認し、最近の設定変更を見直してください。 |
| トラフィックが減少したにもかかわらず、cluster がスケールダウンしなかった。 | スケールインではより長く保守的なウィンドウを使用しているか、ターゲット構成が現在のデータとロード済みコンテンツを安全に保持できない可能性があります。 | Query CU Capacity、データ量、ロード済み collection、および collection または partition の上限を確認してください。 |
| 高トラフィック下で replica がスケールアウトしなかった。 | Query CU Computation のしきい値が十分な時間維持されなかったか、別のスケーリングアクションの優先度が高い可能性があります。 | 時間経過に伴う Query CU Computation を確認し、スケーリングジョブ履歴を見直してください。 |
| オートスケーリングがアクションをスキップした。 | ターゲット仕様が利用不可、変更なし、または安全性チェックに失敗した可能性があります。 | 最小値/最大値の範囲を調整するか、有効な cluster 構成を選択してください。 |

## 制限事項と考慮事項\{#limits-and-considerations}

- オートスケーリングは Dedicated serving clusters に適用されます。

- オンデマンド cluster は自動的にスケールするため、オートスケーリング設定は不要です。

- replica スケーリングには、最小 4 CUs の Query CU 構成が必要です。

- Query CU × replica には上限があります。詳細は [Zilliz Cloud Limits](./limits#replicas) を参照してください。

- スケールダウンは、現在のデータ量および現在の collection 数と partition 数がターゲット仕様内に収まる場合にのみ成功します。

- スケジュールスケーリングでは、30 分を超えるスケジュール間隔が必要です。

