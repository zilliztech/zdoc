---
title: "Datadog との統合 | Cloud"
slug: /integrate-with-datadog
sidebar_key: integrate-with-datadog
sidebar_label: "Datadog"
beta: FALSE
notebook: FALSE
description: "Datadog は、アプリケーションのパフォーマンス、インフラストラクチャ、ログ管理に関するリアルタイムの洞察を提供するクラウド監視および分析プラットフォームです。Zilliz Cloud を Datadog と統合することで、Zilliz Cloud クラスターのメトリクスデータを Datadog ダッシュボードに送信できます。| Cloud"
type: origin
token: JGFQwMcVmiikeOkhepGcQ8Ken0e
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - サードパーティ
  - サービス
  - datadog

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# データdog との統合

[データdog](https://www.datadoghq.com/) は、アプリケーションのパフォーマンス、インフラストラクチャ、ログ管理に関するリアルタイムの洞察を提供するクラウド監視および分析プラットフォームです。Zilliz Cloud を データdog と統合することで、Zilliz Cloud クラスターに関するメトリックデータを データdog ダッシュボードに送信できます。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>Enterprise</strong> プロジェクト内の <strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

## 開始前に\{#before-you-start}

- データdog と統合するには、プロジェクトに対する**組織オーナー**または**プロジェクト管理者**のアクセス権限が必要です。必要な権限がない場合は、Zilliz Cloud 管理者にお問い合わせください。

- データdog アカウントと データdog API キーが必要です。API キーへのアクセス方法については、[API およびアプリケーションキー](https://docs.datadoghq.com/account_management/api-app-keys/#application-keys) を参照してください。

## 手順\{#procedure}

![integrate-with-datadog-1](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-datadog-1.png "integrate-with-datadog-1")

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. プロジェクトページの左側ナビゲーションペインで、**Integrations** をクリックします。

1. **データdog** セクションを見つけ、その横にある **+ 設定** をクリックします。

1. 表示されたダイアログボックスで、データdog をプロジェクトにリンクし、メトリックデータを収集するクラスターを割り当てます。

    1. **Configure データdog Integration** ステップで、データdog 設定を行います。

        1. **構成名**に、統合の名前を入力します（例：`DG_configuration`）。

        1. **データdog APIキー**に、データdog API キーを入力します。

        1. **データdog Site**で、データdog サイトを選択します。Zilliz Cloud は以下の データdog サイトをサポートしています：

            <table>
               <tr>
                 <th><p>Site</p></th>
                 <th><p>Site URL</p></th>
                 <th><p>Site Parameter</p></th>
                 <th><p>Location</p></th>
               </tr>
               <tr>
                 <td><p><code>US1</code></p></td>
                 <td><p><code><i>http</i>s://app.datadoghq.com</code></p></td>
                 <td><p><code>datadoghq.com</code></p></td>
                 <td><p>US</p></td>
               </tr>
               <tr>
                 <td><p><code>US3</code></p></td>
                 <td><p><code><i>http</i>s://us3.datadoghq.com</code></p></td>
                 <td><p><code>us3.datadoghq.com</code></p></td>
                 <td><p>US</p></td>
               </tr>
               <tr>
                 <td><p><code>US5</code></p></td>
                 <td><p><code><i>http</i>s://us5.datadoghq.com</code></p></td>
                 <td><p><code>us5.datadoghq.com</code></p></td>
                 <td><p>US</p></td>
               </tr>
               <tr>
                 <td><p><code>EU1</code></p></td>
                 <td><p><code><i>http</i>s://app.datadoghq.eu</code></p></td>
                 <td><p><code>datadoghq.eu</code></p></td>
                 <td><p>EU (Germany)</p></td>
               </tr>
               <tr>
                 <td><p><code>AP1</code></p></td>
                 <td><p><code><i>http</i>s://ap1.datadoghq.com</code></p></td>
                 <td><p><code>ap1.datadoghq.com</code></p></td>
                 <td><p>Japan</p></td>
               </tr>
            </table>

            データdog サイトの詳細については、[データdog サイトへのアクセス](https://docs.datadoghq.com/getting_started/site/#access-the-datadog-site) を参照してください。

        1. **統合テスト**をクリックして、Zilliz Cloud と データdog の間の接続を確認します。テストが成功したら、クラスターの割り当てに進みます。

    1. **Assign 設定 to Zilliz Cloud Cluster(s)** ステップで、メトリックデータを データdog にプッシュするクラスターを 1 つ以上選択します。

        <Admonition type="info" icon="📘" title="Notes">

        <p>選択できるのは、<strong>Dedicated-Enterprise</strong> プランティアのクラスターのみです。</p>

        </Admonition>

    1. **Create** をクリックします。

</Procedures>

## 統合進捗の監視\{#monitor-integration-progress}

セットアップ後、**Integrations** ページに戻り、データdog 統合が提供された設定詳細とともにリストされていることを確認します。ステータスが**Active**に変更された場合、統合は成功しています。Zilliz Cloud は分単位の頻度でデータを データdog にプッシュし、ほぼリアルタイムの更新を保証します。

統合の横にある外部リンクアイコンをクリックすると、関連する データdog ダッシュボードを開き、選択した Zilliz Cloud クラスターからプッシュされたクラスターメトリックを表示できます。

![integrate-with-datadog-2](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-datadog-2.png "integrate-with-datadog-2")

## 統合の管理\{#manage-integrations}

データdog 統合を管理するには、**Actions** 列を使用します：

- **Edit**: 監視対象のクラスターを更新するか、必要に応じて統合設定を変更します。

- **Remove**: 不要になった統合を削除します。

![integrate-with-datadog-3](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-datadog-3.png "integrate-with-datadog-3")

## データdog で利用可能なパフォーマンスメトリック\{#performance-metrics-available-to-datadog}

[データdog](https://www.datadoghq.com/) は、Zilliz Cloud クラスターに対して以下のメトリックデータを追跡します。括弧内のメトリック名は、データdog UI で使用される名前です。

### リソース\{#resource}

<table>
   <tr>
     <th><p>Metric Name</p></th>
     <th><p>メトリックタイプ</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>CU 計算</p><p>(<code>zilliz.cluster.cu.computation.current</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>CU の総容量に対する使用容量の測定値です。範囲は 0 から 1 です。</p></td>
   </tr>
   <tr>
     <td><p>CU 容量</p><p>(<code>zilliz.cluster.cu.capacity.current</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>CU の総計算能力に対する利用された計算能力の測定値です。範囲は 0 から 1 です。</p></td>
   </tr>
   <tr>
     <td><p>Storage</p><p>(<code>zilliz.cluster.storage.bytes.current</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>データとインデックスによって消費される永続ストレージの総量です。</p></td>
   </tr>
</table>

### パフォーマンス\{#performance}

<table>
   <tr>
     <th><p>Metric Name</p></th>
     <th><p>メトリックタイプ</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Cluster Write パフォーマンス Capacity</p><p>(<code>zilliz.cluster.write.performance.capacity.current</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>書き込みレート制限に対する現在の書き込み操作レートの測定値です。範囲は 0 から 1 です。</p></td>
   </tr>
   <tr>
     <td><p>Slow Query Count</p><p>(<code>zilliz.request.slow.queries.total</code>)</p></td>
     <td><p>Count</p></td>
     <td><p>スロークエリ要求の総数です。</p></td>
   </tr>
   <tr>
     <td><p>QPS, Request Failure Rate, Number of Flush 運用</p><p>(<code>zilliz.requests.total</code>)</p></td>
     <td><p>Count</p></td>
     <td><p>処理された要求の総数です。</p></td>
   </tr>
   <tr>
     <td><p>VPS</p><p>(<code>zilliz.request.vectors.total</code>)</p></td>
     <td><p>Count</p></td>
     <td><p>すべての要求を通じて操作されたベクトルの総数です。</p></td>
   </tr>
   <tr>
     <td><p>Latency</p><p>(<code>zilliz.request.latency.milliseconds.average</code>, <code>zilliz.request.latency.milliseconds.p99</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>処理された要求の平均/P99 レイテンシです。</p></td>
   </tr>
</table>

### データ\{#data}

<table>
   <tr>
     <th><p>Metric Name</p></th>
     <th><p>メトリックタイプ</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>エンティティ数</p><p>(<code>zilliz.entities.current</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>エンティティの数です。</p></td>
   </tr>
   <tr>
     <td><p>ロードされたエンティティ</p><p>(<code>zilliz.loaded.entities.current</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>ロードされたエンティティの数です。</p></td>
   </tr>
   <tr>
     <td><p>Collection Count</p><p>(<code>zilliz.collections.current</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>コレクションの数です。</p></td>
   </tr>
   <tr>
     <td><p>Number of Unloaded Collections</p><p>(<code>zilliz.unloaded.collections.current</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>ロードされていないコレクションの数です。</p></td>
   </tr>
</table>

## データdog で利用可能なタグ\{#tags-available-to-datadog}

データdog は、リソースをよりよく理解し、整理し、識別するのに役立つよう、特定のメトリックに対して以下のタグを送信します。

<table>
   <tr>
     <th><p>Tag Name</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>org_id</code></p></td>
     <td><p>メトリックに関連付けられた Zilliz Cloud 組織の ID です。</p></td>
   </tr>
   <tr>
     <td><p><code>project_id</code></p></td>
     <td><p>メトリックに関連付けられた Zilliz Cloud プロジェクトの ID です。</p></td>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>メトリックに関連付けられた Zilliz Cloud クラスターの ID です。</p></td>
   </tr>
   <tr>
     <td><p><code>request_type</code></p></td>
     <td><p>監視されている操作のタイプです。可能な値：<code>insert</code>, <code>upsert</code>, <code>delete</code>, <code>bulk_insert</code>, <code>flush</code>, <code>search</code>, <code>query</code></p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>操作の結果です。可能な値：<code>success</code>, <code>fail</code></p></td>
   </tr>
</table>
