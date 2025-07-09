---
title: "Datadogとの統合 | Cloud"
slug: /integrate-with-datadog
sidebar_label: "Datadog"
beta: FALSE
notebook: FALSE
description: "Datadogは、アプリケーションのパフォーマンス、インフラストラクチャ、ログ管理に関するリアルタイムの洞察を提供するクラウドモニタリングおよび分析プラットフォームです。Zilliz CloudをDatadogと統合することで、Zilliz Cloudクラスターに関するメトリックデータをDatadogダッシュボードに送信できます。 | Cloud"
type: origin
token: JGFQwMcVmiikeOkhepGcQ8Ken0e
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - third-party
  - services
  - datadog
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial

---

import Admonition from '@theme/Admonition';


# Datadogとの統合

[Datadog](https://www.datadoghq.com/)は、アプリケーションのパフォーマンス、インフラストラクチャ、ログ管理に関するリアルタイムの洞察を提供するクラウドモニタリングおよび分析プラットフォームです。Zilliz CloudをDatadogと統合することで、Zilliz Cloudクラスターに関するメトリックデータをDatadogダッシュボードに送信できます。

<Admonition type="info" icon="📘" title="ノート">

<p><a href="https://www.datadoghq.com/">Datadog</a>の統合は、<strong>Dedicated-Enterprise</strong>プランを実行しているZilliz Cloudクラスターでのみ利用可能です。プランレベルをアップグレードするには、<a href="./manage-cluster">クラスタ管理</a>を参照してください。</p>

</Admonition>

## 始める前に{#before-you-start}

- Datadogと統合するには、プロジェクトへの**Organization Owner**または**Project Admin**アクセス権が必要です。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

- DatadogアカウントとDatadog APIキーが必要です。APIキーへのアクセス方法については、[APIキーとアプリケーションキー](https://docs.datadoghq.com/account_management/api-app-keys/#application-keys)を参照してください。

## 手続き{#procedure}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインしてください。

1. プロジェクトページの左側のナビゲーションペインで、**統合**をクリックしてください。

1. 「Datadog」セクションを見つけ、その横にある「+構成」をクリックしてください。

1. 表示されるダイアログボックスで、Datadogをプロジェクトにリンクし、クラスタを割り当ててメトリックデータを収集します。

    1. **Datadogインテグレーションの構成**ステップで、Datadogの設定を構成します。

        1. **構成名**に、統合の名前を入力してください(例: `DG_configuration`)。

        1. **Datadog APIキー**に、Datadog APIキーを入力してください。

        1. **Datadogサイト**で、Datadogサイトを選択してください。Zilliz Cloudは以下のDatadogサイトをサポートしています:

            <table>
               <tr>
                 <th><p>サイト</p></th>
                 <th><p>サイトのURL</p></th>
                 <th><p>サイトパラメータ</p></th>
                 <th><p>ロケーション</p></th>
               </tr>
               <tr>
                 <td><p>インラインコードプレースホルダー0</p></td>
                 <td><p>インラインコードプレースホルダー0</p></td>
                 <td><p>インラインコードプレースホルダー0</p></td>
                 <td><p>US</p></td>
               </tr>
               <tr>
                 <td><p>インラインコードプレースホルダー0</p></td>
                 <td><p>インラインコードプレースホルダー0</p></td>
                 <td><p>インラインコードプレースホルダー0</p></td>
                 <td><p>US</p></td>
               </tr>
               <tr>
                 <td><p>インラインコードプレースホルダー0</p></td>
                 <td><p>インラインコードプレースホルダー0</p></td>
                 <td><p>インラインコードプレースホルダー0</p></td>
                 <td><p>US</p></td>
               </tr>
               <tr>
                 <td><p>インラインコードプレースホルダー0</p></td>
                 <td><p>インラインコードプレースホルダー0</p></td>
                 <td><p>インラインコードプレースホルダー0</p></td>
                 <td><p>EU（ドイツ）</p></td>
               </tr>
               <tr>
                 <td><p>インラインコードプレースホルダー0</p></td>
                 <td><p>インラインコードプレースホルダー0</p></td>
                 <td><p>インラインコードプレースホルダー0</p></td>
                 <td><p>日本</p></td>
               </tr>
            </table>

            Datadogサイトの詳細については、[Datadogサイトにアクセス](https://docs.datadoghq.com/getting_started/site/#access-the-datadog-site)を参照してください。 

        1. Zilliz CloudとDatadogの接続を確認するには、**テスト統合**をクリックしてください。テストが成功した場合は、クラスターの割り当てに進んでください。

    1. 「Zilliz Cloudクラスターに構成を割り当てる」ステップで、メトリックデータをDatadogにプッシュするクラスターを1つ以上選択してください。

        <Admonition type="info" icon="📘" title="ノート">

        <p>選択できるのは、<strong>Dedicated-Enterprise</strong>プランレベルのクラスターのみです。</p>

        </Admonition>

    1. 「作成」をクリックしてください。

![integrate-with-datadog-1](/img/integrate-with-datadog-1.png)

## インテグレーションの進捗をモニターする{#monitor-integration-progress}

セットアップが完了したら、**インテグレーション**ページに戻り、Datadogインテグレーションが提供された構成の詳細とともにリストされていることを確認してください。ステータスが**アクティブ**に変わった場合、インテグレーションは成功しています。Zilliz Cloudは、データを1分単位でDatadogにプッシュし、ほぼリアルタイムで更新します。

インテグレーションの横にある外部リンクアイコンをクリックすると、関連するDatadogダッシュボードを開き、選択したZilliz Cloudクラスターからプッシュされたクラスターメトリクスを表示できます。

![integrate-with-datadog-2](/img/integrate-with-datadog-2.png)

## インテグレーションの管理{#manage-integrations}

Datadogの統合を管理するには、**Actions**列を使用してください。

- **編集**:必要に応じて監視クラスタを更新するか、統合設定を変更してください。

- **削除**:必要がなくなった場合は、統合を削除してください。

![integrate-with-datadog-3](/img/integrate-with-datadog-3.png)

## Datadogで利用可能なパフォーマンスメトリクス{#performance-metrics-available-to-datadog}

[Datadog](https://www.datadoghq.com/)は、Zilliz Cloudクラスターの以下のメトリックデータを追跡します。括弧内のメトリック名は、Datadog UIで使用される名前です。

### リソース{#resource}

<table>
   <tr>
     <th><p>メトリック名</p></th>
     <th><p>メートルタイプ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>CUコンピュテーション</p><p>(インラインコードプレースホルダー0)</p></td>
     <td><p>ゲージ</p></td>
     <td><p>CUの総容量に対する使用容量の尺度。0から1までの範囲。</p></td>
   </tr>
   <tr>
     <td><p>CUの容量</p><p>(インラインコードプレースホルダー0)</p></td>
     <td><p>ゲージ</p></td>
     <td><p>CUの総計算能力に対する利用された計算能力の尺度。0から1までの範囲。</p></td>
   </tr>
   <tr>
     <td><p>ストレージ</p><p>(インラインコードプレースホルダー0)</p></td>
     <td><p>ゲージ</p></td>
     <td><p>データとインデックスによって消費される永続ストレージの合計金額。</p></td>
   </tr>
</table>

### パフォーマンス{#performance}

<table>
   <tr>
     <th><p>メトリック名</p></th>
     <th><p>メートルタイプ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>クラスタ書き込み性能Capacity</p><p>(インラインコードプレースホルダー0)</p></td>
     <td><p>ゲージ</p></td>
     <td><p>現在の書き込み操作の速度を、書き込み速度の制限に対して相対的に測定したものです。範囲は0から1までです。</p></td>
   </tr>
   <tr>
     <td><p>クエリー数が遅い</p><p>(インラインコードプレースホルダー0)</p></td>
     <td><p>数える</p></td>
     <td><p>遅いクエリ要求の総数。</p></td>
   </tr>
   <tr>
     <td><p>QPS、要求の失敗率、フラッシュ操作の回数</p><p>(インラインコードプレースホルダー0)</p></td>
     <td><p>数える</p></td>
     <td><p>処理されたリクエストの総数。</p></td>
   </tr>
   <tr>
     <td><p>VPS</p><p>(インラインコードプレースホルダー0)</p></td>
     <td><p>数える</p></td>
     <td><p>すべての要求で操作されたベクトルの総数。</p></td>
   </tr>
   <tr>
     <td><p>レイテンシ</p><p>(インラインコードプレースホルダー0,インラインコードプレースホルダー1)</p></td>
     <td><p>ゲージ</p></td>
     <td><p>処理された要求の平均/P 99待機時間。</p></td>
   </tr>
</table>

### データ{#data}

<table>
   <tr>
     <th><p>メトリック名</p></th>
     <th><p>メートルタイプ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>エンティティカウント</p><p>(インラインコードプレースホルダー0)</p></td>
     <td><p>ゲージ</p></td>
     <td><p>エンティティの数。</p></td>
   </tr>
   <tr>
     <td><p>ロードされたエンティティ</p><p>(インラインコードプレースホルダー0)</p></td>
     <td><p>ゲージ</p></td>
     <td><p>読み込まれたエンティティの数。</p></td>
   </tr>
   <tr>
     <td><p>コレクション数</p><p>(インラインコードプレースホルダー0)</p></td>
     <td><p>ゲージ</p></td>
     <td><p>コレクションの数。</p></td>
   </tr>
   <tr>
     <td><p>アンロードされたコレクション数</p><p>(インラインコードプレースホルダー0)</p></td>
     <td><p>ゲージ</p></td>
     <td><p>アンロードされたコレクションの数。</p></td>
   </tr>
</table>

## Datadogで利用可能なタグ{#tags-available-to-datadog}

Datadogは、リソースをよりよく理解し、整理し、特定するために、特定のメトリックに対して次のタグを送信します。

<table>
   <tr>
     <th><p>タグ名</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>メトリックに関連付けられたZilliz Cloud組織のID。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>メトリックに関連付けられたZilliz CloudプロジェクトのID。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>メトリックに関連付けられたZilliz CloudクラスタのID。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>監視されている操作の種類。可能な値: <code>insert</code>,<code>upsert</code>,<code>delete</code>,<code>bulk_insert</code>,<code>flush</code>,<code>search</code>,<code>query</code></p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>操作の結果。可能な値: <code>success</code>、<code>fail</code></p></td>
   </tr>
</table>
