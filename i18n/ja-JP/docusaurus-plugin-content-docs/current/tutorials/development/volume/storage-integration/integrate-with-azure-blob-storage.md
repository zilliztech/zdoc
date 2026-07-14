---
title: "Azure Blob Storage と統合する | Cloud"
slug: /integrate-with-azure-blob-storage
sidebar_label: "Azure Blob Storage"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、バックアップファイルや監査ログを指定したコンテナにエクスポートするために Azure Blob Storage と統合できます。 | Cloud"
type: origin
token: IzXPwUlJ5isTa4kH9KTcC6SfnvZ
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Azure Blob Storage と統合する

Zilliz Cloud では、[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) と統合して、バックアップファイルや監査ログを指定したコンテナにエクスポートできます。

以下の図は、Zilliz Cloud と Azure Portal で必要な手順を示しています。

![EFqDwDiAIhoOPXbvLBDcO7DrnJd](https://zdoc-images.s3.us-west-2.amazonaws.com/EFqDwDiAIhoOPXbvLBDcO7DrnJd.png)

## 始める前に\{#before-you-start}

- Zilliz Cloud を Azure Blob と統合するには、プロジェクトに対する **Organization Owner** または **Project Admin** のアクセス権が必要です。必要な権限がない場合は、Zilliz Cloud 管理者にお問い合わせください。

- Azure Portal への管理者アクセス権を持っていること。

## ステップ 1: Zilliz Cloud で統合を開始する\{#step-1-start-integration-on-zilliz-cloud}

<Procedures>

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) にログインします。

1. プロジェクトページで、左側のナビゲーションペインから **Integrations** に移動します。

1. **Azure Blob Storage** セクションで、**+ Integration** をクリックします。

    ![Pxw7bG0keosOCDxfVdmcCC1rnBg](https://zdoc-images.s3.us-west-2.amazonaws.com/pxw7bg0keosocdxfvdmccc1rnbg.png "Pxw7bG0keosOCDxfVdmcCC1rnBg")

1. 表示されるダイアログボックスで、**Basic Settings** を入力します。

    - **Integration Name**: この統合の一意の名前（例: `container_for_backup`）。

    - **Integration Description** *(optional)*: この統合の説明（例: `for backupfile export`）。

    入力後、**Next** をクリックして進みます。

</Procedures>

## ステップ 2: Azure Portal でコンテナを作成する\{#step-2-create-a-container-on-azure-portal}

<Procedures>

1. [Azure Portal](https://portal.azure.com/#home) にログインします。

1. 検索バーに **Storage accounts** と入力し、そのオプションを選択します。

    ![integrate-with-azure-blob-1](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-1.png "integrate-with-azure-blob-1")

1. **Storage accounts** ページで、既存のストレージアカウントを選択するか、**+ Create** をクリックして新しいものを設定します。**Note:** ストレージアカウントは、Zilliz Cloud クラスターと同じリージョンにある必要があります。

    ![integrate-with-azure-blob-2](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-2.png "integrate-with-azure-blob-2")

1. ストレージアカウントの詳細ページで、**Data Storage** > **Containers** に進み、**+ Container** をクリックします。

    ![S3Evbdfp1o5JWnxhCkEcUZktnme](https://zdoc-images.s3.us-west-2.amazonaws.com/s3evbdfp1o5jwnxhckecuzktnme.png "S3Evbdfp1o5JWnxhCkEcUZktnme")

1. 表示されるパネルで、コンテナ名を入力します。このコンテナ名は Zilliz Cloud console で必要になるため、控えておいてください。

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) に戻り、**Create Azure Blob Storage Container** ステップで設定を完了します。

    - **Zilliz Cloud Cluster Region**: Zilliz Cloud クラスターが配置されているクラウドリージョンを選択します。

    - **Storage Account Name**: Azure ストレージアカウント名を入力します。

    - **Container Name**: 作成したコンテナの名前を入力します。

    入力後、**Next** をクリックして進みます。

    ![integrate-with-azure-blob-3](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-3.png "integrate-with-azure-blob-3")

</Procedures>

## ステップ 3: アプリケーションを登録して認証情報を追加する\{#step-3-register-an-application-and-add-credential}

<Procedures>

1. [Azure Portal](https://portal.azure.com/#home) に戻り、**App registrations** を検索して選択します。

    ![integrate-with-azure-blob-4](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-4.png "integrate-with-azure-blob-4")

1. **Application registrations** ページで、**+ New registration** をクリックします。

    ![integrate-with-azure-blob-5](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-5.png "integrate-with-azure-blob-5")

1. **Register an application** パネルで、アプリケーション名を入力し、他のフィールドはデフォルト設定のままにして、**Register** をクリックします。

    ![RLaubwh94oRrLqxf8R4cd3xvnPg](https://zdoc-images.s3.us-west-2.amazonaws.com/rlaubwh94orrlqxf8r4cd3xvnpg.png "RLaubwh94oRrLqxf8R4cd3xvnPg")

1. アプリケーションの **Overview** ページで、**Application (client) ID** と **Directory (tenant) ID** をコピーします。これらの値は Zilliz Cloud console で必要になります。

    ![Dgwnbb77ToK38Vx8WHdcN2ylnSh](https://zdoc-images.s3.us-west-2.amazonaws.com/dgwnbb77tok38vx8whdcn2ylnsh.png "Dgwnbb77ToK38Vx8WHdcN2ylnSh")

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) に戻り、**Register a New Application** ステップで、コピーした **Application (client) ID** と **Directory (tenant) ID** を入力します。

    また、Zilliz Cloud により提供される **Cluster Issuer URL**、**Service Name**、および **Service Account Name** を控えておいてください。これらの値は Azure Portal で必要になります。

1. [Azure Portal](https://portal.azure.com/#home) のアプリケーションページに戻ります。**Manage** > **Certificates & secrets** > **Federated credentials** に進み、**Add credential** をクリックします。

    ![UGgmb9dKnoPlk9xtrFvcDl3Dnfd](https://zdoc-images.s3.us-west-2.amazonaws.com/uggmb9dknoplk9xtrfvcdl3dnfd.png "UGgmb9dKnoPlk9xtrFvcDl3Dnfd")

1. **Add a credential** パネルで、認証情報の設定を行います。

    - **Federated credential scenario**: **Kubernetes accessing Azure resources** を選択します。

    - **Cluster issuer URL**: Zilliz Cloud から提供された値を入力します。

    - **Namespace**: **milvus-tool** に設定します。

    - **Service account name**: **milvus-bucket** に設定します。

    - **Name**: カスタム名を入力します（例: わかりやすさのために **zilliz** を含める）。

    - **Audience**: デフォルト値を使用します。

    その後、**Add** をクリックして認証情報を保存します。

    ![integrate-with-azure-blob-7](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-7.png "integrate-with-azure-blob-7")

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) に戻り、**Next** をクリックして進みます。

</Procedures>

## ステップ 4: ロール割り当てを追加する\{#step-4-add-role-assignment}

<Procedures>

1. [Azure Portal](https://portal.azure.com/#home) で、**Access Control (IAM)** > **+ Add** > **Add role assignment** に進みます。

    ![integrate-with-azure-blob-6](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-6.png "integrate-with-azure-blob-6")

1. **Job function roles** タブで、**Storage Blob Data Contributor** ロールを選択します。

    ![CXjcbs7q9oitdRxKzkhcrhnznh0](https://zdoc-images.s3.us-west-2.amazonaws.com/cxjcbs7q9oitdrxkzkhcrhnznh0.png "CXjcbs7q9oitdRxKzkhcrhnznh0")

1. **Members** タブで、ロールを割り当てる登録済みアプリケーションを選択します。

    ![SbSgbe9tzo45z3xtKLicm64ingc](https://zdoc-images.s3.us-west-2.amazonaws.com/sbsgbe9tzo45z3xtklicm64ingc.png "SbSgbe9tzo45z3xtKLicm64ingc")

1. **Review + assign** タブで、**Review + assign** をクリックして確認します。

</Procedures>

## ステップ 5: 検証して統合を作成する\{#step-5-validate-and-create-integration}

<Procedures>

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) で、**Validate Integration** をクリックし、コンテナとロール割り当ての設定が有効であることを確認します。

1. 検証に成功したら、**Create** をクリックして統合を完了します。

</Procedures>

これで Azure Blob Storage は、バックアップファイルをエクスポートするために Zilliz Cloud と統合されました。詳細については、[Export Backup Files](./export-backup-files) を参照してください。

## プログラムでストレージ統合を作成する\{#create-storage-integration-programmatically}

Zilliz Cloud console 上で作業する代わりに、プログラムでストレージ統合を作成することもできます。

<Procedures>

1. コンテナを作成します。

    詳細については、上記の [Azure Portal でコンテナを作成する](./integrate-with-gcp#step-3-create-a-bucket-in-google-admin-console) または [Create Container](https://learn.microsoft.com/en-us/rest/api/storageservices/create-container?tabs=microsoft-entra-id) API ドキュメントを参照してください。

1. 認証マテリアルを生成します。

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
    --url "${BASE_URL}/v2/storageIntegrations/authorizationMaterials" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "az-eastus",
        "bucketName": "my-container"
    }'
    ```

    上記のリクエストは、GCP 管理コンソールで権限とロールを作成するために必要な認証情報を生成します。 

    想定されるレスポンスの例は次のとおりです。

    ```bash
    {
        "code": 0,
        "data": {
            "credential": {
                "clusterIssuerUrl": "https://issuer.example.com/",
                "namespace": "milvus-tool",
                "serviceAccountName": "milvus-bucket"
            }
        }
    }
    ```

    パラメータの説明については、[Generate Storage Integration Authorization Materials](/reference/restful/generate-storage-integration-authorization-materials-v2) を参照してください。

1. 返された `clusterIssuerUrl`、`namespace`、および `serviceAccountName` を使用して、アプリケーションを登録し、認証情報を追加します。 

    詳細については、[アプリケーションを登録して認証情報を追加する](./integrate-with-azure-blob-storage#step-3-register-an-application-and-add-credential) を参照してください。

1. 取得した認証情報を検証します。

    リクエストでは、`externalCred.accountName` を Azure Portal に表示される Azure ストレージアカウント名に設定し、`externalCred.clientId` と `externalCred.tenantId` をアプリケーション登録時に控えた値に設定します。

    ```bash
    curl --request POST \
    --url "${BASE_URL}/v2/storageIntegrations/validate" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "gcp-us-central1",
        "bucketName": "my-bucket",
        "externalCred": {
            "accountName": "mystorageaccount",
            "clientId": "00000000-0000-0000-0000-000000000000",
            "tenantId": "11111111-1111-1111-1111-111111111111"
        }
    }'
    ```

    検証成功時のレスポンスは次のとおりです。

    ```bash
    {
        "code": 0,
        "data": {
            "success": true,
            "message": ""
        }
    }
    ```

    パラメータの説明については、[Validate Storage Integration](/reference/restful/validate-storage-integration-v2) を参照してください。

1. ストレージ統合を作成します。

    このリクエストは、`description` が追加されている点を除き、検証リクエストとほとんど同じパラメータを共有します。

    ```bash
    curl --request POST \
    --url "${BASE_URL}/v2/storageIntegrations" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "name": "analytics-azure",
        "description": "Azure container for external tables",
        "regionId": "az-eastus",
        "bucketName": "my-bucket",
        "externalCred": {
            "accountName": "mystorageaccount",
            "clientId": "00000000-0000-0000-0000-000000000000",
            "tenantId": "11111111-1111-1111-1111-111111111111"
        }
    }'
    ```

    レスポンスは次のようになります。

    ```bash
    {
        "code": 0,
        "data": {
            "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
            "name": "analytics-azure"
        }
    }
    ```

    パラメータの説明については、[Create Storage Integration](/reference/restful/create-storage-integration-v2) を参照してください。

</Procedures>

## 統合を管理する\{#manage-integrations}

統合を追加すると、必要に応じてその詳細を表示したり、統合を削除したりできます。

![DN2GbaT6momqNzxZeLwc0fe2nuh](https://zdoc-images.s3.us-west-2.amazonaws.com/dn2gbat6momqnzxzelwc0fe2nuh.png "DN2GbaT6momqNzxZeLwc0fe2nuh")

### 統合 ID を取得する\{#obtain-the-integration-id}

Zilliz Cloud と統合された AWS S3 バケットの 1 つにバックアップファイルをエクスポートするために RESTful API を使用する必要がある場合は、**View Details** をクリックして統合の詳細を表示し、その統合 ID をコピーします。

または、次のコマンドを実行して統合 ID を取得することもできます。

```bash
export TOKEN="YOUR_API_KEY"

curl --request GET \
--url "${BASE_URL}/v2/storageIntegrations?projectId=proj-xxxxxxxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

レスポンスは次のようになります。

```bash
{
    "code": 0,
    "data": {
        "storageIntegrations": [
            {
                "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
                "name": "analytics-azure",
                "status": "ACTIVE",
                "message": "",
                "regionId": "az-eastus",
                "bucketName": "my-bucket"
            }
        ],
        "count": 1,
        "currentPage": 1,
        "pageSize": 10
    }
}
```

パラメータの説明については、[List Storage Integrations](/reference/restful/list-storage-integrations-v2) を参照してください。

### 統合の詳細を表示する\{#view-integration-details}

次のコマンドを使用して統合の詳細を表示できます

```bash
export integrationId="integ-xxxxxxxxxxxxxxxxxxx"

curl --request GET \
--url "${BASE_URL}/v2/storageIntegrations/${integrationId}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

レスポンスは次のようになります。

```bash
{
    "code": 0,
    "data": {
        "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
        "name": "analytics-azure",
        "description": "Azure container for external tables",
        "status": "ACTIVE",
        "message": "",
        "regionId": "az-eastus",
        "bucketName": "my-bucket",
        "externalCred": {
            "roleArn": "arn:aws:iam::123456789012:role/zilliz-bucket-role",
            "externalId": "zilliz-external-AbCdEf12345678"
        },
        "createTime": "2024-07-30T16:49:50Z"
    }
}
```

パラメータの説明については、[Describe Storage Integration](/reference/restful/describe-storage-integration-v2) を参照してください。

### ストレージ統合を削除する\{#delete-storage-integration}

Zilliz Cloud console で **Remove** をクリックする代替方法として、次のコマンドを使用して不要なストレージ統合を削除できます。

```bash
export integrationId="integ-xxxxxxxxxxxxxxxxxxx"

curl --request DELETE \
--url "${BASE_URL}/v2/storageIntegrations/${integrationId}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

レスポンスは次のようになります。

```bash
{
    "code": 0,
    "data": {
        "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
        "name": "analytics-azure"
    }
}
```

パラメータの説明については、[Delete Storage Integration](/reference/restful/delete-storage-integration-v2) を参照してください。

## トラブルシューティング\{#troubleshooting}

- **Validation Errors:**

    統合の検証に失敗した場合は、次を確認してください。

    - Azure ストレージアカウントと Zilliz Cloud クラスターのリージョンが一致していること。

    - すべての Application ID、テナント ID、および認証情報の詳細が正しいこと。

- **Permission Issues:**

    Zilliz Cloud と Azure Portal の両方で必要な権限を持っていることを確認してください。
