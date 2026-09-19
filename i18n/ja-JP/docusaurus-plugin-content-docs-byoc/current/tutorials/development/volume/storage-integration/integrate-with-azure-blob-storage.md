---
title: "Azure Blob Storage との連携 | BYOC"
slug: /integrate-with-azure-blob-storage
sidebar_label: "Azure Blob Storage"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud の Azure BYOC-I プロジェクトに外部 Azure Blob Storage コンテナへのアクセスを承認する方法について説明します。Microsoft Entra アプリケーションを登録し、BYOC-I AKS ワークロードとのフェデレーション信頼を確立して、対象コンテナへのデータアクセス権をアプリケーションに付与します。 | BYOC"
type: origin
token: Yhh6wS2hdimtdfkMvYXcBi3InyL
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Azure Blob Storage との連携

このページでは、Zilliz Cloud の Azure BYOC-I プロジェクトに外部 Azure Blob Storage コンテナへのアクセスを承認する方法について説明します。Microsoft Entra アプリケーションを登録し、BYOC-I AKS ワークロードとのフェデレーション信頼を確立して、対象コンテナへのデータアクセス権をアプリケーションに付与します。

<Admonition type="info" title="Notes">

この統合では、AKS OIDC のフェデレーション資格情報を使用します。Zilliz Cloud が生成した発行者 URL、Kubernetes 名前空間、サービスアカウント名をコピーしてください。クライアントシークレットは作成も入力もしないでください。

</Admonition>

## アクセスフロー\{#access-flow}

![K4hUwhijuhUI53bwjsycm3vGnFg](https://zdoc-images.s3.us-west-2.amazonaws.com/K4hUwhijuhUI53bwjsycm3vGnFg.png)

## 事前準備\{#before-you-start}

以下を満たしていることを確認してください。

- Azure BYOC-I データプレーンが稼働していること。

- Zilliz Cloud プロジェクトに対する **Organization Owner** または **Project Admin** の権限を持っていること。

- 対象の Microsoft Entra テナントでアプリケーションを登録し、フェデレーション資格情報を追加できること。

- 対象のストレージスコープで Azure ロールの割り当てを作成できること。

- ストレージアカウントが、この統合を使用する BYOC-I データプレーンと同じ Azure リージョンにあること。

<Admonition type="info" title="Notes">

ストレージ統合はリージョン固有です。プロジェクトに複数のリージョンのデータプレーンがある場合は、リージョンごとに個別のストレージアカウントまたはコンテナ統合を構成してください。

</Admonition>

## ステップ 1: Zilliz Cloud で統合を開始する\{#step-1-start-the-integration-in-zilliz-cloud}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com) にログインします。

1. Azure BYOC-I プロジェクトを開き、左側のナビゲーションで **Integrations** を選択します。

1. **Azure Blob Storage** セクションで **+ Integration** をクリックします。

1. 一意の **Integration Name** を入力し、任意で **Integration Description** を入力します。

1. **Next** をクリックします。

</Procedures>

## ステップ 2: 外部ストレージアカウントとコンテナを指定する\{#step-2-specify-the-external-storage-account-and-container}

<Procedures>

1. **Region** で、コンテナにアクセスする BYOC-I データプレーンのリージョンを選択します。

1. Azure ポータルで [Storage accounts](https://portal.azure.com/#browse/Microsoft.Storage/StorageAccounts) を開きます。

1. 同じリージョンにある既存のストレージアカウントを選択するか、新しく作成します。

1. **Data storage > Containers** で、既存のコンテナを選択するか、新しく作成します。

1. Zilliz Cloud に戻り、正確な **Storage Account Name** と **Container Name** を入力します。Blob エンドポイントの URL やパスは入力しないでください。

1. **Next** をクリックします。

</Procedures>

## ステップ 3: アプリケーションを登録し、フェデレーション資格情報を追加する\{#step-3-register-an-application-and-add-a-federated-credential}

<Procedures>

1. Azure ポータルで **Microsoft Entra ID > App registrations** を開き、**+ New registration** をクリックします。

1. 統合を識別しやすい名前を入力します。リダイレクト URI は必要ありません。

1. **Application (client) ID** と **Directory (tenant) ID** をコピーし、Zilliz Cloud に入力します。

1. アプリケーションで **Certificates & secrets > Federated credentials > + Add credential** を選択します。

1. **Federated credential scenario** で **Kubernetes accessing Azure resources** を選択します。

1. Zilliz Cloud から以下の値をコピーします。audience は `api://AzureADTokenExchange` に設定したままにします。

    | Azure のフィールド | Zilliz Cloud の値 |
    | --- | --- |
    | クラスターの発行者 URL | `<CLUSTER_ISSUER_URL>` |
    | 名前空間 | `<NAMESPACE>` |
    | サービスアカウント名 | `<SERVICE_ACCOUNT_NAME>` |

    ```plaintext
    Issuer
    <CLUSTER_ISSUER_URL>
    
    Subject
    system:serviceaccount:<NAMESPACE>:<SERVICE_ACCOUNT_NAME>
    
    Audience
    api://AzureADTokenExchange
    ```

1. フェデレーション資格情報の名前を入力し、**Add** をクリックします。

    <Admonition type="info" title="Notes">

    発行者 URL、名前空間、サービスアカウント名、テナント ID、クライアント ID、または audience が異なると、Microsoft Entra はワークロードトークンを交換できません。

    </Admonition>

</Procedures>

## ステップ 4: アプリケーションに Blob Storage へのアクセス権を付与する\{#step-4-grant-the-application-access-to-blob-storage}

<Procedures>

1. Azure ポータルで対象の **container** を開き、**Access Control (IAM)** を選択します。

1. **+ Add > Add role assignment** をクリックします。

1. **Role** タブで **Job function roles** を選択し、**Storage Blob Data Contributor** を検索して **Next** をクリックします。

1. **Members** タブで **User, group, or service principal** を選択します。ステップ 3 で登録したアプリケーションを選択します。

1. **Review + assign** をクリックします。

    | 設定 | 必要な値 |
    | --- | --- |
    | Role | **Storage Blob Data Contributor** |
    | Member | この統合用に作成した Microsoft Entra アプリケーション |
    | Scope | 現在の Zilliz Cloud コンソールのフローに従った、対象の Blob Storage コンテナ |

</Procedures>

## ステップ 5: 統合の検証と追加\{#step-5-validate-and-add-the-integration}

<Procedures>

1. Zilliz Cloud に戻り、**Validate Integration** をクリックします。

1. ロールの割り当てを最近作成した場合は、Azure RBAC が反映されるまで待ってから検証を再試行してください。

1. ステータスが **Successful** に変わったら、**Add** をクリックします。Azure Blob Storage 統合が、同じ Zilliz Cloud プロジェクトおよびリージョンのサポート対象ワークフローで使用できるようになります。

    <Admonition type="info" title="Notes">

    ワークロード ID と書き込みアクセスを検証するため、検証では `.zilliz-verify-access` という名前のゼロバイトのオブジェクトを対象コンテナにアップロードします。

    </Admonition>

</Procedures>

## セキュリティに関する推奨事項\{#security-recommendations}

- この統合用に専用の Microsoft Entra アプリケーションとフェデレーション資格情報を作成します。

- クライアントシークレットや証明書は作成しないでください。この統合では AKS OIDC ワークロード ID を使用します。

- 現在の統合フローでサポートされる最小のスコープで **Storage Blob Data Contributor** を付与します。

- 匿名 Blob アクセスは無効のままにしておいてください。

- Azure Policy、リソースロック、ストレージファイアウォール、プライベートエンドポイント、またはカスタマーマネージドキーが適用される場合は、BYOC-I データプレーンが引き続きコンテナに到達して使用できることを確認してください。

## トラブルシューティング\{#troubleshooting}

| 検証結果 | 考えられる原因 | 確認事項 |
| --- | --- | --- |
| `AADSTS70021` または一致するフェデレーション ID レコードがない | 発行者、サブジェクト、または audience が AKS サービスアカウントのトークンと一致していません。 | Zilliz Cloud から発行者 URL、名前空間、サービスアカウント名を再度コピーしてください。audience が `api://AzureADTokenExchange` であることを確認してください。 |
| `AuthorizationPermissionMismatch` または HTTP 403 | ロールが存在しないか、スコープが正しくないか、Azure RBAC がまだ反映されていません。 | 対象のストレージスコープで **Storage Blob Data Contributor** がアプリケーションのサービスプリンシパルに割り当てられていることを確認してください。 |
| Container not found | ストレージアカウント名またはコンテナ名が正しくありません。 | `https://`、`.blob.core.windows.net`、または blob パスを含めず、名前だけを入力してください。 |
| 認証は成功するがストレージに到達できない | ストレージファイアウォール、プライベートエンドポイント、DNS 構成、またはネットワークポリシーがアクセスをブロックしています。 | 選択した BYOC-I データプレーンからストレージアカウントのエンドポイントへの接続を確認してください。 |
