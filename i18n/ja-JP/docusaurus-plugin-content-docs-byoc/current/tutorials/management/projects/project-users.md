---
title: "プロジェクトユーザーの管理 | BYOC"
slug: /project-users
sidebar_label: "プロジェクトユーザー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、プロジェクトにユーザーを招待し、職務に応じたロールを割り当てることができます。これらのロールにより、ユーザーのプロジェクトリソースへのアクセス権限と実行可能な操作が決まります。 | BYOC"
type: origin
token: PZ4uwwgUfio5OikY0Ecc5nrunFf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# プロジェクトユーザーの管理

Zilliz Cloud では、プロジェクトにユーザーを招待し、職務に応じたロールを割り当てることができます。これらのロールにより、ユーザーのプロジェクトリソースへのアクセス権限と実行可能な操作が決まります。

このトピックでは、プロジェクトユーザーを管理する方法について説明します。

## プロジェクトにユーザーを招待する\{#invite-a-user-to-a-project}

プロジェクトにユーザーを招待するには、**Organization Owner** または **Project Admin** である必要があります。  

1. 招待したいユーザーのメールアドレスを入力します。

1. アクセスの割り当て方法を選択します。

    - [Project Admin](./project-users#project-admin) — プロジェクトとそのすべてのリソースに対する完全な制御権を付与します。

    - カスタムの[プロジェクトアクセスポリシー](./project-users#project-access) — プロジェクト内でのユーザーの特定の権限を設定します。

招待を受けたユーザーにはメールによる招待が送信され、プロジェクトに参加するには 48 時間以内に承諾する必要があります。あるいは、Web コンソールから招待リンクをコピーして、招待相手と共有することもできます。

ユーザーがプロジェクトに参加すると、そのプロジェクトが属する組織の Organization Member に自動的になります。

<Admonition type="info" icon="📘" title="📘 Notes">

毎回、同じロールで 1 人以上のユーザーをプロジェクトに招待できます。

</Admonition>

### Project Admin\{#project-admin}

**Project Admin** ロールには、プロジェクトとそのすべてのリソース（クラスター、データベース、コレクション）を管理するための完全な権限があります。

### Project Access\{#project-access}

アクセス権限を最小限に抑えるために、招待するユーザー向けにクラスターアクセスのきめ細かな権限を設定することもできます。

![A3DtwF7hfhKyqNboWfmcKT9Unxw](https://zdoc-images.s3.us-west-2.amazonaws.com/A3DtwF7hfhKyqNboWfmcKT9Unxw.png)

デフォルトでは、**All Clusters** へのアクセスが許可され、**Include all future clusters** オプションが有効になっています。**Read-Write** などのロールを割り当てて、これらのクラスター全体にわたる招待ユーザーの権限を定義できます。招待が承諾されると、ユーザーはプロジェクト内の現在および将来のすべてのクラスターに対して指定された権限を持つようになります。 

アクセスを制限するには、ドロップダウンから特定のクラスターを選択します。**Include all future clusters** オプションを無効にして、新しく作成されるクラスターをアクセス範囲から除外することもできます。

さらにクラスターアクセスポリシーを追加するには、**+ Cluster Access** をクリックします。

**Read-Write**、**Read-Only**、および **Cluster Admin** ロールの具体的な権限は、以下のセクションで確認できます。

#### Read-Write\{#read-write}

Read-Write ロールには、プロジェクトを表示し、そのリソース（クラスター、データベース、コレクション）を管理する権限があります。 

#### Read-Only\{#read-only}

Read-Only ロールには、プロジェクトとそのリソース（クラスター、データベース、コレクション）を表示する権限があります。 

#### Cluster Admin\{#cluster-admin}

Cluster Admin ロールには、プロジェクトを表示し、そのリソース（クラスター、データベース、コレクション）を管理する権限があります。 

Project Read-Write ロールの権限に加えて、Cluster Admin はクラスターのスケーリング、一時停止、再開などのクラスター操作を実行できます。

### プロジェクトロールとアクセス権の比較\{#project-role-and-access-comparison}

以下の表では、さまざまなプロジェクトロールの権限を簡単に比較できます。

**オンデマンドコンピュート**

| 操作 | Project Admin | Cluster Admin | Project Read/Write | Project Read-Only |
| --- | --- | --- | --- | --- |
| On-Demand クラスターの作成 | ✅ | ❌ | ❌ | ❌ |
| On-Demand クラスターのリストと詳細の表示 | ✅ | ✅ | ✅ | ✅ |
| On-Demand クラスターの変更、名前変更、または削除 | ✅ | ❌ | ❌ | ❌ |
| オンデマンドコンピュートでのデータベースの作成 | ✅ | ✅ | ✅ | ❌ |
| オンデマンドコンピュートでのデータベースリストの表示 | ✅ | ✅ | ✅ | ❌ |
| オンデマンドコンピュートでのデータベースの削除 | ✅ | ❌ | ❌ | ❌ |
| オンデマンドコンピュートのデータベース内でのコレクションの作成または削除 | ✅ | ✅ | ✅ | ❌ |
| オンデマンドコンピュートのデータベース内のコレクションへのデータのインポート | ✅ | ✅ | ✅ | ❌ |
| On-Demand クラスターを介したクエリ、検索、または Get の実行 | ✅ | ✅ | ✅ | ✅ |
| Managed Volume または External Volume の作成 | ✅ | ❌ | ❌ | ❌ |

**クラスター操作**

| **操作** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| クラスターの作成 | ✅ | ❌ | ❌ | ❌ |
| クラスターの削除 | ✅ | ❌ | ❌ | ❌ |
| クラスター Query CU のスケーリング | ✅ | ✅ | ❌ | ❌ |
| クラスター Replica のスケーリング | ✅ | ✅ | ❌ | ❌ |
| クラスターの一時停止 | ✅ | ✅ | ❌ | ❌ |
| クラスターの再開 | ✅ | ✅ | ❌ | ❌ |
| クラスターリストの表示 | ✅ | ✅ | ✅ | ✅ |
| クラスター詳細の表示 | ✅ | ✅ | ✅ | ✅ |
| クラスターメトリクスの表示 | ✅ | ✅ | ✅ | ✅ |

**クラスターユーザー**

| **操作** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| クラスターユーザーリストの表示 | ✅ | ✅ | ✅ | ✅ |
| クラスターユーザーの作成 | ✅ | ✅ | ❌ | ❌ |
| クラスターユーザーのパスワードのリセット | ✅ | ✅ | ❌ | ❌ |
| クラスターユーザーの削除 | ✅ | ✅ | ❌ | ❌ |

**監査ログ**

| **操作** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| 監査ログの有効化 | ✅ | ✅ | ❌ | ❌ |
| 監査ログ設定の編集 | ✅ | ✅ | ❌ | ❌ |
| 監査ログの無効化 | ✅ | ✅ | ❌ | ❌ |
| 監査ログのステータスの表示 | ✅ | ✅ | ✅ | ✅ |

**データプレーン操作**

| **操作** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| コレクションの作成 | ✅ | ✅ | ✅ | ❌ |
| コレクションの削除 | ✅ | ✅ | ✅ | ❌ |
| コレクションの一覧表示/説明 | ✅ | ✅ | ✅ | ✅ |
| Insert/Upsert | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ✅ | ❌ |
| Query/Search/Get | ✅ | ✅ | ✅ | ✅ |
| Bulk Import | ✅ | ✅ | ✅ | ❌ |
| その他すべての RESTful 操作 | ✅ | ✅ | ✅ | 場合による |

<Admonition type="info" icon="📘" title="📘 Notes">

Cluster Admin と Project Read-Write の両ロールは、同じデータプレーン権限を共有します。       

</Admonition>

**バックアップと復元**

| **操作** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| バックアップリストの表示 | ✅ | ✅ | ✅ | ✅ |
| バックアップの作成 | ✅ | ✅ | ❌ | ❌ |
| クラスターバックアップファイルを新しいクラスターに復元 | ✅ | ❌ | ❌ | ❌ |
| コレクションバックアップファイルを既存のクラスターに復元 | ✅ | ✅ | ❌ | ❌ |
| クラスターバックアップの削除 | ✅ | ✅ | ❌ | ❌ |

**ボリューム**

| **操作** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| ボリュームリストの表示 | ✅ | ✅ | ✅ | ✅ |
| ボリュームの作成 | ✅ | ❌ | ❌ | ❌ |
| ボリュームの削除 | ✅ | ❌ | ❌ | ❌ |

**移行**

| **操作** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| 移行ジョブの表示 | ✅ | ✅ | ✅ | ✅ |
| 移行ジョブの作成 | ✅ | ✅ | ❌ | ❌ |
| 移行ジョブのキャンセル | ✅ | ✅ | ❌ | ❌ |
| 移行ジョブの詳細の表示（移行されたコレクション/データベースの表示） | ✅ | ✅ | ✅ | ✅ |

**ジョブ**

| **操作** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| ジョブリストの表示 | ✅ | ✅ | ✅ | ✅ |
| ジョブ詳細の表示 | ✅ | ✅ | ✅ | ✅ |
| ジョブのキャンセル | ✅ | ✅ | ❌ | ❌ |
| ジョブの再試行 | ✅ | ✅ | ❌ | ❌ |

**プロジェクトアラート**

| **操作** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| アラートリストの表示 | ✅ | ✅ | ✅ | ✅ |
| アラートの作成 | ✅ | ✅ | ✅ | ✅ |
| アラートの編集 | ✅ | ✅ | ✅ | ✅ |
| アラートの削除 | ✅ | ✅ | ✅ | ✅ |
| アラート履歴の表示 | ✅ | ✅ | ✅ | ✅ |

**共同作業者**

| **操作** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| プロジェクト共同作業者の招待 | ✅ | ❌ | ❌ | ❌ |
| プロジェクト共同作業者のロールの編集 | ✅ | ❌ | ❌ | ❌ |
| プロジェクト共同作業者の削除 | ✅ | ❌ | ❌ | ❌ |

**クラスター IP 許可リスト**

| **操作** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| クラスター IP 許可リストの表示 | ✅ | ✅ | ✅ | ✅ |
| クラスター IP 許可リストへの IP アドレスの追加 | ✅ | ❌ | ❌ | ❌ |
| クラスター IP 許可リスト内の IP アドレスの変更 | ✅ | ❌ | ❌ | ❌ |
| クラスター IP 許可リストからの IP アドレスの削除 | ✅ | ❌ | ❌ | ❌ |

**プライベートエンドポイント**

| **操作** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| プライベートエンドポイントリストの表示 | ✅ | ✅ | ✅ | ✅ |
| プライベートエンドポイントの作成 | ✅ | ❌ | ❌ | ❌ |
| プライベートエンドポイントの削除 | ✅ | ❌ | ❌ | ❌ |

**CMEK**

| **操作** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| CMEK リストの表示 | ✅ | ✅ | ✅ | ✅ |
| CMEK の追加 | ✅ | ❌ | ❌ | ❌ |
| CMEK の削除 | ✅ | ❌ | ❌ | ❌ |

**インテグレーション**

| **操作** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| インテグレーションリストの表示 | ✅ | ✅ | ✅ | ✅ |
| Datadog インテグレーションの表示 | ✅ | ✅ | ✅ | ✅ |
| Datadog インテグレーションの作成 | ✅ | ❌ | ❌ | ❌ |
| Datadog インテグレーション設定の編集 | ✅ | ❌ | ❌ | ❌ |
| Datadog インテグレーションの削除 | ✅ | ❌ | ❌ | ❌ |
| Storage Integration の表示 | ✅ | ✅ | ✅ | ✅ |
| Storage Integration の作成 | ✅ | ❌ | ❌ | ❌ |
| Storage Integration の削除 | ✅ | ❌ | ❌ | ❌ |

## 招待を取り消す、または再送する\{#revoke-or-resend-an-invitation}

同じ組織内の既存の Organization Member をプロジェクトに招待すると、そのユーザーは個別の招待を受け取ることなく自動的にプロジェクトへのアクセス権を取得します。一方、まだ所属していない組織内のプロジェクトにユーザーを招待した場合、そのユーザーには組織への参加招待が送信され、それによって指定されたプロジェクトへのアクセス権も付与されます。

![CKuxwsNxihJzNtbQ4fBc1xHRnxf](https://zdoc-images.s3.us-west-2.amazonaws.com/CKuxwsNxihJzNtbQ4fBc1xHRnxf.png)

招待を取り消す、または再送するには、**Organization Owner** または **Project Admin** である必要があります。

<Admonition type="info" icon="📘" title="📘 Notes">

ユーザーが招待を承諾する前であれば、招待を取り消したり再送したりできます。

</Admonition>

## 共同作業者のロールを編集する\{#edit-a-collaborators-role}

ユーザーが招待を承諾すると、そのユーザーはプロジェクト共同作業者になります。

共同作業者のロールを編集するには、**Organization Owner** または **Project Admin** である必要があります。

![H1hUwVUrThoYtYbeMVccsswync5](https://zdoc-images.s3.us-west-2.amazonaws.com/H1hUwVUrThoYtYbeMVccsswync5.png)

## 共同作業者を削除する\{#remove-a-collaborator}

プロジェクト共同作業者を削除するには、**Organization Owner** または **Project Admin** である必要があります。

![HKpow0x7qheStnb0zcOcDlyunHc](https://zdoc-images.s3.us-west-2.amazonaws.com/HKpow0x7qheStnb0zcOcDlyunHc.png)

## プロジェクトを離れる\{#leave-a-project}

プロジェクトから共同作業者を削除するだけでなく、プロジェクトを離れることで自分自身を削除することもできます。

![DTwiwN0AThgVZLb60dMcSblDnsb](https://zdoc-images.s3.us-west-2.amazonaws.com/DTwiwN0AThgVZLb60dMcSblDnsb.png)

なお、あなたがプロジェクトの唯一の管理者である場合は、各プロジェクトには常に少なくとも 1 人の Project Admin が必要なため、プロジェクトを離れることはできません。

<Admonition type="info" icon="📘" title="🚧 Warning">

プロジェクトを離れると、そのプロジェクトおよび関連リソースへのアクセス権は取り消されます。

</Admonition>

