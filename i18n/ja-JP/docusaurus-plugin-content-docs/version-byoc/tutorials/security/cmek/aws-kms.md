---
title: "AWS KMS | BYOC"
slug: /aws-kms
sidebar_key: aws-kms
sidebar_label: "AWS KMS"
beta: FALSE
notebook: FALSE
description: "AWS Key Management Service (KMS) は、データの暗号化や署名に使用するキーの作成と制御を容易にする AWS 管理型サービスです。| BYOC"
type: origin
token: FOamwIi07ia7kpkBPW8cEuIpniu
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - cmek
  - aws kms

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS KMS

AWS キー Management Service (KMS) は、データの暗号化や署名に使用するキーの作成と制御を容易にする AWS 管理サービスです。

## 概要\{#overview}

通常、Zilliz Cloud クラスター内のデータを暗号化するために直接 KMS キーを使用することはありません。代わりに、KMS キーを使用して暗号化ゾーンキー（EZK）を暗号化し、EZK を使用してデータ暗号化キー（DEK）を暗号化し、DEK を使用してデータを暗号化します。

![YJRcwu5BLhm8Hub1eiZcDiIdnDh](https://zdoc-images.s3.us-west-2.amazonaws.com/YJRcwu5BLhm8Hub1eiZcDiIdnDh.png)

暗号化の仕組みとその範囲の詳細については、[このセクション](./cmek#how-encryption-works) を参照してください。CMEK 機能の制限事項の詳細については、[このセクション](./cmek#limitations) を参照してください。CMEK 機能を使用するには、このページの手順に従ってください。

## 開始前に\{#before-you-start}

- AWS CLI がインストールされているか、AWS CloudShell にアクセスできること。

    詳細については、[このページ](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) を参照してください。

- KMS 関連のコマンドを実行するための十分な権限を持っていること。

## KMS キーの追加\{#add-a-kms-key}

各プロジェクトでは、KMS プロバイダーに関係なく、最大**20**個のキーを追加できます。既存の KMS キーを追加するか、Zilliz Cloud コンソールの指示に従って KMS キーを作成し、Zilliz Cloud に追加できます。

**Select AWS IAM ロール**ステップのドロップダウンリストが空の場合、事前に [Zilliz Cloud Terraform provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs) を使用して CMEK ロールを追加する必要があります。

<Procedures>

1. **Select AWS IAM ロール**ステップでドロップダウンをクリックし、IAM ロールを選択して**Next**をクリックします。

    ![FbqvwpUuahSvMyb02IUcT1iNn6f](https://zdoc-images.s3.us-west-2.amazonaws.com/FbqvwpUuahSvMyb02IUcT1iNn6f.png)

1. KMS キーを追加します。

    ![OVdjw9ZFghQKnsbaX67cAPkWn2b](https://zdoc-images.s3.us-west-2.amazonaws.com/OVdjw9ZFghQKnsbaX67cAPkWn2b.png)

    1. ステップ 1 で対象リージョンを選択します。

    1. **（オプション）** ステップ 2 のコマンドをコピーし、AWS CloudShell で実行します。

        このステップはオプションです。指定された IAM ロールで作成済みの KMS キーが既にある場合は、このステップをスキップして次に進めます。これは、マルチリージョンレプリカキーを追加する場合に役立ちます。

        <Admonition type="info" icon="📘" title="Notes">

        <p>暗号化された Zilliz Cloud クラスターをあるクラウドリージョンから別のリージョンにバックアップした後、ターゲットリージョンでバックアップを復号化する際には、元のクラスターを暗号化したのと同じキーを使用する必要があります。</p>
        <p>この場合、キーをバックアップをホストするリージョンにレプリケートし、既存の IAM ロールを使用して Zilliz Cloud に送信できます。</p>
        <p>マルチリージョンレプリカキーの作成方法の詳細については、AWS ドキュメントの<a href="https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-replicate.html">このページ</a>をお読みください。</p>

        </Admonition>

    1. 次の場所に KMS キーの ARN をコピーして貼り付けます：

        - [AWS コンソール](https://console.aws.amazon.com/iam/home#/roles) 上の IAM ロールのポリシー。

            ロール一覧でロールの名前をクリックし、**Permissions**タブでロールポリシーを見つけて、コピーした KMS キーを`Resource`ノードに追加します。

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

        - 上記の Zilliz Cloud 上のダイアログボックスのステップ 3。

    1. ダイアログボックスの下部にある **Validate KMS キー** をクリックします。

    1. 検証が成功したら、**Add** をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="Notes">

<p>KMS キーを使用して Zilliz Cloud クラスターを暗号化する場合、クラスターは 10 分ごとにキーの可用性を確認します。キーが利用可能であると検出されて初めて、クラスターは利用可能になります。</p>

</Admonition>

## AWS KMS キーの管理\{#manage-aws-kms-keys}

Zilliz Cloud コンソールで追加された AWS KMS キーを表示できます。

![OyNQwDHFhhUIXDbRMjac08Xdn1g](https://zdoc-images.s3.us-west-2.amazonaws.com/OyNQwDHFhhUIXDbRMjac08Xdn1g.png)

KMS キーが不要になった場合、どのクラスターもそのキーを使用していない限り、削除できます。

## AWS KMS キーの使用\{#use-aws-kms-keys}

KMS キーを Zilliz Cloud に追加すると、それを使用して暗号化されたクラスターを作成したり、バックアップおよび復元を行ったりできます。

### 暗号化されたクラスターの作成\{#create-an-encrypted-cluster}

クラスターを作成するリージョンで利用可能な KMS キーを選択して、クラスターを暗号化できます。

![RGUrbElsSoc61JxikfWcoTCrnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rgurbelssoc61jxikfwcotcrnhe.png "RGUrbElsSoc61JxikfWcoTCrnHe")

KMS キーを追加した後、以下の手順で暗号化されたクラスターを作成できます。

<Procedures>

1. **Choose Deployment Option** セクションで **Dedicated** をクリックします。

1. クラスターのクラウドプロバイダーとリージョンを選択します。

1. **Encryption at Rest with CMEK** を有効にし、既存の KMS キーを選択します。選択できるのは、作成するクラスターと同じリージョンにある KMS キーのみです。

1. 概要を確認し、**Create Cluster** をクリックします。

    ![Iy8JbR19eoBQ4YxV1PjcLfUinl7](https://zdoc-images.s3.us-west-2.amazonaws.com/iy8jbr19eobq4yxv1pjclfuinl7.png "Iy8JbR19eoBQ4YxV1PjcLfUinl7")

    暗号化されたクラスターの **Overview** ページには、上記の図に示すように、クラスター名の右側にキーのアイコンが表示されます。暗号化されたクラスター内で作成されたすべてのコレクションは、デフォルトで暗号化されます。

</Procedures>

### 暗号化されたバックアップファイルからの復元\{#restore-from-an-encrypted-backup-file}

暗号化されたバックアップを新しいクラスターに復元する場合、Zilliz Cloud は復元前にバックアップファイルに関連付けられた KMS キーを使用してデータを復号します。したがって、バックアップを暗号化ありまたはなしの新しいクラスターに復元できます。

![WaApbDlaYoywaMxxUMxcQLAOnDe](https://zdoc-images.s3.us-west-2.amazonaws.com/waapbdlayoywamxxumxcqlaonde.png "WaApbDlaYoywaMxxUMxcQLAOnDe")

暗号化されたバックアップからの復元手順は、**Encryption at Rest with CMEK** を有効にするかどうかを除き、通常の復元とほぼ同じです。

![V1QJb3SK1oGa11xLljhcxKQEnkc](https://zdoc-images.s3.us-west-2.amazonaws.com/v1qjb3sk1oga11xlljhcxkqenkc.png "V1QJb3SK1oGa11xLljhcxKQEnkc")

- このオプションを有効にした場合、復元後に作成されたクラスターは、以下で指定された KMS キーを使用して暗号化されます。

- このオプションを無効にした場合、復元後に作成されたクラスターは暗号化されません。

