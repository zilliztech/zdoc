---
title: "プロジェクトの仕事を管理する | Cloud"
slug: /job-center
sidebar_label: "プロジェクトの仕事を管理する"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、同じプロジェクト内のすべての履歴および非同期データタスクを統合する直感的なジョブページを提供しています。 | Cloud"
type: origin
token: KjXpwYrYAiq4mqktAI1cKq2anIe
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - project jobs
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense vector

---

import Admonition from '@theme/Admonition';


# プロジェクトの仕事を管理する

Zilliz Cloudは、同じプロジェクト内のすべての履歴および非同期データタスクを統合する直感的なジョブページを提供しています。

## プロジェクトの仕事を見る{#view-project-jobs}

プロジェクトを選択します。左ナビゲーションウィンドウで、[**ジョブ**]を選択します。表示されたページには、実行中または実行済みのすべての非同期ジョブのリストが表示されます。

次の求人情報が表示されます。

- 説明と種類:データジョブの目的と情報。このページには特定の種類のジョブがあります。

    <table>
       <tr>
         <th><p><strong>タイプ</strong></p></th>
         <th><p><strong>説明する</strong></p></th>
       </tr>
       <tr>
         <td rowspan="2"><p>バックアップ</p></td>
         <td><p>クラスターのバックアップファイルを作成します。</p></td>
       </tr>
       <tr>
         <td><p>コレクションのバックアップファイルを作成します。</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p>復元する</p></td>
         <td><p>バックアップファイルからクラスタを復元します。</p></td>
       </tr>
       <tr>
         <td><p>バックアップファイルからコレクションを復元します。</p></td>
       </tr>
       <tr>
         <td><p>マイグレーション</p></td>
         <td><p>クラスタにデータを移行します。</p><ul><li><p>外部データの移行:</p><ul><li><p>Elasticsearchから</p></li><li><p>Milvusより</p></li></ul></li><li><p>クラスタ間の移行:</p><ul><li><p>サーバーレスまたは専用クラスターから新しい専用クラスターへ</p></li><li><p>専用クラスタから既存の専用クラスタへ</p></li></ul></li></ul></td>
       </tr>
       <tr>
         <td><p>インポート</p></td>
         <td><p>コレクションにデータをインポートします。</p></td>
       </tr>
       <tr>
         <td><p>クローンコレクションName</p></td>
         <td><p>スキーマとデータの両方を含むコレクションの完全なコピーを作成します。</p></td>
       </tr>
    </table>

- ステータス:成功、進行中、保留中、失敗、キャンセルのジョブステータス。

- ID:データジョブのIDです。データジョブに関する問題がある場合は、[サポートチケットを作成](http://support.zilliz.com)し、関連するジョブIDを提供してください。

- 開始時間と終了時間

- 作成者:データジョブを開始したユーザー。

## 仕事の詳細を見る{#view-project-jobs}

ジョブの詳細を表示するには、をクリックします**。。。**[**アクション**]列で[**詳細表示**]を選択します。または、[Describe Job](/ja-JP/reference/restful/describe-job-v2)APIを使用してプログラムで詳細を取得することもできます。

![view_job_details](/img/view_job_details.png)

## 仕事をキャンセル{#cancel-job}

「**保留中**」または「**進行中**」のジョブをキャンセルできます**。。。**[**アクション**]列で[**キャンセル**]を選択します。

<Admonition type="info" icon="📘" title="ノート">

<p>現在、キャンセルできるのは移行ジョブとバックアップジョブのみです。</p>
<p>ジョブをキャンセルするには、<strong>組織オーナー</strong>または<strong>プロジェクト管理者</strong>である必要があります。</p>

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

