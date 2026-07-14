---
title: "既存クラスターで階層型ストレージを有効にする | BYOC"
slug: /enable-tiered-storage-aws
sidebar_label: "既存クラスターで階層型ストレージを有効にする"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドは、以前のバージョンの terraform examples を使用して BYOC/BYOC-I cluster をすでにデプロイしており、階層型ストレージを有効にしたいユーザー向けです。 | BYOC"
type: origin
token: EgovwOjveikizfkIk2Accq72nRh
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 既存クラスターで階層型ストレージを有効にする

このガイドは、以前のバージョンの [terraform examples](https://github.com/zilliztech/terraform-zilliz-examples/tree/master/examples/aws-project-byoc-I) を使用して BYOC/BYOC-I cluster をすでにデプロイしており、**階層型ストレージ**を有効にしたいユーザー向けです。

## 前提条件\{#prerequisites}

- Terraform provider `zillizcloud` バージョン `>= 0.6.34`。

## ステップ 1: Provider をアップグレードする\{#step-1-upgrade-the-provider}

`versions.tf` または `required_providers` ブロック内のバージョン制約を更新します。Terraform の `~>` 制約はプレリリース版には **一致しない** ため、`-rc` ビルドをテストしている場合は明示的に固定してください。

```plaintext
zillizcloud = {
  source  = "zilliztech/zillizcloud"
  version = ">= 0.6.34"
}
```

## ステップ 2: `data.tf` を更新する\{#step-2-update-datatf}

`locals {}` ブロック内で、既存の `k8s_node_groups` 割り当てを次のように置き換えます。

```plaintext
# Remove this line:
k8s_node_groups = data.zillizcloud_byoc_i_project_settings.this.node_quotas
```

次のマージロジックに置き換えます。

```plaintext
  # Tiered node quota from API (separate provider field, null when not enabled)
  tiered_node_quota = (
    data.zillizcloud_byoc_i_project_settings.this.tiered_node_quota != null
    ? { tiered = data.zillizcloud_byoc_i_project_settings.this.tiered_node_quota }
    : {}
  )

  k8s_node_groups = {
    for name, ng in merge(
      # Tiered placeholder (max_size=0 → count=0, not created unless API enables it)
      { tiered = { disk_size = 100, min_size = 0, max_size = 0, desired_size = 0, instance_types = "i4i.2xlarge", capacity_type = "ON_DEMAND" } },
      # API returns: core, index, search, fundamental
      data.zillizcloud_byoc_i_project_settings.this.node_quotas,
      # API tiered quota overwrites placeholder when present
      local.tiered_node_quota,
    ) : name => merge(ng, {
      ami_id    = lookup(var.k8s_node_group_image_id, name, null)
      disk_size = max(ng.disk_size, 100)
    })
  }

  # Placeholder has max_size=0, so this is false unless API returns tiered with max_size>0
  enable_tiered = local.k8s_node_groups["tiered"].max_size > 0
```

## ステップ 3: EKS Module を更新する\{#step-3-update-eks-module}

[terraform-zilliz-examples](https://github.com/zilliztech/terraform-zilliz-examples) の master ブランチから最新の `modules/aws_byoc_i/eks/` ディレクトリをコピーし、ローカルコピーを置き換えます。これにより、tiered node group リソース、`enable_tiered` 変数、および更新された検証ルールが追加されます。

## ステップ 4: `enable_tiered` を EKS Module に渡す\{#step-4-pass-enabletiered-to-the-eks-module}

ルートの `main.tf` で、`module "eks"` ブロックに引数を追加します。

```plaintext
module "eks" {
  # ... existing arguments ...
  enable_tiered = local.enable_tiered
}
```

## ステップ 5: Zilliz Cloud Console で階層型ストレージを有効にする\{#step-5-enable-tiered-storage-in-zilliz-cloud-console}

1. [Zilliz Cloud console](https://cloud.zilliz.com/) にログインします。

1. 右上隅で、正しい **BYOC organization** を選択します。

![Tfgxb8cJRoahQxx8UYicQiPPnLf](https://zdoc-images.s3.us-west-2.amazonaws.com/tfgxb8cjroahqxx8uyicqippnlf.png "Tfgxb8cJRoahQxx8UYicQiPPnLf")

1. **Projects** に移動し、階層型ストレージを有効にしたいプロジェクトを見つけます。

1. プロジェクトカードの右下にある **"..."** ボタンをクリックし、次に **View Project Details** をクリックします。

![Roidb6iXZo373pxGnCSc0C2MnLh](https://zdoc-images.s3.us-west-2.amazonaws.com/roidb6ixzo373pxgncsc0c2mnlh.png "Roidb6iXZo373pxGnCSc0C2MnLh")

1. **Resource Settings** セクションで、**Edit** をクリックします。

![DOsebYbZZo4fDAx8uIPcOSRknhc](https://zdoc-images.s3.us-west-2.amazonaws.com/dosebybzzo4fdax8uipcosrknhc.png "DOsebYbZZo4fDAx8uIPcOSRknhc")

1. ダイアログで **Tiered** にチェックを入れ、右下の **Save** をクリックします。

保存後、API はこのプロジェクトに対して `tiered_node_quota` を返します。

![JvbVbbZlKojF2Pxd7SncmK69nvg](https://zdoc-images.s3.us-west-2.amazonaws.com/jvbvbbzlkojf2pxd7sncmk69nvg.png "JvbVbbZlKojF2Pxd7SncmK69nvg")

## ステップ 6: 確認\{#step-6-verify}

```bash
terraform init -upgrade
terraform plan
```

想定される plan 出力:

| **Scenario** | **Expected Result** |
| --- | --- |
| Tiered storage **not enabled** | 新しいリソースはありません (enable_tiered = false, count = 0) |
| Tiered storage **enabled** | aws_eks_node_group.tiered[0] が作成されます (1 to add) |

既存のリソースには、**destroy または recreate が発生しない**ことが想定されます。

