---
title: "組織のユーザーを管理する | Cloud"
slug: /organization-users
sidebar_label: "組織のユーザーを管理する"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、組織は通常、企業を表します。従業員を組織に招待し、彼らの職務に基づいて役割を割り当てることができます。これらの役割は、ユーザーが特定のリソースにアクセスし、実行できる操作を決定します。たとえば、開発者は一般的にデータへのアクセスが必要ですが、請求特権は必要ありません。 | Cloud"
type: origin
token: RUHMwCnJYiWEmekM1QrcTfVvnae
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - organizations
  - users
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG

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

- **組織オーナー**:組織オーナーは、Zilliz Cloudの最上位の役割であり、組織とそのすべてのリソース（プロジェクト、クラスター、データベース、コレクション）を管理するための完全な権限を持っています。この役割は、組織内の限られたまたは制御された数のユーザーにのみ付与する必要があります。

    次の表に、この組織ロールの対応するUI権限とAPI権限を示します。

    <table>
       <tr>
         <th><p><strong>UIの権限</strong></p></th>
         <th><p><strong>コントロールプレーンのRESTful API（V 2）権限</strong></p></th>
         <th><p><strong>データプレーンのRESTful API（V 2）権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>組織内のすべてのプロジェクトを管理する</p></li><li><p>支払い<a href="./payment-billing">と請求を管理する</a></p></li><li><p>API<a href="./manage-api-keys">キーの管理</a></p></li><li><p>組織<a href="./organization-users">のユーザーを管理する</a></p></li><li><p>アラート<a href="./metrics-and-alerts">の管理</a></p></li><li><p>表示<a href="./view-activities">アクティビティ</a></p></li><li><p>組織<a href="./organization-settings">の設定を管理する</a></p></li><li><p>使用する<a href="./use-recycle-bin">ごみ箱</a></p></li><li><p>さらに、<a href="./cluster-roles">プロジェクト管理者</a>と<a href="./cluster-roles">クラスター管理者</a>の役割のすべての特権があります</p></li></ul></td>
         <td><p><a href="/ja-JP/reference/restful/control-plane-v2">すべてのコントロールプレーンの操作</a></p></td>
         <td><p><a href="/ja-JP/reference/restful/data-plane-v2">すべてのデータプレーン操作</a></p></td>
       </tr>
    </table>

- **Organization Billing Admin**: Organization Billing Adminは、組織内の請求を管理する権限を持つロールです。このロールには、組織内の他のデータに対する権限はありません。

    次の表に、この組織ロールの対応するUI権限とAPI権限を示します。

    <table>
       <tr>
         <th><p><strong>UIの権限</strong></p></th>
         <th><p><strong>コントロールプレーンのRESTful API（V 2）権限</strong></p></th>
         <th><p><strong>データプレーンのRESTful API（V 2）権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>支払い<a href="./payment-billing">と請求を管理する</a></p></li><li><p>API<a href="./manage-api-keys">キーの表示</a></p></li><li><p>組織<a href="./organization-users">のユーザーを招待する</a></p></li><li><p>組織の<a href="./organization-settings">設定を表示する</a></p></li></ul></td>
         <td><ul><li><p><a href="/ja-JP/reference/restful/list-invoices-v2">請求書リストを見る</a></p></li><li><p><a href="/ja-JP/reference/restful/describe-invoice-v2">請求書を見る</a></p></li><li><p><a href="/ja-JP/reference/restful/query-daily-usage-v2">毎日の使用を見る</a></p></li></ul></td>
         <td><p>データプランの権限は、プロジェクトとクラスターの役割によって決定されます。ただし、請求管理者は通常、データプレーンの権限を必要としません。</p></td>
       </tr>
    </table>

- **組織メンバー**:組織メンバーは、組織とそのリソースを表示する権限を持つロールです。組織メンバーのプロジェクトおよびクラスターレベルの権限は、このユーザーのプロジェクトおよびクラスターのロールに依存します。

    次の表に、この組織ロールの対応するUI権限とAPI権限を示します。

    <table>
       <tr>
         <th><p><strong>UIの権限</strong></p></th>
         <th><p><strong>コントロールプレーンのRESTful API（V 2）権限</strong></p></th>
         <th><p><strong>データプレーンのRESTful API（V 2）権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>API<a href="./manage-api-keys">キーの表示</a></p></li><li><p>組織<a href="./organization-users">のユーザーを招待する</a></p></li><li><p>組織の<a href="./organization-settings">設定を表示する</a></p></li></ul></td>
         <td><ul><li><p><a href="/ja-JP/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p>クラスタ操作の一部</p><ul><li><p><a href="/ja-JP/reference/restful/list-projects-v2">リストプロジェクト</a></p></li><li><p><a href="/ja-JP/reference/restful/list-clusters-v2">リストクラスタ</a></p></li><li><p><a href="/ja-JP/reference/restful/describe-cluster-v2">クラスタの説明</a></p></li><li><p><a href="/ja-JP/reference/restful/query-cluster-metrics-v2">クエリクラスタのメトリクス</a></p></li><li><p><a href="./prometheus-monitoring">メトリックのエクスポート</a></p></li></ul></li><li><p>インポート業務の一部</p><ul><li><p><a href="/ja-JP/reference/restful/get-import-job-progress-v2">仕事の進捗をインポートする</a></p></li><li><p><a href="/ja-JP/reference/restful/list-import-jobs-v2">インポートジョブ一覧</a></p></li></ul></li><li><p>バックアップと復元の操作の一部</p><ul><li><p><a href="/ja-JP/reference/restful/list-backups-v2">リストバックアップ</a></p></li><li><p><a href="/ja-JP/reference/restful/describe-backup-v2">バックアップの説明</a></p></li><li><p><a href="/ja-JP/reference/restful/get-backup-policy-v2">バックアップポリシーを取得</a></p></li></ul></li><li><p><a href="/ja-JP/reference/restful/cloud-job-v2">クラウドジョブのすべての操作</a></p></li></ul></td>
         <td><p>データプランの権限は、<a href="./project-users">プロジェクト</a>と<a href="./cluster-roles">クラスター</a>の役割によって決定されます</p></td>
       </tr>
    </table>

なお、**組織メンバー**または**組織請求管理者**の場合、招待されたユーザーにのみ**組織メンバー**の役割を付与できます。

招待された人たちは、組織に参加するために48時間以内に受け入れる必要がある招待状をメールで受け取ります。

<Admonition type="info" icon="📘" title="ノート">

<p>毎回、同じ役割を持つ1人以上のユーザーを組織に招待することができます。各組織は最大100人のユーザーを持つことができます。</p>

</Admonition>

![invite-user-to-org](/img/invite-user-to-org.png)

## 招待を取り消すか再送信する{#revoke-or-resend-an-invitation}

ユーザーを組織に招待した後、Zilliz Cloudはユーザーに招待メールを送信します。ユーザーが承諾する前に、招待を取り消したり、再送信したりすることができます。

![revoke-or-resend-org-invitation](/img/revoke-or-resend-org-invitation.png)

## 組織のユーザーの役割を編集する{#edit-the-role-of-an-organization-user}

ユーザーが招待を受け入れて組織に参加すると、必要に応じて役割を調整できます。

Organizationユーザのロールを編集するには、**Organizationオーナー**である必要があります。

![edit-user-role-or-remove-org-user](/img/edit-user-role-or-remove-org-user.png)

## 組織のユーザーを削除する{#remove-an-organization-user}

ユーザーが組織に所属しなくなった場合は、そのユーザーを削除できます。

Organizationユーザーを削除するには、**Organizationオーナー**である必要があります。

![edit-user-role-or-remove-org-user](/img/edit-user-role-or-remove-org-user.png)

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

