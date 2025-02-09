---
title: "Datadogとの統合 | Cloud"
slug: /integrate-with-datadog
sidebar_label: "Datadogとの統合"
beta: PRIVATE
notebook: FALSE
description: "Datadogは、アプリケーションのパフォーマンス、インフラストラクチャ、ログ管理に関するリアルタイムの洞察を提供するクラウドモニタリングおよび分析プラットフォームです。Zilliz CloudとDatadogを統合することで、Zilliz Cloudクラスターに関するメトリックデータをDatadogダッシュボードに送信できます。 | Cloud"
type: origin
token: K7YDwvt60iLXG9k0jV1cGzpbn7k
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - third-party
  - services
  - datadog
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus

---

import Admonition from '@theme/Admonition';


# Datadogとの統合

[Datadog](https://www.datadoghq.com/)は、アプリケーションのパフォーマンス、インフラストラクチャ、ログ管理に関するリアルタイムの洞察を提供するクラウドモニタリングおよび分析プラットフォームです。Zilliz CloudとDatadogを統合することで、Zilliz Cloudクラスターに関するメトリックデータをDatadogダッシュボードに送信できます。

<Admonition type="info" icon="📘" title="ノート">

<p><a href="https://www.datadoghq.com/">Datadog</a>の統合は、<strong>Dedicated-Enterprise</strong>プランを実行しているZilliz Cloudクラスターでのみ利用できます。プランレベルをアップグレードするには、<a href="./manage-cluster">クラスタ管理</a>を参照してください。</p>

</Admonition>

## 始める前に{#before-you-start}{#before-you-start}

- Datadogと統合するには、**Organization Owner**また**はプロジェクト管理者**がプロジェクトにアクセスできる必要があります。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

- DatadogアカウントとDatadog APIキーが必要です。APIキーへのアクセス方法については、[APIとApplication Keys](https://docs.datadoghq.com/account_management/api-app-keys/#application-keys)を参照してください。

## 手続き{#procedure}{#procedure}

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. プロジェクトページの左側のナビゲーションウィンドウで、[**統合**]をクリックします。

1. [**Datadog**]セクションを見つけ、その横にある[**+構成**]をクリックします。

1. 表示されるダイアログボックスで、Datadogをプロジェクトにリンクし、クラスタを割り当ててメトリックデータを収集します。

    1. [**Datadog統合**の構成]ステップで、Datadogの設定を構成します。

        1. [**構成名**]に、統合の名前を入力します(例:`DG_configuration`)。

        1. [**Datadog API Key**]にDatadog APIキーを入力します。

        1. [**Datadogサイト**]で、Datadogサイトを選択します。Zilliz Cloudは、以下のDatadogサイトをサポートしています。

            <table>
               <tr>
                 <th><p>サイト</p></th>
                 <th><p>サイトのURL</p></th>
                 <th><p>サイトパラメータ</p></th>
                 <th><p>ロケーション</p></th>
               </tr>
               <tr>
                 <td><p><code>US1</code></p></td>
                 <td><p><code>https://app.datadoghq.com</code></p></td>
                 <td><p><code>datadoghq.com</code></p></td>
                 <td><p>US</p></td>
               </tr>
               <tr>
                 <td><p><code>US3</code></p></td>
                 <td><p><code>https://us3.datadoghq.com</code></p></td>
                 <td><p><code>us3.datadoghq.com</code></p></td>
                 <td><p>US</p></td>
               </tr>
               <tr>
                 <td><p><code>US5</code></p></td>
                 <td><p><code>https://us5.datadoghq.com</code></p></td>
                 <td><p><code>us5.datadoghq.com</code></p></td>
                 <td><p>US</p></td>
               </tr>
               <tr>
                 <td><p><code>EU1</code></p></td>
                 <td><p><code>https://app.datadoghq.eu</code></p></td>
                 <td><p><code>datadoghq.eu</code></p></td>
                 <td><p>EU（ドイツ）</p></td>
               </tr>
               <tr>
                 <td><p><code>AP1</code></p></td>
                 <td><p><code>https://ap1.datadoghq.com</code></p></td>
                 <td><p><code>ap1.datadoghq.com</code></p></td>
                 <td><p>日本</p></td>
               </tr>
            </table>

            Datadogサイトの詳細については、[Datadogサイトにアクセス](https://docs.datadoghq.com/getting_started/site/#access-the-datadog-site)するを参照してください。

        1. [**Test Integration**]をクリックして、Zilliz CloudとDatadogの接続を確認します。テストが成功した場合は、クラスターの割り当てに進みます。

    1. [**Assign Configuration to Zilliz Cloud Cluster(s)**]ステップで、メトリックデータをDatadogにプッシュするクラスタを1つ以上選択します。

        <Admonition type="info" icon="📘" title="ノート">

        <p>選択できるのは、<strong>Dedicated-Enterprise</strong>プランレベルのクラスターのみです。</p>

        </Admonition>

    1. [**作成**]をクリックします。

![integrate-with-datadog-1](/img/ja-JP/integrate-with-datadog-1.png)

## インテグレーションの進捗をモニターする{#monitor-integration-progress}{#monitor-integration-progress}

セットアップが完了したら、**インテグレーション**ページに戻り、Datadogインテグレーションが提供された設定の詳細とともにリストされていることを確認します。ステータスが**Active**に変更された場合、インテグレーションは成功です。Zilliz Cloudは、データを1分単位でDatadogにプッシュし、ほぼリアルタイムで更新します。

インテグレーションの横にある外部リンクアイコンをクリックすると、関連するDatadogダッシュボードを開き、選択したZilliz Cloudクラスターからプッシュされたクラスターメトリクスを表示できます。

![integrate-with-datadog-2](/img/ja-JP/integrate-with-datadog-2.png)

## インテグレーションの管理{#manage-integrations}{#manage-integrations}

Datadogインテグレーションを管理するには、[**アクション**]列を使用します。

- **編集**:必要に応じて監視クラスタを更新するか、統合設定を変更します。

- **削除**:必要がなくなった場合は、統合を削除します。

![integrate-with-datadog-3](/img/ja-JP/integrate-with-datadog-3.png)

## Datadogで利用可能なパフォーマンスメトリクス{#performance-metrics-available-to-datadog}{#datadogperformance-metrics-available-to-datadog}

[Datadog](https://www.datadoghq.com/)は、Zilliz Cloudクラスターの以下のメトリックデータを追跡します。括弧内のメトリック名は、Datadog UIで使用される名前です。

### リソース{#resource}{#resource}

<table>
   <tr>
     <th><p>メトリック名</p></th>
     <th><p>メートルタイプ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>CUコンピュテーション</p><p>(.<code>zilliz.cluster.cu. current</code>)</p></td>
     <td><p>ゲージ</p></td>
     <td><p>CUの総容量に対する使用容量の尺度。0から1までの範囲。</p></td>
   </tr>
   <tr>
     <td><p>CUの容量</p><p>(<code>zilliz.cluster.cu. current</code>)</p></td>
     <td><p>ゲージ</p></td>
     <td><p>CUの総計算能力に対する利用された計算能力の尺度。0から1までの範囲。</p></td>
   </tr>
   <tr>
     <td><p>ストレージ</p><p>(.<code>zilliz.cluster.storage. current</code>)</p></td>
     <td><p>ゲージ</p></td>
     <td><p>データとインデックスによって消費される永続ストレージの合計金額。</p></td>
   </tr>
</table>

### パフォーマンス{#performance}{#performance}

<table>
   <tr>
     <th><p>メトリック名</p></th>
     <th><p>メートルタイプ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>クラスタ書き込み性能Capacity</p><p>(zilliz. cluster.<code>write.performance</code>.current)ファイル</p></td>
     <td><p>ゲージ</p></td>
     <td><p>現在の書き込み操作の速度を、書き込み速度の制限に対して相対的に測定したものです。範囲は0から1までです。</p></td>
   </tr>
   <tr>
     <td><p>クエリー数が遅い</p><p>(<code>zilliz.request.slow.queries.total</code>)</p></td>
     <td><p>数える</p></td>
     <td><p>遅いクエリ要求の総数。</p></td>
   </tr>
   <tr>
     <td><p>QPS、要求の失敗率、フラッシュ操作の回数</p><p>(<code>zilliz.requests.total</code>)</p></td>
     <td><p>数える</p></td>
     <td><p>処理されたリクエストの総数。</p></td>
   </tr>
   <tr>
     <td><p>VPS</p><p>(<code>zilliz.request.vectors.total</code>)</p></td>
     <td><p>数える</p></td>
     <td><p>すべての要求で操作されたベクトルの総数。</p></td>
   </tr>
   <tr>
     <td><p>レイテンシ</p><p>(zilliz. request<code>.latency</code>.miliseconds.<code>p 99</code>)を表示</p></td>
     <td><p>ゲージ</p></td>
     <td><p>処理された要求の平均/P 99待機時間。</p></td>
   </tr>
</table>

### データ{#data}{#data}

<table>
   <tr>
     <th><p>メトリック名</p></th>
     <th><p>メートルタイプ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>エンティティカウント</p><p>(<code>zilliz</code>ファイル)</p></td>
     <td><p>ゲージ</p></td>
     <td><p>エンティティの数。</p></td>
   </tr>
   <tr>
     <td><p>ロードされたエンティティ</p><p>(<code>zilliz</code>ファイル)</p></td>
     <td><p>ゲージ</p></td>
     <td><p>読み込まれたエンティティの数。</p></td>
   </tr>
   <tr>
     <td><p>コレクション数</p><p>(<code>zilliz</code>コレクション)</p></td>
     <td><p>ゲージ</p></td>
     <td><p>コレクションの数。</p></td>
   </tr>
   <tr>
     <td><p>アンロードされたコレクション数</p><p>ダウンロード(<code>zilliz.</code>unloaded.)</p></td>
     <td><p>ゲージ</p></td>
     <td><p>アンロードされたコレクションの数。</p></td>
   </tr>
</table>

## Datadogで利用可能なタグ{#tags-available-to-datadog}{#datadogtags-available-to-datadog}

Datadogは、リソースをよりよく理解し、整理し、特定するために、特定のメトリックに対して次のタグを送信します。

<table>
   <tr>
     <th><p>タグ名</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p><code>org_id</code></p></td>
     <td><p>メトリックに関連付けられたZilliz Cloud組織のID。</p></td>
   </tr>
   <tr>
     <td><p><code>project_id</code></p></td>
     <td><p>メトリックに関連付けられたZilliz CloudプロジェクトのID。</p></td>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>メトリックに関連付けられたZilliz CloudクラスタのID。</p></td>
   </tr>
   <tr>
     <td><p><code>request_type</code></p></td>
     <td><p>監視されている操作の種類です。可能な値は、<code>挿入</code>、<code>挿入</code>、<code>削除</code>、<code>バルク_挿入</code>、<code>フラッシュ</code>、<code>検索</code>、<code>クエリです。</code></p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>オペレーションの結果。可能な値:<code>成功</code>、<code>失敗</code></p></td>
   </tr>
</table>
