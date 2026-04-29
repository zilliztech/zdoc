---
title: "プロジェクトジョブの管理 | BYOC"
slug: /job-center
sidebar_key: job-center
sidebar_label: "プロジェクトジョブ"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、同じプロジェクト内のすべての履歴データタスクと非同期データタスクを統合した直感的なジョブページを提供します。| BYOC"
type: origin
token: RY8ww0NDQi8yU9kNpjicHP7Gn4b
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - プロジェクトジョブ

---

import Admonition from '@theme/Admonition';


# プロジェクトジョブの管理

Zilliz Cloud は、同一プロジェクト内のすべての履歴および非同期データタスクを統合する直感的な ジョブ ページを提供します。

## プロジェクトジョブの表示\{#view-project-jobs}

プロジェクトを選択します。左側のナビゲーションペインで **ジョブ** を選択します。表示されたページでは、実行中または実行済みのすべての非同期ジョブの一覧を確認できます。

以下のジョブ情報が表示されます：

- タイプと説明：ジョブの目的と情報です。このページには特定の種類のジョブがあります。

    <table>
       <tr>
         <th><p><strong>Type</strong></p></th>
         <th><p><strong>Explanation</strong></p></th>
       </tr>
       <tr>
         <td rowspan="3"><p><a href="./create-snapshot">Backup</a></p></td>
         <td><p>クラスターのバックアップファイルを作成します</p></td>
       </tr>
       <tr>
         <td><p>コレクションまたは指定されたコレクションのバックアップファイルを作成します</p></td>
       </tr>
       <tr>
         <td><p>バックアップを指定されたクラウドリージョンにコピーします</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><a href="./restore-from-snapshot">Restore</a></p></td>
         <td><p>バックアップファイルからクラスターを復元します</p></td>
       </tr>
       <tr>
         <td><p>バックアップファイルから 1 つまたは複数のコレクションを復元します</p></td>
       </tr>
       <tr>
         <td><p><a href="./export-backup-files">Export Backup File</a></p></td>
         <td><p>バックアップファイルを指定されたオブジェクトストレージサービスにエクスポートします</p></td>
       </tr>
       <tr>
         <td><p><a href="./migrations">Migration</a></p></td>
         <td><p>データをクラスターに移行します。</p><ul><li><p>Zilliz Cloud クラスター間移行：</p><ul><li><p>同一組織内でのクラスター間移行</p></li><li><p>組織を跨ぐクラスター間の移行</p></li></ul></li></ul></td>
       </tr>
       <tr>
         <td><p><a href="./data-import">Import</a></p></td>
         <td><p>データをコレクションにインポートします</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-collections-console#create-a-collection">クローン Collection</a></p></td>
         <td><p>スキーマとデータの両方を含むコレクションの完全なコピーを作成します</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-collections-console#create-a-collection">Create Sample Collection</a></p></td>
         <td><p>サンプルデータセットを読み込んだコレクションを作成します</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-cluster#suspend">一時停止 Cluster</a></p></td>
         <td><p>クラスターを手動で一時停止します</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-cluster#resume">Resume Cluster</a></p></td>
         <td><p>クラスターを手動で再開します</p></td>
       </tr>
       <tr>
         <td><p><a href="./scale-query-cu">Scale Query CU</a></p></td>
         <td><p>クラスターのクエリ CU 数を増減します。</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-replica">Scale Replica</a></p></td>
         <td><p>クラスターのレプリカ数を増減します。</p></td>
       </tr>
    </table>

- ステータス：ジョブのステータスで、成功、進行中、Pending、Failed、Canceled のいずれかになります。

- ID：データジョブの ID です。データジョブに問題が発生した場合は、[サポートチケットを作成](http://support.zilliz.com) し、関連するジョブ ID を提供してください。

- 開始時間と終了時間

- 作成者：データジョブを開始したユーザー。

## ジョブ詳細の表示\{#view-job-details}

ジョブの詳細を表示するには、**Actions** 列の **...** をクリックし、**View Details** を選択します。あるいは、[Describe Job](/reference/restful/describe-job-v2) API を使用してプログラム的に詳細を取得することもできます。

![view_job_details](https://zdoc-images.s3.us-west-2.amazonaws.com/view_job_details.png "view_job_details")

## ジョブのキャンセル\{#cancel-job}

現在、以下の種類のジョブで、ステータスが **Pending** または **進行中** のもののみキャンセルできます：

- バックアップ作成ジョブ（他のクラウドリージョンへのバックアップコピーを除く）

- 移行ジョブ（ゼロダウンタイム移行を除く）

- バックアップファイルのエクスポートジョブ

<Admonition type="info" icon="📘" title="Notes">

<p>ジョブをキャンセルするには、<strong>組織オーナー</strong> または <strong>プロジェクト管理者</strong> である必要があります。</p>

</Admonition>

![cancel_job](https://zdoc-images.s3.us-west-2.amazonaws.com/cancel_job.png "cancel_job")

## 失敗したジョブの再試行\{#retry-failed-job}

<Admonition type="info" icon="📘" title="Notes">

<p>現在、失敗したインポートジョブのみ再試行できます。</p>
<p>失敗したジョブを再試行するには、<strong>組織オーナー</strong> または <strong>プロジェクト管理者</strong> である必要があります。</p>

</Admonition>

失敗したインポートジョブについては、ステータスの横にある情報アイコンをクリックし、失敗の原因を確認できます。

インポートに失敗したファイルに対して調整を行った場合、そのジョブを再試行できます。

![retry_failed_job](https://zdoc-images.s3.us-west-2.amazonaws.com/retry_failed_job.png "retry_failed_job")

