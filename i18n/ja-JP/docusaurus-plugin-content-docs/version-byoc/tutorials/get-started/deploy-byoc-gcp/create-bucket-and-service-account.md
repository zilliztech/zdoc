---
title: "クラウドストレージバケットとサービスアカウントの作成 | BYOC"
slug: /create-bucket-and-service-account
sidebar_key: create-bucket-and-service-account
sidebar_label: "クラウドストレージバケットとサービスアカウントの作成"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、Bring-Your-Own-Cloud (BYOC) プロジェクトのルートストレージを適切な権限で作成および設定する手順について説明します。| BYOC"
type: origin
token: RymGwWsFMi3VV1kXGmHckc2WnKc
sidebar_position: 1
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - 権限
  - 最小権限
  - milvus
  - ベクトルデータベース

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Cloud Storage バケットとサービスアカウントの作成

このページでは、適切な権限を持つ Bring-Your-Own-Cloud (BYOC) プロジェクトのルートストレージを作成および設定する手順について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud の営業担当者</a>までお問い合わせください。</p>

</Admonition>

## Cloud Storage バケットのベストプラクティス\{#best-practices-for-the-cloud-storage-bucket}

プロジェクトのデプロイ中に指定するバケットは、そのプロジェクトで作成されるクラスターのルートストレージとして使用されます。Cloud Storage バケットを作成する前に、以下のベストプラクティスを確認してください。

- バケットは、プロジェクトのデプロイと同じ Google Cloud Platform (GCP) リージョンに存在する必要があります。

- プロジェクト内のすべてのクラスターは、プロジェクトのデプロイ中に作成された Cloud Storage バケットを共有します。Zilliz Cloud では、プロジェクト専用の Cloud Storage バケットを使用し、他のサービスやリソースと共有しないことを推奨しています。

## 手順\{#procedure}

GCP ダッシュボードを使用してバケットとサービスアカウントを作成できます。あるいは、Zilliz Cloud が提供する Terraform スクリプトを使用して、GCP 上の Zilliz Cloud プロジェクト用のインフラストラクチャをブートストラップすることもできます。詳細については、[Terraform Provider](./terraform-provider) を参照してください。

### ステップ 1: Cloud Storage バケットの作成\{#step-1-create-a-cloud-storage-bucket}

このステップでは、BYOC プロジェクトのデプロイ用に GCP で Cloud Storage バケットを作成します。既存のバケットを使用する場合は、そのバケットが BYOC プロジェクトと同じリージョンにあることを確認してください。作成したら、Zilliz Cloud コンソールの**ストレージ設定**にバケット名を入力します。

<Supademo id="cmbg4ro374d54sn1rdnv6ca32" title=""  />

バケットを作成する手順は次のとおりです。

<Procedures>

1. GCP コンソールで、**Cloud Storage** を見つけてクリックします。

1. **バケットの作成**をクリックします。

    このデモでは、`zilliz-byoc-your-org-bucket` に設定するか、独自の命名規則に従ってください。

1. 作成するバケットの説明的な名前を設定します。

1. **ロケーションタイプ**で**リージョン**を選択して、単一リージョン内で最低遅延を確保し、表示されるドロップダウンリストから BYOC プロジェクトのリージョンを選択します。

    このデモでは、`us-west (Oregon)` に設定できます。この値が BYOC プロジェクトの値と同じであることを確認してください。

1. **続行**をクリックします。

1. **アクセス制御**で、きめ細かいパブリックアクセス防止を有効にするために**きめ細かい**を選択します。

1. **続行**をクリックします。

1. デフォルト設定を維持したまま、**作成**をクリックします。

1. 表示されるダイアログボックスで**確認**をクリックし、作成するバケットへのパブリックアクセスを防止することを確認します。

</Procedures>

### ステップ 2: バケットにアクセスするためのサービスアカウントの作成\{#step-2-create-a-service-account-to-access-the-bucket}

このステップでは、サービスアカウントを作成し、いくつかのロールをサービスアカウントに関連付け、上記で作成したバケットに Zilliz Cloud がアクセスできるように、そのサービスアカウントを Zilliz Cloud に提供します。

<Supademo id="cmc1mg9bvjk4bsn1r8awkyndh" title=""  />

ストレージサービスアカウントを作成する手順は次のとおりです。

<Procedures>

1. GCP コンソールで、**IAM と管理**を見つけてクリックします。

1. 左側のナビゲーションペインで**サービスアカウント**を選択します。

1. **サービスアカウントの作成**をクリックします。

1. 作成するサービスアカウントの名前を設定します。

    このデモでは、`your-org-storage-sa` に設定できます。サービスアカウント ID は、サービスアカウント名の最初の 18 文字である必要があります。手動で適切な値に設定できます。

1. **作成して続行**をクリックします。

1. **権限**で、条件付きで 2 つのロールを追加します。

    1. ドロップダウンリストから**Storage Object Admin**を選択します。

    1. **IAM 条件の追加**をクリックし、条件タイトルを設定して、以下の条件を**条件エディタ**に入力します。

        ```json
        resource.name.startsWith("projects/_/buckets/YOUR_BUCKET_NAME")
        ```

        <Admonition type="info" icon="📘" title="Notes">

        <p><code>YOUR_BUCKET_NAME</code> を、前のステップで作成したバケットの名前に置き換えてください。</p>

        </Admonition>

    1. **Save** をクリックします。

    1. **Add another role** をクリックします。

    1. ドロップダウンリストから **Storage バケット Viewer** を選択します。

    1. **Add IAM condition** をクリックし、条件タイトルを設定して、以下の条件を**条件エディタ**に入力します。

        ```json
        resource.name.startsWith("projects/_/buckets/YOUR_BUCKET_NAME")
        ```

        <Admonition type="info" icon="📘" title="Notes">

        <p><strong>条件ビルダー</strong>と<strong>条件エディタ</strong>は、条件を設定するための同等の方法です。いずれの場合も、<code>YOUR_BUCKET_NAME</code> を前のステップで作成したバケット名に置き換えてください。</p>

        </Admonition>

    1. **保存**をクリックします

1. **完了**をクリックします。

</Procedures>