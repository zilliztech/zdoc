---
title: "Google Cloud Storage との統合 | Cloud"
slug: /integrate-with-gcp
sidebar_key: integrate-with-gcp
sidebar_label: "Google Cloud Storage"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、Google Cloud Storage と連携して、監査ログやバックアップファイルを指定されたバケットにエクスポートできます。| Cloud"
type: origin
token: INoRwFTjfiindPkaNlwc9XAgnkh
sidebar_position: 3
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - サードパーティ
  - サービス
  - google
  - クラウド
  - ストレージ

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Google Cloud Storage との統合

Zilliz Cloud では、[Google Cloud Storage](https://cloud.google.com/storage) と統合して、監査ログやバックアップファイルを指定されたバケットにエクスポートできます。

以下の図は、Zilliz Cloud および Google Admin コンソールで必要な手順を示しています。

![UNmxw6LdCh60Dob3j7KcHGxynkg](https://zdoc-images.s3.us-west-2.amazonaws.com/UNmxw6LdCh60Dob3j7KcHGxynkg.png)

## 始める前に\{#before-you-start}

- Zilliz Cloud を GCP と統合するには、プロジェクトに対する**組織オーナー**または**プロジェクト管理者**のアクセス権限が必要です。必要な権限をお持ちでない場合は、Zilliz Cloud の管理者にお問い合わせください。

- Google Admin コンソールへの管理アクセス権限があります。

## ステップ 1: Zilliz Cloud コンソールで統合を開始する\{#step-1-start-integration-in-zilliz-cloud-console}

<Supademo id="cmdzpf4ze0t2bh5wkphtbn39l" title="Step 1: Start integration in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. プロジェクトページで、左側のナビゲーションペインから**統合**へ移動します。

1. **Google Cloud Storage バケット**セクションで、**+ 統合**をクリックします。

1. 表示されたダイアログボックスで、**基本設定**を入力します：

    - **統合名**: この統合用の一意の名前（例：`bucket_for_auditlog`）。

    - **統合の説明** *(オプション)*: この統合の説明（例：`for auditlog export`）。

    次に、**次へ**をクリックして [ステップ 2](./integrate-with-gcp#step-2-create-a-role-in-google-admin-console) に進みます。

</Procedures>

## ステップ 2: Google Admin コンソールでロールを作成する\{#step-2-create-a-role-in-google-admin-console}

<Supademo id="cmdzqastn0uw1h5wklj65425w" title="Step 2: Create role in Google Admin console" />

<Procedures>

1. [Google Admin コンソール](https://admin.google.com/) にログインします。

1. [IAM と管理 / ロール](https://console.cloud.google.com/iam-admin/roles) ページに移動し、**+ ロールの作成**をクリックします。

1. 表示されたページで、ロールの設定を構成し、ロールに権限を追加します：

    1. ロールの**タイトル**と**ID**をカスタマイズします（例：`Zillizバケットロール`）。必要に応じて**説明**も追加します。

    1. **+ 権限の追加**をクリックし、以下の最小限の権限をロールに割り当てます：

        - `storage.buckets.get`

        - `storage.objects.create`

        - `storage.objects.list`

        - `storage.objects.get`

1. **作成**をクリックします。

</Procedures>

## ステップ 3: Google Admin コンソールでバケットを作成する\{#step-3-create-a-bucket-in-google-admin-console}

<Supademo id="cme0qzcy102dbg56jx7ucft1c" title="Step 3: Create a bucket in Google Admin console (1)" />

<Procedures>

1. Google Cloud Storage の **[バケット](https://console.cloud.google.com/storage/browser)** ページに移動します。

1. **+ 作成**をクリックします。

1. **バケットの作成**ページで、バケットの情報を入力します。以下の各ステップの後、**続行**をクリックして次のステップに進みます：

    1. **開始**セクションで、[バケット名の要件](https://cloud.google.com/storage/docs/buckets#naming) を満たすグローバルに一意の名前を入力します。後で Zilliz Cloud コンソールに入力する必要があるため、バケット名を控えておきます。

    1. **データの保存場所を選択**セクションで：

        1. [ロケーションタイプ](https://cloud.google.com/storage/docs/locations) として**リージョン**を選択します。**マルチリージョン**または**デュアルリージョン**オプションは選択しないでください。

        1. 次に、バケットを作成したいリージョンを選択します。選択したロケーションは、Zilliz Cloud クラスターが存在するクラウドリージョンと同じである必要があります。

1. **作成**をクリックします。

</Procedures>

バケットが作成されたら、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻り、以下を実行します：

<Supademo id="cme0rnexv02mng56joiwb4wrg" title="Step 3: Create a bucket in Google Admin console (2)" />

<Procedures>

1. **Google Cloud Storage 統合の追加**ダイアログボックスで、**ステップ 3 - Google Cloud Storage バケットの作成**に進みます。

    1. **Zilliz Cloud クラスターリージョン**で、Zilliz Cloud クラスターのクラウドリージョンを選択します。このリージョンは、バケットが作成されたリージョンと同じである必要があります。

    1. **バケット名**に、作成したバケットの名前を入力します。

1. 次に、**次へ**をクリックします。

1. その後、Zilliz Cloud コンソールから Google Cloud サービスアカウントをコピーします。これは、[ステップ 4](./integrate-with-gcp#step-4-grant-access-to-bucket-in-google-admin-console) でバケットへのアクセス権を付与する際に必要になります。

</Procedures>

## ステップ 4: Google Admin コンソールでバケットへのアクセス権を付与する\{#step-4-grant-access-to-bucket-in-google-admin-console}

<Supademo id="cme0s7wmr02phg56jw9hix3q1" title="Step 4: Grant access to bucket in Google Admin console" />

<Procedures>

1. [Google Admin コンソール](https://console.cloud.google.com/storage/) で、[ステップ 3](./integrate-with-gcp#step-3-create-a-bucket-in-google-admin-console) で作成したバケットの詳細ページに移動します。

1. **権限**タブで、**アクセス権の付与**をクリックします。

1. **プリンシパルの追加**エリアに、Zilliz Cloud コンソールから取得した**Google サービスアカウント**を貼り付けます。

1. **ロールの割り当て**エリアで、[ステップ 2](./integrate-with-gcp#step-2-create-a-role-in-google-admin-console) で作成したロールを選択します。

1. **保存**をクリックします。

</Procedures>

## ステップ 5: 統合の検証と追加\{#step-5-validate-and-add-integration}

<Supademo id="cme0siceh02thg56jeh3wlbgw" title="Step 5: Validate and add integration" />

バケットへのアクセス権を付与したら、Zilliz Cloud コンソールに戻り、以下を実行します：

<Procedures>

1. **統合の検証**をクリックして、コンテナとロールの割り当て設定が有効であることを確認します。

1. 検証が成功したら、**追加**をクリックして統合を完了します。

</Procedures>

これで、Google Cloud Storage が Zilliz Cloud と統合され、監査ログやバックアップファイルをエクスポートできるようになりました。詳細については、[監査ログ](./audit-logs) または [バックアップファイルのエクスポート](./export-backup-files) を参照してください。

## プログラムによるストレージ統合の作成\{#create-storage-integration-programmatically}

Zilliz Cloud コンソールを使用する代わりに、ストレージ統合をプログラムで作成することもできます。

<Procedures>

1. バケットを作成します。

    詳細については、上記の [Google Admin コンソールでバケットを作成](./integrate-with-gcp#step-3-create-a-bucket-in-google-admin-console)または [Create a bucket](https://docs.cloud.google.com/storage/docs/creating-buckets#console) API ドキュメントを参照してください。

1. 認証情報を生成します。

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
        "regionId": "gcp-us-central1",
        "bucketName": "my-bucket"
    }'
    ```

    上記のリクエストにより、Google Admin コンソールで権限とロールを作成するために必要な認証情報が生成されます。

    レスポンス例は次のとおりです。

    ```bash
    {
        "code": 0,
        "data": {
            "permission": [
                "storage.objects.get",
                "storage.objects.create",
                "storage.objects.list",
                "storage.buckets.get"
            ],
            "googleCloudServiceAccount": "zilliz-xxxx@vdc-dev-test.iam.gserviceaccount.com"
        }
    }
    ```

    パラメータの詳細については、[Generate Storage Integration Authorization Materials](/reference/restful/generate-storage-integration-authorization-materials-v2)を参照してください。

1. 返された `permission` と `googleCloudServiceAccount` を使用して、バケットを操作するための十分な権限を持つロールを作成します。

    次のステップで使用するため、作成したロールのサービスアカウントメールアドレスを記録します。ロールの作成方法については、上記の [Google Admin コンソールでロールを作成](./integrate-with-gcp#step-2-create-a-role-in-google-admin-console)を参照してください。

1. 取得した認証情報を検証します。

    リクエストで、`externalCred.gcpProjectId` を GCP プロジェクト ID に、`externalCred.serviceAccountEmail` を前のステップで作成したロールのサービスアカウントメールアドレスに設定します。

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
            "gcpProjectId": "my-gcp-project",
            "serviceAccountEmail": "bucket-access@my-gcp-project.iam.gserviceaccount.com"
        }
    }'
    ```

    検証が成功した場合のレスポンスは次のとおりです。

    ```bash
    {
        "code": 0,
        "data": {
            "success": true,
            "message": ""
        }
    }
    ```

    パラメータの詳細については、[Validate Storage Integration](/reference/restful/validate-storage-integration-v2)を参照してください。

1. ストレージ統合を作成します。

    このリクエストは、`description` が追加される点を除き、検証リクエストとほとんど同じパラメータを使用します。

    ```bash
    curl --request POST \
    --url "${BASE_URL}/v2/storageIntegrations" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "name": "analytics-gcp",
        "description": "GCP bucket for external tables",
        "regionId": "gcp-us-central1",
        "bucketName": "my-bucket",
        "externalCred": {
            "gcpProjectId": "my-gcp-project",
            "serviceAccountEmail": "bucket-access@my-gcp-project.iam.gserviceaccount.com"
        }
    }'
    ```

    レスポンスは次のようになります。

    ```bash
    {
        "code": 0,
        "data": {
            "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
            "name": "analytics-gcp"
        }
    }
    ```

    パラメータの詳細については、[Create Storage Integration](/reference/restful/create-storage-integration-v2)を参照してください。

</Procedures>


## 統合の管理\{#manage-integrations}

統合が追加されると、必要に応じてその詳細を表示したり、統合を削除したりできます。

![FKLYbB02LoDDA9xENiYccBTun5e](https://zdoc-images.s3.us-west-2.amazonaws.com/fklybb02lodda9xeniyccbtun5e.png "FKLYbB02LoDDA9xENiYccBTun5e")

### 統合 ID の取得\{#obtain-the-integration-id}

RESTful API を使用する場合は、**View Details** をクリックして統合の詳細を表示し、統合 ID をコピーします。

また、次のコマンドを実行して統合 ID を取得することもできます。

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
                "name": "analytics-gcp",
                "status": "ACTIVE",
                "message": "",
                "regionId": "gcp-us-central1",
                "bucketName": "my-bucket"
            }
        ],
        "count": 1,
        "currentPage": 1,
        "pageSize": 10
    }
}
```

パラメータの詳細については、[List Storage Integrations](/reference/restful/list-storage-integrations-v2)を参照してください。

### 統合の詳細を表示\{#view-integration-details}

次のコマンドを使用して統合の詳細を表示できます。

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
        "name": "analytics-s3",
        "description": "GCP bucket for external tables",
        "status": "ACTIVE",
        "message": "",
        "regionId": "gcp-us-central1",
        "bucketName": "my-bucket",
        "externalCred": {
            "roleArn": "arn:aws:iam::123456789012:role/zilliz-bucket-role",
            "externalId": "zilliz-external-AbCdEf12345678"
        },
        "createTime": "2024-07-30T16:49:50Z"
    }
}
```

パラメータの詳細については、[Describe Storage Integration](/reference/restful/describe-storage-integration-v2)を参照してください。

### ストレージ統合の削除\{#delete-storage-integration}

Zilliz Cloud コンソールで **Remove** をクリックする代わりに、次のコマンドを使用して不要なストレージ統合を削除できます。

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
        "name": "analytics-gcp"
    }
}
```

パラメータの詳細については、[Delete Storage Integration](/reference/restful/delete-storage-integration-v2)を参照してください。


## よくある質問\{#faq}

### 検証中に「バケットリージョンが一致しません」というエラーが表示されるのはなぜですか？\{#why-do-i-get-a-bucket-region-not-match-error-during-validation}

このエラーは、以下の 2 つの理由で発生する可能性があります：

1. バケットの**ロケーションタイプ**として**マルチリージョン**または**デュアルリージョン**を選択しました。Zilliz Cloud は単一の**リージョン**バケットのみをサポートしています。

1. **ロケーションタイプ**として**リージョン**を選択しましたが、選択したリージョンが Zilliz Cloud クラスターのリージョンと完全に一致していません。

例えば、Zilliz Cloud クラスターが `us-east1` にある場合、バケットは `us-east1` リージョンに作成する必要があります。マルチリージョンの「米国」や、`us-west1` のような別のリージョンには作成しないでください。

バケットが間違った**ロケーションタイプ**またはリージョンで作成された場合は、それを削除し、正しい単一リージョン設定で再作成してください。
