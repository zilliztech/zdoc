---
title: "プロジェクトユーザーの管理 | Cloud"
slug: /project-users
sidebar_label: "プロジェクトユーザー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、ユーザーをプロジェクトに招待し、職務に応じてロールを割り当てることができます。これらのロールにより、ユーザーのプロジェクトリソースへのアクセス権と実行できる操作が決まります。 | Cloud"
type: origin
token: PZ4uwwgUfio5OikY0Ecc5nrunFf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# プロジェクトユーザーの管理

Zilliz Cloud では、ユーザーをプロジェクトに招待し、職務に応じてロールを割り当てることができます。これらのロールにより、ユーザーのプロジェクトリソースへのアクセス権と実行できる操作が決まります。

このトピックでは、プロジェクトユーザーを管理する方法について説明します。

## ユーザーをプロジェクトに招待する\{#invite-a-user-to-a-project}

ユーザーをプロジェクトに招待するには、**Organization Owner** または **Project Admin** である必要があります。  

1. 招待したいユーザーのメールアドレスを入力します。

1. アクセスの割り当て方法を選択します。

    - [Project Admin](./project-users#project-admin) — プロジェクトとそのすべてのリソースに対する完全な制御権を付与します。

    - カスタム [project access policy](./project-users#project-access) — プロジェクト内でのユーザーの具体的な権限を設定します。

招待の受信者にはメール招待が送信され、プロジェクトに参加するには 48 時間以内に承諾する必要があります。あるいは、Web コンソールから招待リンクをコピーして、招待相手と共有することもできます。

ユーザーがプロジェクトに参加すると、そのプロジェクトが属する組織の Organization Member に自動的になります。

<Admonition type="info" icon="📘" title="📘 Notes">

一度に、同じロールを持つ 1 人以上のユーザーをプロジェクトに招待できます。

</Admonition>

### Project Admin\{#project-admin}

**Project Admin** ロールは、プロジェクトとそのすべてのリソース（クラスター、データベース、コレクション）を管理するための完全な権限を持ちます。

### Project Access\{#project-access}

アクセス権を最小限に抑えるために、招待するユーザーに対して、クラスターおよびボリュームへのアクセス権をきめ細かく設定することもできます。

![Gs3jwYjb6hVbunbyASAcVUp3nIe](https://zdoc-images.s3.us-west-2.amazonaws.com/Gs3jwYjb6hVbunbyASAcVUp3nIe.png)

- **Cluster Access**

    デフォルトでは、**Include all future clusters** オプションを有効にした状態で **All Clusters** へのアクセスが付与されます。**Read-Write***,* などのロールを割り当てて、招待されたユーザーのこれらのクラスター全体にわたる権限を定義できます。招待が承諾されると、ユーザーはプロジェクト内の現在および将来のすべてのクラスターに対して指定された権限を持つようになります。 

    アクセスを制限するには、ドロップダウンから特定のクラスターを選択します。また、**Include all future clusters** オプションを無効にして、新しく作成されるクラスターをアクセス範囲から除外することもできます。

    **+ Cluster Access** をクリックすると、さらにクラスターアクセスポリシーを追加できます。

- **Volume Access**

    デフォルトでは、**Include all future volumes** オプションを有効にした状態で **All Volumes** へのアクセスが付与されます。**Read-Write***,* などのロールを割り当てて、招待されたユーザーのこれらのボリューム全体にわたる権限を定義できます。招待が承諾されると、ユーザーはプロジェクト内の現在および将来のすべてのボリュームに対して指定された権限を持つようになります。 

    アクセスを制限するには、ドロップダウンから特定のボリュームを選択します。また、**Include all future volumes** オプションを無効にして、新しく作成されるボリュームをアクセス範囲から除外することもできます。

    **+ Volume Access** をクリックすると、さらにクラスターアクセスポリシーを追加できます。

**Read-Write**、**Read-Only**、**Cluster Admin** ロールの具体的な権限は、以下のセクションで確認できます。

#### Read-Write\{#read-write}

Read-Write ロールには、プロジェクトを表示し、そのリソース（クラスター、データベース、コレクション）を管理する権限があります。 

#### Read-Only\{#read-only}

Read-Only ロールには、プロジェクトとそのリソース（クラスター、データベース、コレクション）を表示する権限があります。 

#### Cluster Admin\{#cluster-admin}

Cluster Admin ロールには、プロジェクトを表示し、そのリソース（クラスター、データベース、コレクション）を管理する権限があります。 

Project Read-Write ロールの権限に加えて、Cluster Admin はクラスターのスケーリング、一時停止、再開などのクラスター操作を実行できます。

### プロジェクトロールとアクセスの比較\{#project-role-and-access-comparison}

以下の表では、異なるプロジェクトロールの権限を簡単に比較できます。

**On-demand compute**

| Operation | Project Admin | Cluster Admin | Project Read/Write | Project Read-Only |
| --- | --- | --- | --- | --- |
| On-Demand Cluster の作成 | ✅ | ❌ | ❌ | ❌ |
| On-Demand Cluster の一覧と詳細の表示 | ✅ | ✅ | ✅ | ✅ |
| On-Demand Cluster の変更、名前変更、または削除 | ✅ | ❌ | ❌ | ❌ |
| On-demand Compute でのデータベースの作成 | ✅ | ✅ | ✅ | ❌ |
| On-demand Compute でのデータベース一覧の表示 | ✅ | ✅ | ✅ | ❌ |
| On-demand Compute でのデータベースの削除 | ✅ | ❌ | ❌ | ❌ |
| On-demand Compute のデータベース内でのコレクションの作成または削除 | ✅ | ✅ | ✅ | ❌ |
| On-demand Compute のデータベース内のコレクションへのデータインポート | ✅ | ✅ | ✅ | ❌ |
| On-Demand Cluster を介した Query、Search、または Get の実行 | ✅ | ✅ | ✅ | ✅ |
| Managed Volume または External Volume の作成 | ✅ | ❌ | ❌ | ❌ |

**Cluster operations**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| クラスターの作成 | ✅ | ❌ | ❌ | ❌ |
| クラスターの削除 | ✅ | ❌ | ❌ | ❌ |
| Cluster Query CU のスケーリング | ✅ | ✅ | ❌ | ❌ |
| Cluster Replica のスケーリング | ✅ | ✅ | ❌ | ❌ |
| クラスターの一時停止 | ✅ | ✅ | ❌ | ❌ |
| クラスターの再開 | ✅ | ✅ | ❌ | ❌ |
| クラスター一覧の表示 | ✅ | ✅ | ✅ | ✅ |
| クラスター詳細の表示 | ✅ | ✅ | ✅ | ✅ |
| クラスターのメトリクスの表示 | ✅ | ✅ | ✅ | ✅ |

**Cluster users**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| Cluster User 一覧の表示 | ✅ | ✅ | ✅ | ✅ |
| Cluster User の作成 | ✅ | ✅ | ❌ | ❌ |
| Cluster User のパスワードのリセット | ✅ | ✅ | ❌ | ❌ |
| Cluster User の削除 | ✅ | ✅ | ❌ | ❌ |

**Audit logs**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| Audit Logs の有効化 | ✅ | ✅ | ❌ | ❌ |
| Audit Logs 設定の編集 | ✅ | ✅ | ❌ | ❌ |
| Audit Logs の無効化 | ✅ | ✅ | ❌ | ❌ |
| Audit Logs のステータスの表示 | ✅ | ✅ | ✅ | ✅ |

**Data plane operations**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| コレクションの作成 | ✅ | ✅ | ✅ | ❌ |
| コレクションの削除 | ✅ | ✅ | ✅ | ❌ |
| コレクションの一覧表示/詳細表示 | ✅ | ✅ | ✅ | ✅ |
| Insert/Upsert | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ✅ | ❌ |
| Query/Search/Get | ✅ | ✅ | ✅ | ✅ |
| Bulk Import | ✅ | ✅ | ✅ | ❌ |
| その他すべての RESTful 操作 | ✅ | ✅ | ✅ | Depends |

<Admonition type="info" icon="📘" title="📘 Notes">

Cluster Admin と Project Read-Write の両方のロールは、同じデータプレーン権限を共有します。       

</Admonition>

**Backup and restore**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| バックアップ一覧の表示 | ✅ | ✅ | ✅ | ✅ |
| バックアップの作成 | ✅ | ✅ | ❌ | ❌ |
| クラスターバックアップファイルの新しいクラスターへの復元 | ✅ | ❌ | ❌ | ❌ |
| コレクションバックアップファイルの既存クラスターへの復元 | ✅ | ✅ | ❌ | ❌ |
| クラスターバックアップの削除 | ✅ | ✅ | ❌ | ❌ |

**Volume**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| ボリューム一覧の表示 | ✅ | ✅ | ✅ | ✅ |
| ボリュームの作成 | ✅ | ❌ | ❌ | ❌ |
| ボリュームの削除 | ✅ | ❌ | ❌ | ❌ |

**Migration**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| 移行ジョブの表示 | ✅ | ✅ | ✅ | ✅ |
| 移行ジョブの作成 | ✅ | ✅ | ❌ | ❌ |
| 移行ジョブのキャンセル | ✅ | ✅ | ❌ | ❌ |
| 移行ジョブの詳細の表示（移行済みコレクション/データベースの表示） | ✅ | ✅ | ✅ | ✅ |

**Jobs**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| ジョブ一覧の表示 | ✅ | ✅ | ✅ | ✅ |
| ジョブ詳細の表示 | ✅ | ✅ | ✅ | ✅ |
| ジョブのキャンセル | ✅ | ✅ | ❌ | ❌ |
| ジョブの再試行 | ✅ | ✅ | ❌ | ❌ |

**Project alerts**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| アラート一覧の表示 | ✅ | ✅ | ✅ | ✅ |
| アラートの作成 | ✅ | ✅ | ✅ | ✅ |
| アラートの編集 | ✅ | ✅ | ✅ | ✅ |
| アラートの削除 | ✅ | ✅ | ✅ | ✅ |
| アラート履歴の表示 | ✅ | ✅ | ✅ | ✅ |

**Collaborators**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| Project Collaborator の招待 | ✅ | ❌ | ❌ | ❌ |
| Project Collaborator のロールの編集 | ✅ | ❌ | ❌ | ❌ |
| Project Collaborator の削除 | ✅ | ❌ | ❌ | ❌ |

**Cluster IP allowlist**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| Cluster IP Allowlist の表示 | ✅ | ✅ | ✅ | ✅ |
| IP Address の Cluster IP Allowlist への追加 | ✅ | ❌ | ❌ | ❌ |
| Cluster IP Allowlist 内の IP Address の変更 | ✅ | ❌ | ❌ | ❌ |
| Cluster IP Allowlist からの IP Address の削除 | ✅ | ❌ | ❌ | ❌ |

**Private endpoints**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| Private Endpoint 一覧の表示 | ✅ | ✅ | ✅ | ✅ |
| Private Endpoint の作成 | ✅ | ❌ | ❌ | ❌ |
| Private Endpoint の削除 | ✅ | ❌ | ❌ | ❌ |

**CMEK**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| CMEK 一覧の表示 | ✅ | ✅ | ✅ | ✅ |
| CMEK の追加 | ✅ | ❌ | ❌ | ❌ |
| CMEK の削除 | ✅ | ❌ | ❌ | ❌ |

**Integrations**

| **Operation** | **Project Admin** | **Cluster Admin** | **Project Read-Write** | **Project Read-Only** |
| --- | --- | --- | --- | --- |
| Integrations 一覧の表示 | ✅ | ✅ | ✅ | ✅ |
| Datadog Integration の表示 | ✅ | ✅ | ✅ | ✅ |
| Datadog Integration の作成 | ✅ | ❌ | ❌ | ❌ |
| Datadog Integration 設定の編集 | ✅ | ❌ | ❌ | ❌ |
| Datadog Integration の削除 | ✅ | ❌ | ❌ | ❌ |
| Storage Integration の表示 | ✅ | ✅ | ✅ | ✅ |
| Storage Integration の作成 | ✅ | ❌ | ❌ | ❌ |
| Storage Integration の削除 | ✅ | ❌ | ❌ | ❌ |

## 招待を取り消す、または再送する\{#revoke-or-resend-an-invitation}

同じ組織内のプロジェクトに既存の組織メンバーを招待すると、そのユーザーは個別の招待を受け取ることなく自動的にそのプロジェクトへアクセスできるようになります。ただし、まだ所属していない組織内のプロジェクトに誰かを招待した場合、そのユーザーには組織に参加するための招待が送られ、それによって指定されたプロジェクトへのアクセス権も付与されます。

![CKuxwsNxihJzNtbQ4fBc1xHRnxf](https://zdoc-images.s3.us-west-2.amazonaws.com/CKuxwsNxihJzNtbQ4fBc1xHRnxf.png)

招待を取り消す、または再送するには、**Organization Owner** または **Project Admin** である必要があります。

<Admonition type="info" icon="📘" title="📘 Notes">

ユーザーが承諾する前であれば、招待を取り消す、または再送できます。

</Admonition>

## コラボレーターのロールを編集する\{#edit-a-collaborators-role}

ユーザーが招待を承諾すると、プロジェクトコラボレーターになります。

コラボレーターのロールを編集するには、**Organization Owner** または **Project Admin** である必要があります。

![DCvMwB44UhQdXRbmxdUc493ynJb](https://zdoc-images.s3.us-west-2.amazonaws.com/DCvMwB44UhQdXRbmxdUc493ynJb.png)

## コラボレーターを削除する\{#remove-a-collaborator}

プロジェクトコラボレーターを削除するには、**Organization Owner** または **Project Admin** である必要があります。

![HKpow0x7qheStnb0zcOcDlyunHc](https://zdoc-images.s3.us-west-2.amazonaws.com/HKpow0x7qheStnb0zcOcDlyunHc.png)

## プロジェクトから退出する\{#leave-a-project}

プロジェクトからコラボレーターを削除することに加えて、退出することで自分自身を削除することもできます。

![DTwiwN0AThgVZLb60dMcSblDnsb](https://zdoc-images.s3.us-west-2.amazonaws.com/DTwiwN0AThgVZLb60dMcSblDnsb.png)

プロジェクトには常に少なくとも 1 人の Project Admin が必要なため、自分がそのプロジェクトの唯一の管理者である場合は退出できません。

<Admonition type="info" icon="📘" title="🚧 Warning">

プロジェクトから退出すると、そのプロジェクトおよび関連リソースへのアクセス権は取り消されます。

</Admonition>

