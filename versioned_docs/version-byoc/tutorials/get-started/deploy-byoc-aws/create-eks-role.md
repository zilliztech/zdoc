---
title: "Create EKS IAM Role | BYOC"
slug: /create-eks-role
sidebar_label: "Create EKS IAM Role"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page describes how to create and configure an IAM role for Zilliz Cloud to deploy an EKS cluster for your Zilliz Cloud project. | BYOC"
type: origin
token: IJBcwPCeGirLRGkVt1Vc580ynff
sidebar_position: 2
keywords: 
  - zilliz
  - byoc
  - aws
  - eks cluster
  - IAM role
  - milvus
  - vector database
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Create EKS IAM Role

This page describes how to create and configure an IAM role for Zilliz Cloud to deploy an EKS cluster for your Zilliz Cloud project.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud sales</a>.</p>

</Admonition>

## Procedure\{#procedure}

You can use the AWS console to create the EKS role. As an alternative, you can use the Terraform script Zilliz Cloud provides to bootstrap the infrastructure for your Zilliz Cloud project on AWS. For details, refer to [Terraform Provider](./terraform-provider).

### Step 1: Create an IAM role\{#step-1-create-an-iam-role}

In this step, you will create an IAM role on AWS for Zilliz Cloud to manage EKS clusters on your behalf and paste the ARN of the role back to Zilliz Cloud console.

<Supademo id="cmb7llk244s2yppkpeo4oz85z" title=""  />

1. Log into your AWS Console as a user with administrator privileges and go to the IAM dashboard.

1. Expand your account information, and click the copy button at the start of your AWS Account ID.

1. Click the **Roles** tab in the left sidebar, and then click **Create Role**.

1. In **Select trusted entity**, click the **Custom trust policy** tile. In **Common trust policy**, paste the trust JSON from below into the editor in the **Custom trust policy** section and replace `{accountId}` with your **AWS Account ID**.

    ```json
    {
        "Version" : "2012-10-17",
        "Statement" : [
          {
            "Effect" : "Allow",
            "Principal" : {
              "Service" : "eks-nodegroup.amazonaws.com"
            },
            "Action" : "sts:AssumeRole"
          },
          {
            "Sid" : "EKSClusterAssumeRole",
            "Effect" : "Allow",
            "Principal" : {
              "Service" : "eks.amazonaws.com"
            },
            "Action" : "sts:AssumeRole"
          },
          {
            "Sid" : "EKSNodeAssumeRole",
            "Effect" : "Allow",
            "Principal" : {
              "Service" : "ec2.amazonaws.com"
            },
            "Action" : "sts:AssumeRole"
          },
          {
            "Effect" : "Allow",
            "Principal" : {
              "Federated" : "arn:aws:iam::{accountId}:oidc-provider/eks_oidc_url"
            },
            "Action" : "sts:AssumeRoleWithWebIdentity",
            "Condition" : {
              "StringEquals" : {
                "eks_oidc_url:aud" : "sts.amazonaws.com",
                "eks_oidc_url:sub" : "system:serviceaccount:kube-system:aws-load-balancer-controller"
              }
            }
          },
          {
            "Effect" : "Allow",
            "Principal" : {
              "Federated" : "arn:aws:iam::{accountId}:oidc-provider/eks_oidc_url"
            },
            "Action" : "sts:AssumeRoleWithWebIdentity",
            "Condition" : {
              "StringEquals" : {
                "eks_oidc_url:sub" : "system:serviceaccount:kube-system:ebs-csi-controller-sa",
                "eks_oidc_url:aud" : "sts.amazonaws.com"
              }
            }
          },
          {
            "Effect" : "Allow",
            "Principal" : {
              "Federated" : "arn:aws:iam::{accountId}:oidc-provider/eks_oidc_url"
            },
            "Action" : "sts:AssumeRoleWithWebIdentity",
            "Condition" : {
              "StringEquals" : {
                "eks_oidc_url:sub" : "system:serviceaccount:kube-system:cluster-autoscaler",
                "eks_oidc_url:aud" : "sts.amazonaws.com"
              }
            }
          }
        ]
      }
    ```

1. Click **Next** and skip adding permissions.

1. In the **Name, review, and create** step, name the role, review the trusted entities, and click **Create role**.

1. Once the role has been created, click **View role** in the green bar to go to the role details.

1. Click the copy icon in front of the role's **ARN**.

1. Go back to the Zilliz Cloud console, paste the role ARN in **IAM Role ARN** under **EKS settings**.

### Step 2: Add permissions\{#step-2-add-permissions}

In this step, you are going to add several permissions to the EKS role. On the role's details page, click the **Permissions** tab.  In the **Permissions policies** section, click **Add permissions**. In this step, you need to select **Attach policies** and then **Create inline policy** to add multiple policies from different sources .

<Supademo id="cmb7nj2tb4u69ppkptf3is7bo" title=""  />

#### Attach AWS-managed policies\{#attach-aws-managed-policies}

The following table lists the permissions to add as attached policies. Click the item in the **Permissions** column of the table to view the required permissions.

<table>
   <tr>
     <th><p>Permissions</p></th>
     <th><p>Managed by</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEC2ContainerRegistryReadOnly.html">AmazonEC2ContainerRegistryReadOnly</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Provides read-only access to Amazon EC2 Container Registry repositories.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKS_CNI_Policy.html">AmazonEKS_CNI_Policy</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Provides the Amazon VPC CNI Plugin (amazon-vpc-cni-k8s) the permissions it requires to modify the IP address configuration on your EKS worker nodes.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSWorkerNodePolicy.html">AmazonEKSWorkerNodePolicy</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Allows Amazon EKS worker nodes to connect to Amazon EKS Clusters.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSClusterPolicy.html">AmazonEKSClusterPolicy</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Provides Kubernetes the permissions it requires to manage resources on your behalf.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSVPCResourceController.html">AmazonEKSVPCResourceController</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Allows VPC Resource Controller to manage ENI and IPs for worker nodes.</p></td>
   </tr>
</table>

After you choose **Attach policies**, in the **Other permissions policies** section on the page that opens, fill in the name of each AWS-managed policy listed above in the search box and select the radio box in front of it. Once you have selected all the required policies, click **Add permissions**. 

You will find that these policies are listed in the **Permissions** policies list.

<Admonition type="info" icon="📘" title="Notes">

<p>Upon the creation of an EKS cluster, two <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html#iam-term-service-linked-role">service-linked roles</a> will also be automatically created along with the cluster, and they are <a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSServiceRolePolicy.html">AmazonEKSServiceRolePolicy</a> and <a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSServiceRoleForAmazonEKSNodegroup.html">AWSServiceRoleForAmazonEKSNodegroup</a>. These two roles are required for Amazon EKS to call other AWS services on your behalf.</p>

</Admonition>

#### Create inline policies\{#create-inline-policies}

The following table lists the policies that need to be added as customer inline policies. Click the item in the **Permissions** column of the table to view the required permissions.

<table>
   <tr>
     <th><p>Permissions</p></th>
     <th><p>Managed by</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/main/docs/install/iam_policy.json">AWS Load Balancer Controller</a></p></td>
     <td><p>Kubernetes SIGs</p></td>
     <td><p>AWS Load Balancer Controller is a controller to help manage Elastic Load Balancers for a Kubernetes cluster.</p><p>For details on the AWS Load Balancer Controller repository, refer to the <a href="https://github.com/kubernetes-sigs/aws-load-balancer-controller/tree/main">README</a> file.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes-sigs/aws-ebs-csi-driver/blob/master/docs/example-iam-policy.json">Amazon EBS CSI driver</a></p></td>
     <td><p>Kubernetes SIGs</p></td>
     <td><p>The Amazon Elastic Block Store Container Storage Interface (CSI) Driver provides a CSI interface used by Container Orchestrators to manage the lifecycle of Amazon EBS volumes.</p><p>For details on the Amazon EBS CSI driver, refer to the <a href="https://github.com/kubernetes-sigs/aws-ebs-csi-driver">README</a> file.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md#full-cluster-autoscaler-features-policy-recommended">Cluster AutoScaler</a></p></td>
     <td><p>Kubernetes SIGs</p></td>
     <td><p>The Cluster AutoScaler is a component that automatically adjusts the size of a Kubernetes Cluster so that all pods have a place to run and there are no unneeded nodes.</p><p>For details on the Cluster AutoScaler on AWS, refer to the <a href="https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md">README</a> file.</p></td>
   </tr>
</table>

After you choose **Create inline policy**, on the **Specify permissions** page, click **JSON** in the **Policy editor** section to open the policy editor. Then copy one of the above permissions and paste it into the policy editor.

Click **Next**, and set **Policy name** in **Policy details**. Once you have added all the listed inline policies, click **Create policy**. You will find that these policies are listed in the **Permissions** policies list.

