---
title: "Cloud Storage バケットとサービスアカウントの作成 | BYOC"
slug: /create-bucket-and-service-account
sidebar_label: "Cloud Storage バケットとサービスアカウントの作成"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、適切な権限を使用して Bring-Your-Own-Cloud (BYOC) プロジェクトのルートストレージを作成および設定する手順について説明します。 | BYOC"
type: origin
token: RymGwWsFMi3VV1kXGmHckc2WnKc
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Cloud Storage バケットとサービスアカウントの作成

このページでは、適切な権限を使用して Bring-Your-Own-Cloud (BYOC) プロジェクトのルートストレージを作成および設定する手順について説明します。

<Admonition type="info" icon="📘" title="注意">

Zilliz BYOC は現在 **General Availability** で利用可能です。アクセス方法および実装の詳細については、[Zilliz Cloud の営業チーム](https://zilliz.com/contact-sales) にお問い合わせください。

</Admonition>

## Cloud Storage バケットのベストプラクティス\{#best-practices-for-the-cloud-storage-bucket}

プロジェクトのデプロイ時に指定したバケットは、そのプロジェクトで作成されるクラスターのルートストレージとして使用されます。Cloud Storage バケットを作成する前に、次のベストプラクティスを確認してください。

- バケットは、プロジェクトのデプロイと同じ Google Cloud Platform (GCP) リージョン内になければなりません。

- プロジェクト内のすべてのクラスターは、プロジェクトのデプロイ時に作成された Cloud Storage バケットを共有します。Zilliz Cloud では、プロジェクト専用の Cloud Storage バケットを使用し、他のサービスやリソースと共有しないことを推奨します。

## 手順\{#procedure}

GCP ダッシュボードを使用して、バケットとサービスアカウントを作成できます。あるいは、Zilliz Cloud が提供する Terraform スクリプトを使用して、GCP 上の Zilliz Cloud プロジェクト用インフラストラクチャをブートストラップすることもできます。詳細については、[Terraform Provider](./terraform-provider) を参照してください。

### ステップ 1: Cloud Storage バケットを作成する\{#step-1-create-a-cloud-storage-bucket}

このステップでは、BYOC プロジェクトをデプロイするための Cloud Storage バケットを GCP 上に作成します。既存のバケットを使用する場合は、そのバケットが BYOC プロジェクトと同じリージョンにあることを確認してください。作成後、Zilliz Cloud コンソールの **Storage settings** にバケット名を入力します。

<Supademo id="cmbg4ro374d54sn1rdnv6ca32" title=""  />

バケットを作成する手順は次のとおりです。

<Procedures>

1. GCP コンソールで **Cloud Storage** を見つけてクリックします。

1. **Create bucket** をクリックします。

    このデモでは、`zilliz-byoc-your-org-bucket` に設定できます。あるいは、ご自身の命名規則に従ってください。

1. 作成するバケットにわかりやすい名前を設定します。

1. 単一リージョン内で最小のレイテンシを確保するため、**Location type** で **Region** を選択し、表示されるドロップダウンリストで BYOC プロジェクトのリージョンを選択します。

    このデモでは、`us-west (Oregon)` に設定できます。この値が BYOC プロジェクトの値と同じであることを確認してください。

1. **Continue** をクリックします。

1. **Access control** で **Fine-grained** を選択し、きめ細かなパブリックアクセス防止を有効にします。

1. **Continue** をクリックします。

1. デフォルト設定のままにして、**Create** をクリックします。

1. 表示されたダイアログボックスで **Confirm** をクリックし、作成するバケットへのパブリックアクセス防止を確認します。

</Procedures>

### ステップ 2: バケットにアクセスするサービスアカウントを作成する\{#step-2-create-a-service-account-to-access-the-bucket}

このステップでは、サービスアカウントを作成し、そのサービスアカウントに複数のロールを関連付け、そのサービスアカウントを Zilliz Cloud に提供して、Zilliz Cloud が上で作成したバケットにアクセスできるようにします。

<Supademo id="cmc1mg9bvjk4bsn1r8awkyndh" title=""  />

ストレージサービスアカウントを作成する手順は次のとおりです。

<Procedures>

1. GCP コンソールで **IAM & Admin** を見つけてクリックします。

1. 左側のナビゲーションペインで **Service Accounts** を選択します。

1. **Create service account** をクリックします。

1. 作成するサービスアカウントの名前を設定します。 

    このデモでは、`your-org-storage-sa` に設定できます。サービスアカウント ID は、サービスアカウント名の先頭 18 文字にする必要があります。適切な値に手動で設定できます。

1. **Create and continue** をクリックします。

1. **Permissions** で、条件付きの 2 つのロールを追加します。

    1. ドロップダウンリストから **Storage Object Admin** を選択します。

    1. **Add IAM condition** をクリックし、条件のタイトルを設定して、以下の条件を **Condition editor** に入力します。

        ```json
        resource.name.startsWith("projects/_/buckets/YOUR_BUCKET_NAME")
        ```

        <Admonition type="info" icon="📘" title="注意">

        `YOUR_BUCKET_NAME` は、前のステップで作成したバケット名に置き換えてください。

        </Admonition>

    1. **Save** をクリックします。

    1. **Add another role** をクリックします。

    1. ドロップダウンリストから **Storage Bucket Viewer** を選択します。

    1. **Add IAM condition** をクリックし、条件のタイトルを設定して、以下の条件を **Condition editor** に入力します。

        ```json
        resource.name.startsWith("projects/_/buckets/YOUR_BUCKET_NAME")
        ```

        <Admonition type="info" icon="📘" title="注意">

        **Condition builder** と **Condition editor** は、条件を設定するための同等の方法です。どちらの場合も、`YOUR_BUCKET_NAME` は前のステップで作成したバケット名に置き換えてください。

        </Admonition>

    1. **Save** をクリックします

1. **Done** をクリックします。

</Procedures>
