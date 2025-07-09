---
title: "組織のユーザーを管理する | BYOC"
slug: /organization-users
sidebar_label: "Organization Users"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、組織は通常、企業を表します。従業員を組織に招待し、彼らの職務に基づいて役割を割り当てることができます。これらの役割は、ユーザーが特定のリソースにアクセスし、実行できる操作を決定します。たとえば、開発者は一般的にデータへのアクセスが必要ですが、請求特権は必要ありません。 | BYOC"
type: origin
token: OzLjwMmWliJdEBkz0gPcVZrqnZb
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - organizations
  - users
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model

---

import Admonition from '@theme/Admonition';


# 組織のユーザーを管理する

Zilliz Cloudでは、組織は通常、企業を表します。従業員を組織に招待し、彼らの職務に基づいて役割を割り当てることができます。これらの役割は、ユーザーが特定のリソースにアクセスし、実行できる操作を決定します。たとえば、開発者は一般的にデータへのアクセスが必要ですが、請求特権は必要ありません。 

このガイドでは、Organizationへのユーザーの招待、招待の取り消しや再送信、Organizationユーザーのロールの変更、Organizationユーザーの削除など、Organizationユーザーの管理方法について説明します。

## 組織にユーザーを招待する{#invite-a-user-to-your-organization}

組織にユーザーを招待する場合、リソースへのアクセスと、その組織内で特定の操作を実行する権限を定義する役割をユーザーに付与する必要があります。 

ユーザーを招待するには、招待したいユーザーのメールアドレスを入力してください。そして、新しい組織のユーザーに付与したい組織の役割を選択してください。 

### 組織の役割{#organization-roles}

Zilliz Cloudには3つの組織ロールがあります。これらのロールは変更や削除ができません。

- 組織オーナー:組織オーナーは、Zilliz Cloudの最上位の役割であり、組織とそのすべてのリソース(プロジェクト、クラスター、データベース、コレクション)を管理するための完全な権限を持っています。この役割は、組織内の限られたまたは制御された数のユーザーにのみ付与する必要があります。

    次の表に、この組織ロールの対応するUI権限とAPI権限を示します。

    <table>
       <tr>
         <th><p><strong>UIの権限</strong></p></th>
         <th><p><strong>コントロールプレーンのRESTful API（V 2）権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API(V 2)権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>組織内のすべてのプロジェクトを管理する</p></li><li><p>リンクの管理_PLACEHOLDER_0</p><p></include></p></li><li><p>リンクの管理_PLACEHOLDER_0</p></li><li><p>リンクの管理_PLACEHOLDER_0</p></li><li><p>リンクの管理_PLACEHOLDER_0</p></li><li><p>リンクを見る_PLACEHOLDER_0</p></li><li><p>リンクの管理_PLACEHOLDER_0</p></li><li><p><a href="./use-recycle-bin">ごみ箱</a>を使用</p></li><li><p><a href="./project-users#project-roles">プロジェクト管理者</a>および<a href="./cluster-roles#built-in-cluster-roles">クラスタ管理</a>ロールのすべての権限を追加します</p></li></ul></td>
         <td><p><a href="/reference/restful/control-plane-v2">すべてのコントロールプレーンの操作</a></p></td>
         <td><p><a href="/reference/restful/data-plane-v2">すべてのデータプレーン操作</a></p></td>
       </tr>
    </table>

- 組織請求管理者:組織請求管理者は、組織内の請求を管理する権限を持つ役割です。この役割には、組織内の他のデータに対する権限はありません。

    次の表に、この組織ロールの対応するUI権限とAPI権限を示します。

    <table>
       <tr>
         <th><p><strong>UIの権限</strong></p></th>
         <th><p><strong>コントロールプレーンのRESTful API（V 2）権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API(V 2)権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>リンクの管理_PLACEHOLDER_0</p><p></include></p></li><li><p>リンクを見る_PLACEHOLDER_0</p></li><li><p>リンクを招待_PLACEHOLDER_0</p></li><li><p>リンクを見る_PLACEHOLDER_0</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/list-invoices-v2">リスト請求書</a></p></li><li><p><a href="/reference/restful/describe-invoice-v2">請求書の説明</a></p><p></include></p></li><li><p><a href="/reference/restful/query-daily-usage-v2">クエリの毎日の使用</a></p></li></ul></td>
         <td><p>データプランの権限は、プロジェクトとクラスターの役割によって決定されます。ただし、請求管理者は通常、データプレーンの権限を必要としません。</p></td>
       </tr>
    </table>

- 組織メンバー:組織メンバーは、組織とそのリソースを表示する権限を持つ役割です。組織メンバーのプロジェクトおよびクラスターレベルの権限は、このユーザーのプロジェクトおよびクラスターの役割に依存します。

    次の表に、この組織ロールの対応するUI権限とAPI権限を示します。

    <table>
       <tr>
         <th><p><strong>UIの権限</strong></p></th>
         <th><p><strong>コントロールプレーンのRESTful API（V 2）権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API(V 2)権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>リンクを見る_PLACEHOLDER_0</p></li><li><p>リンクを招待_PLACEHOLDER_0</p></li><li><p>リンクを見る_PLACEHOLDER_0</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p>クラスタ操作の一部</p><ul><li><p><a href="/reference/restful/list-projects-v2">リストプロジェクト</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">リストクラスタ</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">クラスタの説明</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">クエリクラスタのメトリクス</a></p></li><li><p><a href="/docs/prometheus-monitoring">メトリックのエクスポート</a></p></li></ul></li><li><p>インポート業務の一部</p><ul><li><p><a href="/reference/restful/get-import-job-progress-v2">仕事の進捗をインポートする</a></p></li><li><p><a href="/reference/restful/list-import-jobs-v2">インポートジョブ一覧 </a></p></li></ul></li><li><p>バックアップと復元の操作の一部</p><ul><li><p><a href="/reference/restful/list-backups-v2">リストバックアップ</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">バックアップの説明</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">バックアップポリシーを取得</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">クラウドジョブのすべての操作</a></p></li></ul></td>
         <td><p>データプランの権限は、<a href="./project-users#project-roles">プロジェクト</a>と<a href="./cluster-roles">クラスタ</a>の役割によって決定されます。</p></td>
       </tr>
    </table>

**組織メンバー**または**組織の請求管理者**である場合、招待者には**組織メンバー**の役割のみを付与できることに注意してください。

招待された人たちは、組織に参加するために48時間以内に受け入れる必要がある招待状をメールで受け取ります。 

<Admonition type="info" icon="📘" title="ノート">

<p>毎回、同じ役割を持つ1人以上のユーザーを組織に招待することができます。各組織は最大100人のユーザーを持つことができます。</p>

</Admonition>

![invite-user-to-org](/img/invite-user-to-org.png)

</exclude>

![invite-user-to-org-byoc](/img/invite-user-to-org-byoc.png)

</include>

## 招待を取り消すか再送信する{#revoke-or-resend-an-invitation}

ユーザーを組織に招待した後、Zilliz Cloudはユーザーに招待メールを送信します。ユーザーが承諾する前に、招待を取り消したり、再送信したりすることができます。

![revoke-or-resend-org-invitation](/img/revoke-or-resend-org-invitation.png)

</exclude>

![revoke-or-resend-org-invitation-byoc](/img/revoke-or-resend-org-invitation-byoc.png)

</include>

## 組織のユーザーの役割を編集する{#edit-the-role-of-an-organization-user}

ユーザーが招待を受け入れて組織に参加すると、必要に応じて役割を調整できます。

組織のユーザーの役割を編集するには、**組織のオーナー**である必要があります。

![edit-user-role-or-remove-org-user](/img/edit-user-role-or-remove-org-user.png)

</exclude>

![edit-user-role-or-remove-org-user-byoc](/img/edit-user-role-or-remove-org-user-byoc.png)

</include>

## 組織のユーザーを削除する{#remove-an-organization-user}

ユーザーが組織に所属しなくなった場合は、そのユーザーを削除できます。

組織のユーザーを削除するには、**組織のオーナー**である必要があります。

![edit-user-role-or-remove-org-user](/img/edit-user-role-or-remove-org-user.png)

</exclude>

![edit-user-role-or-remove-org-user-byoc](/img/edit-user-role-or-remove-org-user-byoc.png)

</include>

## 組織を離れる{#leave-an-organization}

組織に所属しなくなった場合、その組織を離れることができます。

各組織には少なくとも1人の組織オーナーが必要です。組織の唯一のオーナーである場合、その組織を離れることはできません。

<Admonition type="caution" icon="🚧" title="警告">

<p>組織を退会すると、組織と関連するリソースにアクセスできなくなります。</p>

</Admonition>

以下のいずれかの方法で組織を脱退することができます。

- 組織一覧ページで組織を削除してください:

    ![leave-organization](/img/leave-organization.png)

- 組織を入力し、**組織メンバー**ページに残してください:

    ![leave-organization](/img/leave-organization.png)

</exclude>

![leave-organization-byoc](/img/leave-organization-byoc.png)

</include>