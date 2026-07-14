---
title: "AWS KMS | BYOC"
slug: /aws-kms
sidebar_label: "AWS KMS"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "AWS Key Management Service (KMS) は AWS が管理するサービスであり、データの暗号化と署名に使用するキーを簡単に作成および制御できます。 | BYOC"
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

AWS Key Management Service (KMS) は AWS が管理するサービスであり、データの暗号化と署名に使用するキーを簡単に作成および制御できます。 

## 概要\{#overview}

通常、Zilliz Cloud クラスター内のデータを暗号化するために KMS キーを直接使用することはありません。代わりに、KMS キーを使用して encryption zone key (EZK) を暗号化し、EZK を使用して data encryption key (DEK) を暗号化し、DEK を使用してデータを暗号化します。

![YJRcwu5BLhm8Hub1eiZcDiIdnDh](https://zdoc-images.s3.us-west-2.amazonaws.com/YJRcwu5BLhm8Hub1eiZcDiIdnDh.png)

暗号化の仕組みとその範囲の詳細については、[このセクション](./cmek#how-encryption-works)を参照してください。CMEK 機能の制限事項の詳細については、[このセクション](./cmek#limitations)を参照してください。CMEK 機能を使用するには、このページの手順に従ってください。

## 開始する前に\{#before-you-start}

- AWS CLI をインストール済みであるか、AWS CloudShell にアクセスできる必要があります。 

    詳細については、[このページ](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)を参照してください。

- KMS 関連コマンドを実行するための十分な権限が必要です。

## KMS キーを追加する\{#add-a-kms-key}

各プロジェクトでは、KMS プロバイダーに関係なく最大 **20** 個のキーを使用できます。既存の KMS キーを追加することも、Zilliz Cloud コンソールの指示に従って KMS キーを作成し、Zilliz Cloud に追加することもできます。

**Select AWS IAM Role** ステップのドロップダウンリストが空の場合は、事前に [Zilliz Cloud Terraform provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs) を使用して CMEK ロールを追加する必要があります。

<Procedures>

1. **Select AWS IAM Role** ステップのドロップダウンをクリックし、IAM ロールを選択して **Next** をクリックします。

    ![FbqvwpUuahSvMyb02IUcT1iNn6f](https://zdoc-images.s3.us-west-2.amazonaws.com/FbqvwpUuahSvMyb02IUcT1iNn6f.png)

1. KMS キーを追加します。

    ![OVdjw9ZFghQKnsbaX67cAPkWn2b](https://zdoc-images.s3.us-west-2.amazonaws.com/OVdjw9ZFghQKnsbaX67cAPkWn2b.png)

    1. 手順 1 で対象のリージョンを選択します。

    1. **（任意）** 手順 2 のコマンドをコピーし、AWS CloudShell で実行します。

        この手順は任意です。指定した IAM ロールで作成済みの KMS キーがすでにある場合は、この手順をスキップして次に進むことができます。これはマルチリージョンレプリカキーを追加する場合に便利です。

        <Admonition type="info" icon="📘" title="Notes">

        暗号化された Zilliz Cloud クラスターをあるクラウドリージョンから別のリージョンにバックアップした後、ターゲットリージョンでバックアップを復号するには、元のクラスターの暗号化に使用したものと同じキーを使用する必要があります。 
        
        この場合、バックアップを保持するリージョンにキーをレプリケートし、既存の IAM ロールを使用してそれを Zilliz Cloud に送信できます。
        
        マルチリージョンレプリカキーの作成の詳細については、AWS ドキュメントの[このページ](https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-replicate.html)を参照してください。

        </Admonition>

    1. 以下の場所に KMS キー ARN をコピー＆ペーストします。

        - [AWS コンソール](https://console.aws.amazon.com/iam/home#/roles)で IAM ロールのポリシーに貼り付けます。

            ロール一覧でロール名をクリックし、**Permissions** タブでロールポリシーを見つけて、コピーした KMS キーを `Resource` ノードに追記します。

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

        - Zilliz Cloud の上記のダイアログボックスの手順 3。

    1. ダイアログボックス下部の **Validate KMS Key** をクリックします。

    1. 検証が成功したら、**Add** をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="Notes">

KMS キーを使用して Zilliz Cloud クラスターを暗号化すると、クラスターは 10 分ごとにそのキーの可用性を確認します。キーが利用可能であることを検出した後にのみ、利用可能になります。

</Admonition>

## AWS KMS キーを管理する\{#manage-aws-kms-keys}

追加した AWS KMS キーは Zilliz Cloud コンソールで確認できます。

![OyNQwDHFhhUIXDbRMjac08Xdn1g](https://zdoc-images.s3.us-west-2.amazonaws.com/OyNQwDHFhhUIXDbRMjac08Xdn1g.png)

KMS キーが不要になった場合、そのキーを使用しているクラスターがなければ削除できます。

## AWS KMS キーを使用する\{#use-aws-kms-keys}

KMS キーを Zilliz Cloud に追加すると、それを使用して暗号化されたクラスターを作成したり、それらをバックアップおよび復元したりできます。

### 暗号化されたクラスターを作成する\{#create-an-encrypted-cluster}

作成するクラスターを暗号化するために、クラスターを作成したいリージョンで利用可能な KMS キーを選択できます。

![RGUrbElsSoc61JxikfWcoTCrnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rgurbelssoc61jxikfwcotcrnhe.png "RGUrbElsSoc61JxikfWcoTCrnHe")

KMS キーを追加したら、次のように暗号化されたクラスターを作成できます。

<Procedures>

1. **Choose Deployment Option** セクションで **Dedicated** をクリックします。

1. クラスターのクラウドプロバイダーとリージョンを選択します。

1. **Encryption at Rest with CMEK** を有効にし、既存の KMS キーを選択します。作成するクラスターと同じリージョンにある KMS キーのみ選択できます。

1. 概要を確認してから、**Create Cluster** をクリックします。

    ![Iy8JbR19eoBQ4YxV1PjcLfUinl7](https://zdoc-images.s3.us-west-2.amazonaws.com/iy8jbr19eobq4yxv1pjclfuinl7.png "Iy8JbR19eoBQ4YxV1PjcLfUinl7")

    暗号化されたクラスターの **Overview** ページでは、上図のようにクラスター名の右側にキーアイコンが表示されます。暗号化されたクラスターで作成されたすべてのコレクションはデフォルトで暗号化されます。

</Procedures>

### 暗号化されたバックアップファイルから復元する\{#restore-from-an-encrypted-backup-file}

暗号化されたバックアップを新しいクラスターに復元する場合、Zilliz Cloud はバックアップファイルに関連付けられた KMS キーを使用して、復元前にデータを復号します。したがって、暗号化の有無にかかわらず、新しいクラスターにバックアップを復元できます。 

![WaApbDlaYoywaMxxUMxcQLAOnDe](https://zdoc-images.s3.us-west-2.amazonaws.com/waapbdlayoywamxxumxcqlaonde.png "WaApbDlaYoywaMxxUMxcQLAOnDe")

暗号化されたバックアップからの復元手順は、**Encryption at Rest with CMEK** を有効にするかどうかを除き、通常の復元とほぼ同じです。

![V1QJb3SK1oGa11xLljhcxKQEnkc](https://zdoc-images.s3.us-west-2.amazonaws.com/v1qjb3sk1oga11xlljhcxkqenkc.png "V1QJb3SK1oGa11xLljhcxKQEnkc")

- このオプションを有効にすると、復元後に作成されるクラスターは以下で指定した KMS キーを使用して暗号化されます。

- このオプションを無効にすると、復元後に作成されるクラスターは暗号化されません。

