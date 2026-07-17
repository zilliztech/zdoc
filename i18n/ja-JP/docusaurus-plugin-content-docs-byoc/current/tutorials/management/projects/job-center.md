---
title: "プロジェクトジョブの管理 | BYOC"
slug: /job-center
sidebar_label: "プロジェクトジョブ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、同じプロジェクト内のすべての履歴データタスクと非同期データタスクを統合した、直感的な Jobs ページを提供します。 | BYOC"
type: origin
token: RY8ww0NDQi8yU9kNpjicHP7Gn4b
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# プロジェクトジョブの管理

Zilliz Cloud は、同じプロジェクト内のすべての履歴データタスクと非同期データタスクを統合した、直感的な Jobs ページを提供します。

## プロジェクトジョブの表示\{#view-project-jobs}

プロジェクトを選択します。左側のナビゲーションペインで **Jobs** を選択します。表示されたページでは、実行中または実行済みのすべての非同期ジョブの一覧を確認できます。

以下のジョブ情報が表示されます。

- Type と Description: ジョブの目的と情報。このページにはいくつかの種類のジョブがあります。

    <table>
       <tr>
         <th><p><strong>Type</strong></p></th>
         <th><p><strong>説明</strong></p></th>
       </tr>
       <tr>
         <td rowspan="3"><p><a href="./create-backup">Backup</a></p></td>
         <td><p>クラスターのバックアップファイルを作成する</p></td>
       </tr>
       <tr>
         <td><p>コレクションまたは指定した複数のコレクションのバックアップファイルを作成する</p></td>
       </tr>
       <tr>
         <td><p>バックアップを指定したクラウドリージョンにコピーする</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><a href="./restore-from-backup-files">Restore</a></p></td>
         <td><p>バックアップファイルからクラスターを復元する</p></td>
       </tr>
       <tr>
         <td><p>バックアップファイルからコレクションまたは複数のコレクションを復元する</p></td>
       </tr>
       <tr>
         <td><p><a href="./export-backup-files">Export Backup File</a></p></td>
         <td><p>バックアップファイルを指定したオブジェクトストレージサービスにエクスポートする</p></td>
       </tr>
       <tr>
         <td><p><a href="./zilliz-migration-prompts">Migration</a></p></td>
         <td><p>データをクラスターに移行します。</p><ul><li><p>Zilliz Cloud クラスター間移行:</p><ul><li><p>同一組織内でのクラスター間移行</p></li><li><p>組織をまたぐクラスター間の移行</p></li></ul></li></ul></td>
       </tr>
       <tr>
         <td><p><a href="./zilliz-import-prompts">Import</a></p></td>
         <td><p>コレクションにデータをインポートする</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-collections-console#create-a-collection">Clone Collection</a></p></td>
         <td><p>スキーマとデータの両方を含めてコレクションの完全なコピーを作成する</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-collections-console#create-a-collection">Create Sample Collection</a></p></td>
         <td><p>サンプルデータセットがロードされたコレクションを作成する</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-cluster#suspend">Suspend Cluster</a></p></td>
         <td><p>クラスターを手動で停止する</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-cluster#resume">Resume Cluster</a></p></td>
         <td><p>クラスターを手動で再開する</p></td>
       </tr>
       <tr>
         <td><p><a href="./plan-cluster-scaling">Scale Query CU</a></p></td>
         <td><p>クラスターのクエリ CU 数を増減する。</p></td>
       </tr>
       <tr>
         <td><p><a href="./plan-cluster-scaling">Scale Replica</a></p></td>
         <td><p>クラスターのレプリカ数を増減する。</p></td>
       </tr>
    </table>

- Status: ジョブのステータス。Successful、In Progress、Pending、Failed、Canceled のいずれかです。

- ID: データジョブの ID。データジョブに関する問題がある場合は、[サポートチケットを作成](http://support.zilliz.com) し、該当する Job ID を提供してください。

- Start Time と End Time

- Created By: データジョブを開始したユーザー。

## ジョブ詳細の表示\{#view-job-details}

ジョブの詳細を表示するには、**Actions** 列の **...** をクリックし、**View Details** を選択します。あるいは、[Describe Job](/reference/restful/describe-job-v2) API を使用して、プログラムから詳細を取得することもできます。

![view_job_details](https://zdoc-images.s3.us-west-2.amazonaws.com/viewjobdetails.png "view_job_details")

## ジョブのキャンセル\{#cancel-job}

現在、**Pending** または **In Progress** 状態にある以下の種類のジョブのみキャンセルできます。

- バックアップ作成ジョブ（他のクラウドリージョンへのバックアップコピーを除く）

- Migration ジョブ（ゼロダウンタイム移行を除く）

- バックアップファイルのエクスポートジョブ

<Admonition type="info" icon="📘" title="📘 Notes">

ジョブをキャンセルするには、**Organization Owner** または **Project Admin** である必要があります。

</Admonition>

![cancel_job](https://zdoc-images.s3.us-west-2.amazonaws.com/canceljob.png "cancel_job")

## 失敗したジョブの再試行\{#retry-failed-job}

<Admonition type="info" icon="📘" title="📘 Notes">

現在、再試行できるのは失敗したインポートジョブのみです。

失敗したジョブを再試行するには、**Organization Owner** または **Project Admin** である必要があります。

</Admonition>

失敗したインポートジョブについては、ステータスの横にある情報アイコンをクリックして理由を確認し、このジョブが失敗した原因を把握できます。

インポートに失敗したファイルを調整済みであれば、ジョブを再試行できます。

![retry_failed_job](https://zdoc-images.s3.us-west-2.amazonaws.com/retryfailedjob.png "retry_failed_job")

