---
title: "Amazon S3 との連携 | BYOC"
slug: /integrate-with-aws-s3
sidebar_label: "AWS S3"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud の AWS BYOC または BYOC-I プロジェクトに対して、外部の Amazon S3 バケットへのアクセスを承認する方法を説明します。バケットを所有する AWS アカウントでカスタマー管理の IAM ポリシーとロールを作成し、そのロールを Zilliz Cloud に登録します。 | BYOC"
type: origin
token: FuX7w7cfZisGBmk8chnco3msnud
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Amazon S3 との連携

このページでは、Zilliz Cloud の AWS BYOC または BYOC-I プロジェクトに対して、外部の Amazon S3 バケットへのアクセスを承認する方法を説明します。バケットを所有する AWS アカウントでカスタマー管理の IAM ポリシーとロールを作成し、そのロールを Zilliz Cloud に登録します。

<Admonition type="info" title="Notes">

このページのポリシーと信頼ポリシーの例にはプレースホルダーが含まれています。AWS を構成するときは、Zilliz Cloud コンソールで生成された JSON をコピーしてください。この JSON には、BYOC プロジェクトの正しいバケット名、信頼された AWS プリンシパル、および一意の外部 ID が含まれています。

</Admonition>

## アクセスフロー\{#access-flow}

![JzmcwFXZ6hdb3IbEoAEc6lFYnRd](https://zdoc-images.s3.us-west-2.amazonaws.com/JzmcwFXZ6hdb3IbEoAEc6lFYnRd.png)

## 事前準備\{#before-you-start}

以下を満たしていることを確認してください。

- AWS BYOC または BYOC-I のデータプレーンが実行中であること。

- Zilliz Cloud プロジェクトに対する **Organization Owner** または **Project Admin** のアクセス権を持っていること。

- 外部 S3 バケットを所有する AWS アカウントで IAM ポリシーとロールを作成できること。

- 選択した BYOC データプレーンのストレージロールにアタッチされている IAM 権限ポリシーを更新できること。

- S3 バケットが、連携を使用する BYOC データプレーンと同じ AWS リージョンにあること。

<Admonition type="info" title="Notes">

バケット連携はリージョン単位です。プロジェクトのデータプレーンが複数のリージョンにある場合は、リージョンごとに個別のバケットと連携を作成してください。

</Admonition>

## ステップ 1: Zilliz Cloud で連携を開始する\{#step-1-start-the-integration-in-zilliz-cloud}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com) にログインします。

1. BYOC プロジェクトを開き、左側のナビゲーションで **Integrations** を選択します。

1. **Amazon S3** の下で **+ Integration** をクリックします。

1. 一意の **Integration Name** を入力し、必要に応じて **Integration Description** も入力します。

1. 連携の使用方法に合ったバケット権限を選択します。

    | バケット権限 | 用途 | 付与されるアクセス権 |
    | --- | --- | --- |
    | **Read only** | 外部ボリュームと外部コレクション | `s3:GetObject`、`s3:ListBucket`、および `s3:GetBucketLocation` |
    | **Read write** | バックアップのエクスポート、監査ログの転送、およびアクセスログの転送 | 読み取り専用のアクションに加えて `s3:PutObject` |

</Procedures>

## ステップ 2: 外部 S3 バケットを指定する\{#step-2-specify-the-external-s3-bucket}

<Procedures>

1. **Region** で、バケットにアクセスする BYOC データプレーンのリージョンを選択します。

1. [Amazon S3 コンソール](https://s3.console.aws.amazon.com/s3/home) で、外部バケットが同じリージョンにあることを確認します。

1. **Bucket Name** には、バケット名のみを入力します。`s3://`、オブジェクトプレフィックス、または末尾のスラッシュを含めないでください。

1. **Next** をクリックします。Zilliz Cloud がバケットスコープの IAM ポリシーを生成します。

</Procedures>

## ステップ 3: IAM 権限ポリシーを作成する\{#step-3-create-the-iam-permission-policy}

<Procedures>

1. Zilliz Cloud の **Create IAM Policy** ステップで、生成された JSON をコピーします。

1. バケットを所有する AWS アカウントで [IAM > Policies](https://us-east-1.console.aws.amazon.com/iam/home#/policies) を開きます。

1. **Create policy** をクリックし、**JSON** エディターを選択して、生成されたポリシーを貼り付けます。

1. **Next** をクリックし、`ZillizBucketIntegration-my-bucket` など判別しやすい名前をポリシーに付けて作成します。

</Procedures>

次の例は、各権限レベルで生成されるポリシーを示しています。

### 読み取り・書き込みポリシー\{#read-write-policy}

```plaintext
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
        "arn:aws:s3:::<BUCKET_NAME>",
        "arn:aws:s3:::<BUCKET_NAME>/*"
      ]
    }
  ]
}
```

### 読み取り専用ポリシー\{#read-only-policy}

```plaintext
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Statement1",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::<BUCKET_NAME>",
        "arn:aws:s3:::<BUCKET_NAME>/*"
      ]
    }
  ]
}
```

<Admonition type="info" title="Notes">

バケットでカスタマー管理の AWS KMS キーによるサーバー側暗号化を使用している場合は、そのロールに必要な KMS 権限も付与し、KMS キーポリシーでそのロールを許可してください。書き込みワークフローの場合、現在のコンソールで生成されるポリシーには、そのキーに対する `kms:GenerateDataKey` 権限を追加する必要がある可能性があります。

</Admonition>

## ステップ 4: IAM ロールと信頼ポリシーを作成する\{#step-4-create-the-iam-role-and-trust-policy}

<Procedures>

1. Zilliz Cloud に戻り、**Next** をクリックして **Create IAM Role** を開きます。

1. 生成されたカスタム信頼ポリシーをコピーします。これには、選択した BYOC データプレーンの AWS プリンシパルと一意の外部 ID が含まれています。

1. バケット所有者の AWS アカウントで [IAM > Roles](https://us-east-1.console.aws.amazon.com/iam/home#/roles) を開き、**Create role** をクリックします。

1. **Custom trust policy** を選択し、生成された JSON を貼り付けて **Next** をクリックします。

1. ステップ 3 で作成した権限ポリシーをアタッチします。

1. `ZillizBucketIntegrationRole` などのロール名を入力し、構成を確認してロールを作成します。

    ```plaintext
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": "sts:AssumeRole",
          "Principal": {
            "AWS": "<ZILLIZ_BYOC_AWS_PRINCIPAL>"
          },
          "Condition": {
            "StringEquals": {
              "sts:ExternalId": "<ZILLIZ_GENERATED_EXTERNAL_ID>"
            }
          }
        }
      ]
    }
    ```

</Procedures>

<Admonition type="info" title="Notes">

外部 ID はロールをこの連携にバインドし、クロスアカウントの信頼関係を保護します。プリンシパルと外部 ID の両方を、Zilliz Cloud に表示されているとおりに正確にコピーしてください。

</Admonition>

## ステップ 5: BYOC ストレージロールにカスタマーロールの引き受けを許可する\{#step-5-allow-the-byoc-storage-role-to-assume-the-customer-role}

カスタマーロールの信頼ポリシーは、認可の一方の側にすぎません。選択したデータプレーンのストレージロールにも、新しいカスタマーロールに対する `sts:AssumeRole` を許可する ID ベースのポリシーが必要です。

ロール名は通常 `-storage-role` で終わります。正確なロール ARN は Zilliz Cloud で確認します。

<Procedures>

1. プロジェクトを開き、左側のナビゲーションで **Data Planes** をクリックします。

1. バケット連携を使用するデータプレーンをクリックして **View Data Plane Details** を開きます。

    ![外部バケットを使用するデータプレーンを開きます。](https://zdoc-images.s3.us-west-2.amazonaws.com/open-the-data-plane-that-will-use-the-external-bucket.png "外部バケットを使用するデータプレーンを開きます。")

1. **Credential Settings > Storage** までスクロールします。

1. 完全な **IAM Role ARN** をコピーします。ロール名が `-storage-role` で終わっていない場合でも、この ARN を使用してください。

    ![Credential Settings > Storage の IAM Role ARN がデータプレーンのストレージロールです。](https://zdoc-images.s3.us-west-2.amazonaws.com/the-iam-role-arn-under-credential-settings-greater-storage-is-the-data-plane-storage-role.png "Credential Settings > Storage の IAM Role ARN がデータプレーンのストレージロールです。")

1. BYOC データプレーンを含む AWS アカウントで、その ARN で識別される IAM ロールを開きます。

1. そのストレージロールにアタッチされているカスタマー管理の権限ポリシーを作成または更新します。

1. `Resource` には、ステップ 4 で作成した正確なロール ARN を設定します。`*` は使用しないでください。

    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "AllowAssumeExternalBucketRole",
          "Effect": "Allow",
          "Action": "sts:AssumeRole",
          "Resource": "<CUSTOMER_BUCKET_ROLE_ARN>"
        }
      ]
    }
    ```

    <Admonition type="info" title="Both policies are required">

    ストレージロールの権限ポリシーで呼び出しを許可し、カスタマーロールの信頼ポリシーで、正しい外部 ID を持つ呼び出し元を信頼する必要があります。どちらか一方が欠けていると、ロールの引き受けが失敗します。

    </Admonition>

</Procedures>

## ステップ 6: 連携を検証して追加する\{#step-6-validate-and-add-the-integration}

<Procedures>

1. AWS のロール詳細ページで、ロール ARN をコピーします。形式は次のとおりです: `arn:aws:iam::<BUCKET_ACCOUNT_ID>:role/<ROLE_NAME>`。

1. Zilliz Cloud に戻り、ARN を **Role ARN** に貼り付けます。

1. **Validate Integration** をクリックします。

1. ステータスが **Successful** に変わったら、**Add** をクリックします。これで、同じ Zilliz Cloud プロジェクトおよびリージョン内のサポート対象のワークフローで Amazon S3 連携を利用できるようになります。

</Procedures>

## セキュリティに関する推奨事項\{#security-recommendations}

- バケット連携ごとに専用の IAM ロールを作成します。

- BYOC ストレージロールでは、正確なカスタマーロール ARN に対してのみ `sts:AssumeRole` を許可します。

- ポリシーのスコープを正確なバケットに限定し、ワークフローでオブジェクトを書き込む必要がない限り **Read only** を選択します。

- S3 Block Public Access を有効にしたままにします。バケット連携にバケットへのパブリックアクセスは必要ありません。

- Zilliz Cloud に長期間有効な AWS アクセスキーを追加しないでください。アクセスは、一時的な STS 認証情報を使用してカスタマーロールを引き受けることによって取得します。

- 組織レベルのサービスコントロールポリシー、アクセス許可の境界、S3 バケットポリシー、または KMS キーポリシーが適用される場合は、このロールに付与されたアクションが拒否されないことを確認してください。

## トラブルシューティング\{#troubleshooting}

| 検証結果 | 考えられる原因 | 確認する項目 |
| --- | --- | --- |
| `bucket region not match` | バケットと選択した BYOC データプレーンが異なるリージョンにあります。 | 一致するリージョンを選択するか、データプレーンのリージョンにあるバケットを使用してください。 |
| `NoSuchBucket` | バケット名が正しくないか、バケットが存在しません。 | `s3://` やパスを含めず、正確なバケット名のみを入力してください。 |
| `GetBucketLocation` に対する `AccessDenied` | IAM 権限ポリシーが存在しない、アタッチされていない、または別の AWS ポリシーによってブロックされています。 | ロールがバケットに対して `s3:GetBucketLocation` を持っていることを確認し、アクセス許可の境界、バケットポリシー、およびサービスコントロールポリシーを確認してください。 |
| ロールの引き受けに失敗しました | ストレージロールに `sts:AssumeRole` がないか、ロール ARN、信頼されたプリンシパル、または外部 ID が一致していません。 | 両方の側を確認してください。ストレージロールの ID ポリシーがカスタマーロール ARN を許可し、カスタマーロールの信頼ポリシーに生成されたプリンシパルと外部 ID が含まれている必要があります。 |
