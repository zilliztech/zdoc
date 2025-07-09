---
title: "クラウドストレージバケットとサービスアカウントを作成する | BYOC"
slug: /create-bucket-and-service-account
sidebar_label: "クラウドストレージバケットとサービスアカウントを作成する"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、適切なアクセス許可を使用してBring-Your-Own-Cloud(BYOC)プロジェクトのルートストレージを作成および構成する手順について説明します。 | BYOC"
type: origin
token: RymGwWsFMi3VV1kXGmHckc2WnKc
sidebar_position: 1
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# クラウドストレージバケットとサービスアカウントを作成する

このページでは、適切なアクセス許可を使用してBring-Your-Own-Cloud(BYOC)プロジェクトのルートストレージを作成および構成する手順について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>General Availability</strong>で利用可能です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zillizクラウド販売</a>にお問い合わせください。</p>

</Admonition>

## Cloud Storageバケットのベストプラクティス{#best-practices-for-the-cloud-storage-bucket}

プロジェクトのデプロイ中に指定したバケットは、プロジェクトで作成されたクラスターのルートストレージとして使用されます。Cloud Storageバケットを作成する前に、以下のベストプラクティスを確認してください。

- バケットは、プロジェクトデプロイと同じGoogle Cloud Platform（GCP）リージョンにある必要があります。

- プロジェクトのデプロイ中に作成されたCloud Storageバケットは、プロジェクト内のすべてのクラスターで共有されます。Zilliz Cloudは、プロジェクト専用のCloud Storageバケットを使用し、他のサービスやリソースと共有しないことをお勧めします。

## 手続き{#procedure}

GCPダッシュボードを使用してバケットとサービスアカウントを作成することができます。また、Zilliz Cloudが提供するTerraformスクリプトを使用して、Zilliz CloudプロジェクトのインフラストラクチャをGCP上でブートストラップすることもできます。詳細については、[テラフォームプロバイダName](./terraform-provider)を参照してください。

### ステップ1: Cloud Storageバケットを作成する{#step-1-create-a-cloud-storage-bucket}

このステップでは、BYOCプロジェクトの展開のためにGCP上にCloud Storageバケットを作成します。既存のバケットを使用する場合は、バケットがBYOCプロジェクトと同じリージョンにあることを確認してください。作成されたら、Zilliz Cloudコンソールの**ストレージ設定**にバケット名を入力してください。

<Supademo id="cmbg4ro374d54sn1rdnv6ca32" title=""  />

バケットを作成する手順は次のとおりです。

1. GCPコンソールで、**Cloud Storage**を見つけてクリックしてください。

1. 「バケットを作成」をクリックしてください。

    このデモでは、`zilliz-byoc-your-org-bucket`に設定するか、命名規則に従うことができます。

1. 作成するバケットに説明的な名前を設定します。

1. **場所タイプ**で**リージョン**を選択して、単一のリージョン内で最小のレイテンシーを確保し、表示されるドロップダウンリストからBYOCプロジェクトのリージョンを選択してください。

    このデモでは、`us-west (Oregon)`に設定できます。この値がBYOCプロジェクトの値と同じであることを確認してください。

1. 「続ける」をクリックしてください。

1. 「アクセス制御」で、「細粒度」を選択して、細粒度のパブリックアクセス防止を有効にしてください。

1. 「続ける」をクリックしてください。

1. デフォルトの設定を維持し、**作成**をクリックしてください。

1. 作成するバケットへのパブリックアクセスの防止を確認するには、プロンプトされたダイアログボックスで**確認**をクリックしてください。

### ステップ2:バケットにアクセスするためのサービスアカウントを作成する{#step-2-create-a-service-account-to-access-the-bucket}

このステップでは、サービスアカウントを作成し、複数のロールをサービスアカウントに関連付け、サービスアカウントをZilliz Cloudに提供して、上記で作成したバケットをZilliz Cloudがアクセス可能にします。

<Supademo id="cmc1mg9bvjk4bsn1r8awkyndh" title=""  />

ストレージサービスアカウントを作成する手順は次のとおりです。

1. GCPコンソールで、**IAM&Admin**を見つけてクリックしてください。

1. 左のナビゲーションペインで**サービスアカウント**を選択してください。

1. 「サービスアカウントの作成」をクリックしてください。

1. 作成するサービスアカウントの名前を設定します。 

    このデモでは、`your-org-storage-sa`に設定できます。サービスアカウントIDは、サービスアカウント名の最初の18文字である必要があります。手動で適切な値に設定できます。

1. 「作成して続行」をクリックしてください。

1. 「権限」に、条件付きで2つの役割を追加してください。

    1. ドロップダウンリストから**Storage Object Admin**を選択してください。

    1. 「IAM条件の追加」をクリックし、条件のタイトルを設定し、以下の条件を「条件エディター」に入力してください。

        ```json
        resource.name.startsWith("projects/_/buckets/YOUR_BUCKET_NAME")
        ```

        <Admonition type="info" icon="📘" title="ノート">

        <p><code>YOUR_BUCKET_NAME</code>は、前の手順で作成したバケットの名前に置き換える必要があります。</p>

        </Admonition>

    1. 「保存」をクリックしてください。

    1. 「別の役割を追加」をクリックしてください。

    1. ドロップダウンリストから**Storage Bucket Viewer**を選択してください。

    1. 「IAM条件の追加」をクリックし、条件のタイトルを設定し、以下の条件を「条件エディター」に入力してください。

        ```json
        resource.name.startsWith("projects/_/buckets/YOUR_BUCKET_NAME")
        ```

        <Admonition type="info" icon="📘" title="ノート">

        <p>条件ビルダーと条件エディターは、条件を設定する同等の方法です。どちらの場合でも、<code>YOUR_BUCKET_NAME</code>を前のステップで作成したバケットの名前に置き換える必要があります。</p>

        </Admonition>

    1. **保存**をクリック

1. 「完了」をクリックしてください。

