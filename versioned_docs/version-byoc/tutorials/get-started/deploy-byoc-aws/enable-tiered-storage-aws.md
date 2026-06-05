---
title: "Enable Tiered Storage for Existing Clusters | BYOC"
slug: /enable-tiered-storage-aws
sidebar_key: enable-tiered-storage-aws
sidebar_label: "Enable Tiered Storage for Existing Clusters"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: CONTACT SALES
notebook: FALSE
description: "This guide is for users who have already deployed a BYOC/BYOC-I cluster using a previous version of the terraform examples and now want to enable tiered storage. | BYOC"
type: origin
token: EgovwOjveikizfkIk2Accq72nRh
sidebar_position: 6
keywords: 
  - zilliz
  - byoc
  - aws
  - tiered storage
  - enable tiered storage

---

import Admonition from '@theme/Admonition';


# Enable Tiered Storage for Existing Clusters

This guide is for users who have already deployed a BYOC/BYOC-I cluster using a previous version of the [terraform examples](https://github.com/zilliztech/terraform-zilliz-examples/tree/master/examples/aws-project-byoc-I) and now want to enable **tiered storage**.

## Prerequisites\{#prerequisites}

- Terraform provider `zillizcloud` version `>= 0.6.34`.

## Step 1: Upgrade the Provider\{#step-1-upgrade-the-provider}

Update the version constraint in your `versions.tf` or `required_providers` block. Note that Terraform's `~>` constraint does **not** match pre-release versions, so pin explicitly if you are testing an `-rc` build:

```plaintext
zillizcloud = {
  source  = "zilliztech/zillizcloud"
  version = ">= 0.6.34"
}
```

## Step 2: Update `data.tf`\{#step-2-update-datatf}

In your `locals {}` block, replace the existing `k8s_node_groups` assignment:

```plaintext
# Remove this line:
k8s_node_groups = data.zillizcloud_byoc_i_project_settings.this.node_quotas
```

With the following merge logic:

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

## Step 3: Update EKS Module\{#step-3-update-eks-module}

Copy the latest `modules/aws_byoc_i/eks/` directory from the master branch of [terraform-zilliz-examples](https://github.com/zilliztech/terraform-zilliz-examples) to replace your local copy. This adds the tiered node group resource, `enable_tiered` variable, and updated validation rules.

## Step 4: Pass `enable_tiered` to the EKS Module\{#step-4-pass-enabletiered-to-the-eks-module}

In your root `main.tf`, add the argument to the `module "eks"` block:

```plaintext
module "eks" {
  # ... existing arguments ...
  enable_tiered = local.enable_tiered
}
```

## Step 5: Enable Tiered Storage in Zilliz Cloud Console\{#step-5-enable-tiered-storage-in-zilliz-cloud-console}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/).

1. In the top-right corner, select the correct **BYOC organization**.

![Tfgxb8cJRoahQxx8UYicQiPPnLf](https://zdoc-images.s3.us-west-2.amazonaws.com/tfgxb8cjroahqxx8uyicqippnlf.png "Tfgxb8cJRoahQxx8UYicQiPPnLf")

1. Navigate to **Projects** and locate the project you want to enable tiered storage for.

1. Click the **"..."** button in the bottom-right corner of the project card, then click **View Project Details**.

![Roidb6iXZo373pxGnCSc0C2MnLh](https://zdoc-images.s3.us-west-2.amazonaws.com/roidb6ixzo373pxgncsc0c2mnlh.png "Roidb6iXZo373pxGnCSc0C2MnLh")

1. In the **Resource Settings** section, click **Edit**.

![DOsebYbZZo4fDAx8uIPcOSRknhc](https://zdoc-images.s3.us-west-2.amazonaws.com/dosebybzzo4fdax8uipcosrknhc.png "DOsebYbZZo4fDAx8uIPcOSRknhc")

1. In the dialog, check **Tiered** and click **Save** in the bottom-right corner.

After saving, the API will return a `tiered_node_quota` for this project.

![JvbVbbZlKojF2Pxd7SncmK69nvg](https://zdoc-images.s3.us-west-2.amazonaws.com/jvbvbbzlkojf2pxd7sncmk69nvg.png "JvbVbbZlKojF2Pxd7SncmK69nvg")

## Step 6: Verify\{#step-6-verify}

```bash
terraform init -upgrade
terraform plan
```

Expected plan output:

<table>
   <tr>
     <th><p><strong>Scenario</strong></p></th>
     <th><p><strong>Expected Result</strong></p></th>
   </tr>
   <tr>
     <td><p>Tiered storage <strong>not enabled</strong></p></td>
     <td><p>No new resources (enable_tiered = false, count = 0)</p></td>
   </tr>
   <tr>
     <td><p>Tiered storage <strong>enabled</strong></p></td>
     <td><p>aws_eks_node_group.tiered[0] will be created (1 to add)</p></td>
   </tr>
</table>

Existing resources should show **no destroy or recreate** actions.
