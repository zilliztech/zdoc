---
title: "組織ユーザーの管理 | Cloud"
slug: /organization-users
sidebar_key: organization-users
sidebar_label: "組織ユーザー"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、組織は通常、企業を表します。従業員を組織に招待し、職務に基づいてロールを割り当てることができます。これらのロールは、ユーザーが特定のリソースにアクセスできるかどうか、および実行可能な操作を決定します。たとえば、開発者は通常データへのアクセスが必要ですが、請求権限は必要としません。 | Cloud"
type: origin
token: OzLjwMmWliJdEBkz0gPcVZrqnZb
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - organizations
  - users

---

import Admonition from '@theme/Admonition';


# 組織ユーザーの管理

Zilliz Cloud において、組織は通常、企業を表します。従業員を組織に招待し、職務に基づいてロールを割り当てることができます。これらのロールは、ユーザーが特定のリソースにアクセスできるかどうか、および実行可能な操作を決定します。例えば、開発者は通常データへのアクセスが必要ですが、請求権限は必要ありません。

本ガイドでは、組織へのユーザーの招待、招待の取り消しまたは再送信、組織ユーザーのロールの変更、組織ユーザーの削除など、組織ユーザーを管理する方法について説明します。

## 組織へのユーザーの招待\{#invite-a-user-to-your-organization}

組織にユーザーを招待する際、組織内のリソースへのアクセスと特定の操作を実行するための権限を定義するロールを割り当てる必要があります。

ユーザーを招待するには、招待したいユーザーのメールアドレスを入力します。次に、新しい組織ユーザーに付与する組織ロールを選択します。

### 組織オーナー\{#organization-owner}

組織オーナーは、Zilliz Cloud における最上位のロールであり、組織とそのすべてのリソース（プロジェクト、クラスター、データベース、コレクション）を管理するための完全な権限を持ちます。このロールは、組織内の限られた数のユーザーのみに付与すべきです。

以下の表は、この組織ロールに対応する UI および API 権限の一覧です。

<table>
   <tr>
     <th><p><strong>UI 権限</strong></p></th>
     <th><p><strong>コントロールプレーン RESTful API (V2) 権限</strong></p></th>
     <th><p><strong>データプレーン RESTful API (V2) 権限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p>組織内のすべてのプロジェクトを管理</p></li><li><p><a href="./payment-billing">支払いと請求</a>を管理</p></li><li><p><a href="./manage-api-keys">API キー</a>を管理</p></li><li><p><a href="./organization-users">組織ユーザー</a>を管理</p></li><li><p><a href="./metrics-and-alerts">アラート</a>を管理</p></li><li><p><a href="./view-activities">アクティビティ</a>を表示</p></li><li><p><a href="./organization-settings">組織設定</a>を管理</p></li><li><p><a href="./use-recycle-bin">ごみ箱</a>を使用</p></li><li><p>さらに、<a href="./project-users#project-admin">プロジェクト管理者</a>および<a href="./cluster-roles#built-in-cluster-roles">クラスター管理者</a>ロールのすべての権限</p></li></ul></td>
     <td><p><a href="/reference/restful/control-plane-v2">すべてのコントロールプレーン操作</a></p></td>
     <td><p><a href="/reference/restful/data-plane-v2">すべてのデータプレーン操作</a></p></td>
   </tr>
</table>

### 組織の請求管理者\{#organization-billing-admin}

組織の請求管理者ロールは、組織内の請求を管理する権限を持ちます。このロールには、組織内の他のデータに対する権限はありません。

以下の表は、この組織ロールに対応する UI および API 権限の一覧です。

<table>
   <tr>
     <th><p><strong>UI 権限</strong></p></th>
     <th><p><strong>コントロールプレーン RESTful API (V2) 権限</strong></p></th>
     <th><p><strong>データプレーン RESTful API (V2) 権限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p><a href="./payment-billing">支払いと請求</a>を管理</p></li><li><p><a href="./manage-api-keys">API キー</a>を表示</p></li><li><p><a href="./organization-users">組織ユーザー</a>を招待</p></li><li><p><a href="./organization-settings">組織設定</a>を表示</p></li></ul></td>
     <td><ul><li><p><a href="/reference/restful/list-invoices-v2">請求書の一覧表示</a></p></li><li><p><a href="/reference/restful/describe-invoice-v2">請求書の詳細確認</a></p></li><li><p><a href="/reference/restful/query-daily-usage-v2">日次使用量の照会</a></p></li></ul></td>
     <td><p>データプランの権限は、プロジェクトおよびクラスターのロールによって決定されます。ただし、請求管理者は通常、データプレーンの権限を必要としません。</p></td>
   </tr>
</table>

### 組織ロール\{#organization-role}

招待受信者に対して組織ロールを作成できます。組織ロールとは、組織とそのリソースを表示する権限を持つロールです。このロールに対して、プロジェクトレベルおよびクラスターレベルの権限を編集できます。

![Cb5Yw6EWNhdqD5bjxTRcHHF1nAd](https://zdoc-images.s3.us-west-2.amazonaws.com/Cb5Yw6EWNhdqD5bjxTRcHHF1nAd.png)

#### プロジェクト権限のカスタマイズ\{#customize-project-privileges}

デフォルトでは、招待受信者に対して**デフォルトプロジェクト**への**プロジェクト管理者**アクセスが付与されます。ただし、**カスタマイズ**を選択して、きめ細かい権限を付与することもできます。

![PXLywcZSyh9Vaib1wUFc0NminUd](https://zdoc-images.s3.us-west-2.amazonaws.com/PXLywcZSyh9Vaib1wUFc0NminUd.png)

- **クラスターアクセス**

    デフォルトでは、**すべてのクラスター**へのアクセスが付与され、**将来のすべてのクラスターを含める**オプションが有効になっています。**読み書き**などのロールを割り当てて、これらのクラスター全体での招待ユーザーの権限を定義できます。招待が承認されると、ユーザーはプロジェクト内の現在および将来のすべてのクラスターに対して指定された権限を持ちます。

    アクセスを制限するには、ドロップダウンから特定のクラスターを選択します。また、**将来のすべてのクラスターを含める**オプションを無効にして、 newly created クラスターをアクセス範囲から除外することもできます。

    **+ クラスターアクセス**をクリックして、さらにクラスターアクセスポリシーを追加します。

- **ボリュームアクセス**

    デフォルトでは、**すべてのボリューム**へのアクセスが付与され、**将来のすべてのボリュームを含める**オプションが有効になっています。**読み書き**などのロールを割り当てて、これらのボリューム全体での招待ユーザーの権限を定義できます。招待が承認されると、ユーザーはプロジェクト内の現在および将来のすべてのボリュームに対して指定された権限を持ちます。

    アクセスを制限するには、ドロップダウンから特定のボリュームを選択します。また、**将来のすべてのボリュームを含める**オプションを無効にして、 newly created ボリュームをアクセス範囲から除外することもできます。

    **+ ボリュームアクセス**をクリックして、さらにクラスターアクセスポリシーを追加します。

以下の表は、このロールに対して組織レベルで招待者に付与される UI および API 権限の一覧です。

<table>
   <tr>
     <th><p><strong>UI 権限</strong></p></th>
     <th><p><strong>コントロールプレーン RESTful API (V2) 権限</strong></p></th>
     <th><p><strong>データプレーン RESTful API (V2) 権限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p><a href="./manage-api-keys">API キー</a>を表示</p></li><li><p><a href="./organization-users">組織ユーザー</a>を招待</p></li><li><p><a href="./organization-settings">組織設定</a>を表示</p></li></ul></td>
     <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p>クラスター操作の一部</p><ul><li><p><a href="/reference/restful/list-projects-v2">プロジェクトの一覧表示</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">クラスターの一覧表示</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">クラスターの詳細確認</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">クラスターメトリクスの照会</a></p></li><li><p><a href="/docs/prometheus-monitoring">メトリクスのエクスポート</a></p></li></ul></li><li><p>インポート操作の一部</p><ul><li><p><a href="/reference/restful/get-import-job-progress-v2">インポートジョブの進捗取得</a></p></li><li><p><a href="/reference/restful/list-import-jobs-v2">インポートジョブの一覧表示</a></p></li></ul></li><li><p>バックアップおよび復元操作の一部</p><ul><li><p><a href="/reference/restful/list-backups-v2">バックアップの一覧表示</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">バックアップの詳細確認</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">バックアップポリシーの取得</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">すべてのクラウドジョブ操作</a></p></li></ul></td>
     <td><p>データプランの権限は、<a href="./project-users#invite-a-user-to-a-project">プロジェクト</a>および<a href="./cluster-roles">クラスター</a>のロールによって決定されます</p></td>
   </tr>
</table>

**組織メンバー**または**組織の請求管理者**である場合、招待受信者に付与できるロールは**組織メンバー**のみです。

招待受信者は、組織に参加するために 48 時間以内に承諾しなければならないメール招待を受け取ります。あるいは、Web コンソールから招待リンクをコピーして、招待者と共有することもできます。

<Admonition type="info" icon="📘" title="Notes">

<p>毎回、同じロールを持つ 1 人以上のユーザーを組織に招待できます。各組織には最大 100 人のユーザーを含めることができます。</p>

</Admonition>

## 招待の取り消しまたは再送信\{#revoke-or-resend-an-invitation}

ユーザーを組織に招待した後、Zilliz Cloud はそのユーザーに招待メールを送信します。ユーザーが承諾する前に、招待を取り消したり再送信したりできます。

![NDXHw6PVFhyxntbucxbc9SOFnLg](https://zdoc-images.s3.us-west-2.amazonaws.com/NDXHw6PVFhyxntbucxbc9SOFnLg.png)

## 組織ユーザーのロールの編集\{#edit-the-role-of-an-organization-user}

ユーザーが招待を承諾して組織に参加した後、必要に応じてそのロールを調整できます。

組織ユーザーのロールを編集するには、**組織オーナー**である必要があります。

![VGxOwarfShUDk1bIoEpc5wf3nFf](https://zdoc-images.s3.us-west-2.amazonaws.com/VGxOwarfShUDk1bIoEpc5wf3nFf.png)

## 組織ユーザーの削除\{#remove-an-organization-user}

ユーザーがもはや組織に所属していない場合、そのユーザーを削除できます。

組織ユーザーを削除するには、**組織オーナー**である必要があります。

<Admonition type="info" icon="📘" title="Notes">

<p>メンバーを削除すると、対応する個人用 API キーは直ちに取り消され、アクセスは拒否されます。サービス中断を防ぐため、削除前に環境で使用されている個人用キーを置き換えてください。この操作は元に戻せません。</p>

</Admonition>

![C6O0wzlfRhmxQwbt7yccX3VHn3g](https://zdoc-images.s3.us-west-2.amazonaws.com/C6O0wzlfRhmxQwbt7yccX3VHn3g.png)

## 組織からの脱退\{#leave-an-organization}

もはや組織に所属していない場合、組織から脱退するオプションがあります。

各組織には少なくとも 1 人の組織オーナーが必要です。組織の唯一のオーナーである場合、その組織から脱退することはできません。

<Admonition type="caution" icon="🚧" title="Warning">

<p>組織から脱退すると、その組織および関連リソースにアクセスできなくなります。</p>

</Admonition>

組織から脱退するには、以下のいずれかの方法があります。

- 組織一覧ページで組織から脱退する：

    ![Jdu2wpIYBhNZ5mbdMKOcBB6rnBg](https://zdoc-images.s3.us-west-2.amazonaws.com/Jdu2wpIYBhNZ5mbdMKOcBB6rnBg.png)

- 組織に入り、**組織メンバー**ページで脱退する：

    ![YQYsw1BYahoLHabbmXdc4V15nA8](https://zdoc-images.s3.us-west-2.amazonaws.com/YQYsw1BYahoLHabbmXdc4V15nA8.png)

