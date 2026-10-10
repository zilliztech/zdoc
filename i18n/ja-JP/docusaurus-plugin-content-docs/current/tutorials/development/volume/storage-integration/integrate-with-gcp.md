---
title: "Google Cloud Storage との連携 | Cloud"
slug: /integrate-with-gcp
sidebar_label: "Google Cloud Storage"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、Google Cloud Storage と連携して、監査ログやバックアップファイルを指定したバケットにエクスポートできます。 | Cloud"
type: origin
token: INoRwFTjfiindPkaNlwc9XAgnkh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Google Cloud Storage との連携

Zilliz Cloud では、[Google Cloud Storage](https://cloud.google.com/storage) と連携して、監査ログやバックアップファイルを指定したバケットにエクスポートできます。

次の図は、Zilliz Cloud と Google Admin コンソールで必要な手順を示しています。

![UNmxw6LdCh60Dob3j7KcHGxynkg](https://zdoc-images.s3.us-west-2.amazonaws.com/UNmxw6LdCh60Dob3j7KcHGxynkg.png)

## 事前準備\{#before-you-start}

- Zilliz Cloud と GCP を連携するには、プロジェクトに対する **Organization Owner** または **Project Admin** のアクセス権を持っていること。必要な権限がない場合は、Zilliz Cloud 管理者にお問い合わせください。

- Google Admin コンソールへの管理者アクセス権を持っていること。

## ステップ 1: Zilliz Cloud コンソールで連携を開始する\{#step-1-start-integration-in-zilliz-cloud-console}

<Supademo id="cmdzpf4ze0t2bh5wkphtbn39l" title="Step 1: Start integration in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. プロジェクトページで、左側のナビゲーションペインから **Integrations** に移動します。

1. **Google Cloud Storage Bucket** セクションで、**+ Integration** をクリックします。

1. 表示されたダイアログボックスで、**Basic Settings** を設定します：

    - **Integration Name**: この連携の一意の名前（例: `bucket_for_auditlog`）。

    - **Integration Description** *（任意）*: この連携の説明（例: `for auditlog export`）。

    次に、**Next** をクリックして、[ステップ 2](./integrate-with-gcp#step-2-create-a-role-in-google-admin-console) に進みます。

</Procedures>

## ステップ 2: Google Admin コンソールでロールを作成する\{#step-2-create-a-role-in-google-admin-console}

<Supademo id="cmdzqastn0uw1h5wklj65425w" title="Step 2: Create role in Google Admin console" />

<Procedures>

1. [Google Admin コンソール](https://admin.google.com/) にログインします。

1. [IAM & Admin / Roles](https://console.cloud.google.com/iam-admin/roles) ページに移動し、**+ Create role** をクリックします。

1. 表示されたページで、ロールの設定を構成し、ロールに権限を追加します：

    1. ロールの **Title** と **ID** をカスタマイズし（例: `ZillizBucketRole`）、必要に応じて **Description** を追加します。

    1. **+ Add permissions** をクリックし、ロールに次の最小権限を割り当てます：

        - `storage.buckets.get`

        - `storage.objects.create`

        - `storage.objects.list`

        - `storage.objects.get`

1. **Create** をクリックします。

</Procedures>

## ステップ 3: Google Admin コンソールでバケットを作成する\{#step-3-create-a-bucket-in-google-admin-console}

<Supademo id="cme0qzcy102dbg56jx7ucft1c" title="Step 3: Create a bucket in Google Admin console (1)" />

<Procedures>

1. Google Cloud Storage の **[Buckets](https://console.cloud.google.com/storage/browser)** ページに移動します。

1. **+ Create** をクリックします。

1. **Create a bucket** ページで、バケット情報を入力します。次の各手順の後で **Continue** をクリックして、次の手順に進みます：

    1. **Get started** セクションで、[バケット名の要件](https://cloud.google.com/storage/docs/buckets#naming) を満たすグローバルに一意の名前を入力します。Zilliz Cloud コンソールでこの名前を入力する必要があるため、バケット名を控えておいてください。

    1. **Choose where to store your data** セクションで：

        1. [ロケーションタイプ](https://cloud.google.com/storage/docs/locations) として **Region** を選択します。**Multi-region** または **Dual-region** オプションは選択しないでください。

        1. 次に、バケットを作成するリージョンを選択します。選択するロケーションは、Zilliz Cloud クラスターが存在するクラウドリージョンと同じである必要があります。

1. **Create** をクリックします。

</Procedures>

バケットが作成されたら、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻り、次の操作を行います：

<Supademo id="cme0rnexv02mng56joiwb4wrg" title="Step 3: Create a bucket in Google Admin console (2)" />

<Procedures>

1. **Add Google Cloud Storage Integration** ダイアログボックスで、**Step 3 - Create Google Cloud Storage Bucket** に進みます。

    1. **Zilliz Cloud クラスターリージョン** で、Zilliz Cloud クラスターのクラウドリージョンを選択します。このリージョンは、バケットを作成したリージョンと同じである必要があります。

    1. **Bucket Name** に、作成したバケットの名前を入力します。

1. 次に、**Next** をクリックします。

1. その後、Zilliz Cloud コンソールから Google Cloud サービスアカウントをコピーします。これは、[ステップ 4](./integrate-with-gcp#step-4-grant-access-to-bucket-in-google-admin-console) でバケットへのアクセスを許可するときに必要になります。

</Procedures>

## ステップ 4: Google Admin コンソールでバケットへのアクセスを許可する\{#step-4-grant-access-to-bucket-in-google-admin-console}

<Supademo id="cme0s7wmr02phg56jw9hix3q1" title="Step 4: Grant access to bucket in Google Admin console" />

<Procedures>

1. [Google Admin コンソール](https://console.cloud.google.com/storage/) で、[ステップ 3](./integrate-with-gcp#step-3-create-a-bucket-in-google-admin-console) で作成したバケットの詳細ページに移動します。

1. **Permissions** タブで、**Grant access** をクリックします。

1. **Add principals** エリアで、Zilliz Cloud コンソールから取得した **Google Service Account** を貼り付けます。

1. **Assign roles** エリアで、[ステップ 2](./integrate-with-gcp#step-2-create-a-role-in-google-admin-console) で作成したロールを選択します。

1. **Save** をクリックします。

</Procedures>

## ステップ 5: 連携を検証して追加する\{#step-5-validate-and-add-integration}

<Supademo id="cme0siceh02thg56jeh3wlbgw" title="Step 5: Validate and add integration" />

バケットへのアクセスを許可したら、Zilliz Cloud コンソールに戻り、次の操作を行います：

<Procedures>

1. **Validate Integration** をクリックして、コンテナーとロールの割り当ての設定が有効であることを確認します。

    <Admonition type="info" title="Notes">

    検証には通常約 2 分かかりますが、場合によっては 7 分以上かかることがあります。

    </Admonition>

1. 検証が成功したら、**Add** をクリックして連携を確定します。

</Procedures>

これで、Google Cloud Storage が Zilliz Cloud と連携され、監査ログやバックアップファイルをエクスポートできるようになりました。詳細については、[監査ログ](./audit-logs) または [バックアップファイルのエクスポート](./export-backup-files) を参照してください。

## ストレージ連携をプログラムから作成する\{#create-storage-integration-programmatically}

Zilliz Cloud コンソールで操作する代わりに、ストレージ連携をプログラムから作成することもできます。

<Procedures>

1. バケットを作成します。

    詳細については、前述の [Google Admin コンソールでバケットを作成する](./integrate-with-gcp#step-3-create-a-bucket-in-google-admin-console) または [Create a bucket](https://docs.cloud.google.com/storage/docs/creating-buckets#console) API ドキュメントを参照してください。

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

    上記のリクエストは、GCP 管理コンソールで権限とロールを作成するために必要な認証情報を生成します。

    応答の例は以下の通りです。

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

    パラメーターの説明の詳細については、[Generate Storage Integration Authorization Materials](/reference/restful/generate-storage-integration-authorization-materials-v2) を参照してください。

1. 返された `permission` と `googleCloudServiceAccount` を使用して、バケットを操作するための十分な権限を持つロールを作成します。

    次のステップのために、作成したロールのサービスアカウントのメールアドレスを控えておきます。ロールの作成方法の詳細については、前述の [Google Admin コンソールでロールを作成する](./integrate-with-gcp#step-2-create-a-role-in-google-admin-console) を参照してください。

1. 取得した認証情報を検証します。

    リクエストで、`externalCred.gcpProjectId` に GCP プロジェクト ID を設定し、`externalCred.serviceAccountEmail` に前の手順で作成したロールのものを設定します。

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

    検証に成功した場合の応答は以下の通りです。

    ```bash
    {
        "code": 0,
        "data": {
            "success": true,
            "message": ""
        }
    }
    ```

    パラメーターの説明の詳細については、[Validate Storage Integration](/reference/restful/validate-storage-integration-v2) を参照してください。

1. ストレージ連携を作成します。

    このリクエストは、`description` が追加されている点を除き、検証リクエストとほとんどのパラメーターを共有します。

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

    応答は以下の通りです。

    ```bash
    {
        "code": 0,
        "data": {
            "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
            "name": "analytics-gcp"
        }
    }
    ```

    パラメーターの説明の詳細については、[Create Storage Integration](/reference/restful/create-storage-integration-v2) を参照してください。

</Procedures>

## 連携の管理\{#manage-integrations}

連携を追加したら、必要に応じてその詳細を表示したり、連携を削除したりできます。

![FKLYbB02LoDDA9xENiYccBTun5e](https://zdoc-images.s3.us-west-2.amazonaws.com/fklybb02lodda9xeniyccbtun5e.png "FKLYbB02LoDDA9xENiYccBTun5e")

### 連携 ID を取得する\{#obtain-the-integration-id}

RESTful API を使用して、Zilliz Cloud と連携している AWS S3 バケットの 1 つにバックアップファイルをエクスポートする必要がある場合は、**View Details** をクリックして連携の詳細を表示し、その連携 ID をコピーします。

または、次のコマンドを実行して連携 ID を取得することもできます。

```bash
export TOKEN="YOUR_API_KEY"

curl --request GET \
--url "${BASE_URL}/v2/storageIntegrations?projectId=proj-xxxxxxxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

応答は以下の通りです。

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

パラメーターの説明の詳細については、[List Storage Integrations](/reference/restful/list-storage-integrations-v2) を参照してください。

### 連携の詳細を表示する\{#view-integration-details}

次のコマンドを使用して、連携の詳細を表示できます。

```bash
export integrationId="integ-xxxxxxxxxxxxxxxxxxx"

curl --request GET \
--url "${BASE_URL}/v2/storageIntegrations/${integrationId}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

応答は以下の通りです。

```bash
{
    "code": 0,
    "data": {
        "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
        "name": "analytics-gcp",
        "description": "GCP bucket for external tables",
        "status": "ACTIVE",
        "message": "",
        "regionId": "gcp-us-central1",
        "bucketName": "my-bucket",
        "externalCred": {
            "gcpProjectId": "my-gcp-project",
            "serviceAccountEmail": "bucket-access@my-gcp-project.iam.gserviceaccount.com"
        },
        "createTime": "2024-07-30T16:49:50Z"
    }
}
```

パラメーターの説明の詳細については、[Describe Storage Integration](/reference/restful/describe-storage-integration-v2) を参照してください。

### ストレージ連携を削除する\{#delete-storage-integration}

Zilliz Cloud コンソールで **Remove** をクリックする方法の代替として、次のコマンドを使用して不要なストレージ連携を削除できます。

```bash
export integrationId="integ-xxxxxxxxxxxxxxxxxxx"

curl --request DELETE \
--url "${BASE_URL}/v2/storageIntegrations/${integrationId}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

応答は以下の通りです。

```bash
{
    "code": 0,
    "data": {
        "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
        "name": "analytics-gcp"
    }
}
```

パラメーターの説明の詳細については、[Delete Storage Integration](/reference/restful/delete-storage-integration-v2) を参照してください。

## FAQ\{#faq}

### 検証中に「bucket region not match」エラーが発生するのはなぜですか？\{#why-do-i-get-a-bucket-region-not-match-error-during-validation}

このエラーは 2 つの理由で発生する可能性があります：

1. バケットの **Location type** として **Multi-region** または **Dual-region** を選択しています。Zilliz Cloud は単一の **Region** バケットのみをサポートします。

1. **Location type** として **Region** を選択していますが、選択したリージョンが Zilliz Cloud クラスターのリージョンと正確に一致していません。

たとえば、Zilliz Cloud クラスターが `us-east1` にある場合、バケットは `us-east1` リージョンに作成する必要があります。Multi-region の「United States」や、`us-west1` のような別の Region に作成しないでください。

バケットを誤った **Location type** またはリージョンで作成した場合は、そのバケットを削除し、正しい単一の Region 設定で再作成します。

### 「403 PermissionDenied」エラーが発生するのはなぜですか？\{#why-do-i-get-a-403-permissiondenied-error}

アクセスを許可した直後に **403 PermissionDenied** エラーが表示された場合は、待ってから再試行してください。GCP の権限変更は通常約 2 分以内に反映されますが、7 分以上かかることがあります。
