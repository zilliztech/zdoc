---
title: "メトリクスとアラートのリファレンス | Cloud"
slug: /metrics-alerts-reference
sidebar_label: "メトリクスとアラートのリファレンス"
beta: FALSE
notebook: FALSE
description: "このリファレンスでは、Zilliz Cloudクラスターの監視メトリクスの説明、および組織およびプロジェクトレベルで設定できるアラートターゲットについて説明しています。 | Cloud"
type: origin
token: Nn8fwYNLmiBZLBkeJIycUARFnfd
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - metrics
  - alerts
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison

---

import Admonition from '@theme/Admonition';


# メトリクスとアラートのリファレンス

このリファレンスでは、Zilliz Cloudクラスターの監視メトリクスの説明、および組織およびプロジェクトレベルで設定できるアラートターゲットについて説明しています。

## クラスタメトリクス{#cluster-metrics}

Zilliz Cloudコンソールの**メトリクス**タブには、さまざまなグラフィカルな表現が表示されます。

表には、各メトリックの説明と、クラスターリソースの使用量がしきい値を超えた場合に実行することをお勧めするアクションが示されています。

<Admonition type="info" icon="📘" title="ノート">

<p>現在、無料クラスタではCU容量という1つのメトリックしか提供されていません。高度なメトリックの範囲を解除するには、<a href="./manage-cluster">プランレベルをアップグレード</a>してください。</p>

</Admonition>

<table>
   <tr>
     <th><p>メトリック名</p></th>
     <th><p>ユニット</p></th>
     <th><p>説明する</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td colspan="4"><p><strong>リソース</strong></p></td>
   </tr>
   <tr>
     <td><p>vCUを読む</p></td>
     <td><p>カウント</p></td>
     <td><p>検索およびクエリ操作のvCU消費量の測定。</p><p>このメトリックは、<strong>Free</strong>クラスターまたは<strong>Serverless</strong>クラスターでのみ使用できます。クラスタープランレベルの詳細については、「<a href="./select-zilliz-cloud-service-plans">詳細なプラン比較</a>」を参照してください。\</include></p></td>
     <td><p>-\</除外する></p></td>
   </tr>
   <tr>
     <td><p>vCUを書く</p></td>
     <td><p>カウント</p></td>
     <td><p>挿入、削除、および挿入操作のvCU消費量の尺度。</p><p>このメトリックは、<strong>Free</strong>クラスターまたは<strong>Serverless</strong>クラスターでのみ使用できます。クラスタープランレベルの詳細については、「<a href="./select-zilliz-cloud-service-plans">詳細なプラン比較</a>」を参照してください。\</include></p></td>
     <td><p>-\</除外する></p></td>
   </tr>
   <tr>
     <td><p>CUコンピュテーション</p></td>
     <td><p>%</p></td>
     <td><p>CUの総計算能力に対する利用された計算能力の尺度。</p><p>このメトリックは、<strong>専用</strong>クラスターまたは<strong>BYOC</strong>クラスターでのみ使用できます。クラスタープランレベルの詳細については、「<a href="./select-zilliz-cloud-service-plans">詳細なプラン比較</a>.」を参照してください。</p></td>
     <td><p><strong>70%-80%</strong>:サービスの状態を確認し、<a href="./manage-cluster">スケールアップ</a>の準備をしてください。</p><p><strong>>90%</strong>:サービスの中断を避けるためにすぐに<a href="./manage-cluster">スケールアップ</a>してください。</p></td>
   </tr>
   <tr>
     <td><p>CUの容量</p></td>
     <td><p>%</p></td>
     <td><p>CUの総容量に対する使用済み容量の尺度。</p><p>このメトリックは、<strong>Free</strong>、<strong>Dedicated</strong>、または<strong>BYOC</strong>クラスターで使用できます。</p></td>
     <td><p><strong>70%-80%</strong>:サービスの状態を確認し、スケールアップの準備をしてください。</p><p><strong>>90%</strong>:サービスの中断を避けるためにすぐに<a href="./manage-cluster">スケールアップ</a>してください。</p><p><strong>100%</strong>: CU容量が100%になると、クラスタにデータを書き込むことができなくなります。サービスの中断を避けるために、すぐに<a href="./manage-cluster">スケールアップ</a>してください。</p></td>
   </tr>
   <tr>
     <td><p>ストレージ</p></td>
     <td><p>GB</p></td>
     <td><p>データとインデックスによって消費される永続ストレージの合計金額。</p></td>
     <td><p><a href="./manage-project-alerts">アラートを構成</a>してストレージの使用状況を監視します。</p></td>
   </tr>
   <tr>
     <td colspan="4"><p><strong>パフォーマンス</strong></p></td>
   </tr>
   <tr>
     <td><p>QPS/VPS（読み取り）</p></td>
     <td><p>QPS/VPSの</p></td>
     <td><p><strong>QPS</strong>: 1秒あたりの読み取りリクエスト(検索とクエリ)の数。</p><p><strong>VPS</strong>:ベクトルに対する1秒あたりの読み取りリクエスト(検索)の数。クエリ操作にベクトルが含まれないため、VPSはクエリリクエストには使用できません。</p></td>
     <td><p>システムパフォーマンスの監視については、<a href="https://zilliz.com/vector-database-benchmark-tool">ベンチマーク</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>QPS/VPS（書き込み）</p></td>
     <td><p>QPS/VPSの</p></td>
     <td><p><strong>QPS</strong>: 1秒あたりの書き込み要求(挿入、一括挿入、アップロード、削除)の数。</p><p><strong>VPS</strong>:ベクトルに対する1秒あたりの書き込み要求(挿入、一括挿入、挿入、削除)の数。</p></td>
     <td><p>システムパフォーマンスの監視については、<a href="https://zilliz.com/vector-database-benchmark-tool">ベンチマーク</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>レイテンシ（読み取り）</p></td>
     <td><p>ms</p></td>
     <td><p>クライアントがサーバーに読み取り要求（検索とクエリ）を送信し、クライアントが応答を受信するまでの経過時間。</p><p>右側の拡張ドロップダウンメニューから<strong>平均</strong>または<strong>P 99</strong>を選択すると、平均またはP 99レイテンシーが表示されます。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>レイテンシー（書き込み）</p></td>
     <td><p>ms</p></td>
     <td><p>クライアントがサーバーに書き込み要求(挿入、挿入、削除)を送信してから、クライアントが応答を受信するまでの経過時間。</p><p>右側の拡張ドロップダウンメニューから<strong>平均</strong>または<strong>P 99</strong>を選択すると、平均またはP 99レイテンシーが表示されます。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>リクエストの失敗率（読み取り）</p></td>
     <td><p>%</p></td>
     <td><p>1秒あたりのすべての読み取り要求における失敗した読み取り要求(検索およびクエリ)の割合。</p></td>
     <td><p><a href="./manage-project-alerts">アラートを設定</a>して、読み取り要求の失敗率を監視します。</p></td>
   </tr>
   <tr>
     <td><p>リクエストの失敗率（書き込み）</p></td>
     <td><p>%</p></td>
     <td><p>1秒あたりのすべての書き込み要求における失敗した書き込み要求(挿入、一括挿入、upsert、削除)の割合。</p></td>
     <td><p><a href="./manage-project-alerts">アラートを設定</a>して、書き込み要求の失敗率を監視します。</p></td>
   </tr>
   <tr>
     <td><p>クエリー数が遅い</p></td>
     <td><p>カウント/分</p></td>
     <td><p>すべての検索およびクエリリクエストを含む遅いクエリ操作の数。デフォルトでは、レイテンシが5秒のすべてのリクエストは遅いクエリと見なされます。</p><p>このメトリックタイプは、<strong>Dedicated</strong>Clusters of the<strong>Enterprise</strong>Editionまたは<strong>BYOC</strong>Clustersでのみ使用できます。クラスタータイプの詳細については、「<a href="./select-zilliz-cloud-service-plans">詳細なプラン比較</a>」を参照してください。</p></td>
     <td><p>必要に応じてクラスター構成を調整して、問題のあるクエリを特定し、パフォーマンスを調整します。</p></td>
   </tr>
   <tr>
     <td><p>クラスタ書き込み性能Capacity</p></td>
     <td><p>%</p></td>
     <td><p>書き込み操作の現在のレート/書き込みレートの制限。</p><p>このメトリックタイプは、<strong>Dedicated</strong>Clusters of the<strong>Enterprise</strong>Editionまたは<strong>BYOC</strong>Clustersでのみ使用できます。クラスタータイプの詳細については、「<a href="./select-zilliz-cloud-service-plans">詳細なプラン比較</a>」を参照してください。</p></td>
     <td><p>現在のレートが高すぎる場合（80%を超えることが推奨されます）、書き込みレートを下げることをお勧めします。</p></td>
   </tr>
   <tr>
     <td><p>フラッシュ操作の回数</p></td>
     <td><p>カウント/分</p></td>
     <td><p>クラスターに対するフラッシュ操作の数。</p><p>このメトリックタイプは、<strong>Dedicated</strong>Clusters of the<strong>Enterprise</strong>Editionまたは<strong>BYOC</strong>Clustersでのみ使用できます。クラスタータイプの詳細については、「<a href="./select-zilliz-cloud-service-plans">詳細なプラン比較</a>」を参照してください。</p></td>
     <td><p>フラッシュ操作を頻繁に実行すると、クラスタの全体的なパフォーマンスに悪影響を及ぼす可能性があります。詳細については、<a href="./limits">Zillizクラウドの制限</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td colspan="4"><p><strong>データ</strong></p></td>
   </tr>
   <tr>
     <td><p>コレクション数</p></td>
     <td><p>数える</p></td>
     <td><p>クラスター内に作成されたコレクションの数。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>エンティティカウント</p></td>
     <td><p>数える</p></td>
     <td><p>クラスタに挿入されるエンティティの数。</p><p>右側の拡張ドロップダウンメニューから特定のコレクションを選択すると、コレクションレベルのエンティティの数が表示されます。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>ロードされたエンティティ</p></td>
     <td><p>数える</p></td>
     <td><p>クラスタによってロードされた(アクティブにサービスされている)エンティティの数。</p><p>右側の拡張ドロップダウンメニューから特定のコレクションを選択すると、コレクションレベルでロードされたエンティティの数が表示されます。</p><p>このメトリックは、<strong>専用</strong>クラスターまたは<strong>BYOC</strong>クラスターでのみ使用できます。クラスタープランレベルの詳細については、「<a href="./select-zilliz-cloud-service-plans">詳細なプラン比較</a>.」を参照してください。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>アンロードされたコレクション数</p></td>
     <td><p>数える</p></td>
     <td><p>クラスター内のアンロードされたコレクションの数。</p><p>このメトリックタイプは、<strong>Dedicated</strong>Clusters of the<strong>Enterprise</strong>Editionまたは<strong>BYOC</strong>Clustersでのみ使用できます。クラスタータイプの詳細については、「<a href="./select-zilliz-cloud-service-plans">詳細なプラン比較</a>」を参照してください。</p></td>
     <td></td>
   </tr>
</table>

## 組織のアラート{#organization-alerts}

組織のアラートによって、請求に関連する\</include>問題、例えばなどが通知されます。

