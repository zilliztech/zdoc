---
title: "Auto-scaling | Cloud"
slug: /auto-scaling
sidebar_label: "Auto-scaling"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Auto-scaling は、設定した最小値と最大値の範囲内で Dedicated serving cluster を自動的に調整します。これにより、ワークロードの急増時にクエリ性能を保護し、トラフィックが減少した際にはリソース使用量を削減できます。 | Cloud"
type: origin
token: I5qmw4fxDiBxBQksrNwcLHQpnTc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Auto-scaling

Auto-scaling は、設定した最小値と最大値の範囲内で Dedicated serving cluster を自動的に調整します。これにより、ワークロードの急増時にクエリ性能を保護し、トラフィックが減少した際にはリソース使用量を削減できます。

Auto-scaling は、AI エージェント、対話型検索アプリケーション、カスタマーサポートボット、マルチモーダル検索システムなど、トラフィックが予測しにくいワークロードに最も有効です。これらのワークロードは長時間アイドル状態が続いた後、検索リクエストが突発的に急増することがあります。

健全な範囲内に serving utilization を保つため、Zilliz Cloud はあらゆる生のメトリクスの急上昇に反応するのではなく、ターゲットトラッキングを使用します。システムは平滑化された監視シグナルを評価し、スケーリングジョブを作成する前に安全性チェックを適用します。

<Admonition type="info" icon="📘" title="Note">

Query CU の手動スケーリングはすべてのプランでサポートされています。

replica の手動スケーリングは Enterprise プラン以上でサポートされています。

Auto-scaling と scheduled scaling は Enterprise プラン以上でサポートされています。

</Admonition>

## Auto-scaling の動作を理解する\{#understand-auto-scaling-behavior}

Zilliz Cloud は、単一の瞬間的なメトリクス急上昇だけでは Auto-scaling をトリガーしません。システムは、スケーリングメトリクスが一定時間しきい値を上回るか下回るかを評価し、頻繁なリソース変更を避けるためにスケーリングイベント間にクールダウンを適用します。

| Scaling target | Metric | Target value | Scale-out condition | Scale-in condition |
| --- | --- | --- | --- | --- |
| Query CU | Query CU Capacity、scale-in 中は CU Computation も確認 | Query CU Capacity: 70% | 10 分間 80% を超える、または即座に 100% に達する | 30 分間 60% 未満であり、かつ対象の Query CU が現在の CU Computation を安全に処理できる |
| Replica | Query CU Computation | CU Computation: 50% | 2 分間 60% を超える | 10 分間 40% 未満 |

<Admonition type="info" icon="📘" title="Note">

この表の値はデフォルトの Auto-scaling 設定であり、必要に応じて Zilliz Cloud により調整される場合があります。ご不明な点がある場合は、[お問い合わせ](http://support.zilliz.com)ください。

</Admonition>

Auto-scaling には、評価ウィンドウ内に十分な有効な監視データが必要です。ウィンドウにデータがない場合、データが不十分な場合、または最近の設定変更後にリセットされた場合、Zilliz Cloud はスケーリング判断をスキップして監視を継続します。

したがって、メトリクスがしきい値を超えたからといって、必ずしも直ちにスケーリングが開始されるわけではありません。メトリクスが必要な時間だけしきい値を上回るか下回る状態を維持し、クールダウン期間が終了し、かつ評価ウィンドウに十分な有効な監視データが含まれている必要があります。

## ターゲットサイズを計算する\{#calculate-the-target-size}

Auto-scaling がトリガーされると、Zilliz Cloud はターゲット構成を自動的に計算します。

- Query CU の scale-out では、不要に大きな構成へ一気に移行するのを避けるため、Zilliz Cloud は段階的にスケールする傾向があります。

- Query CU の scale-in では、スケールダウン前により保守的なチェックを適用します。システムは、ターゲット仕様が現在のデータとロード済みコンテンツを引き続き保持できること、またターゲット構成によって CU Computation が過度に高くならないことを確認します。スケールダウンによって過剰な計算負荷が発生する場合、scale-in アクションはスキップされ、cluster は監視を継続します。

- replica の scale-in では、Zilliz Cloud はスケーリングアクションごとに replica を 1 つだけ削除するのではなく、計算されたターゲット replica 数へ直接スケールできます。これにより、一時的なトラフィック急増後に cluster が期待されるサイズへより速く戻れるようになります。

- 計算されたターゲットが利用可能な仕様でない場合、または実際の構成変更にならない場合、スケーリングアクションはスキップされます。

ターゲットサイズは、スケーリングジョブが作成される前に、仕様マッピングと安全性チェックを通過する必要があります。

## スケーリングの揺れを回避する\{#avoid-scaling-oscillation}

Auto-scaling は応答性と安定性のバランスを取ります。scale-out は性能保護のためにより敏感に動作し、scale-in は早すぎるスケールダウンの後に再び scale-out する事態を避けるため、より保守的に動作します。

| Mechanism | Purpose |
| --- | --- |
| Duration window | メトリクスが一定期間しきい値を上回るか下回る状態を維持することを要求します。 |
| Separate scale-out and scale-in thresholds | cluster が単一のしきい値付近で繰り返しスケーリングするのを防ぎます。 |
| Cooldown between scaling events | 短期的なトラフィック変化による連続したスケーリングアクションを防ぎます。 |
| Target size calculation | メトリクスの負荷を実用的なターゲット構成にマッピングします。 |
| Safety checks | ターゲット構成が利用可能で、現在のワークロードを安全に処理できることを保証します。 |

短時間の急増では scale-out はトリガーされません。短時間の低トラフィック期間では scale-in はトリガーされません。この設計により、揺れを減らし、通常のトラフィック変動時にも cluster を安定した状態に保ちます。

## query CU と replica の競合を処理する\{#handle-query-cu-and-replica-conflicts}

Zilliz Cloud は、同一のスケーリングアクションで Query CU と replica の両方の構成を変更しません。これにより、複数のリソース次元を同時に変更するリスクを減らします。

- 単一の modify リクエストで Query CU と replica を同時に変更することはできません。

- 両方の次元がスケーリング条件を満たした場合、Zilliz Cloud は優先順位に基づいて処理します。

    - クエリ並列性の負荷が高い場合、Zilliz Cloud は通常 replica のスケーリングを優先します。

    - replica の scale-in が Query CU 調整と競合する場合、Zilliz Cloud は Query CU 調整を優先します。

    - ターゲット構成が利用できない、または変更がない場合、Zilliz Cloud はアクションをスキップします。

## スケーリング範囲を設定する\{#set-the-scaling-range}

Auto-scaling には、Query CU または Replica の最小値と最大値の範囲が必要です。これらの範囲は、Zilliz Cloud が cluster capacity と query throughput をスケーリングできる境界を定義します。

| Setting | Purpose | Recommended guidance |
| --- | --- | --- |
| Minimum Query CU | 低トラフィック時にも利用可能なままとなるベースライン capacity を定義します。 | 管理タスク、バックグラウンドジョブ、ロード済みデータ、および予想される最小限の serving ワークロードを処理できる値を使用してください。<br/>デフォルトでは、この値は現在の Query CU 値です。 |
| Maximum Query CU | 自動 Query CU scale-up のコストと capacity の上限を定義します。 | 想定されるデータ増加に十分な余裕を提供しつつ、暴走するワークロード、再帰的なクエリバグ、または予期しないトラフィック急増から保護できる値を使用してください。<br/>デフォルトでは、この値は現在の Query CU 値の 4 倍です。 |
| Minimum Replica | 低トラフィック時におけるベースラインの query-serving 冗長性と throughput を定義します。 | アプリケーションに必要な最小限の可用性と QPS を維持できる値を使用してください。<br/>本番ワークロードでは、可用性目標に必要な最小 replica 数より低く設定しないでください。 |
| Maximum Replica | 自動 replica scale-out のコストと throughput の上限を定義します。 | 予期しないクエリ急増によるコストの制御不能な増加を防ぎつつ、想定されるトラフィックピークを吸収できる値を使用してください。 |

<Admonition type="info" icon="📘" title="Note">

最大値は、運用上または予算上の上限を超えて設定しないでください。Auto-scaling は、持続的なワークロード負荷によって必要になった場合、設定された最大値までスケールアップできます。

</Admonition>

## Auto-scaling を設定する\{#configure-auto-scaling}

Auto-scaling を有効にすると、Zilliz Cloud は関連メトリクスを継続的に評価し、設定された条件が満たされるとスケーリングジョブを作成します。

### Web コンソールから\{#via-web-console}

- **query CU Auto-scaling を設定する**

    <Supademo id="cmd2r7eqb34nbc4kj3wly357s?utm_source=link" title=""  />

    <Procedures>

    1. **Cluster Details** ページに移動します。

    1. **CU Settings** カード内の **Scale** をクリックします。

    1. スケーリング方法として Auto-scaling を選択し、**minimum and maximum Query CU Sizes** を設定します。

    1. **Save** をクリックします。

    </Procedures>

- **replica Auto-scaling を設定する**

    <Supademo id="cmk2agfmh01n4zk0iy6iu4vix" title=""  />

    <Procedures>

    1. **Cluster Details** ページに移動します。

    1. **Replica Settings** カード内の **Scale** をクリックします。

    1. スケーリング方法として Auto-scaling を選択し、minimum replica と maximum replica を設定します。

    1. **Save** をクリックします。

    </Procedures>

### RESTful API から\{#via-restful-api}

RESTful API では、単一の [Modify Cluster](/reference/restful/modify-cluster-v2) リクエストで Query CU と replica の両方に対して Auto-scaling を設定できます。

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

1. Zilliz Cloud コンソールで、対象の project に移動します。

1. **Jobs** に移動します。

1. 対象 cluster のスケーリングジョブを見つけます。

1. ジョブステータスを確認します。

</Procedures>

スケーリングジョブの進行中は、cluster ステータスは `Modifying` になります。ジョブが成功すると、cluster ステータスは `Running` に戻ります。

<Admonition type="info" icon="📘" title="Note">

スケーリングジョブの実行中、Zilliz Cloud は引き続き以前の構成に基づいて cluster に課金します。新しい Query CU または replica 構成が課金に使用されるのは、スケーリングジョブが正常に完了した後のみです。これは scale-up と scale-down の両方の操作に適用されます。

</Admonition>

## Auto-scaling のトラブルシューティング\{#troubleshoot-auto-scaling}

| Observation | Possible reason | Action |
| --- | --- | --- |
| メトリクスがしきい値を超えたが、スケーリングが開始されなかった。 | メトリクスが必要な時間だけしきい値を上回る状態を維持しなかった、クールダウンが有効である、または評価ウィンドウ内のデータが不十分である。 | 評価ウィンドウ全体でのメトリクス推移を確認し、最近の設定変更を見直してください。 |
| トラフィックが減少したにもかかわらず、cluster がスケールダウンしなかった。 | scale-in はより長く保守的なウィンドウを使用する、またはターゲット構成が現在のデータとロード済みコンテンツを安全に保持できない。 | Query CU Capacity、データ量、ロード済み collection、ならびに collection または partition の制限を確認してください。 |
| 高トラフィック時に replica が scale-out しなかった。 | Query CU Computation のしきい値状態が十分に維持されなかった、または他のスケーリングアクションの優先度が高い可能性がある。 | 時間経過に伴う Query CU Computation を確認し、スケーリングジョブ履歴を確認してください。 |
| Auto-scaling がアクションをスキップした。 | ターゲット仕様が利用不可、変更なし、または安全性チェックに失敗した。 | min/max 範囲を調整するか、有効な cluster 構成を選択してください。 |

## 制限事項と考慮点\{#limits-and-considerations}

- Auto-scaling は Dedicated serving cluster に適用されます。

- On-demand cluster は自動的にスケールするため、Auto-scaling の設定は不要です。

- replica スケーリングには、最小 4 CU の Query CU 構成が必要です。

- Query CU × replica には上限があります。詳細は [Zilliz Cloud Limits](./limits#replicas) を参照してください。

- scale-down が成功するのは、現在のデータ量と現在の collection および partition 数がターゲット仕様に収まる場合のみです。

- scheduled scaling では、スケジュール間隔が 30 分より長い必要があります。

