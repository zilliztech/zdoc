---
title: "Azure Blob Storage との統合 | Cloud"
slug: /integrate-with-azure-blob-storage
sidebar_key: integrate-with-azure-blob-storage
sidebar_label: "Azure Blob Storage"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、Azure Blob Storage と連携して、バックアップファイルや監査ログを指定されたコンテナーにエクスポートできます。 | Cloud"
type: origin
token: IzXPwUlJ5isTa4kH9KTcC6SfnvZ
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - サードパーティ
  - サービス
  - azure
  - blob
  - storage

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Azure Blob Storage との統合

Zilliz Cloud では、[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) と統合して、バックアップファイルや監査ログを指定されたコンテナにエクスポートできます。

以下の図は、Zilliz Cloud および Azure Portal で必要な手順を示しています。

![EFqDwDiAIhoOPXbvLBDcO7DrnJd](https://zdoc-images.s3.us-west-2.amazonaws.com/EFqDwDiAIhoOPXbvLBDcO7DrnJd.png)

## 始める前に\{#before-you-start}

- Zilliz Cloud を Azure Blob と統合するには、プロジェクトに対する**組織オーナー**または**プロジェクト管理者**のアクセス権が必要です。必要な権限をお持ちでない場合は、Zilliz Cloud の管理者にお問い合わせください。

- Azure Portal への管理アクセス権を持っていること。

## ステップ 1: Zilliz Cloud で統合を開始する\{#step-1-start-integration-on-zilliz-cloud}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. プロジェクトページで、左側のナビゲーションペインから**統合**へ移動します。

1. **Azure Blob Storage**セクションで、**+ 統合**をクリックします。

    ![Pxw7bG0keosOCDxfVdmcCC1rnBg](https://zdoc-images.s3.us-west-2.amazonaws.com/pxw7bg0keosocdxfvdmccc1rnbg.png "Pxw7bG0keosOCDxfVdmcCC1rnBg")

1. 表示されたダイアログボックスで、**基本設定**を入力します：

    - **統合名**: この統合用の一意の名前（例：`container_for_backup`）。

    - **統合の説明** *(オプション)*: この統合の説明（例：`for backupfile export`）。

    その後、**次へ**をクリックして続行します。

</Procedures>

## ステップ 2: Azure Portal でコンテナを作成する\{#step-2-create-a-container-on-azure-portal}

<Procedures>

1. [Azure Portal](https://portal.azure.com/#home) にログインします。

1. 検索バーに**ストレージアカウント**と入力し、該当するオプションを選択します。

    ![integrate-with-azure-blob-1](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-1.png "integrate-with-azure-blob-1")

1. **ストレージアカウント**ページで、既存のストレージアカウントを選択するか、**+ 作成**をクリックして新しいアカウントを設定します。**注:** ストレージアカウントは、Zilliz Cloud クラスターと同じリージョンにある必要があります。

    ![integrate-with-azure-blob-2](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-2.png "integrate-with-azure-blob-2")

1. ストレージアカウントの詳細ページで、**データストレージ** > **コンテナ**へ移動し、**+ コンテナ**をクリックします。

    ![S3Evbdfp1o5JWnxhCkEcUZktnme](https://zdoc-images.s3.us-west-2.amazonaws.com/s3evbdfp1o5jwnxhckecuzktnme.png "S3Evbdfp1o5JWnxhCkEcUZktnme")

1. 表示されたパネルでコンテナ名を入力します。このコンテナ名は後で Zilliz Cloud コンソールで必要になるため、控えておいてください。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻り、**Azure Blob Storage コンテナの作成**ステップで設定を完了します：

    - **Zilliz Cloud クラスターリージョン**: Zilliz Cloud クラスターが存在するクラウドリージョンを選択します。

    - **ストレージアカウント名**: Azure ストレージアカウント名を入力します。

    - **コンテナ名**: 作成したコンテナの名前を入力します。

    その後、**次へ**をクリックして続行します。

    ![integrate-with-azure-blob-3](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-3.png "integrate-with-azure-blob-3")

</Procedures>

## ステップ 3: アプリケーションの登録と資格情報の追加\{#step-3-register-an-application-and-add-credential}

<Procedures>

1. [Azure Portal](https://portal.azure.com/#home) に戻り、**アプリ登録**を検索して選択します。

    ![integrate-with-azure-blob-4](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-4.png "integrate-with-azure-blob-4")

1. **アプリケーション登録**ページで、**+ 新しい登録**をクリックします。

    ![integrate-with-azure-blob-5](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-5.png "integrate-with-azure-blob-5")

1. **アプリケーションの登録**パネルで、アプリケーション名を入力し、他のフィールドはデフォルト設定のままにして、**登録**をクリックします。

    ![RLaubwh94oRrLqxf8R4cd3xvnPg](https://zdoc-images.s3.us-west-2.amazonaws.com/rlaubwh94orrlqxf8r4cd3xvnpg.png "RLaubwh94oRrLqxf8R4cd3xvnPg")

1. アプリケーションの**概要**ページで、**アプリケーション (クライアント) ID**および**ディレクトリ (テナント) ID**をコピーします。これらの値は後で Zilliz Cloud コンソールで必要になります。

    ![Dgwnbb77ToK38Vx8WHdcN2ylnSh](https://zdoc-images.s3.us-west-2.amazonaws.com/dgwnbb77tok38vx8whdcn2ylnsh.png "Dgwnbb77ToK38Vx8WHdcN2ylnSh")

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻り、**新しいアプリケーションの登録**ステップで、コピーした**アプリケーション (クライアント) ID**および**ディレクトリ (テナント) ID**を入力します。

    また、Zilliz Cloud から提供される**クラスター発行者 URL**、**サービス名**、および**サービスアカウント名**を控えておいてください。これらの値は後で Azure Portal で必要になります。

1. [Azure Portal](https://portal.azure.com/#home) のアプリケーションページに戻ります。**管理** > **証明書とシークレット** > **フェデレーション資格情報**へ移動し、**資格情報の追加**をクリックします。

    ![UGgmb9dKnoPlk9xtrFvcDl3Dnfd](https://zdoc-images.s3.us-west-2.amazonaws.com/uggmb9dknoplk9xtrfvcdl3dnfd.png "UGgmb9dKnoPlk9xtrFvcDl3Dnfd")

1. **資格情報の追加**パネルで、資格情報設定を構成します：

    - **フェデレーション資格情報シナリオ**: **Kubernetes による Azure リソースへのアクセス**を選択します。

    - **クラスター発行者 URL**: Zilliz Cloud から提供された値を入力します。

    - **ネームスペース**: **milvus-tool**に設定します。

    - **サービスアカウント名**: **milvus-bucket**に設定します。

    - **名前**: カスタム名を入力します（明確にするために**zilliz**を含めるなど）。

    - **対象ユーザー**: デフォルト値を使用します。

    その後、**追加**をクリックして資格情報を保存します。

    ![integrate-with-azure-blob-7](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-7.png "integrate-with-azure-blob-7")

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻り、**次へ**をクリックして続行します。

</Procedures>

## ステップ 4: ロールの割り当てを追加する\{#step-4-add-role-assignment}

<Procedures>

1. [Azure Portal](https://portal.azure.com/#home) で、**アクセス制御 (IAM)** > **+ 追加** > **ロール割り当ての追加**へ移動します。

    ![integrate-with-azure-blob-6](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-6.png "integrate-with-azure-blob-6")

1. **職務ロール**タブで、**Storage Blob データ Contributor**ロールを選択します。

    ![CXjcbs7q9oitdRxKzkhcrhnznh0](https://zdoc-images.s3.us-west-2.amazonaws.com/cxjcbs7q9oitdrxkzkhcrhnznh0.png "CXjcbs7q9oitdRxKzkhcrhnznh0")

1. **メンバー**タブで、登録したアプリケーションを選択してロールを割り当てます。

    ![SbSgbe9tzo45z3xtKLicm64ingc](https://zdoc-images.s3.us-west-2.amazonaws.com/sbsgbe9tzo45z3xtklicm64ingc.png "SbSgbe9tzo45z3xtKLicm64ingc")

1. **確認 + 割り当て**タブで、**確認 + 割り当て**をクリックして確定します。

</Procedures>

## ステップ 5: 統合の検証と作成\{#step-5-validate-and-create-integration}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) で、**統合の検証**をクリックし、コンテナとロール割り当ての設定が有効であることを確認します。

1. 検証が成功したら、**作成**をクリックして統合を完了します。

</Procedures>

これで、Azure Blob Storage が Zilliz Cloud と統合され、バックアップファイルのエクスポートが可能になりました。詳細については、[バックアップファイルのエクスポート](./export-backup-files) を参照してください。

## 統合の管理\{#manage-integrations}

統合が追加されると、必要に応じてその詳細を表示したり、統合を削除したりできます。

![DN2GbaT6momqNzxZeLwc0fe2nuh](https://zdoc-images.s3.us-west-2.amazonaws.com/dn2gbat6momqnzxzelwc0fe2nuh.png "DN2GbaT6momqNzxZeLwc0fe2nuh")

## トラブルシューティング\{#troubleshooting}

- **検証エラー:**

    統合の検証が失敗した場合、以下を確認してください：

    - Azure ストレージアカウントと Zilliz Cloud クラスターのリージョンが一致していること。

    - すべてのアプリケーション ID、テナント ID、および資格情報の詳細が正しいこと。

- **権限の問題:**

    Zilliz Cloud および Azure Portal の両方で必要な権限を持っていることを確認してください。