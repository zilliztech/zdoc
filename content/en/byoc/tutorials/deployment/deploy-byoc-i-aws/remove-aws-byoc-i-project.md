---
title: "Remove an AWS BYOC-I Project | BYOC"
slug: /remove-aws-byoc-i-project
sidebar_label: "Remove an AWS BYOC-I Project"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide explains how to delete an AWS BYOC-I data plane from Zilliz Cloud first, wait until it disappears from the console, and then use the standard Terraform CLI to remove the customer-cloud infrastructure. | BYOC"
type: origin
token: Yt3TwxIUMirFhfkkpefcOmT6niQ
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Remove an AWS BYOC-I Project

This guide explains how to delete an AWS BYOC-I data plane from Zilliz Cloud first, wait until it disappears from the console, and then use the standard Terraform CLI to remove the customer-cloud infrastructure.

<Admonition type="warning" icon="🚧" title="Warning">

Deleting the data plane and enabling S3 `force_destroy` permanently removes Milvus data. Complete and verify any required backup before starting this procedure.

</Admonition>

## Prerequisites\{#prerequisites}

Before you begin, ensure that:

- You have permission to delete the target data plane in Zilliz Cloud.

- You can access the Terraform configuration, backend, Zilliz Cloud API key, AWS credentials, and required variable files.

- The installed Terraform and provider versions match those used to manage the existing state.

- The Project ID, Data Plane ID, AWS account, AWS Region, backend, and Terraform workspace have been independently verified.

- All required data has been backed up, or the data owner has explicitly approved permanent deletion.

- No deployment, scaling, upgrade, backup, restore, or migration job is running.

| Item | Recorded value |
| --- | --- |
| Project name / ID | `<project-name>` / `<project-id>` |
| Data Plane name / ID | `<data-plane-name>` / `<data-plane-id>` |
| AWS account / Region | `<account-id>` / `<region>` |
| Backend / workspace | `<backend>` / `<workspace>` |
| Terraform environment | `Production` or the original value of `var.env` |
| Required command inputs | `ZILLIZCLOUD_API_KEY`, `-var="project_id=..."`, -`var="dataplane_id=..."` |
| Variable files | `<terraform.tfvars>` |
| Approvers | `<data-owner>`, `<infrastructure-owner>` |

## Step 1: Delete every serving cluster.\{#step-1-delete-every-serving-cluster}

<Procedures>

1. Sign in to Zilliz Cloud and open the target BYOC project.

1. Delete every serving cluster or application in the data plane.

1. Wait for every cluster deletion operation to finish.

1. Confirm that the data plane card shows **0 Clusters** and that no operation is still running.

</Procedures>

<Admonition type="info" icon="📘" title="Notes">

**Do not continue while a cluster is present.** A running, suspended, or deleting cluster still counts as present. Wait until the cluster list is empty.

</Admonition>

## Step 2: Delete the data plane in Zilliz Cloud.\{#step-2-delete-the-data-plane-in-zilliz-cloud}

<Procedures>

1. In the project navigation, select **Data Planes**.

1. Locate the target data plane and verify its name, ID, cloud Region, and **0 Clusters** status.

1. Click the **...** menu at the bottom-right of the data plane card.

1. Select **Delete** and complete the confirmation dialog.

</Procedures>

## Step 3: Wait until the data plane disappears.\{#step-3-wait-until-the-data-plane-disappears}

<Procedures>

1. Wait for the console deletion operation to complete.

1. Refresh the **Data Planes** page periodically.

1. Confirm that the target data plane card has completely disappeared.

1. Record the completion time and retain a screenshot as deletion evidence.

</Procedures>

<Admonition type="info" icon="📘" title="Notes">

**Do not run Terraform before the data plane has disappeared from the Zilliz Cloud console.** A *Deleting*, *Undeployed*, or otherwise visible data plane has not passed this gate. If deletion fails or the card remains visible, stop and resolve the console-side deletion first.

</Admonition>

## Step 4: Apply the deletion-preparation change.\{#step-4-apply-the-deletion-preparation-change}

Only after Step 3 has passed, update the Terraform configuration so the later destroy operation can remove the non-empty S3 bucket.

### Terraform file map\{#terraform-file-map}

The paths below are relative to the root of the `terraform-zilliz-examples` repository. The AWS BYOC-I example uses the following files:

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

| File | Required change |
| --- | --- |
| `modules/aws_byoc_i/s3/variables.tf` | Declare the wrapper module input `force_destroy` with a safe default of `false`. |
| `modules/aws_byoc_i/s3/s3.tf` | Pass `var.force_destroy` to the upstream `terraform-aws-modules/s3-bucket/aws` module. |
| `examples/aws-project-byoc-I/main.tf` | Set `force_destroy = true` on `module "s3"` and change `zillizcloud_byoc_i_project.this` to `prevent_destroy = false`. |
| `examples/aws-project-byoc-I/variables.tf` | Already declares the required `project_id`, `dataplane_id`, and optional `env` inputs. No deletion-specific edit is required. |
| `examples/aws-project-byoc-I/provider.tf` | The empty `provider "zillizcloud"` block reads `ZILLIZCLOUD_API_KEY` from the environment. Do not put the key in this file. |

<Admonition type="info" icon="📘" title="Notes">

**If your repository uses different paths:** Start from the root module that contains `resource "zillizcloud_byoc_i_project"`. Follow the `source` value of `module "s3"` to locate its wrapper module, then make the same three logical changes. Do not edit files belonging to another project or a shared deployed copy without reviewing its callers.

</Admonition>

### Enable S3 force destroy\{#enable-s3-force-destroy}

**File:** `modules/aws_byoc_i/s3/variables.tf`

Add the following variable to the wrapper module. Keep the default as `false` so other callers do not become destructible by default:

Add or change the green-highlighted Terraform code.

```plaintext
variable "force_destroy" {
  description = "Allow Terraform to delete all objects when destroying the bucket"
  type        = bool
  default     = false
}
```

**File:** `modules/aws_byoc_i/s3/s3.tf`

Inside `module "s3_bucket"`, add `force_destroy` next to the existing `bucket` argument:

```plaintext
module "s3_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.15.1"

  bucket        = local.bucket_name
  force_destroy = var.force_destroy

  # Remaining configuration omitted
}
```

**File:** `examples/aws-project-byoc-I/main.tf`

Inside the existing `module "s3"` block, explicitly enable deletion for this data plane:

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

### Disable project deletion protection\{#disable-project-deletion-protection}

**File:** `examples/aws-project-byoc-I/main.tf`

In `resource "zillizcloud_byoc_i_project" "this"`, keep `ignore_changes` and change only `prevent_destroy`:

```plaintext
lifecycle {
  ignore_changes  = [data_plane_id, project_id, aws, ext_config]
  prevent_destroy = true
}
```

to the literal value:

```plaintext
lifecycle {
  ignore_changes  = [data_plane_id, project_id, aws, ext_config]
  prevent_destroy = false
}
```

<Admonition type="info" icon="📘" title="Notes">

S3 `force_destroy = true` must be successfully applied and stored in Terraform state before the bucket is destroyed. Do not combine this state update with the destroy operation.

</Admonition>

### Set credentials and required IDs\{#set-credentials-and-required-ids}

**File:** `examples/aws-project-byoc-I/variables.tf`

These inputs already exist in the BYOC-I example and must retain the same values used for the original deployment:

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

<Admonition type="info" icon="📘" title="Notes">

The Terraform input is named `dataplane_id`. The Zilliz Cloud provider resource uses the attribute name `data_plane_id`. The commands below use the Terraform input name: `-var="dataplane_id=..."`.

</Admonition>

The Zilliz Cloud provider reads its API key from `ZILLIZCLOUD_API_KEY`. Supply the API key for each Terraform command and pass the two required IDs using `-var`. This makes the apply and destroy commands self-contained.

<Admonition type="info" icon="📘" title="Notes">

The Terraform output in `main.tf` uses `${local.dataplane_id}` and `${local.project_id}` because Terraform replaces those expressions when it renders the output. In commands typed manually, replace `<dataplane_id>` and `<project_id>` with the recorded values.

</Admonition>

Authenticate to the correct AWS account using the same mechanism as the original deployment. For example:

```bash
export AWS_PROFILE="<aws-profile>"
aws sts get-caller-identity
```

<Admonition type="info" icon="📘" title="Notes">

Do not commit the Zilliz Cloud API key or AWS access keys to `provider.tf`, `terraform.tfvars`, shell scripts, or pull requests. Use short-lived environment credentials or the approved CI/role-based authentication mechanism.

</Admonition>

### Initialize and select the original workspace\{#initialize-and-select-the-original-workspace}

Run all Terraform commands from the BYOC-I root module directory, not from `modules/aws_byoc_i/s3`:

```plaintext
cd examples/aws-project-byoc-I
terraform init
terraform workspace show
```

If workspaces are used and the displayed value is not the recorded workspace:

```plaintext
terraform workspace select <workspace>
```

<Admonition type="info" icon="📘" title="Notes">

Confirm the AWS caller identity, Region, backend, workspace, and variable files. Do not continue if any value differs from the deletion record.

</Admonition>

### Run Terraform apply from the root module\{#run-terraform-apply-from-the-root-module}

```plaintext
terraform fmt -check
terraform validate
ZILLIZCLOUD_API_KEY=<api_key> terraform apply \
  -var="dataplane_id=<dataplane_id>" \
  -var="project_id=<project_id>"
```

If the original deployment used a non-default `env`, append the following argument to both the apply and destroy commands:

```plaintext
-var="env=<original_env>"
```

Preserve any other original variable-file arguments as well.

`terraform apply` generates and displays the execution plan before asking for confirmation. Review the displayed plan before entering `yes`:

- No AWS resource is deleted or replaced.

- The S3 bucket changes `force_destroy` from `false` to `true`.

- No unrelated drift is included.

Enter `yes` only after these checks pass.

<Admonition type="info" icon="📘" title="Notes">

- The apply completed successfully and the S3 bucket state now contains `force_destroy = true`. Editing the configuration without a successful apply does not satisfy this requirement.

- The data plane was intentionally deleted before this Terraform phase. If the provider reports that the Zilliz Cloud resource can no longer be read, do not recreate it. Confirm the completed console deletion and use the approved reconciliation procedure for that Zilliz Cloud resource only. Do not remove AWS infrastructure modules from state.

</Admonition>

## Step 5: Destroy the AWS infrastructure.\{#step-5-destroy-the-aws-infrastructure}

Use the same directory, backend, workspace, credentials, and variable files as the successful preparation apply.

<Admonition type="info" icon="📘" title="Notes">

For this CLI workflow, keep `examples/aws-project-byoc-I/main.tf` and the referenced modules unchanged after the preparation apply. Terraform reads the existing configuration and state when running `terraform destroy`. Removing files first can make provider, variable, or dependency information unavailable.

</Admonition>

Use exactly the same IDs and optional `env` or variable-file arguments as the successful preparation apply.

`terraform destroy` generates and displays the destroy plan before asking for confirmation. Review the displayed plan and confirm that:

- Every resource belongs exclusively to the target project and data plane.

- The Milvus S3 bucket is included.

- No shared VPC, subnet, IAM role, KMS key, or resource from another project is included.

- There are no create or replacement actions.

- The plan uses the same backend and workspace as the preparation apply.

<Admonition type="info" icon="📘" title="Notes">

- Do not enter `yes` until the displayed destroy plan has been reviewed and approved by the data owner and infrastructure owner. The S3 objects removed by this operation cannot be recovered.

- Keep the Terraform configuration and state intact. Fix the blocking dependency, then rerun `terraform destroy` and review the newly generated plan before confirming again. Do not broadly remove resources from state or manually delete unrelated AWS resources.

</Admonition>

Enter `yes` to start deletion only after the displayed plan passes every check above.

Common blockers include S3 Object Lock or retention policies, Kubernetes-created load balancers and ENIs, attached EBS volumes, IAM roles still in use, and insufficient AWS permissions.

