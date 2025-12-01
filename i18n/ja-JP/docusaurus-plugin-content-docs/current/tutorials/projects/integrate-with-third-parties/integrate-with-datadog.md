---
title: "Datadogとの統合 | Cloud"
slug: /integrate-with-datadog
sidebar_label: "Datadog"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Datadogは、アプリケーションパフォーマンス、インフラ、ログ管理に関するリアルタイム分析を提供するクラウド監視および分析プラットフォームです。Zilliz CloudをDatadogと統合することで、Zilliz Cloudクラスターに関するメトリクスデータをDatadogダッシュボードに送信できます。 | Cloud"
type: origin
token: JGFQwMcVmiikeOkhepGcQ8Ken0e
sidebar_position: 4
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - サードパーティ
  - サービス
  - datadog
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base

---

import Admonition from '@theme/Admonition';


# Datadogとの統合

[Datadog](https://www.datadoghq.com/)は、アプリケーションパフォーマンス、インフラ、ログ管理に関するリアルタイム分析を提供するクラウド監視および分析プラットフォームです。Zilliz CloudをDatadogと統合することで、Zilliz Cloudクラスターに関するメトリクスデータをDatadogダッシュボードに送信できます。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、<strong>エンタープライズ</strong>プロジェクト内の<strong>専用</strong>クラスターでのみ利用可能です。</p>

</Admonition>

## 始める前に\{#before-you-start}

- Datadogと統合するには、プロジェクトに**組織オーナー**または**プロジェクト管理者**のアクセス権が必要です。必要な権限がない場合は、Zilliz Cloud管理者に連絡してください。

- DatadogアカウントとDatadog APIキーが必要です。APIキーへのアクセス方法については、[APIおよびアプリケーションキー](https://docs.datadoghq.com/account_management/api-app-keys/#application-keys)を参照してください。

## 手順\{#procedure}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. プロジェクトページの左側のナビゲーションペインで、**統合**をクリックします。

1. **Datadog**セクションを見つけ、その横の**+ 設定**をクリックします。

1. 表示されるダイアログボックスで、Datadogをプロジェクトにリンクし、メトリクスデータを収集するクラスターを割り当てます。

    1. **Datadog統合の設定**ステップで、Datadog設定を構成します。

        1. **設定名**で、統合の名前を入力します（例：`DG_configuration`）。

        1. **Datadog APIキー**で、Datadog APIキーを入力します。

        1. **Datadogサイト**で、Datadogサイトを選択します。Zilliz Cloudは以下のDatadogサイトをサポートしています：

            <table>
               <tr>
                 <th><p>サイト</p></th>
                 <th><p>サイトURL</p></th>
                 <th><p>サイトパラメータ</p></th>
                 <th><p>場所</p></th>
               </tr>
               <tr>
                 <td><p><code>US1</code></p></td>
                 <td><p><code><i>http</i>s://app.datadoghq.com</code></p></td>
                 <td><p><code>datadoghq.com</code></p></td>
                 <td><p>米国</p></td>
               </tr>
               <tr>
                 <td><p><code>US3</code></p></td>
                 <td><p><code><i>http</i>s://us3.datadoghq.com</code></p></td>
                 <td><p><code>us3.datadoghq.com</code></p></td>
                 <td><p>米国</p></td>
               </tr>
               <tr>
                 <td><p><code>US5</code></p></td>
                 <td><p><code><i>http</i>s://us5.datadoghq.com</code></p></td>
                 <td><p><code>us5.datadoghq.com</code></p></td>
                 <td><p>米国</p></td>
               </tr>
               <tr>
                 <td><p><code>EU1</code></p></td>
                 <td><p><code><i>http</i>s://app.datadoghq.eu</code></p></td>
                 <td><p><code>datadoghq.eu</code></p></td>
                 <td><p>EU（ドイツ）</p></td>
               </tr>
               <tr>
                 <td><p><code>AP1</code></p></td>
                 <td><p><code><i>http</i>s://ap1.datadoghq.com</code></p></td>
                 <td><p><code>ap1.datadoghq.com</code></p></td>
                 <td><p>日本</p></td>
               </tr>
            </table>

            Datadogサイトの詳細については、[Datadogサイトへのアクセス](https://docs.datadoghq.com/getting_started/site/#access-the-datadog-site)を参照してください。

        1. **統合のテスト**をクリックして、Zilliz CloudとDatadog間の接続を検証します。テストが成功した場合、クラスターの割り当てに進みます。

    1. **Zilliz Cloudクラスターへの設定の割り当て**ステップで、メトリクスデータをDatadogにプッシュする1つ以上のクラスターを選択します。

        <Admonition type="info" icon="📘" title="ノート">

        <p><strong>専用-エンタープライズ</strong>プランティアのクラスターのみ選択できます。</p>

        </Admonition>

    1. **作成**をクリックします。

![integrate-with-datadog-1](/img/integrate-with-datadog-1.png "integrate-with-datadog-1")

## 統合進捗の監視\{#monitor-integration-progress}

セットアップ後、**統合**ページに戻り、Datadog統合が提供された設定詳細とともにリストされていることを確認します。ステータスが**有効**に変わると、統合は成功です。Zilliz Cloudは1分間隔でDatadogにデータをプッシュし、ほぼリアルタイムな更新を確保します。

統合の横にある外部リンクアイコンをクリックすると、関連するDatadogダッシュボードを開き、選択したZilliz Cloudクラスターからプッシュされたクラスターメトリクスを表示できます。

![integrate-with-datadog-2](/img/integrate-with-datadog-2.png "integrate-with-datadog-2")

## 統合の管理\{#manage-integrations}

Datadog統合を管理するには、**アクション**列を使用します：

- **編集**：監視クラスターを更新するか、必要に応じて統合設定を変更します。

- **削除**：不要になった場合は統合を削除します。

![integrate-with-datadog-3](/img/integrate-with-datadog-3.png "integrate-with-datadog-3")

## Datadogで利用可能なパフォーマンスメトリクス\{#performance-metrics-available-to-datadog}

[Datadog](https://www.datadoghq.com/)は、Zilliz Cloudクラスターの以下のメトリクスデータを追跡します。括弧内のメトリクス名は、Datadog UIで使用される名前です。

### リソース\{#resource}

<table>
   <tr>
     <th><p>メトリクス名</p></th>
     <th><p>メトリクスタイプ</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>CUコンピュテーション</p><p>（<code>zilliz.cluster.cu.computation.current</code>）</p></td>
     <td><p>ゲージ</p></td>
     <td><p>CUの総容量に対する使用容量の割合。0〜1の範囲。</p></td>
   </tr>
   <tr>
     <td><p>CU容量</p><p>（<code>zilliz.cluster.cu.capacity.current</code>）</p></td>
     <td><p>ゲージ</p></td>
     <td><p>CUの総計算容量に対する使用中の計算能力の割合。0〜1の範囲。</p></td>
   </tr>
   <tr>
     <td><p>ストレージ</p><p>（<code>zilliz.cluster.storage.bytes.current</code>）</p></td>
     <td><p>ゲージ</p></td>
     <td><p>データおよびインデックスによって消費される永続ストレージの総量。</p></td>
   </tr>
</table>

### パフォーマンス\{#performance}

<table>
   <tr>
     <th><p>メトリクス名</p></th>
     <th><p>メトリクスタイプ</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>クラスタ書き込みパフォーマンス容量</p><p>（<code>zilliz.cluster.write.performance.capacity.current</code>）</p></td>
     <td><p>ゲージ</p></td>
     <td><p>書き込みレート制限に対する現在の書き込み操作レートの割合。0〜1の範囲。</p></td>
   </tr>
   <tr>
     <td><p>スロークエリカウント</p><p>（<code>zilliz.request.slow.queries.total</code>）</p></td>
     <td><p>カウント</p></td>
     <td><p>スロークエリリクエストの総数。</p></td>
   </tr>
   <tr>
     <td><p>QPS、リクエスト失敗率、フラッシュ操作数</p><p>（<code>zilliz.requests.total</code>）</p></td>
     <td><p>カウント</p></td>
     <td><p>処理されたリクエストの総数。</p></td>
   </tr>
   <tr>
     <td><p>VPS</p><p>（<code>zilliz.request.vectors.total</code>）</p></td>
     <td><p>カウント</p></td>
     <td><p>すべてのリクエストで操作されたベクトルの総数。</p></td>
   </tr>
   <tr>
     <td><p>レイテンシ</p><p>（<code>zilliz.request.latency.milliseconds.average</code>、<code>zilliz.request.latency.milliseconds.p99</code>）</p></td>
     <td><p>ゲージ</p></td>
     <td><p>処理されたリクエストの平均/P99レイテンシ。</p></td>
   </tr>
</table>

### データ\{#data}

<table>
   <tr>
     <th><p>メトリクス名</p></th>
     <th><p>メトリクスタイプ</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>エンティティカウント</p><p>（<code>zilliz.entities.current</code>）</p></td>
     <td><p>ゲージ</p></td>
     <td><p>エンティティ数。</p></td>
   </tr>
   <tr>
     <td><p>ロードされたエンティティ</p><p>（<code>zilliz.loaded.entities.current</code>）</p></td>
     <td><p>ゲージ</p></td>
     <td><p>ロードされたエンティティ数。</p></td>
   </tr>
   <tr>
     <td><p>コレクションカウント</p><p>（<code>zilliz.collections.current</code>）</p></td>
     <td><p>ゲージ</p></td>
     <td><p>コレクション数。</p></td>
   </tr>
   <tr>
     <td><p>アンロードされたコレクション数</p><p>（<code>zilliz.unloaded.collections.current</code>）</p></td>
     <td><p>ゲージ</p></td>
     <td><p>アンロードされたコレクション数。</p></td>
   </tr>
</table>

## Datadogで利用可能なタグ\{#tags-available-to-datadog}

Datadogは、特定のメトリクスに以下のタグを送信し、リソースをよりよく理解、整理、識別できるようにします。

<table>
   <tr>
     <th><p>タグ名</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>org_id</code></p></td>
     <td><p>メトリクスに関連付けられたZilliz Cloud組織のID。</p></td>
   </tr>
   <tr>
     <td><p><code>project_id</code></p></td>
     <td><p>メトリクスに関連付けられたZilliz CloudプロジェクトのID。</p></td>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>メトリクスに関連付けられたZilliz CloudクラスターのID。</p></td>
   </tr>
   <tr>
     <td><p><code>request_type</code></p></td>
     <td><p>監視されている操作のタイプ。使用可能な値：<code>insert</code>、<code>upsert</code>、<code>delete</code>、<code>bulk_insert</code>、<code>flush</code>、<code>search</code>、<code>query</code></p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>操作の結果。使用可能な値：<code>success</code>、<code>fail</code></p></td>
   </tr>
</table>