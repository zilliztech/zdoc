---
title: "クラスタ管理 | BYOC"
slug: /manage-cluster
sidebar_label: "クラスタ管理"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudコンソールを最大限に活用して目標を達成するためのクラスタのライフサイクルについて説明します。 | BYOC"
type: origin
token: Py5VwaHKnirdQQkJBxXcmfrunfg
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base

---

import Admonition from '@theme/Admonition';


# クラスタ管理

このガイドでは、Zilliz Cloudコンソールを最大限に活用して目標を達成するためのクラスタのライフサイクルについて説明します。

### クラスタの詳細を表示する{#view-cluster-details}

Zilliz Cloud Dedicatedクラスタを設定した後、クラスタの詳細については、各セクションに以下の内容が記載されています。

![byoc-cluster-lifecycle](/byoc/ja-JP/byoc-cluster-lifecycle.png)

- **Connect**:このセクションでは、クラスターID、クラスタークラウドリージョン、接続用のパブリックエンドポイント、プライベートリンク、IPアドレスホワイトリスト、セキュアアクセス用のトークンなど、クラスターとのやり取りを開始するために必要な詳細情報を提供します。。

- **概要**:クラスタの基本情報のスナップショットを提供します。クラスタプラン、CUタイプ、CU体格、互換性のあるMilvusバージョンを見つけることができます。作成者の詳細、作成日時も表示されます。

- **トポロジ**:クラスターの構造を示すグラフィカルな表現です。これには、さまざまなノードの役割とコンピューティングリソースの指定が含まれます。

    - **プロキシ**:ユーザー接続を管理し、ロードバランサーでサービスアドレスを効率化するステートレスノード。

    - **クエリノード**:ハイブリッドベクトルおよびスカラー検索、および増分データ更新を担当します。

    - **コーディネーター**:オーケストレーションセンターで、ワーカーノード間でタスクを分散します。

    - **データノード**:永続性のためにデータの変異とログからスナップショットへの変換を処理します。

    <Admonition type="info" icon="📘" title="ノート">

    <p>通常、<strong>1-8 CU</strong>を持つクラスターは、小規模なデータセットに適したシングルノードセットアップを使用します。<strong>8 CU</strong>以上のクラスターは、パフォーマンスとスケーラビリティを向上させるために分散型マルチサーバーノードアーキテクチャを採用しています。</p>

    </Admonition>

### 接続を確立する{#establish-connection}

- **クラスタに接続**

    「**接続**」セクションでは、クラスターに接続するために使用される**パブリックエンドポイント**と**トークン**を見つけることができます。トークンは、ユーザー名とパスワードのペアで構成される[APIキー](./manage-api-keys)または[クラスター資格情報](./cluster-credentials)であることができます。

    詳細については、「[クラスタに接続](./connect-to-cluster)」を参照してください。

### コレクションとデータを管理する{#manage-collections-and-data}

- **コレクション**

    [**コレクション**]タブでは、クラスタ内のコレクションを管理できます。コレクションを作成したり、データをインポートしたり、ロードまたはリリースしたり、名前を変更したり、削除したりできます。

    データインポートの詳細については、[データインポート](/docs/data-import)を参照してください。

    ![manage-collections](/byoc/ja-JP/manage-collections.png)

- **バックアップ**

    [**バックアップ**]タブで、[スナップショットの作成]を選択してクラスタのバックアップを作成できます。すべての**スナップショット**は[**バックアップ**]タブにあります。バックアップとリストアの詳細については、「[バックアップ&リストア](/docs/backup-and-restore)」を参照してください。

- **マイグレーション**

    [**Migrations**]タブで、[Migrate]を選択すると、データの**移行**タスクを作成できます。

### ユーザーとアクセス制御{#users-and-access-control}

- **ユーザー**

    [**ユーザー**]タブでは、ユーザーを追加したり、パスワードをリセットしたり、削除したりできます。

    詳細については、[クラスタ資格情報](./cluster-credentials)を参照してください。

    ![manage-users](/byoc/ja-JP/manage-users.png)

    <Admonition type="info" icon="📘" title="ノート">

    <p><b>db_admin</b>を削除することはできません。Zilliz Cloudは、追加されたユーザーに対してクラスタ内のすべてのコレクションへのアクセス権限を付与します。</p>

    </Admonition>

### クラスタの一時停止と再開{#}

「**Actions**」ドロップダウンボタンで、「**Suspend**」を選択してクラスタを停止します。「**Suspend Cluster**」ダイアログボックスでこの操作を確認すると、クラスタの状態が「**RUNNING**」から「**SUSPENDING**」に変わり、その間はクラスタに対して他のアクションを実行できません。

ステータスが**SUSPENDED**に変更されると、ストレージに対してのみ課金されます。クラスタの一部を賢明に一時停止すると、お金を節約できます。

サスペンドされたクラスタを再開するには、**アクション**をクリックし、ドロップダウンメニューから**再開**を選択します。**再開クラスタ**ダイアログボックスでこのアクションを確認すると、クラスタの状態が**SUSPENDED**から**RESUMING**、そして**RUNNING**に変わります。この時点で、CU設定とサービスプランに基づいて完全に請求されます。

これらのアクションを実行するために、RESTful APIを使用することもできます。詳細については、「[クラスタ停止](/reference/restful/suspend-cluster)」と「[クラスタ再開](/reference/restful/resume-cluster)」を参照してください。

### クラスタを削除{#drop-cluster}

[**Actions**]ドロップダウンボタンで、[**Drop**]を選択してクラスタをドロップします。[**Drop Cluster**]ダイアログボックスでこの操作を確認した後、Zilliz Cloudはクラスタをドロップします。

ウェブUIに加えて、クラスタを削除するためのAPIリクエストを行うこともできます。詳細については、[Drop Cluster](/reference/restful/drop-cluster-v2)を参照してください。

## 関連するトピック{#related-topics}

- [クラスタに接続](./connect-to-cluster)

- [バックアップと復元](./backup-and-restore)

- [適切なCUを選択](./cu-types-explained)

