---
title: "AWS S3 との統合 | Cloud"
slug: /integrate-with-aws-s3
sidebar_key: integrate-with-aws-s3
sidebar_label: "AWS S3"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、Amazon Simple Storage Service (Amazon S3) と統合して、監査ログを指定の S3 バケットにエクスポートできます。"
type: origin
token: PAViwMSb3iVMzuk56z3c1zfRnwh
sidebar_position: 2
keywords:
  - zilliz
  - ベクトルデータベース
  - cloud
  - バックアップ
  - エクスポート
  - 統合
  - オブジェクト
  - ストレージ

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# AWS S3 との統合

Zilliz Cloud では、Amazon Simple Storage Service (Amazon S3) と統合して、監査ログを指定の S3 バケットにエクスポートできます。

![BUEcwkZiChJrTlbziBMc3V49nFe](https://zdoc-images.s3.us-west-2.amazonaws.com/BUEcwkZiChJrTlbziBMc3V49nFe.png)

## 開始前の準備\{#before-you-start}

- Zilliz Cloud と AWS S3 を統合するには、プロジェクトへの **組織オーナー** または **プロジェクト管理者** アクセス権が必要です。必要な権限がない場合は、Zilliz Cloud の 組織オーナー にお問い合わせください。

- AWS Management Console への管理アクセス権を持っていること。

## ステップ 1: Zilliz Cloud コンソールで統合を開始する\{#step-1-start-integration-in-zilliz-cloud-console}

<Supademo id="cmeibltu49co2h3pytvtdthb2" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします。

1. プロジェクトページで、左側のナビゲーションペインから **Integrations** に移動します。

1. **Amazon S3** セクションで、**+ Integration** をクリックします。

1. 表示されたダイアログボックスで、**基本設定** を構成します：

    - **統合名**: この統合の一意の名前（例：`integration_0819`）。

    - **統合の説明** *(オプション)*: この統合の説明（例：`for export file`）。

    - **バケット Permission**: Zilliz Cloud が S3 バケットに対して持つアクセスレベルを選択します。以下の表で各オプションを説明します。

        <table>
           <tr>
             <th><p><strong>Permission</strong></p></th>
             <th><p><strong>Description</strong></p></th>
           </tr>
           <tr>
             <td><p>Read only</p></td>
             <td><p>Zilliz Cloud はバケットからファイルを読み取ることのみができます。外部コレクションをバックアップする<a href="./external-volume">外部ボリューム</a>に使用します。</p></td>
           </tr>
           <tr>
             <td><p>Read write</p></td>
             <td><p>Zilliz Cloud はバケットへの読み取りと書き込みの両方ができます。<a href="./audit-logs">監査ログ転送</a>または<a href="./configure-access-logs">アクセスログ転送</a>に使用します。</p></td>
           </tr>
        </table>

1. **Next** をクリックします。**Create Amazon S3 バケット** ステップにリダイレクトされます：

    1. **Zilliz Cloud Cluster** **Region** フィールドで、Zilliz Cloud クラスターまたは外部ボリュームが存在するクラウドリージョンを選択します。後で作成するバケットは、Zilliz Cloud クラスターまたはボリュームと同じリージョンに存在する必要があります。

    1. [S3 コンソール](https://us-west-2.console.aws.amazon.com/s3/buckets)を開き、[ステップ 2](./integrate-with-aws-s3) に進みます。

</Procedures>

## ステップ 2: AWS コンソールで S3 バケットを作成する\{#step-2-create-s3-bucket-in-aws-console}

<Supademo id="cmeibt2wt9cx1h3pyrojdocrn" title="Step 2: Create S3 bucket (1)" />

<Procedures>

1. [Amazon S3 コンソール](https://console.aws.amazon.com/s3/)の右上隅で、Zilliz Cloud クラスターまたは外部ボリュームのリージョンと一致する AWS リージョンを選択します。

    <Admonition type="info" icon="📘" title="Notes">

    <ul>
    <li><p>バケットを作成する AWS リージョンは、Zilliz Cloud クラスターまたは外部ボリュームが存在するリージョンと一致している必要があります。Zilliz Cloud でサポートされているリージョンについては、<a href="/docs/cloud-providers-and-regions">クラウドプロバイダーとリージョン</a>を参照してください。</p></li>
    <li><p>異なるリージョンで実行されているクラスターの場合、監査ログを適切にエクスポートできるよう、リージョンごとに個別の統合を作成してください。</p></li>
    </ul>

    </Admonition>

1. 左側のナビゲーションペインで **汎用バケット** を選択し、**Create bucket** をクリックします。

1. バケット設定を構成します：

    1. **バケットタイプ** で **汎用** を選択します。

    1. **バケット名** には、バケットの名前を入力します（例：`zilliz-bucket-for-integration-0819`）。このバケット名は後のステップで必要になるため、覚えておいてください。

    1. その他の設定はデフォルトのままにして、**Create bucket** をクリックします。

    詳細については、[バケットの作成](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html) を参照してください。

</Procedures>

バケットの作成が完了したら、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login)に戻り、以下を実行します：

<Supademo id="cmeibwrd19d3xh3pyx4h7r3d4" title="Step 2: Create S3 bucket (2)" />

<Procedures>

1. **バケット名** フィールドに、先ほど作成したバケットの名前を入力します（この例では `zilliz-bucket-for-integration-0819`）。次に、**Next** をクリックします。

1. **Create IAM Policy** ステップで、JSON ポリシーをコピーします。これは [ステップ 3](./integrate-with-aws-s3) で必要になります。

1. 完了したら、[IAM コンソール](https://console.aws.amazon.com/iam/)を開き、[ステップ 3](./integrate-with-aws-s3) に進みます。

</Procedures>

## ステップ 3: AWS コンソールで IAM ポリシーを作成する\{#step-3-create-iam-policy-in-aws-console}

Zilliz Cloud に AWS S3 へのアクセス権を付与するために、IAM ポリシーを作成します。このポリシーには、Zilliz Cloud と S3 バケット間でのファイル転送を実現するための特定のアクションとリソースを含める必要があります。

<Supademo id="cmeibzhk09d4rh3pyaipwhqi7" title="Step 3: Create IAM policy (1)" />

簡単にするため、JSON エディターを使用してポリシーを作成します。

<Procedures>

1. [IAM コンソール](https://console.aws.amazon.com/iam/)で、**ポリシー** > **Create policy** を選択します。

1. **ポリシーエディター** セクションで、**JSON** オプションを選択します。

1. Zilliz Cloud から提供された JSON ポリシードキュメントをポリシーエディターにコピー＆ペーストします。次に、**Next** をクリックします。

    以下は JSON ポリシードキュメントのサンプルです。統合に合わせた正確なポリシーについては、Zilliz Cloud コンソールの **Create IAM Policy** ステップを参照してください。

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "Statement1",
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:ListBucket",
                    "s3:GetBucketLocation"
                ],
                "Resource": [
                    "arn:aws:s3:::<bucket>",
                    "arn:aws:s3:::<bucket>/*"
                ]
            }
        ]
    }
    ```

    ただし、AWS KMS を使用してバケットのサーバー側暗号化を有効にしている場合は、`kms:Generateデータキー` アクションを許可するために別の IAM ポリシーを追加する必要があります。この場合、以下の JSON ポリシーを使用してください。

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "Statement1",
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:ListBucket",
                    "s3:GetBucketLocation"
                ],
                "Resource": [
                    "arn:aws:s3:::<bucket>",
                    "arn:aws:s3:::<bucket>/*"
                ]
            },
            {
                "Sid": "AllowKMSGenerateDataKey",
                "Effect": "Allow",
                "Action": [
                    "kms:GenerateDataKey"
                ],
                "Resource": "arn:aws:kms:<region>:<account_id>:key/<key_id>"
            }
        ]
    }
    ```

    <Admonition type="info" icon="📘" title="Notes">

    <ul>
    <li><p><code>&lt;bucket&gt;</code> は、実際の S3 バケット名に置き換える必要があります。</p></li>
    <li><p><code>&lt;region&gt;</code>、<code>&lt;account_id&gt;</code>、および <code>&lt;key_id&gt;</code> は、実際の値に置き換える必要があります。詳細については、AWS ドキュメントの <a href="https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-id">キー identifiers</a> を参照してください。</p></li>
    </ul>

    </Admonition>

1. **Review and create** ページで、作成するポリシーの **ポリシー名**（例: `zilliz-policy-for-integration-0819`）と **Description**（オプション）を入力し、**Permissions defined in this policy** を確認します。ポリシー名を覚えておいてください。今後の手順で必要になります。

1. **Create policy** を選択して、新しいポリシーを保存します。完了したら、[ステップ 4](./integrate-with-aws-s3) に進みます。

</Procedures>

## ステップ 4: IAM ロールの作成\{#step-4-create-iam-role}

AWS コンソールで IAM ロールを作成する前に、Zilliz Cloud コンソールで以下を実行してください。

<Supademo id="cmeic3fab9dajh3pyzp50jnck" title="Step 4: Create IAM role (1)" />

<Procedures>

1. Zilliz Cloud コンソールで、**Next** をクリックして **Create IAM ロール** ステップに進みます。

1. **Select trusted entity** で、JSON コンテンツをコピーし、[IAM コンソール](https://console.aws.amazon.com/iam/) に移動します。

</Procedures>

これが完了したら、以下を実行して IAM ロールを作成します。

<Supademo id="cmeic6bis9dgth3pybfmk8143" title="Step 4: Create IAM role (2)" />

<Procedures>

1. [IAM コンソール](https://console.aws.amazon.com/iam/) で、**ロールs** > **Create role** を選択します。

1. **カスタム信頼ポリシー** ロールタイプを選択します。

1. **カスタム信頼ポリシー** セクションで、ロール用のカスタム信頼ポリシーをコピーして貼り付けます。次に、**Next** をクリックします。

    以下はサンプルの JSON 信頼ポリシーです。統合に合わせた正確な信頼ポリシーについては、Zilliz Cloud コンソールの **Create IAM ロール** ステップを参照してください。

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "sts:AssumeRole",
                "Principal": {
                    "AWS": "965570967084"
                },
                "Condition": {
                    "StringEquals": {
                        "sts:ExternalId": "my-external-id"
                    }
                }
            }
        ]
    }
    ```

    <Admonition type="info" icon="📘" title="Notes">

    <p><code>965570967084</code> および <code>my-external-id</code> は、Zilliz Cloud コンソールの <strong>Create IAM ロール</strong> ステップに表示される実際の AWS アカウント ID と外部 ID に置き換える必要があります。</p>

    </Admonition>

1. **Add permissions** ステップの **権限ポリシー** で、[ステップ 3](./integrate-with-aws-s3) で作成したポリシーを検索して選択し、権限を追加します。次に、**Next** をクリックします。

1. **名前を付けて確認し、作成** ステップで、ロール名（例: `zilliz-integration-role-0819`）を入力し、設定を確認します。次に、**Create role** をクリックします。

1. 作成したロールの詳細ページに移動し、ロールに対応する **ARN** をコピーします。これは [ステップ 5](./integrate-with-aws-s3#step-5-validate-and-add-integration) で Zilliz Cloud コンソールで必要になります。

</Procedures>

## ステップ 5: 統合の検証と追加\{#step-5-validate-and-add-integration}

<Supademo id="cmeicbdyz9dprh3py2wwbguvn" title="Step 5: Validate and add integration" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) の **Create IAM ロール** ステップで、前のステップで IAM コンソールからコピーした **ARN** を貼り付けます。

1. 次に、**統合の検証** をクリックして、S3 バケットと IAM ロールの設定を確認します。

1. ステータスが **成功** に変わると、統合が機能します。次に、**Add** をクリックします。

</Procedures>

これで、この統合を使用して監査ログを Amazon S3 バケットに転送できます。詳細については、[監査ログ](./audit-logs)を参照してください。

## 統合の管理\{#manage-integrations}

統合が追加されたら、必要に応じてその詳細を表示したり、統合を削除したりできます。

![YODhb5leToWLsjxGRrpcyuZNnPb](https://zdoc-images.s3.us-west-2.amazonaws.com/yodhb5letowlsjxgrrpcyuznnpb.png "YODhb5leToWLsjxGRrpcyuZNnPb")

### 統合IDの取得\{#obtain-the-integration-id}

RESTful API を使用して、Zilliz Cloud と統合された AWS S3 バケットのいずれかにファイルをエクスポートする必要がある場合は、**View Details** をクリックして統合の詳細を表示し、その統合 ID をコピーします。

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
                "name": "analytics-s3",
                "status": "ACTIVE",
                "message": "",
                "regionId": "aws-us-west-2",
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
        "description": "S3 bucket for external tables",
        "status": "ACTIVE",
        "message": "",
        "regionId": "aws-us-west-2",
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
        "name": "analytics-s3"
    }
}
```

パラメータの詳細については、[Delete Storage Integration](/reference/restful/delete-storage-integration-v2)を参照してください。

## トラブルシューティング\{#troubleshooting}

統合プロセス中に問題が発生した場合、以下に一般的なエラーメッセージとその解決策を示します。

### バケットリージョンの不一致\{#bucket-region-mismatch}

**説明**: S3 バケットのリージョンが Zilliz Cloud クラスターのリージョンと一致しない場合、以下の例のようなエラーが発生します。

```plaintext
"bucket region not match, want[us-west-1] got[us-west-2]"
```

**ソリューション**:

- S3 バケットが配置されている AWS リージョンが、Zilliz Cloud クラスターのリージョンと一致していることを確認してください。

- 必要に応じて、正しいリージョンに新しいバケットを作成するか、クラスターのリージョンをバケットのリージョンに合わせて調整してください。

### バケット not found\{#bucket-not-found}

**説明**: このエラーは、指定された S3 バケットが存在しないか、バケット名が正しくない場合に発生します。

```plaintext
check bucket failed: get bucket location: operation error S3: GetBucketLocation, https response error StatusCode: 404, RequestID: ..., HostID: ..., api error NoSuchBucket: The specified bucket does not exis
```

**ソリューション**:

- Zilliz Cloud コンソールと AWS S3 コンソールの両方でバケット名を再確認してください。

- バケットが存在し、その名前が Zilliz Cloud の設定に正しく入力されていることを確認してください。

### Access denied for bucket location\{#access-denied-for-bucket-location}

**説明**: このエラーは、IAM ロールに S3 バケットの場所へアクセスするために必要な権限がない場合に発生します。

```plaintext
check bucket failed: get bucket location: operation error S3: GetBucketLocation, https response error StatusCode: 403 ...
```

**ソリューション**:

- Zilliz Cloud によって使用されているロールにアタッチされた IAM ポリシーを確認します。

- ポリシーに、`s3:GetObject`、`s3:PutObject`、`s3:Listバケット` などの他の必要な権限に加えて、`s3:GetバケットLocation` 権限が含まれていることを確認します。

### ロールの引き受け失敗\{#role-assumption-failure}

**説明**: このエラーは、ロール ARN、外部 ID、またはトラストポリシーが正しくないことが原因で IAM ロールの引き受けに問題が発生した場合に発生します。

```sql
try assume role from[zilliz-role] to [arn:aws:iam::041623484421:role/testoss121703] with externalId[zilliz-external-1umVCIK7q96kzDE] failed
```

**ソリューション**:

- Zilliz Cloud コンソールのロール ARN と外部 ID が、IAM 信頼ポリシーの対応する値と一致していることを確認します。

- IAM ロールの信頼ポリシーで、Zilliz Cloud がロールを引き受けることを許可していることを確認します。
