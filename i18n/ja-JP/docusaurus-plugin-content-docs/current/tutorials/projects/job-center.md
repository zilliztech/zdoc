---
title: "プロジェクトの仕事を管理する | Cloud"
slug: /job-center
sidebar_label: "Project Jobs"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、同じプロジェクト内のすべての履歴および非同期データタスクを統合する直感的なジョブページを提供しています。 | Cloud"
type: origin
token: RY8ww0NDQi8yU9kNpjicHP7Gn4b
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - project jobs
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database

---

import Admonition from '@theme/Admonition';


# プロジェクトの仕事を管理する

Zilliz Cloudは、同じプロジェクト内のすべての履歴および非同期データタスクを統合する直感的なジョブページを提供しています。

## プロジェクトの仕事を見る{#view-project-jobs}

プロジェクトを選択します。左側のナビゲーションウィンドウで、**ジョブ**を選択します。表示されたページには、実行中または実行されたすべての非同期ジョブのリストが表示されます。

次の求人情報が表示されます。

- 説明と種類:データジョブの目的と情報。このページには特定の種類のジョブがあります。

    <table>
       <tr>
         <th><p><strong>タイプ</strong></p></th>
         <th><p><strong>の説明</strong></p></th>
       </tr>
       <tr>
         <td rowspan="2"><p>バックアップ</p></td>
         <td><p>クラスタのバックアップファイルを作成する</p></td>
       </tr>
       <tr>
         <td><p>コレクションのバックアップファイルを作成する</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p>復元する</p></td>
         <td><p>バックアップファイルからクラスタを復元する</p></td>
       </tr>
       <tr>
         <td><p>バックアップファイルからコレクションを復元する</p></td>
       </tr>
       <tr>
         <td><p>バックアップファイルをエクスポート</p></td>
         <td><p>指定されたオブジェクトストレージサービスにバックアップファイルをエクスポートします</p></td>
       </tr>
       <tr>
         <td><p>マイグレーション</p></td>
         <td><p>クラスタにデータを移行します。</p><ul><li><p>外部データの移行: </p><ul><li><p>Milvusより</p></li><li><p>Pineconeから</p></li><li><p>Qdrantより</p></li><li><p>Elasticsearchから</p></li><li><p>Open Searchから</p></li><li><p>Postgre SQLから</p></li><li><p>テンセントCloud VectorDB</p></li></ul></li><li><p>Zilliz Cloudのクラスタ間移行:</p><ul><li><p>同じ組織内でのクラスタ間の移行</p></li><li><p>組織間のクラスタ間の移行</p></li></ul></li></ul></td>
       </tr>
       <tr>
         <td><p>インポート</p></td>
         <td><p>コレクションにデータをインポートする</p></td>
       </tr>
       <tr>
         <td><p>クローンコレクションName</p></td>
         <td><p>スキーマとデータの両方を含むコレクションの完全なコピーを作成してください</p></td>
       </tr>
       <tr>
         <td><p>サンプルコレクションの作成</p></td>
         <td><p>サンプルデータセットをロードしたコレクションを作成してください</p></td>
       </tr>
    </table>

- ステータス:成功、進行中、保留中、失敗、キャンセルのジョブステータス。

- ID:データジョブのIDです。データジョブに関するトラブルがある場合は、[サポートチケットを作成する](http://support.zilliz.com)と関連するジョブIDを入力してください。

- 開始時間と終了時間

- 作成者:データジョブを開始したユーザー。

## 仕事の詳細を見る{#view-job-details}

ジョブの詳細を表示するには、**をクリックします。。。「アクション」列で「詳細を表示」を選択してください。または、[仕事の説明](/reference/restful/describe-job-v2) APIを使用してプログラムから詳細を取得することもできます。

![view_job_details](/img/view_job_details.png)

## 仕事をキャンセル{#cancel-job}

現在、**保留中**または**進行中**の状態にある次の種類のジョブのみをキャンセルできます。

- バックアップジョブ

- 移行ジョブ（ゼロダウンタイム移行を除く）

- バックアップファイルジョブのエクスポート

<Admonition type="info" icon="📘" title="ノート">

<p>仕事をキャンセルするには、<strong>組織オーナー</strong>または<strong>プロジェクト管理者</strong>である必要があります。</p>

</Admonition>

![cancel_job](/img/cancel_job.png)

## 失敗したジョブを再試行{#retry-failed-job}

<Admonition type="info" icon="📘" title="ノート">

<p>現在、失敗したインポートジョブのみを再試行できます。</p>
<p>失敗したジョブを再試行するには、<strong>組織オーナー</strong>または<strong>プロジェクト管理者</strong>である必要があります。</p>

</Admonition>

インポートジョブが失敗した場合、ステータスの横にある情報アイコンをクリックして、このジョブが失敗した理由を確認できます。

インポートに失敗したファイルを調整した場合は、ジョブを再試行できます。

![retry_failed_job](/img/retry_failed_job.png)

