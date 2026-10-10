---
title: "AWS KMS | BYOC"
slug: /aws-kms
sidebar_label: "AWS KMS"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "AWS Key Management Service（KMS）は、データの暗号化と署名に使用するキーを簡単に作成・管理できる AWS マネージドサービスです。 | BYOC"
type: origin
token: FOamwIi07ia7kpkBPW8cEuIpniu
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS KMS

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は Business Critical（SaaS）および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は AWS で利用できます。Google Cloud および Microsoft Azure では利用できません。

</FeatureNote>

AWS Key Management Service（KMS）は、データの暗号化と署名に使用するキーを簡単に作成・管理できる AWS マネージドサービスです。

## 概要\{#overview}

通常のケースでは、Zilliz Cloud クラスター内のデータを暗号化するために KMS キーを使用することはありません。代わりに、KMS キーを使用して暗号化ゾーンキー（EZK）を暗号化し、EZK を使用してデータ暗号化キー（DEK）を暗号化し、DEK を使用してデータを暗号化します。

![YJRcwu5BLhm8Hub1eiZcDiIdnDh](https://zdoc-images.s3.us-west-2.amazonaws.com/YJRcwu5BLhm8Hub1eiZcDiIdnDh.png)

暗号化の仕組みとその範囲の詳細については、[このセクション](./cmek#how-encryption-works) を参照してください。CMEK 機能の制限の詳細については、[このセクション](./cmek#limitations) を参照してください。CMEK 機能を使用するには、このページの手順に従ってください。

## 事前準備\{#before-you-start}

- AWS CLI がインストールされているか、AWS CloudShell にアクセスできること。

    詳細については、[このページ](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) を参照してください。

- キー管理コマンドを実行するための十分な権限を持っていること。

## KMS キーを追加する\{#add-a-kms-key}

各プロジェクトでは、KMS プロバイダーに関係なく、最大 **20** 個のキーを追加できます。既存の KMS キーを追加するか、Zilliz Cloud コンソールの指示に従って KMS キーを作成し、Zilliz Cloud に追加できます。

**Select AWS IAM Role** ステップのドロップダウンリストが空の場合は、事前に [Zilliz Cloud Terraform provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs) を使用して CMEK ロールを追加する必要があります。

<Procedures>

1. **Select AWS IAM Role** ステップのドロップダウンをクリックし、IAM ロールを選択して、**Next** をクリックします。

    ![FbqvwpUuahSvMyb02IUcT1iNn6f](https://zdoc-images.s3.us-west-2.amazonaws.com/FbqvwpUuahSvMyb02IUcT1iNn6f.png)

1. KMS キーを追加します。

    ![OVdjw9ZFghQKnsbaX67cAPkWn2b](https://zdoc-images.s3.us-west-2.amazonaws.com/OVdjw9ZFghQKnsbaX67cAPkWn2b.png)

    1. ステップ 1 でターゲットリージョンを選択します。

    1. **（任意）** ステップ 2 のコマンドをコピーし、AWS CloudShell で実行します。

        このステップは任意です。指定した IAM ロールで作成済みの KMS キーがすでにある場合は、このステップをスキップして次に進むことができます。これは、マルチリージョンレプリカキーを追加する場合に便利です。

        <Admonition type="info" title="Notes">

        暗号化された Zilliz Cloud クラスターをあるクラウドリージョンから別のクラウドリージョンにバックアップした後、ターゲットリージョンでバックアップを復号するには、元のクラスターを暗号化したのと同じキーを使用する必要があります。

        この場合、キーをバックアップをホストするリージョンにレプリケートし、既存の IAM ロールを使用して Zilliz Cloud に送信できます。

        マルチリージョンレプリカキーの作成の詳細については、AWS ドキュメントの [このページ](https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-replicate.html) を参照してください。

        </Admonition>

    1. 次の場所に KMS キー ARN をコピーして貼り付けます。

        - IAM ロールのポリシー（[AWS コンソール](https://console.aws.amazon.com/iam/home#/roles) 上）。

            ロール一覧でロールの名前をクリックし、**Permissions** タブでロールポリシーを見つけて、コピーした KMS キーを `Resource` ノードに追加します。

            ```json
            {
                    "Version": "2012-10-17",
                    "Statement": [
                            {
                                    "Effect": "Allow",
                                    "Action": [
                                            "kms:Decrypt",
                                            "kms:Encrypt",
                                            "kms:DescribeKey"
                                    ],
                                    "Resource": [
                                            // highlight-start
                                            "arn:aws:kms:us-west-2:xxxx:key/mrk-...",
                                            "PASTE-THE-COPIED-KEY-ARN-HERE"
                                            // highlight-end
                                    ]
                            }
                    ]
            }
            ```

        - Zilliz Cloud の上記ダイアログボックス内のステップ 3。

    1. ダイアログボックスの下部にある **Validate KMS Key** をクリックします。

    1. 検証が成功したら、**Add** をクリックします。

</Procedures>

<Admonition type="info" title="Notes">

KMS キーを使用して Zilliz Cloud クラスターを暗号化すると、クラスターは 10 分ごとにキーの可用性を確認します。キーが利用可能であることを検出した後にのみ、キーは利用可能になります。

</Admonition>

## AWS KMS キーを管理する\{#manage-aws-kms-keys}

追加した AWS KMS キーは、Zilliz Cloud コンソールで確認できます。

![S3NKwZYR7hj6ocbkpIQcB66Unyg](https://zdoc-images.s3.us-west-2.amazonaws.com/S3NKwZYR7hj6ocbkpIQcB66Unyg.png)

KMS キーが不要になった場合は、どのクラスターでも使用されていなければ削除できます。

## AWS KMS キーを使用する\{#use-aws-kms-keys}

KMS キーを Zilliz Cloud に追加すると、そのキーを使用して暗号化されたクラスターを作成し、バックアップおよび復元できます。

### 暗号化されたクラスターを作成する\{#create-an-encrypted-cluster}

クラスターを作成するリージョンで利用可能な KMS キーを選択して、クラスターを暗号化できます。

![RGUrbElsSoc61JxikfWcoTCrnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rgurbelssoc61jxikfwcotcrnhe.png "RGUrbElsSoc61JxikfWcoTCrnHe")

KMS キーを追加すると、次のように暗号化されたクラスターを作成できます。

<Procedures>

1. **Choose Deployment Option** セクションで **Dedicated** をクリックします。

1. クラスターのクラウドプロバイダーとリージョンを選択します。

1. **Encryption at Rest with CMEK** を有効にし、既存の KMS キーを選択します。作成するクラスターと同じリージョンにある KMS キーのみを選択できます。

1. サマリーを確認し、**Create Cluster** をクリックします。

    ![Iy8JbR19eoBQ4YxV1PjcLfUinl7](https://zdoc-images.s3.us-west-2.amazonaws.com/iy8jbr19eobq4yxv1pjclfuinl7.png "Iy8JbR19eoBQ4YxV1PjcLfUinl7")

    暗号化されたクラスターの **Overview** ページでは、上の図に示すように、クラスター名の右側にキーアイコンが表示されます。暗号化されたクラスターで作成されたすべてのコレクションは、デフォルトで暗号化されます。

</Procedures>

### 暗号化されたバックアップファイルから復元する\{#restore-from-an-encrypted-backup-file}

暗号化されたバックアップを新しいクラスターに復元する場合、Zilliz Cloud は復元前に、バックアップファイルに関連付けられた KMS キーを使用してデータを復号します。そのため、バックアップは暗号化の有無にかかわらず新しいクラスターに復元できます。

![WaApbDlaYoywaMxxUMxcQLAOnDe](https://zdoc-images.s3.us-west-2.amazonaws.com/waapbdlayoywamxxumxcqlaonde.png "WaApbDlaYoywaMxxUMxcQLAOnDe")

暗号化されたバックアップからの復元手順は、**Encryption at Rest with CMEK** を有効にするかどうかを除いて、通常の復元とほぼ同じです。

![V1QJb3SK1oGa11xLljhcxKQEnkc](https://zdoc-images.s3.us-west-2.amazonaws.com/v1qjb3sk1oga11xlljhcxkqenkc.png "V1QJb3SK1oGa11xLljhcxKQEnkc")

- このオプションを有効にすると、復元後に作成されるクラスターは、以下で指定する KMS キーを使用して暗号化されます。

- このオプションを無効にすると、復元後に作成されるクラスターは暗号化されません。
