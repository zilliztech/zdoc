---
title: "自動スケーリング | BYOC"
slug: /auto-scaling
sidebar_label: "自動スケーリング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "自動スケーリングは、設定した最小値と最大値の範囲内で Dedicated serving cluster を自動的に調整します。これにより、ワークロードの急増時にクエリ性能を保護し、トラフィックの減少時にはリソース使用量を削減できます。 | BYOC"
type: origin
token: I5qmw4fxDiBxBQksrNwcLHQpnTc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 自動スケーリング

自動スケーリングは、設定した最小値と最大値の範囲内で Dedicated serving cluster を自動的に調整します。これにより、ワークロードの急増時にクエリ性能を保護し、トラフィックの減少時にはリソース使用量を削減できます。

自動スケーリングは、AI エージェント、インタラクティブ検索アプリケーション、カスタマーサポートボット、マルチモーダル検索システムなど、トラフィックが予測しにくいワークロードに特に有効です。これらのワークロードは長時間アイドル状態のままである一方、突然検索リクエストが集中することがあります。

健全な範囲内で serving 使用率を維持するために、Zilliz Cloud はすべての生のメトリクスのスパイクに反応するのではなく、ターゲットトラッキングを使用します。システムは平滑化された監視シグナルを評価し、スケーリングジョブを作成する前に安全性チェックを適用します。

<Admonition type="info" icon="📘" title="Note">

Query CU の手動スケーリングは、すべてのプランでサポートされています。

replica の手動スケーリングは、Enterprise プラン以上でサポートされています。

自動スケーリングとスケジュールスケーリングは、Enterprise プラン以上でサポートされています。

</Admonition>

## 自動スケーリングの動作を理解する\{#understand-auto-scaling-behavior}

Zilliz Cloud は、単一の瞬間的なメトリクススパイクによって自動スケーリングをトリガーしません。システムは、スケーリングメトリクスが必要な期間にわたってしきい値を上回っているか下回っているかを評価し、頻繁なリソース変更を避けるためにスケーリングイベント間にクールダウンを適用します。

| スケーリング対象 | メトリクス | 目標値 | スケールアウト条件 | スケールイン条件 |
| --- | --- | --- | --- | --- |
| Query CU | Query CU Capacity、スケールイン時には CU Computation も確認 | Query CU Capacity: 70% | 10 分間 80% を超える、または即座に 100% に到達する | 30 分間 60% 未満であり、かつ対象の Query CU が現在の CU Computation を安全に処理できる |
| Replica | Query CU Computation | CU Computation: 50% | 2 分間 60% を超える | 10 分間 40% 未満 |

<Admonition type="info" icon="📘" title="Note">

この表の値はデフォルトの自動スケーリング設定であり、必要に応じて Zilliz Cloud によって調整される場合があります。ご不明な点がある場合は、[お問い合わせ](http://support.zilliz.com)ください。

</Admonition>

自動スケーリングでは、評価ウィンドウ内に十分な有効監視データが必要です。ウィンドウ内にデータがない場合、データが不十分な場合、または最近の設定変更後にリセットされた場合、Zilliz Cloud はスケーリング判断をスキップして監視を継続します。

したがって、メトリクスがしきい値を超えたからといって、常に即座にスケーリングがトリガーされるわけではありません。メトリクスは必要な期間にわたってしきい値を上回るか下回る必要があり、クールダウン期間が終了している必要があり、さらに評価ウィンドウに十分な有効監視データが含まれている必要があります。

## 目標サイズを計算する\{#calculate-the-target-size}

自動スケーリングがトリガーされると、Zilliz Cloud は目標構成を自動的に計算します。

- Query CU のスケールアウトでは、Zilliz Cloud は不要に大きな構成へ一気に移行しないよう、段階的にスケールする傾向があります。

- Query CU のスケールインでは、Zilliz Cloud は縮小前により慎重なチェックを適用します。システムは、対象の仕様で現在のデータとロード済みコンテンツを引き続き保持できること、および対象構成によって CU Computation が過度に高くならないことを確認します。スケールダウンによって過剰な計算負荷が発生する場合、スケールインアクションはスキップされ、cluster は監視を継続します。

- replica のスケールインでは、Zilliz Cloud はスケーリングアクションごとに replica を 1 つだけ削除するのではなく、計算された目標 replica 数まで直接スケールできます。これにより、一時的なトラフィックスパイクの後でも、cluster は想定されるサイズへより速く戻ることができます。

- 計算された目標が利用可能な仕様でない場合、または実際の構成変更にならない場合、スケーリングアクションはスキップされます。

スケーリングジョブが作成される前に、目標サイズは仕様マッピングと安全性チェックを通過する必要があります。

## スケーリングの振動を回避する\{#avoid-scaling-oscillation}

自動スケーリングは、応答性と安定性のバランスを取ります。スケールアウトは性能を保護するためにより敏感に動作し、スケールインは早すぎる縮小とその後の再スケールアウトを避けるため、より保守的に動作します。

| メカニズム | 目的 |
| --- | --- |
| Duration window | メトリクスが一定期間しきい値を上回る、または下回ることを要求します。 |
| スケールアウトとスケールインで別々のしきい値 | cluster が単一のしきい値付近で繰り返しスケーリングするのを防ぎます。 |
| スケーリングイベント間のクールダウン | 短期的なトラフィック変動による連続したスケーリングアクションを防ぎます。 |
| 目標サイズ計算 | メトリクスの負荷を実用的な目標構成にマッピングします。 |
| 安全性チェック | 目標構成が利用可能であり、現在のワークロードを安全に処理できることを保証します。 |

短時間のスパイクではスケールアウトはトリガーされません。短時間の低トラフィック期間ではスケールインはトリガーされません。この設計により振動が減少し、通常のトラフィック変動時にも cluster の安定性が保たれます。

## Query CU と replica の競合を処理する\{#handle-query-cu-and-replica-conflicts}

Zilliz Cloud は、同一のスケーリングアクションで Query CU と replica の両方の構成を変更しません。これにより、複数のリソース次元を同時に変更するリスクを低減します。

- 単一の変更リクエストでは、Query CU と replica を同時に変更できません。

- 両方の次元がスケーリング条件を満たす場合、Zilliz Cloud は優先度に基づいて処理します。

    - クエリ並列性の負荷が高い場合、Zilliz Cloud は通常 replica のスケーリングを優先します。

    - replica のスケールインが Query CU の調整と競合する場合、Zilliz Cloud は Query CU の調整を優先します。

    - 目標構成が利用できない場合、または変更がない場合、Zilliz Cloud はアクションをスキップします。

## スケーリング範囲を設定する\{#set-the-scaling-range}

自動スケーリングでは、Query CU または Replica の最小範囲と最大範囲が必要です。これらの範囲は、Zilliz Cloud が cluster の容量とクエリスループットをスケーリングできる境界を定義します。

| 設定 | 目的 | 推奨ガイダンス |
| --- | --- | --- |
| 最小 Query CU | 低トラフィック期間中にも維持されるベースライン容量を定義します。 | 管理タスク、バックグラウンドジョブ、ロード済みデータ、および想定される最小 serving ワークロードを処理できる値を使用してください。<br/>デフォルトでは、この値は現在の Query CU 値です。 |
| 最大 Query CU | 自動 Query CU スケールアップのコストと容量の上限を定義します。 | 想定されるデータ増加に十分な余裕を持たせつつ、暴走ワークロード、再帰的クエリのバグ、予期しないトラフィック急増から保護できる値を使用してください。<br/>デフォルトでは、この値は現在の Query CU 値の 4 倍です。 |
| 最小 Replica | 低トラフィック期間中のベースラインとなるクエリ serving 冗長性とスループットを定義します。 | アプリケーションに必要な最小可用性と QPS を維持できる値を使用してください。<br/>本番ワークロードでは、可用性目標に必要な最小 replica 数を下回る設定は避けてください。 |
| 最大 Replica | 自動 replica スケールアウトのコストとスループットの上限を定義します。 | 想定されるトラフィックピークを吸収できる一方、予期しないクエリスパイクによる制御不能なコスト増加を防げる値を使用してください。 |

<Admonition type="info" icon="📘" title="Note">

最大値は、運用上または予算上の上限を超えて設定しないでください。持続的なワークロード負荷によって必要になった場合、自動スケーリングは設定された最大値までスケールアップすることがあります。

</Admonition>

## 自動スケーリングを設定する\{#configure-auto-scaling}

自動スケーリングを有効にすると、Zilliz Cloud は関連メトリクスを継続的に評価し、設定された条件を満たしたときにスケーリングジョブを作成します。

### Web コンソールから\{#via-web-console}

- **query CU 自動スケーリングを設定する**

    <Supademo id="cmd2r7eqb34nbc4kj3wly357s?utm_source=link" title=""  />

    <Procedures>

    1. **Cluster Details** ページに移動します。

    1. **CU Settings** カードの **Scale** をクリックします。

    1. スケーリング方法として Auto-scaling を選択し、**minimum and maximum Query CU Sizes** を設定します。

    1. **Save** をクリックします。

    </Procedures>

- **replica 自動スケーリングを設定する**

    <Supademo id="cmk2agfmh01n4zk0iy6iu4vix" title=""  />

    <Procedures>

    1. **Cluster Details** ページに移動します。

    1. **Replica Settings** カードの **Scale** をクリックします。

    1. スケーリング方法として Auto-scaling を選択し、minimum および maximum replica を設定します。

    1. **Save** をクリックします。

    </Procedures>

### RESTful API から\{#via-restful-api}

RESTful API を使用すると、1 回の [Modify Cluster](/reference/restful/modify-cluster-v2) リクエストで Query CU と replica の両方の自動スケーリングを設定できます。

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

## スケーリングの進行状況を確認する\{#view-scaling-progress}

スケーリングイベントがトリガーされると、Zilliz Cloud はジョブレコードを生成します。進行状況は Jobs ページで確認できます。

<Procedures>

1. Zilliz Cloud コンソールで、対象プロジェクトに移動します。

1. **Jobs** に移動します。

1. 対象 cluster のスケーリングジョブを見つけます。

1. ジョブステータスを確認します。

</Procedures>

スケーリングジョブの進行中、cluster ステータスは `Modifying` になります。ジョブが成功すると、cluster ステータスは `Running` に戻ります。

<Admonition type="info" icon="📘" title="Note">

スケーリングジョブ中、Zilliz Cloud は引き続き以前の構成に基づいて cluster に課金します。新しい Query CU または replica 構成が課金に使用されるのは、スケーリングジョブが正常に完了した後のみです。これはスケールアップ操作とスケールダウン操作の両方に適用されます。

</Admonition>

## 自動スケーリングのトラブルシューティング\{#troubleshoot-auto-scaling}

| 観察された事象 | 考えられる理由 | 対応 |
| --- | --- | --- |
| メトリクスがしきい値を超えたが、スケーリングが開始されなかった。 | メトリクスが必要な期間にわたってしきい値を上回らなかった、クールダウンが有効である、または評価ウィンドウに十分なデータがない。 | 評価ウィンドウ全体にわたるメトリクストレンドを確認し、最近の設定変更を見直してください。 |
| トラフィックが減少したのに cluster がスケールダウンしなかった。 | スケールインでは、より長く保守的なウィンドウを使用している、または対象構成では現在のデータとロード済みコンテンツを安全に保持できない。 | Query CU Capacity、データ量、ロード済み collection、および collection または partition の上限を確認してください。 |
| 高トラフィック下で replica がスケールアウトしなかった。 | Query CU Computation のしきい値が継続しなかった、または別のスケーリングアクションの優先度が高かった可能性がある。 | 時系列で Query CU Computation を確認し、スケーリングジョブ履歴を見直してください。 |
| 自動スケーリングがアクションをスキップした。 | 目標仕様が利用不可だった、変更がなかった、または安全性チェックに失敗した。 | 最小値/最大値の範囲を調整するか、有効な cluster 構成を選択してください。 |

## 制限事項と考慮点\{#limits-and-considerations}

- 自動スケーリングは Dedicated serving cluster に適用されます。

- On-demand cluster は自動的にスケーリングされるため、自動スケーリング設定は不要です。

- replica スケーリングには、最小 4 CU の Query CU 構成が必要です。

- Query CU × replica には上限があります。詳細については、[Zilliz Cloud Limits](./limits#replicas) を参照してください。

- スケールダウンは、現在のデータ量と現在の collection および partition 数が対象仕様に収まる場合にのみ成功します。

- スケジュールスケーリングでは、30 分を超えるスケジュール間隔が必要です。

