---
title: "Google Cloud KMS | BYOC"
slug: /gcp-kms
sidebar_label: "Google Cloud KMS"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
channel: next
sidebar_custom_props:
  channel: next
description: "Google Cloud Key Management Service（KMS）は、データの暗号化と署名に使用するキーを簡単に作成および制御できるようにする、Google Cloud が管理するサービスです。 | BYOC"
type: origin
token: MKAJwmebRiSsOrkgShUcaHS9nhe
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Google Cloud KMS

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は Business Critical（SaaS）および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は AWS で利用できます。Google Cloud と Microsoft Azure では利用できません。

</FeatureNote>

Google Cloud Key Management Service（KMS）は、データの暗号化と署名に使用するキーを簡単に作成および制御できるようにする、Google Cloud が管理するサービスです。 

## 概要\{#overview}

Google Cloud KMS では、暗号化キーは **CryptoKey** として表され、特定の Google Cloud ロケーションにある **キーリング** に属します。Zilliz Cloud 用に CMEK を構成する場合は、Zilliz Cloud がデータの暗号化に使用する CryptoKey を指定します。キーリングはキーを整理するためのものであり、それ自体は暗号化キーではありません。

一般的なケースでは、CryptoKey を使用して Zilliz Cloud クラスター内のデータを暗号化することはありません。代わりに、CryptoKey を使用して暗号化ゾーンキー（EZK）を暗号化し、EZK を使用してデータ暗号化キー（DEK）を暗号化し、DEK を使用してデータを暗号化します。

![Cqi8wMUzHhKJD0bEzR2csNWAnNe](https://zdoc-images.s3.us-west-2.amazonaws.com/Cqi8wMUzHhKJD0bEzR2csNWAnNe.png)

暗号化の仕組みとその適用範囲の詳細については、[このセクション](./cmek#how-encryption-works) を参照してください。CMEK 機能の制限事項の詳細については、[このセクション](./cmek#limitations) を参照してください。CMEK 機能を使用するには、このページの手順に従ってください。

## 事前準備\{#before-you-start}

- キー管理コマンドを実行するための十分な権限を持っていること。

## Google Cloud CryptoKey を追加する\{#add-google-cloud-cryptokey}

各プロジェクトでは、KMS プロバイダーに関係なく、最大 **20** 個のキーを使用できます。Google Cloud CryptoKey を Zilliz Cloud に追加するには、既存のキーリングを使用するか、新しいキーリングを作成してその中に CryptoKey を作成します。

Google Cloud CryptoKey を追加するには、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、左側のナビゲーションペインで **Network** > **CMEK** を選択し、該当する Google Cloud リージョンにある **Business Critical** プロジェクトのいずれかを開き、**+ CMEK** をクリックし、**Add CMEK (Google Cloud KMS)** ダイアログボックスの手順に従ってプロセスを完了します。 

<Procedures>

1. リージョンを選択し、サービスアカウントを準備します。

    ![F1IIwn3g9hxwxBb9DHlcmJKunig](https://zdoc-images.s3.us-west-2.amazonaws.com/F1IIwn3g9hxwxBb9DHlcmJKunig.png)

    1. **Select the region** ステップのドロップダウンをクリックします。

    1. **Prepare a dedicated Google service account** ステップで **Prepare Service Account** をクリックします。

        Zilliz Cloud は、指定されたリージョンに有効期間の短い認証情報を持つサービスアカウントを生成します。生成された **Service Account Email** の下に **Ready** が表示されたら、**Next** をクリックします。

1. Google Cloud KMS キーを作成します。

    ![HR1QwmmaCh3p6kbkS7IcvbDfnof](https://zdoc-images.s3.us-west-2.amazonaws.com/HR1QwmmaCh3p6kbkS7IcvbDfnof.png)

    1. 表示されたリージョンを確認し、**GCP Project ID**、**Protection level**、**Key ring name**、**Key name** を入力します。これらの欄で指定した値によって、以下のテンプレートに記載されているコマンドが変更されます。 

        既存のキーリングがない場合は、**Key ring name** で指定した名前を使用してキーリングが作成されます。それ以外の場合は、**Use an existing key ring** を選択します。その場合、指定したキーリングが実際に存在することを確認してください。

    1. 用意されたコマンドをコピーし、[Google Cloud Shell](https://shell.cloud.google.com/) で実行します。

    1. コマンドから返されたキーリソース名をコピーし、**Key resource name** に貼り付けます。

1. キーの権限を構成します。

    ![SVbaw9LdQhOFJNbOhfHcQ6jHnPf](https://zdoc-images.s3.us-west-2.amazonaws.com/SVbaw9LdQhOFJNbOhfHcQ6jHnPf.png)

    1. ダイアログボックスに表示されたコマンドをコピーし、[Google Cloud Shell](https://shell.cloud.google.com/) で実行します。

        これらのコマンドを実行すると、ステップ 1 で準備した Google Cloud サービスアカウントに必要なキー権限が関連付けられます。 

    1. **Validate KMS Key** をクリックします。

    1. キーが検証されたら、**Add** をクリックしてキーを追加します。

</Procedures>

## Google Cloud KMS キーを管理する\{#manage-google-cloud-kms-keys}

追加した Google Cloud KMS キーは、Zilliz Cloud コンソールで確認できます。

![JIOvwK1qghkys1b4drXcZUyFnCb](https://zdoc-images.s3.us-west-2.amazonaws.com/JIOvwK1qghkys1b4drXcZUyFnCb.png)

KMS キーが不要になった場合は、クラスターがそのキーを使用していない場合に削除できます。

## Google Cloud KMS キーを使用する\{#use-google-cloud-kms-keys}

Zilliz Cloud に KMS キーを追加すると、そのキーを使用して暗号化されたクラスターを作成したり、クラスターのバックアップと復元を行ったりできます。

### 暗号化されたクラスターを作成する\{#create-an-encrypted-cluster}

クラスターを作成するリージョンで利用可能な KMS キーを選択して、クラスターを暗号化できます。

![RGUrbElsSoc61JxikfWcoTCrnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rgurbelssoc61jxikfwcotcrnhe.png "RGUrbElsSoc61JxikfWcoTCrnHe")

KMS キーを追加すると、次のようにして暗号化されたクラスターを作成できます。

<Procedures>

1. **Choose Deployment Option** セクションで **Dedicated** をクリックします。

1. クラスターのクラウドプロバイダーとリージョンを選択します。

1. **Encryption at Rest with CMEK** を有効にし、既存の KMS キーを選択します。作成するクラスターと同じリージョンにある KMS キーのみ選択できます。

1. 概要を確認し、**Create Cluster** をクリックします。

    ![Iy8JbR19eoBQ4YxV1PjcLfUinl7](https://zdoc-images.s3.us-west-2.amazonaws.com/iy8jbr19eobq4yxv1pjclfuinl7.png "Iy8JbR19eoBQ4YxV1PjcLfUinl7")

    暗号化されたクラスターの **Overview** ページでは、上の図に示すように、クラスター名の右側にキーアイコンが表示されます。暗号化されたクラスター内で作成されたすべてのコレクションは、デフォルトで暗号化されます。

</Procedures>

### 暗号化されたバックアップファイルから復元する\{#restore-from-an-encrypted-backup-file}

暗号化されたバックアップを新しいクラスターに復元すると、Zilliz Cloud は復元の前に、バックアップファイルに関連付けられた KMS キーを使用してデータを復号します。そのため、暗号化の有無にかかわらず、バックアップを新しいクラスターに復元できます。 

![WaApbDlaYoywaMxxUMxcQLAOnDe](https://zdoc-images.s3.us-west-2.amazonaws.com/waapbdlayoywamxxumxcqlaonde.png "WaApbDlaYoywaMxxUMxcQLAOnDe")

暗号化されたバックアップからの復元手順は、**Encryption at Rest with CMEK** を有効にするかどうかを除いて、通常の復元とほぼ同じです。

![V1QJb3SK1oGa11xLljhcxKQEnkc](https://zdoc-images.s3.us-west-2.amazonaws.com/v1qjb3sk1oga11xlljhcxkqenkc.png "V1QJb3SK1oGa11xLljhcxKQEnkc")

- このオプションを有効にすると、復元後に作成されるクラスターは、以下で指定する KMS キーを使用して暗号化されます。

- このオプションを無効にすると、復元後に作成されるクラスターは暗号化されません。

