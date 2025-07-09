---
title: "トップ>Azure Blob Storage | Cloud"
slug: /integrate-with-azure-blob-storage
sidebar_label: "Azure Blob Storage"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudを使用すると、Azure Blobストレージと統合して、バックアップファイルを指定されたコンテナにエクスポートできます。 | Cloud"
type: origin
token: IzXPwUlJ5isTa4kH9KTcC6SfnvZ
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - third-party
  - services
  - azure
  - blob
  - storage
  - RAG
  - NLP
  - Neural Network
  - Deep Learning

---

import Admonition from '@theme/Admonition';


# トップ>Azure Blob Storage

Zilliz Cloudを使用すると、[Azure Blobストレージ](https://azure.microsoft.com/en-us/products/storage/blobs)と統合して、バックアップファイルを指定されたコンテナにエクスポートできます。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、<strong>Dedicated-Enterprise</strong>プランのクラスターの<strong>プライベートプレビュー</strong>にあります。この機能を有効にするか、関連するコストについては、<a href="https://support.zilliz.com/hc/en-us">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

次の図は、Zilliz CloudとAzure Portalで必要な手順を示しています。

![EFqDwDiAIhoOPXbvLBDcO7DrnJd](/img/EFqDwDiAIhoOPXbvLBDcO7DrnJd.png)

## 始める前に{#before-you-start}

- Zilliz CloudをAzure Blobに統合するには、プロジェクトへの**組織オーナー**または**プロジェクト管理者**のアクセス権が必要です。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

- Azureポータルへの管理アクセス権があります。

## ステップ1: Zilliz Cloudでの統合を開始する{#step-1-start-integration-on-zilliz-cloud}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインしてください。

1. プロジェクトページで、左側のナビゲーションペインから**統合**に移動してください。

1. 「Azure Blob Storage」セクションの下で、「+構成」をクリックしてください。

    ![QmGwb2SJCo0capxmWMJc2CdXnCb](/img/QmGwb2SJCo0capxmWMJc2CdXnCb.png)

1. 表示されるダイアログボックスで、**基本設定**を完了してください:

    - **構成名**:この統合の一意の名前(例: `container_for_backup`)。

    - **構成の説明***(オプション)*:この統合の説明(例: `for backupfile export`)。

    次に、**次へ**をクリックして進んでください。

## ステップ2: Azure Portalでコンテナーを作成する{#step-2-create-a-container-on-azure-portal}

1. [Azureポータル](https://portal.azure.com/#home)にログインしてください。

1. 検索バーに「ストレージアカウント」と入力し、オプションを選択してください。

    ![integrate-with-azure-blob-1](/img/integrate-with-azure-blob-1.png)

1. 「ストレージアカウント」ページで、既存のストレージアカウントを選択するか、「+作成」をクリックして新しいアカウントを設定してください。「注意:」ストレージアカウントは、Zilliz Cloudクラスターと同じリージョンにある必要があります。

    ![integrate-with-azure-blob-2](/img/integrate-with-azure-blob-2.png)

1. ストレージアカウントの詳細ページで、**データストレージ**>**コンテナー**に移動し、**+コンテナー**をクリックしてください。

    ![S3Evbdfp1o5JWnxhCkEcUZktnme](/img/S3Evbdfp1o5JWnxhCkEcUZktnme.png)

1. 表示されたパネルで、コンテナ名を入力してください。Zilliz Cloudコンソールで必要となるため、このコンテナ名をメモしておいてください。

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻り、**Azure Blobストレージコンテナーの作成**ステップで設定を完了してください。

    - **Zilliz Cloudクラスターのリージョン**: Zilliz Cloudクラスターが存在するクラウドリージョンを選択してください。

    - **ストレージアカウント名**: Azureストレージアカウント名を入力してください。

    - **コンテナ名**:作成したコンテナの名前を入力してください。

    次に、**次へ**をクリックして進んでください。

    ![integrate-with-azure-blob-3](/img/integrate-with-azure-blob-3.png)

## ステップ3:アプリケーションを登録し、資格情報を追加する{#step-3-register-an-application-and-add-credential}

1. [Azureポータル](https://portal.azure.com/#home)に戻り、**アプリ登録**を検索して選択してください。

    ![integrate-with-azure-blob-4](/img/integrate-with-azure-blob-4.png)

1. 「アプリケーション登録」ページで、「+新規登録」をクリックしてください。

    ![integrate-with-azure-blob-5](/img/integrate-with-azure-blob-5.png)

1. 「アプリケーションを登録する」パネルで、アプリケーションの名前を入力し、他のフィールドのデフォルト設定を維持してから、「登録する」をクリックしてください。

    ![RLaubwh94oRrLqxf8R4cd3xvnPg](/img/RLaubwh94oRrLqxf8R4cd3xvnPg.png)

1. アプリケーションの「概要」ページで、「アプリケーション（クライアント）ID」と「ディレクトリ（テナント）ID」をコピーしてください。これらの値は、Zilliz Cloudコンソールで必要となります。

    ![Dgwnbb77ToK38Vx8WHdcN2ylnSh](/img/Dgwnbb77ToK38Vx8WHdcN2ylnSh.png)

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻り、コピーした**アプリケーション(クライアント)ID**と**ディレクトリ(テナント)ID**を**新しいアプリケーションの登録**ステップで入力してください。

    また、Zilliz Cloudが提供する**クラスター発行者URL**、**サービス名**、**サービスアカウント名**をメモしてください。これらの値はAzure Portalで必要になります。

1. [Azureポータル](https://portal.azure.com/#home)のアプリケーションページに戻ります。**管理**>**証明書とシークレット**>**フェデレーテッド資格情報**に移動し、**資格情報の追加**をクリックしてください。

    ![UGgmb9dKnoPlk9xtrFvcDl3Dnfd](/img/UGgmb9dKnoPlk9xtrFvcDl3Dnfd.png)

1. [資格情報の追加]パネルで、資格情報の設定を構成します。

    - **フェデレーション資格情報シナリオ**:**KubernetesがAzureリソースにアクセスする**を選択します。

    - **クラスター発行者URL**: Zilliz Cloudが提供する値を入力してください。

    - **名前空間**:**milvus-tool**に設定してください。

    - **サービスアカウント名**:**milvus-bucket**に設定します。

    - **名前**:カスタム名を入力してください(例:明確にするために**zilliz**を含めてください)。

    - **オーディエンス**:デフォルト値を使用します。

    次に、資格情報を保存するために**追加**をクリックしてください。

    ![integrate-with-azure-blob-7](/img/integrate-with-azure-blob-7.png)

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻り、**次へ**をクリックして進んでください。

## ステップ4:役割の割り当てを追加する{#step-4-add-role-assignment}

1. [Azureポータル](https://portal.azure.com/#home)で、**Access Control(IAM)**>**+Add**>**役割割り当ての追加**に移動してください。

    ![integrate-with-azure-blob-6](/img/integrate-with-azure-blob-6.png)

1. 「ジョブ機能の役割」タブで、「ストレージBlobデータ貢献者」の役割を選択してください。

    ![CXjcbs7q9oitdRxKzkhcrhnznh0](/img/CXjcbs7q9oitdRxKzkhcrhnznh0.png)

1. 「メンバー」タブで、登録したアプリケーションを選択して役割を割り当てます。

    ![SbSgbe9tzo45z3xtKLicm64ingc](/img/SbSgbe9tzo45z3xtKLicm64ingc.png)

1. 「レビュー+割り当て」タブで、「レビュー+割り当て」をクリックして確認してください。

## ステップ5:検証して統合を作成する{#step-5-validate-and-create-integration}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)で、**統合の検証**をクリックして、コンテナーとロールの担当ルールが有効であることを確認します。

1. 検証が成功したら、**作成**をクリックして統合を完了してください。

Azure Blob Storageは、バックアップファイルをエクスポートするためにZilliz Cloudと統合されました。詳細については、[バックアップファイルのエクスポート](./export-backup-files)を参照してください。

## インテグレーションの管理{#manage-integrations}

統合が追加されると、その詳細を閲覧可能になり、必要に応じて統合を削除できます。

![DN2GbaT6momqNzxZeLwc0fe2nuh](/img/DN2GbaT6momqNzxZeLwc0fe2nuh.png)

## トラブルシューティング{#troubleshooting}

- **検証エラー:**

    インテグレーションの検証に失敗した場合は、以下を確認してください:

    - Azure StorageアカウントとZilliz Cloudクラスターリージョンが一致します。

    - すべてのアプリケーションID、テナントID、および資格情報の詳細が正しいです。

- **許可の問題:**

    Zilliz CloudとAzure Portalの両方に必要な権限があることを確認してください。