---
title: "Azure Blob Storageとの統合 | Cloud"
slug: /integrate-with-azure-blob-storage
sidebar_label: "Azure Blob Storage"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、Azure Blob Storageと統合して、バックアップファイルまたは監査ログを指定されたコンテナーにエクスポートできます。 | Cloud"
type: origin
token: IzXPwUlJ5isTa4kH9KTcC6SfnvZ
sidebar_position: 3
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - サードパーティ
  - サービス
  - azure
  - blob
  - ストレージ
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data

---

import Admonition from '@theme/Admonition';


# Azure Blob Storageとの統合

Zilliz Cloudでは、[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)と統合して、バックアップファイルまたは監査ログを指定されたコンテナーにエクスポートできます。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、<strong>エンタープライズ</strong>プロジェクト内の<strong>専用</strong>クラスターでのみ利用可能です。</p>

</Admonition>

以下の図は、Zilliz CloudおよびAzureポータルで必要な手順を示しています。

![EFqDwDiAIhoOPXbvLBDcO7DrnJd](/img/EFqDwDiAIhoOPXbvLBDcO7DrnJd.png)

## 始める前に\{#before-you-start}

- Zilliz CloudをAzure Blobと統合するには、プロジェクトに**組織オーナー**または**プロジェクト管理者**のアクセス権が必要です。必要な権限がない場合は、Zilliz Cloud管理者に連絡してください。

- Azureポータルへの管理アクセス権が必要です。

## ステップ1：Zilliz Cloudで統合を開始\{#step-1-start-integration-on-zilliz-cloud}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. プロジェクトページで、左側のナビゲーションペインから**統合**に移動します。

1. **Azure Blob Storage**セクションで、**+ 統合**をクリックします。

    ![Pxw7bG0keosOCDxfVdmcCC1rnBg](/img/Pxw7bG0keosOCDxfVdmcCC1rnBg.png "Pxw7bG0keosOCDxfVdmcCC1rnBg")

1. 表示されるダイアログボックスで、**基本設定**を完了します：

    - **統合名**：この統合の一意の名前（例：`container_for_backup`）。

    - **統合の説明**（オプション）：この統合の説明（例：`for backupfile export`）。

    次に、**次へ**をクリックして続行します。

## ステップ2：Azureポータルでコンテナーを作成\{#step-2-create-a-container-on-azure-portal}

1. [Azureポータル](https://portal.azure.com/#home)にログインします。

1. 検索バーに**ストレージアカウント**と入力し、オプションを選択します。

    ![integrate-with-azure-blob-1](/img/integrate-with-azure-blob-1.png "integrate-with-azure-blob-1")

1. **ストレージアカウント**ページで、既存のストレージアカウントを選択するか、**+ 作成**をクリックして新しいアカウントを設定します。**注：**ストレージアカウントは、Zilliz Cloudクラスターと同じリージョンにある必要があります。

    ![integrate-with-azure-blob-2](/img/integrate-with-azure-blob-2.png "integrate-with-azure-blob-2")

1. ストレージアカウントの詳細ページで、**データストレージ** > **コンテナー**に移動し、**+ コンテナー**をクリックします。

    ![S3Evbdfp1o5JWnxhCkEcUZktnme](/img/S3Evbdfp1o5JWnxhCkEcUZktnme.png "S3Evbdfp1o5JWnxhCkEcUZktnme")

1. 表示されるパネルで、コンテナー名を入力します。Zilliz Cloudコンソールでこのコンテナー名が必要になるため、メモを取っておいてください。

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻り、**Azure Blob Storageコンテナーの作成**ステップの設定を完了します：

    - **Zilliz Cloudクラスターリージョン**：Zilliz Cloudクラスターが存在するクラウドリージョンを選択します。

    - **ストレージアカウント名**：Azureストレージアカウント名を入力します。

    - **コンテナー名**：作成したコンテナーの名前を入力します。

    次に、**次へ**をクリックして続行します。

    ![integrate-with-azure-blob-3](/img/integrate-with-azure-blob-3.png "integrate-with-azure-blob-3")

## ステップ3：アプリケーションを登録し、資格情報を追加\{#step-3-register-an-application-and-add-credential}

1. [Azureポータル](https://portal.azure.com/#home)に戻り、**アプリ登録**を検索して選択します。

    ![integrate-with-azure-blob-4](/img/integrate-with-azure-blob-4.png "integrate-with-azure-blob-4")

1. **アプリケーションの登録**ページで、**+ 新しい登録**をクリックします。

    ![integrate-with-azure-blob-5](/img/integrate-with-azure-blob-5.png "integrate-with-azure-blob-5")

1. **アプリケーションの登録**パネルで、アプリケーションの名前を入力し、他のフィールドはデフォルト設定のままにして、**登録**をクリックします。

    ![RLaubwh94oRrLqxf8R4cd3xvnPg](/img/RLaubwh94oRrLqxf8R4cd3xvnPg.png "RLaubwh94oRrLqxf8R4cd3xvnPg")

1. アプリケーションの**概要**ページで、**アプリケーション（クライアント）ID**と**ディレクトリ（テナント）ID**をコピーします。これらの値はZilliz Cloudコンソールで必要になります。

    ![Dgwnbb77ToK38Vx8WHdcN2ylnSh](/img/Dgwnbb77ToK38Vx8WHdcN2ylnSh.png "Dgwnbb77ToK38Vx8WHdcN2ylnSh")

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻り、コピーした**アプリケーション（クライアント）ID**と**ディレクトリ（テナント）ID**を**新規アプリケーションの登録**ステップに入力します。

    また、Zilliz Cloudが提供する**クラスター発行者URL**、**サービス名**、**サービスアカウント名**をメモしてください。これらの値はAzureポータルで必要になります。

1. [Azureポータル](https://portal.azure.com/#home)のアプリケーションページに戻ります。**管理** > **証明書とシークレット** > **連携クレデンシャル**に移動し、**+ 資格情報の追加**をクリックします。

    ![UGgmb9dKnoPlk9xtrFvcDl3Dnfd](/img/UGgmb9dKnoPlk9xtrFvcDl3Dnfd.png "UGgmb9dKnoPlk9xtrFvcDl3Dnfd")

1. **資格情報の追加**パネルで、資格情報設定を構成します：

    - **連携クレデンシャルのシナリオ**：**KubernetesがAzureリソースにアクセス**を選択します。

    - **クラスター発行者URL**：Zilliz Cloudが提供した値を入力します。

    - **名前空間**：**milvus-tool**に設定します。

    - **サービスアカウント名**：**milvus-bucket**に設定します。

    - **名前**： カスタム名を入力します（例：**zilliz**を含めて明確にします）。

    - **オーディエンス**： デフォルト値を使用します。

    次に、**追加**をクリックしてクレデンシャルを保存します。

    ![integrate-with-azure-blob-7](/img/integrate-with-azure-blob-7.png "integrate-with-azure-blob-7")

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻り、**次へ**をクリックして続行します。

## ステップ4：ロールの割り当てを追加\{#step-4-add-role-assignment}

1. [Azureポータル](https://portal.azure.com/#home)で、**アクセス制御（IAM）** > **+ 追加** > **ロールの割り当ての追加**に移動します。

    ![integrate-with-azure-blob-6](/img/integrate-with-azure-blob-6.png "integrate-with-azure-blob-6")

1. **ロールのタブ**ページで、**ストレージBLOBデータ共同作成者**ロールを選択します。

    ![CXjcbs7q9oitdRxKzkhcrhnznh0](/img/CXjcbs7q9oitdRxKzkhcrhnznh0.png "CXjcbs7q9oitdRxKzkhcrhnznh0")

1. **メンバー**タブで、ロールを割り当てる登録済みアプリケーションを選択します。

    ![SbSgbe9tzo45z3xtKLicm64ingc](/img/SbSgbe9tzo45z3xtKLicm64ingc.png "SbSgbe9tzo45z3xtKLicm64ingc")

1. **レビュー + 割り当て**タブで、**レビュー + 割り当て**をクリックして確認します。

## ステップ5：検証して統合を作成\{#step-5-validate-and-create-integration}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)で、**統合の検証**をクリックし、コンテナーとロール割り当ての設定が有効であることを確認します。

1. 検証が成功すると、**作成**をクリックして統合を確定します。

Azure Blob Storageは、バックアップファイルをエクスポートするためにZilliz Cloudと統合されました。詳細については、[バックアップファイルのエクスポート](./export-backup-files)を参照してください。

## 統合の管理\{#manage-integrations}

統合が追加されると、その詳細を表示したり、必要に応じて統合を削除したりできます。

![DN2GbaT6momqNzxZeLwc0fe2nuh](/img/DN2GbaT6momqNzxZeLwc0fe2nuh.png "DN2GbaT6momqNzxZeLwc0fe2nuh")

## トラブルシューティング\{#troubleshooting}

- **検証エラー：**

    統合の検証が失敗する場合は、以下を確認してください：

    - AzureストレージアカウントとZilliz Cloudクラスターリージョンが一致している。

    - すべてのアプリケーションID、テナントID、およびクレデンシャルの詳細が正しい。

- **権限の問題：**

    Zilliz CloudとAzureポータルの両方で必要な権限があることを確認してください。