---
title: "Microsoft Azure KMS | Cloud"
slug: /azure-kms
sidebar_label: "Microsoft Azure KMS"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
channel: next
sidebar_custom_props:
  channel: next
description: "Microsoft Azure Key Vault Service は Microsoft Azure のマネージドサービスであり、データの暗号化と署名に使用するキーを簡単に作成・制御できます。 | Cloud"
type: origin
token: R6pDwUeXti5GiOkkAHBcKxeJnNQ
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Microsoft Azure KMS

Microsoft Azure Key Vault Service は Microsoft Azure のマネージドサービスであり、データの暗号化と署名に使用するキーを簡単に作成・制御できます。

## 概要\{#overview}

通常、Zilliz Cloud クラスターでデータを暗号化するために Azure Key Vault キーを使用することはありません。代わりに、キーを使用して暗号化ゾーンキー（EZK）を暗号化し、EZK を使用してデータ暗号化キー（DEK）を暗号化し、DEK を使用してデータを暗号化します。

![ZVyiwdgROhq7tfbmQFDccgdJnmb](https://zdoc-images.s3.us-west-2.amazonaws.com/ZVyiwdgROhq7tfbmQFDccgdJnmb.png)

暗号化の仕組みとその適用範囲の詳細については、[このセクション](./cmek#how-encryption-works) を参照してください。CMEK 機能の制限事項の詳細については、[このセクション](./cmek#limitations) を参照してください。CMEK 機能を使用するには、このページの手順に従ってください。

## 事前準備\{#before-you-start}

- このガイドのすべての Bash コマンドは、[Azure Cloud Shell](https://learn.microsoft.com/en-us/azure/cloud-shell/overview) で実行すること。

    詳細については、[Azure Cloud Shell の使用を開始する](https://learn.microsoft.com/en-us/azure/cloud-shell/quickstart) を参照してください。

- Zilliz Cloud でキー管理コマンドを実行するための十分な権限があること。

## Azure Portal での準備\{#prepare-in-azure-portal}

クラスターでデータを暗号化するための Zilliz Cloud CMEK を作成する際は、登録済みの Microsoft Entra アプリケーションと Microsoft Azure リソースグループの ID を指定する必要があります。このセクションでは、Azure Cloud Shell と Azure Portal でこれらを作成する方法について説明します。

<details>

<summary>詳細設定を表示するには、ここをクリックしてください。</summary>

### リソースグループを作成する\{#create-a-resource-group}

リソースグループは、Azure ソリューションに関連するリソースを保持するコンテナーです。既存のものを使用することも、次のように作成することもできます。

![P1cAwgAO9hqnbUbdqAsc5GY2nLf](https://zdoc-images.s3.us-west-2.amazonaws.com/P1cAwgAO9hqnbUbdqAsc5GY2nLf.png)

<Procedures>

1. Azure Portal で [リソースグループの作成](https://portal.azure.com/#view/HubsExtension/ResourceGroupCreate.ReactView) ページを開きます。

1. ドロップダウンリストからサブスクリプションを選択し、リソースグループに名前を付けて、リージョンを選択します。

    リソースグループ、キーコンテナー、暗号化キー、および Zilliz Cloud CMEK エントリには、<em>**同じリージョンを使用**</em>してください。

1. **Review + create** をクリックします。

</Procedures>

代わりに、次のシェルコマンドを実行することもできます。

```bash
# Define variables
RG_NAME="my-zilliz-cmek-rg"  # Change to your preferred name
LOCATION="eastus"          # Change to your preferred Azure region (e.g., westus2, chinanorth)

# Create the Resource Group
az group create \
  --name "$RG_NAME" \
  --location "$LOCATION"
```

後で使用するため、リソースグループ名を控えておいてください。

### Microsoft Entra アプリケーションを登録する\{#register-a-microsoft-entra-application}

Entra アプリケーションも、このユースケースで認証資格情報を保持するために使用するコンテナーです。既存のものを使用することも、次のように新しく作成することもできます。

![OAJYw3jkthDAQRbuxKicV34xnCe](https://zdoc-images.s3.us-west-2.amazonaws.com/OAJYw3jkthDAQRbuxKicV34xnCe.png)

<Procedures>

1. Azure Portal で [アプリケーションの登録](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/CreateApplicationBlade/quickStartType~/null/isMSAApp~/false) ページを開きます。

1. アプリケーションに名前を付け、ドロップダウンリストからサポートされているアカウントの種類を選択します。

    **Help me choose** をクリックして、ニーズに合ったオプションを確認します。

1. **Review + create** をクリックします。

</Procedures>

または、次のコマンドを実行してアプリを登録することもできます。

```bash
# Define the app name
APP_NAME="my-zilliz-cmek-entra-app" # Change to your preferred app name

# Create the App Registration
az ad app create --display-name "$APP_NAME"
```

### キーコンテナーを作成する\{#create-a-key-vault}

Azure Key Vault は、キー、シークレット、証明書を管理するために使用するクラウドサービスです。

![WQmHw0X4IhAHOsbi9eNcZmalncb](https://zdoc-images.s3.us-west-2.amazonaws.com/WQmHw0X4IhAHOsbi9eNcZmalncb.png)

<Procedures>

1. Azure Portal で [キーコンテナーの作成](https://portal.azure.com/#view/Microsoft_Azure_KeyVault/CreateKeyVaultBlade) ページを開きます。

1. ドロップダウンリストから前のセクションで作成したリソースグループを選択し、キーコンテナーに名前を付けて、リージョンを選択します。

    リソースグループ、キーコンテナー、暗号化キー、および Zilliz Cloud CMEK エントリには、<em>**同じリージョンを使用**</em>してください。

1. HSM ベースのキーを使用できるように、価格レベルを **Standard** から **Premium** に変更します。

1. すべてのタブで、その他のオプションは既定の設定のままにします。

1. **Review + create** をクリックします。

</Procedures>

代わりに、次のシェルコマンドを実行することもできます。

```bash
# Define your variables
KV_NAME="my-zilliz-cmek-kv" # Or your preferred unique name
RESOURCE_GROUP="<your-resource-group-name>"
LOCATION="<your-region>" # e.g., eastus, chinanorth, etc.

# Create the Key Vault
az keyvault create \
  --name "$KV_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku premium \
  --enable-rbac-authorization true
```

キーコンテナーを作成した後でも、コンテナー内のキーを管理するために必要な権限が自動的に付与されない場合があります。次のコマンドを実行して、必要な権限を取得します。

```bash
az ad signed-in-user show --query id -o tsv

# Set your variables
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
RESOURCE_GROUP="<your-resource-group-name>"
VAULT_NAME="my-zilliz-cmek-kv"
ASSIGNEE="<your-email-or-app-id>" # The output from Step 1

# Assign the role
az role assignment create \
  --assignee "$ASSIGNEE" \
  --role "Key Vault Crypto Officer" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.KeyVault/vaults/$VAULT_NAME"
```

</details>

この手順の完了時には、次のすべての項目が揃っている必要があります。

- Azure サブスクリプション ID とディレクトリ ID を取得していること。

- Azure リソースグループ名を確認していること。

- Microsoft Entra アプリケーション（クライアント）ID を取得していること。

- Azure Key Vault 名を確認していること。

## Zilliz Cloud で Azure Key Vault キーを追加する\{#add-an-azure-key-vault-key-on-zilliz-cloud}

Azure Key Vault キーを追加するには、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、左側のナビゲーションペインで **Security** > **CMEK** を選択し、該当する Azure リージョンを持つプロジェクトのいずれかに移動して、**+ CMEK** をクリックし、**Add CMEK (Azure KMS)** ダイアログボックスの手順に従ってプロセスを完了します。

開始する前に、手順で使用する Microsoft Entra アプリケーションを決める必要があります。Zilliz Cloud を使用して **Key Vault** キーを追加すると、利用可能な Entra アプリケーションが Zilliz Cloud に表示されます。**Existing Application** タブの **Select an Existing Application** ステップでドロップダウンリストを確認し、必要な IAM ロールが一覧に含まれているかを判断します。

- 含まれている場合は、[既存のアプリを使用して Key Vault キーを追加する](./azure-kms#add-an-azure-key-vault-key-using-an-existing-app) に進みます。

- 含まれていない場合は、[新しいアプリを使用して Key Vault キーを追加する](./azure-kms#add-an-azure-key-vault-key-using-a-new-app) に進みます。

### 既存のアプリを使用して Azure Key Vault キーを追加する\{#add-an-azure-key-vault-key-using-an-existing-app}

**Existing Application** タブの **Select an Existing Application** のドロップダウンリストに必要なアプリケーションが含まれている場合は、このセクションの手順に従ってください。含まれていない場合は、[新しいアプリを使用して Azure Key Vault キーを追加する](./azure-kms#add-an-azure-key-vault-key-using-a-new-app) を参照してください。

<Procedures>

1. **Select an Existing Application** で **Region** と **Application** を選択します。

    ![VcfbwAQCWhRCFpbt9rIcP7Jrn3g](https://zdoc-images.s3.us-west-2.amazonaws.com/VcfbwAQCWhRCFpbt9rIcP7Jrn3g.png)

    <Procedures>

    1. ドロップダウンリストから対象のリージョンを選択します。

    1. ドロップダウンリストから対象の Entra アプリケーション ID を選択します。

    1. 以下に表示される **Application ID** と **Directory ID** を確認し、Next をクリックします。

    </Procedures>

1. キーを作成または既存のキーを使用し、キー識別子を送信します。

    ![X7FRwIkoHh4GFbbqDmtc7G1Xn2c](https://zdoc-images.s3.us-west-2.amazonaws.com/X7FRwIkoHh4GFbbqDmtc7G1Xn2c.png)

    <Procedures>

    1. キーに名前を付け、所属するキーコンテナーを設定して新しいキーを作成し、指定されたコマンドを Azure Cloud Shell で実行します。

    1. コマンド出力に含まれるキー識別子を **Key Identifier** に入力します。

        コマンドが失敗した場合、キーコンテナー内のキーを管理する権限がない可能性があります。その場合は、次のコマンドを実行して **Key Vault Crypto Officer** ロールを要求してください。詳細については、[キーコンテナーの作成](./azure-kms#create-a-key-vault) を参照してください。

    1. **Next** をクリックします。

    </Procedures>

1. キーを検証します。

    ![KqouwgKN2hF7ihbZxQYczLTWnhh](https://zdoc-images.s3.us-west-2.amazonaws.com/KqouwgKN2hF7ihbZxQYczLTWnhh.png)

    <Procedures>

    1. Azure Portal に移動し、キーコンテナーを探して、Zilliz Cloud コンソールに表示されているキー名をクリックします。

    1. 左側のナビゲーションで **Access Control (IAM)** を選択し、**+ Add** > **Add role assignment** をクリックします。

    1. **Role** タブで **Job function roles** をクリックし、**Key Vault Crypto User** を検索してロールを選択し、**Next** をクリックします。

    1. **Members** タブで **User, group, or service principal** を選択し、**+ Select members** をクリックして、検索ボックスに Entra アプリケーション名を入力し、アプリケーションを選択して **Select** をクリックします。

    1. **Review + assign** を 2 回クリックして、アプリケーションにロールを割り当てます。

    1. **This application has read, encrypt, and decrypt permissions on this key.** を選択します。

    1. Zilliz Cloud コンソールに戻り、**Validate Key** をクリックします。

    1. 検証に合格したら、**Add** をクリックします。

    </Procedures>

</Procedures>

### 新しいアプリを使用して Azure Key Vault キーを追加する\{#add-an-azure-key-vault-key-using-a-new-app}

**Existing Application** タブの **Select an Existing Application** のドロップダウンリストに必要なアプリケーションが含まれていない場合は、**New Application** タブに切り替え、このセクションの手順に従ってください。含まれている場合は、[既存のアプリを使用して Azure Key Vault キーを追加する](./azure-kms#add-an-azure-key-vault-key-using-an-existing-app) を参照してください。

<Procedures>

1. **Region** を選択し、**Select an Existing Application** で **Application (client) ID** と **Directory ID** を設定します。

    ![IPTPw02X0hVb8Bb2W2LcYRS3ncc](https://zdoc-images.s3.us-west-2.amazonaws.com/IPTPw02X0hVb8Bb2W2LcYRS3ncc.png)

    <Procedures>

    1. ドロップダウンリストから対象のリージョンを選択します。

    1. **Application (client) ID** と **Directory ID** を設定します。

    1. Azure Portal に移動し、Entra アプリケーションを探して、アプリケーション名をクリックします。

    1. 左側のナビゲーションで **Manage** > **Certificates & secrets** を選択し、**Federated credentials** をクリックして、**+ Add credential** をクリックします。

    1. **Add a credential** ページで、**Federated credential scenario** の **Kubernetes accessing Azure resources** を選択します。

    1. **クラスター issuer URL**、**Namespace**、**Service account name** に Zilliz Cloud コンソールに表示される値を入力し、**Subject identifier** と **Audience** を検証します。

    1. 資格情報に名前を付け、**Add** をクリックします。

    </Procedures>

1. キーを作成または既存のキーを使用し、キー識別子を送信します。

    ![M9unwFmYhhfd0Hb0E9ZcVxbnnhb](https://zdoc-images.s3.us-west-2.amazonaws.com/M9unwFmYhhfd0Hb0E9ZcVxbnnhb.png)

    <Procedures>

    1. キーに名前を付け、所属するキーコンテナーを設定して新しいキーを作成し、指定されたコマンドを Azure Cloud Shell で実行します。

    1. コマンド出力に含まれるキー識別子を **Key Identifier** に入力します。

        コマンドが失敗した場合、キーコンテナー内のキーを管理する権限がない可能性があります。その場合は、次のコマンドを実行して **Key Vault Crypto Officer** ロールを要求してください。詳細については、[キーコンテナーの作成](./azure-kms#create-a-key-vault) を参照してください。

    1. **Next** をクリックします。

    </Procedures>

1. キーを検証します。

    ![SyC7wz0QKh8XlHbMpNzcdCYEnyd](https://zdoc-images.s3.us-west-2.amazonaws.com/SyC7wz0QKh8XlHbMpNzcdCYEnyd.png)

    <Procedures>

    1. Azure Portal に移動し、キーコンテナーを探して、Zilliz Cloud コンソールに表示されているキー名をクリックします。

    1. 左側のナビゲーションで **Access Control (IAM)** を選択し、**+ Add** > **Add role assignment** をクリックします。

    1. **Role** タブで **Job function roles** をクリックし、**Key Vault Crypto User** を検索してロールを選択し、**Next** をクリックします。

    1. **Members** タブで **User, group, or service principal** を選択し、**+ Select members** をクリックして、検索ボックスに Entra アプリケーション名を入力し、アプリケーションを選択して **Select** をクリックします。

    1. **Review + assign** を 2 回クリックして、アプリケーションにロールを割り当てます。

    1. **This application has read, encrypt, and decrypt permissions on this key.** を選択します。

    1. Zilliz Cloud コンソールに戻り、**Validate Key** をクリックします。

    1. 検証に合格したら、**Add** をクリックします。

    </Procedures>

</Procedures>

## Azure Key Vault キーを管理する\{#manage-azure-key-vault-keys}

Zilliz Cloud コンソールで、追加した Azure Key Vault キーを表示できます。

![Q5lCwkbomhYAwbbE8wQcOnTgnkd](https://zdoc-images.s3.us-west-2.amazonaws.com/Q5lCwkbomhYAwbbE8wQcOnTgnkd.png)

<Procedures>

1. 対象のプロジェクトを探します。

1. 左側のナビゲーションペインで **Security** > **CMEK** をクリックします。

1. **Azure KMS** をクリックして、追加したキーを表示します。

1. （任意）不要になったキーを削除するには、**Remove** をクリックします。

</Procedures>

Zilliz Cloud は 10 分ごとに、一覧に表示されたキーの可用性をスキャンします。一覧に表示された KMS キーのステータスに関するプロジェクトアラートを作成することもできます。詳細については、[プロジェクトアラートの管理](./manage-project-alerts#create-a-project-alert) を参照してください。

KMS キーが不要になったら、そのキーを使用しているクラスターがない場合に削除できます。

## Azure KMS キーを使用する\{#use-azure-kms-keys}

Zilliz Cloud に KMS キーを追加すると、そのキーを使用して暗号化されたクラスターを作成し、バックアップと復元を行うことができます。

### 暗号化されたクラスターを作成する\{#create-an-encrypted-cluster}

クラスターを作成するリージョンで利用可能な KMS キーを選択して、クラスターを暗号化できます。

![RGUrbElsSoc61JxikfWcoTCrnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rgurbelssoc61jxikfwcotcrnhe.png "RGUrbElsSoc61JxikfWcoTCrnHe")

KMS キーを追加すると、次の手順で暗号化されたクラスターを作成できます。

<Procedures>

1. **Choose Deployment Option** セクションで **Dedicated** をクリックします。

1. クラスターのクラウドプロバイダーとリージョンを選択します。

1. **Encryption at Rest with CMEK** を有効にし、既存の KMS キーを選択します。作成するクラスターと同じリージョンにある KMS キーのみ選択できます。

1. 概要を確認してから、**Create Cluster** をクリックします。

    ![Iy8JbR19eoBQ4YxV1PjcLfUinl7](https://zdoc-images.s3.us-west-2.amazonaws.com/iy8jbr19eobq4yxv1pjclfuinl7.png "Iy8JbR19eoBQ4YxV1PjcLfUinl7")

    暗号化されたクラスターの **Overview** ページでは、上の図に示すように、クラスター名の右側にキーアイコンが表示されます。暗号化されたクラスターで作成されたすべてのコレクションは、既定で暗号化されます。

</Procedures>

### 暗号化されたバックアップファイルから復元する\{#restore-from-an-encrypted-backup-file}

暗号化されたバックアップを新しいクラスターに復元すると、Zilliz Cloud は復元前に、バックアップファイルに関連付けられた KMS キーを使用してデータを復号します。そのため、暗号化を有効にするかどうかにかかわらず、バックアップを新しいクラスターに復元できます。

![WaApbDlaYoywaMxxUMxcQLAOnDe](https://zdoc-images.s3.us-west-2.amazonaws.com/waapbdlayoywamxxumxcqlaonde.png "WaApbDlaYoywaMxxUMxcQLAOnDe")

暗号化されたバックアップからの復元手順は、**Encryption at Rest with CMEK** を有効にするかどうかを除き、通常の復元とほぼ同じです。

![V1QJb3SK1oGa11xLljhcxKQEnkc](https://zdoc-images.s3.us-west-2.amazonaws.com/v1qjb3sk1oga11xlljhcxkqenkc.png "V1QJb3SK1oGa11xLljhcxKQEnkc")

- このオプションを有効にすると、復元後に作成されるクラスターは、以下で指定する KMS キーを使用して暗号化されます。

- このオプションを無効にすると、復元後に作成されるクラスターは暗号化されません。
