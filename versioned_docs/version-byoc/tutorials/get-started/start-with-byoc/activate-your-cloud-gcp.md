---
title: "Deploy BYOC on GCP | BYOC"
slug: /activate-your-cloud-gcp
sidebar_label: "Deploy BYOC on GCP"
beta: FALSE
notebook: FALSE
description: "The Zilliz Cloud Bring Your Own Cloud (BYOC) solution allows you to create and run a Zilliz Cloud cluster within your own cloud infrastructure. This enhances data security, reduces data breach risks, and improves performance and scalability. This topic describes how to deploy BYOC on Google Cloud Platform (GCP). | BYOC"
type: origin
token: ZGZmwC34di7Hx6k4omOcWxOLnLg
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - gcp
  - cloud
  - milvus

---

import Admonition from '@theme/Admonition';


# Deploy BYOC on GCP

The Zilliz Cloud Bring Your Own Cloud (BYOC) solution allows you to create and run a Zilliz Cloud cluster within your own cloud infrastructure. This enhances data security, reduces data breach risks, and improves performance and scalability. This topic describes how to deploy BYOC on Google Cloud Platform (GCP).

## Before you start{#before-you-start}

Before starting the deployment process, ensure that the following prerequisites are met:

- You have an active BYOC subscription. This will create a default BYOC organization under your Zilliz Cloud account. If you do not have one, [contact our sales team](https://zilliz.com/contact-sales) to get started.

- You are the organization owner within Zilliz Cloud to have deployment permissions. For information on user roles, refer to [User Roles](./user-roles).

- You have a Google Cloud project ready to use. Please ensure you have the project ID handy, as it will be required during the deployment process. For more information on GCP project IDs, refer to [GCP official documentation](https://cloud.google.com/resource-manager/docs/creating-managing-projects).

- You have launched Cloud Shell within your GCP account. This is required for authorizing Zilliz Cloud to deploy necessary BYOC components on GCP. For more information, refer to [Launch Cloud Shell](https://cloud.google.com/shell/docs/launching-cloud-shell).

## Procedure{#procedure}

### Step 1: Access Zilliz Cloud console{#step-1-access-zilliz-cloud-console}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) using the account you provided to Zilliz Cloud technical support during the contract signing process.

1. In the console, enter the organization labeled **BYOC**.

1. In the left-side navigation pane of the BYOC organization page, choose **Settings** > **Cloud Provider Settings** > **+ Deploy BYOC**.

![byoc-gcp-1](/byoc/byoc-gcp-1.png)

### Step 2: Configure cloud provider settings{#step-2-configure-cloud-provider-settings}

1. In the **Deploy BYOC - Provide Project ID** step, enter your GCP project ID and click **Confirm**.

    To get the GCP project ID, go to [GCP Dashboard](https://console.cloud.google.com/home/dashboard), and copy the **Project ID** from the page.

    ![MFrBbPiCXohp6rxZtODcHDnbnpe](/byoc/MFrBbPiCXohp6rxZtODcHDnbnpe.png)

    Copy the **Project ID** from the GCP **Dashboard**, and paste it into the **Authorization** dialog box on Zilliz Cloud.

    ![byoc-gcp-2](/byoc/byoc-gcp-2.png)

1. Copy the provided command. Paste and run this command in your **GCP Cloud Shell** to authorize Zilliz Cloud to deploy the necessary components for you on GCP.

    ```shell
    $ gcloud projects add-iam-policy-binding zilliz-byoc-user-prj1 --member=serviceAccount:org-xxxxxxxxxxxxxxxxxxxxxx@zilliz-byoc.iam.gserviceaccount.com --role=roles/owner
    ```

    To run this command, you may need to authorize Google Cloud Shell properly. When prompted to select a condition to bind, enter **2**, indicating that **None** condition will apply.

    The output is similar to the following.

    ```shell
    Updated IAM policy for project [zilliz-byoc-user-prj1].
    bindings:
    - members:
      - serviceAccount:service-xxxxxxxxxxxxx@compute-system.iam.gserviceaccount.com
      role: roles/compute.serviceAgent
    - members:
      - serviceAccount:service-xxxxxxxxxxxxx@container-engine-robot.iam.gserviceaccount.com
      role: roles/container.serviceAgent
    - members:
      - serviceAccount:service-xxxxxxxxxxxxx@containerregistry.iam.gserviceaccount.com
      role: roles/containerregistry.ServiceAgent
    - members:
      - serviceAccount:xxxxxxxxxxxxx-compute@developer.gserviceaccount.com
      - serviceAccount:xxxxxxxxxxxxx@cloudservices.gserviceaccount.com
      role: roles/editor
    - members:
      - serviceAccount:service-xxxxxxxxxxxxx@gcp-sa-networkconnectivity.iam.gserviceaccount.com
      role: roles/networkconnectivity.serviceAgent
    - members:
      - serviceAccount:org-dcldgccnayyzehwirxxxxx@zilliz-byoc.iam.gserviceaccount.com
      - serviceAccount:org-dolzzalbbzzdnlbowxxxxx@zilliz-byoc.iam.gserviceaccount.com
      role: roles/owner
    - members:
      - serviceAccount:service-xxxxxxxxxxxxx@gcp-sa-pubsub.iam.gserviceaccount.com
      role: roles/pubsub.serviceAgent
    - condition:
        description: zilliz byoc gcs admin
        expression: resource.name.startsWith("projects/_/buckets/zilliz-byoc")
        title: zilliz_byoc_gcs_admin
      members:
      - serviceAccount:zilliz-byoc-xxxxxxxxxxxx@zilliz-byoc-user-prj1.iam.gserviceaccount.com
      role: roles/storage.admin
    etag: BwYY34esoSs=
    version: 3
    ```

1. Then, click **Next Step: Deployment Settings**.

### Step 3: Configure deployment settings{#step-3-configure-deployment-settings}

1. In the **Deploy BYOC - Deployment Settings** step, choose a region for your BYOC cluster and specify the netmask.

    1. **Cloud Region**: Select the GCP region where you want to deploy BYOC. Currently, only **gcp-us-west1** is available.

    1. **Netmask**: Select a subnet mask for BYOC deployment under your preferred VPC. Zilliz will create a new VPC under your Google Cloud account for BYOC deployment. We recommend you select a suitable network segment based on the size of the BYOC cluster and long-term business plans.

1. After verifying the minimum resources required for deployment, click **Start Deploying**. Wait until the deployment process is completed.

![byoc-gcp-3](/byoc/byoc-gcp-3.png)

## Monitor deployment progress{#monitor-deployment-progress}

Once the deployment starts, you can check the status of the deployment in the console. You will receive email notifications regarding the deployment result.

![ESPQbXYtYoJxIqxzyCJcookWnZd](/byoc/ESPQbXYtYoJxIqxzyCJcookWnZd.png)

## Verify the results{#verify-the-results}

The deployment takes about 30 minutes to complete. 

You can review the resources created in your GCP project. For a list of necessary resources, refer to [Understand required resources](./activate-your-cloud-gcp#reference).

To check the resource usage, you can choose **License** in the left navigation pane, and click **View Details** to learn more.

![AUkrbDhhUogJCtxJm2PcMVozn5u](/byoc/AUkrbDhhUogJCtxJm2PcMVozn5u.png)

## Reference{#reference}

The following table lists the minimum resources required for BYOC deployment.

<Admonition type="info" icon="📘" title="Notes">

<p>As your cluster is set up across different Availability Zones (AZs) within your Virtual Private Cloud (VPC), you may have to pay for some internal network traffic. For details, refer to <a href="https://cloud.google.com/vpc/network-pricing">Google Cloud official documentation</a>.</p>

</Admonition>

<table>
   <tr>
     <th rowspan="2"><p><strong>Resource type</strong></p></th>
     <th colspan="3"><p><strong>GCP</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Resource name</strong></p></td>
     <td><p><strong>Requirements</strong></p></td>
     <td><p><strong>Description</strong></p></td>
   </tr>
   <tr>
     <td><p>Virtual Machine</p></td>
     <td><p>Instance</p></td>
     <td><p>64 vCPU, 256 GiB in total:</p><ul><li><p>n2-standard-8 * 4</p></li><li><p>n2-standard-4 * 4</p></li><li><p>n2-standard-16 * 1 +  local SSD * 4</p></li></ul></td>
     <td><p>The instance is created by the machine group and is used to run Zilliz Cloud services.</p></td>
   </tr>
   <tr>
     <td><p>Object Storage</p></td>
     <td><p>Bucket</p></td>
     <td><p>2 buckets, with 0 size at initialization</p></td>
     <td><p>Stores Milvus data.</p></td>
   </tr>
   <tr>
     <td><p>Block Storage</p></td>
     <td><p>Persistent disk</p></td>
     <td><p>1 TB  or more</p></td>
     <td><p>Local storage such as etcd and pulsar to store Milvus indexes.</p></td>
   </tr>
   <tr>
     <td><p>Public IP address</p></td>
     <td><p>Public IP</p></td>
     <td><p>1 public IP address</p></td>
     <td><p>For NAT gateway.</p></td>
   </tr>
   <tr>
     <td><p>Private network</p></td>
     <td><p>Private Network VPC</p></td>
     <td><p>1 private network (VPC)</p></td>
     <td><p>Deploys BYOC cloud environment with individual VPC.</p></td>
   </tr>
   <tr>
     <td><p>Network channels</p></td>
     <td><p>Network Channel PrivateLink</p></td>
     <td><p>2 network channel private links</p></td>
     <td><p>Used by Zilliz to interact with BYOC environment, send control requests, and receive alerts.</p></td>
   </tr>
   <tr>
     <td><p>DNS</p></td>
     <td><p>DNS</p></td>
     <td><p>1</p></td>
     <td><p>For the setup of a private link to send alerts to Zilliz Cloud.</p></td>
   </tr>
   <tr>
     <td><p>LB</p></td>
     <td><p>Load balancer</p></td>
     <td><p>1+</p></td>
     <td><p>For Zilliz Proxy and Milvus</p></td>
   </tr>
</table>

