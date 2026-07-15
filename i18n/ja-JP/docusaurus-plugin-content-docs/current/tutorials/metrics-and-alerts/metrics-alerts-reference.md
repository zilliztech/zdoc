---
title: "メトリクスリファレンス | Cloud"
slug: /metrics-alerts-reference
sidebar_key: metrics-alerts-reference
sidebar_label: "メトリクスリファレンス"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud はメトリクスを次のレベルに整理しています | Cloud"
type: origin
token: KnnBwce9JifxvXkd070cvgUPnag
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - メトリクス
  - アラート

---

import Admonition from '@theme/Admonition';


# メトリクスリファレンス

Zilliz Cloud はメトリクスを以下のレベルに分類しています：

- **組織レベルのメトリクス**: すべてのプロジェクトにわたるアカウント全体のステータス（例：ライセンスクレジット、使用量）を反映します。

- **クラスタレベルのメトリクス**: 個別のクラスタ内のリソース、パフォーマンス、データを反映します。

- **コレクションレベルのメトリクス**: クラスタメトリクスのサブセットをコレクションごとに分解したもので、個別のコレクションのパフォーマンス問題の特定や容量計画に役立ちます。

<Admonition type="info" icon="📘" title="Notes">

ほとんどのメトリクスはアラートをサポートしています。アラートは、一定の時間枠でメトリクスを条件（演算子 + しきい値）と照合し、条件を満たしたときに通知します。設定については、[組織アラートの管理](./manage-organization-alerts)および[プロジェクトアラートの管理](./manage-project-alerts)を参照してください。

</Admonition>

## 組織レベルのメトリクス\{#organization-level-metrics}

組織レベルのメトリクスは、組織内のすべてのプロジェクトにわたる課金関連の問題を追跡するのに役立ちます。

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>説明</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td><p>過去1日間の使用量金額（$）</p></td>
     <td><p>過去1日間の累積使用料金。</p></td>
     <td><p>予算と比較して監視し、必要に応じて使用量を最適化または予算を調整してください。</p></td>
   </tr>
   <tr>
     <td><p>クレジット有効期間（日）</p></td>
     <td><p>無料クレジットの有効期限までの残り日数。</p></td>
     <td><p>期限切れ前にクレジットを使用または延長してください。</p></td>
   </tr>
   <tr>
     <td><p>残りのクレジット（$）</p></td>
     <td><p>無料クレジットの残高。</p></td>
     <td><p>アカウント機能を維持するため、少なくなったらチャージしてください。</p></td>
   </tr>
   <tr>
     <td><p>クレジットカード有効期間（日）</p></td>
     <td><p>登録されたカードの有効期限までの日数。</p></td>
     <td><p>支払い失敗を避けるため、期限切れ前にカードを更新または交換してください。</p></td>
   </tr>
   <tr>
     <td><p>前払い残高（$）</p></td>
     <td><p>残りの前払い資金。</p></td>
     <td><ul><li><p><strong>Serving クラスター</strong>: All</p></li><li><p><strong>オンデマンドコンピュートデータベース</strong>: マネージドコレクション、外部コレクション</p></li></ul></td>
   </tr>
</table>

## クラスタおよびコレクションメトリクス\{#cluster-and-collection-metrics}

これらのメトリクスは、個別のクラスタ内のリソース、パフォーマンス、データを記述します。**✦** のマークが付いているメトリクスは、コレクションレベルでも利用可能です。コレクションレベルのメトリクスには、コンソールのコレクション詳細ページ、[Prometheus エンドポイント](./prometheus-monitoring)、または RESTful API からアクセスできます。

<Admonition type="info" icon="📘" title="Notes">

**Availability** 列には、各メトリクスをサポートするコンピュートリソースが表示されます。

- **Serving クラスターのみ**: メトリクスは Serving クラスターでのみ利用できます。値には、サポートされる Serving クラスターのデプロイオプションが表示されます。**All** は、すべての Serving クラスターのデプロイオプションを意味します。詳細については、[デプロイとプランの比較](./select-zilliz-cloud-service-plans)を参照してください。

- **オンデマンドコンピュートデータベース**: コレクションレベルの一部のメトリクスのみ利用できます。サポートされるメトリクスは、**QPS (Read)**、**Search NQ per Second**、**Latency (Read)**、**Request Failure Rate (Read)**、**Entity Count** です。これらのメトリクスはコンソールで利用できます。このリリースでは、オンデマンドコンピュートデータベースのメトリクスを Prometheus にエクスポートすることはできません。

</Admonition>

### リソース\{#resources}

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>説明</p></th>
     <th><p>利用可能なプラン</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td><p>Read vCUs（カウント）</p></td>
     <td><p>検索およびクエリ操作の vCU 消費量の指標。</p><p>注：このメトリクスのアラートはサポートされていません。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Free / Serverless</p></td>
     <td><p>トレンドを監視して、読み取りコスト/スループットを把握してください。</p></td>
   </tr>
   <tr>
     <td><p>Write vCUs（カウント）</p></td>
     <td><p>挿入、削除、アップサート操作の vCU 消費量の指標。</p><p>注：このメトリクスのアラートはサポートされていません。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Free / Serverless</p></td>
     <td><p>トレンドを監視して、書き込みコスト/スループットを把握してください。</p></td>
   </tr>
   <tr>
     <td><p>Query CU計算 (%)</p></td>
     <td><p>クエリ実行が CPU リソースをどの程度使用しているかを測定します。QueryNode の CPU 使用量を CPU 制限と比較して算出されます。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Dedicated / BYOC</p></td>
     <td><p>高い値が継続する場合、クエリ実行が CPU によって制約されています。Zilliz Cloud は、並列クエリ処理能力を高めるために<a href="./plan-cluster-scaling">レプリカをスケールアウト</a>することがあります。</p></td>
   </tr>
   <tr>
     <td><p>Query CU Capacity (%)</p></td>
     <td><p>現在のクエリ CU が容量上限にどの程度近いかを測定します。ロード済みデータが使用するメモリと、クラスターのストレージクォータに対する保存データサイズのうち、大きい方の値を使用します。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Dedicated / BYOC</p></td>
     <td><p>高い値が継続する場合、現在のクエリ CU サイズでは容量が不足する可能性があります。自動スケーリングが有効な場合、Zilliz Cloud は容量を増やすために<a href="./plan-cluster-scaling">クエリ CU をスケールアップ</a>することがあります。</p></td>
   </tr>
   <tr>
     <td><p>Total Query CU（カウント）</p></td>
     <td><p>現在のクラスタの総クエリ CU。クラスタのクエリ CU 数とレプリカ数の積として計算されます。（例：クラスタに 2 つのクエリ CU と 2 つのレプリカがある場合、ここに表示される総クエリ CU は 4 となります。）</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Dedicated / BYOC</p></td>
     <td><p>クエリ CU のスケーリングイベントを特定するために追跡してください。</p></td>
   </tr>
   <tr>
     <td><p>Replica（カウント）</p></td>
     <td><p>クラスタレプリカの数。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Dedicated / BYOC</p></td>
     <td><p>レプリカのスケーリングイベントを特定するために追跡してください。</p></td>
   </tr>
   <tr>
     <td><p>Storage（GB）</p></td>
     <td><p>データとインデックスによって消費された永続ストレージの総量。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: All</p></td>
     <td><p>ストレージ使用量の監視のため、<a href="./manage-project-alerts">アラートを設定</a>してください。</p></td>
   </tr>
</table>

### パフォーマンス\{#performance}

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>説明</p></th>
     <th><p>利用可能なプラン</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td><p>QPS（Read）✦</p></td>
     <td><p>1 秒あたりの読み取りリクエスト（検索およびクエリ）の数。</p></td>
     <td><ul><li><p><strong>Serving クラスター</strong>: All</p></li><li><p><strong>オンデマンドコンピュートデータベース</strong>: マネージドコレクション、外部コレクション</p></li></ul></td>
     <td><p>システムパフォーマンス監視については、<a href="https://zilliz.com/vector-database-benchmark-tool">ベンチマーク</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>QPS（Write）✦</p></td>
     <td><p>1 秒あたりの書き込みリクエスト（挿入、バルク挿入、アップサート、および削除）の数。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: All</p></td>
     <td><p>システムパフォーマンス監視については、<a href="https://zilliz.com/vector-database-benchmark-tool">ベンチマーク</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Search NQ per Second ✦</p></td>
     <td><p>1 秒あたりに各検索リクエストが含むクエリベクトルの数。</p></td>
     <td><ul><li><p><strong>Serving クラスター</strong>: All</p></li><li><p><strong>オンデマンドコンピュートデータベース</strong>: マネージドコレクション、外部コレクション</p></li></ul></td>
     <td><p>システムパフォーマンス監視については、<a href="https://zilliz.com/vector-database-benchmark-tool">ベンチマーク</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Write Throughput（Entities/sec）✦</p></td>
     <td><p>すべての書き込み操作（挿入、アップサート、バルク挿入、および削除）における 1 秒あたりの書き込まれたエンティティ数の測定。</p></td>
     <td><ul><li><p><strong>Serving クラスター</strong>: All</p></li><li><p><strong>オンデマンドコンピュートデータベース</strong>: マネージドコレクション、外部コレクション</p></li></ul></td>
     <td><p>システムパフォーマンス監視については、<a href="https://zilliz.com/vector-database-benchmark-tool">ベンチマーク</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Latency（Read）（ms）✦</p></td>
     <td><p>クライアントが読み取りリクエスト（検索およびクエリリクエスト）をサーバーに送信してから、クライアントが応答を受信するまでの経過時間。平均レイテンシと P99 レイテンシが含まれます。</p></td>
     <td><ul><li><p><strong>Serving クラスター</strong>: All</p></li><li><p><strong>オンデマンドコンピュートデータベース</strong>: マネージドコレクション、外部コレクション</p></li></ul></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Latency（Write）（ms）✦</p></td>
     <td><p>クライアントが書き込みリクエスト（挿入およびアップサートリクエスト）をサーバーに送信してから、クライアントが応答を受信するまでの経過時間。平均レイテンシと P99 レイテンシが含まれます。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: All</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate（Read）（%）✦</p></td>
     <td><p>1 秒あたりのすべてのリクエストにおける、失敗した読み取りリクエストの割合。</p></td>
     <td><ul><li><p><strong>Serving クラスター</strong>: All</p></li><li><p><strong>オンデマンドコンピュートデータベース</strong>: マネージドコレクション、外部コレクション</p></li></ul></td>
     <td><p>読み取りリクエストの失敗率を監視するため、<a href="./manage-project-alerts">アラートを設定</a>してください。</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate（Write）（%）✦</p></td>
     <td><p>1 秒あたりのすべてのリクエストにおける、失敗した書き込みリクエストの割合。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: All</p></td>
     <td><p>書き込みリクエストの失敗率を監視するため、<a href="./manage-project-alerts">アラートを設定</a>してください。</p></td>
   </tr>
   <tr>
     <td><p>Slow Query Count（counts/min）✦</p></td>
     <td><p>異常に長い時間を要して実行されるクエリの数。</p><p>デフォルトでは、レイテンシが 5 秒を超えるクエリはスロークエリとみなされます。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Dedicated (Enterprise または Business Critical) / BYOC</p></td>
     <td><p>問題のあるクエリを特定し、必要に応じてクラスタ構成を調整してパフォーマンスをチューニングしてください。</p></td>
   </tr>
   <tr>
     <td><p>Cluster Write パフォーマンス Capacity（%）</p></td>
     <td><p>クラスタ書き込みパフォーマンス容量 = 現在の書き込み操作レート / 書き込みレート制限。80% を超える場合、書き込み操作（挿入およびアップサート）のレートを下げることを推奨します。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Dedicated (Enterprise または Business Critical) / BYOC</p></td>
     <td><p>現在のレートが高すぎる場合（80% 超を推奨）、書き込みレートを下げることを推奨します。</p></td>
   </tr>
   <tr>
     <td><p>Number of Flush 運用（counts/min）</p></td>
     <td><p>クラスタでのフラッシュ操作の数。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Dedicated (Enterprise または Business Critical) / BYOC</p></td>
     <td><p>フラッシュ操作を頻繁に実行しすぎると、クラスタ全体のパフォーマンスに悪影響を与える可能性があります。詳細については、<a href="./limits#flush">Zilliz Cloud 制限s</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Cache Hit Rate（%）</p></td>
     <td><p>クラスタ内のすべてのクエリの平均キャッシュヒット率。計算式：クエリあたりのキャッシュヒット率 =（総スキャンデータ − コールドデータスキャン）/ 総スキャンデータ。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Dedicated (Tiered-storage) / BYOC</p><p><em>&ast;このメトリクスは、Milvus 2.6.x と互換性のある階層型ストレージクラスターでのみ利用できます。このメトリクスを利用するには、<a href="http://support.zilliz.com">お問い合わせ</a>のうえ、クラスターの Milvus バージョンをアップグレードしてください。</em></p></td>
     <td><p>クラスタのクエリパフォーマンスを特定するために追跡してください。</p></td>
   </tr>
</table>

### データ\{#data}

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>説明</p></th>
     <th><p>利用可能なプラン</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td><p>Collection Count</p></td>
     <td><p>クラスタ内に作成されたコレクションの数。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: All</p></td>
     <td><p>増加を監視し、必要に応じてプロジェクトごとの制限を適用してください。</p></td>
   </tr>
   <tr>
     <td><p>エンティティ数 ✦</p></td>
     <td><p>クラスタまたはコレクションに挿入されたエンティティの総数。単一挿入とバルク挿入の両方が含まれます。</p></td>
     <td><ul><li><p><strong>Serving クラスター</strong>: All</p></li><li><p><strong>オンデマンドコンピュートデータベース</strong>: マネージドコレクション、外部コレクション</p></li></ul></td>
     <td><p>予期しない増加を調査し、ストレージとインデックスを計画してください。</p></td>
   </tr>
   <tr>
     <td><p>ロードされたエンティティ（Approx.）✦</p></td>
     <td><p>ロードされた（アクティブに提供されている）エンティティの概算数。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Dedicated / BYOC</p></td>
     <td><p>より正確でリアルタイムの値については、コレクション概要ページの「ロードされたエンティティ」値、または <a href="./single-vector-search">count(&ast;)</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Number of Unloaded Collections</p></td>
     <td><p>クラスタ内のアンロードされたコレクションの数。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Dedicated (Enterprise または Business Critical) / BYOC</p></td>
     <td><p>重要なコレクションをロードし、メモリ余裕を確認してください。</p></td>
   </tr>
</table>

### その他\{#others}

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>説明</p></th>
     <th><p>利用可能なプラン</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td><p>Cluster is 異常</p></td>
     <td><p>対象クラスタのステータスが異常な場合。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Dedicated (Enterprise または Business Critical) / BYOC</p></td>
     <td><p>クラスタのステータスを調査し、適切な対策を講じてください。</p></td>
   </tr>
   <tr>
     <td><p>CMEK is Unavailable</p></td>
     <td><p>Zilliz Cloud に追加された KMS キーのいずれかが利用できなくなった場合。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Dedicated (Enterprise または Business Critical) / BYOC</p></td>
     <td><p>KMS キーを確認し、報告されたキーがまだ利用可能かどうかを判断してください。</p></td>
   </tr>
   <tr>
     <td><p>Writes to Cluster Are Disabled</p></td>
     <td><p>エラーまたは保護メカニズムにより、対象クラスタへの書き込みが無効になった場合。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Dedicated (Enterprise または Business Critical) / BYOC</p></td>
     <td><p>クラスタのステータス、最近の構成またはメンテナンスの運用、および関連するアラートを確認し、根本原因を解決して書き込み機能を復元してください。</p></td>
   </tr>
   <tr>
     <td><p>アクセスログ転送が異常</p></td>
     <td><p>設定されたストレージ統合にアクセスログを正常に転送できない場合。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Dedicated (Enterprise または Business Critical)</p></td>
     <td><p>ログ転送設定、転送先サービスの状態、ネットワーク接続、関連する認証情報または権限を確認し、問題を解決してログ転送が再開することを確認してください。</p></td>
   </tr>
   <tr>
     <td><p>監査ログ転送が異常</p></td>
     <td><p>設定されたストレージ統合に監査ログを正常に転送できない場合。</p></td>
     <td><p><strong>Serving クラスターのみ</strong>: Dedicated (Enterprise または Business Critical)</p></td>
     <td><p>ログ転送設定、転送先サービスの状態、ネットワーク接続、関連する認証情報または権限を確認し、問題を解決してログ転送が再開することを確認してください。</p></td>
   </tr>
</table>

## 関連トピック\{#related-topics}

- [クラスタメトリクスチャートの表示](./view-cluster-metric-charts)

- [組織アラートの管理](./manage-organization-alerts)

- [プロジェクトアラートの管理](./manage-project-alerts)

