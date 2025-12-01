---
title: "Cloud Storage バケットとサービスアカウントの作成 | BYOC"
slug: /create-bucket-and-service-account
sidebar_label: "Cloud Storage バケットとサービスアカウントの作成"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Bring-Your-Own-Cloud (BYOC) プロジェクトのルートストレージを作成および構成する手順と適切な権限について説明します。 | BYOC"
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
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Cloud Storage バケットとサービスアカウントの作成

このページでは、Bring-Your-Own-Cloud (BYOC) プロジェクトのルートストレージを作成および構成する手順と適切な権限について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在、<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当</a>にお問い合わせください。</p>

</Admonition>

## Cloud Storage バケットのベストプラクティス\{#best-practices-for-the-cloud-storage-bucket}

プロジェクト展開中に指定するバケットは、プロジェクトで作成されたクラスターのルートストレージとして使用されます。Cloud Storage バケットを作成する前に、以下のベストプラクティスを確認してください：

- バケットはプロジェクト展開と同じ Google Cloud Platform (GCP) リージョンに存在する必要があります。

- プロジェクト内のすべてのクラスターは、プロジェクト展開中に作成された Cloud Storage バケットを共有します。Zilliz Cloud では、プロジェクト専用の Cloud Storage バケットを使用し、他のサービスやリソースと共有しないことを推奨します。

## 手順\{#procedure}

GCP ダッシュボードを使用してバケットとサービスアカウントを作成できます。別の方法として、Zilliz Cloud が提供する Terraform スクリプトを使用して、GCP 上の Zilliz Cloud プロジェクト用インフラストラクチャをブートストラップできます。詳細については、[Terraform プロバイダー](./terraform-provider) を参照してください。

### ステップ1: Cloud Storage バケットを作成\{#step-1-create-a-cloud-storage-bucket}

このステップでは、BYOC プロジェクト展開用に GCP 上に Cloud Storage バケットを作成します。既存のバケットを使用することを選択した場合は、バケットが BYOC プロジェクトと同じリージョンにあることを確認してください。作成後、Zilliz Cloud コンソールの **ストレージ設定** にバケット名を入力します。

<Supademo id="cmbg4ro374d54sn1rdnv6ca32" title=""  />

バケットを作成する手順は以下のとおりです：

1. GCP コンソールで、**Cloud Storage** を検索してクリックします。

1. **バケットを作成** をクリックします。

    このデモでは、`zilliz-byoc-your-org-bucket` に設定できます。または、命名規則に従ってください。

1. 作成するバケットの説明的な名前を設定します。

1. **ロケーションタイプ** で **リージョン** を選択して、単一リージョン内での最小遅延を確保し、表示されるドロップダウンリストから BYOC プロジェクトのリージョンを選択します。

    このデモでは、`us-west (オレゴン)` に設定できます。この値が BYOC プロジェクトのものと同じであることを確認してください。

1. **続行** をクリックします。

1. **アクセス制御** で、**細かい粒度** を選択して、細かい粒度のパブリックアクセス防止を有効にします。

1. **続行** をクリックします。

1. デフォルト設定を維持して、**作成** をクリックします。

1. 表示されるダイアログボックスで **確認** をクリックし、作成するバケットへのパブリックアクセス防止を確認します。

### ステップ2: バケットにアクセスするためのサービスアカウントを作成\{#step-2-create-a-service-account-to-access-the-bucket}

このステップでは、サービスアカウントを作成し、サービスアカウントに関連する複数のロールを追加し、Zilliz Cloud が上記で作成したバケットにアクセスできるようにするために Zilliz Cloud にサービスアカウントを提供します。

<Supademo id="cmc1mg9bvjk4bsn1r8awkyndh" title=""  />

ストレージサービスアカウントを作成する手順は以下のとおりです：

1. GCP コンソールで、**IAM & Admin** を検索してクリックします。

1. 左側のナビゲーションペインで **サービスアカウント** を選択します。

1. **サービスアカウントを作成** をクリックします。

1. 作成するサービスアカウントの名前を設定します。

    このデモでは、`your-org-storage-sa` に設定できます。サービスアカウントIDはサービスアカウント名の最初の18文字である必要があります。適切な値に手動で設定できます。

1. **作成して続行** をクリックします。

1. **権限** で、条件付きの2つのロールを追加します。

    1. ドロップダウンリストから **ストレージオブジェクト管理者** を選択します。

    1. **IAM条件を追加** をクリックし、条件のタイトルを設定し、**条件エディター** に以下の条件を入力します。

        ```json
        resource.name.startsWith("projects/_/buckets/YOUR_BUCKET_NAME")
        ```

        <Admonition type="info" icon="📘" title="Notes">

        <p><code>YOUR_BUCKET_NAME</code> を前のステップで作成したバケット名に置き換える必要があります。</p>

        </Admonition>

    1. **保存** をクリックします。

    1. **別のロールを追加** をクリックします。

    1. ドロップダウンリストから **ストレージバケットビューアー** を選択します。

    1. **IAM条件を追加** をクリックし、条件のタイトルを設定し、**条件エディター** に以下の条件を入力します。

        ```json
        resource.name.startsWith("projects/_/buckets/YOUR_BUCKET_NAME")
        ```

        <Admonition type="info" icon="📘" title="Notes">

        <p><strong>条件ビルダー</strong> と <strong>条件エディター</strong> は、条件を設定するための同等の方法です。いずれの場合も、<code>YOUR_BUCKET_NAME</code> を前のステップで作成したバケット名に置き換える必要があります。</p>

        </Admonition>

    1. **保存** をクリックします

1. **完了** をクリックします。
