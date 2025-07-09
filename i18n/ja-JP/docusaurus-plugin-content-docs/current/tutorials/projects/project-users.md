---
title: "プロジェクトのユーザーを管理する | Cloud"
slug: /project-users
sidebar_label: "Project Users"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、ユーザーをプロジェクトに招待し、彼らの職務に基づいて役割を割り当てることができます。これらの役割は、ユーザーがプロジェクトにアクセスし、実行できる操作を決定します。 | Cloud"
type: origin
token: PZ4uwwgUfio5OikY0Ecc5nrunFf
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - project users
  - Image Search
  - LLMs
  - Machine Learning
  - RAG

---

import Admonition from '@theme/Admonition';


# プロジェクトのユーザーを管理する

Zilliz Cloudでは、ユーザーをプロジェクトに招待し、彼らの職務に基づいて役割を割り当てることができます。これらの役割は、ユーザーがプロジェクトにアクセスし、実行できる操作を決定します。

このトピックでは、プロジェクトユーザーを管理する方法について説明します。

## ユーザーをプロジェクトに招待する{#invite-a-user-to-a-project}

ユーザーをプロジェクトに招待するには、**組織オーナー**または**プロジェクト管理者**である必要があります。

プロジェクトにユーザーを招待する場合、このプロジェクト内で特定の操作を実行する権限を定義する役割をユーザーに付与する必要があります。 

ユーザーを招待するには、招待したいユーザーのメールアドレスを入力してください。そして、新しいプロジェクトユーザーに付与したいプロジェクトの役割を選択してください。 

### プロジェクトの役割{#project-roles}

Zilliz Cloudには3つのプロジェクトロールがあります。これらのロールは変更または削除できません。

- **プロジェクト管理者**:プロジェクト管理者の役割には、プロジェクトとそのすべてのリソース（クラスター、データベース、コレクション）を管理するための完全な権限があります。

    次の表に、各プロジェクトロールの対応するUIおよびAPI権限を示します。

    <table>
       <tr>
         <th><p><strong>UIの権限</strong></p></th>
         <th><p><strong>コントロールプレーンのRESTful API（V 2）権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API(V 2)権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>プロジェクト内の<a href="./cluster">クラスター</a>と<a href="./pipelines">パイプライン</a>を管理する</p><p></include></p></li><li><p><a href="./collection">コレクション</a>と<a href="./manage-indexes">インデックス</a>の管理</p></li><li><p>リンクの管理_PLACEHOLDER_0</p></li><li><p>リンクの管理_PLACEHOLDER_0</p></li><li><p>リンクの管理_PLACEHOLDER_0</p></li><li><p>リンクの管理_PLACEHOLDER_0</p></li><li><p>データの管理<a href="./migrations">マイグレーション</a></p></li><li><p>リンクの管理_PLACEHOLDER_0</p></li><li><p>インテグレーションの管理</p></li><li><p>すべての<a href="./cluster-roles#built-in-cluster-roles">クラスタ管理</a>権限に加えて </p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p><a href="/reference/restful/cluster-operations-v2">すべてのクラスタ操作</a></p></li><li><p><a href="/reference/restful/import-operations-v2">すべてのインポート操作</a></p></li><li><p><a href="/reference/restful/backup-and-restore-v2">すべてのバックアップと復元操作</a></p></li><li><p><a href="/reference/restful/cloud-migration-v2">すべてのクラウド移行操作</a></p></li><li><p><a href="/reference/restful/cloud-job-v2">クラウドジョブのすべての操作</a></p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべての収集操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべてのベクトル演算</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li><li><p><a href="/reference/restful/role-operations-v2">すべてのロール操作</a></p></li><li><p><a href="/reference/restful/user-operations-v2">すべてのユーザー操作</a></p></li></ul></td>
       </tr>
    </table>

- **プロジェクトの読み書き**e:プロジェクトの読み書きの役割には、プロジェクトを表示し、そのリソース(クラスター、データベース、コレクション)を管理する権限があります。

    次の表に、各プロジェクトロールの対応するUIおよびAPI権限を示します。

    <table>
       <tr>
         <th><p><strong>UIの権限</strong></p></th>
         <th><p><strong>コントロールプレーンのRESTful API（V 2）権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API(V 2)権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>プロジェクト内の<a href="./cluster">クラスター</a>と<a href="./pipelines">パイプライン</a>を表示し、作成および管理できません。</p><p></include></p></li><li><p><a href="./collection">コレクション</a>と<a href="./manage-indexes">インデックス</a>の管理</p></li><li><p><a href="null">バックアップ</a>を表示しますが、バックアップファイルから作成または復元できません</p></li><li><p><a href="./job-center">プロジェクトJobs</a>を表示しますが、ジョブのキャンセルや失敗したジョブの再試行はできません</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p>クラスタ操作の一部</p><ul><li><p><a href="/reference/restful/list-projects-v2">リストプロジェクト</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">リストクラスタ</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">クラスタの説明</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">クエリクラスタのメトリクス</a></p></li><li><p><a href="/docs/prometheus-monitoring">メトリックのエクスポート</a></p></li></ul></li><li><p><a href="/reference/restful/import-operations-v2">すべてのインポート操作</a></p></li><li><p>バックアップと復元の操作の一部</p><ul><li><p><a href="/reference/restful/list-backups-v2">リストバックアップ</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">バックアップの説明</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">バックアップポリシーを取得</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">クラウドジョブのすべての操作</a></p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべての収集操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべてのベクトル演算</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li></ul></td>
       </tr>
    </table>

- **プロジェクト読み取り専用**:プロジェクト読み取り専用ロールには、プロジェクトとそのリソース(クラスター、データベース、コレクション)を表示する権限があります。

    次の表に、各プロジェクトロールの対応するUIおよびAPI権限を示します。

    <table>
       <tr>
         <th><p><strong>UIの権限</strong></p></th>
         <th><p><strong>コントロールプレーンのRESTful API（V 2）権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API(V 2)権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>プロジェクト内の<a href="./cluster">クラスター</a>と<a href="./pipelines">パイプライン</a>を表示し、作成および管理できません。</p><p></include></p></li><li><p><a href="./collection">コレクション</a>と<a href="./manage-indexes">インデックス</a>のみを表示</p></li><li><p><a href="null">バックアップ</a>を表示しますが、バックアップファイルから作成または復元できません</p></li><li><p><a href="./job-center">プロジェクトJobs</a>を表示しますが、ジョブのキャンセルや失敗したジョブの再試行はできません</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p>クラスタ操作の一部</p><ul><li><p><a href="/reference/restful/list-projects-v2">リストプロジェクト</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">リストクラスタ</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">クラスタの説明</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">クエリクラスタのメトリクス</a></p></li><li><p><a href="/docs/prometheus-monitoring">メトリックのエクスポート</a></p></li></ul></li><li><p>インポート業務の一部</p><ul><li><p><a href="/reference/restful/get-import-job-progress-v2">仕事の進捗をインポートする</a></p></li><li><p><a href="/reference/restful/list-import-jobs-v2">インポートジョブ一覧 </a></p></li></ul></li><li><p>バックアップと復元の操作の一部</p><ul><li><p><a href="/reference/restful/list-backups-v2">リストバックアップ</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">バックアップの説明</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">バックアップポリシーを取得</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">クラウドジョブのすべての操作</a></p></li></ul></td>
         <td><ul><li><p>一部の収集業務</p><ul><li><p><a href="/reference/restful/describe-collection-v2">コレクションを説明する</a></p></li><li><p><a href="/reference/restful/get-collection-load-state-v2">コレクションの負荷状態を取得する</a></p></li><li><p><a href="/reference/restful/get-collection-stats-v2">コレクションの統計を取得する</a></p></li><li><p><a href="/reference/restful/has-collection-v2">HASコレクション</a></p></li><li><p><a href="/reference/restful/list-collections-v2">リストコレクション</a></p></li></ul></li><li><p>インデックス操作の一部</p><ul><li><p><a href="/reference/restful/describe-index-v2">インデックスの説明</a></p></li><li><p><a href="/reference/restful/list-indexes-v2">リストインデックス</a></p></li></ul></li><li><p>パーティション操作の一部</p><ul><li><p><a href="/reference/restful/get-partition-statistics-v2">パーティションの統計情報を取得する</a></p></li><li><p><a href="/reference/restful/has-partition-v2">パーティションがあります</a></p></li><li><p><a href="/reference/restful/list-partitions-v2">リストパーティション</a></p></li></ul></li><li><p>エイリアス操作の一部</p><ul><li><p><a href="/reference/restful/describe-alias-v2">エイリアスの説明</a></p></li><li><p><a href="/reference/restful/list-aliases-v2">リストエイリアス</a></p></li></ul></li></ul></td>
       </tr>
    </table>

招待された人たちは、プロジェクトに参加するために48時間以内に受け入れる必要がある招待状をメールで受け取ります。 

ユーザーがプロジェクトに参加すると、そのユーザーはプロジェクトが所属する組織のメンバーに自動的になります。

<Admonition type="info" icon="📘" title="ノート">

<p>毎回、同じ役割を持つ1人以上のユーザーをプロジェクトに招待できます。</p>

</Admonition>

![invite-user-to-project](/img/invite-user-to-project.png)

</exclude>

![byoc-invite-user-to-project](/img/byoc-invite-user-to-project.png)

</include>

## 招待を取り消すか再送信する{#revoke-or-resend-an-invitation}

同じ組織内のプロジェクトに既存の組織メンバーを招待すると、個別の招待状を受け取ることなく自動的にプロジェクトにアクセスできます。ただし、既に所属していない組織内のプロジェクトに誰かを招待すると、その人は組織に参加する招待状を受け取り、指定されたプロジェクトにもアクセスできます。

招待を取り消すか再送信するには、**組織オーナー**または**プロジェクト管理者**である必要があります。

<Admonition type="info" icon="📘" title="ノート">

<p>ユーザーが承諾する前に招待を取り消したり、再送信したりすることができます。</p>

</Admonition>

![revoke-or-cancel-invitation-to-project](/img/revoke-or-cancel-invitation-to-project.png)

</exclude>

![byoc-revoke-or-cancel-invitation-to-project](/img/byoc-revoke-or-cancel-invitation-to-project.png)

</include>

## コラボレーターの役割を編集するか、コラボレーターを削除する{#edit-a-collaborators-role-or-remove-a-collaborator}

ユーザーが招待を承諾すると、ユーザーはプロジェクトの共同作業者になります。

コラボレーターの役割を編集したり、プロジェクトコラボレーターを削除するには、**組織オーナー**または**プロジェクト管理者**である必要があります。

![edit-user-role-or-remove-project-user](/img/edit-user-role-or-remove-project-user.png)

</exclude>

![byoc-edit-user-role-or-remove-project-user](/img/byoc-edit-user-role-or-remove-project-user.png)

</include>

## プロジェクトを終了する{#leave-a-project}

プロジェクトからコラボレーターを削除することに加えて、そのコラボレーターを離れることで自分自身を削除することもできます。

プロジェクトの唯一の管理者である場合、各プロジェクトには常に少なくとも1人のプロジェクト管理者が必要であるため、そのプロジェクトを離れることはできません。

<Admonition type="caution" icon="🚧" title="警告">

<p>プロジェクトを終了すると、プロジェクトと関連リソースへのアクセスが取り消されます。</p>

</Admonition>

![leave-project](/img/leave-project.png)

</exclude>

![byoc-leave-project](/img/byoc-leave-project.png)

</include>

