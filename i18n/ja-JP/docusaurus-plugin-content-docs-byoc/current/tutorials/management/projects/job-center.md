---
title: "プロジェクトジョブを管理する | BYOC"
slug: /job-center
sidebar_label: "プロジェクトジョブ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、同じプロジェクト内のすべての過去のデータタスクおよび非同期データタスクを統合した、直感的な Jobs ページを提供します。 | BYOC"
type: origin
token: RY8ww0NDQi8yU9kNpjicHP7Gn4b
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# プロジェクトジョブを管理する

Zilliz Cloud は、同じプロジェクト内のすべての過去のデータタスクおよび非同期データタスクを統合した、直感的な Jobs ページを提供します。

## プロジェクトジョブを表示する\{#view-project-jobs}

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
         <td><p>クラスターのバックアップファイルを作成します</p></td>
       </tr>
       <tr>
         <td><p>コレクションまたは指定した複数のコレクションのバックアップファイルを作成します</p></td>
       </tr>
       <tr>
         <td><p>指定したクラウドリージョンにバックアップをコピーします</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><a href="./restore-from-backup-files">Restore</a></p></td>
         <td><p>バックアップファイルからクラスターを復元します</p></td>
       </tr>
       <tr>
         <td><p>バックアップファイルからコレクションまたは複数のコレクションを復元します</p></td>
       </tr>
       <tr>
         <td><p><a href="./export-backup-files">Export Backup File</a></p></td>
         <td><p>バックアップファイルを指定したオブジェクトストレージサービスにエクスポートします</p></td>
       </tr>
       <tr>
         <td><p><a href="./zilliz-migration-prompts">Migration</a></p></td>
         <td><p>データをクラスターに移行します。</p><ul><li><p>Zilliz Cloud クラスター間移行:</p><ul><li><p>同じ組織内でのクラスター間移行</p></li><li><p>組織をまたぐクラスター間の移行</p></li></ul></li></ul></td>
       </tr>
       <tr>
         <td><p><a href="./zilliz-import-prompts">Import</a></p></td>
         <td><p>データをコレクションにインポートします</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-collections-console">Clone Collection</a></p></td>
         <td><p>スキーマとデータの両方を含むコレクションの完全なコピーを作成します</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-collections-console">Create Sample Collection</a></p></td>
         <td><p>サンプルデータセットがロードされたコレクションを作成します</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-cluster">Suspend Cluster</a></p></td>
         <td><p>クラスターを手動で一時停止します</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-cluster">Resume Cluster</a></p></td>
         <td><p>クラスターを手動で再開します</p></td>
       </tr>
       <tr>
         <td><p><a href="./plan-cluster-scaling">Scale Query CU</a></p></td>
         <td><p>クラスターの Query CU 数を増減します。</p></td>
       </tr>
       <tr>
         <td><p><a href="./plan-cluster-scaling">Scale Replica</a></p></td>
         <td><p>クラスターのレプリカ数を増減します。</p></td>
       </tr>
    </table>

- Status: ジョブのステータス。Successful、In Progress、Pending、Failed、Canceled のいずれかです。

- ID: データジョブの ID。データジョブに関する問題が発生した場合は、[サポートチケットを作成](http://support.zilliz.com) し、関連する Job ID を提供してください。

- Start Time と End Time

- Created By: データジョブを開始したユーザー。

## ジョブの詳細を表示する\{#view-job-details}

ジョブの詳細を表示するには、**Actions** 列の **...** をクリックしてから **View Details** を選択します。あるいは、[Describe Job](/reference/restful/describe-job-v2) API を使用してプログラムから詳細を取得することもできます。

![view_job_details](https://zdoc-images.s3.us-west-2.amazonaws.com/view_job_details.png "view_job_details")

## ジョブをキャンセルする\{#cancel-job}

現在、**Pending** または **In Progress** 状態にある次の種類のジョブのみキャンセルできます。

- バックアップ作成ジョブ（他のクラウドリージョンへのバックアップコピーを除く）

- Migration ジョブ（ゼロダウンタイム移行を除く）

- バックアップファイルのエクスポートジョブ

<Admonition type="info" icon="📘" title="📘 Notes">

ジョブをキャンセルするには、**Organization Owner** または **Project Admin** である必要があります。

</Admonition>

![cancel_job](https://zdoc-images.s3.us-west-2.amazonaws.com/cancel_job.png "cancel_job")

## 失敗したジョブを再試行する\{#retry-failed-job}

<Admonition type="info" icon="📘" title="📘 Notes">

現在、再試行できるのは失敗したインポートジョブのみです。

失敗したジョブを再試行するには、**Organization Owner** または **Project Admin** である必要があります。

</Admonition>

失敗したインポートジョブについては、そのステータスの横にある情報アイコンをクリックして理由を確認し、このジョブが失敗した原因を把握できます。

インポートに失敗したファイルに対して調整を行った場合は、ジョブを再試行できます。

![retry_failed_job](https://zdoc-images.s3.us-west-2.amazonaws.com/retry_failed_job.png "retry_failed_job")

