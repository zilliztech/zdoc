---
title: "組織ユーザーの管理 | BYOC"
slug: /organization-users
sidebar_label: "組織ユーザー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、組織は通常会社を表します。従業員を組織に招待し、その職務に応じてロールを割り当てることができます。これらのロールは、ユーザーが特定のリソースへアクセスできるか、および実行できる操作を決定します。たとえば、開発者は通常データへのアクセスが必要ですが、請求権限は不要です。 | BYOC"
type: origin
token: OzLjwMmWliJdEBkz0gPcVZrqnZb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 組織ユーザーの管理

Zilliz Cloud では、組織は通常会社を表します。従業員を組織に招待し、その職務に応じてロールを割り当てることができます。これらのロールは、ユーザーが特定のリソースへアクセスできるか、および実行できる操作を決定します。たとえば、開発者は通常データへのアクセスが必要ですが、請求権限は不要です。 

このガイドでは、組織へのユーザー招待、招待の取り消しや再送、組織ユーザーのロール変更、組織ユーザーの削除など、組織ユーザーの管理方法について説明します。

## 組織にユーザーを招待する\{#invite-a-user-to-your-organization}

組織にユーザーを招待する際には、組織内のリソースへのアクセスと特定の操作を実行する権限を定義するロールを割り当てる必要があります。 

ユーザーを招待するには、招待したいユーザーのメールアドレスを入力します。次に、新しい組織ユーザーに付与したい組織ロールを選択します。 

### Organization Owner\{#organization-owner}

Organization Owner は Zilliz Cloud における最上位ロールであり、組織とそのすべてのリソース（プロジェクト、クラスター、データベース、コレクション）を管理する完全な権限を持ちます。このロールは、組織内の限られたユーザーにのみ付与する必要があります。

次の表は、この組織ロールに対応する UI 権限と API 権限を示しています。

<table>
   <tr>
     <th><p><strong>UI 権限</strong></p></th>
     <th><p><strong>Control Plane RESTful API (V2) 権限</strong></p></th>
     <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p>組織内のすべてのプロジェクトを管理する</p></li><li><p><a href="./manage-api-keys">API キー</a>を管理する</p></li><li><p><a href="./organization-users">組織ユーザー</a>を管理する</p></li><li><p><a href="./metrics-alerts-reference">アラート</a>を管理する</p></li><li><p><a href="./view-activities">アクティビティ</a>を表示する</p></li><li><p><a href="./organization-settings">組織設定</a>を管理する</p></li><li><p><a href="./use-recycle-bin">ごみ箱</a>を使用する</p></li><li><p>さらに、<a href="./project-users">Project Admin</a> と <a href="./cluster-roles">Cluster Admin</a> ロールのすべての権限</p></li></ul></td>
     <td><p><a href="/reference/restful/control-plane-v2">すべてのコントロールプレーン操作</a></p></td>
     <td><p><a href="/reference/restful/data-plane-v2">すべてのデータプレーン操作</a></p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

データプレーン RESTful API エンドポイントを呼び出す際は、対象クラスターのユーザー名とパスワードをコロンで区切った `username:password` を認証トークンとして使用します。

</Admonition>

### Organization Billing Admin\{#organization-billing-admin}

Organization Billing Admin ロールは、組織の請求を管理する権限を持ちます。このロールには、組織内のその他のデータに対する権限はありません。

次の表は、この組織ロールに対応する UI 権限と API 権限を示しています。

<table>
   <tr>
     <th><p><strong>UI 権限</strong></p></th>
     <th><p><strong>Control Plane RESTful API (V2) 権限</strong></p></th>
     <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p><a href="./manage-api-keys">API キー</a>を表示する</p></li><li><p><a href="./organization-users">組織ユーザー</a>を招待する</p></li><li><p><a href="./organization-settings">組織設定</a>を表示する</p></li></ul></td>
     <td><ul><li><a href="/reference/restful/query-daily-usage-v2">日次使用量を照会する</a></li></ul></td>
     <td><p>データプレーン権限はプロジェクトおよびクラスターロールによって決まります。ただし、Billing Admin には通常データプレーン権限は不要です。</p></td>
   </tr>
</table>

### Organization Role\{#organization-role}

招待を受けるユーザー向けに組織ロールを作成できます。組織ロールは、組織とそのリソースを表示する権限を持つロールです。このロールに対して、プロジェクトレベルおよびクラスターレベルの権限を編集できます。

![Cb5Yw6EWNhdqD5bjxTRcHHF1nAd](https://zdoc-images.s3.us-west-2.amazonaws.com/Cb5Yw6EWNhdqD5bjxTRcHHF1nAd.png)

#### プロジェクト権限をカスタマイズする\{#customize-project-privileges}

デフォルトでは、招待を受けるユーザーには **Default Project** への **Project Admin** アクセスが付与されます。ただし、**Customize** を選択して、より細かな権限を付与することもできます。

![PW5EwJqDphpZZKbUiaBcxnbUngg](https://zdoc-images.s3.us-west-2.amazonaws.com/PW5EwJqDphpZZKbUiaBcxnbUngg.png)

デフォルトでは、**Include all future clusters** オプションを有効にした状態で **All Clusters** へのアクセスが付与されます。これらのクラスターに対する招待ユーザーの権限を定義するために、**Read-Write***,* などのロールを割り当てることができます。招待が承認されると、ユーザーはそのプロジェクト内の現在および将来のすべてのクラスターに対して指定された権限を持つようになります。 

アクセスを制限するには、ドロップダウンから特定のクラスターを選択します。さらに、**Include all future clusters** オプションを無効にして、新しく作成されるクラスターをアクセス範囲から除外することもできます。

**+ Cluster Access** をクリックすると、さらにクラスターアクセスポリシーを追加できます。

次の表は、このロールについて組織レベルで招待ユーザーに付与される UI 権限と API 権限を示しています。

<table>
   <tr>
     <th><p><strong>UI 権限</strong></p></th>
     <th><p><strong>Control Plane RESTful API (V2) 権限</strong></p></th>
     <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p><a href="./manage-api-keys">API キー</a>を表示する</p></li><li><p><a href="./organization-users">組織ユーザー</a>を招待する</p></li><li><p><a href="./organization-settings">組織設定</a>を表示する</p></li></ul></td>
     <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p>クラスター操作の一部</p><ul><li><p><a href="/reference/restful/list-projects-v2">List Projects</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">List Clusters</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">Describe Cluster</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">Query Cluster Metrics</a></p></li><li><p><a href="/docs/prometheus-monitoring">メトリクスをエクスポートする</a></p></li></ul></li><li><p>インポート操作の一部</p><ul><li><p><a href="/reference/restful/get-import-job-progress-v2">Get Import Job Progress</a></p></li><li><p><a href="/reference/restful/list-import-jobs-v2">List Import Jobs </a></p></li></ul></li><li><p>バックアップと復元操作の一部</p><ul><li><p><a href="/reference/restful/list-backups-v2">List Backups</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">Describe Backup</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">Get Backup Policy</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">すべてのクラウドジョブ操作</a></p></li></ul></td>
     <td><p>データプレーン権限は <a href="./project-users">プロジェクト</a>および<a href="./cluster-roles">クラスター</a>ロールによって決まります</p></td>
   </tr>
</table>

**Organization Member** または **Organization Billing Admin** の場合、招待を受けるユーザーには **Organization Member** ロールのみ付与できる点に注意してください。

招待を受けるユーザーにはメールで招待が送信され、組織に参加するには 48 時間以内に承認する必要があります。あるいは、Web コンソールから招待リンクをコピーして、招待先のユーザーに共有することもできます。

<Admonition type="info" icon="📘" title="📘 Notes">

同じロールで一度に 1 人または複数のユーザーを組織に招待できます。各組織には最大 100 人のユーザーを追加できます。

</Admonition>

## 招待を取り消す、または再送する\{#revoke-or-resend-an-invitation}

ユーザーを組織に招待すると、Zilliz Cloud はそのユーザーに招待メールを送信します。ユーザーが承認する前であれば、その招待を取り消したり再送したりできます。

![NDXHw6PVFhyxntbucxbc9SOFnLg](https://zdoc-images.s3.us-west-2.amazonaws.com/NDXHw6PVFhyxntbucxbc9SOFnLg.png)

## 組織ユーザーのロールを編集する\{#edit-the-role-of-an-organization-user}

ユーザーが招待を承認して組織に参加した後は、必要に応じてそのユーザーのロールを調整できます。

組織ユーザーのロールを編集するには、**Organization Owner** である必要があります。

![VGxOwarfShUDk1bIoEpc5wf3nFf](https://zdoc-images.s3.us-west-2.amazonaws.com/VGxOwarfShUDk1bIoEpc5wf3nFf.png)

## 組織ユーザーを削除する\{#remove-an-organization-user}

ユーザーが組織に所属しなくなった場合は、そのユーザーを削除できます。

組織ユーザーを削除するには、**Organization Owner** である必要があります。

<Admonition type="danger" icon="🚧" title="Notes">

メンバーを削除すると、対応する個人 API キーは直ちに無効化され、アクセスは拒否されます。サービス中断を防ぐため、削除前にご使用の環境で利用されている個人キーが置き換えられていることを確認してください。この操作は元に戻せません。

</Admonition>

![C6O0wzlfRhmxQwbt7yccX3VHn3g](https://zdoc-images.s3.us-west-2.amazonaws.com/C6O0wzlfRhmxQwbt7yccX3VHn3g.png)

## 組織から退出する\{#leave-an-organization}

組織に所属しなくなった場合は、そこから退出することができます。

各組織には少なくとも 1 人の Organization Owner が必要です。あなたがその組織の唯一の Owner である場合、退出することはできません。

<Admonition type="info" icon="📘" title="🚧 Warning">

組織を退出すると、その組織および関連リソースにアクセスできなくなります。

</Admonition>

![SeD6w1FHxhgrbHbjSCQc1eZ3nP9](https://zdoc-images.s3.us-west-2.amazonaws.com/SeD6w1FHxhgrbHbjSCQc1eZ3nP9.png)

