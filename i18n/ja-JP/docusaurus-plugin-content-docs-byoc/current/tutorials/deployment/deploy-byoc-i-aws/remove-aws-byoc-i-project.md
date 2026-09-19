---
title: "AWS BYOC-I プロジェクトを削除する | BYOC"
slug: /remove-aws-byoc-i-project
sidebar_label: "AWS BYOC-I プロジェクトを削除する"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、まず Zilliz Cloud から AWS BYOC-I データプレーンを削除し、コンソールから表示されなくなるまで待ってから、標準の Terraform CLI を使用して顧客クラウドのインフラストラクチャを削除する方法について説明します。 | BYOC"
type: origin
token: Yt3TwxIUMirFhfkkpefcOmT6niQ
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS BYOC-I プロジェクトを削除する

このページでは、まず Zilliz Cloud から AWS BYOC-I データプレーンを削除し、コンソールから表示されなくなるまで待ってから、標準の Terraform CLI を使用して顧客クラウドのインフラストラクチャを削除する方法について説明します。

<Admonition type="warning" title="Warning">

データプレーンを削除し、S3 の `force_destroy` を有効にすると、Milvus データが完全に削除されます。この手順を開始する前に、必要なバックアップを完了して検証してください。

</Admonition>

## 事前準備\{#prerequisites}

開始する前に、以下を満たしていることを確認してください。

- Zilliz Cloud で対象のデータプレーンを削除する権限があること。

- Terraform 構成、バックエンド、Zilliz Cloud API キー、AWS 認証情報、および必要な変数ファイルにアクセスできること。

- インストールされている Terraform とプロバイダーのバージョンが、既存の状態の管理に使用されたものと一致していること。

- プロジェクト ID、データプレーン ID、AWS アカウント、AWS リージョン、バックエンド、および Terraform ワークスペースが個別に検証されていること。

- 必要なデータがすべてバックアップされているか、データ所有者が完全削除を明示的に承認していること。

- デプロイ、スケーリング、アップグレード、バックアップ、復元、または移行のジョブが実行されていないこと。

| 項目 | 記録値 |
| --- | --- |
| プロジェクト名 / ID | `<project-name>` / `<project-id>` |
| データプレーン名 / ID | `<data-plane-name>` / `<data-plane-id>` |
| AWS アカウント / リージョン | `<account-id>` / `<region>` |
| バックエンド / ワークスペース | `<backend>` / `<workspace>` |
| Terraform 環境 | `Production` または `var.env` の元の値 |
| 必要なコマンド入力 | `ZILLIZCLOUD_API_KEY`、`-var="project_id=..."`、-`var="dataplane_id=..."` |
| 変数ファイル | `<terraform.tfvars>` |
| 承認者 | `<data-owner>`、`<infrastructure-owner>` |

## ステップ 1: すべてのサービングクラスターを削除する\{#step-1-delete-every-serving-cluster}

<Procedures>

1. Zilliz Cloud にサインインし、対象の BYOC プロジェクトを開きます。

1. データプレーン内のすべてのサービングクラスターまたはアプリケーションを削除します。

1. すべてのクラスター削除操作が完了するまで待ちます。

1. データプレーンカードに **0 クラスター** と表示され、実行中の操作がないことを確認します。

</Procedures>

<Admonition type="info" title="Notes">

**クラスターが存在している間は続行しないでください。** 実行中、一時停止中、または削除中のクラスターも存在しているものとみなされます。クラスターリストが空になるまで待ってください。

</Admonition>

## ステップ 2: Zilliz Cloud でデータプレーンを削除する\{#step-2-delete-the-data-plane-in-zilliz-cloud}

<Procedures>

1. プロジェクトナビゲーションで **Data Planes** を選択します。

1. 対象のデータプレーンを見つけ、その名前、ID、クラウドリージョン、および **0 クラスター** ステータスを確認します。

1. データプレーンカードの右下にある **...** メニューをクリックします。

1. **Delete** を選択し、確認ダイアログを完了します。

</Procedures>

## ステップ 3: データプレーンが表示されなくなるまで待つ\{#step-3-wait-until-the-data-plane-disappears}

<Procedures>

1. コンソールの削除操作が完了するまで待ちます。

1. **Data Planes** ページを定期的に更新します。

1. 対象のデータプレーンカードが完全に表示されなくなったことを確認します。

1. 完了時刻を記録し、削除の証跡としてスクリーンショットを保管します。

</Procedures>

<Admonition type="info" title="Notes">

**Zilliz Cloud コンソールからデータプレーンが表示されなくなるまでは Terraform を実行しないでください。** *Deleting*、*Undeployed*、またはその他の状態で表示されているデータプレーンは、このゲートを通過していません。削除に失敗した場合、またはカードが表示されたままの場合は、いったん停止し、先にコンソール側の削除を解決してください。

</Admonition>

## ステップ 4: 削除準備の変更を適用する\{#step-4-apply-the-deletion-preparation-change}

ステップ 3 を通過した後にのみ、後続の destroy 操作で空でない S3 バケットを削除できるように Terraform 構成を更新します。

### Terraform ファイルマップ\{#terraform-file-map}

以下のパスは、`terraform-zilliz-examples` リポジトリのルートを基準としています。AWS BYOC-I の例では、以下のファイルを使用します。

```bash
terraform-zilliz-examples/
├── examples/
│   └── aws-project-byoc-I/
│       ├── main.tf
│       ├── provider.tf
│       ├── variables.tf
│       └── terraform.tfvars
└── modules/
    └── aws_byoc_i/
        └── s3/
            ├── s3.tf
            └── variables.tf
```

| ファイル | 必要な変更 |
| --- | --- |
| `modules/aws_byoc_i/s3/variables.tf` | ラッパーモジュールの入力 `force_destroy` を、安全なデフォルト値 `false` で宣言します。 |
| `modules/aws_byoc_i/s3/s3.tf` | `var.force_destroy` を上流の `terraform-aws-modules/s3-bucket/aws` モジュールに渡します。 |
| `examples/aws-project-byoc-I/main.tf` | `module "s3"` に `force_destroy = true` を設定し、`zillizcloud_byoc_i_project.this` を `prevent_destroy = false` に変更します。 |
| `examples/aws-project-byoc-I/variables.tf` | 必須の `project_id`、`dataplane_id`、およびオプションの `env` 入力をすでに宣言しています。削除固有の編集は不要です。 |
| `examples/aws-project-byoc-I/provider.tf` | 空の `provider "zillizcloud"` ブロックは、環境から `ZILLIZCLOUD_API_KEY` を読み取ります。このファイルにキーを記述しないでください。 |

<Admonition type="info" title="Notes">

**リポジトリで別のパスを使用している場合:** `resource "zillizcloud_byoc_i_project"` を含むルートモジュールから開始します。`module "s3"` の `source` 値に従ってそのラッパーモジュールを特定し、同じ 3 つの論理的な変更を行います。呼び出し元を確認せずに、別のプロジェクトに属するファイルや共有のデプロイ済みコピーを編集しないでください。

</Admonition>

### S3 force destroy を有効にする\{#enable-s3-force-destroy}

**ファイル:** `modules/aws_byoc_i/s3/variables.tf`

ラッパーモジュールに以下の変数を追加します。他の呼び出し元がデフォルトで削除可能にならないように、デフォルトは `false` のままにしておきます。

緑色で強調表示されている Terraform コードを追加または変更します。

```plaintext
variable "force_destroy" {
  description = "Allow Terraform to delete all objects when destroying the bucket"
  type        = bool
  default     = false
}
```

**ファイル:** `modules/aws_byoc_i/s3/s3.tf`

`module "s3_bucket"` 内で、既存の `bucket` 引数の隣に `force_destroy` を追加します。

```plaintext
module "s3_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.15.1"

  bucket        = local.bucket_name
  force_destroy = var.force_destroy

  # Remaining configuration omitted
}
```

**ファイル:** `examples/aws-project-byoc-I/main.tf`

既存の `module "s3"` ブロック内で、このデータプレーンの削除を明示的に有効にします。

```plaintext
module "s3" {
  source               = "../../modules/aws_byoc_i/s3"
  prefix_name          = local.prefix_name
  dataplane_id         = local.dataplane_id
  customer_bucket_name = var.customer_bucket_name
  custom_tags          = var.custom_tags
  enable_s3_kms        = var.enable_s3_kms
  s3_kms_key_arn       = var.s3_kms_key_arn
  force_destroy        = true
}
```

### プロジェクトの削除保護を無効にする\{#disable-project-deletion-protection}

**ファイル:** `examples/aws-project-byoc-I/main.tf`

`resource "zillizcloud_byoc_i_project" "this"` では、`ignore_changes` はそのままにし、`prevent_destroy` のみを変更します。

```plaintext
lifecycle {
  ignore_changes  = [data_plane_id, project_id, aws, ext_config]
  prevent_destroy = true
}
```

次のリテラル値に変更します。

```plaintext
lifecycle {
  ignore_changes  = [data_plane_id, project_id, aws, ext_config]
  prevent_destroy = false
}
```

<Admonition type="info" title="Notes">

バケットを削除する前に、S3 の `force_destroy = true` が正常に適用され、Terraform の状態に保存されている必要があります。この状態の更新と destroy 操作を同時に実行しないでください。

</Admonition>

### 認証情報と必要な ID を設定する\{#set-credentials-and-required-ids}

**ファイル:** `examples/aws-project-byoc-I/variables.tf`

これらの入力は BYOC-I の例にすでに存在しており、元のデプロイで使用したものと同じ値を維持する必要があります。

```plaintext
variable "project_id" {
  description = "The ID of the byoc project"
  type        = string
  nullable    = false
}

variable "dataplane_id" {
  description = "The ID of the data plane"
  type        = string
  nullable    = false
}

variable "env" {
  description = "Environment name"
  type        = string
  default     = "Production"
}
```

<Admonition type="info" title="Notes">

Terraform の入力名は `dataplane_id` です。Zilliz Cloud プロバイダーのリソースでは、属性名 `data_plane_id` を使用します。以下のコマンドでは Terraform の入力名 `-var="dataplane_id=..."` を使用します。

</Admonition>

Zilliz Cloud プロバイダーは、`ZILLIZCLOUD_API_KEY` から API キーを読み取ります。Terraform コマンドごとに API キーを指定し、2 つの必須 ID を `-var` で渡します。これにより、apply コマンドと destroy コマンドを単独で実行できるようになります。

<Admonition type="info" title="Notes">

`main.tf` の Terraform 出力では `${local.dataplane_id}` と `${local.project_id}` を使用しています。これは、Terraform が出力をレンダリングするときにこれらの式を置き換えるためです。手動で入力するコマンドでは、`<dataplane_id>` と `<project_id>` を記録した値に置き換えてください。

</Admonition>

元のデプロイと同じ仕組みを使用して、正しい AWS アカウントに対して認証します。次に例を示します。

```bash
export AWS_PROFILE="<aws-profile>"
aws sts get-caller-identity
```

<Admonition type="info" title="Notes">

Zilliz Cloud API キーや AWS アクセスキーを `provider.tf`、`terraform.tfvars`、シェルスクリプト、またはプルリクエストにコミットしないでください。有効期間の短い環境認証情報、または承認された CI/role-based 認証メカニズムを使用してください。

</Admonition>

### 元のワークスペースを初期化して選択する\{#initialize-and-select-the-original-workspace}

すべての Terraform コマンドは、`modules/aws_byoc_i/s3` ではなく、BYOC-I ルートモジュールディレクトリから実行してください。

```plaintext
cd examples/aws-project-byoc-I
terraform init
terraform workspace show
```

ワークスペースを使用しており、表示された値が記録したワークスペースと異なる場合は、以下を実行します。

```plaintext
terraform workspace select <workspace>
```

<Admonition type="info" title="Notes">

AWS 呼び出し元の ID、リージョン、バックエンド、ワークスペース、および変数ファイルを確認します。いずれかの値が削除記録と異なる場合は、続行しないでください。

</Admonition>

### ルートモジュールから Terraform apply を実行する\{#run-terraform-apply-from-the-root-module}

```plaintext
terraform fmt -check
terraform validate
ZILLIZCLOUD_API_KEY=<api_key> terraform apply \
  -var="dataplane_id=<dataplane_id>" \
  -var="project_id=<project_id>"
```

元のデプロイでデフォルト以外の `env` を使用した場合は、apply コマンドと destroy コマンドの両方に以下の引数を追加します。

```plaintext
-var="env=<original_env>"
```

その他の元の変数ファイル引数も同様に維持してください。

`terraform apply` は、確認を求める前に実行プランを生成して表示します。`yes` を入力する前に、表示されたプランを確認します。

- AWS リソースが削除または置換されません。

- S3 バケットの `force_destroy` が `false` から `true` に変更されます。

- 無関係なドリフトが含まれていません。

これらの確認がすべて成功した後にのみ、`yes` を入力してください。

<Admonition type="info" title="Notes">

- apply が正常に完了し、S3 バケットの状態に `force_destroy = true` が含まれています。apply が成功していない状態で構成を編集しても、この要件は満たされません。

- データプレーンは、この Terraform フェーズの前に意図的に削除されています。プロバイダーが Zilliz Cloud リソースを読み取れなくなったと報告した場合は、再作成しないでください。コンソールでの削除が完了していることを確認し、その Zilliz Cloud リソースに限り、承認された調整手順を使用してください。Terraform の状態から AWS インフラストラクチャモジュールを削除しないでください。

</Admonition>

## ステップ 5: AWS インフラストラクチャを破棄する\{#step-5-destroy-the-aws-infrastructure}

準備用の apply が成功したときと同じディレクトリ、バックエンド、ワークスペース、認証情報、および変数ファイルを使用します。

<Admonition type="info" title="Notes">

この CLI ワークフローでは、準備用の apply の後も `examples/aws-project-byoc-I/main.tf` および参照されているモジュールを変更しないでください。Terraform は `terraform destroy` の実行時に既存の構成と状態を読み取ります。先にファイルを削除すると、プロバイダー、変数、または依存関係の情報が利用できなくなる可能性があります。

</Admonition>

準備用の apply が成功したときとまったく同じ ID と、オプションの `env` または変数ファイルの引数を使用します。

`terraform destroy` は、確認を求める前に destroy プランを生成して表示します。表示されたプランを確認し、以下を確かめます。

- すべてのリソースが対象のプロジェクトとデータプレーンにのみ属しています。

- Milvus の S3 バケットが含まれています。

- 共有の VPC、サブネット、IAM ロール、KMS キー、または別のプロジェクトのリソースが含まれていません。

- 作成または置換のアクションがありません。

- プランで、準備用の apply と同じバックエンドとワークスペースが使用されています。

<Admonition type="info" title="Notes">

- 表示された destroy プランがデータ所有者とインフラストラクチャ所有者によってレビューおよび承認されるまでは、`yes` を入力しないでください。この操作で削除された S3 オブジェクトは復元できません。

- Terraform 構成と状態はそのまま維持してください。ブロックしている依存関係を修正してから `terraform destroy` を再実行し、再度確認する前に新しく生成されたプランをレビューします。Terraform の状態からリソースを広範囲に削除したり、無関係な AWS リソースを手動で削除したりしないでください。

</Admonition>

表示されたプランが上記のすべての確認を通過した後にのみ、`yes` を入力して削除を開始してください。

一般的なブロッカーには、S3 オブジェクトロックや保持ポリシー、Kubernetes が作成したロードバランサーと ENI、アタッチされた EBS ボリューム、まだ使用中の IAM ロール、AWS 権限の不足などがあります。

