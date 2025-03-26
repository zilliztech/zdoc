---
title: "クラスタ管理 | Cloud"
slug: /manage-cluster
sidebar_label: "クラスタ管理"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudコンソールを最大限に活用して目標を達成するためのクラスタのライフサイクルについて説明します。 | Cloud"
type: origin
token: Py5VwaHKnirdQQkJBxXcmfrunfg
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database

---

import Admonition from '@theme/Admonition';


# クラスタ管理

このガイドでは、Zilliz Cloudコンソールを最大限に活用して目標を達成するためのクラスタのライフサイクルについて説明します。

## フリークラスタ{#free-cluster}

フリークラスタを作成した後、コンソールに以下が表示されます。

![free-cluster-lifecycle](/img/ja-JP/free-cluster-lifecycle.png)

<Admonition type="info" icon="📘" title="ノート">

<p>無料で1つのクラスターを作成するオプションがあります。さらに、クラスター内に最大5つのコレクションを作成できます。</p>

</Admonition>

### クラスタに接続{#establish-connection}

[**接続**]セクションには、クラスターへの接続に使用された**パブリックエンドポイント**と**トークン**があります。

詳細については、「[Clusterに接続](./connect-to-cluster)」を参照してください。

### アップグレードプラン{#upgrade-plan}

クラスタをアップグレードすることで、幅広いエンタープライズ機能のロックを解除し、より大きなデータセットを管理し、パフォーマンスを向上させることができます。以下の条件のいずれかが満たされた場合、有料クラスタプランに切り替えることができます。

- アカウントに十分なクレジットがあります。

- 有効な支払い方法を追加しました。

- あなたの口座には正の残高があります

プランをアップグレードするには、次の手順に従ってください。

1. クラスタの詳細ページで、クラスタ計画の横にある**アップグレード**ボタンをクリックして**ください**。

1. [**サーバーレスクラスターにアップグレード**]または[**新しい専用クラスターにアップグレード**]を選択します。

    - **Severlessクラスタへのアップグレード:**

        表示されるダイアログボックスで、プラン情報と価格を確認します。[**アップグレード**]をクリックします。アップグレードが完了すると、FreeクラスタはServerlessクラスタに置き換えられます。

        <Admonition type="info" icon="📘" title="ノート">

        <ul>
        <li><p>アップグレード中は、このクラスターへの読み取りおよび書き込み操作はサポートされていません。</p></li>
        <li><p>アップグレードにより、クラスターエンドポイントが変更されます。そのため、アプリケーションコード内のクラスターエンドポイント情報を必ず更新してください。</p></li>
        </ul>

        </Admonition>

        ![upgrade-to-serverless](/img/ja-JP/upgrade-to-serverless.png)

    - **新しい専用クラスタへのアップグレード:**

        開いたページで、次の手順を実行します。

        アップグレード中、元のFreeクラスタは引き続き保持され、実行されます。アップグレードが完了すると、新しい専用クラスタが作成され、元のFreeクラスタからのデータが新しい専用クラスタに自動的に移行されます。

        <Admonition type="info" icon="📘" title="ノート">

        <p>新しい専用クラスターに接続するには、アプリケーションコードを変更し、新しいクラスターの適切なエンドポイントとトークンを使用してください。</p>

        </Admonition>

        ![upgrade-to-dedicated](/img/ja-JP/upgrade-to-dedicated.png)

### クラスタを削除{#drop-cluster}

[**Actions**]ドロップダウンボタンで、[**Drop**]を選択してクラスタをドロップします。[**Drop Cluster**]ダイアログボックスでこの操作を確認した後、Zilliz Cloudはクラスタをドロップします。

ウェブUIに加えて、クラスタをドロップするためのAPIリクエストを行うこともできます。詳細については、[クラスタドロップ](/reference/restful/drop-cluster-v2)を参照してください。

## サーバーレスクラスタ{#serverless-cluster}

サーバーレスクラスターを作成した後、コンソールに以下が表示されます。

![serverless-cluster-lifecycle](/img/ja-JP/serverless-cluster-lifecycle.png)

- **接続**:このセクションでは、クラスターID、クラスタークラウドリージョン、接続用のパブリックエンドポイント、セキュアアクセス用のトークンなど、クラスターとのやり取りを開始するために必要な詳細を説明します。

- **概要**:クラスタの基本情報のスナップショットを提供します。クラスタプランと互換性のあるMilvusバージョンを見つけることができます。作成者の詳細、作成日時も表示されます。

### クラスタに接続{#connect-to-cluster}

[**接続**]セクションには、クラスターへの接続に使用された**パブリックエンドポイント**と**トークン**があります。

詳細については、「[クラスタに接続](./connect-to-cluster)」を参照してください。

### コレクションとデータを管理する{#manage-collections-and-data}

- **コレクション**

    [**コレクション**]タブでは、クラスタ内のコレクションを管理できます。コレクションを作成したり、データをインポートしたり、ロードまたはリリースしたり、名前を変更したり、削除したりできます。

    データインポートの詳細については、[データインポート](/docs/data-import)を参照してください。

    ![manage-collections](/img/ja-JP/manage-collections.png)

- **バックアップ**

    [**バックアップ**]タブで、[スナップショットの作成]を選択してクラスタのバックアップを作成できます。すべての**スナップショット**は[**バックアップ**]タブにあります。バックアップとリストアの詳細については、「[バックアップ&リストア](/docs/backup-and-restore)」を参照してください。

- **データ移行**

    [**Migrations**]タブで、[Migrate]を選択すると、データの**移行**タスクを作成できます。詳細については、「[クラスタ間の移行](./migrate-between-clusters)」を参照してください。

### 専用クラスタへの移行{#migrate-to-dedicated-cluster}

エンタープライズグレードの機能やカスタム構成をより多く使用するには、サーバーレスクラスターを専用クラスターに移行することをお勧めします。詳細については、「[クラスタ間の移行](./migrate-between-clusters)」を参照してください。

### ユーザーとアクセス制御{#users-and-access-control}

各サーバーレスクラスターには、1つのデフォルトユーザーが付属しています。ユーザーを追加または削除することはできませんが、デフォルトユーザーのパスワードをリセットすることはできます。

![manage-users](/img/ja-JP/manage-users.png)

### クラスタを削除{#drop-cluster}

[**Actions**]ドロップダウンボタンで、[**Drop**]を選択してクラスタをドロップします。[**Drop Cluster**]ダイアログボックスでこの操作を確認した後、Zilliz Cloudはクラスタをドロップします。

ウェブUIに加えて、クラスタをドロップするためのAPIリクエストを行うこともできます。詳細については、[クラスタドロップ](/reference/restful/drop-cluster-v2)を参照してください。

## 専用クラスタ{#dedicated-cluster}

### クラスタの詳細を表示する{#view-cluster-details}

Zilliz Cloud Dedicatedクラスタを設定した後、クラスタの詳細については、各セクションに以下の内容が記載されています。

![dedicated-cluster-lifecycle](/img/ja-JP/dedicated-cluster-lifecycle.png)

- **Connect**:このセクションでは、クラスターID、クラスタークラウドリージョン、接続用のパブリックエンドポイント、プライベートリンク、IPアドレスホワイトリスト、セキュアアクセス用のトークンなど、クラスターとのやり取りを開始するために必要な詳細情報を提供します。、。

- **概要**:クラスタの基本情報のスナップショットを提供します。クラスタプラン、CUタイプ、CU体格、互換性のあるMilvusバージョンを見つけることができます。作成者の詳細、作成日時も表示されます。

### 接続を確立する{#establish-connection}

- **クラスタに接続**

    「**接続**」セクションでは、クラスターに接続するために使用される**パブリックエンドポイント**と**トークン**を見つけることができます。トークンは、ユーザー名とパスワードのペアで構成される[APIキー](./manage-api-keys)または[クラスター資格情報](null)であることができます。

    詳細については、「[クラスタに接続](./connect-to-cluster)」を参照してください。

- **プライベートリンクを設定する**

    クラスターへのより安全な接続を確立するには、提供されたパブリックエンドポイントを使用する代わりにプライベートリンクを作成できます。「[プライベートエンドポイントを設定する](./setup-a-private-link)」を参照してください。

### コレクションとデータを管理する{#manage-collections-and-data}

- **コレクション**

    [**コレクション**]タブでは、クラスタ内のコレクションを管理できます。コレクションを作成したり、データをインポートしたり、ロードまたはリリースしたり、名前を変更したり、削除したりできます。

    データインポートの詳細については、[データインポート](/docs/data-import)を参照してください。

    ![manage-collections](/img/ja-JP/manage-collections.png)

- **バックアップ**

    [**バックアップ**]タブで、[スナップショットの作成]を選択してクラスタのバックアップを作成できます。すべての**スナップショット**は[**バックアップ**]タブにあります。バックアップとリストアの詳細については、「[バックアップ&リストア](/docs/backup-and-restore)」を参照してください。

- **マイグレーション**

    [**Migrations**]タブで、[Migrate]を選択すると、データの**移行**タスクを作成できます。詳細については、「[クラスタ間の移行](./offline-migration)」を参照してください。

### ユーザーとアクセス制御{#users-and-access-control}

- **ユーザー**

    [**ユーザー**]タブでは、ユーザーを追加したり、パスワードをリセットしたり、削除したりできます。

    詳細については、クラスタ資格情報を参照してください。

    ![manage-users](/img/ja-JP/manage-users.png)

    <Admonition type="info" icon="📘" title="ノート">

    <p><b>db_admin</b>を削除することはできません。Zilliz Cloudは、追加されたユーザーに対してクラスタ内のすべてのコレクションへのアクセス権限を付与します。</p>

    </Admonition>

- **ホワイトリスト**

    [**概要**]セクションで、[**ネットワークアドレス**]のIPアドレスをクリックして、IPアドレスセグメントをホワイトリストに追加します。IPアドレスセグメント（フルゼロ（**0.0.0.0/0**）以外）がホワイトリストに追加されると、Zilliz CloudはリストされたIPアドレスセグメント内のIPアドレスからのみアクセスを許可します。

    デフォルトでは、フルゼロのIPアドレスセグメントが追加され、どこからでもクラスターにアクセスできることを示します。

    ホワイトリストの設定方法については、「ホワイトリストの[ホワイトリストの設定](./setup-whitelist)参照してください。

### クラスタプランのアップグレード{#}

Dedicated(Standard)クラスタの場合、**Summary**セクションのサービス**プラン**の右にあるUpgradeをクリックして、**Dedicated(Enterprise)にプランをアップグレードします。Zilliz Cloudは、Upgrade Cluster Plan**ダイアログボックスでこの操作を確認した後に、サービスプランをアップグレードします。

利用可能なすべてのサブスクリプションプランの違いについては、「[詳細なプラン比較](./select-zilliz-cloud-service-plans)」を参照してください。

### クラスタの一時停止と再開{#}

「**Actions**」ドロップダウンボタンで、「**Suspend**」を選択してクラスタを停止します。「**Suspend Cluster**」ダイアログボックスでこの操作を確認すると、クラスタの状態が「**RUNNING**」から「**SUSPENDING**」に変わり、その間はクラスタに対して他のアクションを実行できません。

ステータスが**SUSPENDED**に変更されると、ストレージに対してのみ課金されます。クラスタの一部を賢明に一時停止すると、お金を節約できます。

<table>
   <tr>
     <th><p><strong>クラウドプロバイダー</strong></p></th>
     <th><p><strong>ストレージ価格</strong></p></th>
   </tr>
   <tr>
     <td><p>AWSストレージ</p></td>
     <td><p>月額$0.0 25/GBあたり</p></td>
   </tr>
   <tr>
     <td><p>GCPストレージ</p></td>
     <td><p>月額$0.0 20/GBあたり</p></td>
   </tr>
   <tr>
     <td><p>Azureストレージ</p></td>
     <td><p>月額$0.0 25/GBあたり</p></td>
   </tr>
</table>

サスペンドされたクラスタを再開するには、**アクション**をクリックし、ドロップダウンメニューから**再開**を選択します。**再開クラスタ**ダイアログボックスでこのアクションを確認すると、クラスタの状態が**SUSPENDED**から**RESUMING**、そして**RUNNING**に変わります。この時点で、CU設定とサービスプランに基づいて完全に請求されます。

これらのアクションを実行するために、RESTful APIを使用することもできます。詳細については、「[クラスタ停止](/reference/restful/suspend-cluster)」と「[クラスタ再開](/reference/restful/resume-cluster)」を参照してください。

### クラスタを削除{#drop-cluster}

[**Actions**]ドロップダウンボタンで、[**Drop**]を選択してクラスタをドロップします。[**Drop Cluster**]ダイアログボックスでこの操作を確認した後、Zilliz Cloudはクラスタをドロップします。

ウェブUIに加えて、クラスタを削除するためのAPIリクエストを行うこともできます。詳細については、[Drop Cluster](/reference/restful/drop-cluster-v2)を参照してください。

## 関連するトピック{#related-topics}

- [クラスタに接続](./connect-to-cluster)

- [プライベートエンドポイントを設定する](./setup-a-private-link)

- [クラスタ間の移行](./migrate-between-clusters)

- [詳細なプラン比較](./select-zilliz-cloud-service-plans)

- [ホワイトリストの設定](./setup-whitelist)

- [バックアップと復元](./backup-and-restore)

- [適切なCUを選択](./cu-types-explained)

