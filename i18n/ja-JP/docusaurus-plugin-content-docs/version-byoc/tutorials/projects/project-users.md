---
title: "プロジェクトユーザーの管理 | BYOC"
slug: /project-users
sidebar_label: "プロジェクトユーザー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、ユーザーをプロジェクトに招待し、その職務機能に基づいてロールを割り当てることができます。これらのロールは、ユーザーのプロジェクトへのアクセスと実行可能な操作を決定します。 | BYOC"
type: origin
token: PZ4uwwgUfio5OikY0Ecc5nrunFf
sidebar_position: 2
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - プロジェクトユーザー
  - 検索拡張生成
  - 大規模言語モデル
  - ベクトル化
  - k近傍アルゴリズム

---

import Admonition from '@theme/Admonition';


# プロジェクトユーザーの管理

Zilliz Cloudでは、ユーザーをプロジェクトに招待し、その職務機能に基づいてロールを割り当てることができます。これらのロールは、ユーザーのプロジェクトへのアクセスと実行可能な操作を決定します。

このトピックでは、プロジェクトユーザーの管理方法について説明します。

## プロジェクトにユーザーを招待\{#invite-a-user-to-a-project}

プロジェクトにユーザーを招待するには、**組織オーナー**または**プロジェクト管理者**である必要があります。

プロジェクトにユーザーを招待する際には、このプロジェクト内で特定の操作を実行するための権限を定義するロールをユーザーに付与する必要があります。

ユーザーを招待するには、招待したいユーザーのメールアドレスを入力します。次に、新規プロジェクトユーザーに付与したいプロジェクトロールを選択します。

### プロジェクトロール\{#project-roles}

Zilliz Cloudは3つのプロジェクトロールを提供します。これらのロールは変更または削除できません。

- **プロジェクト管理者**：プロジェクト管理者ロールは、プロジェクトとそのすべてのリソース（クラスター、データベース、コレクション）を管理するための完全な権限を持ちます。

    以下の表は、各プロジェクトロールに対応するUIおよびAPIの権限を一覧表示しています。

    <table>
       <tr>
         <th><p><strong>UI権限</strong></p></th>
         <th><p><strong>コントロールプレーンRESTful API (V2) 権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API (V2) 権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p><a href="./collection">コレクション</a>及び<a href="./manage-indexes">インデックス</a>の管理</p></li><li><p><a href="./project-users">プロジェクトユーザー</a>の管理</p></li><li><p><a href="./network-and-security">IPアクセスリスト及びプライベートリンク</a>の管理</p></li><li><p><a href="./manage-project-alerts">プロジェクトアラート</a>の管理</p></li><li><p><a href="./backup-and-restore">バックアップ</a>の管理</p></li><li><p>データ<a href="./migrations">移行</a>の管理</p></li><li><p><a href="./job-center">プロジェクトジョブ</a>の管理</p></li><li><p>統合の管理</p></li><li><p>すべての<a href="./cluster-roles#built-in-cluster-roles">クラスターアドミン</a>権限を含む</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p><a href="/reference/restful/cluster-operations-v2">すべてのクラスター操作</a></p></li><li><p><a href="/reference/restful/import-operations-v2">すべてのインポート操作</a></p></li><li><p><a href="/reference/restful/backup-and-restore-v2">すべてのバックアップおよびリストア操作</a></p></li><li><p><a href="/reference/restful/cloud-migration-v2">すべてのクラウド移行操作</a></p></li><li><p><a href="/reference/restful/cloud-job-v2">すべてのクラウドジョブ操作</a></p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべてのコレクション操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべてのベクトル操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li><li><p><a href="/reference/restful/role-operations-v2">すべてのロール操作</a></p></li><li><p><a href="/reference/restful/user-operations-v2">すべてのユーザー操作</a></p></li></ul></td>
       </tr>
    </table>

- **プロジェクト読込・書込**：プロジェクト読込・書込ロールは、プロジェクトを表示し、そのリソース（クラスター、データベース、コレクション）を管理する権限を持ちます。

    以下の表は、各プロジェクトロールに対応するUIおよびAPIの権限を一覧表示しています。

    <table>
       <tr>
         <th><p><strong>UI権限</strong></p></th>
         <th><p><strong>コントロールプレーンRESTful API (V2) 権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API (V2) 権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p><a href="./collection">コレクション</a>及び<a href="./manage-indexes">インデックス</a>の管理</p></li><li><p><a href="null">バックアップ</a>の表示（ただし、バックアップファイルの作成または復元は不可）</p></li><li><p><a href="./job-center">プロジェクトジョブ</a>の表示（ただし、ジョブのキャンセルまたは失敗ジョブの再試行は不可）</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p>一部のクラスター操作</p><ul><li><p><a href="/reference/restful/list-projects-v2">プロジェクト一覧</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">クラスター一覧</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">クラスターの説明</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">クラスターメトリクスの照会</a></p></li><li><p><a href="/docs/prometheus-monitoring">メトリクスのエクスポート</a></p></li></ul></li><li><p><a href="/reference/restful/import-operations-v2">すべてのインポート操作</a></p></li><li><p>一部のバックアップおよびリストア操作</p><ul><li><p><a href="/reference/restful/list-backups-v2">バックアップ一覧</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">バックアップの説明</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">バックアップポリシーの取得</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">すべてのクラウドジョブ操作</a></p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべてのコレクション操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべてのベクトル操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li></ul></td>
       </tr>
    </table>

- **プロジェクト読取専用**：プロジェクト読取専用ロールは、プロジェクトとそのリソース（クラスター、データベース、コレクション）を表示する権限を持ちます。

    以下の表は、各プロジェクトロールに対応するUIおよびAPIの権限を一覧表示しています。

    <table>
       <tr>
         <th><p><strong>UI権限</strong></p></th>
         <th><p><strong>コントロールプレーンRESTful API (V2) 権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API (V2) 権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p><a href="./collection">コレクション</a>及び<a href="./manage-indexes">インデックス</a>の表示のみ</p></li><li><p><a href="null">バックアップ</a>の表示（ただし、バックアップファイルの作成または復元は不可）</p></li><li><p><a href="./job-center">プロジェクトジョブ</a>の表示（ただし、ジョブのキャンセルまたは失敗ジョブの再試行は不可）</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p>一部のクラスター操作</p><ul><li><p><a href="/reference/restful/list-projects-v2">プロジェクト一覧</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">クラスター一覧</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">クラスターの説明</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">クラスターメトリクスの照会</a></p></li><li><p><a href="/docs/prometheus-monitoring">メトリクスのエクスポート</a></p></li></ul></li><li><p>一部のインポート操作</p><ul><li><p><a href="/reference/restful/get-import-job-progress-v2">インポートジョブ進行状況の取得</a></p></li><li><p><a href="/reference/restful/list-import-jobs-v2">インポートジョブ一覧</a></p></li></ul></li><li><p>一部のバックアップおよびリストア操作</p><ul><li><p><a href="/reference/restful/list-backups-v2">バックアップ一覧</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">バックアップの説明</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">バックアップポリシーの取得</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">すべてのクラウドジョブ操作</a></p></li></ul></td>
         <td><ul><li><p>一部のコレクション操作</p><ul><li><p><a href="/reference/restful/describe-collection-v2">コレクションの説明</a></p></li><li><p><a href="/reference/restful/get-collection-load-state-v2">コレクション読み込み状態の取得</a></p></li><li><p><a href="/reference/restful/get-collection-stats-v2">コレクション統計の取得</a></p></li><li><p><a href="/reference/restful/has-collection-v2">コレクションの存在確認</a></p></li><li><p><a href="/reference/restful/list-collections-v2">コレクション一覧</a></p></li></ul></li><li><p>一部のインデックス操作</p><ul><li><p><a href="/reference/restful/describe-index-v2">インデックスの説明</a></p></li><li><p><a href="/reference/restful/list-indexes-v2">インデックス一覧</a></p></li></ul></li><li><p>一部のパーティション操作</p><ul><li><p><a href="/reference/restful/get-partition-statistics-v2">パーティション統計の取得</a></p></li><li><p><a href="/reference/restful/has-partition-v2">パーティションの存在確認</a></p></li><li><p><a href="/reference/restful/list-partitions-v2">パーティション一覧</a></p></li></ul></li><li><p>一部のエイリアス操作</p><ul><li><p><a href="/reference/restful/describe-alias-v2">エイリアスの説明</a></p></li><li><p><a href="/reference/restful/list-aliases-v2">エイリアス一覧</a></p></li></ul></li></ul></td>
       </tr>
    </table>

招待されたユーザーはメールで招待状を受け取り、48時間以内にプロジェクトに参加するために承諾する必要があります。または、Webコンソールから招待リンクをコピーして招待されたユーザーと共有することもできます。

ユーザーがプロジェクトに参加すると、このユーザーは自動的にプロジェクトに所属する組織の組織メンバーになります。

<Admonition type="info" icon="📘" title="注意">

<p>一度に1人または複数の同じロールを持つユーザーをプロジェクトに招待できます。</p>

</Admonition>

![invite-user-to-project](/img/invite-user-to-project.png)

## 招待の取り消しまたは再送\{#revoke-or-resend-an-invitation}

同じ組織内の既存の組織メンバーをプロジェクトに招待すると、別途招待状を受け取ることなくプロジェクトへのアクセス権を自動的に取得します。ただし、既に所属していない組織内のプロジェクトに誰かを招待する場合、指定されたプロジェクトへのアクセス権も付与される組織への参加招待が届きます。

招待の取り消しまたは再送を行うには、**組織オーナー**または**プロジェクト管理者**である必要があります。

<Admonition type="info" icon="📘" title="注意">

<p>ユーザーが招待を承諾する前に招待を取り消すまたは再送信できます。</p>

</Admonition>

![byoc-revoke-or-cancel-invitation-to-project](/img/byoc-revoke-or-cancel-invitation-to-project.png)

## 協力者のロールを編集または協力者を削除\{#edit-a-collaborators-role-or-remove-a-collaborator}

ユーザーが招待を承諾すると、ユーザーはプロジェクトの協力者になります。

協力者のロールを編集またはプロジェクト協力者を削除するには、**組織オーナー**または**プロジェクト管理者**である必要があります。

![byoc-edit-user-role-or-remove-project-user](/img/byoc-edit-user-role-or-remove-project-user.png)

## プロジェクトを退出\{#leave-a-project}

プロジェクトから協力者を削除する他に、自身を退出させることもできます。

プロジェクトの唯一の管理者である場合、各プロジェクトには常に少なくとも1人のプロジェクト管理者が必要であるため退出できません。

<Admonition type="caution" icon="🚧" title="警告">

<p>一度プロジェクトを退出すると、プロジェクトおよび関連リソースへのアクセス権が失われます。</p>

</Admonition>

![byoc-leave-project](/img/byoc-leave-project.png)