---
title: "Google Cloud Storage と統合する | Cloud"
slug: /integrate-with-gcp
sidebar_label: "Google Cloud Storage"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、Google Cloud Storage と統合して、監査ログまたはバックアップファイルを指定した bucket にエクスポートできます。 | Cloud"
type: origin
token: INoRwFTjfiindPkaNlwc9XAgnkh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Google Cloud Storage と統合する

Zilliz Cloud では、[Google Cloud Storage](https://cloud.google.com/storage) と統合して、監査ログまたはバックアップファイルを指定した bucket にエクスポートできます。

以下の図は、Zilliz Cloud と Google Admin console で必要な手順を示しています。

![UNmxw6LdCh60Dob3j7KcHGxynkg](https://zdoc-images.s3.us-west-2.amazonaws.com/UNmxw6LdCh60Dob3j7KcHGxynkg.png)

## 開始前に\{#before-you-start}

- Zilliz Cloud を GCP と統合するには、対象プロジェクトに対する **Organization Owner** または **Project Admin** のアクセス権が必要です。必要な権限がない場合は、Zilliz Cloud 管理者にお問い合わせください。

- Google Admin console への管理者アクセス権が必要です。

## ステップ 1: Zilliz Cloud console で統合を開始する\{#step-1-start-integration-in-zilliz-cloud-console}

<Supademo id="cmdzpf4ze0t2bh5wkphtbn39l" title="Step 1: Start integration in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) にログインします。

1. プロジェクトページで、左側のナビゲーションペインから **Integrations** に移動します。

1. **Google Cloud Storage Bucket** セクションで、**+ Integration** をクリックします。

1. 表示されるダイアログボックスで、**Basic Settings** を入力します。

    - **Integration Name**: この統合の一意の名前（例: `bucket_for_auditlog`）。

    - **Integration Description** *(optional)*: この統合の説明（例: `for auditlog export`）。

    入力後、**Next** をクリックして [Step 2](./integrate-with-gcp#step-2-create-a-role-in-google-admin-console) に進みます。

</Procedures>

## ステップ 2: Google Admin console でロールを作成する\{#step-2-create-a-role-in-google-admin-console}

<Supademo id="cmdzqastn0uw1h5wklj65425w" title="Step 2: Create role in Google Admin console" />

<Procedures>

1. [Google Admin console](https://admin.google.com/) にログインします。

1. [IAM & Admin / Roles](https://console.cloud.google.com/iam-admin/roles) ページに移動し、**+ Create role** をクリックします。

1. 表示されるページで、ロール設定を構成し、ロールに権限を追加します。

    1. ロールの **Title** と **ID** をカスタマイズし（例: `ZillizBucketRole`）、必要に応じて **Description** を追加します。

    1. **+ Add permissions** をクリックし、以下の最小権限をロールに割り当てます。

        - `storage.buckets.get`

        - `storage.objects.create`

        - `storage.objects.list`

        - `storage.objects.get`

1. **Create** をクリックします。

</Procedures>

## ステップ 3: Google Admin console で bucket を作成する\{#step-3-create-a-bucket-in-google-admin-console}

<Supademo id="cme0qzcy102dbg56jx7ucft1c" title="Step 3: Create a bucket in Google Admin console (1)" />

<Procedures>

1. Google Cloud Storage の **[Buckets](https://console.cloud.google.com/storage/browser)** ページに移動します。

1. **+ Create** をクリックします。

1. **Create a bucket** ページで、bucket 情報を入力します。以下の各ステップの後に、**Continue** をクリックして次のステップに進みます。

    1. **Get started** セクションで、[bucket name requirements](https://cloud.google.com/storage/docs/buckets#naming) を満たすグローバルに一意な名前を入力します。後で Zilliz Cloud console にこの名前を入力する必要があるため、bucket 名を覚えておいてください。

    1. **Choose where to store your data** セクションで次を行います。 

        1. [Location type](https://cloud.google.com/storage/docs/locations) として **Region** を選択します。**Multi-region** または **Dual-region** は選択しないでください。

        1. 次に、bucket を作成するリージョンを選択します。選択する場所は、Zilliz Cloud cluster が配置されているクラウドリージョンと同じである必要があります。

1. **Create** をクリックします。

</Procedures>

bucket の作成後、[Zilliz Cloud console](https://cloud.zilliz.com/login) に戻り、以下を行います。

<Supademo id="cme0rnexv02mng56joiwb4wrg" title="Step 3: Create a bucket in Google Admin console (2)" />

<Procedures>

1. **Add Google Cloud Storage Integration** ダイアログボックスで、**Step 3 - Create Google Cloud Storage Bucket** に進みます。

    1. **Zilliz Cloud Cluster Region** で、Zilliz Cloud cluster のクラウドリージョンを選択します。このリージョンは、bucket を作成したリージョンと同じである必要があります。

    1. **Bucket Name** に、作成した bucket の名前を入力します。

1. 次に、**Next** をクリックします。

1. その後、Zilliz Cloud console から Google Cloud Service Account をコピーします。これは [Step 4](./integrate-with-gcp#step-4-grant-access-to-bucket-in-google-admin-console) で bucket へのアクセス権を付与する際に必要になります。

</Procedures>

## ステップ 4: Google Admin console で bucket へのアクセス権を付与する\{#step-4-grant-access-to-bucket-in-google-admin-console}

<Supademo id="cme0s7wmr02phg56jw9hix3q1" title="Step 4: Grant access to bucket in Google Admin console" />

<Procedures>

1. [Google Admin console](https://console.cloud.google.com/storage/) で、[Step 3](./integrate-with-gcp#step-3-create-a-bucket-in-google-admin-console) で作成した bucket の詳細ページに移動します。

1. **Permissions** タブで、**Grant access** をクリックします。

1. **Add principals** 領域に、Zilliz Cloud console から取得した **Google Service Account** を貼り付けます。

1. **Assign roles** 領域で、[Step 2](./integrate-with-gcp#step-2-create-a-role-in-google-admin-console) で作成したロールを選択します。

1. **Save** をクリックします。

</Procedures>

## ステップ 5: 統合を検証して追加する\{#step-5-validate-and-add-integration}

<Supademo id="cme0siceh02thg56jeh3wlbgw" title="Step 5: Validate and add integration" />

bucket へのアクセス権を付与したら、Zilliz Cloud console に戻って以下を行います。

<Procedures>

1. **Validate Integration** をクリックして、container とロール割り当ての設定が有効であることを確認します。

1. 検証が成功したら、**Add** をクリックして統合を完了します。

</Procedures>

これで、監査ログまたはバックアップファイルをエクスポートするために Google Cloud Storage が Zilliz Cloud と統合されました。詳細については、[Audit Logging](./audit-logs) または [Export Backup Files](./export-backup-files) を参照してください。

## プログラムでストレージ統合を作成する\{#create-storage-integration-programmatically}

Zilliz Cloud console を操作する代替手段として、プログラムでストレージ統合を作成することもできます。

<Procedures>

1. bucket を作成します。

    詳細については、上記の [Google Admin Console で bucket を作成する](./integrate-with-gcp#step-3-create-a-bucket-in-google-admin-console) または [Create a bucket](https://docs.cloud.google.com/storage/docs/creating-buckets#console) API ドキュメントを参照してください。

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

    上記のリクエストにより、GCP admin console で権限とロールを作成するために必要な認証情報が生成されます。 

    応答例は次のとおりです。

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

    パラメータの説明については、[Generate Storage Integration Authorization Materials](/reference/restful/generate-storage-integration-authorization-materials-v2) を参照してください。

1. 返された `permission` と `googleCloudServiceAccount` を使用して、bucket を操作するための十分な権限を持つロールを作成します。 

    次のステップのために、作成したロールの service account email を控えておいてください。ロールの作成方法の詳細については、上記の [Google Admin console でロールを作成する](./integrate-with-gcp#step-2-create-a-role-in-google-admin-console) を参照してください。

1. 取得した認証情報を検証します。

    リクエストでは、`externalCred.gcpProjectId` に GCP project ID を、`externalCred.serviceAccountEmail` に前のステップで作成したロールのものを設定します。

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

    検証成功時の応答は次のとおりです。

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

    このリクエストは、検証リクエストのパラメータのほとんどを共有し、追加で `description` を含みます。

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

    応答は次のようになります。

    ```bash
    {
        "code": 0,
        "data": {
            "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
            "name": "analytics-gcp"
        }
    }
    ```

    パラメータの説明については、[Create Storage Integration](/reference/restful/create-storage-integration-v2) を参照してください。

</Procedures>

## 統合を管理する\{#manage-integrations}

統合が追加されると、その詳細を表示したり、必要に応じて統合を削除したりできます。

![FKLYbB02LoDDA9xENiYccBTun5e](https://zdoc-images.s3.us-west-2.amazonaws.com/fklybb02lodda9xeniyccbtun5e.png "FKLYbB02LoDDA9xENiYccBTun5e")

### integration ID を取得する\{#obtain-the-integration-id}

Zilliz Cloud と統合された AWS S3 bucket のいずれかにバックアップファイルをエクスポートするために RESTful API を使用する必要がある場合は、**View Details** をクリックして統合の詳細を表示し、その integration ID をコピーします。

または、次のコマンドを実行して integration ID を取得することもできます。

```bash
export TOKEN="YOUR_API_KEY"

curl --request GET \
--url "${BASE_URL}/v2/storageIntegrations?projectId=proj-xxxxxxxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

応答は次のようになります。

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

パラメータの説明については、[List Storage Integrations](/reference/restful/list-storage-integrations-v2) を参照してください。

### 統合の詳細を表示する\{#view-integration-details}

次のコマンドを使用して統合の詳細を表示できます。

```bash
export integrationId="integ-xxxxxxxxxxxxxxxxxxx"

curl --request GET \
--url "${BASE_URL}/v2/storageIntegrations/${integrationId}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

応答は次のようになります。

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

応答は次のようになります。

```bash
{
    "code": 0,
    "data": {
        "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
        "name": "analytics-gcp"
    }
}
```

パラメータの説明については、[Delete Storage Integration](/reference/restful/delete-storage-integration-v2) を参照してください。

## FAQ\{#faq}

### 検証中に "bucket region not match" エラーが表示されるのはなぜですか？\{#why-do-i-get-a-bucket-region-not-match-error-during-validation}

このエラーは、次の 2 つの理由で発生する可能性があります。

1. bucket の **Location type** として **Multi-region** または **Dual-region** を選択した場合。Zilliz Cloud は単一の **Region** bucket のみをサポートします。

1. **Location type** として **Region** を選択したものの、選択したリージョンが Zilliz Cloud cluster のリージョンと完全に一致していない場合。

たとえば、Zilliz Cloud cluster が `us-east1` にある場合、bucket も `us-east1` リージョンに作成する必要があります。Multi-region の "United States" や、`us-west1` のような別の Region ではいけません。

bucket を誤った **Location type** またはリージョンで作成してしまった場合は、削除して、正しい単一 Region 設定で再作成してください。
